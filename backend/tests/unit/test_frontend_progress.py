from datetime import UTC, datetime
from types import SimpleNamespace

from neuralverse_backend.interfaces.http.frontend_progress import (
    SCHEMA_NAME,
    SCHEMA_VERSION,
    _parse_last_event_id,
    _safe_event_payload,
    _sse,
)


def test_frontend_progress_payload_is_versioned_and_sanitized() -> None:
    job = SimpleNamespace(package_id="package:1")
    event = SimpleNamespace(
        workflow_id="workflow:1",
        generation_job_id="job:1",
        sequence=4,
        workflow_state="RUNNING",
        workflow_stage="CURRICULUM",
        occurred_at=datetime(2026, 7, 20, tzinfo=UTC),
        event_metadata={"retryable": False, "private_payload": "must-not-leak"},
    )
    payload = _safe_event_payload(job, event)
    assert payload == {
        "schema_name": SCHEMA_NAME,
        "schema_version": SCHEMA_VERSION,
        "workflow_id": "workflow:1",
        "generation_job_id": "job:1",
        "package_id": "package:1",
        "event_id": "4",
        "status": "RUNNING",
        "phase": "CURRICULUM",
        "timestamp": "2026-07-20T00:00:00+00:00",
        "terminal": False,
        "retryable": False,
        "safe_error_code": None,
    }
    assert "private_payload" not in _sse(payload)


def test_last_event_id_is_bounded_and_replayable() -> None:
    assert _parse_last_event_id(None) == 0
    assert _parse_last_event_id("4") == 4
