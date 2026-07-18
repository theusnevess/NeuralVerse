"""Dependency-free SQLAlchemy type for PostgreSQL pgvector columns."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy.types import UserDefinedType


class Vector(UserDefinedType[tuple[float, ...]]):
    cache_ok = True

    def __init__(self, dimensions: int) -> None:
        if dimensions <= 0:
            raise ValueError("vector dimensions must be positive")
        self.dimensions = dimensions

    def get_col_spec(self, **kw: object) -> str:
        return f"VECTOR({self.dimensions})"

    def bind_processor(self, dialect: object):  # type: ignore[no-untyped-def]
        def process(value: Sequence[float] | None) -> str | None:
            if value is None:
                return None
            if len(value) != self.dimensions:
                raise ValueError("vector dimension mismatch")
            return "[" + ",".join(str(float(v)) for v in value) + "]"

        return process

    def result_processor(self, dialect: object, coltype: object):  # type: ignore[no-untyped-def]
        def process(value: object) -> tuple[float, ...] | None:
            if value is None:
                return None
            if isinstance(value, str):
                return tuple(float(part) for part in value.strip("[]").split(",") if part)
            if isinstance(value, (list, tuple)):
                return tuple(float(part) for part in value)
            raise TypeError("unsupported pgvector result")

        return process
