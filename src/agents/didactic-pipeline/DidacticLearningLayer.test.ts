/**
 * NV-1300-D1-OPT-04 — Didactic Learning Layer Orchestration Tests
 *
 * Focused tests for the deterministic learning layer orchestrator and
 * layer-aware pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. overview selects only first 3 available canonical layers
 * 2. standard selects layers 1–7 when available
 * 3. deep selects layers 1–9 when available
 * 4. full selects all 10 available layers
 * 5. missing requested layer is omitted with explicit reason
 * 6. unsupported depth mode fails validation
 * 7. unsupported layer fails validation
 * 8. selected layer without source fails validation
 * 9. layer without pedagogical purpose fails validation
 * 10. no canonical stage order change occurs
 * 11. no non-canonical stage is inserted
 * 12. input layer resources are not mutated
 * 13. identical layer input produces identical output
 * 14. no generated educational text is introduced
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanComplete } from './PipelineComposer.ts';
import { validateLessonPlanComplete } from './ValidationLayer.ts';
import {
  orchestrateLearningLayers,
  buildLayerTrace,
  validateLearningLayerResource,
  getCanonicalLearningLayers,
  VALID_LEARNING_LAYERS,
  DEPTH_MODE_LAYER_COUNT,
} from './LearningLayerOrchestrator.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputComplete,
  type DidacticLessonPlanComplete,
  type DidacticLearningLayerResource,
  type DidacticLearningLayerDecision,
  type DidacticLearningLayer,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputComplete {
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

function createAllLayerResources(): DidacticLearningLayerResource[] {
  const layers = getCanonicalLearningLayers();
  return layers.map((layer) => ({
    layer,
    resourceId: `resource-${layer}`,
    source: `curriculum/layers/${layer}`,
    supportedStages: ['guided_explanation', 'practical_example'],
    pedagogicalPurpose: `Pedagogical purpose for ${layer}.`,
    depthModeSupport: ['overview', 'standard', 'deep', 'full'] as const,
    lifecycle: 'active' as const,
  }));
}

function createLayerResource(layer: DidacticLearningLayer): DidacticLearningLayerResource {
  return {
    layer,
    resourceId: `resource-${layer}`,
    source: `curriculum/layers/${layer}`,
    supportedStages: ['guided_explanation', 'practical_example'],
    pedagogicalPurpose: `Pedagogical purpose for ${layer}.`,
    depthModeSupport: ['overview', 'standard', 'deep', 'full'] as const,
    lifecycle: 'active' as const,
  };
}

// ---------------------------------------------------------------------------
// Test 1: overview selects only first 3 available canonical layers
// ---------------------------------------------------------------------------

describe('D1-OPT-04 — Learning Layer Orchestration', () => {
  test('overview selects only first 3 available canonical layers', () => {
    const resources = createAllLayerResources();
    const decisions = orchestrateLearningLayers('overview', undefined, resources);

    assert.strictEqual(decisions.length, 3, 'Overview must select exactly 3 layers');
    const layers = getCanonicalLearningLayers();

    for (let i = 0; i < 3; i++) {
      assert.strictEqual(decisions[i].layer, layers[i], `Layer ${i} must be ${layers[i]}`);
      assert.strictEqual(decisions[i].status, 'selected');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 2: standard selects layers 1–7 when available
  // ---------------------------------------------------------------------------

  test('standard selects layers 1–7 when available', () => {
    const resources = createAllLayerResources();
    const decisions = orchestrateLearningLayers('standard', undefined, resources);

    assert.strictEqual(decisions.length, 7, 'Standard must select exactly 7 layers');
    const layers = getCanonicalLearningLayers();

    for (let i = 0; i < 7; i++) {
      assert.strictEqual(decisions[i].layer, layers[i], `Layer ${i} must be ${layers[i]}`);
      assert.strictEqual(decisions[i].status, 'selected');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 3: deep selects layers 1–9 when available
  // ---------------------------------------------------------------------------

  test('deep selects layers 1–9 when available', () => {
    const resources = createAllLayerResources();
    const decisions = orchestrateLearningLayers('deep', undefined, resources);

    assert.strictEqual(decisions.length, 9, 'Deep must select exactly 9 layers');
    const layers = getCanonicalLearningLayers();

    for (let i = 0; i < 9; i++) {
      assert.strictEqual(decisions[i].layer, layers[i], `Layer ${i} must be ${layers[i]}`);
      assert.strictEqual(decisions[i].status, 'selected');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 4: full selects all 10 available layers
  // ---------------------------------------------------------------------------

  test('full selects all 10 available layers', () => {
    const resources = createAllLayerResources();
    const decisions = orchestrateLearningLayers('full', undefined, resources);

    assert.strictEqual(decisions.length, 10, 'Full must select exactly 10 layers');
    const layers = getCanonicalLearningLayers();

    for (let i = 0; i < 10; i++) {
      assert.strictEqual(decisions[i].layer, layers[i], `Layer ${i} must be ${layers[i]}`);
      assert.strictEqual(decisions[i].status, 'selected');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 5: missing requested layer is omitted with explicit reason
  // ---------------------------------------------------------------------------

  test('missing requested layer is omitted with explicit reason', () => {
    const resources = [createLayerResource('problem_or_motivation')];
    const decisions = orchestrateLearningLayers(
      'full',
      ['problem_or_motivation', 'mathematical_formalization'],
      resources,
    );

    assert.strictEqual(decisions.length, 2);
    assert.strictEqual(decisions[0].status, 'selected');
    assert.strictEqual(decisions[1].status, 'omitted');
    assert.ok(decisions[1].omissionReason, 'Must have omissionReason');
    assert.ok(
      decisions[1].omissionReason!.includes('mathematical_formalization'),
      'Reason must reference the layer',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: unsupported depth mode fails validation
  // ---------------------------------------------------------------------------

  test('unsupported depth mode fails validation', () => {
    const trace = buildLayerTrace('invalid_mode' as any, []);
    const plan: DidacticLessonPlanComplete = {
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
      learningLayerTrace: trace,
    };

    const result = validateLessonPlanComplete(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unsupported depth mode');
    assert.ok(
      result.errors.some((e) => e.code === 'LAYER_UNSUPPORTED_DEPTH_MODE'),
      'Must report LAYER_UNSUPPORTED_DEPTH_MODE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 7: unsupported layer fails validation
  // ---------------------------------------------------------------------------

  test('unsupported layer fails validation', () => {
    const decisions: DidacticLearningLayerDecision[] = [
      {
        layer: 'invalid_layer' as any,
        status: 'selected',
        resourceId: 'test',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        mappedStages: ['guided_explanation'],
        omissionReason: null,
      },
    ];

    const trace = buildLayerTrace('standard', decisions);
    const plan: DidacticLessonPlanComplete = {
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
      learningLayerTrace: trace,
    };

    const result = validateLessonPlanComplete(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAYER_UNSUPPORTED'),
      'Must report LAYER_UNSUPPORTED error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 8: selected layer without source fails validation
  // ---------------------------------------------------------------------------

  test('selected layer without source fails validation', () => {
    const decisions: DidacticLearningLayerDecision[] = [
      {
        layer: 'problem_or_motivation',
        status: 'selected',
        resourceId: 'test',
        source: '',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        mappedStages: ['motivation'],
        omissionReason: null,
      },
    ];

    const trace = buildLayerTrace('standard', decisions);
    const plan: DidacticLessonPlanComplete = {
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
      learningLayerTrace: trace,
    };

    const result = validateLessonPlanComplete(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAYER_MISSING_SOURCE'),
      'Must report LAYER_MISSING_SOURCE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 9: layer without pedagogical purpose fails validation
  // ---------------------------------------------------------------------------

  test('layer without pedagogical purpose fails validation', () => {
    const decisions: DidacticLearningLayerDecision[] = [
      {
        layer: 'problem_or_motivation',
        status: 'selected',
        resourceId: 'test',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: '',
        mappedStages: ['motivation'],
        omissionReason: null,
      },
    ];

    const trace = buildLayerTrace('standard', decisions);
    const plan: DidacticLessonPlanComplete = {
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
      learningLayerTrace: trace,
    };

    const result = validateLessonPlanComplete(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAYER_MISSING_PEDAGOGICAL_PURPOSE'),
      'Must report LAYER_MISSING_PEDAGOGICAL_PURPOSE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 10: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    input.layerInput = {
      depthMode: 'full',
      layerResources: createAllLayerResources(),
    };

    const plan = composeLessonPlanComplete(input);

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
    input.layerInput = {
      depthMode: 'full',
      layerResources: createAllLayerResources(),
    };

    const plan = composeLessonPlanComplete(input);

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
  // Test 12: input layer resources are not mutated
  // ---------------------------------------------------------------------------

  test('input layer resources are not mutated', () => {
    const layerResources = createAllLayerResources();
    const originalResources = JSON.parse(JSON.stringify(layerResources));

    const input = createBaseInput();
    input.layerInput = {
      depthMode: 'full',
      layerResources,
    };

    composeLessonPlanComplete(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(layerResources)),
      originalResources,
      'Layer resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 13: identical layer input produces identical output
  // ---------------------------------------------------------------------------

  test('identical layer input produces identical output', () => {
    const input1 = createBaseInput();
    input1.layerInput = {
      depthMode: 'standard',
      layerResources: createAllLayerResources(),
    };

    const input2 = createBaseInput();
    input2.layerInput = {
      depthMode: 'standard',
      layerResources: createAllLayerResources(),
    };

    const plan1 = composeLessonPlanComplete(input1);
    const plan2 = composeLessonPlanComplete(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      input.layerInput = {
        depthMode: 'standard',
        layerResources: createAllLayerResources(),
      };
      const plan = composeLessonPlanComplete(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 14: no generated educational text is introduced
  // ---------------------------------------------------------------------------

  test('no generated educational text is introduced', () => {
    const input = createBaseInput();
    input.layerInput = {
      depthMode: 'full',
      layerResources: createAllLayerResources(),
    };

    const plan = composeLessonPlanComplete(input);

    // Verify no stage has generated content fields
    for (const stage of plan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify layer decisions only contain metadata, not content
    if (plan.learningLayerTrace) {
      for (const decision of plan.learningLayerTrace.decisions) {
        const decObj = decision as any;
        assert.strictEqual(decObj.content, undefined, `Layer "${decision.layer}" must not have content`);
        assert.strictEqual(decObj.explanation, undefined, `Layer "${decision.layer}" must not have explanation`);
        assert.strictEqual(decObj.generatedText, undefined, `Layer "${decision.layer}" must not have generatedText`);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // Additional: deprecated layer resource is not selected
  // ---------------------------------------------------------------------------

  test('deprecated layer resource is not selected', () => {
    const resources: DidacticLearningLayerResource[] = [{
      layer: 'problem_or_motivation',
      resourceId: 'deprecated-resource',
      source: 'curriculum/layers/motivation',
      supportedStages: ['motivation'],
      pedagogicalPurpose: 'Test.',
      depthModeSupport: ['overview', 'standard', 'deep', 'full'],
      lifecycle: 'deprecated',
    }];

    const decisions = orchestrateLearningLayers('overview', undefined, resources);

    // Should have 3 decisions for overview, but none selected (deprecated)
    const selected = decisions.filter((d) => d.status === 'selected');
    assert.strictEqual(selected.length, 0, 'No deprecated resources should be selected');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches omitted layer without reason
  // ---------------------------------------------------------------------------

  test('validation catches omitted layer without reason', () => {
    const decisions: DidacticLearningLayerDecision[] = [
      {
        layer: 'problem_or_motivation',
        status: 'omitted',
        resourceId: null,
        source: '',
        supportedStages: [],
        pedagogicalPurpose: '',
        mappedStages: [],
        omissionReason: '',
      },
    ];

    const trace = buildLayerTrace('standard', decisions);
    const plan: DidacticLessonPlanComplete = {
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
      learningLayerTrace: trace,
    };

    const result = validateLessonPlanComplete(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'LAYER_OMITTED_NO_REASON'),
      'Must report LAYER_OMITTED_NO_REASON error',
    );
  });
});
