/**
 * NV-1500-D3-OPT-07 — Curriculum Review & Reinforcement Planning Kernel
 *
 * Deterministic orchestration functions for curriculum review and reinforcement planning.
 * Produces review/reinforcement registries, traces, and artifacts.
 *
 * This module never:
 * - Personalizes review
 * - Infers forgetting
 * - Infers mastery
 * - Infers readiness
 * - Infers weakness
 * - Schedules reminders
 * - Uses dates
 * - Uses current time
 * - Calculates intervals dynamically
 * - Optimizes review spacing
 * - Mutates curriculum
 * - Mutates dependencies
 * - Mutates progression
 * - Generates educational content
 * - Generates assessments
 * - Executes laboratories
 * - Calls external APIs
 * - Calls LLMs
 * - Accesses network
 * - Accesses filesystem
 * - Accesses databases
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumReviewType,
  CurriculumReinforcementType,
  CurriculumReviewRecurrenceModel,
  CurriculumReviewPlan,
  CurriculumReinforcementPlan,
  CurriculumReviewReinforcementRegistry,
  CurriculumReviewReinforcementDecision,
  CurriculumReviewReinforcementTrace,
  CurriculumReviewReinforcementInput,
  CurriculumReviewReinforcementProvenance,
  CurriculumArtifactWithReviewReinforcement,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_REVIEW_TYPES,
  CANONICAL_REINFORCEMENT_TYPES,
  CANONICAL_REVIEW_RECURRENCE_MODELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Review Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a review type is supported (in canonical review types).
 */
export function isSupportedReviewType(
  type: string,
): type is CurriculumReviewType {
  return CANONICAL_REVIEW_TYPES.includes(type as CurriculumReviewType);
}

/**
 * Returns the canonical review types.
 */
