/**
 * NV-2000-D8-OPT-02 — Deterministic Cognitive Kernel
 *
 * Pure deterministic compose functions for cognitive level and question type
 * modeling in the Assessment Pipeline.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 * - No assessment logic. No content fabrication.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentArtifactWithCognitiveProfile,
  type AssessmentArtifactWithCognitiveProfileValidationResult,
  type AssessmentGovernanceLevel,
  type AssessmentObjective,
  type CognitiveAssessmentProfile,
  type CognitiveInput,
  type CognitiveInputValidationResult,
  type CognitiveLevel,
  type CognitiveNodeValidationResult,
  type CognitiveProvenance,
  type CognitiveRelationship,
  type CognitiveRegistry,
  type CognitiveRegistryMetadata,
  type CognitiveRegistryValidationResult,
  type CognitiveStatus,
  type CognitiveTrace,
  type CognitiveTraceValidationResult,
  type CognitiveValidationError,
  type ExpectedEvidenceType,
  type QuestionType,
  type ReasoningType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_ASSESSMENT_OBJECTIVES,
  CANONICAL_COGNITIVE_LEVELS,
  CANONICAL_COGNITIVE_STATUS,
  CANONICAL_EXPECTED_EVIDENCE_TYPES,
  CANONICAL_QUESTION_TYPES,
  CANONICAL_REASONING_TYPES,
} from './AssessmentAgentContract.ts';
import {
  validateAssessmentArtifactWithCognitiveProfile,
  validateCognitiveAssessmentProfile,
  validateCognitiveInput,
  validateCognitiveRegistry,
  validateCognitiveTrace,
} from './AssessmentCognitiveValidation.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported cognitive level?
 */
export function isSupportedCognitiveLevel(
  value: string,
): value is CognitiveLevel {
  return CANONICAL_COGNITIVE_LEVELS.includes(value as CognitiveLevel);
}

/**
 * Type guard: is the value a supported question type?
 */
export function isSupportedQuestionType(
  value: string,
): value is QuestionType {
  return CANONICAL_QUESTION_TYPES.includes(value as QuestionType);
}

/**
 * Type guard: is the value a supported reasoning type?
 */
export function isSupportedReasoningType(
  value: string,
): value is ReasoningType {
  return CANONICAL_REASONING_TYPES.includes(value as ReasoningType);
}

/**
 * Type guard: is the value a supported assessment objective?
 */
export function isSupportedAssessmentObjective(
  value: string,
): value is AssessmentObjective {
  return CANONICAL_ASSESSMENT_OBJECTIVES.includes(
    value as AssessmentObjective,
  );
}

/**
 * Type guard: is the value a supported expected evidence type?
 */
export function isSupportedExpectedEvidenceType(
  value: string,
): value is ExpectedEvidenceType {
  return CANONICAL_EXPECTED_EVIDENCE_TYPES.includes(
    value as ExpectedEvidenceType,
  );
}

/**
 * Type guard: is the value a supported cognitive status?
 */
export function isSupportedCognitiveStatus(
  value: string,
): value is CognitiveStatus {
  return CANONICAL_COGNITIVE_STATUS.includes(value as CognitiveStatus);
}

/**
 * Type guard: is the value a supported cognitive governance level?
 */
export function isSupportedCognitiveGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical cognitive levels.
 */
export function getCanonicalCognitiveLevels(): readonly CognitiveLevel[] {
  return [...CANONICAL_COGNITIVE_LEVELS];
}

/**
 * Returns a copy of canonical question types.
 */
export function getCanonicalQuestionTypes(): readonly QuestionType[] {
  return [...CANONICAL_QUESTION_TYPES];
}

/**
 * Returns a copy of canonical reasoning types.
 */
export function getCanonicalReasoningTypes(): readonly ReasoningType[] {
  return [...CANONICAL_REASONING_TYPES];
}

/**
 * Returns a copy of canonical assessment objectives.
 */
export function getCanonicalAssessmentObjectives(): readonly AssessmentObjective[] {
  return [...CANONICAL_ASSESSMENT_OBJECTIVES];
}

/**
 * Returns a copy of canonical expected evidence types.
 */
export function getCanonicalExpectedEvidenceTypes(): readonly ExpectedEvidenceType[] {
  return [...CANONICAL_EXPECTED_EVIDENCE_TYPES];
}

