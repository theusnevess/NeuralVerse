# GENERATED FILE. DO NOT EDIT.
# source_schema_id = urn:neuralverse:xfi:contract:curriculum-contract:1.0.0
# source_schema_version = 1.0.0
# source_schema_sha256 = 16974e4f8e4334410ab00b72cca204e323861cb7d81eccd35a758eef3ab61302
# generator = neuralverse-contract-projections/1.0.0
from __future__ import annotations
from typing import Any, Literal, TypedDict

JsonValue = Any

Identifier = str
Identifiers = list[Identifier]

class Scope(TypedDict, total=False):
    learningPathId: Identifier  # optional
    moduleId: Identifier  # optional
    lessonId: Identifier  # optional
    curriculumNodeIds: Identifiers

class Objective(TypedDict, total=False):
    objectiveId: Identifier
    statement: str
    requirementStatus: Literal['REQUIRED', 'OPTIONAL', 'CONDITIONAL']
    competencyIds: Identifiers
    conceptIds: Identifiers
    validationCriteria: list[JsonValue]  # optional

class Prerequisite(TypedDict, total=False):
    prerequisiteId: Identifier
    kind: Literal['concept', 'competency', 'curriculum_node']
    targetId: Identifier
    status: Literal['required', 'recommended']
    depth: Literal['awareness', 'basic_understanding', 'working_knowledge', 'advanced_understanding', 'mastery']
    logicalGroup: str  # optional

class Dependency(TypedDict, total=False):
    dependencyId: Identifier
    fromNodeId: Identifier
    toNodeId: Identifier
    relation: Literal['requires', 'precedes', 'reinforces', 'extends', 'contrasts_with', 'applies']
    rationale: str  # optional

class RequiredContribution(TypedDict, total=False):
    agentId: Identifier
    contributionType: str
    required: bool

class ExpectedDepth(TypedDict, total=False):
    level: Literal['awareness', 'basic_understanding', 'working_knowledge', 'advanced_understanding', 'mastery']
    scopeIds: list[Identifier]
    rationale: str
    evidenceReferences: list[str]  # optional

class ForwardConnection(TypedDict, total=False):
    connectionId: Identifier
    targetId: Identifier
    connectionType: str
    rationale: str
    priority: int

class ProgressionConstraint(TypedDict, total=False):
    constraintId: Identifier
    constraintType: str
    affectedIds: list[Identifier]
    rationale: str
    enforcement: Literal['required', 'recommended', 'prohibited']

class ValidationResult(TypedDict, total=False):
    status: Literal['PASS', 'PASS_WITH_FINDINGS', 'FAIL', 'UNKNOWN']
    valid: bool
    findings: list[JsonValue]
    value: JsonValue  # optional
    checkedAt: str  # optional

class Lifecycle(TypedDict, total=False):
    lifecycle: str
    version: str
    approval: str
    publication: str

class CurriculumContract(TypedDict, total=False):
    schema_name: Literal['CurriculumContract']
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    created_at: str
    extensions: dict[str, JsonValue]  # optional
    contractId: str
    contractVersion: str
    curriculumScope: Scope
    targetConceptIds: Identifiers
    targetCurriculumNodeIds: Identifiers
    learningObjectives: list[Objective]
    prerequisites: list[Prerequisite]
    competencies: Identifiers
    expectedDepth: ExpectedDepth
    forwardConnections: list[ForwardConnection]
    cognitiveProgressionConstraints: list[ProgressionConstraint]
    dependencyEdges: list[Dependency]
    requiredArtifactTypes: list[str]
    requiredAgentContributions: list[RequiredContribution]
    constraintSet: dict[str, JsonValue]
    validationResults: list[ValidationResult]
    lifecycle: Lifecycle
    createdAt: str
    updatedAt: str
    metadata: dict[str, JsonValue]
