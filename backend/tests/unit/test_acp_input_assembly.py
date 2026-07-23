from __future__ import annotations

import hashlib
import json
from types import SimpleNamespace

import pytest

from neuralverse_backend.bip_m4.acp_input_assembly import (
    DIDACTIC_STAGE_TYPES,
    AcpArtifactReference,
    AcpInputAssemblyError,
    CanonicalArtifactReferenceLoader,
    SemanticVersion,
    assemble_acp_input,
    build_assembly_plan_from_persisted_artifact,
    operation_spec,
)
from neuralverse_backend.bip_m4.agent_worker import (
    _default_didactic_payload,
    _default_readiness_payload,
)


def context() -> dict[str, object]:
    return {
        "generation_job_id": "job:1",
        "workflow_id": "workflow:1",
        "curriculum_node_id": "node:1",
        "content_package_id": "package:1",
        "requested_package_type": "lesson",
        "correlation_id": "correlation:1",
    }


def payload(agent: str) -> dict[str, object]:
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z"},
        "semantic_input": {
            "agentId": agent,
            "generationJobId": "job:1",
            "curriculumScope": {"curriculumNodeIds": ["node:1"]},
        },
    }


def test_registry_is_closed_and_uses_canonical_agent_identity() -> None:
    assert operation_spec("produce_evidence_contribution").canonical_agent_identity == "research"
    with pytest.raises(AcpInputAssemblyError, match="not registered"):
        operation_spec("not-an-operation")


def test_malformed_version_and_unauthorized_producer_are_rejected() -> None:
    with pytest.raises(AcpInputAssemblyError) as invalid:
        SemanticVersion.parse("1")
    assert invalid.value.code == "ACP_INPUT_VERSION_INVALID"
    with pytest.raises(AcpInputAssemblyError) as unauthorized:
        assemble_acp_input(
            {
                **context(),
                "operation": "produce_evidence_contribution",
                "operation_version": "1.0.0",
                "agent_identity": "knowledge",
                "payload": payload("research"),
            }
        )
    assert unauthorized.value.code == "ACP_PRODUCER_NOT_AUTHORIZED"


def test_assembled_input_fingerprint_is_stable_and_excludes_correlation_id() -> None:
    request = {
        **context(),
        "operation": "produce_curriculum_contract",
        "operation_version": "1.0.0",
        "agent_identity": "curriculum-dependency",
        "payload": payload("curriculum-dependency"),
    }
    _, first, _ = assemble_acp_input(request)
    _, second, _ = assemble_acp_input({**request, "correlation_id": "different"})
    assert first == second


def test_reference_loader_verifies_stored_bytes_and_lineage() -> None:
    raw = json.dumps({"artifact": "value"}, sort_keys=True).encode()
    fingerprint = hashlib.sha256(raw).hexdigest()
    loader = CanonicalArtifactReferenceLoader(
        lambda _: {
            "raw_canonical_json": raw,
            "artifact_fingerprint": fingerprint,
            "contract_name": "AgentContribution",
            "contract_version": "1.0.0",
            "generation_job_id": "job:1",
            "revision_cycle": 0,
            "producer_identity": "research",
        }
    )
    reference = loader.load(
        "artifact:1",
        generation_job_id="job:1",
        revision_cycle=0,
        producer_identity="research",
        contract_name="AgentContribution",
        contract_version="1.0.0",
    )
    assert isinstance(reference, AcpArtifactReference)
    assert reference.artifact_fingerprint == fingerprint


def test_persisted_assembly_plan_is_mapped_without_ordered_roles() -> None:
    contribution = AcpArtifactReference(
        "contribution", "AgentContribution", SemanticVersion.parse("1.0.0"), "evidence", "b" * 64,
        "research", "job:1", 0, "evidence",
        {"contributionId": "contribution:evidence"},
    )
    stages = [
        {
            "stageId": f"stage:{index}",
            "stageType": stage_type,
            "order": index,
            "inputContributionIds": ["contribution:evidence"],
            "targetIds": ["node:1"],
            "dependencies": [] if index == 0 else [f"stage:{index - 1}"],
        }
        for index, stage_type in enumerate(DIDACTIC_STAGE_TYPES)
    ]
    raw = json.dumps({"structuredPayload": {
        "planId": "plan:1", "planVersion": "1.0.0", "stages": stages,
        "inputContributionIds": ["contribution:evidence"], "rationale": "ACP rationale",
        "dependencyFingerprints": {"contribution:evidence": "b" * 64},
        "curriculumNodeId": "node:1", "role": "didactic",
    }}, sort_keys=True, separators=(",", ":")).encode()
    didactic = AcpArtifactReference(
        "didactic", "AgentContribution", SemanticVersion.parse("1.0.0"), "didactic",
        hashlib.sha256(raw).hexdigest(),
        "didactic", "job:1", 0, "didactic", json.loads(raw), raw,
    )
    plan = build_assembly_plan_from_persisted_artifact(
        didactic, contribution_references={"evidence": contribution},
        generation_job_id="job:1", workflow_id="workflow:1", revision_cycle=0,
    )
    assert set(plan) == {
        "planId", "planVersion", "stages", "inputContributionIds", "rationale",
        "dependencyFingerprints", "curriculumNodeId", "role",
    }
    assert plan["inputContributionIds"] == ["contribution:evidence"]
    assert plan["rationale"] == "ACP rationale"
    assert plan["dependencyFingerprints"] == {"contribution:evidence": "b" * 64}
    assert plan["curriculumNodeId"] == "node:1"
    assert plan["role"] == "didactic"


