"""System-side reconstruction of ACP dependencies from canonical persistence."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any
from uuid import UUID

from sqlalchemy import select

from neuralverse_backend.bip_m4.acp_input_assembly import (
    AcpArtifactReference,
    CanonicalArtifactReferenceLoader,
)
from neuralverse_backend.bip_m4.workflow_artifact_references import (
    WorkflowArtifactReference,
    WorkflowArtifactReferenceError,
    validate_reference_ownership,
)
from neuralverse_backend.persistence.models import CanonicalInputRecord


def load_canonical_activity_dependencies(
    session_factory: Any,
    request: Mapping[str, Any],
) -> dict[str, AcpArtifactReference]:
    generation_job_id = str(request["generation_job_id"])
    workflow_id = str(request["workflow_id"])
    revision_cycle = int(request["revision_cycle"])
    loaded: dict[str, AcpArtifactReference] = {}
    session = session_factory()
    try:
        for role, raw_reference in dict(request.get("artifact_references", {})).items():
            reference = WorkflowArtifactReference.from_dict(raw_reference)
            if reference.generation_job_id != generation_job_id:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_JOB_MISMATCH", "dependency belongs to another generation job"
                )
            if reference.workflow_id != workflow_id:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_WORKFLOW_MISMATCH", "dependency belongs to another workflow"
                )
            if reference.revision_cycle != revision_cycle:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_REVISION_MISMATCH", "dependency belongs to another revision"
                )
            try:
                artifact_id = UUID(reference.persistence_locator)
            except ValueError as error:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_REFERENCE_INVALID", "persistence locator is invalid"
                ) from error
            record = session.scalar(
                select(CanonicalInputRecord).where(
                    CanonicalInputRecord.canonical_input_id == artifact_id
                )
            )
            if record is None:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_REFERENCE_NOT_FOUND", "persisted artifact was not found"
                )
            if str(record.generation_job_id or "") != generation_job_id:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_JOB_MISMATCH",
                    "stored artifact belongs to another generation job",
                )
            if str(record.workflow_id or "") != workflow_id:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_WORKFLOW_MISMATCH",
                    "stored artifact belongs to another workflow",
                )
            if int(record.revision_cycle) != revision_cycle:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_REVISION_MISMATCH",
                    "stored artifact belongs to another revision",
                )
            if str(record.canonical_producer_id or "") != reference.canonical_producer_id:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_PRODUCER_MISMATCH",
                    "stored artifact producer is not authorized",
                )
            if str(record.operation or "") != reference.operation:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_SCHEMA_UNSUPPORTED",
                    "stored artifact operation is incompatible",
                )
            if str(record.artifact_fingerprint) != reference.artifact_fingerprint:
                raise WorkflowArtifactReferenceError(
                    "WORKFLOW_ARTIFACT_FINGERPRINT_MISMATCH",
                    "stored artifact fingerprint differs from workflow reference",
                )
            validate_reference_ownership(
                reference,
                generation_job_id=generation_job_id,
                workflow_id=workflow_id,
                revision_cycle=revision_cycle,
                expected_operation=reference.operation,
                expected_contract=reference.contract_name,
                expected_producer=reference.canonical_producer_id,
                expected_contract_version=reference.contract_version,
            )
            record_data = {
                "raw_json_bytes": record.raw_json_bytes,
                "artifact_fingerprint": record.artifact_fingerprint,
                "contract_name": record.contract_name,
                "contract_version": record.contract_version,
                "generation_job_id": str(record.generation_job_id),
                "revision_cycle": int(record.revision_cycle),
                "producer_identity": str(record.canonical_producer_id),
                "persistence_locator": str(record.canonical_input_id),
            }

            def load_record(_: str, value: dict[str, Any] = record_data) -> dict[str, Any]:
                return value

            loaded_reference = CanonicalArtifactReferenceLoader(load_record).load(
                str(record.canonical_input_id),
                generation_job_id=generation_job_id,
                revision_cycle=revision_cycle,
                producer_identity=reference.canonical_producer_id,
                contract_name=reference.contract_name,
                contract_version=reference.contract_version,
            )
            loaded[str(role)] = loaded_reference
        return loaded
    finally:
        session.close()
