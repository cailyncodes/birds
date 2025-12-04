import attrs
from enum import Enum

from app.model.bird import Bird
from app.model.user import User

class LifeListType(Enum):
    LIFE_LIST=0
    COUNTRY_LIST=10
    SUBNATIONAL_LIST=20
    SUBNATIONAL2_LIST=30
    HOTSPOT_LIST=40
    CUSTOM_LIST=50


@attrs.define
class LifeList:
    user: User
    type: LifeListType
    birds: list[Bird]
