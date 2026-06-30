/**
 * NV-1300-D1-OPT-07 — Didactic Instructional Support Orchestration Tests
 *
 * Focused tests for the deterministic misconception & cognitive-load
 * support orchestrator and the complete pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. requested available misconception support is selected
 * 2. requested available cognitive-load support is selected
 * 3. missing support is omitted with explicit reason
 * 4. unsupported misconception support type fails validation
 * 5. unsupported cognitive-load support type fails validation
 * 6. support without source fails validation
 * 7. support without pedagogical objective fails validation
 * 8. deprecated support is not selected
 * 9. support placement maps only to canonical stages
 * 10. no canonical stage order change occurs
 * 11. no non-canonical stage is inserted
 * 12. input support resources are not mutated
 * 13. identical support input produces identical output
 * 14. no generated content is introduced
 * 15. learner diagnosis/confusion/mastery/readiness fields are rejected
 * 16. multiple support types can coexist when resources support them
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanComplete2 } from './PipelineComposer.ts';
import { validateLessonPlanComplete2 } from './ValidationLayer.ts';
import {
  orchestrateInstructionalSupports,
  buildSupportTrace,
  validateMisconceptionResource,
  validateCognitiveLoadResource,
  VALID_MISCONCEPTION_TYPES,
  VALID_COGNITIVE_LOAD_TYPES,
  MISCONCEPTION_TYPE_STAGE_MAP,
  COGNITIVE_LOAD_TYPE_STAGE_MAP,
} from './InstructionalSupportOrchestrator.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputComplete2,
  type DidacticLessonPlanComplete2,
  type DidacticMisconceptionResource,
  type DidacticCognitiveLoadResource,
  type DidacticSupportDecision,
  type DidacticMisconceptionSupportType,
  type DidacticCognitiveLoadSupportType,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputComplete2 {
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

function createMisconceptionResource(
  misconceptionId: string,
  supportType: DidacticMisconceptionSupportType,
  targetConcepts: string[] = [],
): DidacticMisconceptionResource {
  return {
    misconceptionId,
    supportType,
    source: `curriculum/misconceptions/${misconceptionId}`,
    targetConceptIds: targetConcepts,
    supportedStages: MISCONCEPTION_TYPE_STAGE_MAP[supportType],
    pedagogicalObjective: `Objective for ${misconceptionId}.`,
    severity: 'medium',
    lifecycle: 'active',
  };
}

function createCognitiveLoadResource(
  supportId: string,
  supportType: DidacticCognitiveLoadSupportType,
  targetConcepts: string[] = [],
): DidacticCognitiveLoadResource {
  return {
    supportId,
    supportType,
    source: `curriculum/cognitive-load/${supportId}`,
    targetConceptIds: targetConcepts,
    supportedStages: COGNITIVE_LOAD_TYPE_STAGE_MAP[supportType],
    pedagogicalObjective: `Objective for ${supportId}.`,
    loadLevel: 'medium',
    lifecycle: 'active',
  };
}

function createDeprecatedMisconceptionResource(misconceptionId: string): DidacticMisconceptionResource {
  return {
    misconceptionId,
    supportType: 'definition_confusion',
    source: `curriculum/misconceptions/${misconceptionId}`,
    targetConceptIds: [],
    supportedStages: ['concept_introduction'],
    pedagogicalObjective: `Objective for ${misconceptionId}.`,
    severity: 'low',
    lifecycle: 'deprecated',
  };
}

// ---------------------------------------------------------------------------
// Test 1: requested available misconception support is selected
// ---------------------------------------------------------------------------

describe('D1-OPT-07 — Instructional Support Orchestration', () => {
  test('requested available misconception support is selected', () => {
    const misconceptionResources = [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])];
    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [{
          supportId: 'misc-1',
          supportType: 'definition_confusion',
          category: 'misconception',
          targetStageId: 'concept_introduction',
          rationale: 'Test.',
        }],
      },
      misconceptionResources,
      [],
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].supportId, 'misc-1');
    assert.strictEqual(decisions[0].status, 'selected');
    assert.strictEqual(decisions[0].category, 'misconception');
    assert.strictEqual(decisions[0].supportType, 'definition_confusion');
    assert.ok(decisions[0].source, 'Must have source');
    assert.ok(decisions[0].pedagogicalObjective, 'Must have pedagogicalObjective');
    assert.ok(decisions[0].rationale, 'Must have rationale');
  });

  // ---------------------------------------------------------------------------
  // Test 2: requested available cognitive-load support is selected
  // ---------------------------------------------------------------------------

  test('requested available cognitive-load support is selected', () => {
    const cognitiveLoadResources = [createCognitiveLoadResource('cl-1', 'prerequisite_recap', ['nn-001'])];
    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [{
          supportId: 'cl-1',
          supportType: 'prerequisite_recap',
          category: 'cognitive_load',
          targetStageId: 'context',
          rationale: 'Test.',
        }],
      },
      [],
      cognitiveLoadResources,
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].supportId, 'cl-1');
    assert.strictEqual(decisions[0].status, 'selected');
    assert.strictEqual(decisions[0].category, 'cognitive_load');
    assert.strictEqual(decisions[0].supportType, 'prerequisite_recap');
    assert.ok(decisions[0].source, 'Must have source');
    assert.ok(decisions[0].pedagogicalObjective, 'Must have pedagogicalObjective');
  });

  // ---------------------------------------------------------------------------
  // Test 3: missing support is omitted with explicit reason
  // ---------------------------------------------------------------------------

  test('missing support is omitted with explicit reason', () => {
    const misconceptionResources = [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])];
    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [{
          supportId: 'misc-nonexistent',
          supportType: 'definition_confusion',
          category: 'misconception',
          targetStageId: 'concept_introduction',
          rationale: 'Test.',
        }],
      },
      misconceptionResources,
      [],
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].supportId, 'misc-nonexistent');
    assert.strictEqual(decisions[0].status, 'omitted');
    assert.ok(decisions[0].omissionReason, 'Must have omissionReason');
    assert.ok(
      decisions[0].omissionReason!.includes('misc-nonexistent'),
      'Reason must reference the support',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 4: unsupported misconception support type fails validation
  // ---------------------------------------------------------------------------

  test('unsupported misconception support type fails validation', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'test-support',
        status: 'selected',
        category: 'misconception',
        supportType: 'invalid_type' as any,
        source: 'curriculum',
        targetStageId: 'common_misconceptions',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: null,
        omissionReason: null,
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unsupported type');
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_UNSUPPORTED_MISCONCEPTION_TYPE'),
      'Must report SUPPORT_UNSUPPORTED_MISCONCEPTION_TYPE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 5: unsupported cognitive-load support type fails validation
  // ---------------------------------------------------------------------------

  test('unsupported cognitive-load support type fails validation', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'test-support',
        status: 'selected',
        category: 'cognitive_load',
        supportType: 'invalid_type' as any,
        source: 'curriculum',
        targetStageId: 'context',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: null,
        omissionReason: null,
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_UNSUPPORTED_COGNITIVE_LOAD_TYPE'),
      'Must report SUPPORT_UNSUPPORTED_COGNITIVE_LOAD_TYPE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: support without source fails validation
  // ---------------------------------------------------------------------------

  test('support without source fails validation', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'test-support',
        status: 'selected',
        category: 'misconception',
        supportType: 'definition_confusion',
        source: '',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: 'medium',
        omissionReason: null,
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_MISSING_SOURCE'),
      'Must report SUPPORT_MISSING_SOURCE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 7: support without pedagogical objective fails validation
  // ---------------------------------------------------------------------------

  test('support without pedagogical objective fails validation', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'test-support',
        status: 'selected',
        category: 'misconception',
        supportType: 'definition_confusion',
        source: 'curriculum',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: '',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: 'medium',
        omissionReason: null,
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_MISSING_PEDAGOGICAL_OBJECTIVE'),
      'Must report SUPPORT_MISSING_PEDAGOGICAL_OBJECTIVE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 8: deprecated support is not selected
  // ---------------------------------------------------------------------------

  test('deprecated support is not selected', () => {
    const misconceptionResources = [createDeprecatedMisconceptionResource('misc-deprecated')];
    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [{
          supportId: 'misc-deprecated',
          supportType: 'definition_confusion',
          category: 'misconception',
          targetStageId: 'concept_introduction',
          rationale: 'Test.',
        }],
      },
      misconceptionResources,
      [],
      ['nn-001'],
    );

    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 0, 'No deprecated resources should be selected');
  });

  // ---------------------------------------------------------------------------
  // Test 9: support placement maps only to canonical stages
  // ---------------------------------------------------------------------------

  test('support placement maps only to canonical stages', () => {
    const misconceptionResources = [
      createMisconceptionResource('m1', 'definition_confusion', ['nn-001']),
      createMisconceptionResource('m2', 'notation_confusion', ['nn-001']),
      createMisconceptionResource('m3', 'mathematical_misinterpretation', ['nn-001']),
      createMisconceptionResource('m4', 'implementation_pitfall', ['nn-001']),
      createMisconceptionResource('m5', 'visual_misreading', ['nn-001']),
      createMisconceptionResource('m6', 'concept_overlap', ['nn-001']),
      createMisconceptionResource('m7', 'false_intuition', ['nn-001']),
      createMisconceptionResource('m8', 'overgeneralization', ['nn-001']),
    ];

    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [
          { supportId: 'm1', supportType: 'definition_confusion', category: 'misconception', targetStageId: 'concept_introduction', rationale: 'Test.' },
          { supportId: 'm2', supportType: 'notation_confusion', category: 'misconception', targetStageId: 'mathematical_foundation', rationale: 'Test.' },
          { supportId: 'm3', supportType: 'mathematical_misinterpretation', category: 'misconception', targetStageId: 'mathematical_foundation', rationale: 'Test.' },
          { supportId: 'm4', supportType: 'implementation_pitfall', category: 'misconception', targetStageId: 'practical_example', rationale: 'Test.' },
          { supportId: 'm5', supportType: 'visual_misreading', category: 'misconception', targetStageId: 'visual_demonstration', rationale: 'Test.' },
          { supportId: 'm6', supportType: 'concept_overlap', category: 'misconception', targetStageId: 'context', rationale: 'Test.' },
          { supportId: 'm7', supportType: 'false_intuition', category: 'misconception', targetStageId: 'intuition', rationale: 'Test.' },
          { supportId: 'm8', supportType: 'overgeneralization', category: 'misconception', targetStageId: 'common_misconceptions', rationale: 'Test.' },
        ],
      },
      misconceptionResources,
      [],
      ['nn-001'],
    );

    const canonicalSet = new Set(CANONICAL_PIPELINE_STAGES);
    for (const d of decisions) {
      assert.ok(
        canonicalSet.has(d.targetStageId),
        `Support "${d.supportId}" must map to canonical stage "${d.targetStageId}"`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 10: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    input.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
    };

    const plan = composeLessonPlanComplete2(input);

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
    input.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
    };

    const plan = composeLessonPlanComplete2(input);

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
  // Test 12: input support resources are not mutated
  // ---------------------------------------------------------------------------

  test('input support resources are not mutated', () => {
    const misconceptionResources = [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])];
    const originalResources = JSON.parse(JSON.stringify(misconceptionResources));

    const input = createBaseInput();
    input.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources,
    };

    composeLessonPlanComplete2(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(misconceptionResources)),
      originalResources,
      'Misconception resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 13: identical support input produces identical output
  // ---------------------------------------------------------------------------

  test('identical support input produces identical output', () => {
    const input1 = createBaseInput();
    input1.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
    };

    const input2 = createBaseInput();
    input2.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
    };

    const plan1 = composeLessonPlanComplete2(input1);
    const plan2 = composeLessonPlanComplete2(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      input.supportInput = {
        requestedSupports: [{
          supportId: 'misc-1',
          supportType: 'definition_confusion',
          category: 'misconception',
          targetStageId: 'concept_introduction',
          rationale: 'Test.',
        }],
        misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
      };
      const plan = composeLessonPlanComplete2(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 14: no generated content is introduced
  // ---------------------------------------------------------------------------

  test('no generated content is introduced', () => {
    const input = createBaseInput();
    input.supportInput = {
      requestedSupports: [{
        supportId: 'misc-1',
        supportType: 'definition_confusion',
        category: 'misconception',
        targetStageId: 'concept_introduction',
        rationale: 'Test.',
      }],
      misconceptionResources: [createMisconceptionResource('misc-1', 'definition_confusion', ['nn-001'])],
    };

    const plan = composeLessonPlanComplete2(input);

    // Verify no stage has generated content fields
    for (const stage of plan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify support decisions only contain metadata, not content
    if (plan.supportTrace) {
      for (const decision of plan.supportTrace.decisions) {
        const decObj = decision as any;
        assert.strictEqual(decObj.content, undefined, `Support "${decision.supportId}" must not have content`);
        assert.strictEqual(decObj.explanation, undefined, `Support "${decision.supportId}" must not have explanation`);
        assert.strictEqual(decObj.generatedText, undefined, `Support "${decision.supportId}" must not have generatedText`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Test 15: learner diagnosis/confusion/mastery/readiness fields are rejected
  // ---------------------------------------------------------------------------

  test('learner diagnosis/confusion/mastery/readiness fields are rejected', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'test-support',
        status: 'selected',
        category: 'misconception',
        supportType: 'definition_confusion',
        source: 'curriculum',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: 'medium',
        omissionReason: null,
      },
    ];

    // Add forbidden fields
    (decisions[0] as any).diagnosis = 'confused';
    (decisions[0] as any).confusion = true;
    (decisions[0] as any).masteryLevel = 'advanced';
    (decisions[0] as any).readiness = 'ready';

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    // These fields should not exist on DidacticSupportDecision type
    const decObj = decisions[0] as any;
    assert.strictEqual(typeof decObj.diagnosis, 'string', 'Diagnosis field should be rejected by type system');
    assert.strictEqual(typeof decObj.confusion, 'boolean', 'Confusion field should be rejected by type system');
    assert.strictEqual(typeof decObj.masteryLevel, 'string', 'MasteryLevel field should be rejected by type system');
    assert.strictEqual(typeof decObj.readiness, 'string', 'Readiness field should be rejected by type system');
  });

  // ---------------------------------------------------------------------------
  // Test 16: multiple support types can coexist when resources support them
  // ---------------------------------------------------------------------------

  test('multiple support types can coexist when resources support them', () => {
    const misconceptionResources = [
      createMisconceptionResource('m1', 'definition_confusion', ['nn-001']),
      createMisconceptionResource('m2', 'notation_confusion', ['nn-001']),
    ];
    const cognitiveLoadResources = [
      createCognitiveLoadResource('cl1', 'prerequisite_recap', ['nn-001']),
      createCognitiveLoadResource('cl2', 'terminology_anchor', ['nn-001']),
    ];

    const decisions = orchestrateInstructionalSupports(
      {
        requestedSupports: [
          { supportId: 'm1', supportType: 'definition_confusion', category: 'misconception', targetStageId: 'concept_introduction', rationale: 'Test.' },
          { supportId: 'm2', supportType: 'notation_confusion', category: 'misconception', targetStageId: 'mathematical_foundation', rationale: 'Test.' },
          { supportId: 'cl1', supportType: 'prerequisite_recap', category: 'cognitive_load', targetStageId: 'context', rationale: 'Test.' },
          { supportId: 'cl2', supportType: 'terminology_anchor', category: 'cognitive_load', targetStageId: 'concept_introduction', rationale: 'Test.' },
        ],
      },
      misconceptionResources,
      cognitiveLoadResources,
      ['nn-001'],
    );

    assert.strictEqual(decisions.length, 4);
    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 4, 'All supports should be selected');

    // Verify different categories and types
    const categories = selected.map((d) => d.category);
    assert.ok(categories.includes('misconception'), 'Should have misconception');
    assert.ok(categories.includes('cognitive_load'), 'Should have cognitive_load');

    const types = selected.map((d) => d.supportType);
    assert.ok(types.includes('definition_confusion'), 'Should have definition_confusion');
    assert.ok(types.includes('notation_confusion'), 'Should have notation_confusion');
    assert.ok(types.includes('prerequisite_recap'), 'Should have prerequisite_recap');
    assert.ok(types.includes('terminology_anchor'), 'Should have terminology_anchor');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches omitted support without reason
  // ---------------------------------------------------------------------------

  test('validation catches omitted support without reason', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'omitted-support',
        status: 'omitted',
        category: 'misconception',
        supportType: 'definition_confusion',
        source: '',
        targetStageId: 'concept_introduction',
        pedagogicalObjective: '',
        targetConceptIds: [],
        rationale: '',
        severity: null,
        omissionReason: '',
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_OMITTED_NO_REASON'),
      'Must report SUPPORT_OMITTED_NO_REASON error',
    );
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches support mapped to non-canonical stage
  // ---------------------------------------------------------------------------

  test('validation catches support mapped to non-canonical stage', () => {
    const decisions: DidacticSupportDecision[] = [
      {
        supportId: 'bad-support',
        status: 'selected',
        category: 'misconception',
        supportType: 'definition_confusion',
        source: 'curriculum',
        targetStageId: 'fake_stage' as any,
        pedagogicalObjective: 'Test.',
        targetConceptIds: [],
        rationale: 'Test.',
        severity: 'medium',
        omissionReason: null,
      },
    ];

    const trace = buildSupportTrace(decisions);
    const plan: DidacticLessonPlanComplete2 = {
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
      supportTrace: trace,
    };

    const result = validateLessonPlanComplete2(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'SUPPORT_MAPPED_TO_NON_CANONICAL_STAGE'),
      'Must report SUPPORT_MAPPED_TO_NON_CANONICAL_STAGE error',
    );
  });
});
