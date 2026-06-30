/**
 * NV-2000-D8-OPT-12 — Reinforcement Plan Generation Validation Layer
 *
 * Deterministic validation for the Reinforcement Plan Generation Kernel.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentArtifactWithReinforcement,
  type AssessmentArtifactWithReinforcementValidationResult,
  type AssessmentGovernanceLevel,
  type ReinforcementActivity,
  type ReinforcementActivityType,
  type ReinforcementInput,
  type ReinforcementInputValidationResult,
  type ReinforcementObjective,
  type ReinforcementObjectiveType,
  type ReinforcementPlanStatus,
  type ReinforcementPlanType,
  type ReinforcementPriorityType,
  type ReinforcementProvenance,
  type ReinforcementRegistry,
  type ReinforcementRegistryValidationResult,
  type ReinforcementRelationship,
  type ReinforcementTrace,
  type ReinforcementTraceValidationResult,
  type ReinforcementValidationError,
  type ReinforcementValidationResult,
  type AssessmentReinforcementPlan,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_REINFORCEMENT_ACTIVITY_TYPES,
  CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES,
  CANONICAL_REINFORCEMENT_PLAN_TYPES,
  CANONICAL_REINFORCEMENT_PRIORITY_TYPES,
  CANONICAL_REINFORCEMENT_STATUS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (24 codes)
// ============================================================================

export const REINFORCEMENT_VALIDATION_CODES = {
  REINFORCEMENT_DUPLICATE_ID: 'REINFORCEMENT_DUPLICATE_ID',
  REINFORCEMENT_DUPLICATE_TITLE: 'REINFORCEMENT_DUPLICATE_TITLE',
  REINFORCEMENT_OBJECTIVE_DUPLICATE_ID: 'REINFORCEMENT_OBJECTIVE_DUPLICATE_ID',
  REINFORCEMENT_ACTIVITY_DUPLICATE_ID: 'REINFORCEMENT_ACTIVITY_DUPLICATE_ID',
  REINFORCEMENT_RELATIONSHIP_DUPLICATE_ID: 'REINFORCEMENT_RELATIONSHIP_DUPLICATE_ID',
  REINFORCEMENT_INVALID_PLAN_TYPE: 'REINFORCEMENT_INVALID_PLAN_TYPE',
  REINFORCEMENT_INVALID_OBJECTIVE: 'REINFORCEMENT_INVALID_OBJECTIVE',
  REINFORCEMENT_INVALID_ACTIVITY: 'REINFORCEMENT_INVALID_ACTIVITY',
  REINFORCEMENT_INVALID_PRIORITY: 'REINFORCEMENT_INVALID_PRIORITY',
  REINFORCEMENT_INVALID_STATUS: 'REINFORCEMENT_INVALID_STATUS',
  REINFORCEMENT_INVALID_GOVERNANCE: 'REINFORCEMENT_INVALID_GOVERNANCE',
  REINFORCEMENT_MISSING_PROVENANCE: 'REINFORCEMENT_MISSING_PROVENANCE',
  REINFORCEMENT_MISSING_PROVIDER: 'REINFORCEMENT_MISSING_PROVIDER',
  REINFORCEMENT_MISSING_RATIONALE: 'REINFORCEMENT_MISSING_RATIONALE',
  REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE: 'REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE',
  REINFORCEMENT_MISSING_PLAN_ID: 'REINFORCEMENT_MISSING_PLAN_ID',
  REINFORCEMENT_MISSING_TITLE: 'REINFORCEMENT_MISSING_TITLE',
  REINFORCEMENT_SELF_RELATIONSHIP: 'REINFORCEMENT_SELF_RELATIONSHIP',
  REINFORCEMENT_EMPTY_REGISTRY: 'REINFORCEMENT_EMPTY_REGISTRY',
  REINFORCEMENT_INVALID_TRACE: 'REINFORCEMENT_INVALID_TRACE',
  REINFORCEMENT_REGISTRY_INCONSISTENCY: 'REINFORCEMENT_REGISTRY_INCONSISTENCY',
  REINFORCEMENT_INVALID_CONFIGURATION: 'REINFORCEMENT_INVALID_CONFIGURATION',
  REINFORCEMENT_INVALID_REFERENCE: 'REINFORCEMENT_INVALID_REFERENCE',
  REINFORCEMENT_DUPLICATE_RELATIONSHIP: 'REINFORCEMENT_DUPLICATE_RELATIONSHIP',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a ReinforcementObjective.
 */
export function validateReinforcementObjective(
  objective: ReinforcementObjective,
): readonly ReinforcementValidationError[] {
  const errors: ReinforcementValidationError[] = [];

  if (!objective.id || objective.id.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_OBJECTIVE_DUPLICATE_ID,
      message: 'Objective is missing a valid id.',
      field: 'id',
    });
  }

  if (!objective.objectiveType || !CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES.includes(objective.objectiveType)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_OBJECTIVE,
      message: `Invalid objective type: ${String(objective.objectiveType)}`,
      field: 'objectiveType',
      entityId: objective.id,
    });
  }

  return errors;
}

/**
 * Validate a ReinforcementActivity.
 */
