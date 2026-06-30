/**
 * NV-2000-D8-OPT-12 — Deterministic Reinforcement Plan Generation Kernel
 *
 * Pure deterministic compose functions for reinforcement plan assessment.
 * The Assessment Agent models reinforcement plan assessments that evaluate
 * a learner's need for reinforcement activities. It stores reinforcement plan
 * assessment metadata, validates reinforcement plan structures, governs reinforcement evidence.
 * It never generates personalized study plans, adapts content to individual learners,
 * tutors users, recommends learning paths, or invokes other agents.
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
  type AssessmentArtifactWithReinforcement,
  type AssessmentGovernanceLevel,
  type ReinforcementActivity,
  type ReinforcementActivityType,
  type ReinforcementInput,
  type ReinforcementObjective,
  type ReinforcementObjectiveType,
  type ReinforcementPlanStatus,
  type ReinforcementPlanType,
  type ReinforcementPriorityType,
  type ReinforcementProvenance,
  type ReinforcementRegistry,
  type ReinforcementRegistryMetadata,
  type ReinforcementRelationship,
  type ReinforcementTrace,
  type AssessmentReinforcementPlan,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  CANONICAL_REINFORCEMENT_ACTIVITY_TYPES,
  CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES,
  CANONICAL_REINFORCEMENT_PLAN_TYPES,
  CANONICAL_REINFORCEMENT_PRIORITY_TYPES,
  CANONICAL_REINFORCEMENT_STATUS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported reinforcement plan type?
 */
export function isSupportedReinforcementPlanType(
  value: string,
): value is ReinforcementPlanType {
  return CANONICAL_REINFORCEMENT_PLAN_TYPES.includes(
    value as ReinforcementPlanType,
  );
}

/**
 * Type guard: is the value a supported reinforcement objective type?
 */
export function isSupportedReinforcementObjective(
  value: string,
): value is ReinforcementObjectiveType {
  return CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES.includes(
    value as ReinforcementObjectiveType,
  );
}

/**
 * Type guard: is the value a supported reinforcement activity type?
 */
export function isSupportedReinforcementActivity(
  value: string,
): value is ReinforcementActivityType {
  return CANONICAL_REINFORCEMENT_ACTIVITY_TYPES.includes(
    value as ReinforcementActivityType,
  );
}

/**
 * Type guard: is the value a supported reinforcement priority type?
 */
export function isSupportedReinforcementPriority(
  value: string,
): value is ReinforcementPriorityType {
  return CANONICAL_REINFORCEMENT_PRIORITY_TYPES.includes(
    value as ReinforcementPriorityType,
  );
}

/**
 * Type guard: is the value a supported reinforcement plan status?
 */
export function isSupportedReinforcementStatus(
  value: string,
): value is ReinforcementPlanStatus {
  return CANONICAL_REINFORCEMENT_STATUS.includes(
    value as ReinforcementPlanStatus,
  );
}

/**
 * Type guard: is the value a supported reinforcement governance level?
 */
export function isSupportedReinforcementGovernance(
  value: string,
): value is AssessmentGovernanceLevel {
  return CANONICAL_ASSESSMENT_GOVERNANCE.includes(
    value as AssessmentGovernanceLevel,
  );
}

/**
 * Returns a copy of canonical reinforcement plan types.
 */
export function getCanonicalReinforcementPlanTypes(): readonly ReinforcementPlanType[] {
  return [...CANONICAL_REINFORCEMENT_PLAN_TYPES];
}

/**
 * Returns a copy of canonical reinforcement objective types.
 */
export function getCanonicalReinforcementObjectives(): readonly ReinforcementObjectiveType[] {
  return [...CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES];
}

/**
 * Returns a copy of canonical reinforcement activity types.
 */
export function getCanonicalReinforcementActivities(): readonly ReinforcementActivityType[] {
  return [...CANONICAL_REINFORCEMENT_ACTIVITY_TYPES];
}

/**
 * Returns a copy of canonical reinforcement priority types.
 */
export function getCanonicalReinforcementPriorities(): readonly ReinforcementPriorityType[] {
  return [...CANONICAL_REINFORCEMENT_PRIORITY_TYPES];
}

/**
 * Returns a copy of canonical reinforcement plan statuses.
 */
