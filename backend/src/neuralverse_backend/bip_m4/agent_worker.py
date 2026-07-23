"""Temporal agent-task worker for the ACP executable boundary."""

from __future__ import annotations

import asyncio
import hashlib
import json
from functools import lru_cache
from typing import Any
from uuid import UUID

from sqlalchemy import select

from neuralverse_backend.bip_m4.acp_input_assembly import (
    AcpInputAssemblyError,
    assemble_acp_input,
    build_assembly_plan_from_persisted_artifact,
    operation_spec,
)
from neuralverse_backend.bip_m4.acp_process import ACPProcessAdapter, ACPProcessFailure
from neuralverse_backend.bip_m4.canonical_generation_request import (
    semantic_input,
    validate_reference,
)
from neuralverse_backend.bip_m4.reference_loading import load_canonical_activity_dependencies
from neuralverse_backend.canonical_input import read_canonical_input
from neuralverse_backend.canonical_persistence import CanonicalPersistenceService
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.persistence.models import BIPM4GenerationRequestRecord
from neuralverse_backend.persistence.runtime import create_persistence_runtime

try:
    from temporalio import activity
    from temporalio.client import Client
    from temporalio.worker import Worker
except ImportError:  # pragma: no cover - dependency is installed at runtime
    activity = None  # type: ignore[assignment]
    Client = Any  # type: ignore[misc,assignment]
    Worker = Any  # type: ignore[misc,assignment]

AGENT_TASK_QUEUE = "neuralverse.activity.agent.v1"
MAX_ACTIVITY_RESULT_BYTES = 16 * 1024


@lru_cache(maxsize=1)
def _persistence_service() -> CanonicalPersistenceService | None:
    settings = Settings()
    if not settings.database_enabled:
        return None
    runtime = create_persistence_runtime(settings)
    if runtime.session_factory is None:
        return None
    return CanonicalPersistenceService(runtime.session_factory)


def _bootstrap_curriculum_payload(
    service: CanonicalPersistenceService, request: dict[str, Any]
) -> dict[str, Any]:
    if service is None:
        raise ACPProcessFailure(
            "GENERATION_REQUEST_REFERENCE_NOT_FOUND",
            "database is required for curriculum bootstrap",
        )
    raw_reference = request.get("generation_request_reference")
    if not isinstance(raw_reference, dict):
        raise ACPProcessFailure(
            "GENERATION_REQUEST_REFERENCE_MISSING", "curriculum activity has no request reference"
        )
    try:
        validate_reference(raw_reference, generation_job_id=str(request["generation_job_id"]))
        request_id = UUID(str(raw_reference["generation_request_id"]))
    except (KeyError, TypeError, ValueError) as error:
        raise ACPProcessFailure(
            "GENERATION_REQUEST_REFERENCE_INVALID", "generation request reference is invalid"
        ) from error
    session = service._session_factory  # noqa: SLF001 - activity boundary owns persistence access
    db = session()
    try:
        record = db.scalar(
            select(BIPM4GenerationRequestRecord).where(
                BIPM4GenerationRequestRecord.generation_request_id == request_id
            )
        )
        if record is None or record.generation_job_id != str(request["generation_job_id"]):
            raise ACPProcessFailure(
                "GENERATION_REQUEST_JOB_MISMATCH", "generation request does not belong to the job"
            )
        actual = hashlib.sha256(record.raw_json_bytes).hexdigest()
        if actual != record.request_fingerprint or actual != str(
            raw_reference["request_fingerprint"]
        ):
            raise ACPProcessFailure(
                "GENERATION_REQUEST_FINGERPRINT_MISMATCH",
                "generation request fingerprint mismatches",
            )
        value = record.semantic_payload
        if not isinstance(value, dict):
            raise ACPProcessFailure(
                "GENERATION_REQUEST_SCHEMA_UNSUPPORTED", "generation request payload is invalid"
            )
        return {
            "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
            "semantic_input": semantic_input(value),
            "semantic_context": {
                "expectedDepth": "working_knowledge",
                "prerequisiteDepths": {
                    item["name"]: item["depth"] for item in value["prerequisites"]
                },
                "lifecycleApproval": "needs_review",
                "lifecyclePublication": "unpublished",
            },
        }
    finally:
        db.close()