export function validateReinforcementActivity(
  activity: ReinforcementActivity,
): readonly ReinforcementValidationError[] {
  const errors: ReinforcementValidationError[] = [];

  if (!activity.id || activity.id.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_ACTIVITY_DUPLICATE_ID,
      message: 'Activity is missing a valid id.',
      field: 'id',
    });
  }

  if (!activity.activityType || !CANONICAL_REINFORCEMENT_ACTIVITY_TYPES.includes(activity.activityType)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_ACTIVITY,
      message: `Invalid activity type: ${String(activity.activityType)}`,
      field: 'activityType',
      entityId: activity.id,
    });
  }

  return errors;
}

/**
 * Validate a single AssessmentReinforcementPlan.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentReinforcementPlan(
  plan: AssessmentReinforcementPlan,
): readonly ReinforcementValidationError[] {
  const errors: ReinforcementValidationError[] = [];

  if (!plan || typeof plan !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PLAN_ID,
      message: 'Plan is null or not an object.',
    });
    return errors;
  }

  if (!plan.id || typeof plan.id !== 'string' || plan.id.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PLAN_ID,
      message: 'Plan is missing a valid id.',
      field: 'id',
      entityId: plan.id ?? 'unknown',
    });
  }

  if (!plan.title || typeof plan.title !== 'string' || plan.title.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_TITLE,
      message: 'Plan is missing a valid title.',
      field: 'title',
      entityId: plan.id,
    });
  }

  if (!plan.planType || !CANONICAL_REINFORCEMENT_PLAN_TYPES.includes(plan.planType)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_PLAN_TYPE,
      message: `Invalid plan type: ${String(plan.planType)}`,
      field: 'planType',
      entityId: plan.id,
    });
  }

  if (!plan.objectives || !Array.isArray(plan.objectives) || plan.objectives.length === 0) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_CONFIGURATION,
      message: 'Plan is missing objectives array.',
      field: 'objectives',
      entityId: plan.id,
    });
  } else {
    for (const objective of plan.objectives) {
      const objectiveErrors = validateReinforcementObjective(objective);
      errors.push(...objectiveErrors);
    }
  }

  if (!plan.activities || !Array.isArray(plan.activities) || plan.activities.length === 0) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_CONFIGURATION,
      message: 'Plan is missing activities array.',
      field: 'activities',
      entityId: plan.id,
    });
  } else {
    for (const activity of plan.activities) {
      const activityErrors = validateReinforcementActivity(activity);
      errors.push(...activityErrors);
    }
  }

  if (!plan.priority || !CANONICAL_REINFORCEMENT_PRIORITY_TYPES.includes(plan.priority)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_PRIORITY,
      message: `Invalid priority: ${String(plan.priority)}`,
      field: 'priority',
      entityId: plan.id,
    });
  }

  if (!plan.conceptIds || !Array.isArray(plan.conceptIds) || plan.conceptIds.length === 0) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Plan is missing conceptIds.',
      field: 'conceptIds',
      entityId: plan.id,
    });
  }

  if (!plan.status || !CANONICAL_REINFORCEMENT_STATUS.includes(plan.status)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_STATUS,
      message: `Invalid status: ${String(plan.status)}`,
      field: 'status',
      entityId: plan.id,
    });
  }

  if (!plan.governance || !CANONICAL_ASSESSMENT_GOVERNANCE.includes(plan.governance)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_GOVERNANCE,
      message: `Invalid governance: ${String(plan.governance)}`,
      field: 'governance',
      entityId: plan.id,
    });
  }

  if (!plan.provenance || typeof plan.provenance !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PROVENANCE,
      message: 'Plan is missing provenance.',
      field: 'provenance',
      entityId: plan.id,
    });
  } else {
    if (!plan.provenance.provider || plan.provenance.provider.trim() === '') {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PROVIDER,
        message: 'Provenance is missing a valid provider.',
        field: 'provenance.provider',
        entityId: plan.id,
      });
    }
    if (!plan.provenance.rationale || plan.provenance.rationale.trim() === '') {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_RATIONALE,
        message: 'Provenance is missing a valid rationale.',
        field: 'provenance.rationale',
        entityId: plan.id,
      });
    }
  }

  if (!plan.trace || typeof plan.trace !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Plan is missing trace metadata.',
      field: 'trace',
      entityId: plan.id,
    });
  } else {
    if (plan.trace.deterministic !== true) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
        entityId: plan.id,
      });
    }
    if (plan.trace.randomUsed !== false) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
        entityId: plan.id,
      });
    }
    if (plan.trace.timeDependency !== false) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
        entityId: plan.id,
      });
    }
  }

  return errors;
}

/**
 * Validate a ReinforcementRelationship.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateReinforcementRelationship(
  rel: ReinforcementRelationship,
): readonly ReinforcementValidationError[] {
  const errors: ReinforcementValidationError[] = [];

  if (!rel.id || rel.id.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_REFERENCE,
      message: 'Relationship is missing a valid id.',
      field: 'id',
    });
  }

  if (!rel.sourcePlanId || rel.sourcePlanId.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_REFERENCE,
      message: 'Relationship is missing sourcePlanId.',
      field: 'sourcePlanId',
      entityId: rel.id,
    });
  }

  if (!rel.targetPlanId || rel.targetPlanId.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_REFERENCE,
      message: 'Relationship is missing targetPlanId.',
      field: 'targetPlanId',
      entityId: rel.id,
    });
  }

  if (
    rel.sourcePlanId &&
    rel.targetPlanId &&
    rel.sourcePlanId === rel.targetPlanId
  ) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_SELF_RELATIONSHIP,
      message: 'Relationship cannot reference itself (source equals target).',
      field: 'sourcePlanId',
      entityId: rel.id,
    });
  }

  return errors;
}

/**
 * Validate a ReinforcementRegistry.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateReinforcementRegistry(
  registry: ReinforcementRegistry,
): ReinforcementRegistryValidationResult {
  const errors: ReinforcementValidationError[] = [];

  if (!registry || typeof registry !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Registry is null or not an object.',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'reinforcement_registry_validation',
    };
  }

  if (!registry.nodes || !Array.isArray(registry.nodes)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Registry is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'reinforcement_registry_validation',
    };
  }

  if (registry.nodes.length === 0) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Registry has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      nodeResults: [],
      checkedAt: 'reinforcement_registry_validation',
    };
  }

  const nodeResults = registry.nodes.map((node) => {
    const nodeErrors = validateAssessmentReinforcementPlan(node);
    return {
      valid: nodeErrors.length === 0,
      errors: nodeErrors,
      checkedAt: 'reinforcement_node_validation' as const,
    };
  });

  for (const result of nodeResults) {
    errors.push(...result.errors);
  }

  const idSet = new Set<string>();
  const titleSet = new Set<string>();
  for (const node of registry.nodes) {
    if (idSet.has(node.id)) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_ID,
        message: `Duplicate reinforcement plan id: ${node.id}`,
        field: 'id',
        entityId: node.id,
      });
    }
    idSet.add(node.id);

    if (titleSet.has(node.title)) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_TITLE,
        message: `Duplicate reinforcement plan title: ${node.title}`,
        field: 'title',
        entityId: node.id,
      });
    }
    titleSet.add(node.title);
  }

  if (!registry.metadata || typeof registry.metadata !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_REGISTRY_INCONSISTENCY,
      message: 'Registry is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (registry.metadata.nodeCount !== registry.nodes.length) {
      errors.push({
        code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_REGISTRY_INCONSISTENCY,
        message: `Metadata nodeCount (${registry.metadata.nodeCount}) does not match actual node count (${registry.nodes.length}).`,
        field: 'metadata.nodeCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    nodeResults,
    checkedAt: 'reinforcement_registry_validation',
  };
}

/**
 * Validate a ReinforcementInput.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateReinforcementInput(
  input: ReinforcementInput,
): ReinforcementInputValidationResult {
  const errors: ReinforcementValidationError[] = [];

  if (!input || typeof input !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Input is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'reinforcement_input_validation',
    };
  }

  if (!input.nodes || !Array.isArray(input.nodes)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Input is missing nodes array.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'reinforcement_input_validation',
    };
  }

  if (input.nodes.length === 0) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_EMPTY_REGISTRY,
      message: 'Input has no nodes.',
      field: 'nodes',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'reinforcement_input_validation',
    };
  }

  for (const node of input.nodes) {
    const nodeErrors = validateAssessmentReinforcementPlan(node);
    errors.push(...nodeErrors);
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'reinforcement_input_validation',
  };
}

/**
 * Validate a ReinforcementTrace.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateReinforcementTrace(
  trace: ReinforcementTrace,
): ReinforcementTraceValidationResult {
  const errors: ReinforcementValidationError[] = [];

  if (!trace || typeof trace !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Trace is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'reinforcement_trace_validation',
    };
  }

  if (!trace.traceId || typeof trace.traceId !== 'string' || trace.traceId.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Trace is missing a valid traceId.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE,
      message: 'Trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'reinforcement_trace_validation',
  };
}

/**
 * Validate an AssessmentArtifactWithReinforcement.
 * Returns structured errors. Never throws. Deterministic.
 */
export function validateAssessmentArtifactWithReinforcement(
  artifact: AssessmentArtifactWithReinforcement,
): AssessmentArtifactWithReinforcementValidationResult {
  const errors: ReinforcementValidationError[] = [];

  if (!artifact || typeof artifact !== 'object') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is null or not an object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'artifact_reinforcement_validation',
    };
  }

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE,
      message: 'Artifact is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!artifact.artifactTitle || artifact.artifactTitle.trim() === '') {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_TITLE,
      message: 'Artifact is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  if (!artifact.reinforcementPlans || !Array.isArray(artifact.reinforcementPlans)) {
    errors.push({
      code: REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PROVENANCE,
      message: 'Artifact is missing reinforcementPlans array.',
      field: 'reinforcementPlans',
    });
  } else {
    for (const plan of artifact.reinforcementPlans) {
      const planErrors = validateAssessmentReinforcementPlan(plan);
      errors.push(...planErrors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'artifact_reinforcement_validation',
  };
}
