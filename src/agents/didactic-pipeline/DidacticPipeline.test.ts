/**
 * NV-1300-D1-OPT-01 — Didactic Pipeline Kernel Tests
 *
 * Focused tests for the deterministic lesson pipeline.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. Full lesson input produces 13 ordered stages
 * 2. Missing laboratory resource omits only interactive_laboratory with explicit reason
 * 3. Duplicate/non-canonical stage fails validation
 * 4. Identical input produces identical output
 * 5. Omitted stage without reason fails validation
 * 6. No curriculum mutation occurs
 * 7. No hidden random/time dependency exists
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlan } from './PipelineComposer.ts';
import { validateLessonPlan } from './ValidationLayer.ts';
import { buildAllStageStatuses, determineStageStatus } from './StageInclusionLogic.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInput,
  type DidacticLessonPlan,
  type DidacticPipelineStage,
  type DidacticValidationResult,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createFullInput(): DidacticLessonInput {
  return {
    topic: 'Neural Network Fundamentals',
    conceptIds: ['nn-001', 'nn-002'],
    difficulty: 'standard',
    availableResources: {
      concepts: [{ resourceId: 'concept-1', resourceType: 'concept', source: 'curriculum' }],
      visualizations: [{ resourceId: 'viz-1', resourceType: 'visualization', source: 'curriculum' }],
      laboratories: [{ resourceId: 'lab-1', resourceType: 'laboratory', source: 'curriculum' }],
      artifacts: [{ resourceId: 'art-1', resourceType: 'artifact', source: 'curriculum' }],
      sharedKnowledge: [{ resourceId: 'sk-1', resourceType: 'shared_knowledge', source: 'curriculum' }],
    },
  };
}

function createInputWithoutLab(): DidacticLessonInput {
  return {
    topic: 'Linear Algebra Basics',
    conceptIds: ['la-001'],
    difficulty: 'standard',
    availableResources: {
      concepts: [{ resourceId: 'concept-1', resourceType: 'concept', source: 'curriculum' }],
      visualizations: [{ resourceId: 'viz-1', resourceType: 'visualization', source: 'curriculum' }],
      laboratories: [],
      artifacts: [],
      sharedKnowledge: [],
    },
  };
}

function createInputWithoutViz(): DidacticLessonInput {
  return {
    topic: 'Optimization Theory',
    conceptIds: ['opt-001'],
    difficulty: 'standard',
    availableResources: {
      concepts: [{ resourceId: 'concept-1', resourceType: 'concept', source: 'curriculum' }],
      visualizations: [],
      laboratories: [{ resourceId: 'lab-1', resourceType: 'laboratory', source: 'curriculum' }],
      artifacts: [],
      sharedKnowledge: [],
    },
  };
}

function createEssentialsInput(): DidacticLessonInput {
  return {
    topic: 'Intro to ML',
    conceptIds: [],
    difficulty: 'essentials',
    availableResources: {
      concepts: [],
      visualizations: [],
      laboratories: [],
      artifacts: [],
      sharedKnowledge: [],
    },
  };
}

// ---------------------------------------------------------------------------
// Test 1: Full lesson input produces 13 ordered stages
// ---------------------------------------------------------------------------

describe('Didactic Pipeline Kernel', () => {
  test('full lesson input produces 13 ordered stages', () => {
    const input = createFullInput();
    const plan = composeLessonPlan(input);

    assert.strictEqual(plan.stages.length, 13, 'Plan must have exactly 13 stages');
    assert.strictEqual(plan.trace.totalStages, 13, 'Trace totalStages must be 13');

    // Verify canonical order
    for (let i = 0; i < CANONICAL_PIPELINE_STAGES.length; i++) {
      assert.strictEqual(
        plan.stages[i].stageId,
        CANONICAL_PIPELINE_STAGES[i],
        `Stage ${i} must be ${CANONICAL_PIPELINE_STAGES[i]}`,
      );
      assert.strictEqual(
        plan.stages[i].order,
        i + 1,
        `Stage ${i} order must be ${i + 1}`,
      );
    }

    // All stages should be included when all resources are available at standard difficulty
    const included = plan.stages.filter((s) => s.status === 'included');
    assert.strictEqual(included.length, 13, 'All 13 stages should be included');
  });

  // ---------------------------------------------------------------------------
  // Test 2: Missing laboratory resource omits only interactive_laboratory
  // ---------------------------------------------------------------------------

  test('missing laboratory resource omits only interactive_laboratory with explicit reason', () => {
    const input = createInputWithoutLab();
    const plan = composeLessonPlan(input);

    const labStage = plan.stages.find((s) => s.stageId === 'interactive_laboratory');
    assert.ok(labStage, 'interactive_laboratory stage must exist');
    assert.strictEqual(labStage.status, 'omitted', 'interactive_laboratory must be omitted');
    assert.ok(labStage.omissionReason, 'Omission reason must be present');
    assert.ok(
      labStage.omissionReason!.reason.includes('laboratory'),
      'Omission reason must reference laboratory resource',
    );
    assert.strictEqual(labStage.omissionReason!.severity, 'info', 'Severity must be info');

    // Other stages that don't require labs should still be included
    const motivationStage = plan.stages.find((s) => s.stageId === 'motivation');
    assert.ok(motivationStage);
    assert.strictEqual(motivationStage.status, 'included', 'motivation must be included');

    const summaryStage = plan.stages.find((s) => s.stageId === 'summary');
    assert.ok(summaryStage);
    assert.strictEqual(summaryStage.status, 'included', 'summary must be included');

    const conceptStage = plan.stages.find((s) => s.stageId === 'concept_introduction');
    assert.ok(conceptStage);
    assert.strictEqual(conceptStage.status, 'included', 'concept_introduction must be included');
  });

  // ---------------------------------------------------------------------------
  // Test 3: Duplicate/non-canonical stage fails validation
  // ---------------------------------------------------------------------------

  test('duplicate/non-canonical stage fails validation', () => {
    // Test with non-canonical stage name
    const planWithBadStage: DidacticLessonPlan = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: [
        {
          stageId: 'motivation' as any,
          order: 1,
          status: 'included',
          label: 'Motivation',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
        {
          stageId: 'fake_stage' as any,
          order: 2,
          status: 'included',
          label: 'Fake',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
      ],
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 2,
        includedStages: 2,
        omittedStages: 0,
        blockedStages: 0,
        invalidStages: 0,
        generatedFrom: 'deterministic_pipeline',
        deterministic: true,
        curriculumMutated: false,
        randomUsed: false,
        timeDependency: false,
      },
      validation: { valid: true, errors: [], checkedAt: 'plan_generation' },
    };

    const result = validateLessonPlan(planWithBadStage);
    assert.strictEqual(result.valid, false, 'Validation must fail for non-canonical stage');
    assert.ok(
      result.errors.some((e) => e.code === 'NON_CANONICAL_STAGE'),
      'Must report NON_CANONICAL_STAGE error',
    );

    // Test with duplicate stage IDs
    const planWithDuplicate: DidacticLessonPlan = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: [
        {
          stageId: 'motivation' as any,
          order: 1,
          status: 'included',
          label: 'Motivation',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
        {
          stageId: 'motivation' as any,
          order: 2,
          status: 'included',
          label: 'Motivation Again',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
      ],
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 2,
        includedStages: 2,
        omittedStages: 0,
        blockedStages: 0,
        invalidStages: 0,
        generatedFrom: 'deterministic_pipeline',
        deterministic: true,
        curriculumMutated: false,
        randomUsed: false,
        timeDependency: false,
      },
      validation: { valid: true, errors: [], checkedAt: 'plan_generation' },
    };

    const dupResult = validateLessonPlan(planWithDuplicate);
    assert.strictEqual(dupResult.valid, false, 'Validation must fail for duplicate stage');
    assert.ok(
      dupResult.errors.some((e) => e.code === 'DUPLICATE_STAGE_ID'),
      'Must report DUPLICATE_STAGE_ID error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 4: Identical input produces identical output
  // ---------------------------------------------------------------------------

  test('identical input produces identical output', () => {
    const input = createFullInput();

    const plan1 = composeLessonPlan(input);
    const plan2 = composeLessonPlan(input);
    const plan3 = composeLessonPlan(input);

    // Deep equality check via JSON serialization
    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);
    const json3 = JSON.stringify(plan3);

    assert.strictEqual(json1, json2, 'Plan 1 and Plan 2 must be identical');
    assert.strictEqual(json2, json3, 'Plan 2 and Plan 3 must be identical');

    // Run 100 iterations to be thorough
    for (let i = 0; i < 100; i++) {
      const plan = composeLessonPlan(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 5: Omitted stage without reason fails validation
  // ---------------------------------------------------------------------------

  test('omitted stage without reason fails validation', () => {
    const planWithOmittedNoReason: DidacticLessonPlan = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: [
        {
          stageId: 'motivation' as any,
          order: 1,
          status: 'included',
          label: 'Motivation',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
        {
          stageId: 'context' as any,
          order: 2,
          status: 'omitted',
          label: 'Context',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
      ],
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 2,
        includedStages: 1,
        omittedStages: 1,
        blockedStages: 0,
        invalidStages: 0,
        generatedFrom: 'deterministic_pipeline',
        deterministic: true,
        curriculumMutated: false,
        randomUsed: false,
        timeDependency: false,
      },
      validation: { valid: true, errors: [], checkedAt: 'plan_generation' },
    };

    const result = validateLessonPlan(planWithOmittedNoReason);
    assert.strictEqual(result.valid, false, 'Validation must fail for omitted stage without reason');
    assert.ok(
      result.errors.some((e) => e.code === 'OMITTED_WITHOUT_REASON'),
      'Must report OMITTED_WITHOUT_REASON error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: No curriculum mutation occurs
  // ---------------------------------------------------------------------------

  test('no curriculum mutation occurs', () => {
    const input = createFullInput();
    const originalTopic = input.topic;
    const originalConceptIds = [...input.conceptIds];
    const originalResources = JSON.parse(JSON.stringify(input.availableResources));

    const plan = composeLessonPlan(input);

    // Verify input was not mutated
    assert.strictEqual(input.topic, originalTopic, 'Input topic must not be mutated');
    assert.deepStrictEqual([...input.conceptIds], originalConceptIds, 'Input conceptIds must not be mutated');
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(input.availableResources)),
      originalResources,
      'Input availableResources must not be mutated',
    );

    // Verify trace metadata declares no mutation
    assert.strictEqual(plan.trace.curriculumMutated, false, 'curriculumMutated must be false');

    // Verify no stages have content fabrication
    for (const stage of plan.stages) {
      if (stage.status === 'included') {
        // Stages should have descriptions from the rule, not fabricated content
        assert.ok(stage.description, `Stage ${stage.stageId} must have a description`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Test 7: No hidden random/time dependency exists
  // ---------------------------------------------------------------------------

  test('no hidden random/time dependency exists', () => {
    const input = createFullInput();

    // Verify trace metadata declares no random/time dependency
    const plan = composeLessonPlan(input);
    assert.strictEqual(plan.trace.randomUsed, false, 'randomUsed must be false');
    assert.strictEqual(plan.trace.timeDependency, false, 'timeDependency must be false');

    // Run identical input multiple times and verify IDs are identical
    const plan1 = composeLessonPlan(input);
    const plan2 = composeLessonPlan(input);
    assert.strictEqual(plan1.id, plan2.id, 'Plan IDs must be deterministic');
    assert.strictEqual(plan1.trace.planId, plan2.trace.planId, 'Trace planIds must be deterministic');

    // Verify the plan ID does not contain timestamps or random values
    const planId = plan1.id;
    assert.ok(
      !planId.match(/\d{10,}/),
      'Plan ID must not contain Unix timestamps',
    );
    assert.ok(
      !planId.match(/[a-f0-9]{8,}/),
      'Plan ID must not contain random hex strings',
    );
    assert.ok(
      planId.startsWith('plan-didactic-'),
      'Plan ID must follow deterministic format',
    );

    // Verify no stages have time-dependent IDs
    for (const stage of plan1.stages) {
      assert.ok(
        !stage.stageId.match(/\d{10,}/),
        `Stage ${stage.stageId} must not contain timestamps`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Additional: Validation catches invalid plans
  // ---------------------------------------------------------------------------

  test('validation catches missing trace metadata', () => {
    const planWithoutTrace = {
      id: 'test',
      topic: 'Test',
      difficulty: 'standard',
      stages: [],
      trace: null,
      validation: { valid: true, errors: [], checkedAt: 'plan_generation' as const },
    } as unknown as DidacticLessonPlan;

    const result = validateLessonPlan(planWithoutTrace);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === 'MISSING_TRACE_METADATA'));
  });

  test('validation catches invalid stage order', () => {
    const planWrongOrder: DidacticLessonPlan = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: [
        {
          stageId: 'summary' as any,
          order: 1,
          status: 'included',
          label: 'Summary',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
        {
          stageId: 'motivation' as any,
          order: 2,
          status: 'included',
          label: 'Motivation',
          description: 'Test',
          omissionReason: null,
          resourceRef: null,
        },
      ],
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 2,
        includedStages: 2,
        omittedStages: 0,
        blockedStages: 0,
        invalidStages: 0,
        generatedFrom: 'deterministic_pipeline',
        deterministic: true,
        curriculumMutated: false,
        randomUsed: false,
        timeDependency: false,
      },
      validation: { valid: true, errors: [], checkedAt: 'plan_generation' },
    };

    const result = validateLessonPlan(planWrongOrder);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'INVALID_STAGE_ORDER'),
      'Must report INVALID_STAGE_ORDER error',
    );
  });

  test('essentials difficulty omits mathematical_foundation', () => {
    const input = createEssentialsInput();
    const plan = composeLessonPlan(input);

    const mathStage = plan.stages.find((s) => s.stageId === 'mathematical_foundation');
    assert.ok(mathStage, 'mathematical_foundation stage must exist');
    assert.strictEqual(mathStage.status, 'omitted', 'mathematical_foundation must be omitted at essentials');
    assert.ok(mathStage.omissionReason, 'Must have omission reason');
    assert.ok(
      mathStage.omissionReason!.reason.includes('essentials'),
      'Reason must reference essentials difficulty',
    );
  });
});
