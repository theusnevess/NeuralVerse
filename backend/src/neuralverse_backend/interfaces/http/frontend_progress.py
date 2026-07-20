"""Frontend-safe workflow progress projection.

This endpoint deliberately reads the durable BIP-M4 projection only.  It never
exposes Temporal history, activity payloads or raw agent output.
"""

from __future__ import annotations

import json
from collections.abc import Iterable
from typing import Any, cast

from fastapi import APIRouter, Header, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from neuralverse_backend.interfaces.http.errors import ApplicationError
from neuralverse_backend.persistence.models import (
    BIPM4GenerationJobRecord,
    BIPM4WorkflowProgressEventRecord,
)

SCHEMA_NAME = "WorkflowProgressEvent"
SCHEMA_VERSION = "1.0.0"
MAX_REPLAY = 1000
TERMINAL_STATES = frozenset({"SUCCEEDED", "FAILED", "CANCELLED"})

router = APIRouter(prefix="/orchestration/v1/frontend", tags=["frontend-progress"])


def _parse_last_event_id(value: str | None) -> int:
    if value is None or value == "":
        return 0
    try:
        sequence = int(value)
    except ValueError as error:
        raise ApplicationError(
            "PROGRESS_SEQUENCE_CONFLICT", "Last-Event-ID must be an integer"
        ) from error
    if sequence < 0:
        raise ApplicationError(
            "PROGRESS_SEQUENCE_CONFLICT", "Last-Event-ID must not be negative"
        )
    return sequence


def _safe_event_payload(
    job: BIPM4GenerationJobRecord,
    event: BIPM4WorkflowProgressEventRecord,
) -> dict[str, Any]:
    metadata = cast(dict[str, Any], event.event_metadata or {})
    retryable = bool(metadata.get("retryable", metadata.get("failure_retryable", False)))
    return {
        "schema_name": SCHEMA_NAME,
        "schema_version": SCHEMA_VERSION,
        "workflow_id": event.workflow_id,
        "generation_job_id": event.generation_job_id,
        "package_id": job.package_id,
        "event_id": str(event.sequence),
        "status": event.workflow_state,
        "phase": event.workflow_stage,
        "timestamp": event.occurred_at.isoformat(),
        "terminal": event.workflow_state.upper() in TERMINAL_STATES,
        "retryable": retryable,
        "safe_error_code": (
            metadata.get("error_code")
            if isinstance(metadata.get("error_code"), str)
            else None
        ),
    }


def _sse(payload: dict[str, Any]) -> str:
    return (
        f"id: {payload['event_id']}\n"
        "event: workflow.progress\n"
        f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"
    )


def _load_replay(
    request: Request,
    generation_job_id: str,
    after_sequence: int,
    viewer_identity: str | None,
) -> list[str]:
    runtime = getattr(request.app.state, "persistence_runtime", None)
    factory = getattr(runtime, "session_factory", None)
    if factory is None:
        raise ApplicationError(
            "WORKFLOW_PROGRESS_UNAVAILABLE",
            "workflow progress persistence is not configured",
            status_code=503,
            retryable=True,
        )
    if not viewer_identity or len(viewer_identity) > 255:
        raise ApplicationError(
            "WORKFLOW_PROGRESS_UNAUTHORIZED",
            "workflow viewer identity is required",
            status_code=401,
        )
    with factory() as session:
        job = session.scalar(
            select(BIPM4GenerationJobRecord).where(
                BIPM4GenerationJobRecord.generation_job_id == generation_job_id
            )
        )
        if job is None:
            raise ApplicationError(
                "WORKFLOW_NOT_FOUND",
                "generation job was not found",
                status_code=404,
            )
        if str(job.requested_by) != viewer_identity:
            raise ApplicationError(
                "WORKFLOW_PROGRESS_UNAUTHORIZED",
                "workflow viewer is not authorized",
                status_code=403,
            )
        first = session.scalar(
            select(BIPM4WorkflowProgressEventRecord.sequence)
            .where(BIPM4WorkflowProgressEventRecord.generation_job_id == generation_job_id)
            .order_by(BIPM4WorkflowProgressEventRecord.sequence)
            .limit(1)
        )
        if first is not None and after_sequence and after_sequence < int(first) - 1:
            raise ApplicationError(
                "PROGRESS_REPLAY_WINDOW_EXCEEDED",
                "requested progress sequence is older than the retained replay window",
                status_code=409,
            )
        events = session.scalars(
            select(BIPM4WorkflowProgressEventRecord)
            .where(
                BIPM4WorkflowProgressEventRecord.generation_job_id == generation_job_id,
                BIPM4WorkflowProgressEventRecord.sequence > after_sequence,
            )
            .order_by(BIPM4WorkflowProgressEventRecord.sequence)
            .limit(MAX_REPLAY)
        ).all()
        return [_sse(_safe_event_payload(job, event)) for event in events]


@router.get("/generation-jobs/{generation_job_id}/events")
def events(
    generation_job_id: str,
    request: Request,
    last_event_id: str | None = Header(default=None, alias="Last-Event-ID"),
    viewer_identity: str | None = Header(default=None, alias="X-NV-Viewer-Identity"),
) -> StreamingResponse:
    replay = _load_replay(
        request,
        generation_job_id,
        _parse_last_event_id(last_event_id),
        viewer_identity,
    )

    def body() -> Iterable[str]:
        yield ": keepalive\n\n"
        yield from replay

    return StreamingResponse(
        body(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
