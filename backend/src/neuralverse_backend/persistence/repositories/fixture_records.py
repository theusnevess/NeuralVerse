from __future__ import annotations

from uuid import UUID

from sqlalchemy import Text, bindparam, cast, insert, null, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Session

from neuralverse_backend.fixtures.hashing import (
    canonicalize_structural_json,
    decode_canonical_structural_json,
)
from neuralverse_backend.persistence.models import FixtureRecord


class FixtureRecordRepository:
    """Minimal caller-owned repository for immutable fixture rows."""

    def add(self, session: Session, record: FixtureRecord) -> None:
        values = {
            column.name: getattr(record, column.name)
            for column in FixtureRecord.__table__.columns
            if column.name != "structural_payload"
            and getattr(record, column.name, None) is not None
        }
        canonical_payload = getattr(record, "_canonical_structural_payload", None)
        if canonical_payload is None and record.structural_payload is not None:
            canonical_payload = canonicalize_structural_json(record.structural_payload)
        values["structural_payload"] = (
            cast(
                bindparam(
                    "structural_payload_text",
                    canonical_payload.decode("utf-8"),
                    type_=Text,
                ),
                JSONB,
            )
            if canonical_payload is not None
            else null()
        )
        session.execute(insert(FixtureRecord).values(**values))

    def get_by_id(self, session: Session, fixture_record_id: UUID) -> FixtureRecord | None:
        table = FixtureRecord.__table__
        columns = [column for column in table.columns if column.name != "structural_payload"]
        statement = select(
            *columns, cast(table.c.structural_payload, Text).label("_structural_payload_text")
        ).where(table.c.fixture_record_id == fixture_record_id)
        row = session.execute(statement).mappings().one_or_none()
        if row is None:
            return None
        values = {column.name: row[column.name] for column in columns}
        payload_text = row["_structural_payload_text"]
        values["structural_payload"] = (
            decode_canonical_structural_json(payload_text) if payload_text is not None else None
        )
        return FixtureRecord(**values)
