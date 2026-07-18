from __future__ import annotations

from datetime import datetime, timedelta
from typing import cast
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as postgres_insert
from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models import IdempotencyRecord


class IdempotencyRecordRepository:
    """PostgreSQL-authoritative idempotency state access without transaction ownership."""

    def find_by_hashes(
        self,
        session: Session,
        *,
        scope: str,
        key_hashes: tuple[bytes, ...],
    ) -> list[IdempotencyRecord]:
        if not key_hashes:
            return []
        statement = select(IdempotencyRecord).where(
            IdempotencyRecord.scope == scope,
            IdempotencyRecord.idempotency_key_hash.in_(key_hashes),
        )
        return list(session.execute(statement).scalars())

    def insert_initial(
        self,
        session: Session,
        *,
        scope: str,
        key_hash: bytes,
        key_hash_key_version: str,
        request_fingerprint: str,
        now: datetime,
        lock_duration_seconds: int,
    ) -> IdempotencyRecord | None:
        record_id = uuid4()
        statement = (
            postgres_insert(IdempotencyRecord)
            .values(
                idempotency_record_id=record_id,
                scope=scope,
                idempotency_key_hash=key_hash,
                key_hash_key_version=key_hash_key_version,
                request_fingerprint=request_fingerprint,
                operation_name="ingest_fixture",
                status="IN_PROGRESS",
                created_at=now,
                locked_at=now,
                expires_at=now + timedelta(seconds=lock_duration_seconds),
                attempt_count=1,
            )
            .on_conflict_do_nothing(index_elements=["scope", "idempotency_key_hash"])
            .returning(IdempotencyRecord.idempotency_record_id)
        )
        inserted_id = session.execute(statement).scalar_one_or_none()
        if inserted_id is None:
            return None
        return self.get_by_id(session, inserted_id, for_update=True)

    def get_by_id(
        self,
        session: Session,
        idempotency_record_id: UUID,
        *,
        for_update: bool = False,
    ) -> IdempotencyRecord | None:
        statement = select(IdempotencyRecord).where(
            IdempotencyRecord.idempotency_record_id == idempotency_record_id
        )
        if for_update:
            statement = statement.with_for_update()
        return cast(IdempotencyRecord | None, session.execute(statement).scalar_one_or_none())

    def lock(self, session: Session, record: IdempotencyRecord) -> IdempotencyRecord | None:
        return self.get_by_id(session, record.idempotency_record_id, for_update=True)

    def complete(
        self,
        record: IdempotencyRecord,
        *,
        fixture_record_id: UUID,
        completed_at: datetime,
        retention_seconds: int,
    ) -> None:
        record.status = "COMPLETED"
        record.response_reference_type = "FIXTURE_RECORD"
        record.response_reference_id = fixture_record_id
        record.completed_at = completed_at
        record.failed_at = None
        record.last_error_code = None
        record.expires_at = completed_at + timedelta(seconds=retention_seconds)

    def terminalize(
        self,
        record: IdempotencyRecord,
        *,
        error_code: str,
        failed_at: datetime,
        retention_seconds: int,
    ) -> None:
        record.status = "FAILED_TERMINAL"
        record.response_reference_type = None
        record.response_reference_id = None
        record.completed_at = None
        record.failed_at = failed_at
        record.last_error_code = error_code
        record.expires_at = failed_at + timedelta(seconds=retention_seconds)

    def take_over(
        self, record: IdempotencyRecord, *, now: datetime, lock_duration_seconds: int
    ) -> None:
        record.status = "IN_PROGRESS"
        record.locked_at = now
        record.expires_at = now + timedelta(seconds=lock_duration_seconds)
        record.attempt_count += 1
        record.completed_at = None
        record.failed_at = None
        record.response_reference_type = None
        record.response_reference_id = None
        record.last_error_code = None

    def reacquire(
        self, record: IdempotencyRecord, *, now: datetime, lock_duration_seconds: int
    ) -> None:
        self.take_over(record, now=now, lock_duration_seconds=lock_duration_seconds)
