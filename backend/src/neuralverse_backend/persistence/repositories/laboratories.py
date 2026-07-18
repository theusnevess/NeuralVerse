"""SQLAlchemy-backed laboratory repository."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from datetime import UTC, datetime
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session

from neuralverse_backend.domain.laboratories import (
    LaboratoryEvidence,
    LaboratoryEvidenceId,
    LaboratoryRun,
    LaboratoryRunId,
    LaboratoryRunStatus,
    LaboratorySpec,
    LaboratorySpecId,
)
from neuralverse_backend.persistence.models.laboratories import (
    LaboratoryEvidenceRecord,
    LaboratoryRunRecord,
    LaboratorySpecRecord,
)


class SqlAlchemyLaboratoryRepository:
    """Implements LaboratoryRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_spec_by_id(self, spec_id: LaboratorySpecId) -> LaboratorySpec | None:
        record = self._session.get(LaboratorySpecRecord, UUID(str(spec_id)))
        if record is None:
            return None
        return LaboratorySpec(
            spec_id=LaboratorySpecId(_value=str(record.laboratory_spec_id)),
            version=record.version,
            title=record.title,
            description=record.description,
        )

    async def save_spec(self, spec: LaboratorySpec) -> None:
        record = self._session.get(LaboratorySpecRecord, UUID(str(spec.id)))
        if record is None:
            record = LaboratorySpecRecord(
                laboratory_spec_id=UUID(str(spec.id)),
                version=spec.version,
                title=spec.title,
                description=spec.description,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.title = spec.title
            record.description = spec.description
        self._session.flush()

    async def get_run_by_id(self, run_id: LaboratoryRunId) -> LaboratoryRun | None:
        record = self._session.get(LaboratoryRunRecord, UUID(str(run_id)))
        if record is None:
            return None
        return self._reconstruct_run(record)

    async def save_run(self, run: LaboratoryRun) -> None:
        record = self._session.get(LaboratoryRunRecord, UUID(str(run.id)))
        if record is None:
            record = LaboratoryRunRecord(
                laboratory_run_id=UUID(str(run.id)),
                laboratory_spec_id=UUID(str(run.spec_id)),
                laboratory_spec_version=run.spec_version,
                learner_id=run.learner_id,
                status=run.status.value,
                inputs=run.inputs,
                outputs=run.outputs,
                evidence_ids=[str(e) for e in run.evidence_ids],
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.status = run.status.value
            record.inputs = run.inputs
            record.outputs = run.outputs
            record.evidence_ids = [str(e) for e in run.evidence_ids]
        self._session.flush()

    async def save_evidence(self, evidence: LaboratoryEvidence) -> None:
        record = self._session.get(LaboratoryEvidenceRecord, UUID(str(evidence.id)))
        if record is None:
            record = LaboratoryEvidenceRecord(
                laboratory_evidence_id=UUID(str(evidence.id)),
                laboratory_run_id=UUID(str(evidence.run_id)),
                evidence_type=evidence.evidence_type,
                content_hash=evidence.content_hash,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        self._session.flush()

    def _reconstruct_run(self, record: LaboratoryRunRecord) -> LaboratoryRun:
        evidence_values = (
            cast(Iterable[object], record.evidence_ids)
            if isinstance(record.evidence_ids, Iterable)
            else ()
        )
        return LaboratoryRun(
            run_id=LaboratoryRunId(_value=str(record.laboratory_run_id)),
            spec_id=LaboratorySpecId(_value=str(record.laboratory_spec_id)),
            spec_version=record.laboratory_spec_version,
            learner_id=record.learner_id,
            status=LaboratoryRunStatus(record.status),
            inputs=dict(record.inputs) if isinstance(record.inputs, Mapping) else {},
            outputs=dict(record.outputs) if isinstance(record.outputs, Mapping) else {},
            evidence_ids=tuple(
                LaboratoryEvidenceId(_value=str(e))
                for e in evidence_values
            ),
        )
