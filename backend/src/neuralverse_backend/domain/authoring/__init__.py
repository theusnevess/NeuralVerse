"""Authoring domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.events import DomainEvent
from ..shared.identifiers import (
    AgentContributionId,
    AgentId,
    AgentRunId,
    ContentPackageId,
    GenerationJobId,
    ValidationResultId,
    WorkflowId,
)

if TYPE_CHECKING:
    pass


class GenerationJobStatus(Enum):
    CREATED = "created"
    WAITING_FOR_INPUTS = "waiting_for_inputs"
    INPUTS_AVAILABLE = "inputs_available"
    READY_FOR_AUTHORING = "ready_for_authoring"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ContributionStatus(Enum):
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    VALIDATION_PENDING = "validation_pending"


class SeverityLevel(Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


# --- Domain Events ---


class GenerationJobCreated(DomainEvent):
    def __init__(self, *, job_id: GenerationJobId, package_id: ContentPackageId, **kwargs) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.job_id = job_id
        self.package_id = package_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({"job_id": str(self.job_id), "package_id": str(self.package_id)})
        return base


class GenerationJobFailed(DomainEvent):
    def __init__(self, *, job_id: GenerationJobId, reason: str, **kwargs) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.job_id = job_id
        self.reason = reason

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({"job_id": str(self.job_id), "reason": self.reason})
        return base


# --- Entities ---


class GenerationJob(Entity):
    """Represents a generation job targeting a content package."""

    def __init__(
        self,
        *,
        job_id: GenerationJobId,
        package_id: ContentPackageId,
        workflow_id: WorkflowId | None = None,
        status: GenerationJobStatus = GenerationJobStatus.CREATED,
        revision: int = 0,
        requested_operation: str = "",
    ) -> None:
        super().__init__(id=job_id)
        self.package_id = package_id
        self.workflow_id = workflow_id
        self.status = status
        self.revision = revision
        self.requested_operation = requested_operation

    def fail(self, reason: str) -> None:
        self.status = GenerationJobStatus.FAILED

    def start(self) -> None:
        if self.status not in (
            GenerationJobStatus.READY_FOR_AUTHORING,
            GenerationJobStatus.INPUTS_AVAILABLE,
        ):
            raise InvariantViolation(
                f"Cannot start job in status {self.status.value}",
                invariant="valid_status_transition",
            )
        self.status = GenerationJobStatus.IN_PROGRESS

    def complete(self) -> None:
        self.status = GenerationJobStatus.COMPLETED


class AgentRun(Entity):
    """One execution of an agent within a generation job."""

    def __init__(
        self,
        *,
        run_id: AgentRunId,
        job_id: GenerationJobId,
        agent_id: AgentId,
    ) -> None:
        super().__init__(id=run_id)
        self.job_id = job_id
        self.agent_id = agent_id


class AgentContribution(Entity):
    """An accepted contribution from an agent run."""

    def __init__(
        self,
        *,
        contribution_id: AgentContributionId,
        job_id: GenerationJobId,
        run_id: AgentRunId,
        package_id: ContentPackageId,
        status: ContributionStatus = ContributionStatus.PROPOSED,
        dependencies: tuple[AgentContributionId, ...] = (),
        validation_result_ids: tuple[ValidationResultId, ...] = (),
        artifact_reference: str = "",
    ) -> None:
        super().__init__(id=contribution_id)
        self.job_id = job_id
        self.run_id = run_id
        self.package_id = package_id
        self.status = status
        self.dependencies = dependencies
        self.validation_result_ids = validation_result_ids
        self.artifact_reference = artifact_reference


class ValidationResult(Entity):
    """Result of validating a contribution."""

    def __init__(
        self,
        *,
        result_id: ValidationResultId,
        validator_id: str,
        result: str,
        severity: SeverityLevel,
        findings: tuple[str, ...] = (),
        is_blocking: bool = False,
        evidence_reference: str = "",
        affected_target: str = "",
    ) -> None:
        super().__init__(id=result_id)
        self.validator_id = validator_id
        self.result = result
        self.severity = severity
        self.findings = findings
        self.is_blocking = is_blocking
        self.evidence_reference = evidence_reference
        self.affected_target = affected_target
