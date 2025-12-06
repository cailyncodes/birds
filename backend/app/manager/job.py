import asyncio
import codecs
import json
from collections.abc import Callable
from concurrent import futures
import os
from typing import Any
from uuid import uuid4

import attrs
import dill
from minject import inject


@attrs.define
class Job:
    id: str
    owner: str
    state: str
    callable: str # base64 encoded pickle
    payload: str # base64 encoded pickle
    response: Any

    @classmethod
    def build(cls, owner: str, callable: Callable, **payload):
        return Job(
            id=str(uuid4()),
            owner=owner,
            state="not-started",
            callable=codecs.encode(dill.dumps(callable), "base64").decode(),
            payload=codecs.encode(dill.dumps(payload), "base64").decode(),
            response=None
        )

    @classmethod
    def from_str(cls, data: str):
        obj = json.loads(data)
        return Job(
            id=obj["id"],
            owner=obj["owner"],
            state=obj["state"],
            callable=obj["callable"],
            payload=obj["payload"],
            response=obj["response"]
        )

    def start(self):
        (fn, args) = self.__decode()
        return fn(**args)

    def __decode(self) -> tuple[Callable, dict]:
        decoded_payload = codecs.decode(self.payload.encode(), "base64")
        decoded_callable = codecs.decode(self.callable.encode(), "base64")
        return dill.loads(decoded_callable), dill.loads(decoded_payload)
    
    def __str__(self) -> str:
        return json.dumps(attrs.asdict(self))

@inject.bind()
class JobManager:
    def __init__(self):
        self.id = str(uuid4())
        self.executor = futures.ThreadPoolExecutor()
        self.directory = os.getenv("BIRDSPOT_JOB_DIRECTORY")

    def create_job(self, owner: str, callable: Callable, payload: dict) -> Job:
        job = Job.build(owner, callable, **payload)
        with open(f"{self.directory}{job.id}.json", "w") as f:
            f.write(str(job))

        return job

    def get_job(self, job_id: str):
        try:
            with open(f"{self.directory}{job_id}.json", "r") as f:
                return Job.from_str(f.readline())
        except FileNotFoundError:
            return None

    def start_job(self, job: Job):
        with open(f"{self.directory}{job.id}.json", "w") as f:
            job.state = "running"
            f.write(str(job))
        
        future = self.executor.submit(lambda: asyncio.run(job.start()))
        future.add_done_callback(self._job_completed_callback(job.id))

    def _job_completed_callback(self, job_id: str):
        def __inner(future: futures.Future):
            job = self.get_job(job_id)
            if job is None:
                return
            with open(f"{self.directory}{job.id}.json", "w") as f:
                job.state = "completed"
                job.response = future.result()
                f.write(str(job))
        return __inner
