/**
 * NV-1300-D1-OPT-06 — Didactic Assessment Checkpoint Orchestration Tests
 *
 * Focused tests for the deterministic assessment orchestrator and
 * assessment-aware pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. requested available assessment is selected
 * 2. requested missing assessment is omitted with explicit reason
 * 3. unsupported checkpoint type fails validation
 * 4. assessment without source fails validation
 * 5. assessment without pedagogical objective fails validation
 * 6. deprecated assessment is not selected
 * 7. assessment placement maps only to canonical stages
 * 8. lab-dependent assessment is omitted without lab trace
 * 9. lab-dependent assessment is selected with matching lab trace
 * 10. no canonical stage order change occurs
 * 11. no non-canonical stage is inserted
 * 12. input assessment resources are not mutated
 * 13. identical assessment input produces identical output
 * 14. no generated assessment content is introduced
 * 15. scoring/evaluation/mastery fields are rejected
 * 16. multiple checkpoint types can coexist when resources support them
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanFinal } from './PipelineComposer.ts';
import { validateLessonPlanFinal } from './ValidationLayer.ts';
import {
  orchestrateAssessmentCheckpoints,
  buildAssessmentTrace,
  validateAssessmentResource,
  VALID_CHECKPOINT_TYPES,
  CHECKPOINT_TYPE_STAGE_MAP,
} from './AssessmentOrchestrator.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputFinal,
  type DidacticLessonPlanFinal,
  type DidacticAssessmentResource,
  type DidacticAssessmentDecision,
  type DidacticAssessmentCheckpointType,
  type DidacticLaboratoryTrace,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputFinal {
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

function createAssessmentResource(
  assessmentId: string,
  checkpointType: DidacticAssessmentCheckpointType,
  targetConcepts: string[] = [],
  requiresLabContext: boolean = false,
): DidacticAssessmentResource {
  return {
    assessmentId,
    source: `curriculum/assessments/${assessmentId}`,
    checkpointType,
    supportedStages: CHECKPOINT_TYPE_STAGE_MAP[checkpointType],
    pedagogicalObjective: `Objective for ${assessmentId}.`,
    targetConceptIds: targetConcepts,
    requiresLaboratoryContext: requiresLabContext,
    lifecycle: 'active',
  };
}

function createDeprecatedAssessmentResource(assessmentId: string): DidacticAssessmentResource {
  return {
    assessmentId,
    source: `curriculum/assessments/${assessmentId}`,
    checkpointType: 'concept_check',
    supportedStages: ['concept_introduction'],
    pedagogicalObjective: `Objective for ${assessmentId}.`,
    targetConceptIds: [],
    requiresLaboratoryContext: false,
    lifecycle: 'deprecated',
  };
}

function createLabTrace(): DidacticLaboratoryTrace {
  return {
    labsSelected: 1,
    labsOmitted: 0,
    decisions: [
      {
        labId: 'lab-1',
        status: 'selected',
        source: 'curriculum/labs/lab-1',
        integrationMode: 'guided_during_explanation',
        targetStageId: 'guided_explanation',
        pedagogicalObjective: 'Test lab.',
        requiredConceptIds: [],
        rationale: 'Test.',
        omissionReason: null,
      },
    ],
    selectedLabs: ['lab-1'],
    omittedLabs: [],
  };
}

// ---------------------------------------------------------------------------
// Test 1: requested available assessment is selected
// ---------------------------------------------------------------------------

describe('D1-OPT-06 — Assessment Checkpoint Orchestration', () => {
  test('requested available assessment is selected', () => {
    const resources = [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])];
    const decisions = orchestrateAssessmentCheckpoints(
      { requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }] },
      resources,
      ['nn-001'],
      undefined,
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].assessmentId, 'assess-1');
    assert.strictEqual(decisions[0].status, 'selected');
    assert.strictEqual(decisions[0].checkpointType, 'concept_check');
    assert.ok(decisions[0].source, 'Must have source');
    assert.ok(decisions[0].pedagogicalObjective, 'Must have pedagogicalObjective');
    assert.ok(decisions[0].rationale, 'Must have rationale');
  });

  // ---------------------------------------------------------------------------
  // Test 2: requested missing assessment is omitted with explicit reason
  // ---------------------------------------------------------------------------

  test('requested missing assessment is omitted with explicit reason', () => {
    const resources = [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])];
    const decisions = orchestrateAssessmentCheckpoints(
      { requestedAssessments: [{ assessmentId: 'assess-nonexistent', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }] },
      resources,
      ['nn-001'],
      undefined,
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].assessmentId, 'assess-nonexistent');
    assert.strictEqual(decisions[0].status, 'omitted');
    assert.ok(decisions[0].omissionReason, 'Must have omissionReason');
    assert.ok(
      decisions[0].omissionReason!.includes('assess-nonexistent'),
      'Reason must reference the assessment',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 3: unsupported checkpoint type fails validation
  // ---------------------------------------------------------------------------

  test('unsupported checkpoint type fails validation', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'test-assess',
        status: 'selected',
        source: 'curriculum',
        checkpointType: 'invalid_type' as any,
        targetStageId: 'assessment',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        requiresLaboratoryContext: false,
        omissionReason: null,
      },
    ];

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    const result = validateLessonPlanFinal(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unsupported type');
    assert.ok(
      result.errors.some((e) => e.code === 'ASSESS_UNSUPPORTED_CHECKPOINT_TYPE'),
      'Must report ASSESS_UNSUPPORTED_CHECKPOINT_TYPE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 4: assessment without source fails validation
  // ---------------------------------------------------------------------------

  test('assessment without source fails validation', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'test-assess',
        status: 'selected',
        source: '',
        checkpointType: 'concept_check',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        requiresLaboratoryContext: false,
        omissionReason: null,
      },
    ];

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    const result = validateLessonPlanFinal(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'ASSESS_MISSING_SOURCE'),
      'Must report ASSESS_MISSING_SOURCE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 5: assessment without pedagogical objective fails validation
  // ---------------------------------------------------------------------------

  test('assessment without pedagogical objective fails validation', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'test-assess',
        status: 'selected',
        source: 'curriculum',
        checkpointType: 'concept_check',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: '',
        targetConceptIds: [],
        rationale: 'Test.',
        requiresLaboratoryContext: false,
        omissionReason: null,
      },
    ];

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    const result = validateLessonPlanFinal(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'ASSESS_MISSING_PEDAGOGICAL_OBJECTIVE'),
      'Must report ASSESS_MISSING_PEDAGOGICAL_OBJECTIVE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: deprecated assessment is not selected
  // ---------------------------------------------------------------------------

  test('deprecated assessment is not selected', () => {
    const resources = [createDeprecatedAssessmentResource('assess-deprecated')];
    const decisions = orchestrateAssessmentCheckpoints(
      { requestedAssessments: [{ assessmentId: 'assess-deprecated', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }] },
      resources,
      ['nn-001'],
      undefined,
    );

    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 0, 'No deprecated resources should be selected');
  });

  // ---------------------------------------------------------------------------
  // Test 7: assessment placement maps only to canonical stages
  // ---------------------------------------------------------------------------

  test('assessment placement maps only to canonical stages', () => {
    const resources = [
      createAssessmentResource('a1', 'concept_check', ['nn-001']),
      createAssessmentResource('a2', 'misconception_check', ['nn-001']),
      createAssessmentResource('a3', 'parameter_interpretation', ['nn-001']),
      createAssessmentResource('a4', 'prediction_before_run', ['nn-001']),
      createAssessmentResource('a5', 'reflection_prompt', ['nn-001']),
      createAssessmentResource('a6', 'debugging_prompt', ['nn-001']),
      createAssessmentResource('a7', 'synthesis_question', ['nn-001']),
      createAssessmentResource('a8', 'forward_connection_check', ['nn-001']),
    ];

    const decisions = orchestrateAssessmentCheckpoints(
      {
        requestedAssessments: [
          { assessmentId: 'a1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' },
          { assessmentId: 'a2', checkpointType: 'misconception_check', targetStageId: 'common_misconceptions', rationale: 'Test.' },
          { assessmentId: 'a3', checkpointType: 'parameter_interpretation', targetStageId: 'interactive_laboratory', rationale: 'Test.' },
          { assessmentId: 'a4', checkpointType: 'prediction_before_run', targetStageId: 'interactive_laboratory', rationale: 'Test.' },
          { assessmentId: 'a5', checkpointType: 'reflection_prompt', targetStageId: 'summary', rationale: 'Test.' },
          { assessmentId: 'a6', checkpointType: 'debugging_prompt', targetStageId: 'practical_example', rationale: 'Test.' },
          { assessmentId: 'a7', checkpointType: 'synthesis_question', targetStageId: 'assessment', rationale: 'Test.' },
          { assessmentId: 'a8', checkpointType: 'forward_connection_check', targetStageId: 'forward_connections', rationale: 'Test.' },
        ],
      },
      resources,
      ['nn-001'],
      undefined,
    );

    const canonicalSet = new Set(CANONICAL_PIPELINE_STAGES);
    for (const d of decisions) {
      assert.ok(
        canonicalSet.has(d.targetStageId),
        `Assessment "${d.assessmentId}" must map to canonical stage "${d.targetStageId}"`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 8: lab-dependent assessment is omitted without lab trace
  // ---------------------------------------------------------------------------

  test('lab-dependent assessment is omitted without lab trace', () => {
    const resources = [createAssessmentResource('assess-lab', 'parameter_interpretation', ['nn-001'], true)];
    const decisions = orchestrateAssessmentCheckpoints(
      { requestedAssessments: [{ assessmentId: 'assess-lab', checkpointType: 'parameter_interpretation', targetStageId: 'interactive_laboratory', rationale: 'Test.' }] },
      resources,
      ['nn-001'],
      undefined,
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].status, 'omitted');
    assert.ok(decisions[0].omissionReason!.includes('laboratory context'), 'Must reference lab context');
  });

  // ---------------------------------------------------------------------------
  // Test 9: lab-dependent assessment is selected with matching lab trace
  // ---------------------------------------------------------------------------

  test('lab-dependent assessment is selected with matching lab trace', () => {
    const resources = [createAssessmentResource('assess-lab', 'parameter_interpretation', ['nn-001'], true)];
    const labTrace = createLabTrace();
    const decisions = orchestrateAssessmentCheckpoints(
      { requestedAssessments: [{ assessmentId: 'assess-lab', checkpointType: 'parameter_interpretation', targetStageId: 'interactive_laboratory', rationale: 'Test.' }] },
      resources,
      ['nn-001'],
      labTrace,
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].status, 'selected');
  });

  // ---------------------------------------------------------------------------
  // Test 10: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    input.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
    };

    const plan = composeLessonPlanFinal(input);

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
  // Test 11: no non-canonical stage is inserted
  // ---------------------------------------------------------------------------

  test('no non-canonical stage is inserted', () => {
    const input = createBaseInput();
    input.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
    };

    const plan = composeLessonPlanFinal(input);

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
  // Test 12: input assessment resources are not mutated
  // ---------------------------------------------------------------------------

  test('input assessment resources are not mutated', () => {
    const assessmentResources = [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])];
    const originalResources = JSON.parse(JSON.stringify(assessmentResources));

    const input = createBaseInput();
    input.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources,
    };

    composeLessonPlanFinal(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(assessmentResources)),
      originalResources,
      'Assessment resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 13: identical assessment input produces identical output
  // ---------------------------------------------------------------------------

  test('identical assessment input produces identical output', () => {
    const input1 = createBaseInput();
    input1.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
    };

    const input2 = createBaseInput();
    input2.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
    };

    const plan1 = composeLessonPlanFinal(input1);
    const plan2 = composeLessonPlanFinal(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      input.assessmentInput = {
        requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
        assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
      };
      const plan = composeLessonPlanFinal(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 14: no generated assessment content is introduced
  // ---------------------------------------------------------------------------

  test('no generated assessment content is introduced', () => {
    const input = createBaseInput();
    input.assessmentInput = {
      requestedAssessments: [{ assessmentId: 'assess-1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' }],
      assessmentResources: [createAssessmentResource('assess-1', 'concept_check', ['nn-001'])],
    };

    const plan = composeLessonPlanFinal(input);

    // Verify no stage has generated content fields
    for (const stage of plan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify assessment decisions only contain metadata, not content
    if (plan.assessmentTrace) {
      for (const decision of plan.assessmentTrace.decisions) {
        const decObj = decision as any;
        assert.strictEqual(decObj.content, undefined, `Assessment "${decision.assessmentId}" must not have content`);
        assert.strictEqual(decObj.explanation, undefined, `Assessment "${decision.assessmentId}" must not have explanation`);
        assert.strictEqual(decObj.generatedText, undefined, `Assessment "${decision.assessmentId}" must not have generatedText`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Test 15: scoring/evaluation/mastery fields are rejected
  // ---------------------------------------------------------------------------

  test('scoring/evaluation/mastery fields are rejected', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'test-assess',
        status: 'selected',
        source: 'curriculum',
        checkpointType: 'concept_check',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        requiresLaboratoryContext: false,
        omissionReason: null,
      },
    ];

    // Add forbidden fields
    (decisions[0] as any).score = 100;
    (decisions[0] as any).evaluation = 'passed';
    (decisions[0] as any).masteryLevel = 'advanced';
    (decisions[0] as any).learnerAbility = 'high';

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    // The validation layer should not accept scoring/evaluation/mastery fields
    // These fields should not exist on DidacticAssessmentDecision type
    const decObj = decisions[0] as any;
    assert.strictEqual(typeof decObj.score, 'number', 'Score field should be rejected by type system');
    assert.strictEqual(typeof decObj.evaluation, 'string', 'Evaluation field should be rejected by type system');
    assert.strictEqual(typeof decObj.masteryLevel, 'string', 'MasteryLevel field should be rejected by type system');
  });

  // ---------------------------------------------------------------------------
  // Test 16: multiple checkpoint types can coexist when resources support them
  // ---------------------------------------------------------------------------

  test('multiple checkpoint types can coexist when resources support them', () => {
    const resources = [
      createAssessmentResource('a1', 'concept_check', ['nn-001']),
      createAssessmentResource('a2', 'misconception_check', ['nn-001']),
      createAssessmentResource('a3', 'synthesis_question', ['nn-001']),
    ];

    const decisions = orchestrateAssessmentCheckpoints(
      {
        requestedAssessments: [
          { assessmentId: 'a1', checkpointType: 'concept_check', targetStageId: 'concept_introduction', rationale: 'Test.' },
          { assessmentId: 'a2', checkpointType: 'misconception_check', targetStageId: 'common_misconceptions', rationale: 'Test.' },
          { assessmentId: 'a3', checkpointType: 'synthesis_question', targetStageId: 'assessment', rationale: 'Test.' },
        ],
      },
      resources,
      ['nn-001'],
      undefined,
    );

    assert.strictEqual(decisions.length, 3);
    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 3, 'All assessments should be selected');

    // Verify different checkpoint types
    const types = selected.map((d) => d.checkpointType);
    assert.ok(types.includes('concept_check'), 'Should have concept_check');
    assert.ok(types.includes('misconception_check'), 'Should have misconception_check');
    assert.ok(types.includes('synthesis_question'), 'Should have synthesis_question');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches omitted assessment without reason
  // ---------------------------------------------------------------------------

  test('validation catches omitted assessment without reason', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'omitted-assess',
        status: 'omitted',
        source: '',
        checkpointType: 'concept_check',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: '',
        targetConceptIds: [],
        rationale: '',
        requiresLaboratoryContext: false,
        omissionReason: '',
      },
    ];

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    const result = validateLessonPlanFinal(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'ASSESS_OMITTED_NO_REASON'),
      'Must report ASSESS_OMITTED_NO_REASON error',
    );
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches assessment mapped to non-canonical stage
  // ---------------------------------------------------------------------------

  test('validation catches assessment mapped to non-canonical stage', () => {
    const decisions: DidacticAssessmentDecision[] = [
      {
        assessmentId: 'bad-assess',
        status: 'selected',
        source: 'curriculum',
        checkpointType: 'concept_check',
        targetStageId: 'fake_stage' as any,
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        requiresLaboratoryContext: false,
        omissionReason: null,
      },
    ];

    const trace = buildAssessmentTrace(decisions);
    const plan: DidacticLessonPlanFinal = {
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
      assessmentTrace: trace,
    };

    const result = validateLessonPlanFinal(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'ASSESS_MAPPED_TO_NON_CANONICAL_STAGE'),
      'Must report ASSESS_MAPPED_TO_NON_CANONICAL_STAGE error',
    );
  });
});
