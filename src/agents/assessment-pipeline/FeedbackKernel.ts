/**
 * NV-2000-D8-OPT-06 — Deterministic Feedback Kernel
 *
 * Pure deterministic compose functions for explanatory feedback modeling.
 * The Assessment Agent models canonical educational feedback.
 * It stores feedback, governs feedback, validates feedback.
 * It never creates feedback dynamically or adapts it to individual learners.
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
  type AssessmentArtifactWithFeedback,
  type AssessmentFeedback,
  type AssessmentGovernanceLevel,
  type FeedbackDeliveryType,
  type FeedbackExplanation,
  type FeedbackInput,
  type FeedbackObjective,
  type FeedbackPriority,
  type FeedbackProvenance,
  type FeedbackReference,
  type FeedbackRegistry,
  type FeedbackRegistryMetadata,
  type FeedbackRelationship,
  type FeedbackStatus,
  type FeedbackTone,
  type FeedbackTrace,
  type FeedbackType,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_FEEDBACK_DELIVERY_TYPES,
  CANONICAL_FEEDBACK_OBJECTIVES,
  CANONICAL_FEEDBACK_PRIORITY,
  CANONICAL_FEEDBACK_STATUS,
  CANONICAL_FEEDBACK_TONES,
  CANONICAL_FEEDBACK_TYPES,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported feedback type?
 */
export function isSupportedFeedbackType(
  value: string,
): value is FeedbackType {
  return CANONICAL_FEEDBACK_TYPES.includes(value as FeedbackType);
}

/**
 * Type guard: is the value a supported feedback objective?
 */
export function isSupportedFeedbackObjective(
  value: string,
): value is FeedbackObjective {
  return CANONICAL_FEEDBACK_OBJECTIVES.includes(value as FeedbackObjective);
}

/**
 * Type guard: is the value a supported feedback tone?
 */
export function isSupportedFeedbackTone(
  value: string,
): value is FeedbackTone {
  return CANONICAL_FEEDBACK_TONES.includes(value as FeedbackTone);
}

/**
 * Type guard: is the value a supported feedback delivery type?
 */
export function isSupportedFeedbackDeliveryType(
  value: string,
): value is FeedbackDeliveryType {
  return CANONICAL_FEEDBACK_DELIVERY_TYPES.includes(
    value as FeedbackDeliveryType,
  );
}

/**
 * Type guard: is the value a supported feedback priority?
 */
export function isSupportedFeedbackPriority(
  value: string,
): value is FeedbackPriority {
  return CANONICAL_FEEDBACK_PRIORITY.includes(value as FeedbackPriority);
}

/**
 * Type guard: is the value a supported feedback status?
 */
export function isSupportedFeedbackStatus(
  value: string,
): value is FeedbackStatus {
  return CANONICAL_FEEDBACK_STATUS.includes(value as FeedbackStatus);
}

/**
 * Type guard: is the value a supported feedback governance level?
 */
export function isSupportedFeedbackGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical feedback types.
 */
export function getCanonicalFeedbackTypes(): readonly FeedbackType[] {
  return [...CANONICAL_FEEDBACK_TYPES];
}

/**
 * Returns a copy of canonical feedback objectives.
 */
export function getCanonicalFeedbackObjectives(): readonly FeedbackObjective[] {
  return [...CANONICAL_FEEDBACK_OBJECTIVES];
}

/**
 * Returns a copy of canonical feedback tones.
 */
export function getCanonicalFeedbackTones(): readonly FeedbackTone[] {
  return [...CANONICAL_FEEDBACK_TONES];
}

/**
 * Returns a copy of canonical feedback delivery types.
 */
export function getCanonicalFeedbackDeliveryTypes(): readonly FeedbackDeliveryType[] {
  return [...CANONICAL_FEEDBACK_DELIVERY_TYPES];
}

/**
 * Returns a copy of canonical feedback priorities.
 */
