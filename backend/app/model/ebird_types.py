"""Type definitions for eBird API responses.

Based on eBird API 2.0 documentation:
https://documenter.getpostman.com/view/664302/S1ENwy59
"""

from typing import TypedDict, NotRequired


class EBirdHotspot(TypedDict):
    """eBird hotspot information from ref/hotspot endpoint.

    Example:
        {
            "locId": "L7884500",
            "locName": "Frog Pond",
            "countryCode": "US",
            "subnational1Code": "US-NY",
            "subnational2Code": "US-NY-123",
            "lat": 42.45,
            "lng": -76.52,
            "latestObsDate": "2024-01-15",
            "numSpeciesAllTime": 150
        }
    """

    locId: str
    locName: str
    countryCode: str
    subnational1Code: str
    subnational2Code: str
    lat: float
    lng: float
    latestObsDate: NotRequired[str]
    numSpeciesAllTime: NotRequired[int]


class EBirdTaxon(TypedDict):
    """Taxon/species information from ref/taxonomy endpoint.

    Example:
        {
            "sciName": "Bombycilla garrulus",
            "comName": "Bohemian Waxwing",
            "speciesCode": "bohwax",
            "category": "species",
            "taxonOrder": 29257.0,
            "bandingCodes": ["BOWA"],
            "comNameCodes": ["BOWA"],
            "sciNameCodes": ["BOGA"],
            "order": "Passeriformes",
            "familyCode": "bombyc1",
            "familyComName": "Waxwings",
            "familySciName": "Bombycillidae"
        }
    """

    sciName: str
    comName: str
    speciesCode: str
    category: str  # species, spuh, issf, slash, hybrid, intergrade, domestic, form
    taxonOrder: float
    bandingCodes: list[str]
    comNameCodes: list[str]
    sciNameCodes: list[str]
    order: str
    familyCode: NotRequired[str]
    familyComName: NotRequired[str]
    familySciName: NotRequired[str]


class EBirdObservation(TypedDict):
    """Observation record from data/obs endpoint.

    Example:
        {
            "speciesCode": "bohwax",
            "comName": "Bohemian Waxwing",
            "sciName": "Bombycilla garrulus",
            "locId": "L7884500",
            "locName": "Frog Pond",
            "obsDt": "2024-01-15 10:30",
            "howMany": 5,
            "lat": 42.45,
            "lng": -76.52,
            "obsValid": True,
            "obsReviewed": False,
            "locationPrivate": False,
            "subId": "S144646447"
        }
    """

    speciesCode: str
    comName: str
    sciName: str
    locId: str
    locName: str
    obsDt: str
    howMany: NotRequired[int]
    lat: float
    lng: float
    obsValid: bool
    obsReviewed: bool
    locationPrivate: bool
    subId: str


class EBirdChecklistLocationData(TypedDict):
    """Location data within a checklist feed entry."""

    name: str
    latitude: float
    longitude: float
    countryCode: str
    countryName: str
    subnational1Code: str
    subnational1Name: str
    subnational2Code: str
    subnational2Name: str
    isHotspot: bool
    hierarchicalName: str


class EBirdChecklistFeedEntry(TypedDict):
    """Checklist feed entry from product/lists endpoint.

    Example:
        {
            "locId": "L7884500",
            "subId": "S144646447",
            "userDisplayName": "John Doe",
            "numSpecies": 25,
            "date": "2024-01-15",
            "time": "10:30",
            "loc": {
                "name": "Frog Pond",
                "latitude": 42.45,
                "longitude": -76.52,
                "countryCode": "US",
                "countryName": "United States",
                "subnational1Code": "US-NY",
                "subnational1Name": "New York",
                "subnational2Code": "US-NY-123",
                "subnational2Name": "Tompkins",
                "isHotspot": True,
                "hierarchicalName": "US, New York, Tompkins, Frog Pond"
            }
        }
    """

    locId: str
    subId: str
    userDisplayName: str
    numSpecies: int
    date: str
    time: str
    loc: EBirdChecklistLocationData
