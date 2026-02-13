import asyncio
import codecs
import json
import logging
import traceback
from collections.abc import Callable
from concurrent import futures
import os
from typing import Any
from uuid import uuid4

import attrs
import dill
from minject import inject


logger = logging.getLogger(__name__)


@attrs.define
class Job:
    id: str
    owner: str
    state: str
    callable: str
    payload: str
    response: Any

    @classmethod
    def build(cls, owner: str, callable: Callable, **payload):
        return Job(
            id=str(uuid4()),
            owner=owner,
            state="not-started",
            callable=codecs.encode(dill.dumps(callable), "base64").decode(),
            payload=codecs.encode(dill.dumps(payload), "base64").decode(),
            response=None,
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
            response=obj.get("response", None),
        )

    def start(self):
        (fn, args) = self.__decode()
        return fn(**args)

    def __decode(self) -> tuple[Callable, dict]:
        decoded_payload = codecs.decode(self.payload.encode(), "base64")
        decoded_callable = codecs.decode(self.callable.encode(), "base64")
        return dill.loads(decoded_callable), dill.loads(decoded_payload)

    def get_decoded_payload(self) -> dict:
        decoded_payload = codecs.decode(self.payload.encode(), "base64")
        return dill.loads(decoded_payload)

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

        logger.info("Job created: %s for owner: %s", job.id, owner)
        return job

    def get_job(self, job_id: str):
        try:
            with open(f"{self.directory}{job_id}.json", "r") as f:
                return Job.from_str(f.readline())
        except FileNotFoundError:
            return None

    def get_jobs_for_owner(self, owner: str):
        jobs = []
        try:
            for filename in os.listdir(self.directory):
                if not filename.endswith(".json"):
                    continue
                job_id = filename[:-5]
                try:
                    job = self.get_job(job_id)
                    if job and job.owner == owner:
                        jobs.append(job)
                except Exception:
                    continue
        except FileNotFoundError:
            pass
        return jobs

    def start_job(self, job: Job):
        with open(f"{self.directory}{job.id}.json", "w") as f:
            job.state = "running"
            f.write(str(job))

        logger.info("Job starting: %s", job.id)

        def run_job():
            try:
                logger.info("Job executing in thread: %s", job.id)
                result = asyncio.run(job.start())
                logger.info("Job completed successfully: %s", job.id)
                return result
            except Exception as e:
                logger.error("Job failed: %s - %s", job.id, str(e))
                logger.error("Traceback: %s", traceback.format_exc())
                raise

        future = self.executor.submit(run_job)
        future.add_done_callback(self._job_completed_callback(job.id))

    def _job_completed_callback(self, job_id: str):
        def __inner(future: futures.Future):
            try:
                job = self.get_job(job_id)
                if job is None:
                    logger.error("Job not found in callback: %s", job_id)
                    return

                exception = future.exception()
                if exception:
                    logger.error(
                        "Job callback received exception for %s: %s",
                        job_id,
                        str(exception),
                    )
                    job.state = "failed"
                    job.response = {"error": str(exception)}
                else:
                    logger.info("Job callback saving completed state for: %s", job_id)
                    job.state = "completed"
                    job.response = future.result()

                with open(f"{self.directory}{job.id}.json", "w") as f:
                    f.write(str(job))

            except Exception as e:
                logger.error(
                    "Error in job completion callback for %s: %s", job_id, str(e)
                )
                logger.error("Traceback: %s", traceback.format_exc())

        return __inner
