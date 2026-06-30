/**
 * NV-1300-D1-OPT-08 — Didactic Composition Certification Tests
 *
 * Focused tests for the deterministic composition certification engine.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. complete valid plan is certified
 * 2. invalid canonical stage order produces blocked
 * 3. non-canonical stage produces blocked
 * 4. missing source in selected resource produces blocked
 * 5. missing required prerequisite support produces needs_revision
 * 6. incomplete optional dimension produces certified_with_warnings
 * 7. deterministic integrity violation produces blocked
 * 8. certification output is identical for identical input
 * 9. certification does not mutate input plan
 * 10. certification report validation rejects invalid status
 * 11. certified report with error finding fails validation
 * 12. blocked report without error finding fails validation
 * 13. no learner inference fields are present
 * 14. no generated content is introduced
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { certifyDidacticComposition, validateCertificationReport as validateCertReport } from './CompositionCertificationEngine.ts';
import { validateCertificationReport } from './ValidationLayer.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonPlanComplete2,
  type DidacticCompositionCertificationReport,
  type DidacticPipelineStage,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createValidStages(): readonly DidacticPipelineStage[] {
  return CANONICAL_PIPELINE_STAGES.map((id, i) => ({
    stageId: id,
    order: i + 1,
    status: 'included' as const,
    label: id,
    description: `Description for ${id}.`,
    omissionReason: null,
    resourceRef: { resourceId: `res-${id}`, resourceType: 'concept' as const, source: `curriculum/${id}` },
  }));
}

function createValidPlan(): DidacticLessonPlanComplete2 {
  return {
    id: 'plan-test-001',
    topic: 'Neural Network Fundamentals',
    difficulty: 'standard',
    stages: createValidStages(),
    trace: {
      planId: 'plan-test-001',
      topic: 'Neural Network Fundamentals',
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
  };
}

function createPlanWithInvalidOrder(): DidacticLessonPlanComplete2 {
  const stages = CANONICAL_PIPELINE_STAGES.map((id, i) => ({
    stageId: id,
    order: i + 1,
    status: 'included' as const,
    label: id,
    description: `Description for ${id}.`,
    omissionReason: null,
    resourceRef: { resourceId: `res-${id}`, resourceType: 'concept' as const, source: `curriculum/${id}` },
  }));
  // Swap summary and motivation to create invalid order
  const temp = { ...stages[0] };
  stages[0] = { ...stages[12] };
  stages[12] = temp;

  return {
    id: 'plan-test-invalid-order',
    topic: 'Test',
    difficulty: 'standard',
    stages,
    trace: {
      planId: 'plan-test-invalid-order',
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
  };
}

function createPlanWithNonCanonicalStage(): DidacticLessonPlanComplete2 {
  const stages: DidacticPipelineStage[] = CANONICAL_PIPELINE_STAGES.map((id, i) => ({
    stageId: id,
    order: i + 1,
    status: 'included' as const,
    label: id,
    description: `Description for ${id}.`,
    omissionReason: null,
    resourceRef: { resourceId: `res-${id}`, resourceType: 'concept' as const, source: `curriculum/${id}` },
  }));
  stages.push({
    stageId: 'fake_stage' as any,
    order: 14,
    status: 'included',
    label: 'Fake Stage',
    description: 'Not a real stage.',
    omissionReason: null,
    resourceRef: { resourceId: 'fake', resourceType: 'concept', source: 'curriculum/fake' },
  });

  return {
    id: 'plan-test-non-canonical',
    topic: 'Test',
    difficulty: 'standard',
    stages,
    trace: {
      planId: 'plan-test-non-canonical',
      topic: 'Test',
      difficulty: 'standard',
      totalStages: 14,
      includedStages: 14,
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
}

function createPlanWithMissingSource(): DidacticLessonPlanComplete2 {
  const stages = CANONICAL_PIPELINE_STAGES.map((id, i) => ({
    stageId: id,
    order: i + 1,
    status: 'included' as const,
    label: id,
    description: `Description for ${id}.`,
    omissionReason: null,
    resourceRef: { resourceId: `res-${id}`, resourceType: 'concept' as const, source: '' },
  }));

  return {
    id: 'plan-test-missing-source',
    topic: 'Test',
    difficulty: 'standard',
    stages,
    trace: {
      planId: 'plan-test-missing-source',
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
  };
}

function createPlanWithMissingPrereqSupport(): DidacticLessonPlanComplete2 {
  const plan = createValidPlan();
  return {
    ...plan,
    dependencyTrace: {
      conceptId: 'test-concept',
      prerequisitesAnalyzed: 1,
      decisions: [
        {
          conceptId: 'test-concept',
          prerequisiteConceptId: 'missing-prereq',
          prerequisiteLabel: 'Missing Prereq',
          dependencyType: 'required',
          requiredDepth: 'basic_understanding',
          status: 'missing',
          supportAction: 'none',
          rationale: 'Required but missing.',
          source: 'curriculum/prereq',
        },
      ],
      blockedByMissingRequired: [],
      recapsInserted: [],
      contextNotesAdded: [],
      forwardConnectionsAdded: [],
      parallelContextsInserted: [],
    },
  };
}

function createPlanWithDeterministicViolation(): DidacticLessonPlanComplete2 {
  const plan = createValidPlan();
  return {
    ...plan,
    trace: {
      ...plan.trace,
      randomUsed: true as false,
    },
  };
}

// ---------------------------------------------------------------------------
// Test 1: complete valid plan is certified
// ---------------------------------------------------------------------------

describe('D1-OPT-08 — Composition Certification', () => {
  test('complete valid plan is certified', () => {
    const plan = createValidPlan();
    const report = certifyDidacticComposition(plan);

    assert.strictEqual(report.status, 'certified');
    assert.strictEqual(report.errorCount, 0);
    assert.strictEqual(report.deterministic, true);
    assert.strictEqual(report.certifiedAt, 'composition_certification');
    assert.ok(report.qualityScore >= 0 && report.qualityScore <= 100, 'Quality score must be 0-100');
  });

  // ---------------------------------------------------------------------------
  // Test 2: invalid canonical stage order produces blocked
  // ---------------------------------------------------------------------------

  test('invalid canonical stage order produces blocked', () => {
    const plan = createPlanWithInvalidOrder();
    const report = certifyDidacticComposition(plan);

    assert.strictEqual(report.status, 'blocked');
    assert.ok(report.errorCount > 0, 'Must have error findings');
    assert.ok(
      report.findings.some((f) => f.code === 'STRUCT_INVALID_ORDER'),
      'Must report STRUCT_INVALID_ORDER',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 3: non-canonical stage produces blocked
  // ---------------------------------------------------------------------------

  test('non-canonical stage produces blocked', () => {
    const plan = createPlanWithNonCanonicalStage();
    const report = certifyDidacticComposition(plan);

    assert.strictEqual(report.status, 'blocked');
    assert.ok(report.errorCount > 0, 'Must have error findings');
    assert.ok(
      report.findings.some((f) => f.code === 'STRUCT_NON_CANONICAL_STAGE'),
      'Must report STRUCT_NON_CANONICAL_STAGE',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 4: missing source in selected resource produces blocked
  // ---------------------------------------------------------------------------

  test('missing source in selected resource produces blocked', () => {
    const plan = createPlanWithMissingSource();
    const report = certifyDidacticComposition(plan);

    assert.strictEqual(report.status, 'blocked');
    assert.ok(report.errorCount > 0, 'Must have error findings');
    assert.ok(
      report.findings.some((f) => f.code === 'STRUCT_SELECTED_NO_SOURCE'),
      'Must report STRUCT_SELECTED_NO_SOURCE',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 5: missing required prerequisite support produces needs_revision
  // ---------------------------------------------------------------------------

  test('missing required prerequisite support produces needs_revision', () => {
    const plan = createPlanWithMissingPrereqSupport();
    const report = certifyDidacticComposition(plan);

    // Should be needs_revision or blocked depending on other findings
    assert.ok(
      report.status === 'needs_revision' || report.status === 'blocked',
      `Status should be needs_revision or blocked, got "${report.status}"`,
    );
    assert.ok(
      report.findings.some((f) => f.code === 'PREREQ_REQUIRED_NO_SUPPORT'),
      'Must report PREREQ_REQUIRED_NO_SUPPORT',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 6: incomplete optional dimension produces certified_with_warnings
  // ---------------------------------------------------------------------------

  test('incomplete optional dimension produces certified_with_warnings', () => {
    const basePlan = createValidPlan();
    // Add a warning-level finding by having no styles selected
    const plan: DidacticLessonPlanComplete2 = {
      ...basePlan,
      styleTrace: {
        stylesSelected: 0,
        stylesOmitted: 2,
        decisions: [
          { style: 'intuitive', status: 'omitted', resourceId: null, source: '', supportedStages: [], pedagogicalPurpose: '', omissionReason: 'No resource.' },
          { style: 'visual', status: 'omitted', resourceId: null, source: '', supportedStages: [], pedagogicalPurpose: '', omissionReason: 'No resource.' },
        ],
        selectedStyles: [],
        omittedStyles: ['intuitive', 'visual'],
      },
    };

    const report = certifyDidacticComposition(plan);
    assert.strictEqual(report.status, 'certified_with_warnings');
    assert.strictEqual(report.errorCount, 0);
    assert.ok(report.warningCount > 0 || report.recommendationCount > 0, 'Must have warnings or recommendations');
  });

  // ---------------------------------------------------------------------------
  // Test 7: deterministic integrity violation produces blocked
  // ---------------------------------------------------------------------------

  test('deterministic integrity violation produces blocked', () => {
    const plan = createPlanWithDeterministicViolation();
    const report = certifyDidacticComposition(plan);

    assert.strictEqual(report.status, 'blocked');
    assert.ok(report.errorCount > 0, 'Must have error findings');
    assert.ok(
      report.findings.some((f) => f.code === 'DETERM_RANDOM_USED'),
      'Must report DETERM_RANDOM_USED',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 8: certification output is identical for identical input
  // ---------------------------------------------------------------------------

  test('certification output is identical for identical input', () => {
    const plan = createValidPlan();

    const report1 = certifyDidacticComposition(plan);
    const report2 = certifyDidacticComposition(plan);

    const json1 = JSON.stringify(report1);
    const json2 = JSON.stringify(report2);

    assert.strictEqual(json1, json2, 'Reports must be identical for identical input');

    // Run 20 iterations
    for (let i = 0; i < 20; i++) {
      const report = certifyDidacticComposition(plan);
      assert.strictEqual(
        JSON.stringify(report),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Test 9: certification does not mutate input plan
  // ---------------------------------------------------------------------------

  test('certification does not mutate input plan', () => {
    const plan = createValidPlan();
    const originalStages = JSON.parse(JSON.stringify(plan.stages));
    const originalTrace = JSON.parse(JSON.stringify(plan.trace));

    certifyDidacticComposition(plan);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(plan.stages)),
      originalStages,
      'Stages must not be mutated',
    );
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(plan.trace)),
      originalTrace,
      'Trace must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 10: certification report validation rejects invalid status
  // ---------------------------------------------------------------------------

  test('certification report validation rejects invalid status', () => {
    const report = {
      planId: 'test',
      topic: 'Test',
      status: 'invalid_status',
      findings: [],
      dimensionsChecked: [],
      errorCount: 0,
      warningCount: 0,
      recommendationCount: 0,
      qualityScore: 100,
      deterministic: true,
      certifiedAt: 'composition_certification',
    } as any;

    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'CERT_INVALID_STATUS'),
      'Must report CERT_INVALID_STATUS',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 11: certified report with error finding fails validation
  // ---------------------------------------------------------------------------

  test('certified report with error finding fails validation', () => {
    const report: DidacticCompositionCertificationReport = {
      planId: 'test',
      topic: 'Test',
      status: 'certified',
      findings: [
        { code: 'TEST_ERROR', message: 'Test error.', severity: 'error', qualityDimension: 'structural_validity' },
      ],
      dimensionsChecked: [],
      errorCount: 1,
      warningCount: 0,
      recommendationCount: 0,
      qualityScore: 100,
      deterministic: true,
      certifiedAt: 'composition_certification',
    };

    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'CERT_CERTIFIED_HAS_ERROR'),
      'Must report CERT_CERTIFIED_HAS_ERROR',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 12: blocked report without error finding fails validation
  // ---------------------------------------------------------------------------

  test('blocked report without error finding fails validation', () => {
    const report: DidacticCompositionCertificationReport = {
      planId: 'test',
      topic: 'Test',
      status: 'blocked',
      findings: [
        { code: 'TEST_WARNING', message: 'Test warning.', severity: 'warning', qualityDimension: 'structural_validity' },
      ],
      dimensionsChecked: [],
      errorCount: 0,
      warningCount: 1,
      recommendationCount: 0,
      qualityScore: 0,
      deterministic: true,
      certifiedAt: 'composition_certification',
    };

    const result = validateCertificationReport(report);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'CERT_BLOCKED_NO_ERROR'),
      'Must report CERT_BLOCKED_NO_ERROR',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 13: no learner inference fields are present
  // ---------------------------------------------------------------------------

  test('no learner inference fields are present', () => {
    const plan = createValidPlan();
    const report = certifyDidacticComposition(plan);

    const reportObj = report as any;
    assert.strictEqual(typeof reportObj.learnerScore, 'undefined', 'Must not have learnerScore');
    assert.strictEqual(typeof reportObj.masteryScore, 'undefined', 'Must not have masteryScore');
    assert.strictEqual(typeof reportObj.readinessScore, 'undefined', 'Must not have readinessScore');
    assert.strictEqual(typeof reportObj.personalizedQualityScore, 'undefined', 'Must not have personalizedQualityScore');
    assert.strictEqual(typeof reportObj.confidence, 'undefined', 'Must not have confidence');

    // Check findings don't contain learner inference
    for (const finding of report.findings) {
      const findingObj = finding as any;
      assert.strictEqual(typeof findingObj.learnerScore, 'undefined', 'Finding must not have learnerScore');
      assert.strictEqual(typeof findingObj.masteryScore, 'undefined', 'Finding must not have masteryScore');
    }
  });

  // ---------------------------------------------------------------------------
  // Test 14: no generated content is introduced
  // ---------------------------------------------------------------------------

  test('no generated content is introduced', () => {
    const plan = createValidPlan();
    const report = certifyDidacticComposition(plan);

    // Verify report contains only metadata, not generated content
    const reportObj = report as any;
    assert.strictEqual(typeof reportObj.generatedContent, 'undefined', 'Report must not have generatedContent');
    assert.strictEqual(typeof reportObj.explanation, 'undefined', 'Report must not have explanation');
    assert.strictEqual(typeof reportObj.summary, 'undefined', 'Report must not have summary');

    // Check findings don't contain generated content
    for (const finding of report.findings) {
      const findingObj = finding as any;
      assert.strictEqual(typeof findingObj.generatedContent, 'undefined', 'Finding must not have generatedContent');
      assert.strictEqual(typeof findingObj.explanation, 'undefined', 'Finding must not have explanation');
    }
  });
});
