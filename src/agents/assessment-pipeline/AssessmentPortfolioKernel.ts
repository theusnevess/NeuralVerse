/**
 * NV-2000-D8-OPT-13 — Deterministic Portfolio-Oriented Evaluation Kernel
 *
 * Pure deterministic compose functions for portfolio evaluation assessment.
 * The Assessment Agent models portfolio evaluation assessments that connect
 * assessment artifacts to portfolio evidence, engineering deliverables,
 * competency demonstrations, and showcase readiness. It stores portfolio
 * evaluation metadata, validates portfolio structures, governs portfolio evidence.
 * It never generates portfolios, evaluates learners, recommends projects,
 * determines hiring readiness, or invokes other agents.
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
  type AssessmentArtifactWithPortfolio,
  type AssessmentGovernanceLevel,
  type PortfolioArtifactReference,
  type PortfolioArtifactType,
  type PortfolioCompetencyEvidence,
  type PortfolioCompetencyType,
  type PortfolioEvaluation,
  type PortfolioEvaluationStatus,
  type PortfolioEvaluationType,
  type PortfolioInput,
  type PortfolioRegistry,
  type PortfolioRegistryMetadata,
  type PortfolioRelationship,
  type PortfolioShowcaseClassification,
  type PortfolioEvaluationProvenance,
  type PortfolioEvaluationTrace,
  type ShowcaseLevel,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_PORTFOLIO_ARTIFACT_TYPES,
  CANONICAL_PORTFOLIO_COMPETENCY_TYPES,
  CANONICAL_PORTFOLIO_EVALUATION_STATUS,
  CANONICAL_PORTFOLIO_EVALUATION_TYPES,
  CANONICAL_SHOWCASE_LEVELS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported portfolio evaluation type?
 */
export function isSupportedPortfolioEvaluationType(
  value: string,
): value is PortfolioEvaluationType {
  return CANONICAL_PORTFOLIO_EVALUATION_TYPES.includes(
    value as PortfolioEvaluationType,
  );
}

/**
 * Type guard: is the value a supported portfolio artifact type?
 */
export function isSupportedPortfolioArtifactType(
  value: string,
): value is PortfolioArtifactType {
  return CANONICAL_PORTFOLIO_ARTIFACT_TYPES.includes(
    value as PortfolioArtifactType,
  );
}

/**
 * Type guard: is the value a supported portfolio competency type?
 */
export function isSupportedPortfolioCompetencyType(
  value: string,
): value is PortfolioCompetencyType {
  return CANONICAL_PORTFOLIO_COMPETENCY_TYPES.includes(
    value as PortfolioCompetencyType,
  );
}

/**
 * Type guard: is the value a supported showcase level?
 */
export function isSupportedShowcaseLevel(
  value: string,
): value is ShowcaseLevel {
  return CANONICAL_SHOWCASE_LEVELS.includes(
    value as ShowcaseLevel,
  );
}

/**
 * Type guard: is the value a supported portfolio evaluation status?
 */
export function isSupportedPortfolioEvaluationStatus(
  value: string,
): value is PortfolioEvaluationStatus {
  return CANONICAL_PORTFOLIO_EVALUATION_STATUS.includes(
    value as PortfolioEvaluationStatus,
  );
}

/**
 * Type guard: is the value a supported portfolio governance level?
 */
export function isSupportedPortfolioGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical portfolio evaluation types.
 */
export function getCanonicalPortfolioEvaluationTypes(): readonly PortfolioEvaluationType[] {
  return [...CANONICAL_PORTFOLIO_EVALUATION_TYPES];
}

/**
 * Returns a copy of canonical portfolio artifact types.
 */
export function getCanonicalPortfolioArtifactTypes(): readonly PortfolioArtifactType[] {
  return [...CANONICAL_PORTFOLIO_ARTIFACT_TYPES];
}

/**
 * Returns a copy of canonical portfolio competency types.
 */
export function getCanonicalPortfolioCompetencyTypes(): readonly PortfolioCompetencyType[] {
  return [...CANONICAL_PORTFOLIO_COMPETENCY_TYPES];
}

/**
 * Returns a copy of canonical showcase levels.
 */
export function getCanonicalShowcaseLevels(): readonly ShowcaseLevel[] {
  return [...CANONICAL_SHOWCASE_LEVELS];
}

