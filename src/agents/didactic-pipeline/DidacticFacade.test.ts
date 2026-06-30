/**
 * NV-1300-D1-OPT-09 — Didactic Pipeline Facade Tests
 *
 * Focused tests for the deterministic public facade API.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. composeDidacticLessonPlan returns canonical final lesson plan
 * 2. certifyDidacticLessonPlan returns certification report
 * 3. composeAndCertifyDidacticLessonPlan returns both plan and report
 * 4. legacy composer aliases remain callable
 * 5. facade does not mutate input
 * 6. identical facade input produces identical output
 * 7. canonical stage order remains unchanged
 * 8. facade output validation rejects missing lessonPlan
 * 9. facade output validation rejects missing certificationReport
 * 10. no generated content is introduced
 * 11. no learner inference fields are present
 * 12. index exports facade and legacy aliases without conflicts
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  composeDidacticLessonPlan,
  certifyDidacticLessonPlan,
  composeAndCertifyDidacticLessonPlan,
  type DidacticFacadeLessonPlanOutput,
  type DidacticFacadeCertificationOutput,
  type DidacticFacadeCompleteOutput,
} from './DidacticPipelineFacade.ts';
import {
  validateFacadeLessonPlanOutput,
  validateFacadeCertificationOutput,
  validateFacadeCompleteOutput,
} from './ValidationLayer.ts';
import {
  composeLessonPlanWithDependencies,
  composeLessonPlanWithStyles,
  composeLessonPlanFull,
  composeLessonPlanComplete,
  composeLessonPlanAll,
  composeLessonPlanFinal,
  composeLessonPlanComplete2,
} from './PipelineComposer.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputComplete2,
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

// ---------------------------------------------------------------------------
// Test 1: composeDidacticLessonPlan returns canonical final lesson plan
// ---------------------------------------------------------------------------

describe('D1-OPT-09 — Didactic Pipeline Facade', () => {
  test('composeDidacticLessonPlan returns canonical final lesson plan', () => {
    const input = createBaseInput();
    const output = composeDidacticLessonPlan(input);

    assert.ok(output.lessonPlan, 'Must have lessonPlan');
    assert.ok(output.validationResult, 'Must have validationResult');
    assert.ok(output.traceMetadata, 'Must have traceMetadata');

    // Verify 13 canonical stages
    assert.strictEqual(output.lessonPlan.stages.length, 13, 'Must have 13 stages');
    for (let i = 0; i < CANONICAL_PIPELINE_STAGES.length; i++) {
      assert.strictEqual(
        output.lessonPlan.stages[i].stageId,
        CANONICAL_PIPELINE_STAGES[i],
        `Stage ${i} must be ${CANONICAL_PIPELINE_STAGES[i]}`,
      );
    }

    // Verify trace metadata
    assert.strictEqual(output.traceMetadata.facadeVersion, '1.0.0');
    assert.strictEqual(output.traceMetadata.composed, true);
    assert.strictEqual(output.traceMetadata.certified, false);
    assert.strictEqual(output.traceMetadata.deterministic, true);
  });

  // ---------------------------------------------------------------------------
  // Test 2: certifyDidacticLessonPlan returns certification report
  // ---------------------------------------------------------------------------

  test('certifyDidacticLessonPlan returns certification report', () => {
    const input = createBaseInput();
    const composed = composeDidacticLessonPlan(input);
    const output = certifyDidacticLessonPlan(composed.lessonPlan);

    assert.ok(output.certificationReport, 'Must have certificationReport');
    assert.ok(output.validationResult, 'Must have validationResult');
    assert.ok(output.traceMetadata, 'Must have traceMetadata');

    // Verify certification report structure
    const cert = output.certificationReport;
    assert.ok(cert.planId, 'Certification must have planId');
    assert.ok(cert.topic, 'Certification must have topic');
    assert.ok(
      ['certified', 'certified_with_warnings', 'needs_revision', 'blocked'].includes(cert.status),
      `Status must be valid, got "${cert.status}"`,
    );
    assert.ok(Array.isArray(cert.findings), 'Must have findings array');
    assert.ok(typeof cert.qualityScore === 'number', 'Must have qualityScore');
    assert.strictEqual(cert.deterministic, true, 'Must be deterministic');
    assert.strictEqual(cert.certifiedAt, 'composition_certification');

    // Verify trace metadata
    assert.strictEqual(output.traceMetadata.composed, false);
    assert.strictEqual(output.traceMetadata.certified, true);
  });

  // ---------------------------------------------------------------------------
  // Test 3: composeAndCertifyDidacticLessonPlan returns both plan and report
  // ---------------------------------------------------------------------------

  test('composeAndCertifyDidacticLessonPlan returns both plan and report', () => {
    const input = createBaseInput();
    const output = composeAndCertifyDidacticLessonPlan(input);

    assert.ok(output.lessonPlan, 'Must have lessonPlan');
    assert.ok(output.certificationReport, 'Must have certificationReport');
    assert.ok(output.validationResult, 'Must have validationResult');
    assert.ok(output.certificationValidation, 'Must have certificationValidation');
    assert.ok(output.traceMetadata, 'Must have traceMetadata');

    // Verify both are present
    assert.strictEqual(output.traceMetadata.composed, true);
    assert.strictEqual(output.traceMetadata.certified, true);

    // Verify 13 stages
    assert.strictEqual(output.lessonPlan.stages.length, 13);
  });

  // ---------------------------------------------------------------------------
  // Test 4: legacy composer aliases remain callable
  // ---------------------------------------------------------------------------

  test('legacy composer aliases remain callable', () => {
    const input = createBaseInput();

    // All legacy aliases should be callable
    const plan1 = composeLessonPlanWithDependencies(input);
    assert.ok(plan1, 'composeLessonPlanWithDependencies must work');

    const plan2 = composeLessonPlanWithStyles(input);
    assert.ok(plan2, 'composeLessonPlanWithStyles must work');

    const plan3 = composeLessonPlanFull(input);
    assert.ok(plan3, 'composeLessonPlanFull must work');

    const plan4 = composeLessonPlanComplete(input);
    assert.ok(plan4, 'composeLessonPlanComplete must work');

    const plan5 = composeLessonPlanAll(input);
    assert.ok(plan5, 'composeLessonPlanAll must work');

    const plan6 = composeLessonPlanFinal(input);
    assert.ok(plan6, 'composeLessonPlanFinal must work');

    const plan7 = composeLessonPlanComplete2(input);
    assert.ok(plan7, 'composeLessonPlanComplete2 must work');
  });

  // ---------------------------------------------------------------------------
  // Test 5: facade does not mutate input
  // ---------------------------------------------------------------------------

  test('facade does not mutate input', () => {
    const input = createBaseInput();
    const originalTopic = input.topic;
    const originalConceptIds = [...input.conceptIds];
    const originalResources = JSON.parse(JSON.stringify(input.availableResources));

    composeAndCertifyDidacticLessonPlan(input);

    assert.strictEqual(input.topic, originalTopic, 'Input topic must not be mutated');
    assert.deepStrictEqual([...input.conceptIds], originalConceptIds, 'Input conceptIds must not be mutated');
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(input.availableResources)),
      originalResources,
      'Input resources must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: identical facade input produces identical output
  // ---------------------------------------------------------------------------

  test('identical facade input produces identical output', () => {
    const input1 = createBaseInput();
    const input2 = createBaseInput();

    const output1 = composeAndCertifyDidacticLessonPlan(input1);
    const output2 = composeAndCertifyDidacticLessonPlan(input2);

    const json1 = JSON.stringify(output1);
    const json2 = JSON.stringify(output2);

    assert.strictEqual(json1, json2, 'Outputs must be identical for identical inputs');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const input = createBaseInput();
      const output = composeAndCertifyDidacticLessonPlan(input);
      assert.strictEqual(
        JSON.stringify(output),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 7: canonical stage order remains unchanged
  // ---------------------------------------------------------------------------

  test('canonical stage order remains unchanged', () => {
    const input = createBaseInput();
    const output = composeDidacticLessonPlan(input);

    assert.strictEqual(output.lessonPlan.stages.length, 13, 'Must have 13 stages');
    for (let i = 0; i < CANONICAL_PIPELINE_STAGES.length; i++) {
      assert.strictEqual(
        output.lessonPlan.stages[i].stageId,
        CANONICAL_PIPELINE_STAGES[i],
        `Stage ${i} must be ${CANONICAL_PIPELINE_STAGES[i]}`,
      );
      assert.strictEqual(
        output.lessonPlan.stages[i].order,
        i + 1,
        `Stage ${i} order must be ${i + 1}`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 8: facade output validation rejects missing lessonPlan
  // ---------------------------------------------------------------------------

  test('facade output validation rejects missing lessonPlan', () => {
    const result = validateFacadeLessonPlanOutput({
      lessonPlan: null as any,
      validationResult: { valid: true, errors: [], checkedAt: 'plan_generation' },
      traceMetadata: {},
    });

    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'FACADE_MISSING_LESSON_PLAN'),
      'Must report FACADE_MISSING_LESSON_PLAN',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 9: facade output validation rejects missing certificationReport
  // ---------------------------------------------------------------------------

  test('facade output validation rejects missing certificationReport', () => {
    const result = validateFacadeCertificationOutput({
      certificationReport: null as any,
      validationResult: { valid: true, errors: [], checkedAt: 'plan_generation' },
      traceMetadata: {},
    });

    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'FACADE_MISSING_CERTIFICATION_REPORT'),
      'Must report FACADE_MISSING_CERTIFICATION_REPORT',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 10: no generated content is introduced
  // ---------------------------------------------------------------------------

  test('no generated content is introduced', () => {
    const input = createBaseInput();
    const output = composeAndCertifyDidacticLessonPlan(input);

    // Verify no stage has generated content fields
    for (const stage of output.lessonPlan.stages) {
      const stageObj = stage as any;
      assert.strictEqual(stageObj.generatedContent, undefined, `Stage "${stage.stageId}" must not have generatedContent`);
      assert.strictEqual(stageObj.explanationText, undefined, `Stage "${stage.stageId}" must not have explanationText`);
      assert.strictEqual(stageObj.content, undefined, `Stage "${stage.stageId}" must not have content`);
    }

    // Verify certification report doesn't have generated content
    const certObj = output.certificationReport as any;
    assert.strictEqual(typeof certObj.generatedContent, 'undefined', 'Certification must not have generatedContent');
    assert.strictEqual(typeof certObj.explanation, 'undefined', 'Certification must not have explanation');
    assert.strictEqual(typeof certObj.summary, 'undefined', 'Certification must not have summary');
  });

  // ---------------------------------------------------------------------------
  // Test 11: no learner inference fields are present
  // ---------------------------------------------------------------------------

  test('no learner inference fields are present', () => {
    const input = createBaseInput();
    const output = composeAndCertifyDidacticLessonPlan(input);

    // Check lesson plan
    const planObj = output.lessonPlan as any;
    assert.strictEqual(typeof planObj.learnerScore, 'undefined', 'Plan must not have learnerScore');
    assert.strictEqual(typeof planObj.masteryScore, 'undefined', 'Plan must not have masteryScore');
    assert.strictEqual(typeof planObj.readinessScore, 'undefined', 'Plan must not have readinessScore');

    // Check certification report
    const certObj = output.certificationReport as any;
    assert.strictEqual(typeof certObj.learnerScore, 'undefined', 'Certification must not have learnerScore');
    assert.strictEqual(typeof certObj.masteryScore, 'undefined', 'Certification must not have masteryScore');
    assert.strictEqual(typeof certObj.readinessScore, 'undefined', 'Certification must not have readinessScore');
    assert.strictEqual(typeof certObj.confidence, 'undefined', 'Certification must not have confidence');
  });

  // ---------------------------------------------------------------------------
  // Test 12: index exports facade and legacy aliases without conflicts
  // ---------------------------------------------------------------------------

  test('index exports facade and legacy aliases without conflicts', async () => {
    // Dynamic import to verify exports are available
    const facade = await import('./DidacticPipelineFacade.ts');
    const pipeline = await import('./PipelineComposer.ts');

    // Verify canonical facade functions exist
    assert.strictEqual(typeof facade.composeDidacticLessonPlan, 'function', 'composeDidacticLessonPlan must be exported');
    assert.strictEqual(typeof facade.certifyDidacticLessonPlan, 'function', 'certifyDidacticLessonPlan must be exported');
    assert.strictEqual(typeof facade.composeAndCertifyDidacticLessonPlan, 'function', 'composeAndCertifyDidacticLessonPlan must be exported');

    // Verify legacy aliases still exist
    assert.strictEqual(typeof pipeline.composeLessonPlanWithDependencies, 'function', 'composeLessonPlanWithDependencies must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanWithStyles, 'function', 'composeLessonPlanWithStyles must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanFull, 'function', 'composeLessonPlanFull must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanComplete, 'function', 'composeLessonPlanComplete must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanAll, 'function', 'composeLessonPlanAll must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanFinal, 'function', 'composeLessonPlanFinal must exist');
    assert.strictEqual(typeof pipeline.composeLessonPlanComplete2, 'function', 'composeLessonPlanComplete2 must exist');
  });
});
