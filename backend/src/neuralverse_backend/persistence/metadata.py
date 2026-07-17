from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from neuralverse_backend.persistence.naming import NAMING_CONVENTION

metadata = MetaData(naming_convention=NAMING_CONVENTION)


class Base(DeclarativeBase):
    metadata = metadata
