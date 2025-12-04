from collections import defaultdict
import datetime
import math
from typing import Any

from app.manager.ebird import EBirdManager
from minject import inject

@inject.bind(
    ebird_manager=inject.reference(EBirdManager),
)
class BirdSpotManager:
    SCALING_FACTOR = 2.430016 # sum of 0.6^i for i from 0 to 6

    def __init__(self, ebird_manager: EBirdManager):
        self.ebird_manager = ebird_manager

    def get_missing_species(self, possible_species: list[dict[str, Any]], species: list) -> list:
        seen_species = {s.get("Taxon Order") for s in species}
        result = [s for s in possible_species if str(int(s.get("taxonOrder", 0))) not in seen_species and int(s.get("taxonOrder", 0)) != 0]
        return result

    async def get_scores_for_region(self, region_code: str, life_list: list, target_date: datetime.date, auth: str):
        possible_species = await self.ebird_manager.get_species_by_region(region_code, auth)
        missing_species = self.get_missing_species(possible_species, life_list)
        missing_species_codes = {ms.get("speciesCode") for ms in missing_species}

        # get hotspots in a region
        hotspots = await self.ebird_manager.get_hotspots_by_region(region_code, auth)
        # end

        dates = [target_date - datetime.timedelta(days=i) for i in range(1, 8)]

        # get recent birds in each hotspot on date
        hotspot_scores = []
        for hotspot in hotspots:
            species_map = defaultdict(list)
            checklists_map = {}
            for date in dates:
                loc_id = hotspot.get("locId")
                if loc_id is None:
                    raise RuntimeError("Something went wrong (Cailyn!)")
                species = await self.ebird_manager.get_species_observed_by_date_and_region(loc_id, date, auth)
                checklists = await self.ebird_manager.get_checklists_by_date_and_region(loc_id, date, auth)
                checklists_map[date] = checklists
                for s in species:
                    species_map[s.get("speciesCode")].append(s)
            missing_species = dict((key, value) for (key, value) in species_map.items() if key in missing_species_codes)
            hotspot_scores.append({
                "location": hotspot,
                "missing_species": missing_species,
                "birdspot_score": self.get_target_score_for_hotspot_and_date(missing_species, checklists_map, target_date),
                "score": len(missing_species)
            })
        
        return sorted(hotspot_scores, key=lambda hotspot_score: hotspot_score.get("birdspot_score"), reverse=True)

    def get_target_score_for_hotspot_and_date(self, all_observations: dict, checklists_map: dict[datetime.date, list], target_date: datetime.date) -> float:
        score = 0
        count = 0

        scoring_dates = [target_date - datetime.timedelta(days = i) for i in range(1, 8)]
        score_mults = [math.pow(0.6, i) for i in range(0, 7)]

        species_seen_on_date = defaultdict(set)
        for species, observations in all_observations.items():
            count = count + 1
            for obs in observations:
                obs_dt = obs.get("obsDt")
                obs_d = obs_dt.split(" ")[0]
                obs_d_parts = [int(p) for p in obs_d.split("-")]
                obs_date = datetime.date(*obs_d_parts)
                species_seen_on_date[obs_date].add(species)

        for (date, score_mult) in zip(scoring_dates, score_mults):
                # only partially penalize dates without any checklist reported
                species_count = len(species_seen_on_date[date]) if len(checklists_map[date]) > 0 else ((0.8 * (sum([len(s) for (_, s) in species_seen_on_date.items()]) + 1) / (len(species_seen_on_date) + 1)) / ((target_date - date).days + 1))
                score = score + species_count * score_mult if count > 0 else 0

        # 1. Calculate Weighted Richness Score (S_weighted)
        s_weighted = score / self.SCALING_FACTOR

        # 2. Calculate max daily species seen
        c_max = max([len(s) for (_, s) in species_seen_on_date.items()], default=0) 

        # 3. Calculate R, the Repetition Ratio (N / C_max), capped at number of days eligible for scoring
        R = min(count / c_max, len(scoring_dates)) if c_max > 0 else 0

        # 4. Calculate the dynamic multipler
        # This forces the multiplier to be 1.0 when R=1, and 3.5 when R=7.
        # TODO(cailyn) This needs to handle when len(scoring_dates) != 7!
        dynamic_multiplier = (5/12 * R) + (7/12)

        # 4. Final Score = S_weighted * Dynamic Multiplier
        return s_weighted * dynamic_multiplier
