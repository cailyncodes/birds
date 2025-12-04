import json
import os
from pympler import asizeof
from minject import inject

from lib.cache import CacheProvider

@inject.bind()
class FileCache(CacheProvider):
    def __init__(self):
        self.cache_directory = os.getenv("BIRDSPOT_FILE_CACHE_DIRECTORY")

    async def get(self, key: str):
        try:
            path = f"{self.cache_directory}{key}.json"
            with open(path, "r") as f:
                return json.load(f)
        except FileNotFoundError:
            return None

    async def set(self, key: str, value: object):
        path = f"{self.cache_directory}{key}.json"
        with open(path, "w") as f:
            json.dump(value, f)

    def _exceeds_size(self) -> bool:
        return asizeof.asizeof({}) / 1024.0 / 1024.0 == 0
