/**
 * NV-1300-D1-OPT-02 — Didactic Prerequisite Orchestration Tests
 *
 * Focused tests for the deterministic prerequisite analyzer and
 * dependency-aware pipeline composer.
 * Uses Node.js built-in test runner (node:test).
 *
 * Test matrix:
 * 1. required missing prerequisite creates block_or_recap_required decision
 * 2. recommended missing prerequisite inserts recap metadata
 * 3. optional background becomes context note
 * 4. enrichment becomes forward connection metadata
 * 5. co-requisite becomes parallel context metadata
 * 6. unknown prerequisite status fails validation
 * 7. no canonical stage order change occurs
 * 8. no new non-canonical stage is inserted
 * 9. input dependency graph is not mutated
 * 10. identical prerequisite input produces identical output
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { composeLessonPlanWithDependencies } from './PipelineComposer.ts';
import { validateLessonPlanWithDependencies } from './ValidationLayer.ts';
import {
  analyzePrerequisites,
  buildDependencyTrace,
  validatePrerequisiteReference,
  validateDependencyGraph,
} from './PrerequisiteAnalyzer.ts';
import {
  CANONICAL_PIPELINE_STAGES,
  type DidacticLessonInputWithDependencies,
  type DidacticLessonPlanWithDependencies,
  type DidacticDependencyGraph,
  type DidacticPrerequisiteDecision,
} from './DidacticAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Helpers
// ---------------------------------------------------------------------------

function createBaseInput(): DidacticLessonInputWithDependencies {
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

function createDependencyGraphWithRequiredMissing(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'linear-algebra', label: 'Linear Algebra', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'linear-algebra',
        label: 'Linear Algebra',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        rationale: 'Matrix operations are fundamental to neural network weight transformations.',
        source: 'curriculum/prereq/linear-algebra',
      },
    ],
  };
}

function createDependencyGraphWithRecommendedMissing(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'calculus', label: 'Calculus', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'calculus',
        label: 'Calculus',
        dependencyType: 'recommended',
        requiredDepth: 'awareness',
        rationale: 'Helps understand gradient descent intuition.',
        source: 'curriculum/prereq/calculus',
      },
    ],
  };
}

function createDependencyGraphWithOptionalBackground(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'physics', label: 'Physics', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'physics',
        label: 'Physics',
        dependencyType: 'optional_background',
        requiredDepth: 'awareness',
        rationale: 'Provides physical intuition for optimization.',
        source: 'curriculum/prereq/physics',
      },
    ],
  };
}

function createDependencyGraphWithEnrichment(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'advanced-topology', label: 'Advanced Topology', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'advanced-topology',
        label: 'Advanced Topology',
        dependencyType: 'enrichment',
        requiredDepth: 'awareness',
        rationale: 'Extends understanding to manifold learning.',
        source: 'curriculum/prereq/topology',
      },
    ],
  };
}

function createDependencyGraphWithCoRequisite(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'python-basics', label: 'Python Basics', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'python-basics',
        label: 'Python Basics',
        dependencyType: 'co_requisite',
        requiredDepth: 'working_knowledge',
        rationale: 'Required for hands-on implementation exercises.',
        source: 'curriculum/prereq/python',
      },
    ],
  };
}

function createDependencyGraphWithUnknownStatus(): DidacticDependencyGraph {
  return {
    concepts: [],
    prerequisites: [
      {
        conceptId: 'unknown-concept',
        label: 'Unknown Concept',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        rationale: 'Some rationale.',
        source: 'curriculum/prereq/unknown',
      },
    ],
  };
}

function createDependencyGraphWithKnownPrereq(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'nn-001', label: 'Neural Networks 101', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'nn-001',
        label: 'Neural Networks 101',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        rationale: 'Foundation concept.',
        source: 'curriculum/prereq/nn-001',
      },
    ],
  };
}

function createDependencyGraphWithBadRationale(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'bad-prereq', label: 'Bad Prereq', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'bad-prereq',
        label: 'Bad Prereq',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        rationale: '',
        source: 'curriculum/prereq/bad',
      },
    ],
  };
}

function createDependencyGraphWithBadSource(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'no-source', label: 'No Source', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'no-source',
        label: 'No Source',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        rationale: 'Some rationale.',
        source: '',
      },
    ],
  };
}

function createDependencyGraphWithBadType(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'bad-type', label: 'Bad Type', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'bad-type',
        label: 'Bad Type',
        dependencyType: 'invalid_type' as any,
        requiredDepth: 'basic_understanding',
        rationale: 'Some rationale.',
        source: 'curriculum/prereq/bad-type',
      },
    ],
  };
}

function createDependencyGraphWithBadDepth(): DidacticDependencyGraph {
  return {
    concepts: [
      { conceptId: 'bad-depth', label: 'Bad Depth', source: 'curriculum', lifecycle: 'active' },
    ],
    prerequisites: [
      {
        conceptId: 'bad-depth',
        label: 'Bad Depth',
        dependencyType: 'required',
        requiredDepth: 'invalid_depth' as any,
        rationale: 'Some rationale.',
        source: 'curriculum/prereq/bad-depth',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Test 1: required missing prerequisite creates block_or_recap_required
// ---------------------------------------------------------------------------

describe('D1-OPT-02 — Prerequisite Orchestration', () => {
  test('required missing prerequisite creates block_or_recap_required decision', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithRequiredMissing();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1, 'Must have 1 decision');
    assert.strictEqual(decisions[0].prerequisiteConceptId, 'linear-algebra');
    assert.strictEqual(decisions[0].dependencyType, 'required');
    assert.strictEqual(decisions[0].status, 'missing');
    assert.strictEqual(decisions[0].supportAction, 'block_or_recap_required');
    assert.ok(decisions[0].rationale, 'Must have rationale');
    assert.ok(decisions[0].source, 'Must have source');
  });

  // ---------------------------------------------------------------------------
  // Test 2: recommended missing prerequisite inserts recap metadata
  // ---------------------------------------------------------------------------

  test('recommended missing prerequisite inserts recap metadata', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithRecommendedMissing();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].dependencyType, 'recommended');
    assert.strictEqual(decisions[0].status, 'missing');
    assert.strictEqual(decisions[0].supportAction, 'insert_recap');
  });

  // ---------------------------------------------------------------------------
  // Test 3: optional background becomes context note
  // ---------------------------------------------------------------------------

  test('optional background becomes context note', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithOptionalBackground();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].dependencyType, 'optional_background');
    assert.strictEqual(decisions[0].status, 'missing');
    assert.strictEqual(decisions[0].supportAction, 'add_context_note');
  });

  // ---------------------------------------------------------------------------
  // Test 4: enrichment becomes forward connection metadata
  // ---------------------------------------------------------------------------

  test('enrichment becomes forward connection metadata', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithEnrichment();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].dependencyType, 'enrichment');
    assert.strictEqual(decisions[0].status, 'missing');
    assert.strictEqual(decisions[0].supportAction, 'add_forward_connection');
  });

  // ---------------------------------------------------------------------------
  // Test 5: co-requisite becomes parallel context metadata
  // ---------------------------------------------------------------------------

  test('co-requisite becomes parallel context metadata', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithCoRequisite();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].dependencyType, 'co_requisite');
    assert.strictEqual(decisions[0].status, 'missing');
    assert.strictEqual(decisions[0].supportAction, 'insert_parallel_context');
  });

  // ---------------------------------------------------------------------------
  // Test 6: unknown prerequisite status fails validation
  // ---------------------------------------------------------------------------

  test('unknown prerequisite status fails validation', () => {
    const decisions: DidacticPrerequisiteDecision[] = [
      {
        conceptId: 'unknown-concept',
        prerequisiteConceptId: 'unknown-concept',
        prerequisiteLabel: 'Unknown Concept',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        status: 'unknown',
        supportAction: 'none',
        rationale: 'Some rationale.',
        source: 'curriculum/prereq/unknown',
      },
    ];

    const trace = buildDependencyTrace(['nn-001'], decisions);
    const plan: DidacticLessonPlanWithDependencies = {
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
      dependencyTrace: trace,
    };

    const result = validateLessonPlanWithDependencies(plan);
    assert.strictEqual(result.valid, false, 'Validation must fail for unknown status');
    assert.ok(
      result.errors.some((e) => e.code === 'PREREQ_UNKNOWN_STATUS_TREATED_AS_KNOWN'),
      'Must report PREREQ_UNKNOWN_STATUS_TREATED_AS_KNOWN error',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 7: no canonical stage order change occurs
  // ---------------------------------------------------------------------------

  test('no canonical stage order change occurs', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithRequiredMissing();
    input.dependencyGraph = graph;

    const plan = composeLessonPlanWithDependencies(input);

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
  // Test 8: no new non-canonical stage is inserted
  // ---------------------------------------------------------------------------

  test('no new non-canonical stage is inserted', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithRequiredMissing();
    input.dependencyGraph = graph;

    const plan = composeLessonPlanWithDependencies(input);

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
  // Test 9: input dependency graph is not mutated
  // ---------------------------------------------------------------------------

  test('input dependency graph is not mutated', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithRequiredMissing();
    input.dependencyGraph = graph;

    const originalPrereqs = JSON.parse(JSON.stringify(graph.prerequisites));
    const originalConcepts = JSON.parse(JSON.stringify(graph.concepts));

    composeLessonPlanWithDependencies(input);

    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(graph.prerequisites)),
      originalPrereqs,
      'Prerequisites must not be mutated',
    );
    assert.deepStrictEqual(
      JSON.parse(JSON.stringify(graph.concepts)),
      originalConcepts,
      'Concepts must not be mutated',
    );
  });

  // ---------------------------------------------------------------------------
  // Test 10: identical prerequisite input produces identical output
  // ---------------------------------------------------------------------------

  test('identical prerequisite input produces identical output', () => {
    const input1 = createBaseInput();
    input1.dependencyGraph = createDependencyGraphWithRequiredMissing();

    const input2 = createBaseInput();
    input2.dependencyGraph = createDependencyGraphWithRequiredMissing();

    const plan1 = composeLessonPlanWithDependencies(input1);
    const plan2 = composeLessonPlanWithDependencies(input2);

    const json1 = JSON.stringify(plan1);
    const json2 = JSON.stringify(plan2);

    assert.strictEqual(json1, json2, 'Plans must be identical for identical inputs');

    // Run 50 iterations
    for (let i = 0; i < 50; i++) {
      const input = createBaseInput();
      input.dependencyGraph = createDependencyGraphWithRequiredMissing();
      const plan = composeLessonPlanWithDependencies(input);
      assert.strictEqual(
        JSON.stringify(plan),
        json1,
        `Iteration ${i} must produce identical output`,
      );
    }
  });

  // ---------------------------------------------------------------------------
  // Additional: known prerequisite produces none action
  // ---------------------------------------------------------------------------

  test('known prerequisite produces none action', () => {
    const input = createBaseInput();
    const graph = createDependencyGraphWithKnownPrereq();
    const decisions = analyzePrerequisites(input, graph);

    assert.strictEqual(decisions.length, 1);
    assert.strictEqual(decisions[0].status, 'known');
    assert.strictEqual(decisions[0].supportAction, 'none');
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches prerequisite without rationale
  // ---------------------------------------------------------------------------

  test('validation catches prerequisite decision without rationale', () => {
    const decisions: DidacticPrerequisiteDecision[] = [
      {
        conceptId: 'bad-prereq',
        prerequisiteConceptId: 'bad-prereq',
        prerequisiteLabel: 'Bad Prereq',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        status: 'missing',
        supportAction: 'block_or_recap_required',
        rationale: '',
        source: 'curriculum/prereq/bad',
      },
    ];

    const trace = buildDependencyTrace(['nn-001'], decisions);
    const plan: DidacticLessonPlanWithDependencies = {
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
      dependencyTrace: trace,
    };

    const result = validateLessonPlanWithDependencies(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'PREREQ_DECISION_NO_RATIONALE'),
      'Must report PREREQ_DECISION_NO_RATIONALE error',
    );
  });

  // ---------------------------------------------------------------------------
  // Additional: validation catches required missing with wrong action
  // ---------------------------------------------------------------------------

  test('validation catches required missing prerequisite with wrong support action', () => {
    const decisions: DidacticPrerequisiteDecision[] = [
      {
        conceptId: 'wrong-action',
        prerequisiteConceptId: 'wrong-action',
        prerequisiteLabel: 'Wrong Action',
        dependencyType: 'required',
        requiredDepth: 'basic_understanding',
        status: 'missing',
        supportAction: 'none',
        rationale: 'Some rationale.',
        source: 'curriculum/prereq/wrong',
      },
    ];

    const trace = buildDependencyTrace(['nn-001'], decisions);
    const plan: DidacticLessonPlanWithDependencies = {
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
      dependencyTrace: trace,
    };

    const result = validateLessonPlanWithDependencies(plan);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors.some((e) => e.code === 'PREREQ_REQUIRED_MISSING_NO_ACTION'),
      'Must report PREREQ_REQUIRED_MISSING_NO_ACTION error',
    );
  });
});
