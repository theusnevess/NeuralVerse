/**
 * NV-2000-D8-OPT-10 — Deterministic Comparison Kernel
 *
 * Pure deterministic compose functions for comparative reasoning and trade-off
 * evaluation. The Assessment Agent models comparative assessment metadata.
 * It stores references, validates comparison structures,
 * governs comparison evidence.
 * It never performs reasoning, ranks alternatives, chooses solutions,
 * or computes trade-off scores.
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
  type AssessmentGovernanceLevel,
  type AssessmentArtifactWithComparisons,
  type ComparativeAssessment,
  type ComparativeAssessmentStatus,
  type ComparisonAssessmentProvenance,
  type ComparisonAssessmentTrace,
  type ComparisonDimension,
  type ComparisonDimensionEntry,
  type ComparisonInput,
  type ComparisonReasoningType,
  type ComparisonRegistry,
  type ComparisonRegistryMetadata,
  type ComparisonRelationship,
  type DecisionContext,
  type DecisionContextType,
  type TradeOffEvaluation,
  type TradeOffType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_COMPARISON_DIMENSIONS,
  CANONICAL_COMPARISON_REASONING_TYPES,
  CANONICAL_COMPARATIVE_ASSESSMENT_STATUS,
  CANONICAL_DECISION_CONTEXT_TYPES,
  CANONICAL_TRADE_OFF_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported comparison reasoning type?
 */
export function isSupportedComparisonReasoningType(
  value: string,
): value is ComparisonReasoningType {
  return CANONICAL_COMPARISON_REASONING_TYPES.includes(
    value as ComparisonReasoningType,
  );
}

/**
 * Type guard: is the value a supported comparison dimension?
 */
export function isSupportedComparisonDimension(
  value: string,
): value is ComparisonDimension {
  return CANONICAL_COMPARISON_DIMENSIONS.includes(value as ComparisonDimension);
}

/**
 * Type guard: is the value a supported trade-off type?
 */
export function isSupportedTradeOffType(
  value: string,
): value is TradeOffType {
  return CANONICAL_TRADE_OFF_TYPES.includes(value as TradeOffType);
}

/**
 * Type guard: is the value a supported decision context type?
 */
export function isSupportedDecisionContextType(
  value: string,
): value is DecisionContextType {
  return CANONICAL_DECISION_CONTEXT_TYPES.includes(
    value as DecisionContextType,
  );
}

/**
 * Type guard: is the value a supported comparative assessment status?
 */
export function isSupportedComparativeAssessmentStatus(
  value: string,
): value is ComparativeAssessmentStatus {
  return CANONICAL_COMPARATIVE_ASSESSMENT_STATUS.includes(
    value as ComparativeAssessmentStatus,
  );
}

/**
 * Type guard: is the value a supported comparative assessment governance level?
 */
export function isSupportedComparativeAssessmentGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical comparison reasoning types.
 */
export function getCanonicalComparisonReasoningTypes(): readonly ComparisonReasoningType[] {
  return [...CANONICAL_COMPARISON_REASONING_TYPES];
}

/**
 * Returns a copy of canonical comparison dimensions.
 */
export function getCanonicalComparisonDimensions(): readonly ComparisonDimension[] {
  return [...CANONICAL_COMPARISON_DIMENSIONS];
}

/**
 * Returns a copy of canonical trade-off types.
 */
export function getCanonicalTradeOffTypes(): readonly TradeOffType[] {
  return [...CANONICAL_TRADE_OFF_TYPES];
}

/**
 * Returns a copy of canonical decision context types.
 */
export function getCanonicalDecisionContextTypes(): readonly DecisionContextType[] {
  return [...CANONICAL_DECISION_CONTEXT_TYPES];
}

/**
 * Returns a copy of canonical comparative assessment statuses.
 */
export function getCanonicalComparativeAssessmentStatuses(): readonly ComparativeAssessmentStatus[] {
  return [...CANONICAL_COMPARATIVE_ASSESSMENT_STATUS];
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
 * Compose an immutable ComparisonAssessmentProvenance.
 */
export function composeComparisonAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ComparativeAssessmentStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): ComparisonAssessmentProvenance {
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
 * Compose an immutable ComparisonAssessmentTrace.
 */
export function composeComparisonAssessmentTrace(params: {
  readonly traceId: string;
}): ComparisonAssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_comparison_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ComparisonDimensionEntry.
 */
export function composeComparisonDimension(params: {
  readonly id: string;
  readonly dimension: ComparisonDimension;
  readonly description: string;
}): ComparisonDimensionEntry {
  return {
    id: params.id,
    dimension: params.dimension,
    description: params.description,
  };
}

/**
 * Compose an immutable TradeOffEvaluation.
 */
export function composeTradeOffEvaluation(params: {
  readonly id: string;
  readonly tradeOffType: TradeOffType;
  readonly description: string;
}): TradeOffEvaluation {
  return {
    id: params.id,
    tradeOffType: params.tradeOffType,
    description: params.description,
  };
}

/**
 * Compose an immutable DecisionContext.
 */
export function composeDecisionContext(params: {
  readonly id: string;
  readonly contextType: DecisionContextType;
  readonly description: string;
}): DecisionContext {
  return {
    id: params.id,
    contextType: params.contextType,
    description: params.description,
  };
}

/**
 * Compose an immutable ComparisonRelationship.
 */
export function composeComparisonRelationship(params: {
  readonly id: string;
  readonly sourceComparisonId: string;
  readonly targetComparisonId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): ComparisonRelationship {
  return {
    id: params.id,
    sourceComparisonId: params.sourceComparisonId,
    targetComparisonId: params.targetComparisonId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable ComparativeAssessment.
 */
export function composeComparativeAssessment(params: {
  readonly id: string;
  readonly title: string;
  readonly reasoningType: ComparisonReasoningType;
  readonly dimensions: readonly ComparisonDimensionEntry[];
  readonly tradeOffs: readonly TradeOffEvaluation[];
  readonly decisionContext: DecisionContext;
  readonly alternatives: readonly string[];
  readonly conceptIds: readonly string[];
  readonly status: ComparativeAssessmentStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ComparisonAssessmentProvenance;
}): ComparativeAssessment {
  const traceId = _deterministicId('comparison', [params.id]);
  const trace = composeComparisonAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    reasoningType: params.reasoningType,
    dimensions: [...params.dimensions],
    tradeOffs: [...params.tradeOffs],
    decisionContext: params.decisionContext,
    alternatives: [...params.alternatives],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable ComparisonRegistryMetadata.
 */
export function _composeComparisonRegistryMetadata(
  nodes: readonly ComparativeAssessment[],
): ComparisonRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('comparison-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_comparison_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ComparisonRegistry from pre-composed nodes.
 */
export function composeComparisonRegistry(
  nodes: readonly ComparativeAssessment[],
): ComparisonRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeComparisonRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable ComparisonRegistry from input.
 */
export function composeComparisonRegistryFromInput(
  input: ComparisonInput,
): ComparisonRegistry {
  return composeComparisonRegistry(input.nodes);
}

/**
 * Compose comparative assessments into a registry.
 */
export function composeAssessmentComparisons(params: {
  readonly comparisons: readonly ComparativeAssessment[];
}): ComparisonRegistry {
  return composeComparisonRegistry(params.comparisons);
}

/**
 * Compose an assessment artifact enriched with comparisons.
 */
export function composeAssessmentArtifactWithComparisons(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly comparisons: readonly ComparativeAssessment[];
}): AssessmentArtifactWithComparisons {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    comparisons: [...params.comparisons],
  };
}
