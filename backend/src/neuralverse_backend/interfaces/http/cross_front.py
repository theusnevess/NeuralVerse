from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any, cast

from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field

from neuralverse_backend.canonical_input import CanonicalInputResult, readCanonicalInput
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
    """Validate canonical ACP output before any workflow or persistence handoff."""
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
    return {
        "contract_name": intake.contract_name,
        "contract_version": intake.contract_version,
        "minimum_reader_version": intake.minimum_reader_version,
        "producer_version": intake.producer_version,
        "artifact_sha256": intake.artifact_sha256,
        "schema_hash": intake.schema_hash,
        "release_tag": intake.release_identity.tag,
        "release_commit": intake.release_identity.commit,
        "validation_result": intake.validation_result,
        "received_at": intake.received_at.isoformat(),
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
