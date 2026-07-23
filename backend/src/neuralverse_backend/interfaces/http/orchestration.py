from __future__ import annotations

from typing import Any, cast

from fastapi import APIRouter, Header, Query, Request, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict, Field

from neuralverse_backend.interfaces.http.errors import ApplicationError
from neuralverse_backend.orchestration import OrchestrationError, OrchestrationService, sse_line


class GenerationStartRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    command_id: str = Field(min_length=1, max_length=255)
    idempotency_key: str = Field(min_length=1, max_length=512)
    curriculum_identity: str = Field(min_length=1, max_length=512)
    requested_package_type: str = Field(min_length=1, max_length=128)
    maximum_revision_cycles: int = Field(default=0, ge=0, le=10)
    correlation_id: str = Field(default="", max_length=255)


class CommandRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    command_id: str = Field(min_length=1, max_length=255)
    idempotency_key: str = Field(min_length=1, max_length=512)


class HumanReviewRequest(CommandRequest):
    governance_review_id: str = Field(min_length=1, max_length=255)
    expected_workflow_revision: int = Field(ge=0)
    decision: str = Field(min_length=1, max_length=32)
    reviewer_identity_reference: str = Field(min_length=1, max_length=255)
    rationale: str = Field(default="", max_length=2000)
    correlation_id: str = Field(default="", max_length=255)


class RevisionDirectiveRequest(CommandRequest):
    revision_directive_id: str = Field(min_length=1, max_length=255)
    affected_targets: list[str] = Field(min_length=1, max_length=32)
    required_changes: list[str] = Field(min_length=1, max_length=64)
    expected_workflow_revision: int = Field(ge=0)
    correlation_id: str = Field(default="", max_length=255)


class PublicationCommandRequest(CommandRequest):
    workflow_id: str = Field(min_length=1, max_length=255)
    expected_workflow_revision: int = Field(ge=0)
    learning_package_draft_reference: str = Field(min_length=1, max_length=512)
    readiness_recommendation_reference: str = Field(min_length=1, max_length=512)
    actor_identity_reference: str = Field(min_length=1, max_length=255)
    correlation_id: str = Field(default="", max_length=255)


class CancellationRequest(CommandRequest):
    actor_identity_reference: str = Field(min_length=1, max_length=255)
    correlation_id: str = Field(default="", max_length=255)


router = APIRouter(prefix="/orchestration/v1", tags=["orchestration"])


def _service(request: Request) -> OrchestrationService:
    service = getattr(request.app.state, "orchestration_service", None)
    if service is None:
        raise ApplicationError(
            "WORKFLOW_START_FAILURE",
            "orchestration persistence is not configured",
            status_code=503,
            retryable=True,
        )
    return cast(OrchestrationService, service)


def _raise(error: OrchestrationError) -> None:
    status_code = (
        409
        if "CONFLICT" in error.code or error.code == "WORKFLOW_STATE_CONFLICT"
        else 503
        if error.retryable
        else 400
    )
    raise ApplicationError(
        error.code, str(error), status_code=status_code, retryable=error.retryable
    ) from error


@router.post("/generation-jobs", status_code=202)
def start_generation(body: GenerationStartRequest, request: Request) -> dict[str, Any]:
    try:
        return _service(request).start(body.model_dump())
    except OrchestrationError as error:
        _raise(error)
    raise AssertionError("unreachable")


@router.get("/generation-jobs/{generation_job_id}")
def get_generation_job(generation_job_id: str, request: Request) -> dict[str, Any]:
    try:
        return _service(request).status(generation_job_id)
    except OrchestrationError as error:
        _raise(error)
    raise AssertionError("unreachable")


@router.get("/generation-jobs/{generation_job_id}/history")
def get_history(
    generation_job_id: str,
    request: Request,
    after_sequence: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
) -> dict[str, Any]:
    try:
        return {
            "generation_job_id": generation_job_id,
            "events": _service(request).history(
                generation_job_id, after_sequence=after_sequence, limit=limit
            ),
        }
    except OrchestrationError as error:
        _raise(error)
    raise AssertionError("unreachable")


@router.post("/generation-jobs/{generation_job_id}/reconcile")
async def reconcile(generation_job_id: str, request: Request) -> dict[str, Any]:
    try:
        return await _service(request).reconcile(generation_job_id)
    except OrchestrationError as error:
        _raise(error)
    raise AssertionError("unreachable")


@router.get("/generation-jobs/{generation_job_id}/events")
async def events(
    generation_job_id: str,
    request: Request,
    last_event_id: str | None = Header(default=None, alias="Last-Event-ID"),
) -> Response:
    if last_event_id is not None:
        try:
            after_sequence = int(last_event_id)
        except ValueError as error:
            raise ApplicationError(
                "PROGRESS_SEQUENCE_CONFLICT", "Last-Event-ID must be an integer"
            ) from error
        if after_sequence < 0:
            raise ApplicationError(
                "PROGRESS_SEQUENCE_CONFLICT", "Last-Event-ID must not be negative"
            )
    else:
        after_sequence = 0
    service = _service(request)
    try:
        first_sequence, _ = service.replay_bounds(generation_job_id)
    except OrchestrationError as error:
        _raise(error)
    if after_sequence and first_sequence and after_sequence < first_sequence - 1:
        raise ApplicationError(
            "PROGRESS_REPLAY_WINDOW_EXCEEDED",
            "requested progress sequence is older than the retained replay window",
            status_code=409,
        )

    async def body() -> Any:
        yield ": keepalive\n\n"
        async for event in service.stream(generation_job_id, after_sequence):
            if event.get("keepalive"):
                yield ": keepalive\n\n"
                continue
            yield sse_line(event)
            if await request.is_disconnected():
                break

    return StreamingResponse(
        body(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def _command(
    operation: str, generation_job_id: str, body: BaseModel, request: Request
) -> dict[str, Any]:
    try:
        return await _service(request).command(operation, generation_job_id, body.model_dump())
    except OrchestrationError as error:
        _raise(error)
    raise AssertionError("unreachable")


@router.post("/generation-jobs/{generation_job_id}/human-review")
async def human_review(
    generation_job_id: str, body: HumanReviewRequest, request: Request
) -> dict[str, Any]:
    return await _command("HUMAN_REVIEW", generation_job_id, body, request)


@router.post("/generation-jobs/{generation_job_id}/revision-directives")
async def revision(
    generation_job_id: str, body: RevisionDirectiveRequest, request: Request
) -> dict[str, Any]:
    return await _command("REVISION_DIRECTIVE", generation_job_id, body, request)


@router.post("/generation-jobs/{generation_job_id}/publication-command")
async def publication(
    generation_job_id: str, body: PublicationCommandRequest, request: Request
) -> dict[str, Any]:
    return await _command("PUBLICATION_COMMAND", generation_job_id, body, request)


@router.post("/generation-jobs/{generation_job_id}/cancel")
async def cancel(
    generation_job_id: str, body: CancellationRequest, request: Request
) -> dict[str, Any]:
    return await _command("CANCEL", generation_job_id, body, request)
