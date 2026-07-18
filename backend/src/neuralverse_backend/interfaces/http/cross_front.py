from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any, cast
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field

from neuralverse_backend.canonical_input import CanonicalInputResult, readCanonicalInput
from neuralverse_backend.canonical_persistence import CanonicalPersistenceService
from neuralverse_backend.cross_front.envelope import CrossFrontEnvelope, CrossFrontEnvelopeError
from neuralverse_backend.cross_front.workflow import (
    CrossFrontWorkflowService,
    WorkflowExecution,
    WorkflowIdempotencyConflict,
)


class CrossFrontEnvelopeBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    metadata: dict[str, Any]
    payload: Any


class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    command_id: str
    status: str
    attempts: int = Field(ge=1)
    result: dict[str, Any]

    @classmethod
    def from_execution(cls, execution: WorkflowExecution) -> WorkflowExecutionResponse:
        return cls(
            execution_id=execution.execution_id,
            command_id=execution.command_id,
            status=execution.status.value,
            attempts=execution.attempts,
            result=execution.result,
        )


router = APIRouter(prefix="/cross-front", tags=["cross-front"])


@router.post("/canonical-input", status_code=status.HTTP_200_OK)
async def ingest_canonical_input(request: Request) -> dict[str, Any]:
    """Validate and durably enqueue canonical ACP output."""
    idempotency_key = request.headers.get("Idempotency-Key")
    authoring_job_header = request.headers.get("Authoring-Job-ID")
    if not idempotency_key:
        raise HTTPException(
            status_code=400,
            detail={"code": "PERSISTENCE_FAILURE", "message": "Idempotency-Key is required."},
        )
    reader = cast(
        Callable[[bytes], CanonicalInputResult],
        getattr(request.app.state, "canonical_input_reader", readCanonicalInput),
    )
    result = reader(await request.body())
    if not result.accepted or result.intake is None:
        failure = result.failure
        raise HTTPException(
            status_code=422,
            detail={
                "code": failure.code.value if failure else "UNEXPECTED_INTAKE_FAILURE",
                "message": failure.message if failure else "canonical intake failed",
            },
        )
    intake = result.intake
    service = getattr(request.app.state, "canonical_persistence_service", None)
    if service is None:
        runtime = getattr(request.app.state, "persistence_runtime", None)
        session_factory = getattr(runtime, "session_factory", None)
        if session_factory is None:
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "PERSISTENCE_FAILURE",
                    "message": "Canonical intake persistence is not configured.",
                },
            )
        service = CanonicalPersistenceService(session_factory)
    try:
        requested_job_id = UUID(authoring_job_header) if authoring_job_header else None
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail={"code": "PERSISTENCE_FAILURE", "message": "Authoring-Job-ID is invalid."},
        ) from error
    if requested_job_id is None:
        persisted = service.accept(intake, idempotency_key=idempotency_key)
    else:
        persisted = service.accept(
            intake,
            idempotency_key=idempotency_key,
            authoring_job_id=requested_job_id,
        )
    if not persisted.accepted or persisted.response is None:
        persistence_failure = persisted.failure
        raise HTTPException(
            status_code=409
            if persistence_failure and persistence_failure.code == "IDEMPOTENCY_CONFLICT"
            else 503,
            detail={
                "code": persistence_failure.code if persistence_failure else "PERSISTENCE_FAILURE",
                "message": persistence_failure.message
                if persistence_failure
                else "Canonical intake persistence failed.",
            },
        )
    response = persisted.response
    return {
        "canonical_input_id": str(response.canonical_input_id),
        "authoring_job_id": str(response.authoring_job_id),
        "artifact_fingerprint": response.artifact_fingerprint,
        "contract_name": response.contract_name,
        "contract_version": response.contract_version,
        "persistence_status": response.persistence_status,
        "workflow_dispatch_status": response.workflow_dispatch_status,
        "idempotency_status": response.idempotency_status,
        "replayed": response.replayed,
    }


@router.post(
    "/nv-xfi-000",
    response_model=WorkflowExecutionResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def ingest_nv_xfi_000(
    body: CrossFrontEnvelopeBody,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> WorkflowExecutionResponse:
    if not idempotency_key:
        raise HTTPException(status_code=400, detail="Idempotency-Key is required.")
    service = cast(
        CrossFrontWorkflowService | None,
        getattr(request.app.state, "cross_front_workflow_service", None),
    )
    if service is None:
        raise HTTPException(status_code=503, detail="Cross-front workflow is not configured.")
    try:
        envelope = CrossFrontEnvelope(metadata=body.metadata, payload=body.payload)
        execution = service.submit(
            envelope, command_id=idempotency_key, occurred_at=datetime.now(UTC)
        )
    except CrossFrontEnvelopeError as error:
        raise HTTPException(
            status_code=422,
            detail={"code": error.code, "message": str(error)},
        ) from error
    except WorkflowIdempotencyConflict as error:
        raise HTTPException(
            status_code=409,
            detail={"code": "IDEMPOTENCY_CONFLICT", "message": str(error)},
        ) from error
    return WorkflowExecutionResponse.from_execution(execution)
