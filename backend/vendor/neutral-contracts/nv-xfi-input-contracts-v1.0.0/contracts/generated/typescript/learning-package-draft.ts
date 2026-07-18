// GENERATED FILE. DO NOT EDIT.
// sourceSchemaId = urn:neuralverse:xfi:contract:learning-package-draft:1.0.0
// sourceSchemaVersion = 1.0.0
// sourceSchemaSha256 = b0a0dccc297cc4cfc1a238d2716b2edfa6890d5381a39f140850cfeecd22ec9c
// generator = neuralverse-contract-projections/1.0.0

export type JsonValue = unknown;

export type Identifiers = readonly string[];
export type Id = string;

export interface Scope {
  readonly learningPathId?: Id;
  readonly moduleId?: Id;
  readonly lessonId?: Id;
  readonly curriculumNodeIds: Identifiers;
}

export interface ExpectedDepth {
  readonly level: "awareness" | "basic_understanding" | "working_knowledge" | "advanced_understanding" | "mastery";
  readonly scopeIds?: Identifiers;
  readonly rationale: string;
  readonly sourceReferences?: Identifiers;
}

export interface AssemblyPlan {
  readonly planId: Id;
  readonly planVersion: string;
  readonly stages: readonly AssemblyStage[];
  readonly inputContributionIds: Identifiers;
  readonly rationale: string;
  readonly unresolvedConstraints?: readonly Id[];
}

export interface AssemblyStage {
  readonly stageId: Id;
  readonly stageType: string;
  readonly order: number;
  readonly inputContributionIds: Identifiers;
  readonly targetIds: Identifiers;
  readonly dependencies: Identifiers;
}

export interface AgentContributionProvenance {
  readonly contributionId: Id;
  readonly agentId: Id;
  readonly agentVersion: string;
  readonly contributionType: string;
  readonly sourceContributionVersion?: string;
  readonly usedIds: Identifiers;
  readonly citationIds?: Identifiers;
}

export interface CoverageItem {
  readonly dimension: string;
  readonly targetRequirement: string;
  readonly observedCoverage?: JsonValue;
  readonly status: "covered" | "partial" | "not_covered" | "not_applicable";
  readonly evidenceReferences: Identifiers;
  readonly knownGaps: readonly string[];
  readonly unknownState: "known" | "unknown" | "not_evaluated";
}

export interface UnresolvedFinding {
  readonly findingId: Id;
  readonly findingType: string;
  readonly severity: "P0" | "P1" | "P2" | "P3" | "UNKNOWN";
  readonly description: string;
  readonly affectedIds: Identifiers;
  readonly evidenceReferences: Identifiers;
  readonly requiredResolution: string;
  readonly blocking: boolean;
  readonly owner?: string | null;
}

export interface LaboratoryReference {
  readonly laboratorySpecId: Id;
  readonly laboratorySpecVersion: string;
  readonly semanticType: string;
  readonly relationship: Identifiers;
  readonly requiredCapability: string;
}

export interface AssessmentReference {
  readonly assessmentSpecId: Id;
  readonly assessmentSpecVersion: string;
  readonly assessmentType: string;
  readonly competencyIds: Identifiers;
  readonly relationship: Identifiers;
}

export interface Statement {
  readonly statementId?: Id;
  readonly statement: string;
  readonly required: boolean;
}

export interface ContentBlock {
  readonly contentBlockId: Id;
  readonly blockVersion: string;
  readonly blockType: string;
  readonly semanticPurpose: string;
  readonly sourceContributionIds: Identifiers;
  readonly structuredPayload: JsonValue;
  readonly conceptLinks: Identifiers;
  readonly curriculumLinks: Identifiers;
  readonly citationIds: Identifiers;
  readonly assetRequestIds: Identifiers;
  readonly accessibilityMetadata: Record<string, JsonValue>;
  readonly renderingPriority: number;
  readonly requirementStatus: "REQUIRED" | "OPTIONAL" | "CONDITIONAL";
  readonly lifecycle: Lifecycle;
  readonly metadata: Record<string, JsonValue>;
}

export interface SourceManifest {
  readonly manifestId: Id;
  readonly version: string;
  readonly sources: readonly Source[];
}

export interface Source {
  readonly sourceId: Id;
  readonly title: string;
  readonly kind: "paper" | "book" | "dataset" | "web" | "code" | "internal" | "other";
  readonly canonicalLocator: string;
  readonly status: "draft" | "review" | "approved" | "published" | "deprecated" | "archived";
  readonly authors: readonly string[];
  readonly publisher?: string;
  readonly publicationYear?: number;
  readonly version?: string;
  readonly license?: string | null;
  readonly quality?: JsonValue;
  readonly provenance: Record<string, JsonValue>;
}

export interface Citation {
  readonly citationId: Id;
  readonly sourceId: Id;
  readonly citationType: "direct" | "paraphrase" | "data" | "method" | "definition" | "background";
  readonly locator?: string;
  readonly claim?: string;
}

export interface Lifecycle {
  readonly lifecycle: string;
  readonly version: string;
  readonly approval: string;
  readonly publication: string;
}

export interface LearningPackageDraft {
  readonly schema_name: "LearningPackageDraft";
  readonly schema_version: string;
  readonly minimum_reader_version: string;
  readonly producer_version: string;
  readonly created_at: string;
  readonly extensions?: Record<string, JsonValue>;
  readonly packageId: string;
  readonly packageVersion: string;
  readonly title: string;
  readonly curriculumScope: Scope;
  readonly learningObjectives: readonly Statement[];
  readonly prerequisites: readonly Statement[];
  readonly competencies: readonly Statement[];
  readonly expectedDepth: ExpectedDepth;
  readonly contributionIds: Identifiers;
  readonly agentContributions: readonly AgentContributionProvenance[];
  readonly assemblyPlan: AssemblyPlan;
  readonly contentBlocks: readonly ContentBlock[];
  readonly blockOrder: Identifiers;
  readonly sourceManifest: SourceManifest;
  readonly citations: readonly Citation[];
  readonly laboratoryReferences: readonly LaboratoryReference[];
  readonly assessmentReferences: readonly AssessmentReference[];
  readonly assetRequestIds: Identifiers;
  readonly coverageReport: readonly CoverageItem[];
  readonly unresolvedFindings: readonly UnresolvedFinding[];
  readonly validationResults: readonly JsonValue[];
  readonly revisionDirectives: readonly JsonValue[];
  readonly publicationReadinessRecommendation?: JsonValue;
  readonly lifecycle: Lifecycle;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, JsonValue>;
}
