/**
 * NV-1700-D5-OPT-08 — Knowledge Review Planning & Maintenance Orchestration Kernel
 *
 * Deterministic orchestration functions for review planning metadata.
 * Produces triggers, tasks, plans, traces, and registries.
 *
 * This module never:
 * - Performs reviews
 * - Updates knowledge
 * - Edits artifacts
 * - Creates revisions
 * - Updates references
 * - Rewrites documentation
 * - Schedules runtime jobs
 * - Estimates educational quality
 * - Calls LLMs
 * - Calls external APIs
 *
 * Knowledge review planning metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeReviewTrigger,
  KnowledgeMaintenanceTask,
  KnowledgeReviewPlan,
  ReviewProvenance,
  KnowledgeReviewTrace,
  KnowledgeReviewRegistry,
  KnowledgeReviewRegistryMetadata,
  KnowledgeReviewInput,
  ReviewTriggerType,
  MaintenanceType,
  MaintenancePriority,
  ReviewStatus,
  KnowledgeGovernanceStatus,
  KnowledgeArtifactWithReviewPlan,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REVIEW_TRIGGER_TYPES,
  CANONICAL_MAINTENANCE_TYPES,
  CANONICAL_MAINTENANCE_PRIORITY,
  CANONICAL_REVIEW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Review Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes review provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeReviewProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): ReviewProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Trigger Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge review trigger from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeReviewTrigger(params: {
  readonly triggerId: string;
  readonly triggerType: ReviewTriggerType;
  readonly artifactId: string;
  readonly priority: MaintenancePriority;
  readonly rationale: string;
  readonly provenance: ReviewProvenance;
}): KnowledgeReviewTrigger {
  return {
    triggerId: params.triggerId,
    triggerType: params.triggerType,
    artifactId: params.artifactId,
    priority: params.priority,
    rationale: params.rationale,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Maintenance Task Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge maintenance task from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeMaintenanceTask(params: {
  readonly taskId: string;
  readonly maintenanceType: MaintenanceType;
  readonly artifactId: string;
  readonly priority: MaintenancePriority;
  readonly triggerIds: readonly string[];
  readonly provenance: ReviewProvenance;
}): KnowledgeMaintenanceTask {
  return {
    taskId: params.taskId,
    maintenanceType: params.maintenanceType,
    artifactId: params.artifactId,
    priority: params.priority,
    triggerIds: [...params.triggerIds],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Plan Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge review plan from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeReviewPlan(params: {
  readonly planId: string;
  readonly artifactId: string;
  readonly tasks: readonly KnowledgeMaintenanceTask[];
  readonly summary: string;
  readonly provenance: ReviewProvenance;
}): KnowledgeReviewPlan {
  return {
    planId: params.planId,
    artifactId: params.artifactId,
    tasks: [...params.tasks],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge review trace from metadata.
 * Pure function. No side effects.
 */
export function composeKnowledgeReviewTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly compositionMetadata: string;
  readonly deterministicMetadata: string;
}): KnowledgeReviewTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    compositionMetadata: params.compositionMetadata,
    deterministicMetadata: params.deterministicMetadata,
    deterministic: true,
    generatedFrom: 'deterministic_review_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for knowledge review plans.
 * Sorts by planId, then artifactId.
 * Pure function. No side effects.
 */
