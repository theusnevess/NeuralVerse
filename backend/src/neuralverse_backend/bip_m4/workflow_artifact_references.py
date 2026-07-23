"""Bounded persisted artifact references used by the durable workflow."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import asdict, dataclass
from typing import Any

REFERENCE_SLOTS = (
    "curriculum_contract",
    "evidence_contribution",
    "knowledge_contribution",
    "application_contribution",
    "code_laboratory_contribution",
    "assessment_contribution",
    "narrative_contribution",
    "curiosity_contribution",
    "didactic_assembly_plan",
    "cross_agent_validation_results",
    "governance_review",
    "revision_directives",
    "learning_package_draft",
    "publication_readiness_recommendation",
)


class WorkflowArtifactReferenceError(ValueError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


@dataclass(frozen=True, slots=True)
class WorkflowArtifactReference:
    artifact_domain_id: str
    contract_name: str
    contract_version: str
    artifact_fingerprint: str
    canonical_producer_id: str
    operation: str
    operation_version: str
    generation_job_id: str
    workflow_id: str
    revision_cycle: int
    persistence_locator: str
    input_fingerprint: str | None = None
    dependency_artifact_ids: tuple[str, ...] = ()
    dependency_fingerprints: tuple[str, ...] = ()

    def to_dict(self) -> dict[str, Any]:
        value = asdict(self)
        value["dependency_artifact_ids"] = list(self.dependency_artifact_ids)
        value["dependency_fingerprints"] = list(self.dependency_fingerprints)
        return value

    @classmethod
    def from_result(
        cls,
        result: Mapping[str, Any],
        *,
        generation_job_id: str,
        workflow_id: str,
        revision_cycle: int,
    ) -> WorkflowArtifactReference:
        required = (
            "artifact_id",
            "contract_name",
            "contract_version",
            "artifact_fingerprint",
            "canonical_producer_id",
            "operation",
            "operation_version",
        )
        if any(not str(result.get(key, "")).strip() for key in required):
            raise WorkflowArtifactReferenceError(
                "WORKFLOW_ARTIFACT_REFERENCE_INVALID",
                "activity did not return a stable artifact reference",
            )
        return cls(
            artifact_domain_id=str(result.get("artifact_domain_id", result["artifact_id"])),
            contract_name=str(result["contract_name"]),
            contract_version=str(result["contract_version"]),
            artifact_fingerprint=str(result["artifact_fingerprint"]),
            canonical_producer_id=str(result["canonical_producer_id"]),
            operation=str(result["operation"]),
            operation_version=str(result["operation_version"]),
            generation_job_id=generation_job_id,
            workflow_id=workflow_id,
            revision_cycle=revision_cycle,
            persistence_locator=str(result.get("persistence_locator", result["artifact_id"])),
            input_fingerprint=(
                str(result["assembled_input_fingerprint"])
                if result.get("assembled_input_fingerprint")
                else None
            ),
            dependency_artifact_ids=tuple(
                str(item) for item in result.get("dependency_artifact_ids", ())
            ),
            dependency_fingerprints=tuple(
                str(item) for item in result.get("dependency_fingerprints", ())
            ),
        )

    @classmethod
    def from_dict(cls, value: Mapping[str, Any]) -> WorkflowArtifactReference:
        try:
            return cls(
                artifact_domain_id=str(value["artifact_domain_id"]),
                contract_name=str(value["contract_name"]),
                contract_version=str(value["contract_version"]),
                artifact_fingerprint=str(value["artifact_fingerprint"]),
                canonical_producer_id=str(value["canonical_producer_id"]),
                operation=str(value["operation"]),
                operation_version=str(value["operation_version"]),
                generation_job_id=str(value["generation_job_id"]),
                workflow_id=str(value["workflow_id"]),
                revision_cycle=int(value["revision_cycle"]),
                persistence_locator=str(value["persistence_locator"]),
                input_fingerprint=(
                    str(value["input_fingerprint"]) if value.get("input_fingerprint") else None
                ),
                dependency_artifact_ids=tuple(
                    str(item) for item in value.get("dependency_artifact_ids", ())
                ),
                dependency_fingerprints=tuple(
                    str(item) for item in value.get("dependency_fingerprints", ())
                ),
            )
        except (KeyError, TypeError, ValueError) as error:
            raise WorkflowArtifactReferenceError(
                "WORKFLOW_ARTIFACT_REFERENCE_INVALID", "artifact reference metadata is invalid"
            ) from error


@dataclass(frozen=True, slots=True)
class WorkflowArtifactReferenceMap:
    values: dict[str, WorkflowArtifactReference]

    @classmethod
    def empty(cls) -> WorkflowArtifactReferenceMap:
        return cls({})

    def put(self, slot: str, reference: WorkflowArtifactReference) -> WorkflowArtifactReferenceMap:
        if slot not in REFERENCE_SLOTS:
            raise WorkflowArtifactReferenceError(
                "WORKFLOW_ARTIFACT_REFERENCE_INVALID", f"unknown artifact slot: {slot}"
            )
        result = dict(self.values)
        result[slot] = reference
        return WorkflowArtifactReferenceMap(result)

    def invalidate(self, slots: set[str]) -> WorkflowArtifactReferenceMap:
        return WorkflowArtifactReferenceMap(
            {key: value for key, value in self.values.items() if key not in slots}
        )

    def for_activity(self, operation: str) -> dict[str, dict[str, Any]]:
        descriptor = OPERATION_DEPENDENCIES[operation]
        missing = [slot for slot in descriptor.required if slot not in self.values]
        if missing:
            raise WorkflowArtifactReferenceError(
                "WORKFLOW_ARTIFACT_DEPENDENCY_MISSING",
                f"missing persisted dependencies for {operation}: {', '.join(missing)}",
            )
        return {
            ASSEMBLY_ROLES.get(role, role): self.values[role].to_dict()
            for role in (*descriptor.required, *descriptor.optional)
            if role in self.values
        }

    def bounded(self) -> dict[str, dict[str, Any]]:
        return {key: value.to_dict() for key, value in sorted(self.values.items())}


@dataclass(frozen=True, slots=True)
class ActivityDependencyDescriptor:
    required: tuple[str, ...]
    optional: tuple[str, ...] = ()
    expected_contract: str | None = None
    expected_producer: str | None = None
    allowed_revision_policy: str = "current"
    allowed_multiplicity: str = "one"
    ordering_policy: str = "canonical"


OPERATION_DEPENDENCIES: dict[str, ActivityDependencyDescriptor] = {
    "produce_curriculum_contract": ActivityDependencyDescriptor(()),
    "produce_evidence_contribution": ActivityDependencyDescriptor(("curriculum_contract",)),
    "produce_knowledge_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "evidence_contribution")
    ),
    "produce_application_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "knowledge_contribution"), ("evidence_contribution",)
    ),
    "produce_code_laboratory_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "knowledge_contribution"), ("application_contribution",)
    ),
    "produce_assessment_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "knowledge_contribution")
    ),
    "produce_narrative_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "knowledge_contribution"), ("didactic_assembly_plan",)
    ),
    "produce_curiosity_contribution": ActivityDependencyDescriptor(
        ("curriculum_contract", "knowledge_contribution"), ("evidence_contribution",)
    ),
    "produce_didactic_assembly_plan": ActivityDependencyDescriptor(
        (
            "curriculum_contract",
            "evidence_contribution",
            "knowledge_contribution",
            "application_contribution",
            "code_laboratory_contribution",
            "assessment_contribution",
            "narrative_contribution",
            "curiosity_contribution",
        )
    ),
    "validate_cross_agent_contributions": ActivityDependencyDescriptor(
        (
            "curriculum_contract",
            "evidence_contribution",
            "knowledge_contribution",
            "application_contribution",
            "code_laboratory_contribution",
            "assessment_contribution",
            "narrative_contribution",
            "curiosity_contribution",
            "didactic_assembly_plan",
        )
    ),
    "produce_governance_review": ActivityDependencyDescriptor(
        ("didactic_assembly_plan", "cross_agent_validation_results")
    ),
    "compile_learning_package_draft": ActivityDependencyDescriptor(
        (
            "curriculum_contract",
            "didactic_assembly_plan",
            "cross_agent_validation_results",
            "governance_review",
            "evidence_contribution",
            "knowledge_contribution",
            "application_contribution",
            "code_laboratory_contribution",
            "assessment_contribution",
            "narrative_contribution",
            "curiosity_contribution",
        )
    ),
    "produce_publication_readiness_recommendation": ActivityDependencyDescriptor(
        ("learning_package_draft", "governance_review", "cross_agent_validation_results")
    ),
}

ASSEMBLY_ROLES = {
    "curriculum_contract": "curriculum",
    "evidence_contribution": "evidence",
    "knowledge_contribution": "knowledge",
    "application_contribution": "application",
    "code_laboratory_contribution": "code_laboratory",
    "assessment_contribution": "assessment",
    "narrative_contribution": "narrative",
    "curiosity_contribution": "curiosity",
    "didactic_assembly_plan": "didactic",
    "cross_agent_validation_results": "validation",
    "governance_review": "governance",
    "learning_package_draft": "draft",
    "publication_readiness_recommendation": "readiness",
}


def validate_reference_ownership(
    reference: WorkflowArtifactReference,
    *,
    generation_job_id: str,
    workflow_id: str,
    revision_cycle: int,
    expected_operation: str,
    expected_contract: str,
    expected_producer: str,
    expected_contract_version: str,
) -> None:
    checks = (
        (reference.generation_job_id == generation_job_id, "WORKFLOW_ARTIFACT_JOB_MISMATCH"),
        (reference.workflow_id == workflow_id, "WORKFLOW_ARTIFACT_WORKFLOW_MISMATCH"),
        (reference.revision_cycle == revision_cycle, "WORKFLOW_ARTIFACT_REVISION_MISMATCH"),
        (
            reference.canonical_producer_id == expected_producer,
            "WORKFLOW_ARTIFACT_PRODUCER_MISMATCH",
        ),
        (reference.operation == expected_operation, "WORKFLOW_ARTIFACT_PRODUCER_MISMATCH"),
        (reference.contract_name == expected_contract, "WORKFLOW_ARTIFACT_SCHEMA_UNSUPPORTED"),
        (
            reference.contract_version == expected_contract_version,
            "WORKFLOW_ARTIFACT_SCHEMA_UNSUPPORTED",
        ),
    )
    for valid, code in checks:
        if not valid:
            raise WorkflowArtifactReferenceError(
                code, "artifact reference ownership validation failed"
            )


def assert_fingerprint(reference: WorkflowArtifactReference, actual: str) -> None:
    if reference.artifact_fingerprint != actual:
        raise WorkflowArtifactReferenceError(
            "WORKFLOW_ARTIFACT_FINGERPRINT_MISMATCH",
            "persisted artifact fingerprint does not match reference",
        )
