import datetime
from time import sleep
from app.dal.cache.file import FileCache
from lib.cache import CacheAccessor, CacheProvider, Cache, CacheKey, KeySerializer
from minject import inject

from app.dal.ebird import EBirdDAL

EBIRD_CACHE_KEY = CacheKey("ebird", 1)

CACHE_ACCESSOR: CacheAccessor["EBirdManager"] = lambda self: self.cache

REGION_KEY: KeySerializer[str, str] = lambda region_code, auth: region_code
REGION_DATE_KEY: KeySerializer[str, datetime.date, str] = lambda region_code, date, auth: f"{region_code}:{date.isoformat()}"

@inject.bind(
    ebird_dal=inject.reference(EBirdDAL),
    cache_provider=inject.reference(FileCache)
)
class EBirdManager:
    ebird_dal: EBirdDAL
    cache: Cache[CacheProvider]
    # (cache_provider=ca, max_size=1024*8, cache_file="./data/cache/ebird.json")

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
        return response.json()
            
        
        return self.__use_cache(f"get_hotspots_by_region.{region_code}", _get_hotspots_by_region)
    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_KEY)
    )
    async def get_species_by_region(self, region_code: str, auth: str) -> list[dict[str, str]]:
        # def _get_species_by_region():
        possible_species_codes_response = self.ebird_dal.get(
            f"product/spplist/{region_code}?fmt=json",
            auth
        )
        possible_species_codes = possible_species_codes_response.json()

        possible_species_response = self.ebird_dal.get(
            f"ref/taxonomy/ebird?species={",".join(possible_species_codes)}&fmt=json",
            auth
        )

        possible_species = possible_species_response.json()
        return possible_species
        
        return self.__use_cache(f"get_species_by_region.{region_code}", _get_species_by_region)
    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY)
    )
    async def get_species_observed_by_date_and_region(self, region_code: str, date: datetime.date, auth: str) -> list:
        # def _get_species_observed_by_date_and_region() -> list:
        sleep(0.1)
        species_observed_response = self.ebird_dal.get(
            f"data/obs/{region_code}/historic/{date.year}/{date.month}/{date.day}",
            auth
        )

        species_observed = species_observed_response.json()
        return species_observed
        
        return self.__use_cache(f"get_species_observed_by_date_and_region.{region_code}.{date.isoformat()}", _get_species_observed_by_date_and_region)
    
    @Cache.with_cache(
        cache_accessor=CACHE_ACCESSOR,
        key_serializer=Cache.typed_serializer(REGION_DATE_KEY)
    )
    async def get_checklists_by_date_and_region(self, region_code: str, date: datetime.date, auth: str) -> list:
        # def _get_checklists_by_date_and_region() -> list:
        sleep(0.1)
        checklists_response = self.ebird_dal.get(
            f"product/lists/{region_code}/{date.year}/{date.month}/{date.day}",
            auth
        )

        checklists = checklists_response.json()
        return checklists
        
        return self.__use_cache(f"get_checklists_by_date_and_region.{region_code}.{date.isoformat()}", _get_checklists_by_date_and_region)