def test_incomplete_persisted_assembly_plan_is_rejected() -> None:
    artifact = AcpArtifactReference(
        "didactic", "AgentContribution", SemanticVersion.parse("1.0.0"), "didactic", "c" * 64,
        "didactic", "job:1", 0, "didactic", {"structuredPayload": {"planId": "plan:1"}},
    )
    with pytest.raises(AcpInputAssemblyError) as error:
        build_assembly_plan_from_persisted_artifact(
            artifact, contribution_references={}, generation_job_id="job:1",
            workflow_id="workflow:1", revision_cycle=0,
        )
    assert error.value.code == "ASSEMBLY_PLAN_INCOMPLETE"


def test_didactic_operation_assembles_real_input_instead_of_artifact_passthrough() -> None:
    contribution_names = (
        ("evidence", "research", "research_evidence"),
        ("knowledge", "knowledge", "conceptual_definition"),
        ("application", "application", "application_guidance"),
        ("code_laboratory", "laboratory", "laboratory_observation"),
        ("assessment", "assessment", "assessment_guidance"),
        ("narrative", "narrative", "narrative_framing"),
        ("curiosity", "curiosity", "curiosity_prompt"),
    )
    references: dict[str, AcpArtifactReference] = {}
    contributions: list[dict[str, object]] = []
    for name, agent, contribution_type in contribution_names:
        value = {
            "contributionId": f"contribution:{name}",
            "generationJobId": "job:1",
            "agentId": agent,
            "contributionType": contribution_type,
            "structuredPayload": {"fixture": name},
        }
        raw = json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
        references[name] = AcpArtifactReference(
            name,
            "AgentContribution",
            SemanticVersion.parse("1.0.0"),
            name,
            hashlib.sha256(raw).hexdigest(),
            agent,
            "job:1",
            0,
            name,
            value,
            raw,
        )
        contributions.append(value)
    input_value = {
        "executionId": "job:1",
        "requestId": "request:1",
        "contributionId": "contribution:didactic",
        "agentId": "didactic",
        "curriculumNodeId": "node:1",
        "researchContribution": contributions[0],
        "knowledgeContribution": contributions[1],
        "availableEnrichmentContributions": contributions[2:],
        "dependencyFingerprints": {
            str(item["contributionId"]): "f" * 64 for item in contributions
        },
    }
    assembled, _, spec = assemble_acp_input(
        {
            **context(),
            "operation": "produce_didactic_assembly_plan",
            "operation_version": "1.0.0",
            "agent_identity": "didactic",
            "payload": {"semantic_input": input_value},
        },
        {**references, "curriculum": references["evidence"]},
    )
    assert spec.assembler.__name__ == "_didactic_assembly"
    assert set(assembled) == {"input", "curriculumNodeId", "dependencyFingerprints"}
    assert "artifact" not in assembled
    assert assembled["input"]["contributionId"] == "contribution:didactic"


def test_default_didactic_payload_contains_inputs_not_a_backend_authored_plan() -> None:
    curriculum = {
        "contractVersion": "1.0.0",
        "targetCurriculumNodeIds": ["node:1"],
        "metadata": {"packageId": "package:1"},
    }
    references: dict[str, SimpleNamespace] = {
        "curriculum": SimpleNamespace(canonical_json=curriculum),
    }
    for name, agent, contribution_type in (
        ("evidence", "research", "research_evidence"),
        ("knowledge", "knowledge", "conceptual_definition"),
        ("application", "application", "application_guidance"),
        ("code_laboratory", "laboratory", "laboratory_observation"),
        ("assessment", "assessment", "assessment_guidance"),
        ("narrative", "narrative", "narrative_framing"),
        ("curiosity", "curiosity", "curiosity_prompt"),
    ):
        references[name] = SimpleNamespace(
            canonical_json={
                "contributionId": f"contribution:{name}",
                "generationJobId": "job:1",
                "agentId": agent,
                "agentVersion": "1.0.0",
                "packageId": "package:1",
                "packageVersion": "1.0.0",
                "contributionType": contribution_type,
                "payloadSchemaVersion": "1.0.0",
                "structuredPayload": {"fixture": name},
            }
        )
    payload = _default_didactic_payload(
        {
            "generation_job_id": "job:1",
            "request_id": "request:1",
            "curriculum_node_id": "node:1",
            "requested_package_type": "lesson",
        },
        references,
    )
    semantic = payload["semantic_input"]
    assert "structuredPayload" not in semantic
    assert semantic["agentId"] == "didactic"
    assert semantic["curriculumContract"]["contractVersion"]["major"] == 1
    assert len(semantic["availableEnrichmentContributions"]) == 5


def test_default_readiness_payload_preserves_draft_package_identity() -> None:
    payload = _default_readiness_payload(
        {"generation_job_id": "job:1"},
        {
            "draft": SimpleNamespace(
                canonical_json={"packageId": "package:1", "packageVersion": "1.0.0"}
            )
        },
    )
    assert payload["semantic_input"]["packageId"] == "package:1"
