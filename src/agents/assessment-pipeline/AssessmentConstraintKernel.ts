/**
 * NV-2000-D8-OPT-11 — Deterministic Engineering Constraint Analysis Kernel
 *
 * Pure deterministic compose functions for engineering constraint analysis assessment.
 * The Assessment Agent models constraint assessments that evaluate a learner's
 * understanding of engineering constraints. It stores constraint assessment
 * metadata, validates constraint assessment structures, governs constraint evidence.
 * It never evaluates constraint quality, determines optimal solutions,
 * or performs engineering analysis.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentArtifactWithConstraints,
  type AssessmentGovernanceLevel,
  type ConstraintAnalysisStatus,
  type ConstraintAssessmentDecision,
  type ConstraintAssessmentProvenance,
  type ConstraintAssessmentTrace,
  type ConstraintCategory,
  type ConstraintCategoryType,
  type ConstraintInput,
  type ConstraintReasoning,
  type ConstraintReasoningType,
  type ConstraintRegistry,
  type ConstraintRegistryMetadata,
  type ConstraintRelationship,
  type ConstraintSeverity,
  type ConstraintSeverityLevel,
  type EngineeringConstraintAnalysisType,
  type EngineeringConstraintAssessment,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_CONSTRAINT_ANALYSIS_STATUS,
  CANONICAL_CONSTRAINT_CATEGORY_TYPES,
  CANONICAL_CONSTRAINT_REASONING_TYPES,
  CANONICAL_CONSTRAINT_SEVERITY_LEVELS,
  CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported engineering constraint analysis type?
 */
export function isSupportedEngineeringConstraintType(
  value: string,
): value is EngineeringConstraintAnalysisType {
  return CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES.includes(
    value as EngineeringConstraintAnalysisType,
  );
}

/**
 * Type guard: is the value a supported constraint category type?
 */
export function isSupportedConstraintCategory(
  value: string,
): value is ConstraintCategoryType {
  return CANONICAL_CONSTRAINT_CATEGORY_TYPES.includes(
    value as ConstraintCategoryType,
  );
}

/**
 * Type guard: is the value a supported constraint severity level?
 */
export function isSupportedConstraintSeverity(
  value: string,
): value is ConstraintSeverityLevel {
  return CANONICAL_CONSTRAINT_SEVERITY_LEVELS.includes(
    value as ConstraintSeverityLevel,
  );
}

/**
 * Type guard: is the value a supported constraint reasoning type?
 */
export function isSupportedConstraintReasoning(
  value: string,
): value is ConstraintReasoningType {
  return CANONICAL_CONSTRAINT_REASONING_TYPES.includes(
    value as ConstraintReasoningType,
  );
}

/**
 * Type guard: is the value a supported constraint analysis status?
 */
export function isSupportedConstraintAnalysisStatus(
  value: string,
): value is ConstraintAnalysisStatus {
  return CANONICAL_CONSTRAINT_ANALYSIS_STATUS.includes(
    value as ConstraintAnalysisStatus,
  );
}

/**
 * Type guard: is the value a supported constraint governance level?
 */
export function isSupportedConstraintGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical engineering constraint analysis types.
 */
export function getCanonicalEngineeringConstraintTypes(): readonly EngineeringConstraintAnalysisType[] {
  return [...CANONICAL_ENGINEERING_CONSTRAINT_ANALYSIS_TYPES];
}

/**
 * Returns a copy of canonical constraint categories.
 */
export function getCanonicalConstraintCategories(): readonly ConstraintCategoryType[] {
  return [...CANONICAL_CONSTRAINT_CATEGORY_TYPES];
}

/**
 * Returns a copy of canonical constraint severities.
 */
export function getCanonicalConstraintSeverities(): readonly ConstraintSeverityLevel[] {
  return [...CANONICAL_CONSTRAINT_SEVERITY_LEVELS];
}

/**
 * Returns a copy of canonical constraint reasoning types.
 */
export function getCanonicalConstraintReasoningTypes(): readonly ConstraintReasoningType[] {
  return [...CANONICAL_CONSTRAINT_REASONING_TYPES];
}

/**
 * Returns a copy of canonical constraint analysis statuses.
 */
