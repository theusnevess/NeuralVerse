"""Persistence contracts used by Stage 13 adapters.

These records are deliberately storage-neutral.  A PostgreSQL implementation
can map them to the existing BIP-M7 tables and additive snapshots without
moving semantic authority into the Backend.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import UTC, datetime

from .assessment import AssessmentExecution
from .runtime import LaboratoryResult, Stage13ValidationError


@dataclass(frozen=True, slots=True)
class LaboratoryExecutionSnapshot:
    run_id: str
    learner_id: str
    spec_id: str
    spec_version: str
    simulation_id: str
    simulation_version: str
    adapter_id: str
    adapter_version: str
    seed: int
    input_payload_sha256: str
    state: str
    resource_policy_version: str
    environment_fingerprint: str
    created_at: datetime

    @classmethod
    def from_result(cls, result: LaboratoryResult) -> LaboratoryExecutionSnapshot:
        environment = result.environment
        fingerprint = hashlib.sha256(repr(environment).encode()).hexdigest()
        return cls(
            run_id=result.request.run_id,
            learner_id=result.request.learner_id,
            spec_id=result.request.laboratory_spec_id,
            spec_version=result.request.laboratory_spec_version,
            simulation_id=result.request.simulation_id,
            simulation_version=result.request.simulation_version,
            adapter_id=environment.adapter_id,
            adapter_version=environment.adapter_version,
            seed=result.seed,
            input_payload_sha256=result.input_payload_sha256,
            state=result.state.value,
            resource_policy_version=environment.resource_policy_version,
            environment_fingerprint=fingerprint,
            created_at=result.created_at,
        )


@dataclass(frozen=True, slots=True)
class AssessmentEvidenceRecord:
    evidence_id: str
    attempt_id: str
    learner_id: str
    specification_id: str
    specification_version: str
    verifier_id: str
    verifier_version: str
    result_hash: str
    created_at: datetime

    @classmethod
    def from_execution(
        cls, execution: AssessmentExecution, *, attempt_id: str, learner_id: str
    ) -> AssessmentEvidenceRecord:
        payload = (attempt_id, learner_id, execution.result_hash, execution.verifier_id)
        evidence_id = f"assessment-evidence:{hashlib.sha256(repr(payload).encode()).hexdigest()}"
        return cls(
            evidence_id=evidence_id,
            attempt_id=attempt_id,
            learner_id=learner_id,
            specification_id=execution.assessment_spec_id,
            specification_version=execution.assessment_spec_version,
            verifier_id=execution.verifier_id,
            verifier_version=execution.verifier_version,
            result_hash=execution.result_hash,
            created_at=datetime.now(UTC),
        )


class Stage13InMemoryStore:
    """Deterministic test double for durable idempotency and ownership checks."""

    def __init__(self) -> None:
        self.runs: dict[str, LaboratoryExecutionSnapshot] = {}
        self.assessment_evidence: dict[str, AssessmentEvidenceRecord] = {}
        self.idempotency: dict[str, str] = {}

    def save_run(self, result: LaboratoryResult) -> LaboratoryExecutionSnapshot:
        snapshot = LaboratoryExecutionSnapshot.from_result(result)
        existing = self.runs.get(snapshot.run_id)
        if existing is not None:
            if existing.input_payload_sha256 != snapshot.input_payload_sha256:
                raise Stage13ValidationError("laboratory run identity conflict")
            return existing
        self.runs[snapshot.run_id] = snapshot
        return snapshot

    def save_assessment_evidence(
        self, evidence: AssessmentEvidenceRecord
    ) -> AssessmentEvidenceRecord:
        existing = self.assessment_evidence.get(evidence.evidence_id)
        if existing is not None and existing.learner_id != evidence.learner_id:
            raise Stage13ValidationError("assessment evidence ownership conflict")
        self.assessment_evidence.setdefault(evidence.evidence_id, evidence)
        return self.assessment_evidence[evidence.evidence_id]

    def resolve_idempotency(self, key: str, command_hash: str) -> str | None:
        existing = self.idempotency.get(key)
        if existing is not None and existing != command_hash:
            raise Stage13ValidationError("idempotency conflict")
        self.idempotency.setdefault(key, command_hash)
        return existing