/**
 * Returns a copy of canonical portfolio evaluation statuses.
 */
export function getCanonicalPortfolioEvaluationStatuses(): readonly PortfolioEvaluationStatus[] {
  return [...CANONICAL_PORTFOLIO_EVALUATION_STATUS];
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
 * Compose an immutable PortfolioEvaluationProvenance.
 */
export function composePortfolioEvaluationProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: PortfolioEvaluationStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): PortfolioEvaluationProvenance {
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
 * Compose an immutable PortfolioEvaluationTrace.
 */
export function composePortfolioEvaluationTrace(params: {
  readonly traceId: string;
}): PortfolioEvaluationTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_portfolio_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable PortfolioArtifactReference.
 */
export function composePortfolioArtifactReference(params: {
  readonly id: string;
  readonly artifactType: PortfolioArtifactType;
  readonly description: string;
}): PortfolioArtifactReference {
  return {
    id: params.id,
    artifactType: params.artifactType,
    description: params.description,
  };
}

/**
 * Compose an immutable PortfolioCompetencyEvidence.
 */
export function composePortfolioCompetencyEvidence(params: {
  readonly id: string;
  readonly competencyType: PortfolioCompetencyType;
  readonly description: string;
}): PortfolioCompetencyEvidence {
  return {
    id: params.id,
    competencyType: params.competencyType,
    description: params.description,
  };
}

/**
 * Compose an immutable PortfolioShowcaseClassification.
 */
export function composePortfolioShowcaseClassification(params: {
  readonly id: string;
  readonly showcaseLevel: ShowcaseLevel;
  readonly description: string;
}): PortfolioShowcaseClassification {
  return {
    id: params.id,
    showcaseLevel: params.showcaseLevel,
    description: params.description,
  };
}

/**
 * Compose an immutable PortfolioRelationship.
 */
export function composePortfolioRelationship(params: {
  readonly id: string;
  readonly sourceEvaluationId: string;
  readonly targetEvaluationId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): PortfolioRelationship {
  return {
    id: params.id,
    sourceEvaluationId: params.sourceEvaluationId,
    targetEvaluationId: params.targetEvaluationId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable PortfolioEvaluation.
 */
export function composePortfolioEvaluation(params: {
  readonly id: string;
  readonly title: string;
  readonly evaluationType: PortfolioEvaluationType;
  readonly artifacts: readonly PortfolioArtifactReference[];
  readonly competencies: readonly PortfolioCompetencyEvidence[];
  readonly showcaseClassifications: readonly PortfolioShowcaseClassification[];
  readonly conceptIds: readonly string[];
  readonly status: PortfolioEvaluationStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: PortfolioEvaluationProvenance;
}): PortfolioEvaluation {
  const traceId = _deterministicId('portfolio', [params.id]);
  const trace = composePortfolioEvaluationTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    evaluationType: params.evaluationType,
    artifacts: [...params.artifacts],
    competencies: [...params.competencies],
    showcaseClassifications: [...params.showcaseClassifications],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable PortfolioRegistryMetadata.
 */
export function _composePortfolioRegistryMetadata(
  nodes: readonly PortfolioEvaluation[],
): PortfolioRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('portfolio-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_portfolio_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable PortfolioRegistry from pre-composed nodes.
 */
export function composePortfolioRegistry(
  nodes: readonly PortfolioEvaluation[],
): PortfolioRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composePortfolioRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable PortfolioRegistry from input.
 */
export function composePortfolioRegistryFromInput(
  input: PortfolioInput,
): PortfolioRegistry {
  return composePortfolioRegistry(input.nodes);
}

/**
 * Compose portfolio evaluations into a registry.
 */
export function composeAssessmentPortfolioEvaluations(params: {
  readonly evaluations: readonly PortfolioEvaluation[];
}): PortfolioRegistry {
  return composePortfolioRegistry(params.evaluations);
}

/**
 * Compose an assessment artifact enriched with portfolio evaluations.
 */
export function composeAssessmentArtifactWithPortfolio(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly portfolioEvaluations: readonly PortfolioEvaluation[];
}): AssessmentArtifactWithPortfolio {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    portfolioEvaluations: [...params.portfolioEvaluations],
  };
}
