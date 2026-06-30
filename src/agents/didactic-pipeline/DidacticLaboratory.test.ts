/**
 * NV-1300-D1-OPT-05 — Didactic Laboratory Orchestration Tests
 *
 * Focused tests for the deterministic laboratory orchestrator and
 * lab-aware pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. requested available lab is selected
 * 2. requested missing lab is omitted with explicit reason
 * 3. unsupported integration mode fails validation
 * 4. lab without source fails validation
 * 5. lab without pedagogical objective fails validation
 * 6. deprecated lab is not selected
 * 7. lab placement maps only to canonical stages
 * 8. no canonical stage order change occurs
 * 9. no non-canonical stage is inserted
 * 10. input lab resources are not mutated
 * 11. identical lab input produces identical output
 * 12. no generated lab content is introduced
 * 13. no lab execution function/callback is accepted
 * 14. multiple lab modes can coexist when resources support them
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanAll } from './PipelineComposer.ts';
import { validateLessonPlanAll } from './ValidationLayer.ts';
import {
  orchestrateLaboratories,
  buildLabTrace,
  validateLaboratoryResource,
  VALID_INTEGRATION_MODES,
  INTEGRATION_MODE_STAGE_MAP,
} from './LaboratoryOrchestrator.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputAll,
  type DidacticLessonPlanAll,
  type DidacticLaboratoryResource,
  type DidacticLaboratoryDecision,
  type DidacticLaboratoryIntegrationMode,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputAll {
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

function createLabResource(
  labId: string,
  modes: DidacticLaboratoryIntegrationMode[],
  requiredConcepts: string[] = [],
): DidacticLaboratoryResource {
  return {
    labId,
    source: `curriculum/labs/${labId}`,
    supportedIntegrationModes: modes,
    supportedStages: ['interactive_laboratory', 'practical_example'],
    pedagogicalObjective: `Objective for ${labId}.`,
    requiredConceptIds: requiredConcepts,
    outputArtifactTypes: ['report'],
    lifecycle: 'active',
  };
}

function createDeprecatedLabResource(labId: string): DidacticLaboratoryResource {
  return {
    labId,
    source: `curriculum/labs/${labId}`,
    supportedIntegrationModes: ['guided_during_explanation'],
    supportedStages: ['interactive_laboratory'],
    pedagogicalObjective: `Objective for ${labId}.`,
    requiredConceptIds: [],
    lifecycle: 'deprecated',
  };
}

// ---------------------------------------------------------------------------
// Test 1: requested available lab is selected
// ---------------------------------------------------------------------------

describe('D1-OPT-05 — Laboratory Orchestration', () => {
  test('requested available lab is selected', () => {
    const resources = [createLabResource('lab-ml-001', ['guided_during_explanation'])];
    const decisions = orchestrateLaboratories(
      { requestedLabs: [{ labId: 'lab-ml-001', integrationMode: 'guided_during_explanation' }] },
      resources,
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].labId, 'lab-ml-001');
    assert.strictEqual(decisions[0].status, 'selected');
    assert.strictEqual(decisions[0].integrationMode, 'guided_during_explanation');
    assert.ok(decisions[0].source, 'Must have source');
    assert.ok(decisions[0].pedagogicalObjective, 'Must have pedagogicalObjective');
    assert.ok(decisions[0].rationale, 'Must have rationale');
  });

  // ---------------------------------------------------------------------------
  // Test 2: requested missing lab is omitted with explicit reason
  // ---------------------------------------------------------------------------

  test('requested missing lab is omitted with explicit reason', () => {
    const resources = [createLabResource('lab-ml-001', ['guided_during_explanation'])];
    const decisions = orchestrateLaboratories(
      { requestedLabs: [{ labId: 'lab-nonexistent', integrationMode: 'guided_during_explanation' }] },
      resources,
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].labId, 'lab-nonexistent');
    assert.strictEqual(decisions[0].status, 'omitted');
    assert.ok(decisions[0].omissionReason, 'Must have omissionReason');
    assert.ok(
      decisions[0].omissionReason!.includes('lab-nonexistent'),
      'Reason must reference the lab',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 3: unsupported integration mode fails validation
  // ---------------------------------------------------------------------------

  test('unsupported integration mode fails validation', () => {
    const decisions: DidacticLaboratoryDecision[] = [
      {
        labId: 'test-lab',
        status: 'selected',
        source: 'curriculum',
        integrationMode: 'invalid_mode' as any,
        targetStageId: 'interactive_laboratory',
        pedagogicalObjective: 'Test.',
        requiredConceptIds: [],
        rationale: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildLabTrace(decisions);
    const plan: DidacticLessonPlanAll = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: CANONICAL_PIPELINE_STAGES.map((id, i) => ({
        stageId: id as any,
        order: i + 1,
        status: 'included' as const,
        label: id,
        description: 'Test',
        omissionReason: null,
        resourceRef: null,
      })),
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 13,
        includedStages: 13,
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
      laboratoryTrace: trace,
    };

    const result = validateLessonPlanAll(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unsupported mode');
    assert.ok(
      result.errors.some((e) => e.code === 'LAB_UNSUPPORTED_MODE'),
      'Must report LAB_UNSUPPORTED_MODE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 4: lab without source fails validation
  // ---------------------------------------------------------------------------

  test('lab without source fails validation', () => {
    const decisions: DidacticLaboratoryDecision[] = [
      {
        labId: 'test-lab',
        status: 'selected',
        source: '',
        integrationMode: 'guided_during_explanation',
        targetStageId: 'interactive_laboratory',
        pedagogicalObjective: 'Test.',
        requiredConceptIds: [],
        rationale: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildLabTrace(decisions);
    const plan: DidacticLessonPlanAll = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: CANONICAL_PIPELINE_STAGES.map((id, i) => ({
        stageId: id as any,
        order: i + 1,
        status: 'included' as const,
        label: id,
        description: 'Test',
        omissionReason: null,
        resourceRef: null,
      })),
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 13,
        includedStages: 13,
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
      laboratoryTrace: trace,
    };

    const result = validateLessonPlanAll(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAB_MISSING_SOURCE'),
      'Must report LAB_MISSING_SOURCE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 5: lab without pedagogical objective fails validation
  // ---------------------------------------------------------------------------

  test('lab without pedagogical objective fails validation', () => {
    const decisions: DidacticLaboratoryDecision[] = [
      {
        labId: 'test-lab',
        status: 'selected',
        source: 'curriculum',
        integrationMode: 'guided_during_explanation',
        targetStageId: 'interactive_laboratory',
        pedagogicalObjective: '',
        requiredConceptIds: [],
        rationale: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildLabTrace(decisions);
    const plan: DidacticLessonPlanAll = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: CANONICAL_PIPELINE_STAGES.map((id, i) => ({
        stageId: id as any,
        order: i + 1,
        status: 'included' as const,
        label: id,
        description: 'Test',
        omissionReason: null,
        resourceRef: null,
      })),
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 13,
        includedStages: 13,
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
      laboratoryTrace: trace,
    };

    const result = validateLessonPlanAll(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAB_MISSING_PEDAGOGICAL_OBJECTIVE'),
      'Must report LAB_MISSING_PEDAGOGICAL_OBJECTIVE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: deprecated lab is not selected
  // ---------------------------------------------------------------------------

  test('deprecated lab is not selected', () => {
    const resources = [createDeprecatedLabResource('lab-deprecated')];
    const decisions = orchestrateLaboratories(
      { requestedLabs: [{ labId: 'lab-deprecated', integrationMode: 'guided_during_explanation' }] },
      resources,
      ['nn-001'],
    );

    // Deprecated lab should be omitted
    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 0, 'No deprecated resources should be selected');
  });

  // ---------------------------------------------------------------------------
  // Test 7: lab placement maps only to canonical stages
  // ---------------------------------------------------------------------------

  test('lab placement maps only to canonical stages', () => {
    const resources = [
      createLabResource('lab-1', ['exploratory_before_explanation']),
      createLabResource('lab-2', ['guided_during_explanation']),
      createLabResource('lab-3', ['validation_after_theory']),
      createLabResource('lab-4', ['comparative_between_methods']),
      createLabResource('lab-5', ['challenge_after_assessment']),
      createLabResource('lab-6', ['reinforcement_after_assessment']),
    ];

    const decisions = orchestrateLaboratories(
      {
        requestedLabs: [
          { labId: 'lab-1', integrationMode: 'exploratory_before_explanation' },
          { labId: 'lab-2', integrationMode: 'guided_during_explanation' },
          { labId: 'lab-3', integrationMode: 'validation_after_theory' },
          { labId: 'lab-4', integrationMode: 'comparative_between_methods' },
          { labId: 'lab-5', integrationMode: 'challenge_after_assessment' },
          { labId: 'lab-6', integrationMode: 'reinforcement_after_assessment' },
        ],
      },
      resources,
      ['nn-001'],
    );

    const canonicalSet = new Set(CANONICAL_PIPELINE_STAGES);
    for (const d of decisions) {
      assert.ok(
        canonicalSet.has(d.targetStageId),
        `Lab "${d.labId}" must map to canonical stage "${d.targetStageId}"`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 8: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    input.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
    };

    const plan = composeLessonPlanAll(input);

    assert.strictEqual(plan.stages.length, 13, 'Must have 13 stages');
    for (let i = 0; i < CANONICAL_PIPELINE_STAGES.length; i++) {
      assert.strictEqual(
        plan.stages[i].stageId,
        CANONICAL_PIPELINE_STAGES[i],
        `Stage ${i} must be ${CANONICAL_PIPELINE_STAGES[i]}`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 9: no non-canonical stage is inserted
  // ---------------------------------------------------------------------------

  test('no non-canonical stage is inserted', () => {
    const input = createBaseInput();
    input.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
    };

    const plan = composeLessonPlanAll(input);

    const canonicalSet = new Set(CANONICAL_PIPELINE_STAGES);
    for (const stage of plan.stages) {
      assert.ok(
        canonicalSet.has(stage.stageId as any),
        `Stage "${stage.stageId}" must be canonical`,
      );
    }
    assert.strictEqual(plan.stages.length, 13, 'Must have exactly 13 stages');
  });

  // ---------------------------------------------------------------------------
  // Test 10: input lab resources are not mutated
  // ---------------------------------------------------------------------------

  test('input lab resources are not mutated', () => {
    const labResources = [createLabResource('lab-1', ['guided_during_explanation'])];
    const originalResources = JSON.parse(JSON.stringify(labResources));

    const input = createBaseInput();
    input.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: labResources,
    };

    composeLessonPlanAll(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(labResources)),
      originalResources,
      'Lab resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 11: identical lab input produces identical output
  // ---------------------------------------------------------------------------

  test('identical lab input produces identical output', () => {
    const input1 = createBaseInput();
    input1.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
    };

    const input2 = createBaseInput();
    input2.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
    };

    const plan1 = composeLessonPlanAll(input1);
    const plan2 = composeLessonPlanAll(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      input.laboratoryInput = {
        requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
        laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
      };
      const plan = composeLessonPlanAll(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 12: no generated lab content is introduced
  // ---------------------------------------------------------------------------

  test('no generated lab content is introduced', () => {
    const input = createBaseInput();
    input.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-1', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [createLabResource('lab-1', ['guided_during_explanation'])],
    };

    const plan = composeLessonPlanAll(input);

    // Verify no stage has generated content fields
    for (const stage of plan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify lab decisions only contain metadata, not content
    if (plan.laboratoryTrace) {
      for (const decision of plan.laboratoryTrace.decisions) {
        const decObj = decision as any;
        assert.strictEqual(decObj.content, undefined, `Lab "${decision.labId}" must not have content`);
        assert.strictEqual(decObj.explanation, undefined, `Lab "${decision.labId}" must not have explanation`);
        assert.strictEqual(decObj.generatedText, undefined, `Lab "${decision.labId}" must not have generatedText`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Test 13: no lab execution function/callback is accepted
  // ---------------------------------------------------------------------------

  test('no lab execution function/callback is accepted', () => {
    const input = createBaseInput();
    const labWithExec = createLabResource('lab-exec', ['guided_during_explanation']);
    // Add a fake execution function to the resource object
    (labWithExec as any).execute = () => 'should not be accepted';
    (labWithExec as any).run = () => 'should not be accepted';
    (labWithExec as any).callback = () => 'should not be accepted';

    input.laboratoryInput = {
      requestedLabs: [{ labId: 'lab-exec', integrationMode: 'guided_during_explanation' }],
      laboratoryResources: [labWithExec],
    };

    const plan = composeLessonPlanAll(input);

    // The decision should not contain execution functions
    if (plan.laboratoryTrace) {
      for (const decision of plan.laboratoryTrace.decisions) {
        const decObj = decision as any;
        assert.strictEqual(typeof decObj.execute, 'undefined', 'Decision must not have execute function');
        assert.strictEqual(typeof decObj.run, 'undefined', 'Decision must not have run function');
        assert.strictEqual(typeof decObj.callback, 'undefined', 'Decision must not have callback function');
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Test 14: multiple lab modes can coexist when resources support them
  // ---------------------------------------------------------------------------

  test('multiple lab modes can coexist when resources support them', () => {
    const resources = [
      createLabResource('lab-1', ['guided_during_explanation', 'validation_after_theory']),
      createLabResource('lab-2', ['exploratory_before_explanation', 'comparative_between_methods']),
    ];

    const decisions = orchestrateLaboratories(
      {
        requestedLabs: [
          { labId: 'lab-1', integrationMode: 'guided_during_explanation' },
          { labId: 'lab-2', integrationMode: 'exploratory_before_explanation' },
        ],
      },
      resources,
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 2);
    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 2, 'Both labs should be selected');

    // Verify different modes
    const modes = selected.map((d) => d.integrationMode);
    assert.ok(modes.includes('guided_during_explanation'), 'Should have guided_during_explanation');
    assert.ok(modes.includes('exploratory_before_explanation'), 'Should have exploratory_before_explanation');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches omitted lab without reason
  // ---------------------------------------------------------------------------

  test('validation catches omitted lab without reason', () => {
    const decisions: DidacticLaboratoryDecision[] = [
      {
        labId: 'omitted-lab',
        status: 'omitted',
        source: '',
        integrationMode: 'guided_during_explanation',
        targetStageId: 'interactive_laboratory',
        pedagogicalObjective: '',
        requiredConceptIds: [],
        rationale: '',
        omissionReason: '',
      },
    ];

    const trace = buildLabTrace(decisions);
    const plan: DidacticLessonPlanAll = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: CANONICAL_PIPELINE_STAGES.map((id, i) => ({
        stageId: id as any,
        order: i + 1,
        status: 'included' as const,
        label: id,
        description: 'Test',
        omissionReason: null,
        resourceRef: null,
      })),
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 13,
        includedStages: 13,
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
      laboratoryTrace: trace,
    };

    const result = validateLessonPlanAll(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAB_OMITTED_NO_REASON'),
      'Must report LAB_OMITTED_NO_REASON error',
    );
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches lab mapped to non-canonical stage
  // ---------------------------------------------------------------------------

  test('validation catches lab mapped to non-canonical stage', () => {
    const decisions: DidacticLaboratoryDecision[] = [
      {
        labId: 'bad-lab',
        status: 'selected',
        source: 'curriculum',
        integrationMode: 'guided_during_explanation',
        targetStageId: 'fake_stage' as any,
        pedagogicalObjective: 'Test.',
        requiredConceptIds: [],
        rationale: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildLabTrace(decisions);
    const plan: DidacticLessonPlanAll = {
      id: 'test-plan',
      topic: 'Test',
      difficulty: 'standard',
      stages: CANONICAL_PIPELINE_STAGES.map((id, i) => ({
        stageId: id as any,
        order: i + 1,
        status: 'included' as const,
        label: id,
        description: 'Test',
        omissionReason: null,
        resourceRef: null,
      })),
      trace: {
        planId: 'test',
        topic: 'Test',
        difficulty: 'standard',
        totalStages: 13,
        includedStages: 13,
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
      laboratoryTrace: trace,
    };

    const result = validateLessonPlanAll(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAB_MAPPED_TO_NON_CANONICAL_STAGE'),
      'Must report LAB_MAPPED_TO_NON_CANONICAL_STAGE error',
    );
  });
});