function _compareKnowledgeReviewPlan(
  a: KnowledgeReviewPlan,
  b: KnowledgeReviewPlan,
): number {
  if (a.planId < b.planId) return -1;
  if (a.planId > b.planId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  return 0;
}

/**
 * Deterministic comparator for knowledge maintenance tasks.
 * Sorts by taskId, then artifactId, then maintenanceType.
 * Pure function. No side effects.
 */
function _compareKnowledgeMaintenanceTask(
  a: KnowledgeMaintenanceTask,
  b: KnowledgeMaintenanceTask,
): number {
  if (a.taskId < b.taskId) return -1;
  if (a.taskId > b.taskId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  if (a.maintenanceType < b.maintenanceType) return -1;
  if (a.maintenanceType > b.maintenanceType) return 1;

  return 0;
}

/**
 * Deterministic comparator for knowledge review triggers.
 * Sorts by triggerId, then artifactId, then triggerType.
 * Pure function. No side effects.
 */
function _compareKnowledgeReviewTrigger(
  a: KnowledgeReviewTrigger,
  b: KnowledgeReviewTrigger,
): number {
  if (a.triggerId < b.triggerId) return -1;
  if (a.triggerId > b.triggerId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  if (a.triggerType < b.triggerType) return -1;
  if (a.triggerType > b.triggerType) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Knowledge Review Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge review registry from plans, tasks, and triggers.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeKnowledgeReviewRegistry(
  plans: readonly KnowledgeReviewPlan[],
  tasks: readonly KnowledgeMaintenanceTask[],
  triggers: readonly KnowledgeReviewTrigger[],
): KnowledgeReviewRegistry {
  const sortedPlans = [...plans].sort(_compareKnowledgeReviewPlan);
  const sortedTasks = [...tasks].sort(_compareKnowledgeMaintenanceTask);
  const sortedTriggers = [...triggers].sort(_compareKnowledgeReviewTrigger);

  const maintenanceTypes = new Set(sortedTasks.map((t) => t.maintenanceType));

  const metadata: KnowledgeReviewRegistryMetadata = {
    registryId: `_registry_${sortedPlans.length}_${sortedTasks.length}_${sortedTriggers.length}`,
    planCount: sortedPlans.length,
    taskCount: sortedTasks.length,
    triggerCount: sortedTriggers.length,
    maintenanceTypeCount: maintenanceTypes.size,
  };

  return {
    registryId: metadata.registryId,
    plans: sortedPlans,
    tasks: sortedTasks,
    triggers: sortedTriggers,
    metadata,
    trace: {
      traceId: `_trace_${sortedPlans.length}_${sortedTasks.length}_${sortedTriggers.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: true,
      generatedFrom: 'deterministic_review_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_review_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Review Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge review registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeReviewRegistryFromInput(
  input: KnowledgeReviewInput,
): KnowledgeReviewRegistry {
  return composeKnowledgeReviewRegistry(
    input.plans,
    input.tasks,
    input.triggers,
  );
}

// ---------------------------------------------------------------------------
// Knowledge Review Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete knowledge review registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeReview(
  input: KnowledgeReviewInput,
): KnowledgeReviewRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const plan of input.plans) {
    decisionCount++;
    const errors = _validatePlanForDecision(plan);
    if (errors.length === 0) validationCount++;
  }

  for (const task of input.tasks) {
    decisionCount++;
    const errors = _validateTaskForDecision(task);
    if (errors.length === 0) validationCount++;
  }

  for (const trigger of input.triggers) {
    decisionCount++;
    const errors = _validateTriggerForDecision(trigger);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeKnowledgeReviewRegistry(
    input.plans,
    input.tasks,
    input.triggers,
  );

  return {
    ...registry,
    trace: composeKnowledgeReviewTrace({
      traceId: `_trace_${input.plans.length}_${input.tasks.length}_${input.triggers.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    }),
  };
}

/**
 * Validates a knowledge review plan for decision composition.
 * Pure function. No side effects.
 */
function _validatePlanForDecision(
  plan: KnowledgeReviewPlan,
): readonly string[] {
  const errors: string[] = [];

  if (!plan.planId || plan.planId.trim() === '') {
    errors.push('REVIEW_MISSING_PLAN_ID');
  }

  if (!plan.artifactId || plan.artifactId.trim() === '') {
    errors.push('REVIEW_MISSING_ARTIFACT_ID');
  }

  if (!plan.provenance) {
    errors.push('REVIEW_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a knowledge maintenance task for decision composition.
 * Pure function. No side effects.
 */
function _validateTaskForDecision(
  task: KnowledgeMaintenanceTask,
): readonly string[] {
  const errors: string[] = [];

  if (!task.taskId || task.taskId.trim() === '') {
    errors.push('REVIEW_MISSING_TASK_ID');
  }

  if (!CANONICAL_MAINTENANCE_TYPES.includes(task.maintenanceType)) {
    errors.push('REVIEW_INVALID_MAINTENANCE_TYPE');
  }

  if (!CANONICAL_MAINTENANCE_PRIORITY.includes(task.priority)) {
    errors.push('REVIEW_INVALID_PRIORITY');
  }

  if (!task.provenance) {
    errors.push('REVIEW_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a knowledge review trigger for decision composition.
 * Pure function. No side effects.
 */
function _validateTriggerForDecision(
  trigger: KnowledgeReviewTrigger,
): readonly string[] {
  const errors: string[] = [];

  if (!trigger.triggerId || trigger.triggerId.trim() === '') {
    errors.push('REVIEW_MISSING_TRIGGER_ID');
  }

  if (!CANONICAL_REVIEW_TRIGGER_TYPES.includes(trigger.triggerType)) {
    errors.push('REVIEW_INVALID_TRIGGER_TYPE');
  }

  if (!CANONICAL_MAINTENANCE_PRIORITY.includes(trigger.priority)) {
    errors.push('REVIEW_INVALID_PRIORITY');
  }

  if (!trigger.provenance) {
    errors.push('REVIEW_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Review Plan Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with review plan from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithReviewPlan(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly plans: readonly KnowledgeReviewPlan[];
  readonly tasks: readonly KnowledgeMaintenanceTask[];
  readonly triggers: readonly KnowledgeReviewTrigger[];
  readonly provenance: ReviewProvenance;
}): KnowledgeArtifactWithReviewPlan {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    plans: [...params.plans],
    tasks: [...params.tasks],
    triggers: [...params.triggers],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported review trigger type.
 */
export function isSupportedReviewTrigger(
  triggerType: string,
): triggerType is ReviewTriggerType {
  return CANONICAL_REVIEW_TRIGGER_TYPES.includes(triggerType as ReviewTriggerType);
}

/**
 * Checks if a string is a supported maintenance type.
 */
export function isSupportedMaintenanceType(
  maintenanceType: string,
): maintenanceType is MaintenanceType {
  return CANONICAL_MAINTENANCE_TYPES.includes(maintenanceType as MaintenanceType);
}

/**
 * Checks if a string is a supported maintenance priority.
 */
export function isSupportedMaintenancePriority(
  priority: string,
): priority is MaintenancePriority {
  return CANONICAL_MAINTENANCE_PRIORITY.includes(priority as MaintenancePriority);
}

/**
 * Checks if a string is a supported review status.
 */
export function isSupportedReviewStatus(
  status: string,
): status is ReviewStatus {
  return CANONICAL_REVIEW_STATUS.includes(status as ReviewStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedGovernanceStatus(
  governanceStatus: string,
): governanceStatus is KnowledgeGovernanceStatus {
  if (governanceStatus === 'accepted') {
    return true;
  }
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as KnowledgeGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical review trigger types.
 */
export function getCanonicalReviewTriggers(): readonly ReviewTriggerType[] {
  return CANONICAL_REVIEW_TRIGGER_TYPES;
}

/**
 * Returns the canonical maintenance types.
 */
export function getCanonicalMaintenanceTypes(): readonly MaintenanceType[] {
  return CANONICAL_MAINTENANCE_TYPES;
}

/**
 * Returns the canonical maintenance priorities.
 */
export function getCanonicalMaintenancePriorities(): readonly MaintenancePriority[] {
  return CANONICAL_MAINTENANCE_PRIORITY;
}

/**
 * Returns the canonical review statuses.
 */
export function getCanonicalReviewStatuses(): readonly ReviewStatus[] {
  return CANONICAL_REVIEW_STATUS;
}
