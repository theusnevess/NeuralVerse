"""Assessments domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.identifiers import AssessmentAttemptId, AssessmentEvidenceId, AssessmentSpecId

if TYPE_CHECKING:
    pass


class AssessmentAttemptStatus(Enum):
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    SCORED = "scored"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AssessmentSpec(Entity):
    """Specification for an assessment."""

    def __init__(
        self,
        *,
        spec_id: AssessmentSpecId,
        version: str,
        title: str = "",
        description: str = "",
        max_score: float | None = None,
    ) -> None:
        super().__init__(id=spec_id)
        self.version = version
        self.title = title
        self.description = description
        self.max_score = max_score


class AssessmentAttempt(Entity):
    """A specific attempt at an assessment by a learner."""

    def __init__(
        self,
        *,
        attempt_id: AssessmentAttemptId,
        spec_id: AssessmentSpecId,
        spec_version: str,
        learner_id: str | None = None,
        status: AssessmentAttemptStatus = AssessmentAttemptStatus.IN_PROGRESS,
        responses: dict | None = None,
        evidence_ids: tuple[AssessmentEvidenceId, ...] = (),
        score: float | None = None,
    ) -> None:
        super().__init__(id=attempt_id)
        self.spec_id = spec_id
        self.spec_version = spec_version
        self.learner_id = learner_id
        self.status = status
        self.responses = responses or {}
        self.evidence_ids = evidence_ids
        self.score_value = score

    def submit(self) -> None:
        if self.status != AssessmentAttemptStatus.IN_PROGRESS:
            raise InvariantViolation(
                f"Cannot submit attempt in status {self.status.value}",
                invariant="valid_status_transition",
            )
        self.status = AssessmentAttemptStatus.SUBMITTED

    def apply_score(self, score: float) -> None:
        if self.status != AssessmentAttemptStatus.SUBMITTED:
            raise InvariantViolation(
                f"Cannot score attempt in status {self.status.value}",
                invariant="valid_status_transition",
            )
        self.status = AssessmentAttemptStatus.SCORED
        self.score_value = score

    def fail(self) -> None:
        self.status = AssessmentAttemptStatus.FAILED


class AssessmentEvidence(Entity):
    """Evidence produced by an assessment attempt."""

    def __init__(
        self,
        *,
        evidence_id: AssessmentEvidenceId,
        attempt_id: AssessmentAttemptId,
        evidence_type: str,
        content_hash: str = "",
    ) -> None:
        super().__init__(id=evidence_id)
        self.attempt_id = attempt_id
        self.evidence_type = evidence_type
        self.content_hash = content_hash