export function getCanonicalReinforcementStatuses(): readonly ReinforcementPlanStatus[] {
  return [...CANONICAL_REINFORCEMENT_STATUS];
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
 * Compose an immutable ReinforcementProvenance.
 */
export function composeReinforcementProvenance(params: {
  readonly provider: string;
  readonly source: string;
  readonly reviewStatus: ReinforcementPlanStatus;
  readonly reviewDate: string;
  readonly version: string;
  readonly rationale: string;
}): ReinforcementProvenance {
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
 * Compose an immutable ReinforcementTrace.
 */
export function composeReinforcementTrace(params: {
  readonly traceId: string;
}): ReinforcementTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_reinforcement_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ReinforcementObjective.
 */
export function composeReinforcementObjective(params: {
  readonly id: string;
  readonly objectiveType: ReinforcementObjectiveType;
  readonly description: string;
}): ReinforcementObjective {
  return {
    id: params.id,
    objectiveType: params.objectiveType,
    description: params.description,
  };
}

/**
 * Compose an immutable ReinforcementActivity.
 */
export function composeReinforcementActivity(params: {
  readonly id: string;
  readonly activityType: ReinforcementActivityType;
  readonly description: string;
  readonly duration: string;
}): ReinforcementActivity {
  return {
    id: params.id,
    activityType: params.activityType,
    description: params.description,
    duration: params.duration,
  };
}

/**
 * Compose an immutable ReinforcementRelationship.
 */
export function composeReinforcementRelationship(params: {
  readonly id: string;
  readonly sourcePlanId: string;
  readonly targetPlanId: string;
  readonly relationshipType: string;
  readonly rationale: string;
}): ReinforcementRelationship {
  return {
    id: params.id,
    sourcePlanId: params.sourcePlanId,
    targetPlanId: params.targetPlanId,
    relationshipType: params.relationshipType,
    rationale: params.rationale,
  };
}

/**
 * Compose an immutable AssessmentReinforcementPlan.
 */
export function composeAssessmentReinforcementPlan(params: {
  readonly id: string;
  readonly title: string;
  readonly planType: ReinforcementPlanType;
  readonly objectives: readonly ReinforcementObjective[];
  readonly activities: readonly ReinforcementActivity[];
  readonly priority: ReinforcementPriorityType;
  readonly conceptIds: readonly string[];
  readonly status: ReinforcementPlanStatus;
  readonly governance: AssessmentGovernanceLevel;
  readonly provenance: ReinforcementProvenance;
}): AssessmentReinforcementPlan {
  const traceId = _deterministicId('reinforcement', [params.id]);
  const trace = composeReinforcementTrace({ traceId });

  return {
    id: params.id,
    title: params.title,
    planType: params.planType,
    objectives: [...params.objectives],
    activities: [...params.activities],
    priority: params.priority,
    conceptIds: [...params.conceptIds],
    status: params.status,
    governance: params.governance,
    provenance: params.provenance,
    trace,
  };
}

/**
 * Compose immutable ReinforcementRegistryMetadata.
 */
export function _composeReinforcementRegistryMetadata(
  nodes: readonly AssessmentReinforcementPlan[],
): ReinforcementRegistryMetadata {
  const sortedIds = [...nodes].map((n) => n.id).sort();
  const registryId = _deterministicId('reinforcement-registry', sortedIds);

  return {
    registryId,
    version: '1.0.0',
    nodeCount: nodes.length,
    generatedFrom: 'deterministic_reinforcement_kernel',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose an immutable ReinforcementRegistry from pre-composed nodes.
 */
export function composeReinforcementRegistry(
  nodes: readonly AssessmentReinforcementPlan[],
): ReinforcementRegistry {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const metadata = _composeReinforcementRegistryMetadata(sortedNodes);

  return {
    metadata,
    nodes: sortedNodes,
  };
}

/**
 * Compose an immutable ReinforcementRegistry from input.
 */
export function composeReinforcementRegistryFromInput(
  input: ReinforcementInput,
): ReinforcementRegistry {
  return composeReinforcementRegistry(input.nodes);
}

/**
 * Compose reinforcement plan assessments into a registry.
 */
export function composeAssessmentReinforcementPlans(params: {
  readonly plans: readonly AssessmentReinforcementPlan[];
}): ReinforcementRegistry {
  return composeReinforcementRegistry(params.plans);
}

/**
 * Compose an assessment artifact enriched with reinforcement plans.
 */
export function composeAssessmentArtifactWithReinforcement(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly reinforcementPlans: readonly AssessmentReinforcementPlan[];
}): AssessmentArtifactWithReinforcement {
  return {
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    reinforcementPlans: [...params.reinforcementPlans],
  };
}
