/**
 * NV-1500-D3-OPT-07 — Curriculum Review & Reinforcement Planning Validation Layer
 *
 * Deterministic validation for curriculum review and reinforcement planning structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumReviewPlan,
  CurriculumReinforcementPlan,
  CurriculumReviewReinforcementRegistry,
  CurriculumArtifactWithReviewReinforcement,
  CurriculumReviewReinforcementInput,
  CurriculumReviewReinforcementValidationError,
  CurriculumReviewReinforcementValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_REVIEW_TYPES,
  CANONICAL_REINFORCEMENT_TYPES,
  CANONICAL_REVIEW_RECURRENCE_MODELS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const REVIEW_REINFORCEMENT_VALIDATION_CODES = {
  REVIEW_UNKNOWN_TYPE: 'REVIEW_UNKNOWN_TYPE',
  REINFORCEMENT_UNKNOWN_TYPE: 'REINFORCEMENT_UNKNOWN_TYPE',
  REVIEW_UNKNOWN_RECURRENCE: 'REVIEW_UNKNOWN_RECURRENCE',
  REVIEW_DUPLICATE_ID: 'REVIEW_DUPLICATE_ID',
  REINFORCEMENT_DUPLICATE_ID: 'REINFORCEMENT_DUPLICATE_ID',
  REVIEW_INVALID_TARGET: 'REVIEW_INVALID_TARGET',
  REINFORCEMENT_INVALID_TARGET: 'REINFORCEMENT_INVALID_TARGET',
  REVIEW_EMPTY_TARGETS: 'REVIEW_EMPTY_TARGETS',
  REINFORCEMENT_EMPTY_TARGETS: 'REINFORCEMENT_EMPTY_TARGETS',
  REVIEW_MISSING_SOURCE: 'REVIEW_MISSING_SOURCE',
  REINFORCEMENT_MISSING_SOURCE: 'REINFORCEMENT_MISSING_SOURCE',
  REVIEW_MISSING_PROVENANCE: 'REVIEW_MISSING_PROVENANCE',
  REINFORCEMENT_MISSING_PROVENANCE: 'REINFORCEMENT_MISSING_PROVENANCE',
  REVIEW_REINFORCEMENT_EMPTY_REGISTRY: 'REVIEW_REINFORCEMENT_EMPTY_REGISTRY',
  REVIEW_REINFORCEMENT_INVALID_STATUS: 'REVIEW_REINFORCEMENT_INVALID_STATUS',
  REVIEW_RUNTIME_SCHEDULING_FORBIDDEN: 'REVIEW_RUNTIME_SCHEDULING_FORBIDDEN',
  REVIEW_MISSING_ID: 'REVIEW_MISSING_ID',
  REVIEW_MISSING_RATIONALE: 'REVIEW_MISSING_RATIONALE',
  REVIEW_MISSING_PROVIDED_BY: 'REVIEW_MISSING_PROVIDED_BY',
  REINFORCEMENT_MISSING_ID: 'REINFORCEMENT_MISSING_ID',
  REINFORCEMENT_MISSING_RATIONALE: 'REINFORCEMENT_MISSING_RATIONALE',
  REINFORCEMENT_MISSING_PROVIDED_BY: 'REINFORCEMENT_MISSING_PROVIDED_BY',
  REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID: 'REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID',
  REVIEW_REINFORCEMENT_MISSING_GRAPH_ID: 'REVIEW_REINFORCEMENT_MISSING_GRAPH_ID',
  REVIEW_REINFORCEMENT_TRACE_NOT_DETERMINISTIC: 'REVIEW_REINFORCEMENT_TRACE_NOT_DETERMINISTIC',
  REVIEW_REINFORCEMENT_TRACE_RANDOM_USED: 'REVIEW_REINFORCEMENT_TRACE_RANDOM_USED',
  REVIEW_REINFORCEMENT_TRACE_TIME_DEPENDENCY: 'REVIEW_REINFORCEMENT_TRACE_TIME_DEPENDENCY',
  REVIEW_REINFORCEMENT_TRACE_CURRICULUM_MUTATED: 'REVIEW_REINFORCEMENT_TRACE_CURRICULUM_MUTATED',
  REVIEW_REINFORCEMENT_MISSING_PROVENANCE: 'REVIEW_REINFORCEMENT_MISSING_PROVENANCE',
} as const;

// ---------------------------------------------------------------------------
// Review Plan Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum review plan against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReviewPlan(
  plan: CurriculumReviewPlan,
  graphNodeIds: readonly string[],
): readonly CurriculumReviewReinforcementValidationError[] {
  const errors: CurriculumReviewReinforcementValidationError[] = [];

  if (!plan.reviewId || plan.reviewId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_ID,
      message: 'Curriculum review plan is missing a review ID.',
      field: 'reviewId',
      planId: plan.reviewId,
    });
  }

  if (!CANONICAL_REVIEW_TYPES.includes(plan.reviewType)) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_UNKNOWN_TYPE,
      message: `Curriculum review plan has unsupported review type: "${plan.reviewType}".`,
      field: 'reviewType',
      planId: plan.reviewId,
    });
  }

  // Target node validation
  if (!plan.targetNodeIds || plan.targetNodeIds.length === 0) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_EMPTY_TARGETS,
      message: 'Curriculum review plan has no target node IDs.',
      field: 'targetNodeIds',
      planId: plan.reviewId,
    });
  } else {
    for (const nodeId of plan.targetNodeIds) {
      if (!graphNodeIds.includes(nodeId)) {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_INVALID_TARGET,
          message: `Curriculum review plan references non-existent curriculum node: "${nodeId}".`,
          field: 'targetNodeIds',
          planId: plan.reviewId,
          targetId: nodeId,
        });
      }
    }
  }

  // Target competency validation (competencies are not nodes, so we just check they're non-empty strings)
  if (plan.targetCompetencyIds) {
    for (const compId of plan.targetCompetencyIds) {
      if (!compId || compId.trim() === '') {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_INVALID_TARGET,
          message: 'Curriculum review plan has an empty competency ID.',
          field: 'targetCompetencyIds',
          planId: plan.reviewId,
          targetId: compId,
        });
      }
    }
  }

  // Target dependency validation (dependencies are not nodes, so we just check they're non-empty strings)
  if (plan.targetDependencyIds) {
    for (const depId of plan.targetDependencyIds) {
      if (!depId || depId.trim() === '') {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_INVALID_TARGET,
          message: 'Curriculum review plan has an empty dependency ID.',
          field: 'targetDependencyIds',
          planId: plan.reviewId,
          targetId: depId,
        });
      }
    }
  }

  if (!CANONICAL_REVIEW_RECURRENCE_MODELS.includes(plan.recurrenceModel)) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_UNKNOWN_RECURRENCE,
      message: `Curriculum review plan has unsupported recurrence model: "${plan.recurrenceModel}".`,
      field: 'recurrenceModel',
      planId: plan.reviewId,
    });
  }

  if (!plan.source || plan.source.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
      message: 'Curriculum review plan is missing a source.',
      field: 'source',
      planId: plan.reviewId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(plan.governanceStatus)) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_INVALID_STATUS,
      message: `Curriculum review plan has invalid governance status: "${plan.governanceStatus}".`,
      field: 'governanceStatus',
      planId: plan.reviewId,
    });
  }

  if (!plan.rationale || plan.rationale.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
      message: 'Curriculum review plan is missing a rationale.',
      field: 'rationale',
      planId: plan.reviewId,
    });
  }

  if (!plan.providedBy || plan.providedBy.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
      message: 'Curriculum review plan is missing a providedBy.',
      field: 'providedBy',
      planId: plan.reviewId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Reinforcement Plan Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum reinforcement plan against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReinforcementPlan(
  plan: CurriculumReinforcementPlan,
  graphNodeIds: readonly string[],
): readonly CurriculumReviewReinforcementValidationError[] {
  const errors: CurriculumReviewReinforcementValidationError[] = [];

  if (!plan.reinforcementId || plan.reinforcementId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_ID,
      message: 'Curriculum reinforcement plan is missing a reinforcement ID.',
      field: 'reinforcementId',
      planId: plan.reinforcementId,
    });
  }

  if (!CANONICAL_REINFORCEMENT_TYPES.includes(plan.reinforcementType)) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_UNKNOWN_TYPE,
      message: `Curriculum reinforcement plan has unsupported reinforcement type: "${plan.reinforcementType}".`,
      field: 'reinforcementType',
      planId: plan.reinforcementId,
    });
  }

  // Target node validation
  if (!plan.targetNodeIds || plan.targetNodeIds.length === 0) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_TARGETS,
      message: 'Curriculum reinforcement plan has no target node IDs.',
      field: 'targetNodeIds',
      planId: plan.reinforcementId,
    });
  } else {
    for (const nodeId of plan.targetNodeIds) {
      if (!graphNodeIds.includes(nodeId)) {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TARGET,
          message: `Curriculum reinforcement plan references non-existent curriculum node: "${nodeId}".`,
          field: 'targetNodeIds',
          planId: plan.reinforcementId,
          targetId: nodeId,
        });
      }
    }
  }

  // Target competency validation
  if (plan.targetCompetencyIds) {
    for (const compId of plan.targetCompetencyIds) {
      if (!compId || compId.trim() === '') {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TARGET,
          message: 'Curriculum reinforcement plan has an empty competency ID.',
          field: 'targetCompetencyIds',
          planId: plan.reinforcementId,
          targetId: compId,
        });
      }
    }
  }

  // Target dependency validation
  if (plan.targetDependencyIds) {
    for (const depId of plan.targetDependencyIds) {
      if (!depId || depId.trim() === '') {
        errors.push({
          code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TARGET,
          message: 'Curriculum reinforcement plan has an empty dependency ID.',
          field: 'targetDependencyIds',
          planId: plan.reinforcementId,
          targetId: depId,
        });
      }
    }
  }

  if (!plan.source || plan.source.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_SOURCE,
      message: 'Curriculum reinforcement plan is missing a source.',
      field: 'source',
      planId: plan.reinforcementId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(plan.governanceStatus)) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_INVALID_STATUS,
      message: `Curriculum reinforcement plan has invalid governance status: "${plan.governanceStatus}".`,
      field: 'governanceStatus',
      planId: plan.reinforcementId,
    });
  }

  if (!plan.rationale || plan.rationale.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_RATIONALE,
      message: 'Curriculum reinforcement plan is missing a rationale.',
      field: 'rationale',
      planId: plan.reinforcementId,
    });
  }

  if (!plan.providedBy || plan.providedBy.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PROVIDED_BY,
      message: 'Curriculum reinforcement plan is missing a providedBy.',
      field: 'providedBy',
      planId: plan.reinforcementId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Review Reinforcement Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum review/reinforcement registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReviewReinforcementRegistry(
  registry: CurriculumReviewReinforcementRegistry,
  graphNodeIds: readonly string[],
): CurriculumReviewReinforcementValidationResult {
  const errors: CurriculumReviewReinforcementValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID,
      message: 'Curriculum review/reinforcement registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_GRAPH_ID,
      message: 'Curriculum review/reinforcement registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.reviewPlans.length === 0 && registry.reinforcementPlans.length === 0) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Curriculum review/reinforcement registry has no review plans or reinforcement plans.',
      field: 'reviewPlans',
    });
  }

  // Duplicate review plan ID check
  const seenReviewIds = new Set<string>();
  for (const plan of registry.reviewPlans) {
    if (seenReviewIds.has(plan.reviewId)) {
      errors.push({
        code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_DUPLICATE_ID,
        message: `Duplicate review plan ID: "${plan.reviewId}".`,
        planId: plan.reviewId,
      });
    }
    seenReviewIds.add(plan.reviewId);
  }

  // Duplicate reinforcement plan ID check
  const seenReinforcementIds = new Set<string>();
  for (const plan of registry.reinforcementPlans) {
    if (seenReinforcementIds.has(plan.reinforcementId)) {
      errors.push({
        code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_ID,
        message: `Duplicate reinforcement plan ID: "${plan.reinforcementId}".`,
        planId: plan.reinforcementId,
      });
    }
    seenReinforcementIds.add(plan.reinforcementId);
  }

  // Validate each review plan
  for (const plan of registry.reviewPlans) {
    errors.push(...validateReviewPlan(plan, graphNodeIds));
  }

  // Validate each reinforcement plan
  for (const plan of registry.reinforcementPlans) {
    errors.push(...validateReinforcementPlan(plan, graphNodeIds));
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum review/reinforcement registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_RANDOM_USED,
      message: 'Curriculum review/reinforcement registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum review/reinforcement registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_review_reinforcement_planning',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Review Reinforcement Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with review/reinforcement against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithReviewReinforcement(
  artifact: CurriculumArtifactWithReviewReinforcement,
): CurriculumReviewReinforcementValidationResult {
  const errors: CurriculumReviewReinforcementValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate review/reinforcement registry
  if (artifact.reviewReinforcementRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateReviewReinforcementRegistry(
      artifact.reviewReinforcementRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_review_reinforcement_planning',
  };
}

// ---------------------------------------------------------------------------
// Review Reinforcement Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum review/reinforcement input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateReviewReinforcementInput(
  input: CurriculumReviewReinforcementInput,
  graphNodeIds: readonly string[],
): readonly CurriculumReviewReinforcementValidationError[] {
  const errors: CurriculumReviewReinforcementValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_REGISTRY_ID,
      message: 'Curriculum review/reinforcement input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_MISSING_GRAPH_ID,
      message: 'Curriculum review/reinforcement input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.reviewPlans || input.reviewPlans.length === 0) {
    if (!input.reinforcementPlans || input.reinforcementPlans.length === 0) {
      errors.push({
        code: REVIEW_REINFORCEMENT_VALIDATION_CODES.REVIEW_REINFORCEMENT_EMPTY_REGISTRY,
        message: 'Curriculum review/reinforcement input has no review plans or reinforcement plans.',
        field: 'reviewPlans',
      });
    }
  } else {
    for (const plan of input.reviewPlans) {
      errors.push(...validateReviewPlan(plan, graphNodeIds));
    }
  }

  if (input.reinforcementPlans && input.reinforcementPlans.length > 0) {
    for (const plan of input.reinforcementPlans) {
      errors.push(...validateReinforcementPlan(plan, graphNodeIds));
    }
  }

  return errors;
}
