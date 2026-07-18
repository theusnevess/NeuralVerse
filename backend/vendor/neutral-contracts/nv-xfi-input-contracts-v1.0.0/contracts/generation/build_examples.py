"""Build the canonical ten-case example matrix from the reviewed base payloads."""

from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path
from typing import Any, cast

ROOT = Path(__file__).parents[1]
CONTRACTS = {
    "CurriculumContract": "curriculum-contract",
    "AgentContribution": "agent-contribution",
    "LearningPackageDraft": "learning-package-draft",
    "PublicationReadinessRecommendation": "publication-readiness-recommendation",
}
CASES = (
    "minimal-valid",
    "complete-valid",
    "compatible-minor-extension",
    "nested-unknown-field",
    "explicit-null",
    "missing-optional",
    "ordered-array",
    "unsupported-major",
    "unsupported-minimum-reader",
    "invalid-structure",
)


def load(path: Path) -> dict[str, Any]:
    return cast(dict[str, Any], json.loads(path.read_text(encoding="utf-8")))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def prepare(base: dict[str, Any], contract: str, case: str) -> dict[str, Any]:
    value = deepcopy(base)
    value.update(
        {
            "schema_name": contract,
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "1.0.0",
            "created_at": "2026-07-17T00:00:00Z",
            "extensions": {"xfi:fixture": f"{contract}:{case}"},
        }
    )
    value.setdefault("metadata", {})
    value["metadata"]["xfi:fixture-case"] = case
    if contract == "CurriculumContract":
        value["expectedDepth"] = {
            "level": "working_knowledge",
            "scopeIds": ["concept:vector"],
            "rationale": "The lesson requires working knowledge before application.",
            "evidenceReferences": ["source:curriculum-guidance"],
        }
        value["prerequisites"] = [
            {
                "prerequisiteId": "prerequisite:vector-basics",
                "kind": "concept",
                "targetId": "concept:vector",
                "status": "required",
                "depth": "basic_understanding",
            }
        ]
        value["forwardConnections"] = [
            {
                "connectionId": "connection:matrix-operations",
                "targetId": "node:matrix-operations",
                "connectionType": "extends",
                "rationale": "Vectors lead into matrix operations.",
                "priority": 10,
            }
        ]
        value["cognitiveProgressionConstraints"] = [
            {
                "constraintId": "constraint:concept-before-application",
                "constraintType": "concept_before_application",
                "affectedIds": ["concept:vector", "node:linear-algebra"],
                "rationale": "The concept must precede application work.",
                "enforcement": "required",
            }
        ]
    elif contract == "LearningPackageDraft":
        value["expectedDepth"] = {
            "level": "working_knowledge",
            "scopeIds": ["node:linear-algebra"],
            "rationale": "The package develops working knowledge.",
            "sourceReferences": ["source:curriculum-guidance"],
        }
        value["agentContributions"] = [
            {
                "contributionId": "contribution:vector-definition",
                "agentId": "agent:knowledge",
                "agentVersion": "1.0.0",
                "contributionType": "conceptual_definition",
                "usedIds": ["block:definition"],
                "citationIds": [],
            }
        ]
        value["assemblyPlan"] = {
            "planId": "assembly:math-package",
            "planVersion": "1.0.0",
            "stages": [
                {
                    "stageId": "stage:content-order",
                    "stageType": "ordered_content_assembly",
                    "order": 0,
                    "inputContributionIds": ["contribution:vector-definition"],
                    "targetIds": ["block:definition"],
                    "dependencies": [],
                }
            ],
            "inputContributionIds": ["contribution:vector-definition"],
            "rationale": "Assemble governed contributions into ordered blocks.",
            "unresolvedConstraints": [],
        }
        value["coverageReport"] = [
            {
                "dimension": "source",
                "targetRequirement": "source traceability",
                "observedCoverage": 1,
                "status": "covered",
                "evidenceReferences": ["source:curriculum-guidance"],
                "knownGaps": [],
                "unknownState": "known",
            }
        ]
        value["unresolvedFindings"] = []
        value["laboratoryReferences"] = [
            {
                "laboratorySpecId": "laboratory:vector-demo",
                "laboratorySpecVersion": "1.0.0",
                "semanticType": "interactive_experiment",
                "relationship": ["block:definition"],
                "requiredCapability": "vector_visualization",
            }
        ]
        value["assessmentReferences"] = [
            {
                "assessmentSpecId": "assessment:dot-product",
                "assessmentSpecVersion": "1.0.0",
                "assessmentType": "concept_check",
                "competencyIds": ["competency:reasoning"],
                "relationship": ["block:definition"],
            }
        ]
    elif contract == "AgentContribution":
        value["structuredPayload"] = {
            "payload_type": "concept_explanation",
            "definition": "An ordered element of a vector space.",
            "concepts": [{"concept_id": "concept:vector", "role": "primary"}],
        }
    elif contract == "PublicationReadinessRecommendation":
        value["qualityGateResults"] = [
            {
                "gateId": "gate:source-coverage",
                "gateResult": "PASS_WITH_FINDINGS",
                "severity": "P2",
                "findings": [],
                "evidenceReferences": ["source:curriculum-guidance"],
                "manualReviewRequired": False,
                "unresolvedUnknowns": [],
            }
        ]
        value["acceptedBacklog"] = [
            {
                "backlogItemId": "backlog:visual-example",
                "category": "asset",
                "description": "Add an optional visual example.",
                "severity": "P2",
                "reasonForAcceptance": "The omission is non-blocking.",
                "affectedPackageArea": "content",
                "evidenceReferences": ["source:curriculum-guidance"],
                "requiredFollowUp": "Review in the next authoring cycle.",
                "blocking": False,
            }
        ]
        value["unresolvedUnknowns"] = []
    if case in {"complete-valid", "compatible-minor-extension"}:
        value["metadata"]["xfi:complete"] = {
            "unicode": "μ → ∞",
            "decimal": "001.2300",
            "nestedFutureField": {"kept": True},
        }
        value["extensions"]["xfi:compatible-extension"] = {"enabled": True}
    if case == "nested-unknown-field":
        value["metadata"]["xfi:nested-future"] = {"unknown": ["preserve", "order"]}
    if case == "explicit-null":
        value["extensions"]["xfi:nullable-note"] = None
    if case == "missing-optional":
        value["metadata"].pop("optional-field", None)
    if case == "ordered-array":
        value["metadata"]["xfi:ordered"] = ["first", "second", "third"]
        if contract == "CurriculumContract":
            value["targetConceptIds"] = ["concept:first", "concept:second", "concept:third"]
        elif contract == "AgentContribution":
            value["citationIds"] = ["citation:first", "citation:second", "citation:third"]
        elif contract == "LearningPackageDraft":
            value["blockOrder"] = ["block:definition", "block:second", "block:third"]
        else:
            value["unresolvedFindingIds"] = ["finding:first", "finding:second", "finding:third"]
    if case == "compatible-minor-extension":
        value["schema_version"] = "1.1.0"
    if case == "unsupported-major":
        value["schema_version"] = "2.0.0"
    if case == "unsupported-minimum-reader":
        value["minimum_reader_version"] = "2.0.0"
    if case == "invalid-structure":
        value.pop("metadata", None)
        if contract == "AgentContribution":
            value["structuredPayload"] = {"text": "free-form only"}
    return value


