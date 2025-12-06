import os
from minject import inject
from redis.asyncio import Redis, ConnectionPool
from redis.typing import EncodableT as RedisEncodableT
from lib.cache import CacheProvider, EncodableT

@inject.bind(
    host=os.getenv("REDISHOST"),
    port=os.getenv("REDISPORT"),
    username=os.getenv("REDISUSER"),
    password=os.getenv("REDISPASSWORD"),

)
class RedisCache(CacheProvider):
    def __init__(self, host, port, username, password):
        connection_pool = ConnectionPool(
            host=host,
            port=port,
            username=username,
            password=password
        )
        self.redis = Redis(
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