export function getCanonicalReviewTypes(): readonly CurriculumReviewType[] {
  return CANONICAL_REVIEW_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Reinforcement Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a reinforcement type is supported (in canonical reinforcement types).
 */
export function isSupportedReinforcementType(
  type: string,
): type is CurriculumReinforcementType {
  return CANONICAL_REINFORCEMENT_TYPES.includes(type as CurriculumReinforcementType);
}

/**
 * Returns the canonical reinforcement types.
 */
export function getCanonicalReinforcementTypes(): readonly CurriculumReinforcementType[] {
  return CANONICAL_REINFORCEMENT_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Review Recurrence Model Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a review recurrence model is supported (in canonical recurrence models).
 */
export function isSupportedReviewRecurrenceModel(
  model: string,
): model is CurriculumReviewRecurrenceModel {
  return CANONICAL_REVIEW_RECURRENCE_MODELS.includes(model as CurriculumReviewRecurrenceModel);
}

/**
 * Returns the canonical review recurrence models.
 */
export function getCanonicalReviewRecurrenceModels(): readonly CurriculumReviewRecurrenceModel[] {
  return CANONICAL_REVIEW_RECURRENCE_MODELS;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedReviewReinforcementGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Order Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical order index for a review type.
 * Lower index means earlier type.
 */
function _getReviewTypeOrder(reviewType: CurriculumReviewType): number {
  const index = CANONICAL_REVIEW_TYPES.indexOf(reviewType);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for a recurrence model.
 * Lower index means earlier model.
 */
function _getRecurrenceModelOrder(model: CurriculumReviewRecurrenceModel): number {
  const index = CANONICAL_REVIEW_RECURRENCE_MODELS.indexOf(model);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for a reinforcement type.
 * Lower index means earlier type.
 */
function _getReinforcementTypeOrder(reinforcementType: CurriculumReinforcementType): number {
  const index = CANONICAL_REINFORCEMENT_TYPES.indexOf(reinforcementType);
  return index === -1 ? -1 : index;
}

// ---------------------------------------------------------------------------
// Compose Review Plan
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum review plan from provided parameters.
 * Pure function. No side effects.
 */
export function composeReviewPlan(params: {
  readonly reviewId: string;
  readonly reviewType: CurriculumReviewType;
  readonly targetNodeIds: readonly string[];
  readonly targetCompetencyIds: readonly string[];
  readonly targetDependencyIds: readonly string[];
  readonly recurrenceModel: CurriculumReviewRecurrenceModel;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumReviewPlan {
  return {
    reviewId: params.reviewId,
    reviewType: params.reviewType,
    targetNodeIds: [...params.targetNodeIds],
    targetCompetencyIds: [...params.targetCompetencyIds],
    targetDependencyIds: [...params.targetDependencyIds],
    recurrenceModel: params.recurrenceModel,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Reinforcement Plan
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum reinforcement plan from provided parameters.
 * Pure function. No side effects.
 */
export function composeReinforcementPlan(params: {
  readonly reinforcementId: string;
  readonly reinforcementType: CurriculumReinforcementType;
  readonly targetNodeIds: readonly string[];
  readonly targetCompetencyIds: readonly string[];
  readonly targetDependencyIds: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumReinforcementPlan {
  return {
    reinforcementId: params.reinforcementId,
    reinforcementType: params.reinforcementType,
    targetNodeIds: [...params.targetNodeIds],
    targetCompetencyIds: [...params.targetCompetencyIds],
    targetDependencyIds: [...params.targetDependencyIds],
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Review Reinforcement Provenance
// ---------------------------------------------------------------------------

/**
 * Composes review/reinforcement provenance from a registry.
 * Pure function. No side effects.
 */
export function composeReviewReinforcementProvenance(
  registry: CurriculumReviewReinforcementRegistry,
): CurriculumReviewReinforcementProvenance {
  return {
    registryId: registry.registryId,
    source: 'curriculum-review-reinforcement-kernel',
    governanceStatus: 'canonical',
    rationale: 'Review and reinforcement planning provenance.',
    providedBy: 'curriculum-board',
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts review plans deterministically by reviewType, then recurrenceModel, then reviewId.
 */
function _sortReviewPlansDeterministically(
  plans: readonly CurriculumReviewPlan[],
): readonly CurriculumReviewPlan[] {
  return [...plans].sort((a, b) => {
    const typeCompare = _getReviewTypeOrder(a.reviewType) - _getReviewTypeOrder(b.reviewType);
    if (typeCompare !== 0) return typeCompare;
    const recurrenceCompare = _getRecurrenceModelOrder(a.recurrenceModel) - _getRecurrenceModelOrder(b.recurrenceModel);
    if (recurrenceCompare !== 0) return recurrenceCompare;
    return a.reviewId.localeCompare(b.reviewId);
  });
}

/**
 * Sorts reinforcement plans deterministically by reinforcementType, then reinforcementId.
 */
function _sortReinforcementPlansDeterministically(
  plans: readonly CurriculumReinforcementPlan[],
): readonly CurriculumReinforcementPlan[] {
  return [...plans].sort((a, b) => {
    const typeCompare = _getReinforcementTypeOrder(a.reinforcementType) - _getReinforcementTypeOrder(b.reinforcementType);
    if (typeCompare !== 0) return typeCompare;
    return a.reinforcementId.localeCompare(b.reinforcementId);
  });
}

// ---------------------------------------------------------------------------
// Compose Review Reinforcement Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for review plans.
 * Pure function. No side effects.
 */
function _composeReviewDecisions(
  plans: readonly CurriculumReviewPlan[],
): readonly CurriculumReviewReinforcementDecision[] {
  return plans.map((plan) => {
    const validationErrors = _validateReviewPlanForDecision(plan);
    return {
      decisionId: `_decision_review_${plan.reviewId}`,
      decisionType: 'review_plan' as const,
      planId: plan.reviewId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Composes decisions for reinforcement plans.
 * Pure function. No side effects.
 */
function _composeReinforcementDecisions(
  plans: readonly CurriculumReinforcementPlan[],
): readonly CurriculumReviewReinforcementDecision[] {
  return plans.map((plan) => {
    const validationErrors = _validateReinforcementPlanForDecision(plan);
    return {
      decisionId: `_decision_reinforcement_${plan.reinforcementId}`,
      decisionType: 'reinforcement_plan' as const,
      planId: plan.reinforcementId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a review plan for decision composition.
 * Returns validation error codes.
 */
function _validateReviewPlanForDecision(plan: CurriculumReviewPlan): readonly string[] {
  const errors: string[] = [];

  if (!plan.reviewId || plan.reviewId.trim() === '') {
    errors.push('REVIEW_MISSING_ID');
  }

  if (!isSupportedReviewType(plan.reviewType)) {
    errors.push('REVIEW_UNKNOWN_TYPE');
  }

  if (!plan.targetNodeIds || plan.targetNodeIds.length === 0) {
    errors.push('REVIEW_EMPTY_TARGETS');
  }

  if (!isSupportedReviewRecurrenceModel(plan.recurrenceModel)) {
    errors.push('REVIEW_UNKNOWN_RECURRENCE');
  }

  if (!plan.source || plan.source.trim() === '') {
    errors.push('REVIEW_MISSING_SOURCE');
  }

  if (!isSupportedReviewReinforcementGovernanceStatus(plan.governanceStatus)) {
    errors.push('REVIEW_INVALID_STATUS');
  }

  if (!plan.rationale || plan.rationale.trim() === '') {
    errors.push('REVIEW_MISSING_RATIONALE');
  }

  if (!plan.providedBy || plan.providedBy.trim() === '') {
    errors.push('REVIEW_MISSING_PROVIDED_BY');
  }

  return errors;
}

/**
 * Validates a reinforcement plan for decision composition.
 * Returns validation error codes.
 */
function _validateReinforcementPlanForDecision(plan: CurriculumReinforcementPlan): readonly string[] {
  const errors: string[] = [];

  if (!plan.reinforcementId || plan.reinforcementId.trim() === '') {
    errors.push('REINFORCEMENT_MISSING_ID');
  }

  if (!isSupportedReinforcementType(plan.reinforcementType)) {
    errors.push('REINFORCEMENT_UNKNOWN_TYPE');
  }

  if (!plan.targetNodeIds || plan.targetNodeIds.length === 0) {
    errors.push('REINFORCEMENT_EMPTY_TARGETS');
  }

  if (!plan.source || plan.source.trim() === '') {
    errors.push('REINFORCEMENT_MISSING_SOURCE');
  }

  if (!isSupportedReviewReinforcementGovernanceStatus(plan.governanceStatus)) {
    errors.push('REINFORCEMENT_INVALID_STATUS');
  }

  if (!plan.rationale || plan.rationale.trim() === '') {
    errors.push('REINFORCEMENT_MISSING_RATIONALE');
  }

  if (!plan.providedBy || plan.providedBy.trim() === '') {
    errors.push('REINFORCEMENT_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Review Reinforcement
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum review/reinforcement registry from an input.
 * Pure function. No side effects.
 * Review plans sorted by reviewType, then recurrenceModel, then reviewId.
 * Reinforcement plans sorted by reinforcementType, then reinforcementId.
 */
export function composeCurriculumReviewReinforcement(
  input: CurriculumReviewReinforcementInput,
): CurriculumReviewReinforcementRegistry {
  const sortedReviewPlans = _sortReviewPlansDeterministically(input.reviewPlans);
  const sortedReinforcementPlans = _sortReinforcementPlansDeterministically(input.reinforcementPlans);

  return {
    registryId: input.registryId,
    graphId: input.graphId,
    reviewPlans: sortedReviewPlans,
    reinforcementPlans: sortedReinforcementPlans,
    reviewPlanCount: sortedReviewPlans.length,
    reinforcementPlanCount: sortedReinforcementPlans.length,
    deterministic: true,
    generatedFrom: 'deterministic_review_reinforcement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Review Reinforcement Registry
// ---------------------------------------------------------------------------

/**
 * Composes a review/reinforcement registry from parameters.
 * Pure function. No side effects.
 * Plans sorted deterministically.
 */
export function composeReviewReinforcementRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly reviewPlans: readonly CurriculumReviewPlan[];
  readonly reinforcementPlans: readonly CurriculumReinforcementPlan[];
}): CurriculumReviewReinforcementRegistry {
  const sortedReviewPlans = _sortReviewPlansDeterministically(params.reviewPlans);
  const sortedReinforcementPlans = _sortReinforcementPlansDeterministically(params.reinforcementPlans);

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    reviewPlans: sortedReviewPlans,
    reinforcementPlans: sortedReinforcementPlans,
    reviewPlanCount: sortedReviewPlans.length,
    reinforcementPlanCount: sortedReinforcementPlans.length,
    deterministic: true,
    generatedFrom: 'deterministic_review_reinforcement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Review Reinforcement Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a review/reinforcement registry.
 * Pure function. No side effects.
 */
export function composeReviewReinforcementTrace(
  registryId: string,
  reviewPlans: readonly CurriculumReviewPlan[],
  reinforcementPlans: readonly CurriculumReinforcementPlan[],
): CurriculumReviewReinforcementTrace {
  const reviewDecisions = _composeReviewDecisions(reviewPlans);
  const reinforcementDecisions = _composeReinforcementDecisions(reinforcementPlans);
  const allDecisions = [...reviewDecisions, ...reinforcementDecisions];

  return {
    traceId: `_trace_rr_${registryId}`,
    registryId,
    reviewPlanCount: reviewPlans.length,
    reinforcementPlanCount: reinforcementPlans.length,
    decisionsCount: allDecisions.length,
    validatedCount: allDecisions.filter((d) => d.validationPassed).length,
    invalidCount: allDecisions.filter((d) => !d.validationPassed).length,
    decisions: allDecisions,
    deterministic: true,
    generatedFrom: 'deterministic_review_reinforcement_kernel',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Review Reinforcement
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, review/reinforcement registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithReviewReinforcement(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly reviewReinforcementRegistry: CurriculumReviewReinforcementRegistry;
  readonly reviewReinforcementTrace: CurriculumReviewReinforcementTrace;
  readonly validation: CurriculumArtifactWithReviewReinforcement['validation'];
}): CurriculumArtifactWithReviewReinforcement {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    reviewReinforcementRegistry: params.reviewReinforcementRegistry,
    reviewReinforcementTrace: params.reviewReinforcementTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_review_reinforcement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
