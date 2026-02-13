import logging
import os
from minject import inject
from redis.asyncio import Redis, ConnectionPool
from redis.typing import EncodableT as RedisEncodableT
from lib.cache import CacheProvider, EncodableT


logger = logging.getLogger(__name__)


@inject.bind(
    host=os.getenv("REDISHOST"),
    port=os.getenv("REDISPORT"),
    username=os.getenv("REDISUSER") or "default",
    password=os.getenv("REDISPASSWORD"),
)
class RedisCache(CacheProvider):
    def __init__(self, host, port, username, password):
        connection_pool = ConnectionPool(
            host=host,
            port=port,
            username=username,
            password=password,
            socket_timeout=5,
            protocol=3,
        )
        self.redis = Redis(
            connection_pool=connection_pool,
            decode_responses=True,
        )
        logger.info(
            "Attempting connection to %s:%s as user '%s'...", host, port, username
        )

    async def get(self, key: str, value: type | None = None) -> EncodableT | None:
        try:
            return await self.redis.get(key)
        except Exception:
            data = await self.redis.json().get(key, ".")  # type: ignore - wrong b/c it doesn't know that we are using the async package
            logger.debug("Redis JSON get for key '%s' returned: %s", key, data)
            return data

    async def set(self, key: str, value: EncodableT):
        if isinstance(value, (bytes | bytearray | memoryview | str | int | float)):
            await self.redis.set(key, value)
        else:
            await self.redis.json().set(key, "$", value)  # type: ignore - wrong b/c it doesn't know that we are using the async package
