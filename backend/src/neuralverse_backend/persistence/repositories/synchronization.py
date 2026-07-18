"""SQLAlchemy-backed synchronization repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from neuralverse_backend.domain.synchronization import (
    SyncDirection,
    SynchronizationRecord,
    SynchronizationRecordId,
    SyncStatus,
)
from neuralverse_backend.persistence.models.synchronization import SynchronizationRecordRecord


class SqlAlchemySynchronizationRepository:
    """Implements SynchronizationRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_record_by_id(
        self, record_id: SynchronizationRecordId
    ) -> SynchronizationRecord | None:
        record = self._session.get(SynchronizationRecordRecord, UUID(str(record_id)))
        if record is None:
            return None
        return self._reconstruct_record(record)

    async def save_record(self, sync_record: SynchronizationRecord) -> None:
        record = self._session.get(SynchronizationRecordRecord, UUID(str(sync_record.id)))
        if record is None:
            record = SynchronizationRecordRecord(
                synchronization_record_id=UUID(str(sync_record.id)),
                source_system=sync_record.source_system,
                target_system=sync_record.target_system,
                domain_object_id=sync_record.domain_object_id,
                domain_object_version=sync_record.domain_object_version,
                direction=sync_record.direction.value,
                status=sync_record.status.value,
                content_fingerprint=sync_record.content_fingerprint,
                failure_summary=sync_record.failure_summary,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.status = sync_record.status.value
            record.content_fingerprint = sync_record.content_fingerprint
            record.failure_summary = sync_record.failure_summary
            record.attempt_count += 1
        self._session.flush()

    def _reconstruct_record(self, record: SynchronizationRecordRecord) -> SynchronizationRecord:
        return SynchronizationRecord(
            record_id=SynchronizationRecordId(_value=str(record.synchronization_record_id)),
            source_system=record.source_system,
            target_system=record.target_system,
            domain_object_id=record.domain_object_id,
            domain_object_version=record.domain_object_version,
            direction=SyncDirection(record.direction),
            status=SyncStatus(record.status),
            content_fingerprint=record.content_fingerprint,
            failure_summary=record.failure_summary,
        )
