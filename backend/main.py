import datetime
import json
import os

import dotenv

if os.getenv("RAILWAY_ENVIRONMENT_NAME") != "production":
    dotenv.load_dotenv("./.env")

import jwt as pyjwt
from app.dal.auth.file import FileAuth
from app.manager.birdspot import BirdSpotManager
from app.manager.ebird import EBirdManager
from app.manager.job import JobManager
from app.manager.regions import RegionSearch
from lib.auth import (Auth, AuthProvider, Credentials, JWTCredentials,
                      PasswordCredentials)
from minject import Registry
from sanic import Request, Sanic, response
from sanic.views import HTTPMethodView
from sanic_cors import CORS

app = Sanic("BirdSpot")
CORS(app)

registry = Registry()


def CREDENTIAL_ACCESSOR(self, request: Request, *args, **kwargs):
    if not (authorization := request.headers.get("Authorization")):
        return None
    jwt_raw = authorization[7:]
    jwt = pyjwt.decode_complete(
        jwt_raw,
        key=os.environ.get("BIRDSPOT_SIGNING_KEY"),
        algorithms=["HS256"],
        verify=True,
    )
    return JWTCredentials(
        user_id=jwt["payload"]["sub"],
        jwt=jwt_raw,
        expiration=jwt["payload"]["expiration"],
    )


class HotspotRegionHandler(HTTPMethodView):
    def __init__(self, ebird_manager: EBirdManager):
        self.ebird_manager = ebird_manager

    async def get(self, request, region_code):
        ebird_api_key = request.headers.get("x-ebird-api-key")
        if ebird_api_key is None:
            return response.json({}, status=401)

        result = await self.ebird_manager.get_hotspots_by_region(
            region_code, ebird_api_key
        )
        return response.json(result)


class SpeciesRegionHandler(HTTPMethodView):
    def __init__(self, ebird_manager: EBirdManager):
        self.ebird_manager = ebird_manager

    async def get(self, request, region_code):
        ebird_api_key = request.headers.get("x-ebird-api-key")
        if ebird_api_key is None:
            return response.json({}, status=401)

        result = await self.ebird_manager.get_species_by_region(
            region_code, ebird_api_key
        )
        return response.json(result)


class RegionSearchHandler(HTTPMethodView):
    def __init__(self, region_search: RegionSearch):
        self.region_search = region_search

    async def get(self, request):
        query = request.args.get("q", "")
        max_results = int(request.args.get("max_results", 10))
        results, total = self.region_search.search_by_name(query, max_results)

        return response.json({"results": results, "total": total})


class BirdSpotHandler(HTTPMethodView):
    def __init__(
        self,
        ebird_manager: EBirdManager,
        birdspot_manager: BirdSpotManager,
        job_manager: JobManager,
        auth_provider: AuthProvider,
    ):
        self.ebird_manager = ebird_manager
        self.birdspot_manager = birdspot_manager
        self.job_manager = job_manager
        self.auth = Auth(auth_provider)

    @Auth.requires_auth(
        auth_accessor=lambda self, request, region_code: self.auth,
        credentials_accessor=CREDENTIAL_ACCESSOR,
    )
    async def post(self, credentials: Credentials, request: Request, region_code: str):
        body = request.load_json()
        ebird_api_key = request.headers.get("x-ebird-api-key")
        life_list = body.get("life_list", None)
        target_date_raw = body.get("target_date", None)
        target_date = (
            datetime.date.fromisoformat(target_date_raw)
            if target_date_raw is not None
            else datetime.date.today()
        )

        if ebird_api_key is None:
            return response.json(
                {"error": "ebird_api_key must be specified in x-ebird-api-key header"},
                status=401,
            )

        if life_list is None:
            return response.json(
                {"error": "life_list must be specified in request body"}, status=400
            )

        job = self.job_manager.create_job(
            credentials.identifier,
            self.birdspot_manager.get_scores_for_region,
            payload={
                "region_code": region_code,
                "life_list": life_list.get("birds", []),
                "target_date": target_date,
                "auth": ebird_api_key,
            },
        )
        self.job_manager.start_job(job)
        return response.json(
            {"id": job.id, "state": job.state, "response": job.response}
        )