export function getCanonicalFeedbackPriorities(): readonly FeedbackPriority[] {
  return [...CANONICAL_FEEDBACK_PRIORITY];
}

/**
 * Returns a copy of canonical feedback statuses.
 */
export function getCanonicalFeedbackStatuses(): readonly FeedbackStatus[] {
  return [...CANONICAL_FEEDBACK_STATUS];
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
 * Compose an immutable FeedbackProvenance.
 */
export function composeFeedbackProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: FeedbackStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): FeedbackProvenance {
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
 * Compose an immutable FeedbackTrace.
 */
export function composeFeedbackTrace(params: {
  readonly traceId: string;
}): FeedbackTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_feedback_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable FeedbackExplanation.
 */
export function composeFeedbackExplanation(params: {
  readonly id: string;
  readonly explanationType: string;
  readonly rationale: string;
  readonly conceptualBasis: string;
}): FeedbackExplanation {
  return {
    id: params.id,
    explanationType: params.explanationType,
    rationale: params.rationale,
    conceptualBasis: params.conceptualBasis,
  };
}

/**
 * Compose an immutable FeedbackReference.
 */
export function composeFeedbackReference(params: {
  readonly id: string;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly description: string;
}): FeedbackReference {
  return {
    id: params.id,
    referenceType: params.referenceType,
    referenceId: params.referenceId,
    description: params.description,
  };
}

/**
 * Compose an immutable FeedbackRelationship.
 */
export function composeFeedbackRelationship(params: {
  readonly id: string;
  readonly sourceFeedbackId: string;
  readonly targetFeedbackId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): FeedbackRelationship {
  return {
    id: params.id,
    sourceFeedbackId: params.sourceFeedbackId,
    targetFeedbackId: params.targetFeedbackId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentFeedback.
 */
export function composeAssessmentFeedback(params: {
  readonly id: string;
  readonly title: string;
  readonly feedbackType: FeedbackType;
  readonly objective: FeedbackObjective;
  readonly tone: FeedbackTone;
  readonly deliveryType: FeedbackDeliveryType;
  readonly content: string;
  readonly explanation: FeedbackExplanation;
  readonly references: readonly FeedbackReference[];
  readonly conceptIds: readonly string[];
  readonly priority: FeedbackPriority;
  readonly status: FeedbackStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: FeedbackProvenance;
}): AssessmentFeedback {
  const traceId = _deterministicId('feedback', [params.id]);
  const trace = composeFeedbackTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    feedbackType: params.feedbackType,
    objective: params.objective,
    tone: params.tone,
    deliveryType: params.deliveryType,
    content: params.content,
    explanation: params.explanation,
    references: [...params.references],
    conceptIds: [...params.conceptIds],
    priority: params.priority,
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable FeedbackRegistryMetadata.
 */
export function _composeFeedbackRegistryMetadata(
  nodes: readonly AssessmentFeedback[],
): FeedbackRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('feedback-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_feedback_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable FeedbackRegistry from pre-composed nodes.
 */
export function composeFeedbackRegistry(
  nodes: readonly AssessmentFeedback[],
): FeedbackRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeFeedbackRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable FeedbackRegistry from a FeedbackInput.
 */
export function composeFeedbackRegistryFromInput(
  input: FeedbackInput,
): FeedbackRegistry {
  return composeFeedbackRegistry(input.nodes);
}

/**
 * Compose assessment feedback collection into a registry.
 */
export function composeAssessmentFeedbackCollection(params: {
  readonly feedback: readonly AssessmentFeedback[];
}): FeedbackRegistry {
  return composeFeedbackRegistry(params.feedback);
}

/**
 * Compose an assessment artifact enriched with feedback.
 */
export function composeAssessmentArtifactWithFeedback(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly feedback: readonly AssessmentFeedback[];
}): AssessmentArtifactWithFeedback {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    feedback: [...params.feedback],
  };
}