def _default_contribution_payload(
    request: dict[str, Any], references: dict[str, Any]
) -> dict[str, Any]:
    spec = operation_spec(str(request["operation"]))
    agent = spec.canonical_agent_identity
    contribution_type = {
        "research": "research_evidence",
        "knowledge": "conceptual_definition",
        "application": "application_guidance",
        "laboratory": "laboratory_observation",
        "assessment": "assessment_guidance",
        "narrative": "narrative_framing",
        "curiosity": "curiosity_prompt",
    }.get(agent, "conceptual_definition")
    curriculum = references.get("curriculum")
    curriculum_json = curriculum.canonical_json if curriculum is not None else {}
    package_id = str(
        (curriculum_json or {})
        .get("metadata", {})
        .get("packageId", "package:svd-image-compression-reference")
    )
    dependencies = [{"kind": "curriculum_node", "id": request["curriculum_node_id"]}]
    for name, reference in sorted(references.items()):
        if name != "curriculum":
            dependencies.append(
                {"kind": "contribution", "id": f"contribution:{reference.artifact_id}"}
            )
    version = {"major": 1, "minor": 0, "patch": 0, "prerelease": [], "build": []}
    structured_payload: dict[str, Any] = {
        "role": agent,
        "curriculumNodeId": request["curriculum_node_id"],
        "dependencyFingerprints": [
            reference.artifact_fingerprint for reference in references.values()
        ],
    }
    if agent == "research":
        structured_payload["researchOutput"] = {
            "claims": [
                {
                    "claimId": f"claim:{request['generation_job_id']}:research",
                    "text": "Research evidence is bounded to the persisted curriculum node.",
                    "supportStatus": "SUPPORTED",
                    "supportingSourceIds": [],
                    "citationIds": [],
                }
            ]
        }
    elif agent == "knowledge":
        structured_payload["knowledgeOutput"] = {
            "claims": [
                {
                    "claimId": f"claim:{request['generation_job_id']}:knowledge",
                    "text": "The persisted curriculum node has a bounded technical meaning.",
                    "supportState": "SUPPORTED",
                    "supportingSourceIds": [],
                    "citationIds": [],
                }
            ]
        }
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
        "semantic_input": {
            "contributionId": f"contribution:{request['generation_job_id']}:{agent}",
            "generationJobId": request["generation_job_id"],
            "agentId": agent,
            "agentVersion": version,
            "packageId": package_id,
            "packageVersion": version,
            "contributionType": contribution_type,
            "inputDependencies": dependencies,
            "payloadSchemaVersion": version,
            "structuredPayload": structured_payload,
            "citationIds": [],
            "assetRequestIds": [],
            "validationResults": [],
            "warnings": [],
            "confidence": 0.7,
            "createdAt": "2026-07-20T00:00:00Z",
            "metadata": {"bootstrap": True},
        },
    }


def _default_governance_payload(
    request: dict[str, Any], references: dict[str, Any]
) -> dict[str, Any]:
    curriculum = references.get("curriculum")
    package_id = str(
        ((curriculum.canonical_json if curriculum is not None else {}) or {})
        .get("metadata", {})
        .get("packageId", "package:svd-image-compression-reference")
    )
    not_evaluated = {"status": "not_evaluated"}
    coverage = {
        name: not_evaluated
        for name in (
            "source",
            "contentBlock",
            "asset",
            "laboratory",
            "assessment",
            "accessibility",
            "governance",
        )
    }
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
        "semantic_input": {
            "schema_name": "PublicationReadinessRecommendation",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "1.0.0",
            "created_at": "2026-07-20T00:00:00Z",
            "packageId": package_id,
            "packageVersion": "1.0.0",
            "recommendation": "HUMAN_REVIEW_REQUIRED",
            "recommender": {"kind": "governance", "label": "BIP governance"},
            "recommenderVersion": "1.0.0",
            "qualityGateResults": [],
            "unresolvedFindingIds": [],
            "unresolvedUnknowns": [],
            "requiredManualReviews": [
                {
                    "manualReviewId": f"manual-review:{request['generation_job_id']}",
                    "reviewType": "governance",
                    "reason": "Human review is required before publication readiness.",
                    "owner": {"kind": "human", "label": "Stage 9 reviewer"},
                    "blocking": True,
                    "status": "PENDING",
                    "reviewResult": "DEFERRED",
                }
            ],
            "acceptedBacklog": [],
            "coverage": coverage,
            "governanceRationale": "The persisted workflow requires explicit human review.",
            "recommendedAt": "2026-07-20T00:00:00Z",
            "metadata": {"generationJobId": request["generation_job_id"]},
        },
    }


