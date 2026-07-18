# GENERATED FILE. DO NOT EDIT.
# source_schema_id = urn:neuralverse:xfi:contract:agent-contribution:1.0.0
# source_schema_version = 1.0.0
# source_schema_sha256 = adfead3dc5cc22e9a91b205448227c0b22dd89373d1d3fa5eed6987f8e9f39f3
# generator = neuralverse-contract-projections/1.0.0
from __future__ import annotations
from typing import Any, Literal, TypedDict

JsonValue = Any

Identifiers = list[str]

class Dependency(TypedDict, total=False):
    kind: Literal['contribution', 'source', 'citation', 'concept', 'curriculum_node']
    id: str

class ValidationResult(TypedDict, total=False):
    status: Literal['PASS', 'PASS_WITH_FINDINGS', 'FAIL', 'UNKNOWN']
    valid: bool
    findings: list[JsonValue]
    value: JsonValue  # optional
    checkedAt: str  # optional

class AgentContribution(TypedDict, total=False):
    schema_name: Literal['AgentContribution']
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    created_at: str
    extensions: dict[str, JsonValue]  # optional
    contributionId: str
    generationJobId: str
    agentId: str
    agentVersion: str
    packageId: str
    packageVersion: str
    contributionType: Literal['conceptual_definition', 'dependency_analysis', 'research_evidence', 'application_guidance', 'laboratory_observation', 'assessment_guidance', 'narrative_framing', 'curiosity_prompt', 'didactic_structure', 'governance_finding', 'visual_recommendation']
    inputDependencies: list[Dependency]
    payloadSchemaVersion: str
    structuredPayload: dict[str, JsonValue]
    citationIds: Identifiers
    assetRequestIds: Identifiers
    validationResults: list[ValidationResult]
    warnings: list[JsonValue]
    confidence: float
    createdAt: str
    metadata: dict[str, JsonValue]
