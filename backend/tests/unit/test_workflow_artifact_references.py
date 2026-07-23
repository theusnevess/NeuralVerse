from __future__ import annotations

import pytest

from neuralverse_backend.bip_m4.workflow_artifact_references import (
    WorkflowArtifactReference,
    WorkflowArtifactReferenceError,
    WorkflowArtifactReferenceMap,
    validate_reference_ownership,
)


def reference(**overrides: object) -> WorkflowArtifactReference:
    values: dict[str, object] = {
        "artifact_domain_id": "artifact:1",
        "contract_name": "AgentContribution",
        "contract_version": "1.0.0",
        "artifact_fingerprint": "a" * 64,
        "canonical_producer_id": "research",
        "operation": "produce_evidence_contribution",
        "operation_version": "1.0.0",
        "generation_job_id": "job:1",
        "workflow_id": "workflow:1",
        "revision_cycle": 0,
        "persistence_locator": "00000000-0000-0000-0000-000000000001",
    }
    values.update(overrides)
    return WorkflowArtifactReference(**values)  # type: ignore[arg-type]


def test_reference_map_contains_only_bounded_metadata_and_orders_dependencies() -> None:
    artifact_map = WorkflowArtifactReferenceMap.empty().put(
        "curriculum_contract", reference(contract_name="CurriculumContract")
    )
    bounded = artifact_map.bounded()
    assert "canonical_json" not in bounded["curriculum_contract"]
    with pytest.raises(WorkflowArtifactReferenceError) as missing:
        artifact_map.for_activity("produce_knowledge_contribution")
    assert missing.value.code == "WORKFLOW_ARTIFACT_DEPENDENCY_MISSING"


@pytest.mark.parametrize(
    ("field", "code"),
    (
        ("generation_job_id", "WORKFLOW_ARTIFACT_JOB_MISMATCH"),
        ("workflow_id", "WORKFLOW_ARTIFACT_WORKFLOW_MISMATCH"),
        ("revision_cycle", "WORKFLOW_ARTIFACT_REVISION_MISMATCH"),
        ("canonical_producer_id", "WORKFLOW_ARTIFACT_PRODUCER_MISMATCH"),
        ("contract_version", "WORKFLOW_ARTIFACT_SCHEMA_UNSUPPORTED"),
    ),
)
def test_reference_ownership_rejects_incompatible_lineage(field: str, code: str) -> None:
    value = reference(**{field: "wrong" if field != "revision_cycle" else 9})
    with pytest.raises(WorkflowArtifactReferenceError) as error:
        validate_reference_ownership(
            value,
            generation_job_id="job:1",
            workflow_id="workflow:1",
            revision_cycle=0,
            expected_operation="produce_evidence_contribution",
            expected_contract="AgentContribution",
            expected_producer="research",
            expected_contract_version="1.0.0",
        )
    assert error.value.code == code


def test_reference_map_invalidates_downstream_revision_artifacts() -> None:
    artifact_map = WorkflowArtifactReferenceMap.empty().put(
        "knowledge_contribution", reference(operation="produce_knowledge_contribution")
    )
    assert artifact_map.invalidate({"knowledge_contribution"}).values == {}
