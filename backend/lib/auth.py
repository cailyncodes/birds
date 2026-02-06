import datetime
from abc import ABC, abstractmethod
from collections.abc import Callable
from typing import Any, Concatenate, Literal

import attrs


class InvalidCredentials(Exception): ...


class AuthProvider(ABC):
    @abstractmethod
    async def verify(self, credentials: Credentials) -> Literal[True]:
        """
        Throws if the credentials are not valid
        """
        raise NotImplementedError

    @abstractmethod
    async def sign(self, credentials: Credentials) -> Credentials:
        raise NotImplementedError

    @abstractmethod
    async def store(self, credentials: Credentials) -> None:
        raise NotImplementedError

    @abstractmethod
    async def expiration(self, identifier: str) -> datetime.datetime | None:
        raise NotImplementedError
    
    @abstractmethod
    async def convert[T : Credentials](self, credentials: Credentials, _type: type[T]) -> T:
        raise NotImplementedError


class Credentials:
    def __init__(
        self,
        identifier: str,
        verification: str,
        expiration: datetime.datetime | None = None,
    ):
        self.identifier = identifier
        self.verification = verification
        self.expiration = expiration

    def is_expired(self):
        if self.expiration is None:
            return False

        return self.expiration < datetime.datetime.now()


class PasswordCredentials(Credentials):
    def __init__(self, username: str, password: str):
        super().__init__(username, password)


class JWTCredentials(Credentials):
    def __init__(self, user_id: str, jwt: str, expiration: datetime.datetime):
        super().__init__(user_id, jwt, expiration)


class Auth[A: AuthProvider]:
    def __init__(self, auth_provider: A):
        self.auth_provider = auth_provider

    async def verify(self, credentials: Credentials):
        if isinstance(credentials, JWTCredentials) and await self.requires_verification(credentials):
            return False
        try:
            return await self.auth_provider.verify(credentials)
        except Exception as e:
            return False

    async def requires_verification(self, credentials: Credentials) -> bool:
        expiration = await self.auth_provider.expiration(credentials.identifier)
        if expiration is None:
            return False
        credentials_with_expiration = Credentials(
            identifier=credentials.identifier,
            verification=credentials.verification,
            expiration=expiration
        )
        return credentials_with_expiration.is_expired()

    async def register(self, credentials: Credentials):
        signed_credentials = await self.auth_provider.sign(credentials)
        await self.auth_provider.store(signed_credentials)
        return signed_credentials
    
    async def convert[T : Credentials](self, credentials: Credentials, _type: type[T]) -> T:
        return await self.auth_provider.convert(credentials, _type)

    @staticmethod
    def requires_auth[S, **P](
        auth_accessor: Callable[Concatenate[S, P], Auth],
        credentials_accessor: Callable[Concatenate[S, P], Credentials | None],
    ):
        def decorator(fn: Callable[Concatenate[S, Credentials, P], Any]):
            # @functools.wraps(fn)
            async def inner(self: S, *args: P.args, **kwargs: P.kwargs):
                auth = auth_accessor(self, *args, **kwargs)
                credentials = credentials_accessor(self, *args, **kwargs)
                if credentials is None:
                    return False
                if not await auth.verify(credentials):
                    raise RuntimeError()

                return await fn(self, credentials, *args, **kwargs)

            return inner

        return decorator
