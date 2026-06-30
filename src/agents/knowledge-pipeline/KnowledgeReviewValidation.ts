/**
 * NV-1700-D5-OPT-08 — Knowledge Review Validation Layer
 *
 * Deterministic validation for review planning metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeReviewTrigger,
  KnowledgeMaintenanceTask,
  KnowledgeReviewPlan,
  KnowledgeReviewRegistry,
  KnowledgeReviewTrace,
  KnowledgeReviewInput,
  KnowledgeArtifactWithReviewPlan,
  KnowledgeReviewValidationError,
  KnowledgeReviewTriggerValidationResult,
  KnowledgeMaintenanceTaskValidationResult,
  KnowledgeReviewPlanValidationResult,
  KnowledgeReviewRegistryValidationResult,
  KnowledgeReviewInputValidationResult,
  KnowledgeReviewTraceValidationResult,
  KnowledgeArtifactWithReviewPlanValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REVIEW_TRIGGER_TYPES,
  CANONICAL_MAINTENANCE_TYPES,
  CANONICAL_MAINTENANCE_PRIORITY,
  CANONICAL_REVIEW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const REVIEW_VALIDATION_CODES = {
  REVIEW_DUPLICATE_PLAN: 'REVIEW_DUPLICATE_PLAN',
  REVIEW_DUPLICATE_TASK: 'REVIEW_DUPLICATE_TASK',
  REVIEW_DUPLICATE_TRIGGER: 'REVIEW_DUPLICATE_TRIGGER',
  REVIEW_INVALID_MAINTENANCE_TYPE: 'REVIEW_INVALID_MAINTENANCE_TYPE',
  REVIEW_INVALID_TRIGGER_TYPE: 'REVIEW_INVALID_TRIGGER_TYPE',
  REVIEW_INVALID_PRIORITY: 'REVIEW_INVALID_PRIORITY',
  REVIEW_INVALID_STATUS: 'REVIEW_INVALID_STATUS',
  REVIEW_MISSING_PROVENANCE: 'REVIEW_MISSING_PROVENANCE',
  REVIEW_MISSING_RATIONALE: 'REVIEW_MISSING_RATIONALE',
  REVIEW_MISSING_SOURCE: 'REVIEW_MISSING_SOURCE',
  REVIEW_INVALID_GOVERNANCE: 'REVIEW_INVALID_GOVERNANCE',
  REVIEW_INVALID_REFERENCES: 'REVIEW_INVALID_REFERENCES',
  REVIEW_EMPTY_REGISTRY: 'REVIEW_EMPTY_REGISTRY',
  REVIEW_INVALID_TRACE: 'REVIEW_INVALID_TRACE',
  REVIEW_MISSING_PLAN_ID: 'REVIEW_MISSING_PLAN_ID',
  REVIEW_MISSING_TASK_ID: 'REVIEW_MISSING_TASK_ID',
  REVIEW_MISSING_TRIGGER_ID: 'REVIEW_MISSING_TRIGGER_ID',
  REVIEW_MISSING_ARTIFACT_ID: 'REVIEW_MISSING_ARTIFACT_ID',
  REVIEW_MISSING_PROVIDED_BY: 'REVIEW_MISSING_PROVIDED_BY',
  REVIEW_INVALID_REGISTRY: 'REVIEW_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Knowledge Review Trigger Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge review trigger against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeReviewTrigger(
  trigger: KnowledgeReviewTrigger,
): readonly KnowledgeReviewValidationError[] {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!trigger.triggerId || trigger.triggerId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_TRIGGER_ID,
      message: 'Knowledge review trigger is missing a trigger ID.',
      field: 'triggerId',
      id: trigger.triggerId,
    });
  }

  if (!trigger.artifactId || trigger.artifactId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
      message: 'Knowledge review trigger is missing an artifact ID.',
      field: 'artifactId',
      id: trigger.triggerId,
    });
  }

  if (!CANONICAL_REVIEW_TRIGGER_TYPES.includes(trigger.triggerType)) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRIGGER_TYPE,
      message: `Knowledge review trigger has unsupported type: "${trigger.triggerType}".`,
      field: 'triggerType',
      id: trigger.triggerId,
    });
  }

  if (!CANONICAL_MAINTENANCE_PRIORITY.includes(trigger.priority)) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_PRIORITY,
      message: `Knowledge review trigger has unsupported priority: "${trigger.priority}".`,
      field: 'priority',
      id: trigger.triggerId,
    });
  }

  if (!trigger.provenance) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
      message: 'Knowledge review trigger is missing provenance.',
      field: 'provenance',
      id: trigger.triggerId,
    });
  } else {
    if (!trigger.provenance.source || trigger.provenance.source.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
        message: 'Trigger provenance is missing a source.',
        field: 'provenance.source',
        id: trigger.triggerId,
      });
    }

    if (!trigger.provenance.rationale || trigger.provenance.rationale.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
        message: 'Trigger provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: trigger.triggerId,
      });
    }

    if (!trigger.provenance.providedBy || trigger.provenance.providedBy.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
        message: 'Trigger provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: trigger.triggerId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(trigger.provenance.governanceStatus)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_GOVERNANCE,
        message: `Trigger provenance has invalid governance status: "${trigger.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: trigger.triggerId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Maintenance Task Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge maintenance task against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeMaintenanceTask(
  task: KnowledgeMaintenanceTask,
): readonly KnowledgeReviewValidationError[] {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!task.taskId || task.taskId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_TASK_ID,
      message: 'Knowledge maintenance task is missing a task ID.',
      field: 'taskId',
      id: task.taskId,
    });
  }

  if (!task.artifactId || task.artifactId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
      message: 'Knowledge maintenance task is missing an artifact ID.',
      field: 'artifactId',
      id: task.taskId,
    });
  }

  if (!CANONICAL_MAINTENANCE_TYPES.includes(task.maintenanceType)) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_MAINTENANCE_TYPE,
      message: `Knowledge maintenance task has unsupported type: "${task.maintenanceType}".`,
      field: 'maintenanceType',
      id: task.taskId,
    });
  }

  if (!CANONICAL_MAINTENANCE_PRIORITY.includes(task.priority)) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_PRIORITY,
      message: `Knowledge maintenance task has unsupported priority: "${task.priority}".`,
      field: 'priority',
      id: task.taskId,
    });
  }

  if (!task.provenance) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
      message: 'Knowledge maintenance task is missing provenance.',
      field: 'provenance',
      id: task.taskId,
    });
  } else {
    if (!task.provenance.source || task.provenance.source.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
        message: 'Task provenance is missing a source.',
        field: 'provenance.source',
        id: task.taskId,
      });
    }

    if (!task.provenance.rationale || task.provenance.rationale.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
        message: 'Task provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: task.taskId,
      });
    }

    if (!task.provenance.providedBy || task.provenance.providedBy.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
        message: 'Task provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: task.taskId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(task.provenance.governanceStatus)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_GOVERNANCE,
        message: `Task provenance has invalid governance status: "${task.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: task.taskId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Review Plan Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge review plan against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeReviewPlan(
  plan: KnowledgeReviewPlan,
): readonly KnowledgeReviewValidationError[] {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!plan.planId || plan.planId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PLAN_ID,
      message: 'Knowledge review plan is missing a plan ID.',
      field: 'planId',
      id: plan.planId,
    });
  }

  if (!plan.artifactId || plan.artifactId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
      message: 'Knowledge review plan is missing an artifact ID.',
      field: 'artifactId',
      id: plan.planId,
    });
  }

  if (!plan.provenance) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
      message: 'Knowledge review plan is missing provenance.',
      field: 'provenance',
      id: plan.planId,
    });
  } else {
    if (!plan.provenance.source || plan.provenance.source.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
        message: 'Plan provenance is missing a source.',
        field: 'provenance.source',
        id: plan.planId,
      });
    }

    if (!plan.provenance.rationale || plan.provenance.rationale.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
        message: 'Plan provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: plan.planId,
      });
    }

    if (!plan.provenance.providedBy || plan.provenance.providedBy.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
        message: 'Plan provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: plan.planId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(plan.provenance.governanceStatus)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_GOVERNANCE,
        message: `Plan provenance has invalid governance status: "${plan.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: plan.planId,
      });
    }
  }

  // Validate each task in the plan
  for (const task of plan.tasks) {
    errors.push(...validateKnowledgeMaintenanceTask(task));
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Review Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge review registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeReviewRegistry(
  registry: KnowledgeReviewRegistry,
): KnowledgeReviewRegistryValidationResult {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.plans || registry.plans.length === 0) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_EMPTY_REGISTRY,
      message: 'Registry has no plans.',
      field: 'plans',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate plan IDs
  const seenPlanIds = new Set<string>();
  for (const plan of registry.plans) {
    if (seenPlanIds.has(plan.planId)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_PLAN,
        message: `Duplicate plan ID: "${plan.planId}".`,
        id: plan.planId,
      });
    }
    seenPlanIds.add(plan.planId);
  }

  // Check for duplicate task IDs
  const seenTaskIds = new Set<string>();
  for (const task of registry.tasks) {
    if (seenTaskIds.has(task.taskId)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_TASK,
        message: `Duplicate task ID: "${task.taskId}".`,
        id: task.taskId,
      });
    }
    seenTaskIds.add(task.taskId);
  }

  // Check for duplicate trigger IDs
  const seenTriggerIds = new Set<string>();
  for (const trigger of registry.triggers) {
    if (seenTriggerIds.has(trigger.triggerId)) {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_TRIGGER,
        message: `Duplicate trigger ID: "${trigger.triggerId}".`,
        id: trigger.triggerId,
      });
    }
    seenTriggerIds.add(trigger.triggerId);
  }

  // Validate each plan
  for (const plan of registry.plans) {
    errors.push(...validateKnowledgeReviewPlan(plan));
  }

  // Validate each task
  for (const task of registry.tasks) {
    errors.push(...validateKnowledgeMaintenanceTask(task));
  }

  // Validate each trigger
  for (const trigger of registry.triggers) {
    errors.push(...validateKnowledgeReviewTrigger(trigger));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_review_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates knowledge review input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeReviewInput(
  input: KnowledgeReviewInput,
): KnowledgeReviewInputValidationResult {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!input.plans || input.plans.length === 0) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_EMPTY_REGISTRY,
      message: 'Input has no plans.',
      field: 'plans',
    });
  } else {
    for (const plan of input.plans) {
      errors.push(...validateKnowledgeReviewPlan(plan));
    }
  }

  for (const task of input.tasks) {
    errors.push(...validateKnowledgeMaintenanceTask(task));
  }

  for (const trigger of input.triggers) {
    errors.push(...validateKnowledgeReviewTrigger(trigger));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_review_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge review trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeReviewTrace(
  trace: KnowledgeReviewTrace,
): KnowledgeReviewTraceValidationResult {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Knowledge review trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Knowledge review trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Knowledge review trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRACE,
      message: 'Knowledge review trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_review_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Review Plan Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with review plan against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithReviewPlan(
  artifact: KnowledgeArtifactWithReviewPlan,
): KnowledgeArtifactWithReviewPlanValidationResult {
  const errors: KnowledgeReviewValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each plan
  for (const plan of artifact.plans) {
    errors.push(...validateKnowledgeReviewPlan(plan));
  }

  // Validate each task
  for (const task of artifact.tasks) {
    errors.push(...validateKnowledgeMaintenanceTask(task));
  }

  // Validate each trigger
  for (const trigger of artifact.triggers) {
    errors.push(...validateKnowledgeReviewTrigger(trigger));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_review_plan_composition',
  };
}