def _default_didactic_payload(
    request: dict[str, Any], references: dict[str, Any]
) -> dict[str, Any]:
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
    missing = [name for name in required if name not in references]
    if missing:
        raise ACPProcessFailure(
            "ACP_INPUT_DEPENDENCY_MISSING",
            f"missing didactic dependencies: {', '.join(missing)}",
        )

    def version_object(value: Any) -> dict[str, Any]:
        if isinstance(value, dict):
            return dict(value)
        parts = str(value or "1.0.0").split(".")
        if len(parts) != 3 or not all(part.isdigit() for part in parts):
            raise ACPProcessFailure(
                "ACP_INPUT_VERSION_INVALID", "persisted semantic version is invalid"
            )
        return {
            "major": int(parts[0]),
            "minor": int(parts[1]),
            "patch": int(parts[2]),
            "prerelease": [],
            "build": [],
        }

    def contribution(name: str) -> dict[str, Any]:
        raw = references[name].canonical_json
        if not isinstance(raw, dict):
            raise ACPProcessFailure(
                "ACP_INPUT_DEPENDENCY_MISSING",
                f"canonical {name} contribution is unavailable",
            )
        value = dict(raw)
        for field in ("agentVersion", "packageVersion", "payloadSchemaVersion"):
            value[field] = version_object(value.get(field))
        return value

    curriculum_raw = references["curriculum"].canonical_json
    if not isinstance(curriculum_raw, dict):
        raise ACPProcessFailure(
            "ACP_INPUT_DEPENDENCY_MISSING", "canonical curriculum is unavailable"
        )
    curriculum = dict(curriculum_raw)
    curriculum["contractVersion"] = version_object(curriculum.get("contractVersion"))
    lifecycle = curriculum.get("lifecycle")
    if isinstance(lifecycle, dict) and "version" in lifecycle:
        curriculum["lifecycle"] = {**lifecycle, "version": version_object(lifecycle["version"])}

    ordered = [
        ("evidence", "researchContribution"),
        ("knowledge", "knowledgeContribution"),
        ("application", None),
        ("code_laboratory", None),
        ("assessment", None),
        ("narrative", None),
        ("curiosity", None),
    ]
    contributions = [contribution(name) for name, _ in ordered]
    dependency_fingerprints = {
        str(item["contributionId"]): hashlib.sha256(
            json.dumps(item, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        for item in contributions
    }
    assembled_input = {
            "executionId": request["generation_job_id"],
            "requestId": request["request_id"],
            "contributionId": f"contribution:{request['generation_job_id']}:didactic",
            "agentId": "didactic",
            "contractVersions": {
                "curriculum": version_object(curriculum.get("contractVersion")),
                "agent-contribution": version_object("1.0.0"),
            },
            "qualifiedRequest": {
                "curriculumNodeId": request["curriculum_node_id"],
                "requestedPackageType": request["requested_package_type"],
            },
            "curriculumContract": curriculum,
            "researchContribution": contributions[0],
            "knowledgeContribution": contributions[1],
            "availableEnrichmentContributions": contributions[2:],
            "contributions": contributions,
            "expectedAudience": "learner",
            "expectedDepth": "working_knowledge",
            "dependencyFingerprints": dependency_fingerprints,
            "curriculumNodeId": request["curriculum_node_id"],
    }
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
        "semantic_input": assembled_input,
        "input": assembled_input,
    }


def _package_id_from_references(references: dict[str, Any]) -> str:
    for name in ("curriculum", "draft", "didactic"):
        reference = references.get(name)
        value = (reference.canonical_json if reference is not None else {}) or {}
        package_id = value.get("packageId") or value.get("metadata", {}).get("packageId")
        if isinstance(package_id, str) and package_id.strip():
            return package_id
    return "package:svd-image-compression-reference"


def _default_compile_payload(request: dict[str, Any], references: dict[str, Any]) -> dict[str, Any]:
    version = {"major": 1, "minor": 0, "patch": 0, "prerelease": [], "build": []}
    contribution_ids = [
        str((reference.canonical_json or {}).get("contributionId"))
        for name, reference in sorted(references.items())
        if name not in {"curriculum", "didactic", "validation", "governance"}
    ]
    draft = {
        "packageId": _package_id_from_references(references),
        "packageVersion": version,
        "title": "Singular Value Decomposition for Image Compression and Low-Rank Approximation",
        "curriculumScope": {"curriculumNodeIds": [request["curriculum_node_id"]]},
        "learningObjectives": [],
        "prerequisites": [],
        "competencies": [],
        "contributionIds": contribution_ids,
        "contentBlocks": [],
        "blockOrder": [],
        "sourceManifest": {"manifestId": "manifest:svd-m9", "version": version, "sources": []},
        "citations": [],
        "laboratoryReferences": [],
        "assessmentReferences": [],
        "assetRequestIds": [],
        "validationResults": [],
        "revisionDirectives": [],
        "lifecycle": {
            "lifecycle": "draft",
            "version": version,
            "approval": "needs_review",
            "publication": "unpublished",
        },
        "createdAt": "2026-07-20T00:00:00Z",
        "updatedAt": "2026-07-20T00:00:00Z",
        "metadata": {},
    }
    assembly_plan = build_assembly_plan_from_persisted_artifact(
        references.get("didactic"),
        contribution_references=references,
        generation_job_id=str(request["generation_job_id"]),
        workflow_id=str(request["workflow_id"]),
        revision_cycle=int(request.get("revision_cycle", 0)),
        curriculum_node_id=str(request["curriculum_node_id"]),
    )
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
        "semantic_input": draft,
        "semantic_context": {
            "expectedDepth": "working_knowledge",
            "assemblyPlan": assembly_plan,
            "contributions": [
                reference.canonical_json
                for name, reference in sorted(references.items())
                if name not in {"curriculum", "didactic", "validation", "governance"}
            ],
            "lifecycleApproval": "needs_review",
            "lifecyclePublication": "unpublished",
        },
    }


