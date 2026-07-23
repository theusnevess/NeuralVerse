from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from neuralverse_backend.orchestration import OrchestrationService, sse_line
from neuralverse_backend.persistence.models import (
    BIPM4CommandRecord,
    BIPM4WorkflowProgressEventRecord,
)


class Session:
    def __init__(self) -> None:
        self.added: list[Any] = []
        self.committed = False

    def scalar(self, statement: object) -> None:
        return None

    def add_all(self, records: list[object]) -> None:
        self.added.extend(records)

    def commit(self) -> None:
        self.committed = True

    def rollback(self) -> None:
        pass

    def close(self) -> None:
        pass


def request() -> dict[str, object]:
    return {
        "command_id": "command:1",
        "idempotency_key": "start:1",
        "curriculum_identity": "curriculum:1",
        "requested_package_type": "lesson",
        "maximum_revision_cycles": 2,
        "correlation_id": "correlation:1",
    }


def test_start_persists_projection_event_and_sanitized_start_outbox() -> None:
    session = Session()
    service = OrchestrationService(lambda: session, clock=lambda: datetime(2026, 1, 1, tzinfo=UTC))

    response = service.start(request())

    assert response["state"] == "RECEIVED"
    assert session.committed
    assert any(isinstance(item, BIPM4CommandRecord) for item in session.added)
    event = next(
        item for item in session.added if isinstance(item, BIPM4WorkflowProgressEventRecord)
    )
    assert event.event_type == "workflow.started"

    outbox = next(
        item
        for item in session.added
        if item.__class__.__name__ == "TransactionalOutboxEventRecord"
    )
    assert "request" not in outbox.payload
    assert "request_fingerprint" in outbox.payload


def test_sse_line_uses_monotonic_id_and_bounded_json() -> None:
    line = sse_line({"sequence": 4, "event_type": "activity.completed", "state": "RUNNING"})

    assert line.startswith("id: 4\nevent: activity.completed\ndata: {")
    assert line.endswith("\n\n")