class JobHandler(HTTPMethodView):
    def __init__(self, job_manager: JobManager, auth_provider: AuthProvider):
        self.job_manager = job_manager
        self.auth = Auth(auth_provider)

    @Auth.requires_auth(
        auth_accessor=lambda self, request, job_id: self.auth,
        credentials_accessor=CREDENTIAL_ACCESSOR,
    )
    async def get(self, credentials: Credentials, request: Request, job_id: str):
        job = self.job_manager.get_job(job_id)
        if job is None:
            return response.empty(status=404)
        if job.owner != credentials.identifier:
            return response.empty(status=403)

        return response.json(
            {"id": job.id, "state": job.state, "response": job.response}
        )


class UserHandler(HTTPMethodView):
    def __init__(self, auth_provider: AuthProvider):
        self.auth = Auth(auth_provider)

    async def post(self, request: Request):
        body = request.load_json()
        username = body["username"]
        if not username.isalnum():
            return response.empty(status=404)
        password = body["password"]

        credentials = PasswordCredentials(username, password)
        await self.auth.register(credentials)

        jwt = JWTCredentials(
            username,
            json.dumps({"sub": username}),
            expiration=datetime.datetime.now() + datetime.timedelta(days=30),
        )
        signed_jwt = await self.auth.register(jwt)
        return response.json(
            {
                "jwt": signed_jwt.verification,
                "expiration": (
                    signed_jwt.expiration.isoformat()
                    if signed_jwt.expiration is not None
                    else None
                ),
            }
        )


class AuthHandler(HTTPMethodView):
    def __init__(self, auth_provider: AuthProvider):
        self.auth = Auth(auth_provider)

    async def post(self, request: Request):
        credentials = None
        try:
            jwt_credential = CREDENTIAL_ACCESSOR(self, request)
            if jwt_credential is not None:
                credentials = jwt_credential
        except:
            ...

        if credentials is None:
            body = request.load_json()
            username: str = body["username"]
            if not username.isalnum():
                return response.empty(status=404)
            password = body["password"]
            credentials = PasswordCredentials(username, password)

        is_valid = await self.auth.verify(credentials)

        if not is_valid:
            return response.empty(status=401)

        verified_jwt_credentials = await self.auth.convert(credentials, JWTCredentials)

        return response.json(
            {
                "jwt": verified_jwt_credentials.verification,
                "expiration": (
                    verified_jwt_credentials.expiration.isoformat()
                    if verified_jwt_credentials.expiration is not None
                    else None
                ),
            }
        )


app.add_route(
    RegionSearchHandler.as_view(region_search=registry[RegionSearch]),
    "/api/regions/search",
)
app.add_route(
    HotspotRegionHandler.as_view(ebird_manager=registry[EBirdManager]),
    "/api/regions/<region_code:str>/hotspots",
)
app.add_route(
    SpeciesRegionHandler.as_view(ebird_manager=registry[EBirdManager]),
    "/api/regions/<region_code:str>/species",
)
app.add_route(
    BirdSpotHandler.as_view(
        ebird_manager=registry[EBirdManager],
        birdspot_manager=registry[BirdSpotManager],
        job_manager=registry[JobManager],
        auth_provider=registry[FileAuth],
    ),
    "/api/birdspot/<region_code:str>/hotspots/score",
)
app.add_route(
    JobHandler.as_view(
        job_manager=registry[JobManager],
        auth_provider=registry[FileAuth],
    ),
    "/api/jobs/<job_id:strorempty>",
    methods=["GET"],
)

app.add_route(UserHandler.as_view(auth_provider=registry[FileAuth]), "/api/users")

app.add_route(AuthHandler.as_view(auth_provider=registry[FileAuth]), "/api/login")

def make_directories():
    if (auth_directory := os.getenv("BIRDSPOT_FILE_AUTH_DIRECTORY")) is not None:
        os.makedirs(auth_directory, exist_ok=True)

    if (cache_directory := os.getenv("BIRDSPOT_FILE_CACHE_DIRECTORY")) is not None:
        os.makedirs(cache_directory, exist_ok=True)

    if (job_directory := os.getenv("BIRDSPOT_JOB_DIRECTORY")) is not None:
        os.makedirs(job_directory, exist_ok=True)

make_directories()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, dev=True)
