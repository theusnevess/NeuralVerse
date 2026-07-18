"""SQLAlchemy-backed outbox repository."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, cast
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from neuralverse_backend.persistence.models.outbox_event import TransactionalOutboxEventRecord


class OutboxRepository:
    """Repository for outbox events."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def create_event(
        self,
        *,
        event_type: str,
        aggregate_type: str,
        aggregate_id: str,
        payload: dict[str, Any],
        available_at: datetime,
    ) -> TransactionalOutboxEventRecord:
        record = TransactionalOutboxEventRecord(
            event_id=UUID(bytes=__import__("os").urandom(16)),
            event_type=event_type,
            aggregate_type=aggregate_type,
            aggregate_id=aggregate_id,
            payload=payload,
            status="PENDING",
            attempt_count=0,
            available_at=available_at,
            created_at=datetime.now(UTC),
        )
        self._session.add(record)
        self._session.flush()
        return record

    def claim_pending_events(self, limit: int = 10) -> list[TransactionalOutboxEventRecord]:
        candidates = (
            select(TransactionalOutboxEventRecord)
            .where(
                TransactionalOutboxEventRecord.status.in_(["PENDING", "RETRYABLE_FAILURE"]),
                TransactionalOutboxEventRecord.available_at <= datetime.now(UTC),
            )
            .order_by(TransactionalOutboxEventRecord.available_at)
            .limit(limit)
            .with_for_update(skip_locked=True)
            .cte("outbox_candidates")
        )
        statement = (
            update(TransactionalOutboxEventRecord)
            .where(TransactionalOutboxEventRecord.event_id == candidates.c.event_id)
            .values(
                status="PROCESSING",
                attempt_count=TransactionalOutboxEventRecord.attempt_count + 1,
            )
            .returning(TransactionalOutboxEventRecord.event_id)
        )
        event_ids = list(self._session.execute(statement).scalars().all())
        self._session.flush()
        self._session.expire_all()
        return [
            record
            for event_id in event_ids
            if (record := self._session.get(TransactionalOutboxEventRecord, event_id)) is not None
        ]

    def mark_published(self, event_id: UUID) -> None:
        self._session.execute(
            update(TransactionalOutboxEventRecord)
            .where(TransactionalOutboxEventRecord.event_id == event_id)
            .values(
                status="PUBLISHED",
                published_at=datetime.now(UTC),
            )
        )
        self._session.flush()

    def mark_retryable_failure(self, event_id: UUID, error: str) -> None:
        self._session.execute(
            update(TransactionalOutboxEventRecord)
            .where(TransactionalOutboxEventRecord.event_id == event_id)
            .values(
                status="RETRYABLE_FAILURE",
                last_error=error[:2000] if error else None,
            )
        )
        self._session.flush()

    def mark_dead_letter(self, event_id: UUID, error: str) -> None:
        self._session.execute(
            update(TransactionalOutboxEventRecord)
            .where(TransactionalOutboxEventRecord.event_id == event_id)
            .values(
                status="DEAD_LETTER",
                last_error=error[:2000] if error else None,
            )
        )
        self._session.flush()

    def get_by_id(self, event_id: UUID) -> TransactionalOutboxEventRecord | None:
        return cast(
            TransactionalOutboxEventRecord | None,
            self._session.get(TransactionalOutboxEventRecord, event_id),
        )
