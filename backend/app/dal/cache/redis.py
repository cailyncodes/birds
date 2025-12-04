from minject import inject
from redis.asyncio import Redis, ConnectionPool
from redis.typing import EncodableT as RedisEncodableT
from lib.cache import CacheProvider, EncodableT

@inject.bind(host="", username="", password="")
class RedisCache(CacheProvider):
    def __init__(self, host, username, password):
        connection_pool = ConnectionPool()
        self.redis = Redis(
            host=host,
            username=username,
            password=password,
            connection_pool=connection_pool,
            decode_responses=True,
        )

    async def get(self, key: str):
        return await self.redis.get(key)

    async def set(self, key: str, value: EncodableT):
        if isinstance(value, RedisEncodableT):
            self.redis.set(key, value)
        else:
            self.redis.json().set(key, "$", value)
