"""SQLAlchemy-backed authoring repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from neuralverse_backend.domain.authoring import (
    AgentContribution,
    AgentRun,
    GenerationJob,
    GenerationJobId,
    GenerationJobStatus,
    ValidationResult,
)
from neuralverse_backend.domain.shared.identifiers import ContentPackageId
from neuralverse_backend.persistence.models.authoring import (
    AgentContributionRecord,
    AgentRunRecord,
    DomainValidationResultRecord,
    GenerationJobRecord,
)


class SqlAlchemyAuthoringRepository:
    """Implements AuthoringRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_job_by_id(self, job_id: GenerationJobId) -> GenerationJob | None:
        record = self._session.get(GenerationJobRecord, UUID(str(job_id)))
        if record is None:
            return None
        return self._reconstruct_job(record)

    async def save_job(self, job: GenerationJob) -> None:
        record = self._session.get(GenerationJobRecord, UUID(str(job.id)))
        if record is None:
            record = GenerationJobRecord(
                generation_job_id=UUID(str(job.id)),
                target_content_package_id=UUID(str(job.package_id)),
                workflow_id=str(job.workflow_id) if job.workflow_id else None,
                status=job.status.value,
                revision=job.revision,
                requested_operation=job.requested_operation,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.status = job.status.value
            record.revision = job.revision
            record.requested_operation = job.requested_operation
            if job.workflow_id:
                record.workflow_id = str(job.workflow_id)
        self._session.flush()

    async def save_run(self, run: AgentRun) -> None:
        record = self._session.get(AgentRunRecord, UUID(str(run.id)))
        if record is None:
            record = AgentRunRecord(
                agent_run_id=UUID(str(run.id)),
                generation_job_id=UUID(str(run.job_id)),
                agent_identity=str(run.agent_id),
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        self._session.flush()

    async def save_contribution(self, contribution: AgentContribution) -> None:
        record = self._session.get(AgentContributionRecord, UUID(str(contribution.id)))
        if record is None:
            record = AgentContributionRecord(
                agent_contribution_id=UUID(str(contribution.id)),
                generation_job_id=UUID(str(contribution.job_id)),
                agent_run_id=UUID(str(contribution.run_id)),
                content_package_id=UUID(str(contribution.package_id)),
                status=contribution.status.value,
                dependency_references=[str(d) for d in contribution.dependencies],
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.status = contribution.status.value
        self._session.flush()

    async def save_validation_result(self, result: ValidationResult) -> None:
        record = self._session.get(DomainValidationResultRecord, UUID(str(result.id)))
        if record is None:
            record = DomainValidationResultRecord(
                validation_result_id=UUID(str(result.id)),
                validator_id=result.validator_id,
                result=result.result,
                severity=result.severity.value,
                is_blocking=result.is_blocking,
                findings=list(result.findings),
                evidence_reference=result.evidence_reference,
                affected_target=result.affected_target,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.result = result.result
            record.severity = result.severity.value
            record.is_blocking = result.is_blocking
            record.findings = list(result.findings)
        self._session.flush()

    def _reconstruct_job(self, record: GenerationJobRecord) -> GenerationJob:
        return GenerationJob(
            job_id=GenerationJobId(_value=str(record.generation_job_id)),
            package_id=ContentPackageId(_value=str(record.target_content_package_id)),
            workflow_id=None,
            status=GenerationJobStatus(record.status),
            revision=record.revision,
            requested_operation=record.requested_operation,
        )
