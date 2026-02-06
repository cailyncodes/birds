import os
from minject import inject
from redis import AuthenticationError
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
            password=password,
            socket_timeout=5,
        )
        self.redis = Redis(
            connection_pool=connection_pool,
            decode_responses=True,
        )
        _ = self.test()
    
    async def test(self):
        try:
            pong = await self.redis.ping() # type: ignore
            print(f"Redis connected successfully: {pong}")
        except AuthenticationError as e:
            print(f"Authentication Failed: Check if REDISPASSWORD is correct. Error: {e}")
            raise
        except ConnectionError as e:
            print(f"Connection Failed: Is REDISHOST/REDISPORT correct? Error: {e}")
            raise

    async def get(self, key: str):
        return await self.redis.get(key)

    async def set(self, key: str, value: EncodableT):
        if isinstance(value, RedisEncodableT):
            await self.redis.set(key, value)
        else:
            await self.redis.json().set(key, "$", value) # type: ignore - wrong b/c it doesn't know that we are using the async package
