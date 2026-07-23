from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, cast
from uuid import UUID

from sqlalchemy import select

from neuralverse_backend.authoring_workflow import TemporalAuthoringGateway
from neuralverse_backend.persistence.models import (
    AuthoringJobRecord,
    TransactionalOutboxEventRecord,
)


@dataclass(frozen=True, slots=True)
class OutboxDispatchResult:
    event_id: UUID | None
    status: str
    error_code: str | None = None


class TransactionalOutboxDispatcher:
    def __init__(
        self,
        session_factory: Callable[[], Any],
        gateway: TemporalAuthoringGateway,
        *,
        clock: Callable[[], datetime] | None = None,
        max_attempts: int = 10,
    ) -> None:
        self._session_factory = session_factory
        self._gateway = gateway
        self._clock = clock or (lambda: datetime.now(UTC))
        self._max_attempts = max_attempts

    def dispatch_once(self) -> OutboxDispatchResult:
        event = self._claim()
        if event is None:
            return OutboxDispatchResult(event_id=None, status="IDLE")
        payload = cast(dict[str, Any], event.payload)
        event_id = event.event_id
        try:
            with self._session_factory() as session:
                job = session.scalar(
                    select(AuthoringJobRecord)
                    .where(AuthoringJobRecord.authoring_job_id == UUID(payload["authoring_job_id"]))
                    .with_for_update()
                )
                if job is None:
                    raise ValueError("authoring job was not found")
                dispatch_status = self._gateway.start_or_signal(
                    workflow_id=job.workflow_id,
                    authoring_job_id=str(job.authoring_job_id),
                    event=payload,
                    workflow_started=job.workflow_started,
                )
                job.workflow_started = True
                job.last_accepted_event = str(event_id)
                job.lock_version += 1
                job.updated_at = self._clock()
                current = session.get(TransactionalOutboxEventRecord, event_id)
                if current is not None:
                    current.status = "PUBLISHED"
                    current.published_at = self._clock()
                    current.last_error = None
                session.commit()
                return OutboxDispatchResult(event_id=event_id, status=dispatch_status)
        except Exception:
            self._fail(event_id)
            return OutboxDispatchResult(
                event_id=event_id,
                status="RETRYABLE_FAILURE"
                if event.attempt_count < self._max_attempts
                else "DEAD_LETTER",
                error_code="OUTBOX_DISPATCH_FAILURE",
            )

    def _claim(self) -> TransactionalOutboxEventRecord | None:
        with self._session_factory() as session:
            now = self._clock()
            event = cast(
                TransactionalOutboxEventRecord | None,
                session.scalar(
                    select(TransactionalOutboxEventRecord)
                    .where(
                        TransactionalOutboxEventRecord.status.in_(("PENDING", "RETRYABLE_FAILURE")),
                        TransactionalOutboxEventRecord.available_at <= now,
                    )
                    .order_by(TransactionalOutboxEventRecord.available_at)
                    .with_for_update(skip_locked=True)
                    .limit(1)
                ),
            )
            if event is None:
                return None
            event.status = "PROCESSING"
            event.attempt_count += 1
            session.commit()
            session.expunge(event)
            return event

    def _fail(self, event_id: UUID) -> None:
        with self._session_factory() as session:
            event = cast(
                TransactionalOutboxEventRecord | None,
                session.get(TransactionalOutboxEventRecord, event_id),
            )
            if event is None:
                return
            event.status = (
                "RETRYABLE_FAILURE" if event.attempt_count < self._max_attempts else "DEAD_LETTER"
            )
            event.available_at = self._clock() + timedelta(
                seconds=min(300, 2 ** min(event.attempt_count, 8))
            )
            event.last_error = "Temporal dispatch failed."
            session.commit()
