// GENERATED FILE. DO NOT EDIT.
// sourceSchemaId = urn:neuralverse:xfi:contract:curriculum-contract:1.0.0
// sourceSchemaVersion = 1.0.0
// sourceSchemaSha256 = 16974e4f8e4334410ab00b72cca204e323861cb7d81eccd35a758eef3ab61302
// generator = neuralverse-contract-projections/1.0.0

export type JsonValue = unknown;

export type Identifier = string;
export type Identifiers = readonly Identifier[];

export interface Scope {
  readonly learningPathId?: Identifier;
  readonly moduleId?: Identifier;
  readonly lessonId?: Identifier;
  readonly curriculumNodeIds: Identifiers;
}

export interface Objective {
  readonly objectiveId: Identifier;
  readonly statement: string;
  readonly requirementStatus: "REQUIRED" | "OPTIONAL" | "CONDITIONAL";
  readonly competencyIds: Identifiers;
  readonly conceptIds: Identifiers;
  readonly validationCriteria?: readonly JsonValue[];
}

export interface Prerequisite {
  readonly prerequisiteId: Identifier;
  readonly kind: "concept" | "competency" | "curriculum_node";
  readonly targetId: Identifier;
  readonly status: "required" | "recommended";
  readonly depth: "awareness" | "basic_understanding" | "working_knowledge" | "advanced_understanding" | "mastery";
  readonly logicalGroup?: string;
}

export interface Dependency {
  readonly dependencyId: Identifier;
  readonly fromNodeId: Identifier;
  readonly toNodeId: Identifier;
  readonly relation: "requires" | "precedes" | "reinforces" | "extends" | "contrasts_with" | "applies";
  readonly rationale?: string;
}

export interface RequiredContribution {
  readonly agentId: Identifier;
  readonly contributionType: string;
  readonly required: boolean;
}

export interface ExpectedDepth {
  readonly level: "awareness" | "basic_understanding" | "working_knowledge" | "advanced_understanding" | "mastery";
  readonly scopeIds: readonly Identifier[];
  readonly rationale: string;
  readonly evidenceReferences?: readonly string[];
}

export interface ForwardConnection {
  readonly connectionId: Identifier;
  readonly targetId: Identifier;
  readonly connectionType: string;
  readonly rationale: string;
  readonly priority: number;
}

export interface ProgressionConstraint {
  readonly constraintId: Identifier;
  readonly constraintType: string;
  readonly affectedIds: readonly Identifier[];
  readonly rationale: string;
  readonly enforcement: "required" | "recommended" | "prohibited";
}

export interface ValidationResult {
  readonly status: "PASS" | "PASS_WITH_FINDINGS" | "FAIL" | "UNKNOWN";
  readonly valid: boolean;
  readonly findings: readonly JsonValue[];
  readonly value?: JsonValue;
  readonly checkedAt?: string;
}

export interface Lifecycle {
  readonly lifecycle: string;
  readonly version: string;
  readonly approval: string;
  readonly publication: string;
}

export interface CurriculumContract {
  readonly schema_name: "CurriculumContract";
  readonly schema_version: string;
  readonly minimum_reader_version: string;
  readonly producer_version: string;
  readonly created_at: string;
  readonly extensions?: Record<string, JsonValue>;
  readonly contractId: string;
  readonly contractVersion: string;
  readonly curriculumScope: Scope;
  readonly targetConceptIds: Identifiers;
  readonly targetCurriculumNodeIds: Identifiers;
  readonly learningObjectives: readonly Objective[];
  readonly prerequisites: readonly Prerequisite[];
  readonly competencies: Identifiers;
  readonly expectedDepth: ExpectedDepth;
  readonly forwardConnections: readonly ForwardConnection[];
  readonly cognitiveProgressionConstraints: readonly ProgressionConstraint[];
  readonly dependencyEdges: readonly Dependency[];
  readonly requiredArtifactTypes: readonly string[];
  readonly requiredAgentContributions: readonly RequiredContribution[];
  readonly constraintSet: Record<string, JsonValue>;
  readonly validationResults: readonly ValidationResult[];
  readonly lifecycle: Lifecycle;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, JsonValue>;
}
