"""SQLAlchemy-backed governance repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from neuralverse_backend.domain.governance import (
    GovernanceReview,
    GovernanceReviewId,
    ReviewDecision,
    RevisionDirective,
    RevisionDirectiveId,
)
from neuralverse_backend.domain.shared.identifiers import ContentVersionId
from neuralverse_backend.persistence.models.governance import (
    GovernanceReviewRecord,
    RevisionDirectiveRecord,
)


class SqlAlchemyGovernanceRepository:
    """Implements GovernanceRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_review_by_id(self, review_id: GovernanceReviewId) -> GovernanceReview | None:
        record = self._session.get(GovernanceReviewRecord, UUID(str(review_id)))
        if record is None:
            return None
        return self._reconstruct_review(record)

    async def save_review(self, review: GovernanceReview) -> None:
        record = self._session.get(GovernanceReviewRecord, UUID(str(review.id)))
        if record is None:
            record = GovernanceReviewRecord(
                governance_review_id=UUID(str(review.id)),
                target_version_id=UUID(str(review.target_version_id)),
                review_authority=review.review_authority,
                decision=review.decision.value,
                findings=list(review.findings),
                evidence_references=list(review.evidence_references),
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.decision = review.decision.value
            record.findings = list(review.findings)
            record.evidence_references = list(review.evidence_references)
        self._session.flush()

    async def save_directive(self, directive: RevisionDirective) -> None:
        record = self._session.get(RevisionDirectiveRecord, UUID(str(directive.id)))
        if record is None:
            record = RevisionDirectiveRecord(
                revision_directive_id=UUID(str(directive.id)),
                governance_review_id=None,
                source_content_version_id=UUID(str(directive.target_version_id)),
                target_content_package_id=None,
                reason=directive.reason,
                required_changes=list(directive.required_changes),
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.reason = directive.reason
            record.required_changes = list(directive.required_changes)
        self._session.flush()

    async def get_directive_by_id(
        self, directive_id: RevisionDirectiveId
    ) -> RevisionDirective | None:
        record = self._session.get(RevisionDirectiveRecord, UUID(str(directive_id)))
        if record is None:
            return None
        return self._reconstruct_directive(record)

    def _reconstruct_review(self, record: GovernanceReviewRecord) -> GovernanceReview:
        return GovernanceReview(
            review_id=GovernanceReviewId(_value=str(record.governance_review_id)),
            target_version_id=ContentVersionId(_value=str(record.target_version_id)),
            review_authority=record.review_authority,
            decision=ReviewDecision(record.decision),
            findings=tuple(record.findings) if record.findings else (),
            evidence_references=tuple(record.evidence_references)
            if record.evidence_references
            else (),
        )

    def _reconstruct_directive(self, record: RevisionDirectiveRecord) -> RevisionDirective:
        return RevisionDirective(
            directive_id=RevisionDirectiveId(_value=str(record.revision_directive_id)),
            target_version_id=ContentVersionId(_value=str(record.source_content_version_id)),
            reason=record.reason,
            required_changes=tuple(record.required_changes) if record.required_changes else (),
        )