def _default_readiness_payload(
    request: dict[str, Any], references: dict[str, Any]
) -> dict[str, Any]:
    version = {"major": 1, "minor": 0, "patch": 0, "prerelease": [], "build": []}
    return {
        "metadata": {"createdAt": "2026-07-20T00:00:00Z", "producerVersion": "1.0.0"},
        "semantic_input": {
            "packageId": _package_id_from_references(references),
            "packageVersion": version,
            "recommendation": "READY_FOR_PUBLICATION",
            "recommender": {"kind": "governance", "label": "BIP governance"},
            "recommenderVersion": version,
            "qualityGateResults": [],
            "unresolvedFindingIds": [],
            "requiredManualReviews": [],
            "acceptedBacklog": [],
            "coverage": {
                name: {"status": "evaluated", "value": 1}
                for name in (
                    "source",
                    "contentBlock",
                    "asset",
                    "laboratory",
                    "assessment",
                    "accessibility",
                    "governance",
                )
            },
            "governanceRationale": "All required Stage 9 gates are satisfied.",
            "recommendedAt": "2026-07-20T00:00:00Z",
            "metadata": {"generationJobId": request["generation_job_id"]},
        },
    }


if activity is not None:

    @activity.defn(name="ProduceACPArtifactActivity")
    async def produce_acp_artifact(request: dict[str, Any]) -> dict[str, Any]:
        """Run one bounded ACP operation and return only an artifact reference."""
        service = _persistence_service()
        if request.get("artifact_references") and service is None:
            raise ACPProcessFailure(
                "WORKFLOW_ARTIFACT_REFERENCE_NOT_FOUND", "persisted dependencies require PostgreSQL"
            )
        try:
            references = (
                load_canonical_activity_dependencies(
                    service._session_factory,
                    request,  # noqa: SLF001 - activity boundary owns loading
                )
                if service is not None
                else {}
            )
        except Exception as error:
            code = getattr(error, "code", "WORKFLOW_ARTIFACT_REFERENCE_NOT_FOUND")
            raise ACPProcessFailure(str(code), str(error)) from error
        if str(request.get("operation")) == "produce_curriculum_contract":
            if service is None:
                raise ACPProcessFailure(
                    "GENERATION_REQUEST_REFERENCE_NOT_FOUND",
                    "database is required for curriculum bootstrap",
                )
            request = {**request, "payload": _bootstrap_curriculum_payload(service, request)}
        elif str(request.get("operation")) == "produce_didactic_assembly_plan":
            request = {**request, "payload": _default_didactic_payload(request, references)}
        elif str(request.get("operation", "")) in {
            "produce_evidence_contribution",
            "produce_knowledge_contribution",
            "produce_application_contribution",
            "produce_code_laboratory_contribution",
            "produce_assessment_contribution",
            "produce_narrative_contribution",
            "produce_curiosity_contribution",
        }:
            payload = request.get("payload")
            if not isinstance(payload, dict) or "semantic_input" not in payload:
                request = {**request, "payload": _default_contribution_payload(request, references)}
        elif str(request.get("operation")) == "produce_governance_review":
            request = {**request, "payload": _default_governance_payload(request, references)}
        elif str(request.get("operation")) == "compile_learning_package_draft":
            try:
                request = {**request, "payload": _default_compile_payload(request, references)}
            except AcpInputAssemblyError as error:
                raise ACPProcessFailure(error.code, str(error)) from error
        elif str(request.get("operation")) == "produce_publication_readiness_recommendation":
            request = {**request, "payload": _default_readiness_payload(request, references)}
        try:
            assembled, input_fingerprint, spec = assemble_acp_input(request, references)
        except AcpInputAssemblyError as error:
            raise ACPProcessFailure(error.code, str(error)) from error
        adapter = ACPProcessAdapter()
        info = activity.info()
        result = await adapter.execute(
            request_id=str(request["request_id"]),
            operation=str(request["operation"]),
            operation_version=spec.operation_version.value,
            idempotency_key=str(request["idempotency_key"]),
            correlation_id=str(request["correlation_id"]),
            payload=assembled,
            input_contract={
                "name": spec.input_contract_name,
                "version": spec.input_contract_version.value,
            },
            deadline=request.get("deadline"),
            heartbeat=activity.heartbeat,
        )
        stable: dict[str, Any] = {
            "contract_name": result.contract_name,
            "contract_version": result.contract_version,
            "artifact_fingerprint": result.artifact_fingerprint,
            "artifact_id": f"xfi:{result.artifact_fingerprint}",
            "activity_id": info.activity_id,
            "assembled_input_fingerprint": input_fingerprint,
            "canonical_agent_identity": spec.canonical_agent_identity,
        }
        if service is not None:
            intake = read_canonical_input(result.raw_canonical_json)
            if not intake.accepted or intake.intake is None:
                raise ValueError("ACP_CONTRACT_INVALID")
            persisted = service.accept(
                intake.intake,
                idempotency_key=str(request["idempotency_key"]),
                generation_job_id=UUID(str(request["generation_job_id"])),
                workflow_id=str(request["workflow_id"]),
                revision_cycle=int(request.get("revision_cycle", 0)),
                operation=str(request["operation"]),
                operation_version=spec.operation_version.value,
                dependency_artifact_ids=[ref.artifact_id for ref in references.values()],
                dependency_fingerprints=[ref.artifact_fingerprint for ref in references.values()],
                agent_identity=str(request.get("agent_identity", request["operation"])),
                assembled_input_fingerprint=input_fingerprint,
            )
            if not persisted.accepted or persisted.response is None:
                code = (
                    persisted.failure.code if persisted.failure else "ACTIVITY_PERSISTENCE_FAILED"
                )
                raise RuntimeError(code)
            stable["artifact_id"] = str(persisted.response.canonical_input_id)
            stable["raw_artifact_reference"] = str(persisted.response.canonical_input_id)
            stable["persistence_locator"] = str(persisted.response.canonical_input_id)
            stable["replayed"] = persisted.response.replayed
            stable["agent_run_id"] = (
                str(persisted.response.agent_run_id) if persisted.response.agent_run_id else None
            )
            stable["agent_contribution_id"] = (
                str(persisted.response.agent_contribution_id)
                if persisted.response.agent_contribution_id
                else None
            )
        stable.update(
            {
                "operation": str(request["operation"]),
                "operation_version": spec.operation_version.value,
                "canonical_producer_id": spec.canonical_agent_identity,
                "artifact_domain_id": stable["artifact_id"],
                "dependency_artifact_ids": [ref.artifact_id for ref in references.values()],
                "dependency_fingerprints": [
                    ref.artifact_fingerprint for ref in references.values()
                ],
            }
        )
        if len(str(stable).encode("utf-8")) > MAX_ACTIVITY_RESULT_BYTES:
            raise ACPProcessFailure(
                "ACTIVITY_RESULT_TOO_LARGE", "activity result exceeds its bound"
            )
        return stable


async def run_agent_worker(address: str, namespace: str = "neuralverse") -> None:
    if activity is None:
        raise RuntimeError("temporalio is not installed")
    client = await Client.connect(address, namespace=namespace)
    async with Worker(client, task_queue=AGENT_TASK_QUEUE, activities=[produce_acp_artifact]):
        await asyncio.Future()


def main() -> None:
    import os

    asyncio.run(
        run_agent_worker(
            os.getenv("TEMPORAL_ADDRESS", "temporal:7233"),
            os.getenv("TEMPORAL_NAMESPACE", "neuralverse"),
        )
    )


if __name__ == "__main__":
    main()
