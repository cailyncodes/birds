import datetime
import os
from time import sleep
from app.dal.cache.file import FileCache
from app.dal.cache.redis import RedisCache
from lib.cache import CacheAccessor, CacheProvider, Cache, CacheKey, KeySerializer
from minject import inject

from app.dal.ebird import EBirdDAL

EBIRD_CACHE_KEY = CacheKey("ebird", 1)

CACHE_ACCESSOR: CacheAccessor["EBirdManager"] = lambda self: self.cache

REGION_KEY: KeySerializer[str, str] = lambda region_code, auth: region_code
REGION_DATE_KEY: KeySerializer[str, datetime.date, str] = lambda region_code, date, auth: f"{region_code}:{date.isoformat()}"

@inject.bind(
    ebird_dal=inject.reference(EBirdDAL),
    cache_provider=inject.reference(RedisCache) if os.getenv("RAILWAY_ENVIRONMENT_NAME") == "production" else inject.reference(FileCache)
)
class EBirdManager:
    ebird_dal: EBirdDAL
    cache: Cache[CacheProvider]

    def __init__(self, ebird_dal: EBirdDAL, cache_provider: CacheProvider):
        self.ebird_dal = ebird_dal
        self.cache_provider = cache_provider
        self.cache = Cache(EBIRD_CACHE_KEY, cache_provider)


    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_KEY)
    )
    async def get_hotspots_by_region(self, region_code: str, auth: str) -> list[dict[str, str]]:
        response = self.ebird_dal.get(
                f"ref/hotspot/{region_code}?fmt=json",
                auth
            )
        if response.status_code in (204, 404):
            return []
        return response.json()
    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_KEY)
    )
    async def get_species_by_region(self, region_code: str, auth: str) -> list[dict[str, str]]:
        possible_species_codes_response = self.ebird_dal.get(
            f"product/spplist/{region_code}?fmt=json",
            auth
        )
        if possible_species_codes_response.status_code in (204, 404):
            return []
        try:
            possible_species_codes = possible_species_codes_response.json()
        except ValueError:
            return []

        possible_species_response = self.ebird_dal.get(
            f"ref/taxonomy/ebird?species={",".join(possible_species_codes)}&fmt=json",
            auth
        )

        possible_species = possible_species_response.json()
        return possible_species

    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY)
    )
    async def get_species_observed_by_date_and_region(self, region_code: str, date: datetime.date, auth: str) -> list:
        # The eBird API may return an empty body (204 No Content) or a 404
        # for locations with no observations.  The original implementation
        # called ``response.json()`` unconditionally which raises a
        # ``JSONDecodeError`` when the body is empty.  We now guard against
        # that by checking the status code and returning an empty list when
        # appropriate.
        sleep(0.1)
        species_observed_response = self.ebird_dal.get(
            f"data/obs/{region_code}/historic/{date.year}/{date.month}/{date.day}",
            auth
        )

        # If the response is empty or indicates no content, return an empty list.
        if species_observed_response.status_code in (204, 404):
            return []
        try:
            species_observed = species_observed_response.json()
        except ValueError:
            # Fallback for unexpected empty or malformed JSON.
            return []
        return species_observed
        
    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY)
    )
    async def get_checklists_by_date_and_region(self, region_code: str, date: datetime.date, auth: str) -> list:
        # Similar defensive handling as ``get_species_observed_by_date_and_region``.
        sleep(0.1)
        checklists_response = self.ebird_dal.get(
            f"product/lists/{region_code}/{date.year}/{date.month}/{date.day}",
            auth
        )
        if checklists_response.status_code in (204, 404):
            return []
        try:
            checklists = checklists_response.json()
        except ValueError:
            return []
        return checklists
        
