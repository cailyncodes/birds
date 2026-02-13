import datetime
import logging
import os
from time import sleep
from app.dal.cache.file import FileCache
from app.dal.cache.redis import RedisCache
from app.model.ebird_types import (
    EBirdChecklistFeedEntry,
    EBirdHotspot,
    EBirdObservation,
    EBirdTaxon,
)
from lib.cache import CacheAccessor, CacheProvider, Cache, CacheKey, KeySerializer
from minject import inject

from app.dal.ebird import EBirdDAL


logger = logging.getLogger(__name__)

EBIRD_CACHE_KEY = CacheKey("ebird", 1)

CACHE_ACCESSOR: CacheAccessor["EBirdManager"] = lambda self: self.cache

REGION_KEY: KeySerializer[str, str] = lambda region_code, auth: region_code
REGION_DATE_KEY: KeySerializer[str, datetime.date, str] = (
    lambda region_code, date, auth: f"{region_code}:{date.isoformat()}"
)


@inject.bind(
    ebird_dal=inject.reference(EBirdDAL),
    cache_provider=inject.reference(RedisCache)
    if os.getenv("RAILWAY_ENVIRONMENT_NAME") == "production"
    else inject.reference(FileCache),
)
class EBirdManager:
    ebird_dal: EBirdDAL
    cache: Cache[CacheProvider]

    def __init__(self, ebird_dal: EBirdDAL, cache_provider: CacheProvider):
        self.ebird_dal = ebird_dal
        self.cache_provider = cache_provider
        self.cache = Cache(EBIRD_CACHE_KEY, cache_provider)

    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR, key_serializer=Cache.typed_serializer(REGION_KEY)
    )
    async def get_hotspots_by_region(
        self, region_code: str, auth: str
    ) -> list[EBirdHotspot]:
        response = self.ebird_dal.get(f"ref/hotspot/{region_code}?fmt=json", auth)
        if response.status_code in (204, 404):
            return []
        try:
            logger.debug(
                "get_hotspots_by_region response: %d - %s",
                response.status_code,
                response.text[:500],
            )
            result = response.json()
            return result
        except ValueError as e:
            logger.error("JSON parsing failed for hotspots_by_region: %s", e)
            logger.error("Response text: %s...", response.text[:200])
            raise

    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR, key_serializer=Cache.typed_serializer(REGION_KEY)
    )
    async def get_species_by_region(
        self, region_code: str, auth: str
    ) -> list[EBirdTaxon]:
        possible_species_codes_response = self.ebird_dal.get(
            f"product/spplist/{region_code}?fmt=json", auth
        )
        if possible_species_codes_response.status_code in (204, 404):
            return []
        try:
            logger.debug(
                "get_species_by_region (spplist) response: %d - %s",
                possible_species_codes_response.status_code,
                possible_species_codes_response.text[:500],
            )
            possible_species_codes = possible_species_codes_response.json()
        except ValueError as e:
            logger.error("JSON parsing failed for species codes: %s", e)
            logger.error(
                "Response text: %s...", possible_species_codes_response.text[:200]
            )
            return []

        possible_species_response = self.ebird_dal.get(
            f"ref/taxonomy/ebird?species={','.join(possible_species_codes)}&fmt=json",
            auth,
        )

        try:
            logger.debug(
                "get_species_by_region (taxonomy) response: %d - %s",
                possible_species_response.status_code,
                possible_species_response.text[:500],
            )
            possible_species = possible_species_response.json()
            return possible_species
        except ValueError as e:
            logger.error("JSON parsing failed for species: %s", e)
            logger.error("Response text: %s...", possible_species_response.text[:200])
            return []

    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY),
    )
    async def get_species_observed_by_date_and_region(
        self, region_code: str, date: datetime.date, auth: str
    ) -> list[EBirdObservation]:
        # The eBird API may return an empty body (204 No Content) or a 404
        # for locations with no observations.  The original implementation
        # called ``response.json()`` unconditionally which raises a
        # ``JSONDecodeError`` when the body is empty.  We now guard against
        # that by checking the status code and returning an empty list when
        # appropriate.
        sleep(0.1)
        species_observed_response = self.ebird_dal.get(
            f"data/obs/{region_code}/historic/{date.year}/{date.month}/{date.day}", auth
        )

        # If the response is empty or indicates no content, return an empty list.
        if species_observed_response.status_code in (204, 404):
            return []
        try:
            logger.debug(
                "get_species_observed_by_date_and_region response: %d - %s",
                species_observed_response.status_code,
                species_observed_response.text[:500],
            )
            species_observed = species_observed_response.json()
            return species_observed
        except ValueError as e:
            logger.error("JSON parsing failed for species observed: %s", e)
            logger.error("Response text: %s...", species_observed_response.text[:200])
            return []

    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY),
    )
    async def get_checklists_by_date_and_region(
        self, region_code: str, date: datetime.date, auth: str
    ) -> list[EBirdChecklistFeedEntry]:
        # Similar defensive handling as ``get_species_observed_by_date_and_region``.
        sleep(0.1)
        checklists_response = self.ebird_dal.get(
            f"product/lists/{region_code}/{date.year}/{date.month}/{date.day}", auth
        )
        if checklists_response.status_code in (204, 404):
            return []
        try:
            logger.debug(
                "get_checklists_by_date_and_region response: %d - %s",
                checklists_response.status_code,
                checklists_response.text[:500],
            )
            checklists = checklists_response.json()
            return checklists
        except ValueError as e:
            logger.error("JSON parsing failed for checklists: %s", e)
            logger.error("Response text: %s...", checklists_response.text[:200])
            return []
