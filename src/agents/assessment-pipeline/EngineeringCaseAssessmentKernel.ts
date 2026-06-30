/**
 * NV-2000-D8-OPT-09 — Deterministic Engineering Case Assessment Kernel
 *
 * Pure deterministic compose functions for engineering case study assessment.
 * The Assessment Agent models engineering assessments built around case studies.
 * It stores engineering assessment metadata, validates engineering assessment
 * structures, governs engineering evidence.
 * It never evaluates engineering quality, determines the best solution,
 * or creates case studies.
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
  type AssessmentArtifactWithEngineeringCases,
  type AssessmentGovernanceLevel,
  type EngineeringCaseAssessment,
  type EngineeringCaseAssessmentProvenance,
  type EngineeringCaseAssessmentTrace,
  type EngineeringCaseInput,
  type EngineeringCaseRegistry,
  type EngineeringCaseRegistryMetadata,
  type EngineeringCaseRelationship,
  type EngineeringCaseStatus,
  type EngineeringCaseType,
  type EngineeringConstraint,
  type EngineeringConstraintType,
  type EngineeringDecisionReference,
  type EngineeringDecisionType,
  type EngineeringEvidence,
  type EngineeringEvidenceType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ENGINEERING_CASE_STATUS,
  CANONICAL_ENGINEERING_CASE_TYPES,
  CANONICAL_ENGINEERING_CONSTRAINT_TYPES,
  CANONICAL_ENGINEERING_DECISION_TYPES,
  CANONICAL_ENGINEERING_EVIDENCE_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported engineering case type?
 */
export function isSupportedEngineeringCaseType(
  value: string,
): value is EngineeringCaseType {
  return CANONICAL_ENGINEERING_CASE_TYPES.includes(value as EngineeringCaseType);
}

/**
 * Type guard: is the value a supported engineering decision type?
 */
export function isSupportedEngineeringDecisionType(
  value: string,
): value is EngineeringDecisionType {
  return CANONICAL_ENGINEERING_DECISION_TYPES.includes(
    value as EngineeringDecisionType,
  );
}

/**
 * Type guard: is the value a supported engineering constraint type?
 */
export function isSupportedEngineeringConstraintType(
  value: string,
): value is EngineeringConstraintType {
  return CANONICAL_ENGINEERING_CONSTRAINT_TYPES.includes(
    value as EngineeringConstraintType,
  );
}

/**
 * Type guard: is the value a supported engineering evidence type?
 */
export function isSupportedEngineeringEvidenceType(
  value: string,
): value is EngineeringEvidenceType {
  return CANONICAL_ENGINEERING_EVIDENCE_TYPES.includes(
    value as EngineeringEvidenceType,
  );
}

/**
 * Type guard: is the value a supported engineering case status?
 */
export function isSupportedEngineeringCaseStatus(
  value: string,
): value is EngineeringCaseStatus {
  return CANONICAL_ENGINEERING_CASE_STATUS.includes(
    value as EngineeringCaseStatus,
  );
}

/**
 * Type guard: is the value a supported engineering case governance level?
 */
export function isSupportedEngineeringCaseGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical engineering case types.
 */
export function getCanonicalEngineeringCaseTypes(): readonly EngineeringCaseType[] {
  return [...CANONICAL_ENGINEERING_CASE_TYPES];
}

/**
 * Returns a copy of canonical engineering decision types.
 */
export function getCanonicalEngineeringDecisionTypes(): readonly EngineeringDecisionType[] {
  return [...CANONICAL_ENGINEERING_DECISION_TYPES];
}

/**
 * Returns a copy of canonical engineering constraint types.
 */
export function getCanonicalEngineeringConstraintTypes(): readonly EngineeringConstraintType[] {
  return [...CANONICAL_ENGINEERING_CONSTRAINT_TYPES];
}

/**
 * Returns a copy of canonical engineering evidence types.
 */
export function getCanonicalEngineeringEvidenceTypes(): readonly EngineeringEvidenceType[] {
  return [...CANONICAL_ENGINEERING_EVIDENCE_TYPES];
}

/**
 * Returns a copy of canonical engineering case statuses.
 */
