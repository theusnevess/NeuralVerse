"""Semantic-free ACP and publication activity boundaries."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field
from typing import Any, Protocol

from neuralverse_backend.bip_m4.domain import ActivityFailure, FailureClass


@dataclass(frozen=True, slots=True)
class ACPExecutionRequest:
    canonical_agent_id: str
    execution_id: str
    generation_job_id: str
    package_id: str
    contract_versions: tuple[str, ...]
    payload: Mapping[str, Any]
    idempotency_key: str
    correlation_id: str | None = None

    def __post_init__(self) -> None:
        if not self.canonical_agent_id.strip() or not self.execution_id.strip():
            raise ValueError("ACP execution identity is required")
        if not self.contract_versions:
            raise ValueError("at least one contract version is required")


@dataclass(frozen=True, slots=True)
class ACPExecutionResult:
    execution_id: str
    canonical_agent_id: str
    status: str
    contribution_id: str | None
    payload: Mapping[str, Any] = field(default_factory=dict)
    warnings: tuple[str, ...] = ()
    confidence: float | None = None
    unknown_fields: tuple[str, ...] = ()


class ACPExecutor(Protocol):
    def execute(self, request: ACPExecutionRequest) -> ACPExecutionResult: ...


class ACPExecutionAdapter:
    """Calls the ACP boundary without selecting or interpreting agent semantics."""

    def __init__(self, executor: ACPExecutor | None = None) -> None:
        self._executor = executor

    def invoke(self, request: ACPExecutionRequest) -> ACPExecutionResult:
        if self._executor is None:
            raise ActivityFailure(
                FailureClass.MANUAL_REVIEW_REQUIRED,
                "ACP_RUNTIME_UNAVAILABLE",
                "The ACP semantic runtime is not configured.",
                generation_job_id=request.generation_job_id,
                activity_id="acp-execution",
            )
        result = self._executor.execute(request)
        if result.execution_id != request.execution_id:
            raise ActivityFailure(
                FailureClass.NON_RETRYABLE,
                "ACP_EXECUTION_ID_MISMATCH",
                "ACP returned a result for a different execution.",
                generation_job_id=request.generation_job_id,
                activity_id="acp-execution",
            )
        if result.canonical_agent_id != request.canonical_agent_id:
            raise ActivityFailure(
                FailureClass.NON_RETRYABLE,
                "ACP_AGENT_ID_MISMATCH",
                "ACP returned a result for a different canonical agent.",
                generation_job_id=request.generation_job_id,
                activity_id="acp-execution",
            )
        return result


class FakeACPExecutor:
    """Controlled executor for BIP-M4 tests; never represents live ACP."""

    def __init__(self, *, status: str = "ACCEPTED") -> None:
        self.status = status
        self.requests: list[ACPExecutionRequest] = []

    def execute(self, request: ACPExecutionRequest) -> ACPExecutionResult:
        self.requests.append(request)
        return ACPExecutionResult(
            execution_id=request.execution_id,
            canonical_agent_id=request.canonical_agent_id,
            status=self.status,
            contribution_id=f"contribution:{request.idempotency_key}",
            payload={"operational_status": self.status},
        )


class PublicationService(Protocol):
    def publish(self, request: Mapping[str, Any]) -> Mapping[str, Any]: ...


class PublicationActivityAdapter:
    """Operational wrapper around the existing BIP-M3 transaction service."""

    def __init__(self, service: PublicationService | None = None) -> None:
        self._service = service

    def execute(self, request: Mapping[str, Any]) -> Mapping[str, Any]:
        if self._service is None:
            raise ActivityFailure(
                FailureClass.PUBLICATION_WAIT,
                "PUBLICATION_SERVICE_UNAVAILABLE",
                "BIP-M3 publication service is not configured.",
                activity_id="publication",
            )
        return self._service.publish(request)
