"""Laboratories domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.identifiers import LaboratoryEvidenceId, LaboratoryRunId, LaboratorySpecId

if TYPE_CHECKING:
    pass


class LaboratoryRunStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class LaboratorySpec(Entity):
    """Specification for a laboratory exercise."""

    def __init__(
        self,
        *,
        spec_id: LaboratorySpecId,
        version: str,
        title: str = "",
        description: str = "",
    ) -> None:
        super().__init__(id=spec_id)
        self.version = version
        self.title = title
        self.description = description


class LaboratoryRun(Entity):
    """A specific execution of a laboratory spec."""

    def __init__(
        self,
        *,
        run_id: LaboratoryRunId,
        spec_id: LaboratorySpecId,
        spec_version: str,
        learner_id: str | None = None,
        status: LaboratoryRunStatus = LaboratoryRunStatus.PENDING,
        inputs: dict | None = None,
        outputs: dict | None = None,
        evidence_ids: tuple[LaboratoryEvidenceId, ...] = (),
    ) -> None:
        super().__init__(id=run_id)
        self.spec_id = spec_id
        self.spec_version = spec_version
        self.learner_id = learner_id
        self.status = status
        self.inputs = inputs or {}
        self.outputs = outputs or {}
        self.evidence_ids = evidence_ids

    def complete(self, outputs: dict) -> None:
        if self.status != LaboratoryRunStatus.RUNNING:
            raise InvariantViolation(
                f"Cannot complete lab run in status {self.status.value}",
                invariant="valid_status_transition",
            )
        self.status = LaboratoryRunStatus.COMPLETED
        self.outputs = outputs

    def fail(self) -> None:
        self.status = LaboratoryRunStatus.FAILED

    def start(self) -> None:
        if self.status != LaboratoryRunStatus.PENDING:
            raise InvariantViolation(
                f"Cannot start lab run in status {self.status.value}",
                invariant="valid_status_transition",
            )
        self.status = LaboratoryRunStatus.RUNNING


class LaboratoryEvidence(Entity):
    """Evidence produced by a laboratory run."""

    def __init__(
        self,
        *,
        evidence_id: LaboratoryEvidenceId,
        run_id: LaboratoryRunId,
        evidence_type: str,
        content_hash: str = "",
    ) -> None:
        super().__init__(id=evidence_id)
        self.run_id = run_id
        self.evidence_type = evidence_type
        self.content_hash = content_hash