/**
 * Returns a copy of canonical cognitive statuses.
 */
export function getCanonicalCognitiveStatuses(): readonly CognitiveStatus[] {
  return [...CANONICAL_COGNITIVE_STATUS];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
 * Produces stable IDs from input parameters.
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
 * Compose an immutable CognitiveProvenance from input.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeCognitiveProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: CognitiveStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): CognitiveProvenance {
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
 * Compose an immutable CognitiveTrace.
 *
 * Deterministic. Pure. Immutable. No random. No time.
 */
export function composeCognitiveTrace(params: {
  readonly traceId: string;
}): CognitiveTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_cognitive_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable CognitiveAssessmentProfile.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeCognitiveAssessmentProfile(params: {
  readonly id: string;
  readonly title: string;
  readonly cognitiveLevel: CognitiveLevel;
  readonly questionType: QuestionType;
  readonly reasoningType: ReasoningType;
  readonly assessmentObjective: AssessmentObjective;
  readonly expectedEvidence: ExpectedEvidenceType;
  readonly status: CognitiveStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: CognitiveProvenance;
}): CognitiveAssessmentProfile {
  const traceId = _deterministicId('cognitive-profile', [params.id]);
  const trace = composeCognitiveTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    cognitiveLevel: params.cognitiveLevel,
    questionType: params.questionType,
    reasoningType: params.reasoningType,
    assessmentObjective: params.assessmentObjective,
    expectedEvidence: params.expectedEvidence,
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose an immutable CognitiveRelationship.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeCognitiveRelationship(params: {
  readonly id: string;
  readonly sourceProfileId: string;
  readonly targetProfileId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): CognitiveRelationship {
  return {
    id: params.id,
    sourceProfileId: params.sourceProfileId,
    targetProfileId: params.targetProfileId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose immutable CognitiveRegistryMetadata.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeCognitiveRegistryMetadata(
  nodes: readonly CognitiveAssessmentProfile[],
): CognitiveRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('cognitive-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_cognitive_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable CognitiveRegistry from pre-composed profiles.
 *
 * Deterministic. Pure. Immutable. Sorted copy.
 */
export function composeCognitiveRegistry(
  nodes: readonly CognitiveAssessmentProfile[],
): CognitiveRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeCognitiveRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable CognitiveRegistry from a CognitiveInput.
 *
 * Deterministic. Pure. Immutable. Sorted copy.
 */
export function composeCognitiveRegistryFromInput(
  input: CognitiveInput,
): CognitiveRegistry {
  return composeCognitiveRegistry(input.nodes);
}

/**
 * Compose cognitive profiles for a set of assessment nodes.
 *
 * Deterministic. Pure. Immutable. One-to-one mapping.
 */
export function composeAssessmentCognitiveProfiles(params: {
  readonly profiles: readonly CognitiveAssessmentProfile[];
}): CognitiveRegistry {
  return composeCognitiveRegistry(params.profiles);
}

/**
 * Compose an assessment artifact enriched with a cognitive profile.
 *
 * Deterministic. Pure. Immutable.
 */
export function composeAssessmentArtifactWithCognitiveProfile(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly cognitiveProfile: CognitiveAssessmentProfile;
}): AssessmentArtifactWithCognitiveProfile {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    cognitiveProfile: params.cognitiveProfile,
  };
}

/**
 * Compose a complete CognitiveValidationResult for a profile.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeCognitiveNodeValidation(
  profile: CognitiveAssessmentProfile,
): CognitiveNodeValidationResult {
  const errors = validateCognitiveAssessmentProfile(profile);

  return {
    valid: errors.length === 0,
    errors,
    profileId: profile.id,
    checkedAt: 'cognitive_node_validation',
  };
}

/**
 * Compose a complete CognitiveValidationResult for a registry.
 *
 * Deterministic. Pure. Immutable.
 */
export function _composeCognitiveRegistryValidation(
  registry: CognitiveRegistry,
): CognitiveRegistryValidationResult {
  const nodeResults = registry.nodes.map((node) =>
    _composeCognitiveNodeValidation(node),
  );

  const allErrors: CognitiveValidationError[] = [];
  for (const result of nodeResults) {
    allErrors.push(...result.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    nodeResults,
    checkedAt: 'cognitive_registry_validation',
  };
}
