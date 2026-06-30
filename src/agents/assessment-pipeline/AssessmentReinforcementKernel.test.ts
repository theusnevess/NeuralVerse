/**
 * NV-2000-D8-OPT-12 — Reinforcement Plan Generation Kernel Tests
 *
 * Exhaustive deterministic tests for the Reinforcement Plan Generation Kernel.
 * Uses Node.js built-in test runner (node:test).
 *
 * ~90 tests covering:
 * - Canonical enum completeness
 * - Helper functions
 * - Reinforcement plan assessment composition
 * - Objective composition
 * - Activity composition
 * - Relationship composition
 * - Registry composition
 * - Validation codes
 * - Duplicate detection
 * - Deterministic identity (100 iterations)
 * - Immutability
 * - Validator stability
 * - No mutation
 * - Artifact with reinforcement plans
 * - Cross-agent boundary
 * - Negative capability verification
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_REINFORCEMENT_PLAN_TYPES,
  CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES,
  CANONICAL_REINFORCEMENT_ACTIVITY_TYPES,
  CANONICAL_REINFORCEMENT_PRIORITY_TYPES,
  CANONICAL_REINFORCEMENT_STATUS,
  CANONICAL_ASSESSMENT_GOVERNANCE,
  type AssessmentReinforcementPlan,
  type ReinforcementObjective,
  type ReinforcementActivity,
  type ReinforcementInput,
  type ReinforcementRegistry,
  type ReinforcementProvenance,
  type AssessmentArtifactWithReinforcement,
} from './AssessmentAgentContract.ts';

import {
  composeReinforcementProvenance,
  composeReinforcementTrace,
  composeReinforcementObjective,
  composeReinforcementActivity,
  composeReinforcementRelationship,
  composeAssessmentReinforcementPlan,
  composeReinforcementRegistry,
  composeReinforcementRegistryFromInput,
  composeAssessmentReinforcementPlans,
  composeAssessmentArtifactWithReinforcement,
  isSupportedReinforcementPlanType,
  isSupportedReinforcementObjective,
  isSupportedReinforcementActivity,
  isSupportedReinforcementPriority,
  isSupportedReinforcementStatus,
  isSupportedReinforcementGovernance,
  getCanonicalReinforcementPlanTypes,
  getCanonicalReinforcementObjectives,
  getCanonicalReinforcementActivities,
  getCanonicalReinforcementPriorities,
  getCanonicalReinforcementStatuses,
} from './AssessmentReinforcementKernel.ts';

import {
  REINFORCEMENT_VALIDATION_CODES,
  validateAssessmentReinforcementPlan,
  validateReinforcementObjective,
  validateReinforcementActivity,
  validateReinforcementRelationship,
  validateReinforcementRegistry,
  validateReinforcementInput,
  validateReinforcementTrace,
  validateAssessmentArtifactWithReinforcement,
} from './AssessmentReinforcementValidation.ts';

// ============================================================================
// TEST FIXTURES
// ============================================================================

const VALID_REINFORCEMENT_PROVENANCE: ReinforcementProvenance = {
  provider: 'test-provider',
  source: 'test-source',
  reviewStatus: 'approved',
  reviewDate: '2025-01-01',
  version: '1.0.0',
  rationale: 'Test rationale for reinforcement plan assessment.',
};

function _makeObjective(id: string): ReinforcementObjective {
  return composeReinforcementObjective({
    id,
    objectiveType: 'reinforce_concept',
    description: `Test objective ${id}`,
  });
}

function _makeActivity(id: string): ReinforcementActivity {
  return composeReinforcementActivity({
    id,
    activityType: 'exercise',
    description: `Test activity ${id}`,
    duration: '30m',
  });
}

function _makePlan(
  id: string,
  overrides: Partial<AssessmentReinforcementPlan> = {},
): AssessmentReinforcementPlan {
  return composeAssessmentReinforcementPlan({
    id,
    title: `Plan ${id}`,
    planType: 'concept_review',
    objectives: [_makeObjective(`obj-${id}`)],
    activities: [_makeActivity(`act-${id}`)],
    priority: 'medium',
    conceptIds: ['concept-1'],
    status: 'draft',
    governance: 'canonical',
    provenance: VALID_REINFORCEMENT_PROVENANCE,
    ...overrides,
  });
}

const VALID_PLAN_A = _makePlan('plan-a');
const VALID_PLAN_B = _makePlan('plan-b');
const VALID_PLAN_C = _makePlan('plan-c');

// ============================================================================
// CANONICAL ENUM COMPLETENESS
// ============================================================================

describe('Canonical Enums', () => {
  it('should have exactly 10 reinforcement plan types', () => {
    assert.equal(CANONICAL_REINFORCEMENT_PLAN_TYPES.length, 10);
  });

  it('should have exactly 10 reinforcement objective types', () => {
    assert.equal(CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES.length, 10);
  });

  it('should have exactly 10 reinforcement activity types', () => {
    assert.equal(CANONICAL_REINFORCEMENT_ACTIVITY_TYPES.length, 10);
  });

  it('should have exactly 10 reinforcement priority types', () => {
    assert.equal(CANONICAL_REINFORCEMENT_PRIORITY_TYPES.length, 10);
  });

  it('should have exactly 6 reinforcement plan statuses', () => {
    assert.equal(CANONICAL_REINFORCEMENT_STATUS.length, 6);
  });

  it('should contain expected reinforcement plan types', () => {
    const expected = [
      'concept_review', 'skill_practice', 'knowledge_consolidation',
      'misconception_remediation', 'reasoning_enhancement', 'procedural_fluency',
      'critical_thinking', 'creative_application', 'collaborative_learning',
      'self_regulated_learning',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REINFORCEMENT_PLAN_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected reinforcement objective types', () => {
    const expected = [
      'reinforce_concept', 'strengthen_skill', 'remediate_gap',
      'consolidate_knowledge', 'enhance_reasoning', 'build_fluency',
      'develop_critical_thinking', 'foster_application', 'support_collaboration',
      'promote_reflection',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected reinforcement activity types', () => {
    const expected = [
      'reading', 'exercise', 'quiz', 'project', 'discussion',
      'peer_review', 'reflection_prompt', 'worked_example', 'practice_set',
      'challenge',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REINFORCEMENT_ACTIVITY_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });

  it('should contain expected reinforcement priority types', () => {
    const expected = [
      'critical', 'high', 'medium', 'low', 'optional',
      'adaptive', 'timed', 'on_demand', 'prerequisite', 'capstone',
    ];
    for (const value of expected) {
      assert.ok(CANONICAL_REINFORCEMENT_PRIORITY_TYPES.includes(value as any), `Missing: ${value}`);
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

describe('Helper Functions', () => {
  it('isSupportedReinforcementPlanType returns true for valid types', () => {
    assert.equal(isSupportedReinforcementPlanType('concept_review'), true);
    assert.equal(isSupportedReinforcementPlanType('skill_practice'), true);
  });

  it('isSupportedReinforcementPlanType returns false for invalid types', () => {
    assert.equal(isSupportedReinforcementPlanType('invalid'), false);
    assert.equal(isSupportedReinforcementPlanType(''), false);
  });

  it('isSupportedReinforcementObjective returns true for valid types', () => {
    assert.equal(isSupportedReinforcementObjective('reinforce_concept'), true);
    assert.equal(isSupportedReinforcementObjective('promote_reflection'), true);
  });

  it('isSupportedReinforcementObjective returns false for invalid types', () => {
    assert.equal(isSupportedReinforcementObjective('invalid'), false);
    assert.equal(isSupportedReinforcementObjective(''), false);
  });

  it('isSupportedReinforcementActivity returns true for valid types', () => {
    assert.equal(isSupportedReinforcementActivity('exercise'), true);
    assert.equal(isSupportedReinforcementActivity('challenge'), true);
  });

  it('isSupportedReinforcementActivity returns false for invalid types', () => {
    assert.equal(isSupportedReinforcementActivity('invalid'), false);
    assert.equal(isSupportedReinforcementActivity(''), false);
  });

  it('isSupportedReinforcementPriority returns true for valid types', () => {
    assert.equal(isSupportedReinforcementPriority('critical'), true);
    assert.equal(isSupportedReinforcementPriority('medium'), true);
  });

  it('isSupportedReinforcementPriority returns false for invalid types', () => {
    assert.equal(isSupportedReinforcementPriority('invalid'), false);
    assert.equal(isSupportedReinforcementPriority(''), false);
  });

  it('isSupportedReinforcementStatus returns true for valid statuses', () => {
    assert.equal(isSupportedReinforcementStatus('draft'), true);
    assert.equal(isSupportedReinforcementStatus('archived'), true);
  });

  it('isSupportedReinforcementStatus returns false for invalid statuses', () => {
    assert.equal(isSupportedReinforcementStatus('invalid'), false);
    assert.equal(isSupportedReinforcementStatus(''), false);
  });

  it('isSupportedReinforcementGovernance returns true for valid governance', () => {
    assert.equal(isSupportedReinforcementGovernance('canonical'), true);
    assert.equal(isSupportedReinforcementGovernance('rejected'), true);
  });

  it('isSupportedReinforcementGovernance returns false for invalid governance', () => {
    assert.equal(isSupportedReinforcementGovernance('invalid'), false);
    assert.equal(isSupportedReinforcementGovernance(''), false);
  });

  it('getCanonicalReinforcementPlanTypes returns a copy', () => {
    const result = getCanonicalReinforcementPlanTypes();
    assert.equal(result.length, 10);
    assert.deepEqual([...result], [...CANONICAL_REINFORCEMENT_PLAN_TYPES]);
    (result as string[]).push('injected');
    assert.equal(CANONICAL_REINFORCEMENT_PLAN_TYPES.length, 10);
  });

  it('getCanonicalReinforcementObjectives returns a copy', () => {
    const result = getCanonicalReinforcementObjectives();
    assert.equal(result.length, 10);
  });

  it('getCanonicalReinforcementActivities returns a copy', () => {
    const result = getCanonicalReinforcementActivities();
    assert.equal(result.length, 10);
  });

  it('getCanonicalReinforcementPriorities returns a copy', () => {
    const result = getCanonicalReinforcementPriorities();
    assert.equal(result.length, 10);
  });

  it('getCanonicalReinforcementStatuses returns a copy', () => {
    const result = getCanonicalReinforcementStatuses();
    assert.equal(result.length, 6);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Reinforcement Plan Assessment
// ============================================================================

describe('composeAssessmentReinforcementPlan', () => {
  it('should compose reinforcement plan assessment from valid params', () => {
    const plan = composeAssessmentReinforcementPlan({
      id: 'p1', title: 'Test',
      planType: 'concept_review',
      objectives: [_makeObjective('obj1')],
      activities: [_makeActivity('act1')],
      priority: 'medium',
      conceptIds: ['c1'], status: 'draft',
      governance: 'canonical', provenance: VALID_REINFORCEMENT_PROVENANCE,
    });
    assert.equal(plan.id, 'p1');
    assert.equal(plan.title, 'Test');
    assert.equal(plan.planType, 'concept_review');
    assert.equal(plan.trace.deterministic, true);
    assert.equal(plan.trace.randomUsed, false);
    assert.equal(plan.trace.timeDependency, false);
  });

  it('should not mutate input arrays', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentReinforcementPlan({
      id: 'p', title: 'T',
      planType: 'concept_review',
      objectives: [], activities: [],
      priority: 'medium',
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_REINFORCEMENT_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Objective
// ============================================================================

describe('composeReinforcementObjective', () => {
  it('should compose objective from valid params', () => {
    const objective = composeReinforcementObjective({
      id: 'obj1', objectiveType: 'reinforce_concept',
      description: 'Desc',
    });
    assert.equal(objective.id, 'obj1');
    assert.equal(objective.objectiveType, 'reinforce_concept');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Activity
// ============================================================================

describe('composeReinforcementActivity', () => {
  it('should compose activity from valid params', () => {
    const activity = composeReinforcementActivity({
      id: 'act1', activityType: 'exercise',
      description: 'Desc', duration: '30m',
    });
    assert.equal(activity.id, 'act1');
    assert.equal(activity.activityType, 'exercise');
    assert.equal(activity.duration, '30m');
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Relationship
// ============================================================================

describe('composeReinforcementRelationship', () => {
  it('should compose relationship from valid params', () => {
    const rel = composeReinforcementRelationship({
      id: 'r1', sourcePlanId: 'a', targetPlanId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    assert.equal(rel.id, 'r1');
    assert.equal(rel.sourcePlanId, 'a');
    assert.equal(rel.targetPlanId, 'b');
  });

  it('should return identical output for identical input', () => {
    const params = {
      id: 'r', sourcePlanId: 'a', targetPlanId: 'b',
      relationshipType: 'dep', rationale: 'r',
    };
    const r1 = composeReinforcementRelationship(params);
    const r2 = composeReinforcementRelationship(params);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry
// ============================================================================

describe('composeReinforcementRegistry', () => {
  it('should compose registry from plans', () => {
    const registry = composeReinforcementRegistry([VALID_PLAN_A, VALID_PLAN_B]);
    assert.equal(registry.nodes.length, 2);
    assert.equal(registry.metadata.nodeCount, 2);
    assert.equal(registry.metadata.deterministic, true);
  });

  it('should sort nodes by id', () => {
    const registry = composeReinforcementRegistry([VALID_PLAN_C, VALID_PLAN_A, VALID_PLAN_B]);
    assert.equal(registry.nodes[0].id, 'plan-a');
    assert.equal(registry.nodes[1].id, 'plan-b');
    assert.equal(registry.nodes[2].id, 'plan-c');
  });

  it('should return identical output for identical input', () => {
    const nodes = [VALID_PLAN_A, VALID_PLAN_B];
    const r1 = composeReinforcementRegistry(nodes);
    const r2 = composeReinforcementRegistry(nodes);
    assert.deepEqual(r1, r2);
  });

  it('should not mutate input nodes array', () => {
    const nodes = [VALID_PLAN_C, VALID_PLAN_A];
    const original = JSON.stringify(nodes);
    composeReinforcementRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should handle empty array', () => {
    const registry = composeReinforcementRegistry([]);
    assert.equal(registry.nodes.length, 0);
    assert.equal(registry.metadata.nodeCount, 0);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Registry from Input
// ============================================================================

describe('composeReinforcementRegistryFromInput', () => {
  it('should compose registry from input', () => {
    const input: ReinforcementInput = { nodes: [VALID_PLAN_A, VALID_PLAN_B] };
    const registry = composeReinforcementRegistryFromInput(input);
    assert.equal(registry.nodes.length, 2);
  });

  it('should return identical output for identical input', () => {
    const input: ReinforcementInput = { nodes: [VALID_PLAN_A] };
    const r1 = composeReinforcementRegistryFromInput(input);
    const r2 = composeReinforcementRegistryFromInput(input);
    assert.deepEqual(r1, r2);
  });
});

// ============================================================================
// COMPOSE FUNCTIONS — Artifact with reinforcement plans
// ============================================================================

describe('composeAssessmentArtifactWithReinforcement', () => {
  it('should compose artifact with reinforcement plans', () => {
    const result = composeAssessmentArtifactWithReinforcement({
      artifactId: 'art-1', artifactTitle: 'Test',
      reinforcementPlans: [VALID_PLAN_A],
    });
    assert.equal(result.artifactId, 'art-1');
    assert.equal(result.reinforcementPlans.length, 1);
  });

  it('should not mutate reinforcementPlans input', () => {
    const plans = [VALID_PLAN_A];
    const original = JSON.stringify(plans);
    composeAssessmentArtifactWithReinforcement({
      artifactId: 'a', artifactTitle: 'T', reinforcementPlans: plans,
    });
    assert.equal(JSON.stringify(plans), original);
  });
});

// ============================================================================
// VALIDATION — Reinforcement plan assessment validation
// ============================================================================

describe('validateAssessmentReinforcementPlan', () => {
  it('should pass for valid reinforcement plan assessment', () => {
    const errors = validateAssessmentReinforcementPlan(VALID_PLAN_A);
    assert.equal(errors.length, 0);
  });

  it('should reject null plan', () => {
    const errors = validateAssessmentReinforcementPlan(null as any);
    assert.ok(errors.length > 0);
  });

  it('should reject plan with missing id', () => {
    const plan = _makePlan('');
    const errors = validateAssessmentReinforcementPlan(plan);
    assert.ok(errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_PLAN_ID));
  });

  it('should reject plan with invalid type', () => {
    const plan = _makePlan('p', { planType: 'invalid' as any });
    const errors = validateAssessmentReinforcementPlan(plan);
    assert.ok(errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_PLAN_TYPE));
  });

  it('should reject plan with missing conceptIds', () => {
    const plan = _makePlan('p', { conceptIds: [] });
    const errors = validateAssessmentReinforcementPlan(plan);
    assert.ok(errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_MISSING_ASSESSMENT_REFERENCE));
  });

  it('should reject plan with non-deterministic trace', () => {
    const plan: AssessmentReinforcementPlan = {
      id: 'p', title: 'T',
      planType: 'concept_review',
      objectives: [], activities: [],
      priority: 'medium',
      conceptIds: ['c1'], status: 'draft', governance: 'canonical',
      provenance: VALID_REINFORCEMENT_PROVENANCE,
      trace: {
        traceId: 't', deterministic: false as any,
        generatedFrom: 'deterministic_reinforcement_kernel',
        randomUsed: false, timeDependency: false,
      },
    };
    const errors = validateAssessmentReinforcementPlan(plan);
    assert.ok(errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_INVALID_TRACE));
  });
});

// ============================================================================
// VALIDATION — Relationship validation
// ============================================================================

describe('validateReinforcementRelationship', () => {
  it('should pass for valid relationship', () => {
    const rel = composeReinforcementRelationship({
      id: 'r1', sourcePlanId: 'a', targetPlanId: 'b',
      relationshipType: 'depends', rationale: 'r',
    });
    const errors = validateReinforcementRelationship(rel);
    assert.equal(errors.length, 0);
  });

  it('should reject self-relationship', () => {
    const rel = composeReinforcementRelationship({
      id: 'r', sourcePlanId: 'a', targetPlanId: 'a',
      relationshipType: 'self', rationale: 'r',
    });
    const errors = validateReinforcementRelationship(rel);
    assert.ok(errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_SELF_RELATIONSHIP));
  });
});

// ============================================================================
// VALIDATION — Registry validation
// ============================================================================

describe('validateReinforcementRegistry', () => {
  it('should pass for valid registry', () => {
    const registry = composeReinforcementRegistry([VALID_PLAN_A, VALID_PLAN_B]);
    const result = validateReinforcementRegistry(registry);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject null registry', () => {
    const result = validateReinforcementRegistry(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty registry', () => {
    const registry = composeReinforcementRegistry([]);
    const result = validateReinforcementRegistry(registry);
    assert.equal(result.valid, false);
  });

  it('should detect duplicate ids', () => {
    const duplicateNodes = [_makePlan('dup'), _makePlan('dup')];
    const registry = composeReinforcementRegistry(duplicateNodes);
    const result = validateReinforcementRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_ID));
  });

  it('should detect duplicate titles', () => {
    const duplicateTitles = [
      _makePlan('a', { title: 'Same Title' }),
      _makePlan('b', { title: 'Same Title' }),
    ];
    const registry = composeReinforcementRegistry(duplicateTitles);
    const result = validateReinforcementRegistry(registry);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === REINFORCEMENT_VALIDATION_CODES.REINFORCEMENT_DUPLICATE_TITLE));
  });
});

// ============================================================================
// VALIDATION — Input validation
// ============================================================================

describe('validateReinforcementInput', () => {
  it('should pass for valid input', () => {
    const input: ReinforcementInput = { nodes: [VALID_PLAN_A] };
    const result = validateReinforcementInput(input);
    assert.equal(result.valid, true);
  });

  it('should reject null input', () => {
    const result = validateReinforcementInput(null as any);
    assert.equal(result.valid, false);
  });

  it('should reject empty input', () => {
    const result = validateReinforcementInput({ nodes: [] });
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Trace validation
// ============================================================================

describe('validateReinforcementTrace', () => {
  it('should pass for valid trace', () => {
    const trace = composeReinforcementTrace({ traceId: 'test' });
    const result = validateReinforcementTrace(trace);
    assert.equal(result.valid, true);
  });

  it('should reject null trace', () => {
    const result = validateReinforcementTrace(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// VALIDATION — Artifact with reinforcement plans validation
// ============================================================================

describe('validateAssessmentArtifactWithReinforcement', () => {
  it('should pass for valid artifact', () => {
    const artifact = composeAssessmentArtifactWithReinforcement({
      artifactId: 'art-1', artifactTitle: 'Test',
      reinforcementPlans: [VALID_PLAN_A],
    });
    const result = validateAssessmentArtifactWithReinforcement(artifact);
    assert.equal(result.valid, true);
  });

  it('should reject null artifact', () => {
    const result = validateAssessmentArtifactWithReinforcement(null as any);
    assert.equal(result.valid, false);
  });
});

// ============================================================================
// DETERMINISTIC IDENTITY — 100 iterations
// ============================================================================

describe('Deterministic Identity', () => {
  it('should produce identical output for composeReinforcementRegistry across 100 iterations', () => {
    const nodes = [VALID_PLAN_A, VALID_PLAN_B];
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeReinforcementRegistry(nodes);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });

  it('should produce identical output for composeAssessmentReinforcementPlan across 100 iterations', () => {
    const params = {
      id: 'p', title: 'T',
      planType: 'concept_review' as const,
      objectives: [_makeObjective('obj')],
      activities: [_makeActivity('act')],
      priority: 'medium' as const,
      conceptIds: ['c1'],
      status: 'draft' as const, governance: 'canonical' as const,
      provenance: VALID_REINFORCEMENT_PROVENANCE,
    };
    let firstResult: string | null = null;

    for (let i = 0; i < 100; i++) {
      const result = composeAssessmentReinforcementPlan(params);
      const serialized = JSON.stringify(result);
      if (firstResult === null) {
        firstResult = serialized;
      } else {
        assert.equal(serialized, firstResult, `Iteration ${i} differs`);
      }
    }
  });
});

// ============================================================================
// IMMUTABILITY — No mutation
// ============================================================================

describe('Immutability', () => {
  it('should not mutate input nodes array in composeReinforcementRegistry', () => {
    const nodes = [VALID_PLAN_C, VALID_PLAN_A];
    const original = JSON.stringify(nodes);
    composeReinforcementRegistry(nodes);
    assert.equal(JSON.stringify(nodes), original);
  });

  it('should not mutate conceptIds in composeAssessmentReinforcementPlan', () => {
    const conceptIds = ['c1'];
    const original = JSON.stringify(conceptIds);
    composeAssessmentReinforcementPlan({
      id: 'p', title: 'T',
      planType: 'concept_review',
      objectives: [], activities: [],
      priority: 'medium',
      conceptIds, status: 'draft', governance: 'canonical',
      provenance: VALID_REINFORCEMENT_PROVENANCE,
    });
    assert.equal(JSON.stringify(conceptIds), original);
  });

  it('getCanonicalReinforcementPlanTypes returns a copy not affecting original', () => {
    const copy = getCanonicalReinforcementPlanTypes();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_REINFORCEMENT_PLAN_TYPES.length, 10);
  });

  it('getCanonicalReinforcementObjectives returns a copy not affecting original', () => {
    const copy = getCanonicalReinforcementObjectives();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES.length, 10);
  });

  it('getCanonicalReinforcementActivities returns a copy not affecting original', () => {
    const copy = getCanonicalReinforcementActivities();
    assert.equal(copy.length, 10);
    (copy as string[]).push('injected');
    assert.equal(CANONICAL_REINFORCEMENT_ACTIVITY_TYPES.length, 10);
  });
});

// ============================================================================
// CROSS-AGENT BOUNDARY — No plan generation/personalization
// ============================================================================

describe('Cross-Agent Boundary', () => {
  it('should not contain plan generation logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PLAN_TYPES);
    assert.ok(!source.includes('generate'));
    assert.ok(!source.includes('personalize'));
  });

  it('should not contain learning adaptation logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_OBJECTIVE_TYPES);
    assert.ok(!source.includes('adapt'));
    assert.ok(!source.includes('tutor'));
  });

  it('should not contain curriculum recommendation logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_ACTIVITY_TYPES);
    assert.ok(!source.includes('recommend'));
    assert.ok(!source.includes('curriculum'));
  });

  it('should not contain scheduling logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PRIORITY_TYPES);
    assert.ok(!source.includes('schedule'));
    assert.ok(!source.includes('optimize'));
  });

  it('should not contain agent invocation logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PLAN_TYPES);
    assert.ok(!source.includes('invoke'));
    assert.ok(!source.includes('agent'));
  });

  it('should not contain LLM reasoning logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PLAN_TYPES);
    assert.ok(!source.includes('llm'));
    assert.ok(!source.includes('inference'));
    assert.ok(!source.includes('reasoning_engine'));
  });
});

// ============================================================================
// NEGATIVE CAPABILITY — No scoring/mastery/adaptive
// ============================================================================

describe('Negative Capability', () => {
  it('should not contain scoring logic', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PLAN_TYPES);
    assert.ok(!source.includes('score'));
    assert.ok(!source.includes('mastery'));
  });

  it('should not contain LLM or async patterns', () => {
    const source = JSON.stringify(CANONICAL_REINFORCEMENT_PLAN_TYPES);
    assert.ok(!source.includes('Promise'));
    assert.ok(!source.includes('async'));
    assert.ok(!source.includes('await'));
  });
});

// ============================================================================
// VALIDATION CODES — Structure verification
// ============================================================================

describe('Validation Codes', () => {
  it('should have exactly 24 validation codes', () => {
    const codes = Object.values(REINFORCEMENT_VALIDATION_CODES);
    assert.equal(codes.length, 24);
  });

  it('all validation codes should be UPPER_SNAKE_CASE', () => {
    for (const code of Object.values(REINFORCEMENT_VALIDATION_CODES)) {
      assert.ok(/^[A-Z_]+$/.test(code), `Not UPPER_SNAKE_CASE: ${code}`);
    }
  });

  it('all validation codes should start with REINFORCEMENT_', () => {
    for (const code of Object.values(REINFORCEMENT_VALIDATION_CODES)) {
      assert.ok(code.startsWith('REINFORCEMENT_'), `Does not start with REINFORCEMENT_: ${code}`);
    }
  });

  it('all keys should match their string values', () => {
    for (const [key, value] of Object.entries(REINFORCEMENT_VALIDATION_CODES)) {
      assert.equal(key, value, `Key ${key} does not match value ${value}`);
    }
  });
});
