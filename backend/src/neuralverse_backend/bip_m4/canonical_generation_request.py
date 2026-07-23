"""Internal, persisted BIP generation-request contract."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any
from uuid import UUID

REQUEST_VERSION = "1.0.0"
PACKAGE_TYPE = "CONCEPT_IMPLEMENTATION_LAB"


@dataclass(frozen=True, slots=True)
class GenerationRequestReference:
    generation_request_id: str
    generation_job_id: str
    request_version: str
    request_fingerprint: str
    raw_artifact_reference: str
    curriculum_node_id: str
    requested_package_type: str
    workflow_policy_version: str
    activity_policy_version: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "generation_request_id": self.generation_request_id,
            "generation_job_id": self.generation_job_id,
            "request_version": self.request_version,
            "request_fingerprint": self.request_fingerprint,
            "raw_artifact_reference": self.raw_artifact_reference,
            "curriculum_node_id": self.curriculum_node_id,
            "requested_package_type": self.requested_package_type,
            "workflow_policy_version": self.workflow_policy_version,
            "activity_policy_version": self.activity_policy_version,
        }


def _version() -> dict[str, Any]:
    return {"major": 1, "minor": 0, "patch": 0, "prerelease": [], "build": []}


def build_generation_request(
    request: Mapping[str, Any], *, generation_job_id: str
) -> dict[str, Any]:
    curriculum_node_id = str(
        request.get("curriculum_node_id", "module-0.mathematics.svd.image-compression")
    )
    package_type = str(request.get("requested_package_type", PACKAGE_TYPE))
    package_id = str(request.get("curriculum_identity", "package:svd-image-compression-reference"))
    return {
        "request_version": REQUEST_VERSION,
        "generation_job_id": generation_job_id,
        "package_id": package_id,
        "curriculum_node_id": curriculum_node_id,
        "curriculum_key": "module-0.mathematics.svd.image-compression",
        "module_identity": "Module 0 — Data Science Foundations & Applied Mathematics",
        "domain_identity": "Mathematics",
        "topic_identity": "Singular Value Decomposition",
        "lesson_title": (
            "Singular Value Decomposition for Image Compression and Low-Rank Approximation"
        ),
        "requested_package_type": package_type,
        "target_competencies": [
            "explain A = UΣVᵀ",
            "interpret singular values and rank",
            "construct a rank-k approximation",
            "measure reconstruction error",
            "estimate retained spectral energy",
            "apply SVD to image compression",
            "analyze compression-quality trade-offs",
        ],
        "prerequisites": [
            {"name": "linear systems", "depth": "working_knowledge"},
            {"name": "matrix and vector operations", "depth": "working_knowledge"},
            {"name": "vector norms", "depth": "basic_understanding"},
            {"name": "image arrays", "depth": "basic_understanding"},
            {"name": "Python and NumPy", "depth": "basic_understanding"},
        ],
        "target_audience": "technical learner",
        "expected_learning_outcomes": [
            "derive and interpret the SVD decomposition",
            "implement and evaluate rank-k image compression",
        ],
        "required_artifact_categories": [
            "narrative",
            "explanation",
            "concept",
            "derivation",
            "example",
            "application",
            "code",
            "laboratory",
            "assessment",
            "reference",
        ],
        "research_requirements": {"minimum_sources": 2, "freshness": "STABLE"},
        "mathematics_requirements": {"include_derivation": True, "numerical_checks": True},
        "implementation_requirements": {"language": "python", "library": "numpy"},
        "visualization_requirements": {"required": True, "format": "matrix_and_plot"},
        "laboratory_requirements": {"required": True, "execution": "sandboxed"},
        "assessment_requirements": {"required": True, "mastery_inference": False},
        "governance_requirements": {"human_review": True, "publication_transaction": False},
        "source_quality_policy": {"minimum_quality": "peer_reviewed_or_official"},
        "citation_policy": {"required": True, "unresolved_claims": "BLOCK"},
        "requested_xfi_contract_versions": {
            "CurriculumContract": "1.0.0",
            "AgentContribution": "1.0.0",
            "LearningPackageDraft": "1.0.0",
            "PublicationReadinessRecommendation": "1.0.0",
        },
        "workflow_policy_version": str(request.get("workflow_policy_version", "1.0.0")),
        "activity_policy_version": str(request.get("activity_policy_version", "1.0.0")),
        "maximum_revision_cycles": int(request.get("maximum_revision_cycles", 1)),
        "extensions": {},
    }


def semantic_input(value: Mapping[str, Any]) -> dict[str, Any]:
    version = _version()
    prerequisites = [
        {
            "prerequisiteId": f"prerequisite:{item['name']}",
            "kind": "concept",
            "targetId": f"concept:{item['name']}",
            "status": "required",
            "depth": item["depth"],
        }
        for item in value["prerequisites"]
    ]
    return {
        "schema_name": "CurriculumContract",
        "schema_version": "1.0.0",
        "minimum_reader_version": "1.0.0",
        "producer_version": "1.0.0",
        "agentId": "curriculum-dependency",
        "generationJobId": value["generation_job_id"],
        "packageId": value["package_id"],
        "contractId": f"curriculum-contract:{value['curriculum_key']}",
        "contractVersion": version,
        "curriculumScope": {"curriculumNodeIds": [value["curriculum_node_id"]]},
        "targetConceptIds": [f"concept:{value['topic_identity'].lower().replace(' ', '-')}"],
        "targetCurriculumNodeIds": [value["curriculum_node_id"]],
        "learningObjectives": [
            {
                "objectiveId": f"objective:svd:{index}",
                "statement": outcome,
                "requirementStatus": "REQUIRED",
                "competencyIds": [f"competency:svd:{index}"],
                "conceptIds": [f"concept:{value['topic_identity'].lower().replace(' ', '-')}"],
            }
            for index, outcome in enumerate(value["expected_learning_outcomes"])
        ],
        "prerequisites": prerequisites,
        "competencies": [
            f"competency:svd:{index}" for index, _ in enumerate(value["target_competencies"])
        ],
        "dependencyEdges": [],
        "requiredArtifactTypes": value["required_artifact_categories"],
        "requiredAgentContributions": [
            {"agentId": agent, "contributionType": f"{agent}_contribution", "required": True}
            for agent in [
                "research",
                "knowledge",
                "application",
                "laboratory",
                "assessment",
                "narrative",
                "curiosity",
                "didactic",
            ]
        ],
        "constraintSet": {
            "expectedDepth": "working_knowledge",
            "packageType": value["requested_package_type"],
        },
        "validationResults": [],
        "lifecycle": {
            "lifecycle": "draft",
            "version": version,
            "approval": "needs_review",
            "publication": "unpublished",
        },
        "createdAt": "2026-07-20T00:00:00.000Z",
        "updatedAt": "2026-07-20T00:00:00.000Z",
        "metadata": {"packageId": value["package_id"], "curriculumKey": value["curriculum_key"]},
    }


def serialize_request(value: Mapping[str, Any]) -> tuple[bytes, str]:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return raw, hashlib.sha256(raw).hexdigest()


def reference_from_record(record: Any) -> GenerationRequestReference:
    return GenerationRequestReference(
        generation_request_id=str(record.generation_request_id),
        generation_job_id=str(record.generation_job_id),
        request_version=str(record.request_version),
        request_fingerprint=str(record.request_fingerprint),
        raw_artifact_reference=str(record.generation_request_id),
        curriculum_node_id=str(record.curriculum_node_id),
        requested_package_type=str(record.requested_package_type),
        workflow_policy_version=str(record.workflow_policy_version),
        activity_policy_version=str(record.activity_policy_version),
    )


def validate_reference(reference: Mapping[str, Any], *, generation_job_id: str) -> None:
    if str(reference.get("generation_job_id")) != generation_job_id:
        raise ValueError("GENERATION_REQUEST_JOB_MISMATCH")
    if str(reference.get("request_version")) != REQUEST_VERSION:
        raise ValueError("GENERATION_REQUEST_VERSION_UNSUPPORTED")


def record_id(value: str) -> UUID:
    return UUID(value)
