import functools
from abc import ABC, abstractmethod
from collections.abc import Callable, Coroutine, Mapping
from typing import Any, Concatenate, List, Union, cast

type JsonType = Mapping[str, Any] | List[Any] | str | int | float | bool | None
type EncodedT = Union[bytes, bytearray, memoryview]
type DecodedT = Union[str, int, float]
type EncodableT = Union[EncodedT, DecodedT, JsonType]

type CacheAccessor[S] = Callable[[S], Cache[CacheProvider]]
type KeySerializer[**P] = Callable[P, str]


class CacheProvider(ABC):
    @abstractmethod
    async def get(self, key: str) -> EncodableT | None:
        raise NotImplementedError

    @abstractmethod
    async def set(self, key: str, value: EncodableT) -> None:
        raise NotImplementedError


class CacheKey:
    def __init__(self, prefix: str, version: int):
        self.prefix = prefix
        self.version = version

    def make_key(self, key: str):
        return f"{self.prefix}:{key}:v{self.version}"


class Cache[C: CacheProvider]:
    def __init__(self, cache_key: CacheKey, cache_provider: C):
        self.cache_key = cache_key
        self.cache_provider = cache_provider
        self.cache = {}

    async def get(self, key: str) -> EncodableT | None:
        final_key = self.cache_key.make_key(key)
        return await self.cache_provider.get(final_key)

    async def set(self, key: str, value: EncodableT) -> None:
        final_key = self.cache_key.make_key(key)
        return await self.cache_provider.set(final_key, value)

    @staticmethod
    def with_cache[
        S, **P,
        R: EncodableT,
    ](
        cache_accessor: CacheAccessor[S],
        key_serializer: KeySerializer[P],
    ) -> Callable[
        [Callable[Concatenate[S, P], Coroutine[Any, Any, R]]],
        Callable[Concatenate[S, P], Coroutine[Any, Any, R]],
    ]:
        def decorator(
            fn: Callable[Concatenate[S, P], Coroutine[Any, Any, R]],
        ) -> Callable[Concatenate[S, P], Coroutine[Any, Any, R]]:
            @functools.wraps(fn)
            async def inner(self: S, *args: P.args, **kwargs: P.kwargs) -> R:
                cache = cache_accessor(self)
                key = f"{fn.__name__}:{key_serializer(*args, **kwargs)}"

                cached = await cache.get(key)
                if cached is not None:
                    return cast(R, cached)

                result = await fn(self, *args, **kwargs)
                await cache.set(key, result)
                return result

            return inner

        return decorator

    @staticmethod
    def typed_serializer[**P](serializer: KeySerializer[P]) -> KeySerializer[P]:
        """
        A helper to explicitly capture and validate ParamSpec P of the serializer
        function against the future decorated method signature.
        """
        return serializer
