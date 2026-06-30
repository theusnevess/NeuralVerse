/**
 * NV-1300-D1-OPT-03 — Didactic Explanation Style Orchestration Tests
 *
 * Focused tests for the deterministic explanation style selector and
 * style-aware pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. requested available style is selected
 * 2. requested missing style is omitted with explicit reason
 * 3. default style priority is deterministic
 * 4. multiple styles coexist in one lesson plan
 * 5. unsupported style fails validation
 * 6. style without source fails validation
 * 7. style without pedagogical purpose fails validation
 * 8. no canonical stage order change occurs
 * 9. no non-canonical stage is inserted
 * 10. input style resources are not mutated
 * 11. identical style input produces identical output
 * 12. no generated explanation text is introduced
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanWithStyles, composeLessonPlanFull } from './PipelineComposer.ts';
import { validateLessonPlanWithStyles, validateLessonPlanFull } from './ValidationLayer.ts';
import {
  selectExplanationStyles,
  buildStyleTrace,
  validateStyleResource,
  VALID_EXPLANATION_STYLES,
  DEFAULT_STYLE_PRIORITY,
} from './ExplanationStyleSelector.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputWithStyles,
  type DidacticLessonPlanWithStyles,
  type DidacticLessonInputFull,
  type DidacticLessonPlanFull,
  type DidacticStyleResource,
  type DidacticStyleDecision,
  type DidacticExplanationStyle,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputWithStyles {
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

function createIntuitiveStyleResource(): DidacticStyleResource {
  return {
    style: 'intuitive',
    resourceId: 'style-intuitive-1',
    source: 'curriculum/styles/intuitive',
    supportedStages: ['context', 'guided_explanation', 'practical_example'],
    pedagogicalPurpose: 'Build intuition through accessible explanations.',
    lifecycle: 'active',
  };
}

function createVisualStyleResource(): DidacticStyleResource {
  return {
    style: 'visual',
    resourceId: 'style-visual-1',
    source: 'curriculum/styles/visual',
    supportedStages: ['visual_demonstration', 'guided_explanation'],
    pedagogicalPurpose: 'Provide spatial and parametric visual understanding.',
    lifecycle: 'active',
  };
}

function createMathStyleResource(): DidacticStyleResource {
  return {
    style: 'mathematical',
    resourceId: 'style-math-1',
    source: 'curriculum/styles/mathematical',
    supportedStages: ['mathematical_foundation', 'guided_explanation'],
    pedagogicalPurpose: 'Present formal definitions and derivations.',
    lifecycle: 'active',
  };
}

function createEngineeringStyleResource(): DidacticStyleResource {
  return {
    style: 'engineering_oriented',
    resourceId: 'style-eng-1',
    source: 'curriculum/styles/engineering',
    supportedStages: ['practical_example', 'guided_explanation'],
    pedagogicalPurpose: 'Focus on implementation patterns and trade-offs.',
    lifecycle: 'active',
  };
}

function createDeprecatedStyleResource(): DidacticStyleResource {
  return {
    style: 'historical',
    resourceId: 'style-hist-1',
    source: 'curriculum/styles/historical',
    supportedStages: ['context', 'guided_explanation'],
    pedagogicalPurpose: 'Provide historical context.',
    lifecycle: 'deprecated',
  };
}

// ---------------------------------------------------------------------------
// Test 1: requested available style is selected
// ---------------------------------------------------------------------------

describe('D1-OPT-03 — Explanation Style Orchestration', () => {
  test('requested available style is selected', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['intuitive'],
      styleResources: [createIntuitiveStyleResource()],
    };

    const plan = composeLessonPlanWithStyles(input);

    assert.ok(plan.styleTrace, 'styleTrace must be present');
    assert.strictEqual(plan.styleTrace.stylesSelected, 1);
    assert.strictEqual(plan.styleTrace.stylesOmitted, 0);
    assert.strictEqual(plan.styleTrace.decisions.length, 1);
    assert.strictEqual(plan.styleTrace.decisions[0].style, 'intuitive');
    assert.strictEqual(plan.styleTrace.decisions[0].status, 'selected');
    assert.strictEqual(plan.styleTrace.decisions[0].resourceId, 'style-intuitive-1');
    assert.ok(plan.styleTrace.decisions[0].source, 'Must have source');
    assert.ok(plan.styleTrace.decisions[0].pedagogicalPurpose, 'Must have pedagogicalPurpose');
  });

  // ---------------------------------------------------------------------------
  // Test 2: requested missing style is omitted with explicit reason
  // ---------------------------------------------------------------------------

  test('requested missing style is omitted with explicit reason', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['research_oriented'],
      styleResources: [createIntuitiveStyleResource()],
    };

    const plan = composeLessonPlanWithStyles(input);

    assert.ok(plan.styleTrace, 'styleTrace must be present');
    assert.strictEqual(plan.styleTrace.stylesSelected, 0);
    assert.strictEqual(plan.styleTrace.stylesOmitted, 1);
    assert.strictEqual(plan.styleTrace.decisions[0].style, 'research_oriented');
    assert.strictEqual(plan.styleTrace.decisions[0].status, 'omitted');
    assert.ok(plan.styleTrace.decisions[0].omissionReason, 'Must have omissionReason');
    assert.ok(
      plan.styleTrace.decisions[0].omissionReason!.includes('research_oriented'),
      'Reason must reference the style',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 3: default style priority is deterministic
  // ---------------------------------------------------------------------------

  test('default style priority is deterministic', () => {
    // Verify DEFAULT_STYLE_PRIORITY is fixed
    assert.deepStrictEqual(DEFAULT_STYLE_PRIORITY, [
      'intuitive',
      'visual',
      'engineering_oriented',
      'mathematical',
    ]);

    // When no styles requested, first available from priority is selected
    const input = createBaseInput();
    input.styleInput = {
      styleResources: [
        createVisualStyleResource(),
        createMathStyleResource(),
        createIntuitiveStyleResource(),
      ],
    };

    const plan1 = composeLessonPlanWithStyles(input);
    const plan2 = composeLessonPlanWithStyles(input);

    // Both should select 'intuitive' (first in priority)
    assert.strictEqual(plan1.styleTrace!.decisions[0].style, 'intuitive');
    assert.strictEqual(plan1.styleTrace!.decisions[0].status, 'selected');
    assert.strictEqual(plan2.styleTrace!.decisions[0].style, 'intuitive');
    assert.strictEqual(plan2.styleTrace!.decisions[0].status, 'selected');

    // Run 20 iterations to confirm determinism
    for (let i = 0; i < 20; i++) {
      const plan = composeLessonPlanWithStyles(input);
      assert.strictEqual(plan.styleTrace!.decisions[0].style, 'intuitive');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 4: multiple styles coexist in one lesson plan
  // ---------------------------------------------------------------------------

  test('multiple styles coexist in one lesson plan', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['intuitive', 'visual', 'mathematical'],
      styleResources: [
        createIntuitiveStyleResource(),
        createVisualStyleResource(),
        createMathStyleResource(),
      ],
    };

    const plan = composeLessonPlanWithStyles(input);

    assert.ok(plan.styleTrace, 'styleTrace must be present');
    assert.strictEqual(plan.styleTrace.stylesSelected, 3);
    assert.strictEqual(plan.styleTrace.stylesOmitted, 0);
    assert.strictEqual(plan.styleTrace.decisions.length, 3);

    const selectedStyles = plan.styleTrace.decisions
      .filter((d) => d.status === 'selected')
      .map((d) => d.style);
    assert.deepStrictEqual(selectedStyles, ['intuitive', 'visual', 'mathematical']);
  });

  // ---------------------------------------------------------------------------
  // Test 5: unsupported style fails validation
  // ---------------------------------------------------------------------------

  test('unsupported style fails validation', () => {
    const decisions: DidacticStyleDecision[] = [
      {
        style: 'invalid_style' as any,
        status: 'selected',
        resourceId: 'test',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildStyleTrace(decisions);
    const plan: DidacticLessonPlanWithStyles = {
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
      styleTrace: trace,
    };

    const result = validateLessonPlanWithStyles(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unsupported style');
    assert.ok(
      result.errors.some((e) => e.code === 'STYLE_UNSUPPORTED'),
      'Must report STYLE_UNSUPPORTED error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: style without source fails validation
  // ---------------------------------------------------------------------------

  test('style without source fails validation', () => {
    const decisions: DidacticStyleDecision[] = [
      {
        style: 'intuitive',
        status: 'selected',
        resourceId: 'test',
        source: '',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildStyleTrace(decisions);
    const plan: DidacticLessonPlanWithStyles = {
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
      styleTrace: trace,
    };

    const result = validateLessonPlanWithStyles(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'STYLE_MISSING_SOURCE'),
      'Must report STYLE_MISSING_SOURCE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 7: style without pedagogical purpose fails validation
  // ---------------------------------------------------------------------------

  test('style without pedagogical purpose fails validation', () => {
    const decisions: DidacticStyleDecision[] = [
      {
        style: 'intuitive',
        status: 'selected',
        resourceId: 'test',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: '',
        omissionReason: null,
      },
    ];

    const trace = buildStyleTrace(decisions);
    const plan: DidacticLessonPlanWithStyles = {
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
      styleTrace: trace,
    };

    const result = validateLessonPlanWithStyles(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'STYLE_MISSING_PEDAGOGICAL_PURPOSE'),
      'Must report STYLE_MISSING_PEDAGOGICAL_PURPOSE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 8: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['intuitive', 'visual'],
      styleResources: [createIntuitiveStyleResource(), createVisualStyleResource()],
    };

    const plan = composeLessonPlanWithStyles(input);

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
    input.styleInput = {
      requestedStyles: ['intuitive', 'visual', 'mathematical', 'engineering_oriented'],
      styleResources: [
        createIntuitiveStyleResource(),
        createVisualStyleResource(),
        createMathStyleResource(),
        createEngineeringStyleResource(),
      ],
    };

    const plan = composeLessonPlanWithStyles(input);

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
  // Test 10: input style resources are not mutated
  // ---------------------------------------------------------------------------

  test('input style resources are not mutated', () => {
    const styleResources = [
      createIntuitiveStyleResource(),
      createVisualStyleResource(),
    ];
    const originalResources = JSON.parse(JSON.stringify(styleResources));

    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['intuitive', 'visual'],
      styleResources,
    };

    composeLessonPlanWithStyles(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(styleResources)),
      originalResources,
      'Style resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 11: identical style input produces identical output
  // ---------------------------------------------------------------------------

  test('identical style input produces identical output', () => {
    const input1 = createBaseInput();
    input1.styleInput = {
      requestedStyles: ['intuitive', 'visual'],
      styleResources: [createIntuitiveStyleResource(), createVisualStyleResource()],
    };

    const input2 = createBaseInput();
    input2.styleInput = {
      requestedStyles: ['intuitive', 'visual'],
      styleResources: [createIntuitiveStyleResource(), createVisualStyleResource()],
    };

    const plan1 = composeLessonPlanWithStyles(input1);
    const plan2 = composeLessonPlanWithStyles(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      input.styleInput = {
        requestedStyles: ['intuitive', 'visual'],
        styleResources: [createIntuitiveStyleResource(), createVisualStyleResource()],
      };
      const plan = composeLessonPlanWithStyles(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 12: no generated explanation text is introduced
  // ---------------------------------------------------------------------------

  test('no generated explanation text is introduced', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['intuitive', 'visual', 'mathematical'],
      styleResources: [
        createIntuitiveStyleResource(),
        createVisualStyleResource(),
        createMathStyleResource(),
      ],
    };

    const plan = composeLessonPlanWithStyles(input);

    // Verify no stage has generated content fields
    for (const stage of plan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify style decisions only contain metadata, not content
    for (const decision of plan.styleTrace!.decisions) {
      const decObj = decision as any;
      assert.strictEqual(decObj.content, undefined, `Style "${decision.style}" must not have content`);
      assert.strictEqual(decObj.explanation, undefined, `Style "${decision.style}" must not have explanation`);
      assert.strictEqual(decObj.generatedText, undefined, `Style "${decision.style}" must not have generatedText`);
    }
  });

  // ---------------------------------------------------------------------------
  // Additional: deprecated style resource is not selected
  // ---------------------------------------------------------------------------

  test('deprecated style resource is not selected', () => {
    const input = createBaseInput();
    input.styleInput = {
      requestedStyles: ['historical'],
      styleResources: [createDeprecatedStyleResource()],
    };

    const plan = composeLessonPlanWithStyles(input);

    assert.ok(plan.styleTrace, 'styleTrace must be present');
    assert.strictEqual(plan.styleTrace.stylesOmitted, 1);
    assert.strictEqual(plan.styleTrace.decisions[0].status, 'omitted');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches omitted style without reason
  // ---------------------------------------------------------------------------

  test('validation catches omitted style without reason', () => {
    const decisions: DidacticStyleDecision[] = [
      {
        style: 'intuitive',
        status: 'omitted',
        resourceId: null,
        source: '',
        supportedStages: [],
        pedagogicalPurpose: '',
        omissionReason: '',
      },
    ];

    const trace = buildStyleTrace(decisions);
    const plan: DidacticLessonPlanWithStyles = {
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
      styleTrace: trace,
    };

    const result = validateLessonPlanWithStyles(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'STYLE_OMITTED_NO_REASON'),
      'Must report STYLE_OMITTED_NO_REASON error',
    );
  });

  // ---------------------------------------------------------------------------
  // Additional: duplicate style decision fails validation
  // ---------------------------------------------------------------------------

  test('duplicate style decision fails validation', () => {
    const decisions: DidacticStyleDecision[] = [
      {
        style: 'intuitive',
        status: 'selected',
        resourceId: 'test-1',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        omissionReason: null,
      },
      {
        style: 'intuitive',
        status: 'selected',
        resourceId: 'test-2',
        source: 'curriculum',
        supportedStages: ['guided_explanation'],
        pedagogicalPurpose: 'Test.',
        omissionReason: null,
      },
    ];

    const trace = buildStyleTrace(decisions);
    const plan: DidacticLessonPlanWithStyles = {
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
      styleTrace: trace,
    };

    const result = validateLessonPlanWithStyles(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'STYLE_DUPLICATE_DECISION'),
      'Must report STYLE_DUPLICATE_DECISION error',
    );
  });
});
