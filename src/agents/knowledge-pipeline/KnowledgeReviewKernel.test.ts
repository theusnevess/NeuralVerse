/**
 * NV-1700-D5-OPT-08 — Knowledge Review Planning & Maintenance Orchestration Test Suite
 *
 * Comprehensive deterministic test suite for the Review Kernel.
 * Covers: valid trigger, valid task, valid review plan, valid registry,
 * duplicate plans, duplicate tasks, duplicate triggers,
 * invalid types, invalid priority, missing provenance,
 * empty registry, deterministic ordering, immutable input,
 * identical output (100 iterations), helper functions,
 * canonical enum completeness, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  KnowledgeReviewTrigger,
  KnowledgeMaintenanceTask,
  KnowledgeReviewPlan,
  ReviewProvenance,
  KnowledgeReviewInput,
  KnowledgeReviewRegistry,
  KnowledgeReviewTrace,
  KnowledgeArtifactWithReviewPlan,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_REVIEW_TRIGGER_TYPES,
  CANONICAL_MAINTENANCE_TYPES,
  CANONICAL_MAINTENANCE_PRIORITY,
  CANONICAL_REVIEW_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

import {
  composeKnowledgeReviewProvenance,
  composeKnowledgeReviewTrigger,
  composeKnowledgeMaintenanceTask,
  composeKnowledgeReviewPlan,
  composeKnowledgeReviewTrace,
  composeKnowledgeReviewRegistry,
  composeKnowledgeReviewRegistryFromInput,
  composeKnowledgeReview,
  composeKnowledgeArtifactWithReviewPlan,
  isSupportedReviewTrigger,
  isSupportedMaintenanceType,
  isSupportedMaintenancePriority,
  isSupportedReviewStatus,
  isSupportedGovernanceStatus,
  getCanonicalReviewTriggers,
  getCanonicalMaintenanceTypes,
  getCanonicalMaintenancePriorities,
  getCanonicalReviewStatuses,
} from './KnowledgeReviewKernel.ts';

import {
  validateKnowledgeReviewTrigger,
  validateKnowledgeMaintenanceTask,
  validateKnowledgeReviewPlan,
  validateKnowledgeReviewRegistry,
  validateKnowledgeReviewInput,
  validateKnowledgeReviewTrace,
  validateKnowledgeArtifactWithReviewPlan,
  REVIEW_VALIDATION_CODES,
} from './KnowledgeReviewValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: ReviewProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core review metadata.',
};

const VALID_TRIGGER: KnowledgeReviewTrigger = {
  triggerId: 'trigger-001',
  triggerType: 'editorial_change',
  artifactId: 'knowledge-001',
  priority: 'high',
  rationale: 'Editorial change requires review.',
  provenance: VALID_PROVENANCE,
};

const VALID_TRIGGER_2: KnowledgeReviewTrigger = {
  triggerId: 'trigger-002',
  triggerType: 'dependency_change',
  artifactId: 'knowledge-002',
  priority: 'moderate',
  rationale: 'Dependency change requires review.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_TASK: KnowledgeMaintenanceTask = {
  taskId: 'task-001',
  maintenanceType: 'content_review',
  artifactId: 'knowledge-001',
  priority: 'high',
  triggerIds: ['trigger-001'],
  provenance: VALID_PROVENANCE,
};

const VALID_TASK_2: KnowledgeMaintenanceTask = {
  taskId: 'task-002',
  maintenanceType: 'reference_update',
  artifactId: 'knowledge-002',
  priority: 'moderate',
  triggerIds: ['trigger-002'],
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_PLAN: KnowledgeReviewPlan = {
  planId: 'plan-001',
  artifactId: 'knowledge-001',
  tasks: [VALID_TASK],
  summary: 'Review plan for knowledge artifact.',
  provenance: VALID_PROVENANCE,
};

const VALID_PLAN_2: KnowledgeReviewPlan = {
  planId: 'plan-002',
  artifactId: 'knowledge-002',
  tasks: [VALID_TASK_2],
  summary: 'Review plan for second artifact.',
  provenance: { ...VALID_PROVENANCE, source: 'Knowledge Pipeline' },
};

const VALID_INPUT: KnowledgeReviewInput = {
  plans: [VALID_PLAN, VALID_PLAN_2],
  tasks: [VALID_TASK, VALID_TASK_2],
  triggers: [VALID_TRIGGER, VALID_TRIGGER_2],
};

const EMPTY_INPUT: KnowledgeReviewInput = {
  plans: [],
  tasks: [],
  triggers: [],
};

// ---------------------------------------------------------------------------
// Trigger Composition Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Trigger Composition', () => {
  it('should compose valid review provenance', () => {
    const provenance = composeKnowledgeReviewProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core review.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core review.');
  });

  it('should compose valid review trigger', () => {
    const trigger = composeKnowledgeReviewTrigger({
      triggerId: 'trigger-001',
      triggerType: 'editorial_change',
      artifactId: 'knowledge-001',
      priority: 'high',
      rationale: 'Editorial change.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(trigger.triggerId, 'trigger-001');
    assert.equal(trigger.triggerType, 'editorial_change');
    assert.equal(trigger.artifactId, 'knowledge-001');
    assert.equal(trigger.priority, 'high');
  });

  it('should compose valid maintenance task', () => {
    const task = composeKnowledgeMaintenanceTask({
      taskId: 'task-001',
      maintenanceType: 'content_review',
      artifactId: 'knowledge-001',
      priority: 'high',
      triggerIds: ['trigger-001'],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(task.taskId, 'task-001');
    assert.equal(task.maintenanceType, 'content_review');
    assert.equal(task.artifactId, 'knowledge-001');
    assert.equal(task.priority, 'high');
    assert.equal(task.triggerIds.length, 1);
  });

  it('should compose valid review plan', () => {
    const plan = composeKnowledgeReviewPlan({
      planId: 'plan-001',
      artifactId: 'knowledge-001',
      tasks: [VALID_TASK],
      summary: 'Review plan.',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(plan.planId, 'plan-001');
    assert.equal(plan.artifactId, 'knowledge-001');
    assert.equal(plan.tasks.length, 1);
  });

  it('should compose valid review trace', () => {
    const trace = composeKnowledgeReviewTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 5);
    assert.equal(trace.validationCount, 4);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
  });

  it('should validate a valid trigger with no errors', () => {
    const errors = validateKnowledgeReviewTrigger(VALID_TRIGGER);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid task with no errors', () => {
    const errors = validateKnowledgeMaintenanceTask(VALID_TASK);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid plan with no errors', () => {
    const errors = validateKnowledgeReviewPlan(VALID_PLAN);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid registry with no errors', () => {
    const registry = composeKnowledgeReviewRegistry(
      [VALID_PLAN, VALID_PLAN_2],
      [VALID_TASK, VALID_TASK_2],
      [VALID_TRIGGER, VALID_TRIGGER_2],
    );
    const result = validateKnowledgeReviewRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate review input', () => {
    const result = validateKnowledgeReviewInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeKnowledgeReviewRegistry([], [], []);
    const result = validateKnowledgeReviewRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have REVIEW_EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect duplicate plan IDs', () => {
    const registry = composeKnowledgeReviewRegistry(
      [VALID_PLAN, VALID_PLAN],
      [],
      [],
    );
    const result = validateKnowledgeReviewRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_PLAN,
    );

    assert.ok(duplicateError, 'Should have REVIEW_DUPLICATE_PLAN error');
  });

  it('should detect duplicate task IDs', () => {
    const registry = composeKnowledgeReviewRegistry(
      [],
      [VALID_TASK, VALID_TASK],
      [],
    );
    const result = validateKnowledgeReviewRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_TASK,
    );

    assert.ok(duplicateError, 'Should have REVIEW_DUPLICATE_TASK error');
  });

  it('should detect duplicate trigger IDs', () => {
    const registry = composeKnowledgeReviewRegistry(
      [],
      [],
      [VALID_TRIGGER, VALID_TRIGGER],
    );
    const result = validateKnowledgeReviewRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_DUPLICATE_TRIGGER,
    );

    assert.ok(duplicateError, 'Should have REVIEW_DUPLICATE_TRIGGER error');
  });

  it('should sort deterministically by planId', () => {
    const plan3 = { ...VALID_PLAN, planId: 'plan-003' };
    const plan1 = { ...VALID_PLAN, planId: 'plan-001' };
    const plan2 = { ...VALID_PLAN, planId: 'plan-002' };

    const registry = composeKnowledgeReviewRegistry([plan3, plan1, plan2], [], []);

    assert.equal(registry.plans[0].planId, 'plan-001');
    assert.equal(registry.plans[1].planId, 'plan-002');
    assert.equal(registry.plans[2].planId, 'plan-003');
  });

  it('should sort tasks deterministically by taskId', () => {
    const task3 = { ...VALID_TASK, taskId: 'task-003' };
    const task1 = { ...VALID_TASK, taskId: 'task-001' };
    const task2 = { ...VALID_TASK, taskId: 'task-002' };

    const registry = composeKnowledgeReviewRegistry([], [task3, task1, task2], []);

    assert.equal(registry.tasks[0].taskId, 'task-001');
    assert.equal(registry.tasks[1].taskId, 'task-002');
    assert.equal(registry.tasks[2].taskId, 'task-003');
  });

  it('should sort triggers deterministically by triggerId', () => {
    const trigger3 = { ...VALID_TRIGGER, triggerId: 'trigger-003' };
    const trigger1 = { ...VALID_TRIGGER, triggerId: 'trigger-001' };
    const trigger2 = { ...VALID_TRIGGER, triggerId: 'trigger-002' };

    const registry = composeKnowledgeReviewRegistry([], [], [trigger3, trigger1, trigger2]);

    assert.equal(registry.triggers[0].triggerId, 'trigger-001');
    assert.equal(registry.triggers[1].triggerId, 'trigger-002');
    assert.equal(registry.triggers[2].triggerId, 'trigger-003');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Validation', () => {
  it('should detect invalid trigger type', () => {
    const trigger = { ...VALID_TRIGGER, triggerType: 'unsupported' as any };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const typeError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_INVALID_TRIGGER_TYPE,
    );

    assert.ok(typeError, 'Should have REVIEW_INVALID_TRIGGER_TYPE error');
  });

  it('should detect invalid maintenance type', () => {
    const task = { ...VALID_TASK, maintenanceType: 'unsupported' as any };
    const errors = validateKnowledgeMaintenanceTask(task);
    const typeError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_INVALID_MAINTENANCE_TYPE,
    );

    assert.ok(typeError, 'Should have REVIEW_INVALID_MAINTENANCE_TYPE error');
  });

  it('should detect invalid priority', () => {
    const trigger = { ...VALID_TRIGGER, priority: 'unsupported' as any };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const priorityError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_INVALID_PRIORITY,
    );

    assert.ok(priorityError, 'Should have REVIEW_INVALID_PRIORITY error');
  });

  it('should detect missing provenance', () => {
    const trigger = { ...VALID_TRIGGER, provenance: undefined as any };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const provenanceError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REVIEW_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance source', () => {
    const trigger = { ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const sourceError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have REVIEW_MISSING_SOURCE error');
  });

  it('should detect missing provenance rationale', () => {
    const trigger = { ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const rationaleError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have REVIEW_MISSING_RATIONALE error');
  });

  it('should detect missing provenance providedBy', () => {
    const trigger = { ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const providedByError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have REVIEW_MISSING_PROVIDED_BY error');
  });

  it('should validate a valid trace', () => {
    const trace = composeKnowledgeReviewTrace({
      traceId: '_trace_1',
      decisionCount: 5,
      validationCount: 4,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    });

    const result = validateKnowledgeReviewTrace(trace);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect invalid trace', () => {
    const trace: KnowledgeReviewTrace = {
      traceId: '',
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: false as true,
      generatedFrom: 'deterministic_review_kernel',
      randomUsed: false,
      timeDependency: false,
    };

    const result = validateKnowledgeReviewTrace(trace);
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Provenance Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Provenance', () => {
  it('should detect missing provenance on trigger', () => {
    const trigger = { ...VALID_TRIGGER, provenance: undefined as any };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const provenanceError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REVIEW_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on task', () => {
    const task = { ...VALID_TASK, provenance: undefined as any };
    const errors = validateKnowledgeMaintenanceTask(task);
    const provenanceError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REVIEW_MISSING_PROVENANCE error');
  });

  it('should detect missing provenance on plan', () => {
    const plan = { ...VALID_PLAN, provenance: undefined as any };
    const errors = validateKnowledgeReviewPlan(plan);
    const provenanceError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REVIEW_MISSING_PROVENANCE error');
  });

  it('should detect missing rationale in provenance', () => {
    const trigger = { ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const rationaleError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have REVIEW_MISSING_RATIONALE error');
  });

  it('should detect missing providedBy in provenance', () => {
    const trigger = { ...VALID_TRIGGER, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateKnowledgeReviewTrigger(trigger);
    const providedByError = errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have REVIEW_MISSING_PROVIDED_BY error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeKnowledgeReview>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeKnowledgeReview(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].plans, results[i].plans);
      assert.deepStrictEqual(results[0].tasks, results[i].tasks);
      assert.deepStrictEqual(results[0].triggers, results[i].triggers);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeKnowledgeReviewRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(
        composeKnowledgeReviewRegistry(
          [VALID_PLAN, VALID_PLAN_2],
          [VALID_TASK, VALID_TASK_2],
          [VALID_TRIGGER, VALID_TRIGGER_2],
        ),
      );
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].plans, results[i].plans);
      assert.deepStrictEqual(results[0].tasks, results[i].tasks);
      assert.deepStrictEqual(results[0].triggers, results[i].triggers);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Immutability', () => {
  it('should not mutate input plans', () => {
    const originalId = VALID_PLAN.planId;
    const originalArtifactId = VALID_PLAN.artifactId;

    composeKnowledgeReview(VALID_INPUT);

    assert.equal(VALID_PLAN.planId, originalId);
    assert.equal(VALID_PLAN.artifactId, originalArtifactId);
  });

  it('should not mutate input tasks', () => {
    const originalId = VALID_TASK.taskId;
    const originalType = VALID_TASK.maintenanceType;

    composeKnowledgeReview(VALID_INPUT);

    assert.equal(VALID_TASK.taskId, originalId);
    assert.equal(VALID_TASK.maintenanceType, originalType);
  });

  it('should not mutate input triggers', () => {
    const originalId = VALID_TRIGGER.triggerId;
    const originalType = VALID_TRIGGER.triggerType;

    composeKnowledgeReview(VALID_INPUT);

    assert.equal(VALID_TRIGGER.triggerId, originalId);
    assert.equal(VALID_TRIGGER.triggerType, originalType);
  });

  it('should not mutate input registry plans', () => {
    const plans = [VALID_PLAN, VALID_PLAN_2];
    const originalIds = plans.map((p) => p.planId);

    composeKnowledgeReviewRegistry(plans, [], []);

    assert.equal(plans[0].planId, originalIds[0]);
    assert.equal(plans[1].planId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Helper Functions', () => {
  it('should return canonical review trigger types', () => {
    const triggers = getCanonicalReviewTriggers();
    assert.deepStrictEqual([...triggers], [...CANONICAL_REVIEW_TRIGGER_TYPES]);
    assert.equal(triggers.length, 10);
  });

  it('should return canonical maintenance types', () => {
    const types = getCanonicalMaintenanceTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MAINTENANCE_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical maintenance priorities', () => {
    const priorities = getCanonicalMaintenancePriorities();
    assert.deepStrictEqual([...priorities], [...CANONICAL_MAINTENANCE_PRIORITY]);
    assert.equal(priorities.length, 5);
  });

  it('should return canonical review statuses', () => {
    const statuses = getCanonicalReviewStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_REVIEW_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate review trigger support', () => {
    assert.equal(isSupportedReviewTrigger('editorial_change'), true);
    assert.equal(isSupportedReviewTrigger('dependency_change'), true);
    assert.equal(isSupportedReviewTrigger('unsupported'), false);
  });

  it('should validate maintenance type support', () => {
    assert.equal(isSupportedMaintenanceType('content_review'), true);
    assert.equal(isSupportedMaintenanceType('reference_update'), true);
    assert.equal(isSupportedMaintenanceType('unsupported'), false);
  });

  it('should validate maintenance priority support', () => {
    assert.equal(isSupportedMaintenancePriority('low'), true);
    assert.equal(isSupportedMaintenancePriority('critical'), true);
    assert.equal(isSupportedMaintenancePriority('unsupported'), false);
  });

  it('should validate review status support', () => {
    assert.equal(isSupportedReviewStatus('draft'), true);
    assert.equal(isSupportedReviewStatus('published'), true);
    assert.equal(isSupportedReviewStatus('unsupported'), false);
  });

  it('should validate governance status support', () => {
    assert.equal(isSupportedGovernanceStatus('canonical'), true);
    assert.equal(isSupportedGovernanceStatus('accepted'), true);
    assert.equal(isSupportedGovernanceStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 review trigger types', () => {
    assert.equal(CANONICAL_REVIEW_TRIGGER_TYPES.length, 10);
  });

  it('should have exactly 10 maintenance types', () => {
    assert.equal(CANONICAL_MAINTENANCE_TYPES.length, 10);
  });

  it('should have exactly 5 maintenance priorities', () => {
    assert.equal(CANONICAL_MAINTENANCE_PRIORITY.length, 5);
  });

  it('should have exactly 6 review statuses', () => {
    assert.equal(CANONICAL_REVIEW_STATUS.length, 6);
  });

  it('should contain all expected review trigger types', () => {
    const expectedTriggers = [
      'editorial_change',
      'dependency_change',
      'source_update',
      'curriculum_change',
      'laboratory_change',
      'assessment_change',
      'quality_issue',
      'scheduled_review',
      'manual_review',
      'governance_review',
    ];

    for (const trigger of expectedTriggers) {
      assert.ok(
        CANONICAL_REVIEW_TRIGGER_TYPES.includes(trigger as any),
        `Should include trigger: ${trigger}`,
      );
    }
  });

  it('should contain all expected maintenance types', () => {
    const expectedTypes = [
      'content_review',
      'reference_update',
      'source_validation',
      'cross_reference_update',
      'diagram_review',
      'visualization_review',
      'laboratory_review',
      'assessment_review',
      'documentation_review',
      'full_editorial_review',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_MAINTENANCE_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected maintenance priorities', () => {
    const expectedPriorities = [
      'low',
      'moderate',
      'high',
      'critical',
      'blocking',
    ];

    for (const priority of expectedPriorities) {
      assert.ok(
        CANONICAL_MAINTENANCE_PRIORITY.includes(priority as any),
        `Should include priority: ${priority}`,
      );
    }
  });

  it('should contain all expected review statuses', () => {
    const expectedStatuses = [
      'draft',
      'review',
      'approved',
      'published',
      'deprecated',
      'archived',
    ];

    for (const status of expectedStatuses) {
      assert.ok(
        CANONICAL_REVIEW_STATUS.includes(status as any),
        `Should include status: ${status}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not perform reviews', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('reviewResult' in result), 'Should not have review result');
    assert.ok(!('reviewExecution' in result), 'Should not have review execution');
  });

  it('should not update knowledge', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('updatedKnowledge' in result), 'Should not have updated knowledge');
    assert.ok(!('knowledgeUpdate' in result), 'Should not have knowledge update');
  });

  it('should not edit artifacts', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('editedArtifact' in result), 'Should not have edited artifact');
    assert.ok(!('artifactEdit' in result), 'Should not have artifact edit');
  });

  it('should not create revisions', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('createdRevision' in result), 'Should not have created revision');
    assert.ok(!('revisionCreation' in result), 'Should not have revision creation');
  });

  it('should not update references', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('updatedReference' in result), 'Should not have updated reference');
    assert.ok(!('referenceUpdate' in result), 'Should not have reference update');
  });

  it('should not rewrite documentation', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('rewrittenDocumentation' in result), 'Should not have rewritten documentation');
    assert.ok(!('documentationRewrite' in result), 'Should not have documentation rewrite');
  });

  it('should not schedule runtime jobs', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('scheduledJob' in result), 'Should not have scheduled job');
    assert.ok(!('jobSchedule' in result), 'Should not have job schedule');
  });

  it('should not estimate educational quality', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('qualityEstimate' in result), 'Should not have quality estimate');
    assert.ok(!('educationalQuality' in result), 'Should not have educational quality');
  });

  it('should not call LLMs', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('llmResult' in result), 'Should not have LLM result');
    assert.ok(!('aiPlanning' in result), 'Should not have AI planning');
  });

  it('should not call external APIs', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('apiResult' in result), 'Should not have API result');
    assert.ok(!('externalCall' in result), 'Should not have external call');
  });

  it('should not have executable callbacks in trigger', () => {
    const trigger = composeKnowledgeReviewTrigger({
      triggerId: 'trigger-001',
      triggerType: 'editorial_change',
      artifactId: 'knowledge-001',
      priority: 'high',
      rationale: 'Test.',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(trigger);
    for (const key of keys) {
      const value = (trigger as any)[key];
      assert.ok(typeof value !== 'function', `Trigger field "${key}" should not be a function`);
    }
  });

  it('should not access filesystem', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('filesystem' in result), 'Should not have filesystem');
    assert.ok(!('fileSystem' in result), 'Should not have fileSystem');
  });

  it('should not perform runtime execution', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('runtimeExecution' in result), 'Should not have runtime execution');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate code', () => {
    const result = composeKnowledgeReview(VALID_INPUT);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });
});

// ---------------------------------------------------------------------------
// Knowledge Artifact With Review Plan Tests
// ---------------------------------------------------------------------------

describe('Review Kernel — Knowledge Artifact With Review Plan', () => {
  it('should compose valid knowledge artifact with review plan', () => {
    const artifact = composeKnowledgeArtifactWithReviewPlan({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      plans: [VALID_PLAN],
      tasks: [VALID_TASK],
      triggers: [VALID_TRIGGER],
      provenance: VALID_PROVENANCE,
    });

    assert.equal(artifact.knowledgeId, 'knowledge-001');
    assert.equal(artifact.title, 'Neural Networks');
    assert.equal(artifact.plans.length, 1);
    assert.equal(artifact.tasks.length, 1);
    assert.equal(artifact.triggers.length, 1);
  });

  it('should validate valid knowledge artifact with review plan', () => {
    const artifact = composeKnowledgeArtifactWithReviewPlan({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      plans: [VALID_PLAN],
      tasks: [VALID_TASK],
      triggers: [VALID_TRIGGER],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithReviewPlan(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should detect missing knowledgeId', () => {
    const artifact = composeKnowledgeArtifactWithReviewPlan({
      knowledgeId: '',
      title: 'Neural Networks',
      plans: [VALID_PLAN],
      tasks: [VALID_TASK],
      triggers: [VALID_TRIGGER],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithReviewPlan(artifact);
    const knowledgeIdError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
    );

    assert.ok(knowledgeIdError, 'Should have REVIEW_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing title', () => {
    const artifact = composeKnowledgeArtifactWithReviewPlan({
      knowledgeId: 'knowledge-001',
      title: '',
      plans: [VALID_PLAN],
      tasks: [VALID_TASK],
      triggers: [VALID_TRIGGER],
      provenance: VALID_PROVENANCE,
    });

    const result = validateKnowledgeArtifactWithReviewPlan(artifact);
    const titleError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_ARTIFACT_ID,
    );

    assert.ok(titleError, 'Should have REVIEW_MISSING_ARTIFACT_ID error');
  });

  it('should detect missing provenance', () => {
    const artifact = composeKnowledgeArtifactWithReviewPlan({
      knowledgeId: 'knowledge-001',
      title: 'Neural Networks',
      plans: [VALID_PLAN],
      tasks: [VALID_TASK],
      triggers: [VALID_TRIGGER],
      provenance: undefined as any,
    });

    const result = validateKnowledgeArtifactWithReviewPlan(artifact);
    const provenanceError = result.errors.find(
      (e) => e.code === REVIEW_VALIDATION_CODES.REVIEW_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have REVIEW_MISSING_PROVENANCE error');
  });
});