def build() -> None:
    for contract, directory in CONTRACTS.items():
        group = ROOT / "examples/golden" / directory / "1.0.0"
        base = load(group / "complete-valid.json")
        expected: list[dict[str, Any]] = []
        for case in CASES:
            filename = f"{case}.json"
            value = prepare(base, contract, case)
            path = group / filename
            write(path, value)
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            invalid = case == "invalid-structure"
            compatibility = (
                "UNSUPPORTED_SCHEMA_MAJOR_VERSION"
                if case == "unsupported-major"
                else "MINIMUM_READER_VERSION_UNSUPPORTED"
                if case == "unsupported-minimum-reader"
                else "NOT_EVALUATED"
                if invalid
                else "COMPATIBLE"
            )
            expected.append(
                {
                    "case_id": f"{directory}:1.0.0:{case}",
                    "file": filename,
                    "contract_name": contract,
                    "schema_id": f"urn:neuralverse:xfi:contract:{directory}:1.0.0",
                    "schema_version": "1.0.0",
                    "exact_byte_sha256": digest,
                    "expected_structural_result": "INVALID" if invalid else "VALID",
                    "expected_compatibility_status": compatibility,
                    "expected_error_code": "INVALID_CONTRACT_STRUCTURE" if invalid else None,
                    "expected_preservation_assertions": []
                    if invalid
                    else [
                        "unknown_top_level_preserved",
                        "extensions_preserved",
                        "array_order_preserved",
                        "explicit_null_preserved",
                        "missing_optional_preserved",
                        "unicode_preserved",
                        "identifiers_preserved",
                        "timestamps_preserved",
                        "decimals_preserved",
                    ],
                    "expected_mutation": False,
                    "expected_rewrite": False,
                }
            )
        write(group / "expected-results.json", {"cases": expected})


if __name__ == "__main__":
    build()
