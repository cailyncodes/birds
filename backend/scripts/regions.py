#!/usr/bin/env python3

# This script is part of the build process to generate region data files.
# It fetches region data from the eBird API and saves it into JSON files.

import json
import os
import random
from functools import reduce

import requests
from dotenv import load_dotenv

from backend.app.manager.regions import RegionSearch

EBIRD_API_KEY = None


def init():
    load_dotenv("../.env")
    global EBIRD_API_KEY
    EBIRD_API_KEY = os.getenv("EBIRD_API_KEY")


def fetch_regions(region_type=None, parent_code=None):
    """
    Fetch regions from eBird API based on region type and optional parent code.
    """
    base_url = "https://api.ebird.org/v2/ref/region/list"
    headers = {"X-eBirdApiToken": EBIRD_API_KEY}

    if parent_code:
        url = f"{base_url}/{region_type}/{parent_code}?fmt=json"
    elif region_type:
        url = f"{base_url}/{region_type}/world?fmt=json"
    else:
        url = f"{base_url}/country/world?fmt=json"

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    return response.json()


def save_regions_to_file(region_type, regions):
    """
    Save the fetched regions to a JSON file.
    """
    destination_dir = os.path.join(os.path.dirname(__file__), "..", "data", "regions")
    os.makedirs(destination_dir, exist_ok=True)

    filename = os.path.join(destination_dir, f"{region_type}_regions.json")
    with open(filename, "w") as f:
        json.dump(regions, f, indent=4)


def make_fully_qualified_name(country_name, subnational_name, subnational2_name=None):
    """
    Create a fully qualified name for a region.
    """
    if subnational2_name:
        return f"{subnational2_name}, {subnational_name}, {country_name}"
    else:
        return f"{subnational_name}, {country_name}"


def make_region_data(code, name, parent_code=None, parent_name=None):
    """
    Create a region data dictionary.
    """
    region_data = {"code": code, "name": name}
    if parent_code:
        region_data["parent_code"] = parent_code
    if parent_name:
        region_data["parent_name"] = parent_name
    return region_data


def update_data_from_ebird():
    """
    Main function to fetch and save region data from eBird API.
    """
    print("Fetching and saving country regions...")

    # Get countries
    countries = fetch_regions()

    count = 0

    for country in countries:
        fully_qualified_regions = []
        print(f"Processing country: {country['name']}")
        country_code = country["code"]
        country_name = country["name"]

        subnational_regions = fetch_regions(
            region_type="subnational1", parent_code=country_code
        )

        for subnational in subnational_regions:
            print(f"  Processing subnational region: {subnational['name']}")
            subnational_code = subnational["code"]
            subnational_name = subnational["name"]

            # Fetch subnational2 regions
            subnational2_regions = fetch_regions(
                region_type="subnational2", parent_code=subnational_code
            )

            # Not all subnational regions have subnational2 regions, just save subnational region in that case
            if not subnational2_regions:
                count += 1

                # No subnational2 regions, save subnational region only
                fully_qualified_name = make_fully_qualified_name(
                    country_name, subnational_name
                )
                subnational_region_data = make_region_data(
                    code=subnational_code,
                    name=fully_qualified_name,
                    parent_code=country_code,
                    parent_name=country_name,
                )
                fully_qualified_regions.append(subnational_region_data)
                continue

            for subnational2 in subnational2_regions:
                print(f"    Processing subnational2 region: {subnational2['name']}")
                count += 1

                subnational2_code = subnational2["code"]
                subnational2_name = subnational2["name"]

                fully_qualified_name = make_fully_qualified_name(
                    country_name, subnational_name, subnational2_name
                )
                subnational2_region_data = make_region_data(
                    code=subnational2_code,
                    name=fully_qualified_name,
                    parent_code=subnational_code,
                    parent_name=subnational_name,
                )
                fully_qualified_regions.append(subnational2_region_data)

                if count % 100 == 0:
                    print(f"  Processed {count} regions so far...")

        # Save regions for the country
        save_regions_to_file(f"country_{country['code']}", fully_qualified_regions)

        print(
            f"Finished processing country: {country['name']} with {len(fully_qualified_regions)} regions."
        )

    print("Region data fetching and saving complete.")


def flatten_regions():
    """
    Function for flattening region data into a single file.
    """
    # Read all the files in the data/regions directory and combine them into a single flat list of fully qualified region names

    destination_dir = os.path.join(os.path.dirname(__file__), "..", "data", "regions")
    all_regions = {}
    count = 0
    count_last_log = 0

    for filename in os.listdir(destination_dir):
        if count - count_last_log >= 1000:
            print(f"Processed {count} regions so far...")
            count_last_log = count

        if filename.endswith("_regions.json"):
            filepath = os.path.join(destination_dir, filename)
            with open(filepath, "r") as f:
                regions = json.load(f)
                if len(regions) == 0:
                    count += 1
                    code = (
                        filename.replace("country_", "")
                        .replace("_regions.json", "")
                        .upper()
                    )
                    all_regions.update(
                        {
                            f"TO_PROCESS_{code}": code,
                        }
                    )

                else:
                    count += len(regions)
                    regions = reduce(
                        lambda acc, r: {
                            **acc,
                            r["name"].replace(",", ""): r.get("code", ""),
                        },
                        regions,
                        {},
                    )
                    all_regions.update(regions)

    # Save the flattened list
    flat_filename = os.path.join(destination_dir, "all_regions_flat.json")
    with open(flat_filename, "w") as f:
        json.dump(all_regions, f, indent=4)


def pickle_regions():
    """
    Function to pickle the flattened region data for faster loading.
    """
    destination_dir = os.path.join(os.path.dirname(__file__), "..", "data", "regions")
    flat_filename = os.path.join(destination_dir, "all_regions_flat.json")
    pickle_filename = os.path.join(destination_dir, "all_regions_flat.pkl")

    with open(flat_filename, "r") as f:
        regions = json.load(f)

    regions = RegionSearch()

    with open(pickle_filename, "wb") as pf:
        regions.regions_search.serialize(pf)

    print(f"Pickled region data saved to {pickle_filename}")


def benchmark_region_search():
    """
    Benchmark the region search functionality.
    """
    import time

    load_start_time = time.time()
    region_search = RegionSearch()
    load_end_time = time.time()
    print(f"Loaded RegionSearch in {load_end_time - load_start_time:.6f} seconds.")

    test_queries = [
        "California, United States",
        "Ontario, Canada",
        "Bavaria, Germany",
        "Queensland, Australia",
        "Maharashtra, India",
        "Cal",
        "United",
        "Germ",
        "Queen",
        "rasht",
        "ndia",
    ]

    for query in test_queries:
        start_time = time.time()
        results, total_results = region_search.search_by_name(
            query, max_results=random.randint(5, 100)
        )
        end_time = time.time()
        print(
            f"Search for '{query}' returned {len(results)} results of {total_results} in {end_time - start_time:.6f} seconds."
        )


if __name__ == "__main__":
    arg_to_function = {
        "update": update_data_from_ebird,
        "flatten": flatten_regions,
        "pickle": pickle_regions,
        "benchmark": benchmark_region_search,
    }

    args = os.sys.argv  # type: ignore

    if args and len(args) > 1 and args[1] in arg_to_function:
        func = arg_to_function[args[1]]
        if callable(func):
            init()
            func()
        else:
            print(f"Argument '{args[1]}' is not callable.")
    else:
        print(
            "No valid command provided. Available commands: "
            + ", ".join(arg_to_function.keys())
        )