export function getCanonicalEngineeringCaseStatuses(): readonly EngineeringCaseStatus[] {
  return [...CANONICAL_ENGINEERING_CASE_STATUS];
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
 * Compose an immutable EngineeringCaseAssessmentProvenance.
 */
export function composeEngineeringCaseAssessmentProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: EngineeringCaseStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): EngineeringCaseAssessmentProvenance {
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
 * Compose an immutable EngineeringCaseAssessmentTrace.
 */
export function composeEngineeringCaseAssessmentTrace(params: {
  readonly traceId: string;
}): EngineeringCaseAssessmentTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_engineering_case_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable EngineeringDecisionReference.
 */
export function composeEngineeringDecisionReference(params: {
  readonly id: string;
  readonly decisionType: EngineeringDecisionType;
  readonly description: string;
}): EngineeringDecisionReference {
  return {
    id: params.id,
    decisionType: params.decisionType,
    description: params.description,
  };
}

/**
 * Compose an immutable EngineeringConstraint.
 */
export function composeEngineeringConstraint(params: {
  readonly id: string;
  readonly constraintType: EngineeringConstraintType;
  readonly description: string;
  readonly severity: string;
}): EngineeringConstraint {
  return {
    id: params.id,
    constraintType: params.constraintType,
    description: params.description,
    severity: params.severity,
  };
}

/**
 * Compose an immutable EngineeringEvidence.
 */
export function composeEngineeringEvidence(params: {
  readonly id: string;
  readonly evidenceType: EngineeringEvidenceType;
  readonly description: string;
}): EngineeringEvidence {
  return {
    id: params.id,
    evidenceType: params.evidenceType,
    description: params.description,
  };
}

/**
 * Compose an immutable EngineeringCaseRelationship.
 */
export function composeEngineeringCaseRelationship(params: {
  readonly id: string;
  readonly sourceCaseId: string;
  readonly targetCaseId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): EngineeringCaseRelationship {
  return {
    id: params.id,
    sourceCaseId: params.sourceCaseId,
    targetCaseId: params.targetCaseId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable EngineeringCaseAssessment.
 */
export function composeEngineeringCaseAssessment(params: {
  readonly id: string;
  readonly title: string;
  readonly caseType: EngineeringCaseType;
  readonly scenario: string;
  readonly decisions: readonly EngineeringDecisionReference[];
  readonly constraints: readonly EngineeringConstraint[];
  readonly evidence: readonly EngineeringEvidence[];
  readonly conceptIds: readonly string[];
  readonly status: EngineeringCaseStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: EngineeringCaseAssessmentProvenance;
}): EngineeringCaseAssessment {
  const traceId = _deterministicId('engineering-case', [params.id]);
  const trace = composeEngineeringCaseAssessmentTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    caseType: params.caseType,
    scenario: params.scenario,
    decisions: [...params.decisions],
    constraints: [...params.constraints],
    evidence: [...params.evidence],
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable EngineeringCaseRegistryMetadata.
 */
export function _composeEngineeringCaseRegistryMetadata(
  nodes: readonly EngineeringCaseAssessment[],
): EngineeringCaseRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('engineering-case-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_engineering_case_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable EngineeringCaseRegistry from pre-composed nodes.
 */
export function composeEngineeringCaseRegistry(
  nodes: readonly EngineeringCaseAssessment[],
): EngineeringCaseRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeEngineeringCaseRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable EngineeringCaseRegistry from input.
 */
export function composeEngineeringCaseRegistryFromInput(
  input: EngineeringCaseInput,
): EngineeringCaseRegistry {
  return composeEngineeringCaseRegistry(input.nodes);
}

/**
 * Compose engineering case assessments into a registry.
 */
export function composeEngineeringCaseAssessments(params: {
  readonly cases: readonly EngineeringCaseAssessment[];
}): EngineeringCaseRegistry {
  return composeEngineeringCaseRegistry(params.cases);
}

/**
 * Compose an assessment artifact enriched with engineering cases.
 */
export function composeAssessmentArtifactWithEngineeringCases(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly engineeringCases: readonly EngineeringCaseAssessment[];
}): AssessmentArtifactWithEngineeringCases {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    engineeringCases: [...params.engineeringCases],
  };
}
