# GENERATED FILE. DO NOT EDIT.
# source_schema_id = urn:neuralverse:xfi:contract:learning-package-draft:1.0.0
# source_schema_version = 1.0.0
# source_schema_sha256 = b0a0dccc297cc4cfc1a238d2716b2edfa6890d5381a39f140850cfeecd22ec9c
# generator = neuralverse-contract-projections/1.0.0
from __future__ import annotations
from typing import Any, Literal, TypedDict

JsonValue = Any

Identifiers = list[str]
Id = str

class Scope(TypedDict, total=False):
    learningPathId: Id  # optional
    moduleId: Id  # optional
    lessonId: Id  # optional
    curriculumNodeIds: Identifiers

class ExpectedDepth(TypedDict, total=False):
    level: Literal['awareness', 'basic_understanding', 'working_knowledge', 'advanced_understanding', 'mastery']
    scopeIds: Identifiers  # optional
    rationale: str
    sourceReferences: Identifiers  # optional

class AssemblyPlan(TypedDict, total=False):
    planId: Id
    planVersion: str
    stages: list[AssemblyStage]
    inputContributionIds: Identifiers
    rationale: str
    unresolvedConstraints: list[Id]  # optional

class AssemblyStage(TypedDict, total=False):
    stageId: Id
    stageType: str
    order: int
    inputContributionIds: Identifiers
    targetIds: Identifiers
    dependencies: Identifiers

class AgentContributionProvenance(TypedDict, total=False):
    contributionId: Id
    agentId: Id
    agentVersion: str
    contributionType: str
    sourceContributionVersion: str  # optional
    usedIds: Identifiers
    citationIds: Identifiers  # optional

class CoverageItem(TypedDict, total=False):
    dimension: str
    targetRequirement: str
    observedCoverage: JsonValue  # optional
    status: Literal['covered', 'partial', 'not_covered', 'not_applicable']
    evidenceReferences: Identifiers
    knownGaps: list[str]
    unknownState: Literal['known', 'unknown', 'not_evaluated']

class UnresolvedFinding(TypedDict, total=False):
    findingId: Id
    findingType: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'UNKNOWN']
    description: str
    affectedIds: Identifiers
    evidenceReferences: Identifiers
    requiredResolution: str
    blocking: bool
    owner: str | None  # optional

class LaboratoryReference(TypedDict, total=False):
    laboratorySpecId: Id
    laboratorySpecVersion: str
    semanticType: str
    relationship: Identifiers
    requiredCapability: str

class AssessmentReference(TypedDict, total=False):
    assessmentSpecId: Id
    assessmentSpecVersion: str
    assessmentType: str
    competencyIds: Identifiers
    relationship: Identifiers

class Statement(TypedDict, total=False):
    statementId: Id  # optional
    statement: str
    required: bool

class ContentBlock(TypedDict, total=False):
    contentBlockId: Id
    blockVersion: str
    blockType: str
    semanticPurpose: str
    sourceContributionIds: Identifiers
    structuredPayload: JsonValue
    conceptLinks: Identifiers
    curriculumLinks: Identifiers
    citationIds: Identifiers
    assetRequestIds: Identifiers
    accessibilityMetadata: dict[str, JsonValue]
    renderingPriority: float
    requirementStatus: Literal['REQUIRED', 'OPTIONAL', 'CONDITIONAL']
    lifecycle: Lifecycle
    metadata: dict[str, JsonValue]

class SourceManifest(TypedDict, total=False):
    manifestId: Id
    version: str
    sources: list[Source]

class Source(TypedDict, total=False):
    sourceId: Id
    title: str
    kind: Literal['paper', 'book', 'dataset', 'web', 'code', 'internal', 'other']
    canonicalLocator: str
    status: Literal['draft', 'review', 'approved', 'published', 'deprecated', 'archived']
    authors: list[str]
    publisher: str  # optional
    publicationYear: int  # optional
    version: str  # optional
    license: str | None  # optional
    quality: JsonValue  # optional
    provenance: dict[str, JsonValue]

class Citation(TypedDict, total=False):
    citationId: Id
    sourceId: Id
    citationType: Literal['direct', 'paraphrase', 'data', 'method', 'definition', 'background']
    locator: str  # optional
    claim: str  # optional

class Lifecycle(TypedDict, total=False):
    lifecycle: str
    version: str
    approval: str
    publication: str

class LearningPackageDraft(TypedDict, total=False):
    schema_name: Literal['LearningPackageDraft']
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    created_at: str
    extensions: dict[str, JsonValue]  # optional
    packageId: str
    packageVersion: str
    title: str
    curriculumScope: Scope
    learningObjectives: list[Statement]
    prerequisites: list[Statement]
    competencies: list[Statement]
    expectedDepth: ExpectedDepth
    contributionIds: Identifiers
    agentContributions: list[AgentContributionProvenance]
    assemblyPlan: AssemblyPlan
    contentBlocks: list[ContentBlock]
    blockOrder: Identifiers
    sourceManifest: SourceManifest
    citations: list[Citation]
    laboratoryReferences: list[LaboratoryReference]
    assessmentReferences: list[AssessmentReference]
    assetRequestIds: Identifiers
    coverageReport: list[CoverageItem]
    unresolvedFindings: list[UnresolvedFinding]
    validationResults: list[JsonValue]
    revisionDirectives: list[JsonValue]
    publicationReadinessRecommendation: JsonValue  # optional
    lifecycle: Lifecycle
    createdAt: str
    updatedAt: str
    metadata: dict[str, JsonValue]