export function getCanonicalConstraintAnalysisStatuses(): readonly ConstraintAnalysisStatus[] {
  return [...CANONICAL_CONSTRAINT_ANALYSIS_STATUS];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
 */
function _deterministicId(prefix: string, parts: readonly string[]): string {
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${prefix}-${slug}`;
}

/**
 * Compose an immutable ConstraintAssessmentProvenance.
 */
export function composeConstraintAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ConstraintAnalysisStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): ConstraintAssessmentProvenance {
  return {
    provider: params.provider,
    source: params.source,
    reviewStatus: params.reviewStatus,
    reviewDate: params.reviewDate,
    version: params.version,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable ConstraintAssessmentTrace.
 */
export function composeConstraintAssessmentTrace(params: {
  readonly traceId: string;
}): ConstraintAssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_constraint_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ConstraintCategory.
 */
export function composeConstraintCategory(params: {
  readonly id: string;
  readonly categoryType: ConstraintCategoryType;
  readonly description: string;
}): ConstraintCategory {
  return {
    id: params.id,
    categoryType: params.categoryType,
    description: params.description,
  };
}

/**
 * Compose an immutable ConstraintSeverity.
 */
export function composeConstraintSeverity(params: {
  readonly id: string;
  readonly severityLevel: ConstraintSeverityLevel;
  readonly description: string;
}): ConstraintSeverity {
  return {
    id: params.id,
    severityLevel: params.severityLevel,
    description: params.description,
  };
}

/**
 * Compose an immutable ConstraintReasoning.
 */
export function composeConstraintReasoning(params: {
  readonly id: string;
  readonly reasoningType: ConstraintReasoningType;
  readonly description: string;
}): ConstraintReasoning {
  return {
    id: params.id,
    reasoningType: params.reasoningType,
    description: params.description,
  };
}

/**
 * Compose an immutable ConstraintRelationship.
 */
export function composeConstraintRelationship(params: {
  readonly id: string;
  readonly sourceConstraintId: string;
  readonly targetConstraintId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): ConstraintRelationship {
  return {
    id: params.id,
    sourceConstraintId: params.sourceConstraintId,
    targetConstraintId: params.targetConstraintId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable EngineeringConstraintAssessment.
 */
export function composeEngineeringConstraintAssessment(params: {
  readonly id: string;
  readonly title: string;
  readonly constraintType: EngineeringConstraintAnalysisType;
  readonly categories: readonly ConstraintCategory[];
  readonly severities: readonly ConstraintSeverity[];
  readonly reasoningTypes: readonly ConstraintReasoning[];
  readonly conceptIds: readonly string[];
  readonly status: ConstraintAnalysisStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ConstraintAssessmentProvenance;
}): EngineeringConstraintAssessment {
  const traceId = _deterministicId('constraint', [params.id]);
  const trace = composeConstraintAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    constraintType: params.constraintType,
    categories: [...params.categories],
    severities: [...params.severities],
    reasoningTypes: [...params.reasoningTypes],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable ConstraintRegistryMetadata.
 */
export function _composeConstraintRegistryMetadata(
  nodes: readonly EngineeringConstraintAssessment[],
): ConstraintRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('constraint-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_constraint_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ConstraintRegistry from pre-composed nodes.
 */
export function composeConstraintRegistry(
  nodes: readonly EngineeringConstraintAssessment[],
): ConstraintRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeConstraintRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable ConstraintRegistry from input.
 */
export function composeConstraintRegistryFromInput(
  input: ConstraintInput,
): ConstraintRegistry {
  return composeConstraintRegistry(input.nodes);
}

/**
 * Compose constraint assessments into a registry.
 */
export function composeAssessmentConstraints(params: {
  readonly constraints: readonly EngineeringConstraintAssessment[];
}): ConstraintRegistry {
  return composeConstraintRegistry(params.constraints);
}

/**
 * Compose an assessment artifact enriched with constraints.
 */
export function composeAssessmentArtifactWithConstraints(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly constraints: readonly EngineeringConstraintAssessment[];
}): AssessmentArtifactWithConstraints {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    constraints: [...params.constraints],
  };
}
