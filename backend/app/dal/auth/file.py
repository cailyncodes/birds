import base64
import datetime
import hashlib
import json
import os
from typing import Literal, cast

import jwt as pyjwt
from bcrypt import checkpw, gensalt, hashpw
from lib.auth import (AuthProvider, Credentials, InvalidCredentials,
                      JWTCredentials, PasswordCredentials)
from minject import inject


@inject.bind()
class FileAuth(AuthProvider):
    def __init__(self):
        self.directory = os.getenv("BIRDSPOT_FILE_AUTH_DIRECTORY")
        self.signing_key = os.getenv("BIRDSPOT_SIGNING_KEY")

    async def verify(self, credentials: Credentials) -> Literal[True]:
        try:
            with open(f"{self.directory}{credentials.identifier}.json", "r") as f:
                user = json.load(f)
                if isinstance(credentials, PasswordCredentials):
                    if checkpw(
                        base64.b64encode(hashlib.sha256(credentials.verification.encode("utf-8")).digest()),
                        base64.b64decode(user["hashed_password"].encode("utf-8")),
                    ):
                        return True
                elif isinstance(credentials, JWTCredentials):
                    try:
                        jwt = pyjwt.decode_complete(credentials.verification, key=self.signing_key, verify=True, algorithms=["HS256"])
                        return jwt["payload"]["sub"] == credentials.identifier
                    except Exception as e:
                        raise InvalidCredentials()
        # special case the error in which we try to open a file that doesn't exist
        except FileNotFoundError:
            raise RuntimeError()
        
        raise InvalidCredentials()

    async def sign(self, credentials: Credentials):
        if isinstance(credentials, PasswordCredentials):
            hashed = hashpw(
                base64.b64encode(
                    hashlib.sha256(credentials.verification.encode("utf-8")).digest()
                ),
                gensalt(),
            )
            return PasswordCredentials(
                username=credentials.identifier,
                password=base64.b64encode(hashed).decode("utf-8"),
            )
        elif isinstance(credentials, JWTCredentials):
            jwt = pyjwt.encode(
                {
                    "sub": credentials.identifier,
                    "expiration": credentials.expiration.isoformat() if credentials.expiration is not None else None,
                },
                self.signing_key,
            )
            return JWTCredentials(
                user_id=credentials.identifier,
                jwt=jwt,
                # we know that since this is a JWTCredential credential the expiration is not None
                expiration=cast(datetime.datetime, credentials.expiration)
            )
        else:
            raise RuntimeError()

    async def store(self, credentials: Credentials):
        """YOU BETTER SIGN BEFORE YOU STORE!"""
        if os.path.exists(f"{self.directory}{credentials.identifier}.json"):
            await self.verify(credentials)
        else:    
            with open(f"{self.directory}{credentials.identifier}.json", "w") as f:
                f.write("{}")

        with open(f"{self.directory}{credentials.identifier}.json", "r+") as f:
            current_data = json.load(f)
            f.seek(0)
            f.truncate()
            if isinstance(credentials, JWTCredentials):
                json.dump(
                    {
                        **current_data,
                        "username": credentials.identifier,
                        "jwt": credentials.verification,
                        "expiration": (datetime.datetime.now()
                        + datetime.timedelta(days=30)).isoformat(),
                    },
                    f,
                )
            elif isinstance(credentials, PasswordCredentials):
                json.dump(
                    {
                        **current_data,
                        "usernane": credentials.identifier,
                        "hashed_password": credentials.verification,
                    },
                    f,
                )
            else:
                pass

    async def expiration(self, identifier: str) -> datetime.datetime:
        try:
            with open(f"{self.directory}{identifier}.json", "r") as f:
                user = json.load(f)
                return datetime.datetime.fromisoformat(user.get("expiration"))
        except:
            return datetime.datetime(1900, 1, 1)

    async def convert(self, credentials: Credentials, _type: type[Credentials]) -> Credentials:
        """
        THIS WILL NOT VERIFY THE credentials SUPPLIED! YOU BETTER DO THAT!
        """
        if isinstance(credentials, _type):
            return credentials
        
        if isinstance(credentials, PasswordCredentials) and _type == JWTCredentials:
            with open(f"{self.directory}{credentials.identifier}.json", "r") as f:
                data = json.load(f)
                return JWTCredentials(
                    user_id=data["username"],
                    jwt=data["jwt"],
                    expiration=datetime.datetime.fromisoformat(data["expiration"])
                )

        raise RuntimeError()
