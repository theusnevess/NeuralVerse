"""SQLAlchemy-backed assessment repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from neuralverse_backend.domain.assessments import (
    AssessmentAttempt,
    AssessmentAttemptId,
    AssessmentAttemptStatus,
    AssessmentEvidence,
    AssessmentEvidenceId,
    AssessmentSpec,
    AssessmentSpecId,
)
from neuralverse_backend.persistence.models.assessments import (
    AssessmentAttemptRecord,
    AssessmentEvidenceRecord,
    AssessmentSpecRecord,
)


class SqlAlchemyAssessmentRepository:
    """Implements AssessmentRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_spec_by_id(self, spec_id: AssessmentSpecId) -> AssessmentSpec | None:
        record = self._session.get(AssessmentSpecRecord, UUID(str(spec_id)))
        if record is None:
            return None
        return AssessmentSpec(
            spec_id=AssessmentSpecId(_value=str(record.assessment_spec_id)),
            version=record.version,
            title=record.title,
            description=record.description,
            max_score=record.max_score,
        )

    async def save_spec(self, spec: AssessmentSpec) -> None:
        record = self._session.get(AssessmentSpecRecord, UUID(str(spec.id)))
        if record is None:
            record = AssessmentSpecRecord(
                assessment_spec_id=UUID(str(spec.id)),
                version=spec.version,
                title=spec.title,
                description=spec.description,
                max_score=spec.max_score,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.title = spec.title
            record.description = spec.description
            record.max_score = spec.max_score
        self._session.flush()

    async def get_attempt_by_id(self, attempt_id: AssessmentAttemptId) -> AssessmentAttempt | None:
        record = self._session.get(AssessmentAttemptRecord, UUID(str(attempt_id)))
        if record is None:
            return None
        return self._reconstruct_attempt(record)

    async def save_attempt(self, attempt: AssessmentAttempt) -> None:
        record = self._session.get(AssessmentAttemptRecord, UUID(str(attempt.id)))
        if record is None:
            record = AssessmentAttemptRecord(
                assessment_attempt_id=UUID(str(attempt.id)),
                assessment_spec_id=UUID(str(attempt.spec_id)),
                assessment_spec_version=attempt.spec_version,
                learner_id=attempt.learner_id,
                status=attempt.status.value,
                responses=attempt.responses,
                evidence_ids=[str(e) for e in attempt.evidence_ids],
                score=attempt.score_value,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.status = attempt.status.value
            record.responses = attempt.responses
            record.evidence_ids = [str(e) for e in attempt.evidence_ids]
            record.score = attempt.score_value
        self._session.flush()

    async def save_evidence(self, evidence: AssessmentEvidence) -> None:
        record = self._session.get(AssessmentEvidenceRecord, UUID(str(evidence.id)))
        if record is None:
            record = AssessmentEvidenceRecord(
                assessment_evidence_id=UUID(str(evidence.id)),
                assessment_attempt_id=UUID(str(evidence.attempt_id)),
                evidence_type=evidence.evidence_type,
                content_hash=evidence.content_hash,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        self._session.flush()

    def _reconstruct_attempt(self, record: AssessmentAttemptRecord) -> AssessmentAttempt:
        return AssessmentAttempt(
            attempt_id=AssessmentAttemptId(_value=str(record.assessment_attempt_id)),
            spec_id=AssessmentSpecId(_value=str(record.assessment_spec_id)),
            spec_version=record.assessment_spec_version,
            learner_id=record.learner_id,
            status=AssessmentAttemptStatus(record.status),
            responses=dict(record.responses) if record.responses else {},
            evidence_ids=tuple(
                AssessmentEvidenceId(_value=str(e)) for e in (record.evidence_ids or [])
            ),
            score=record.score,
        )
