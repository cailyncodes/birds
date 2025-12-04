import attrs
import json
import os
import pickle
from typing import Optional
import minject

from lib.trie import Trie

REGIONS_LIST_PATH = "data/regions/all_regions_flat.json"
REGIONS_PICKLE_PATH = "data/regions/all_regions_flat.pkl"

@minject.define()
class RegionSearch:
    """
    A class to handle region search operations.
    """

    # we need to use attrs.field to avoid minject trying to inject these,
    # since they are initialized in __init__
    regions: dict[str, str] = attrs.field(init=False)
    regions_search: Trie = attrs.field(init=False)

    def __attrs_post_init__(self):
        self.__initialize()

    def __initialize(self) -> RegionSearch:
        # Load the list JSON and get all the keys
        if list_exists := os.path.exists(REGIONS_LIST_PATH):
            with open(REGIONS_LIST_PATH, "r") as f:
                self.regions = json.load(f)
        
        # Then check if the pickle file exists
        if pickle_exists := os.path.exists(REGIONS_PICKLE_PATH):
            with open(REGIONS_PICKLE_PATH, "rb") as pf:
                regions_search: Trie = pickle.load(pf)
                self.regions_search = regions_search
            return self


        # If pickle doesn't exist and the list does, build the Trie
        if list_exists and not pickle_exists:
            with open(REGIONS_LIST_PATH, "r") as f:
                regions_map = json.load(f)
                self.regions_search = Trie()
            for region_name in regions_map.keys():
                self.regions_search.insert(region_name)
            return self
            
        raise FileNotFoundError("Region data files not found.")

    def search_by_name(self, name: str, max_results: Optional[int] = None) -> tuple[list[dict[str, str]], int]:
        """
        Search for regions by name.
        """
        max_results = min(max_results or len(self.regions.keys()), len(self.regions.keys()))
        results = self.regions_search.search(name)
        results.sort(key=lambda r: self._match_score(r, name))
        hydrated_results = [{"name": r, "code": self.regions[r]} for r in results[:max_results] if self.regions.get(r) is not None]
        
        return hydrated_results, len(results)
    
    def _match_score(self, region: str, query: str) -> tuple[int, int, int, str]:
        """
        Sorting key for a region string.

        Returns a tuple:
        (part_index, exact_flag, -prefix_len, region_lower)

        - part_index: index of the comma-separated component where the query
                        matches as a prefix (0 = leftmost; large number if no match)
        - exact_flag: 0 if the component matches query exactly, 1 if it's only
                        a prefix match, 2 if no match at all
        - -prefix_len: negative length of common prefix (longer is better)
        - region_lower: for alphabetical fallback
        """
        q = query.strip().lower()
        parts = [p.strip().lower() + ',' for p in region.split(',')]

        best_index = 10**9      # "no match" sentinel; big so matches sort first
        best_exact_flag = 2     # 0 = exact, 1 = partial, 2 = no match
        best_prefix_len = 0

        for idx, part in enumerate(parts):
            # Only consider prefix matches of this component
            if part.startswith(q):
                prefix_len = len(os.path.commonprefix([q, part]))
                exact_flag = 0 if len(part) == len(q) else 1

                if (
                    idx < best_index or
                    (idx == best_index and exact_flag < best_exact_flag) or
                    (idx == best_index and exact_flag == best_exact_flag and prefix_len > best_prefix_len)
                ):
                    best_index = idx
                    best_exact_flag = exact_flag
                    best_prefix_len = prefix_len

        return (
            best_index,
            best_exact_flag,
            -best_prefix_len,
            region.lower(),  # alphabetical fallback
        )

