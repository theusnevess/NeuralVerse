"""Governance domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.events import DomainEvent
from ..shared.identifiers import ContentVersionId, GovernanceReviewId, RevisionDirectiveId

if TYPE_CHECKING:
    pass


class ReviewDecision(Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUIRED = "revision_required"


class GovernanceReview(Entity):
    """A governance review of content."""

    def __init__(
        self,
        *,
        review_id: GovernanceReviewId,
        target_version_id: ContentVersionId,
        review_authority: str,
        decision: ReviewDecision,
        findings: tuple[str, ...] = (),
        evidence_references: tuple[str, ...] = (),
    ) -> None:
        super().__init__(id=review_id)
        self.target_version_id = target_version_id
        self.review_authority = review_authority
        self.decision = decision
        self.findings = findings
        self.evidence_references = evidence_references


class GovernanceReviewCompleted(DomainEvent):
    def __init__(
        self,
        *,
        review_id: GovernanceReviewId,
        target_version_id: ContentVersionId,
        decision: ReviewDecision,
        **kwargs,
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.review_id = review_id
        self.target_version_id = target_version_id
        self.decision = decision

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update(
            {
                "review_id": str(self.review_id),
                "target_version_id": str(self.target_version_id),
                "decision": self.decision.value,
            }
        )
        return base


class RevisionDirective(Entity):
    """Explicit instruction to create a new revision."""

    def __init__(
        self,
        *,
        directive_id: RevisionDirectiveId,
        target_version_id: ContentVersionId,
        reason: str = "",
        required_changes: tuple[str, ...] = (),
    ) -> None:
        super().__init__(id=directive_id)
        self.target_version_id = target_version_id
        self.reason = reason
        self.required_changes = required_changes
