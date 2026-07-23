"""Deterministic BIP-owned assembly of semantic ACP operation inputs.

This module deliberately contains no semantic authoring logic.  It only selects
the released input envelope, validates provenance, and orders references before
the ACP process boundary is crossed.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any

MAX_ASSEMBLED_INPUT_BYTES = 4 * 1024 * 1024
SUPPORTED_OPERATION_VERSION = "1.0.0"
SUPPORTED_INPUT_CONTRACT_VERSION = "1.0.0"
SUPPORTED_XFI_VERSION = "1.0.0"
DIDACTIC_STAGE_TYPES = (
    "orientation",
    "prerequisite_activation",
    "knowledge_explanation",
    "mathematics",
    "worked_examples",
    "implementation",
    "visualization",
    "laboratory",
    "application",
    "trade_offs",
    "misconceptions",
    "assessment",
    "narrative",
    "curiosity",
    "sources_and_citations",
)
_SEMVER = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)


class AcpInputAssemblyError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True, slots=True)
class SemanticVersion:
    value: str

    @classmethod
    def parse(cls, value: object) -> SemanticVersion:
        if not isinstance(value, str) or not _SEMVER.fullmatch(value):
            raise AcpInputAssemblyError("ACP_INPUT_VERSION_INVALID", "semantic version is invalid")
        return cls(value)


@dataclass(frozen=True, slots=True)
class AcpArtifactReference:
    domain: str
    contract_name: str
    contract_version: SemanticVersion
    artifact_id: str
    artifact_fingerprint: str
    producer_identity: str
    generation_job_id: str
    revision_cycle: int
    persistence_locator: str
    canonical_json: Mapping[str, Any] | None = None
    raw_canonical_json: bytes | None = None


class CanonicalArtifactReferenceLoader:
    """Loads bounded canonical bytes outside workflow code and verifies lineage."""

    def __init__(self, load_record: Callable[[str], Mapping[str, Any] | None]) -> None:
        self._load_record = load_record

    def load(
        self,
        artifact_id: str,
        *,
        generation_job_id: str,
        revision_cycle: int,
        producer_identity: str,
        contract_name: str,
        contract_version: str,
    ) -> AcpArtifactReference:
        record = self._load_record(artifact_id)
        if record is None:
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_MISSING", "artifact reference was not found"
            )
        raw = record.get("raw_canonical_json", record.get("raw_json_bytes"))
        if not isinstance(raw, (bytes, bytearray)):
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_MISSING", "canonical bytes are unavailable"
            )
        fingerprint = hashlib.sha256(raw).hexdigest()
        if fingerprint != str(record.get("artifact_fingerprint", "")):
            raise AcpInputAssemblyError(
                "ACP_INPUT_FINGERPRINT_MISMATCH", "stored artifact fingerprint does not match bytes"
            )
        if (
            str(record.get("contract_name", "")) != contract_name
            or str(record.get("contract_version", "")) != contract_version
        ):
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_CONFLICT", "artifact contract is incompatible"
            )
        record_job = str(record.get("generation_job_id", generation_job_id))
        if record_job != generation_job_id:
            raise AcpInputAssemblyError(
                "WORKFLOW_ARTIFACT_JOB_MISMATCH", "artifact belongs to another generation job"
            )
        if int(record.get("revision_cycle", -1)) != revision_cycle:
            raise AcpInputAssemblyError(
                "WORKFLOW_ARTIFACT_REVISION_MISMATCH", "artifact revision is incompatible"
            )
        if str(record.get("producer_identity", "")) != producer_identity:
            raise AcpInputAssemblyError(
                "WORKFLOW_ARTIFACT_PRODUCER_MISMATCH", "artifact producer is not authorized"
            )
        try:
            canonical = json.loads(bytes(raw).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_CONFLICT", "canonical artifact is not JSON"
            ) from error
        if not isinstance(canonical, dict):
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_CONFLICT", "canonical artifact must be an object"
            )
        return AcpArtifactReference(
            domain=str(record.get("domain", "")),
            contract_name=contract_name,
            contract_version=SemanticVersion.parse(contract_version),
            artifact_id=artifact_id,
            artifact_fingerprint=fingerprint,
            producer_identity=producer_identity,
            generation_job_id=generation_job_id,
            revision_cycle=revision_cycle,
            persistence_locator=str(record.get("persistence_locator", artifact_id)),
            canonical_json=canonical,
            raw_canonical_json=bytes(raw),
        )


@dataclass(frozen=True, slots=True)
class AcpGenerationContext:
    generation_job_id: str
    workflow_id: str
    workflow_run_id: str | None
    curriculum_node_id: str
    content_package_id: str | None
    requested_package_type: str
    competency_references: tuple[str, ...]
    prerequisite_references: tuple[str, ...]
    workflow_policy_version: SemanticVersion
    activity_policy_version: SemanticVersion
    revision_cycle: int
    correlation_id: str
    required_contract_releases: Mapping[str, str]

    @classmethod
    def from_request(cls, request: Mapping[str, Any]) -> AcpGenerationContext:
        required = (
            "generation_job_id",
            "workflow_id",
            "curriculum_node_id",
            "requested_package_type",
        )
        if any(not str(request.get(key, "")).strip() for key in required):
            raise AcpInputAssemblyError(
                "ACP_INPUT_ASSEMBLY_FAILED", "generation context is incomplete"
            )
        return cls(
            generation_job_id=str(request["generation_job_id"]),
            workflow_id=str(request["workflow_id"]),
            workflow_run_id=str(request["workflow_run_id"])
            if request.get("workflow_run_id")
            else None,
            curriculum_node_id=str(request["curriculum_node_id"]),
            content_package_id=str(request["content_package_id"])
            if request.get("content_package_id")
            else None,
            requested_package_type=str(request["requested_package_type"]),
            competency_references=tuple(
                sorted(str(item) for item in request.get("competency_references", ()) or ())
            ),
            prerequisite_references=tuple(
                sorted(str(item) for item in request.get("prerequisite_references", ()) or ())
            ),
            workflow_policy_version=SemanticVersion.parse(
                request.get("workflow_policy_version", SUPPORTED_OPERATION_VERSION)
            ),
            activity_policy_version=SemanticVersion.parse(
                request.get("activity_policy_version", SUPPORTED_OPERATION_VERSION)
            ),
            revision_cycle=int(request.get("revision_cycle", 0)),
            correlation_id=str(request.get("correlation_id", "")),
            required_contract_releases=dict(request.get("required_contract_versions", {})),
        )


@dataclass(frozen=True, slots=True)
class AcpOperationSpec:
    operation: str
    operation_version: SemanticVersion
    canonical_agent_identity: str
    semantic_owner: str
    input_contract_name: str
    input_contract_version: SemanticVersion
    output_contract_name: str
    output_contract_version: SemanticVersion
    required_dependencies: tuple[str, ...]
    max_payload_bytes: int
    assembler: Callable[
        [Mapping[str, Any], AcpGenerationContext, Mapping[str, AcpArtifactReference]],
        dict[str, Any],
    ]


def _require_input(payload: Mapping[str, Any]) -> dict[str, Any]:
    value = payload.get("semantic_input")
    if not isinstance(value, Mapping):
        raise AcpInputAssemblyError("ACP_INPUT_ASSEMBLY_FAILED", "semantic_input is required")
    return dict(value)


def _metadata(payload: Mapping[str, Any]) -> dict[str, Any]:
    value = payload.get("metadata")
    if not isinstance(value, Mapping):
        raise AcpInputAssemblyError("ACP_INPUT_ASSEMBLY_FAILED", "metadata is required")
    return dict(value)


def _producer_input(
    payload: Mapping[str, Any], context: AcpGenerationContext, agent: str
) -> dict[str, Any]:
    value = _require_input(payload)
    if str(value.get("agentId", "")) != agent:
        raise AcpInputAssemblyError(
            "ACP_PRODUCER_NOT_AUTHORIZED", "input agent identity is not authorized"
        )
    if str(value.get("generationJobId", context.generation_job_id)) != context.generation_job_id:
        raise AcpInputAssemblyError(
            "ACP_INPUT_IDENTITY_MISMATCH", "input belongs to another generation job"
        )
    return value


def _curriculum(
    payload: Mapping[str, Any], context: AcpGenerationContext, _: Mapping[str, AcpArtifactReference]
) -> dict[str, Any]:
    value = _producer_input(payload, context, "curriculum-dependency")
    if (
        str(value.get("curriculumScope", {}).get("curriculumNodeIds", [None])[0])
        != context.curriculum_node_id
    ):
        raise AcpInputAssemblyError(
            "ACP_INPUT_IDENTITY_MISMATCH", "curriculum node does not match the generation context"
        )
    return {
        "input": value,
        "metadata": _metadata(payload),
        "context": dict(payload.get("semantic_context", {})),
    }


def _contribution(
    agent: str, dependencies: tuple[str, ...]
) -> Callable[
    [Mapping[str, Any], AcpGenerationContext, Mapping[str, AcpArtifactReference]], dict[str, Any]
]:
    def assemble(
        payload: Mapping[str, Any],
        context: AcpGenerationContext,
        refs: Mapping[str, AcpArtifactReference],
    ) -> dict[str, Any]:
        value = _producer_input(payload, context, agent)
        for dependency in dependencies:
            if dependency not in refs:
                raise AcpInputAssemblyError(
                    "ACP_INPUT_DEPENDENCY_MISSING", f"missing dependency: {dependency}"
                )
            reference = refs[dependency]
            if reference.canonical_json is None:
                raise AcpInputAssemblyError(
                    "ACP_INPUT_DEPENDENCY_MISSING", f"dependency was not loaded: {dependency}"
                )
        return {
            "input": value,
            "metadata": _metadata(payload),
            "dependencies": {name: dict(refs[name].canonical_json or {}) for name in dependencies},
        }

    return assemble


def _artifact_passthrough(
    payload: Mapping[str, Any],
    __: AcpGenerationContext,
    refs: Mapping[str, AcpArtifactReference],
) -> dict[str, Any]:
    semantic = payload.get("semantic_input")
    if isinstance(semantic, Mapping):
        return {"artifact": dict(semantic)}
    if not refs:
        raise AcpInputAssemblyError(
            "ACP_INPUT_DEPENDENCY_MISSING", "artifact dependency is required"
        )
    reference = refs.get("didactic") or refs.get("validation") or next(iter(refs.values()))
    if reference.canonical_json is None:
        raise AcpInputAssemblyError(
            "ACP_INPUT_DEPENDENCY_MISSING", "canonical artifact bytes were not loaded"
        )
    return {"artifact": dict(reference.canonical_json)}


def _didactic_assembly(
    payload: Mapping[str, Any],
    context: AcpGenerationContext,
    refs: Mapping[str, AcpArtifactReference],
) -> dict[str, Any]:
    """Assemble the persisted inputs for the real ACP Didactic producer."""
    required = (
        "curriculum",
        "evidence",
        "knowledge",
        "application",
        "code_laboratory",
        "assessment",
        "narrative",
        "curiosity",
    )
    missing = [name for name in required if name not in refs]
    if missing:
        raise AcpInputAssemblyError(
            "ACP_INPUT_DEPENDENCY_MISSING",
            f"missing didactic dependencies: {', '.join(missing)}",
        )
    value = _require_input(payload)
    if str(value.get("agentId", "")) != "didactic":
        raise AcpInputAssemblyError(
            "ACP_PRODUCER_NOT_AUTHORIZED", "didactic input agent identity is not authorized"
        )
    if str(value.get("executionId", "")) != context.generation_job_id:
        raise AcpInputAssemblyError(
            "ACP_INPUT_IDENTITY_MISMATCH", "didactic input belongs to another generation job"
        )
    if str(value.get("curriculumNodeId", context.curriculum_node_id)) != context.curriculum_node_id:
        raise AcpInputAssemblyError(
            "ACP_INPUT_IDENTITY_MISMATCH",
            "didactic curriculum node does not match the generation context",
        )
    contributions = [
        value.get("researchContribution"),
        value.get("knowledgeContribution"),
        *(value.get("availableEnrichmentContributions", []) or []),
    ]
    if any(not isinstance(item, Mapping) for item in contributions):
        raise AcpInputAssemblyError(
            "ACP_INPUT_ASSEMBLY_FAILED", "didactic contributions must be objects"
        )
    contribution_ids = [str(item.get("contributionId", "")) for item in contributions]
    if any(not item for item in contribution_ids) or len(set(contribution_ids)) != len(
        contribution_ids
    ):
        raise AcpInputAssemblyError(
            "ACP_INPUT_ASSEMBLY_FAILED", "didactic contribution identities must be unique"
        )
    dependency_fingerprints = value.get("dependencyFingerprints")
    if not isinstance(dependency_fingerprints, Mapping):
        raise AcpInputAssemblyError(
            "ACP_INPUT_ASSEMBLY_FAILED", "didactic dependency fingerprints are required"
        )
    if set(str(key) for key in dependency_fingerprints) != set(contribution_ids):
        raise AcpInputAssemblyError(
            "ACP_INPUT_FINGERPRINT_MISMATCH",
            "didactic dependency fingerprints must cover every input contribution",
        )
    return {
        "input": dict(value),
        "curriculumNodeId": context.curriculum_node_id,
        "dependencyFingerprints": {
            str(key): str(value) for key, value in dependency_fingerprints.items()
        },
    }


def _compile(
    payload: Mapping[str, Any],
    context: AcpGenerationContext,
    refs: Mapping[str, AcpArtifactReference],
) -> dict[str, Any]:
    value = _require_input(payload)
    for dependency in ("curriculum", "didactic", "validation", "governance"):
        if dependency not in refs:
            raise AcpInputAssemblyError(
                "ACP_INPUT_DEPENDENCY_MISSING", f"missing dependency: {dependency}"
            )
    if str(value.get("packageId", context.content_package_id)) != context.content_package_id:
        raise AcpInputAssemblyError(
            "ACP_INPUT_IDENTITY_MISMATCH", "package does not match the generation context"
        )
    assembly_plan = build_assembly_plan_from_persisted_artifact(
        refs.get("didactic"),
        contribution_references=refs,
        generation_job_id=context.generation_job_id,
        workflow_id=context.workflow_id,
        revision_cycle=context.revision_cycle,
        curriculum_node_id=context.curriculum_node_id,
    )
    return {
        "input": value,
        "metadata": _metadata(payload),
        "context": {**dict(payload.get("semantic_context", {})), "assemblyPlan": assembly_plan},
        "dependencies": {
            name: dict(reference.canonical_json or {}) for name, reference in sorted(refs.items())
        },
    }


def build_assembly_plan_from_persisted_artifact(
    didactic_artifact: AcpArtifactReference | None,
    *,
    contribution_references: Mapping[str, AcpArtifactReference],
    generation_job_id: str,
    workflow_id: str,
    revision_cycle: int,
    curriculum_node_id: str | None = None,
) -> dict[str, Any]:
    """Extract the ACP-owned assembly plan from the persisted didactic artifact."""
    if didactic_artifact is None:
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_NOT_FOUND", "persisted didactic artifact is missing"
        )
    if (
        didactic_artifact.generation_job_id != generation_job_id
        or didactic_artifact.revision_cycle != revision_cycle
        or didactic_artifact.producer_identity != "didactic"
        or didactic_artifact.persistence_locator == ""
    ):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_LINEAGE_MISMATCH", "didactic artifact lineage is invalid"
        )
    raw = didactic_artifact.raw_canonical_json
    if raw is not None and hashlib.sha256(raw).hexdigest() != (
        didactic_artifact.artifact_fingerprint
    ):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_FINGERPRINT_MISMATCH",
            "didactic artifact fingerprint does not match bytes",
        )
    semantic = didactic_artifact.canonical_json or {}
    structured = semantic.get("structuredPayload")
    if not isinstance(structured, Mapping):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_INCOMPLETE", "didactic structuredPayload is missing"
        )
    required = (
        "planId",
        "planVersion",
        "stages",
        "inputContributionIds",
        "rationale",
        "dependencyFingerprints",
        "curriculumNodeId",
        "role",
    )
    if any(key not in structured for key in required):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_INCOMPLETE", "didactic assembly plan is incomplete"
        )
    plan_id = structured["planId"]
    plan_version = structured["planVersion"]
    stages = structured["stages"]
    contribution_ids = structured["inputContributionIds"]
    rationale = structured["rationale"]
    dependency_fingerprints = structured["dependencyFingerprints"]
    projected_curriculum_node_id = structured["curriculumNodeId"]
    role = structured["role"]
    if (
        not isinstance(plan_id, str)
        or not plan_id
        or not isinstance(plan_version, str)
        or plan_version != SUPPORTED_OPERATION_VERSION
        or not isinstance(stages, list)
        or len(stages) != len(DIDACTIC_STAGE_TYPES)
        or any(
            not isinstance(stage, Mapping)
            or stage.get("stageType") != DIDACTIC_STAGE_TYPES[index]
            or stage.get("order") != index
            for index, stage in enumerate(stages)
        )
        or not isinstance(contribution_ids, list)
        or not contribution_ids
        or any(not isinstance(item, str) or not item for item in contribution_ids)
        or len(set(contribution_ids)) != len(contribution_ids)
        or not isinstance(rationale, str)
        or not rationale.strip()
        or not isinstance(dependency_fingerprints, Mapping)
        or set(str(key) for key in dependency_fingerprints) != set(contribution_ids)
        or any(
            not isinstance(value, str) or not value
            for value in dependency_fingerprints.values()
        )
        or not isinstance(projected_curriculum_node_id, str)
        or not projected_curriculum_node_id.strip()
        or curriculum_node_id is not None
        and projected_curriculum_node_id != curriculum_node_id
        or role != "didactic"
    ):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_INCOMPLETE", "didactic assembly plan fields are invalid"
        )
    for reference in contribution_references.values():
        if reference.generation_job_id != generation_job_id:
            raise AcpInputAssemblyError(
                "ASSEMBLY_PLAN_LINEAGE_MISMATCH", "contribution belongs to another job"
            )
    by_id = {
        str((reference.canonical_json or {}).get("contributionId")): reference
        for reference in contribution_references.values()
        if reference.canonical_json is not None
    }
    selected = [by_id.get(item) for item in contribution_ids]
    if any(reference is None for reference in selected):
        raise AcpInputAssemblyError(
            "ASSEMBLY_PLAN_LINEAGE_MISMATCH", "assembly contribution lineage is incomplete"
        )
    return {
        "planId": plan_id,
        "planVersion": plan_version,
        "stages": list(stages),
        "inputContributionIds": list(contribution_ids),
        "rationale": rationale,
        "dependencyFingerprints": {
            str(key): str(value) for key, value in dependency_fingerprints.items()
        },
        "curriculumNodeId": projected_curriculum_node_id,
        "role": role,
    }


def _readiness(
    payload: Mapping[str, Any],
    context: AcpGenerationContext,
    refs: Mapping[str, AcpArtifactReference],
) -> dict[str, Any]:
    value = _require_input(payload)
    draft = refs.get("draft")
    if (
        draft is None
        or str(value.get("packageId", context.content_package_id)) != context.content_package_id
    ):
        raise AcpInputAssemblyError(
            "ACP_INPUT_DEPENDENCY_MISSING", "learning package draft is required"
        )
    return {
        "input": value,
        "metadata": _metadata(payload),
        "context": dict(payload.get("semantic_context", {})),
        "dependencies": {
            name: dict(reference.canonical_json or {}) for name, reference in sorted(refs.items())
        },
    }


def _spec(
    operation: str,
    agent: str,
    output: str,
    assembler: Callable[..., dict[str, Any]],
    dependencies: tuple[str, ...] = (),
) -> AcpOperationSpec:
    return AcpOperationSpec(
        operation,
        SemanticVersion.parse("1.0.0"),
        agent,
        agent,
        f"{operation}Input",
        SemanticVersion.parse("1.0.0"),
        output,
        SemanticVersion.parse("1.0.0"),
        dependencies,
        MAX_ASSEMBLED_INPUT_BYTES,
        assembler,
    )


ACP_OPERATION_INPUT_REGISTRY: dict[str, AcpOperationSpec] = {
    "produce_curriculum_contract": _spec(
        "produce_curriculum_contract", "curriculum-dependency", "CurriculumContract", _curriculum
    ),
    "produce_evidence_contribution": _spec(
        "produce_evidence_contribution",
        "research",
        "AgentContribution",
        _contribution("research", ("curriculum",)),
    ),
    "produce_knowledge_contribution": _spec(
        "produce_knowledge_contribution",
        "knowledge",
        "AgentContribution",
        _contribution("knowledge", ("curriculum", "evidence")),
    ),
    "produce_application_contribution": _spec(
        "produce_application_contribution",
        "application",
        "AgentContribution",
        _contribution("application", ("curriculum", "knowledge")),
    ),
    "produce_code_laboratory_contribution": _spec(
        "produce_code_laboratory_contribution",
        "laboratory",
        "AgentContribution",
        _contribution("laboratory", ("curriculum", "knowledge")),
    ),
    "produce_assessment_contribution": _spec(
        "produce_assessment_contribution",
        "assessment",
        "AgentContribution",
        _contribution("assessment", ("curriculum", "knowledge")),
    ),
    "produce_narrative_contribution": _spec(
        "produce_narrative_contribution",
        "narrative",
        "AgentContribution",
        _contribution("narrative", ("curriculum", "knowledge")),
    ),
    "produce_curiosity_contribution": _spec(
        "produce_curiosity_contribution",
        "curiosity",
        "AgentContribution",
        _contribution("curiosity", ("curriculum", "knowledge")),
    ),
    "produce_didactic_assembly_plan": _spec(
        "produce_didactic_assembly_plan",
        "didactic",
        "AgentContribution",
        _didactic_assembly,
        (
            "curriculum",
            "evidence",
            "knowledge",
            "application",
            "code_laboratory",
            "assessment",
            "narrative",
            "curiosity",
        ),
    ),
    "validate_cross_agent_contributions": _spec(
        "validate_cross_agent_contributions",
        "didactic",
        "AgentContribution",
        _artifact_passthrough,
        (
            "curriculum",
            "evidence",
            "knowledge",
            "application",
            "code_laboratory",
            "assessment",
            "narrative",
            "curiosity",
            "didactic",
        ),
    ),
    "produce_governance_review": _spec(
        "produce_governance_review",
        "obsidian-governance",
        "PublicationReadinessRecommendation",
        _artifact_passthrough,
        (
            "curriculum",
            "evidence",
            "knowledge",
            "application",
            "code_laboratory",
            "assessment",
            "narrative",
            "curiosity",
            "didactic",
            "validation",
        ),
    ),
    "compile_learning_package_draft": _spec(
        "compile_learning_package_draft",
        "didactic",
        "LearningPackageDraft",
        _compile,
        ("curriculum", "didactic", "validation", "governance"),
    ),
    "produce_publication_readiness_recommendation": _spec(
        "produce_publication_readiness_recommendation",
        "obsidian-governance",
        "PublicationReadinessRecommendation",
        _readiness,
        ("draft", "governance", "validation"),
    ),
}


def operation_spec(operation: str) -> AcpOperationSpec:
    try:
        return ACP_OPERATION_INPUT_REGISTRY[operation]
    except KeyError as error:
        raise AcpInputAssemblyError(
            "ACP_OPERATION_NOT_REGISTERED", f"operation is not registered: {operation}"
        ) from error


def assemble_acp_input(
    request: Mapping[str, Any], references: Mapping[str, AcpArtifactReference] = {}
) -> tuple[dict[str, Any], str, AcpOperationSpec]:
    operation = str(request.get("operation", ""))
    spec = operation_spec(operation)
    if str(request.get("operation_version", "")) != spec.operation_version.value:
        raise AcpInputAssemblyError(
            "ACP_OPERATION_VERSION_UNSUPPORTED", "operation version is unsupported"
        )
    if str(request.get("agent_identity", "")) != spec.canonical_agent_identity:
        raise AcpInputAssemblyError(
            "ACP_PRODUCER_NOT_AUTHORIZED", "producer is not authorized for operation"
        )
    context = AcpGenerationContext.from_request(request)
    payload = request.get("payload")
    if not isinstance(payload, Mapping):
        raise AcpInputAssemblyError("ACP_INPUT_ASSEMBLY_FAILED", "payload must be an object")
    assembled = spec.assembler(payload, context, references)
    envelope = {
        "operation": operation,
        "operation_version": spec.operation_version.value,
        "agent_identity": spec.canonical_agent_identity,
        "input_contract": {
            "name": spec.input_contract_name,
            "version": spec.input_contract_version.value,
        },
        "generation_job_id": context.generation_job_id,
        "revision_cycle": context.revision_cycle,
        "dependencies": [
            {"domain": key, "artifact_id": ref.artifact_id, "fingerprint": ref.artifact_fingerprint}
            for key, ref in sorted(references.items())
        ],
        "payload": assembled,
    }
    serialized = json.dumps(
        envelope, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode()
    if len(serialized) > spec.max_payload_bytes:
        raise AcpInputAssemblyError(
            "ACP_INPUT_TOO_LARGE", "assembled ACP input exceeds the configured bound"
        )
    return assembled, hashlib.sha256(serialized).hexdigest(), spec
