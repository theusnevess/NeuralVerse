from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

from neuralverse_backend.persistence.models import OperationalAuditEvent
from neuralverse_backend.persistence.repositories import (
    IdempotencyRecordRepository,
    OperationalAuditEventRepository,
)


def test_idempotency_repository_does_not_own_commit_or_close() -> None:
    session = Mock()
    session.execute.return_value.scalars.return_value = []

    assert (
        IdempotencyRecordRepository().find_by_hashes(
            session,
            scope="fixture_ingest",
            key_hashes=(b"x" * 32,),
        )
        == []
    )
    session.commit.assert_not_called()
    session.rollback.assert_not_called()
    session.close.assert_not_called()


def test_audit_repository_only_appends_to_caller_session() -> None:
    session = Mock()
    event = OperationalAuditEvent(
        event_type="IDEMPOTENCY_CONFLICT",
        actor_type="SYSTEM_IDEMPOTENCY",
        subject_type="IDEMPOTENCY_RECORD",
        subject_id=uuid4(),
        operation="ingest_fixture",
        outcome="CONFLICT",
        occurred_at=datetime.now(UTC),
        audit_metadata={"attempt_count": 1},
    )

    OperationalAuditEventRepository().add(session, event)

    session.add.assert_called_once_with(event)
    session.commit.assert_not_called()
    session.close.assert_not_called()
