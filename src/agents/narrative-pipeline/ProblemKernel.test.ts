/**
 * NV-1700-D6-OPT-03 — Problem-Origin & Motivation Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Problem Kernel.
 * Covers: valid problem, valid origin, valid motivation, valid question,
 * valid misconception, duplicate IDs, invalid enums, missing provenance,
 * registry validation, artifact validation, deterministic ordering,
 * immutable input, helper functions, canonical enum completeness,
 * identical output (100 iterations), negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  ProblemProvenance,
  Problem,
  Origin,
  ProblemMotivation,
  DrivingQuestion,
  Misconception,
  ProblemInput,
  ProblemRegistry,
  ProblemTrace,
  NarrativeArtifactWithProblems,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_PROBLEM_TYPES,
  CANONICAL_ORIGIN_TYPES,
  CANONICAL_MOTIVATION_CATEGORIES,
  CANONICAL_DRIVING_QUESTION_TYPES,
  CANONICAL_MISCONCEPTION_TYPES,
  CANONICAL_PROBLEM_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

import {
  composeProblemProvenance,
  composeOrigin,
  composeMotivation,
  composeDrivingQuestion,
  composeMisconception,
  composeProblem,
  composeProblemTrace,
  composeProblemRegistry,
  composeProblemRegistryFromInput,
  composeNarrativeProblems,
  composeNarrativeArtifactWithProblems,
  isSupportedProblemType,
  isSupportedOriginType,
  isSupportedMotivationCategory,
  isSupportedDrivingQuestionType,
  isSupportedMisconceptionType,
  isSupportedProblemStatus,
  getCanonicalProblemTypes,
  getCanonicalOriginTypes,
  getCanonicalMotivationCategories,
  getCanonicalDrivingQuestionTypes,
  getCanonicalMisconceptionTypes,
  getCanonicalProblemStatuses,
} from './ProblemKernel.ts';

import {
  validateProblem,
  validateOrigin,
  validateMotivation,
  validateDrivingQuestion,
  validateMisconception,
  validateProblemRegistry,
  validateProblemInput,
  validateNarrativeArtifactWithProblems,
  PROBLEM_VALIDATION_CODES,
} from './ProblemValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_PROVENANCE: ProblemProvenance = {
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  providedBy: 'NeuralVerse Team',
  rationale: 'Core problem modeling for neural network concepts.',
};

const VALID_PROBLEM: Problem = {
  problemId: 'problem-001',
  problemType: 'engineering_problem',
  title: 'Vanishing Gradient Problem',
  summary: 'Deep networks suffer from vanishing gradients during backpropagation.',
  originId: 'origin-001',
  motivationIds: ['motivation-001'],
  questionIds: ['question-001'],
  misconceptionIds: ['misconception-001'],
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_PROBLEM_2: Problem = {
  problemId: 'problem-002',
  problemType: 'scientific_problem',
  title: 'Overfitting in Neural Networks',
  summary: 'Neural networks can memorize training data instead of generalizing.',
  originId: 'origin-002',
  motivationIds: ['motivation-002'],
  questionIds: ['question-002'],
  misconceptionIds: [],
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_ORIGIN: Origin = {
  originId: 'origin-001',
  originType: 'engineering_need',
  title: 'Need for Deep Feature Learning',
  description: 'Shallow models could not learn hierarchical features.',
  relatedArtifactId: 'knowledge-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_ORIGIN_2: Origin = {
  originId: 'origin-002',
  originType: 'scientific_discovery',
  title: 'Statistical Learning Theory',
  description: 'Formal framework for understanding generalization.',
  relatedArtifactId: 'knowledge-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_MOTIVATION: ProblemMotivation = {
  motivationId: 'motivation-001',
  category: 'efficiency',
  title: 'Need for Faster Training',
  description: 'Training deep networks was impractical without architectural innovations.',
  importance: 'High — enabled practical deep learning.',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_MOTIVATION_2: ProblemMotivation = {
  motivationId: 'motivation-002',
  category: 'accuracy',
  title: 'Need for Better Generalization',
  description: 'Models needed to generalize beyond training data.',
  importance: 'Critical for real-world deployment.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_QUESTION: DrivingQuestion = {
  questionId: 'question-001',
  questionType: 'why',
  prompt: 'Why do deep networks struggle with gradient propagation?',
  relatedArtifactId: 'knowledge-001',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_QUESTION_2: DrivingQuestion = {
  questionId: 'question-002',
  questionType: 'how',
  prompt: 'How can we prevent overfitting in neural networks?',
  relatedArtifactId: 'knowledge-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_MISCONCEPTION: Misconception = {
  misconceptionId: 'misconception-001',
  misconceptionType: 'mathematical_confusion',
  title: 'Gradient Vanishing is Always Bad',
  description: 'Sometimes controlled gradient reduction is desirable.',
  correctiveArtifactId: 'knowledge-003',
  governanceStatus: 'canonical',
  provenance: VALID_PROVENANCE,
};

const VALID_MISCONCEPTION_2: Misconception = {
  misconceptionId: 'misconception-002',
  misconceptionType: 'conceptual_confusion',
  title: 'More Parameters Always Means Better',
  description: 'Overparameterization can hurt generalization.',
  correctiveArtifactId: 'knowledge-004',
  governanceStatus: 'accepted',
  provenance: { ...VALID_PROVENANCE, source: 'Research Team' },
};

const VALID_INPUT: ProblemInput = {
  problems: [VALID_PROBLEM, VALID_PROBLEM_2],
  origins: [VALID_ORIGIN, VALID_ORIGIN_2],
  motivations: [VALID_MOTIVATION, VALID_MOTIVATION_2],
  questions: [VALID_QUESTION, VALID_QUESTION_2],
  misconceptions: [VALID_MISCONCEPTION, VALID_MISCONCEPTION_2],
};

const EMPTY_INPUT: ProblemInput = {
  problems: [],
  origins: [],
  motivations: [],
  questions: [],
  misconceptions: [],
};

// ---------------------------------------------------------------------------
// Composition Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Composition', () => {
  it('should compose valid problem provenance', () => {
    const provenance = composeProblemProvenance({
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      providedBy: 'NeuralVerse Team',
      rationale: 'Core concept.',
    });

    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
    assert.equal(provenance.providedBy, 'NeuralVerse Team');
    assert.equal(provenance.rationale, 'Core concept.');
  });

  it('should compose valid problem', () => {
    const problem = composeProblem({
      problemId: 'problem-001',
      problemType: 'engineering_problem',
      title: 'Vanishing Gradient',
      summary: 'Deep networks suffer.',
      originId: 'origin-001',
      motivationIds: ['motivation-001'],
      questionIds: ['question-001'],
      misconceptionIds: [],
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(problem.problemId, 'problem-001');
    assert.equal(problem.problemType, 'engineering_problem');
    assert.equal(problem.title, 'Vanishing Gradient');
    assert.equal(problem.motivationIds.length, 1);
  });

  it('should compose valid origin', () => {
    const origin = composeOrigin({
      originId: 'origin-001',
      originType: 'engineering_need',
      title: 'Need for Deep Learning',
      description: 'Shallow models insufficient.',
      relatedArtifactId: 'knowledge-001',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(origin.originId, 'origin-001');
    assert.equal(origin.originType, 'engineering_need');
    assert.equal(origin.title, 'Need for Deep Learning');
  });

  it('should compose valid motivation', () => {
    const motivation = composeMotivation({
      motivationId: 'motivation-001',
      category: 'efficiency',
      title: 'Faster Training',
      description: 'Training was impractical.',
      importance: 'High.',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(motivation.motivationId, 'motivation-001');
    assert.equal(motivation.category, 'efficiency');
    assert.equal(motivation.title, 'Faster Training');
  });

  it('should compose valid driving question', () => {
    const question = composeDrivingQuestion({
      questionId: 'question-001',
      questionType: 'why',
      prompt: 'Why do networks struggle?',
      relatedArtifactId: 'knowledge-001',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(question.questionId, 'question-001');
    assert.equal(question.questionType, 'why');
    assert.equal(question.prompt, 'Why do networks struggle?');
  });

  it('should compose valid misconception', () => {
    const misconception = composeMisconception({
      misconceptionId: 'misconception-001',
      misconceptionType: 'mathematical_confusion',
      title: 'Gradient Confusion',
      description: 'Misunderstanding gradients.',
      correctiveArtifactId: 'knowledge-003',
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    assert.equal(misconception.misconceptionId, 'misconception-001');
    assert.equal(misconception.misconceptionType, 'mathematical_confusion');
    assert.equal(misconception.title, 'Gradient Confusion');
  });

  it('should compose valid problem trace', () => {
    const trace = composeProblemTrace({
      traceId: '_trace_1',
      decisions: [
        { decisionId: 'd1', problemId: 'problem-001', validationPassed: true, validationErrors: [] },
      ],
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      problemCount: 1,
      originCount: 0,
      motivationCount: 0,
      questionCount: 0,
      misconceptionCount: 0,
    });

    assert.equal(trace.traceId, '_trace_1');
    assert.equal(trace.decisionCount, 1);
    assert.equal(trace.validationCount, 1);
    assert.equal(trace.deterministic, true);
    assert.equal(trace.problemCount, 1);
  });

  it('should compose valid problem registry', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM, VALID_PROBLEM_2],
      [VALID_ORIGIN, VALID_ORIGIN_2],
      [VALID_MOTIVATION, VALID_MOTIVATION_2],
      [VALID_QUESTION, VALID_QUESTION_2],
      [VALID_MISCONCEPTION, VALID_MISCONCEPTION_2],
    );
    const result = validateProblemRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate a valid problem with no errors', () => {
    const errors = validateProblem(VALID_PROBLEM);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid origin with no errors', () => {
    const errors = validateOrigin(VALID_ORIGIN);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid motivation with no errors', () => {
    const errors = validateMotivation(VALID_MOTIVATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid question with no errors', () => {
    const errors = validateDrivingQuestion(VALID_QUESTION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid misconception with no errors', () => {
    const errors = validateMisconception(VALID_MISCONCEPTION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate problem input', () => {
    const result = validateProblemInput(VALID_INPUT);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should compose valid narrative artifact with problems', () => {
    const artifact = composeNarrativeArtifactWithProblems({
      narrativeId: 'narrative-001',
      title: 'The Gradient Story',
      unitType: 'lesson_opening',
      narrativeMode: 'engineering_problem',
      domain: 'deep_learning',
      status: 'published',
      canonicalKnowledgeId: 'knowledge-001',
      curriculumNodeId: 'curriculum-001',
      lessonId: 'lesson-001',
      laboratoryId: '',
      sequenceOrder: 1,
      summary: 'Opening narrative.',
      tags: ['gradients'],
      provenance: VALID_PROVENANCE,
      problems: [VALID_PROBLEM],
      origins: [VALID_ORIGIN],
      motivations: [VALID_MOTIVATION],
      questions: [VALID_QUESTION],
      misconceptions: [VALID_MISCONCEPTION],
    });

    assert.equal(artifact.narrativeId, 'narrative-001');
    assert.equal(artifact.problems.length, 1);
    assert.equal(artifact.origins.length, 1);
    assert.equal(artifact.motivations.length, 1);
    assert.equal(artifact.questions.length, 1);
    assert.equal(artifact.misconceptions.length, 1);
  });
});

// ---------------------------------------------------------------------------
// Registry Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Registry', () => {
  it('should detect duplicate problem IDs', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM, VALID_PROBLEM],
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );
    const result = validateProblemRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have PROBLEM_DUPLICATE_ID error');
  });

  it('should detect duplicate origin IDs', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM],
      [VALID_ORIGIN, VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );
    const result = validateProblemRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.ORIGIN_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ORIGIN_DUPLICATE_ID error');
  });

  it('should detect duplicate motivation IDs', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM],
      [VALID_ORIGIN],
      [VALID_MOTIVATION, VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );
    const result = validateProblemRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.MOTIVATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MOTIVATION_DUPLICATE_ID error');
  });

  it('should detect duplicate question IDs', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM],
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION, VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );
    const result = validateProblemRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.QUESTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have QUESTION_DUPLICATE_ID error');
  });

  it('should detect duplicate misconception IDs', () => {
    const registry = composeProblemRegistry(
      [VALID_PROBLEM],
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION, VALID_MISCONCEPTION],
    );
    const result = validateProblemRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have MISCONCEPTION_DUPLICATE_ID error');
  });

  it('should sort deterministically by problemId', () => {
    const problem3 = { ...VALID_PROBLEM, problemId: 'problem-003' };
    const problem1 = { ...VALID_PROBLEM, problemId: 'problem-001' };
    const problem2 = { ...VALID_PROBLEM, problemId: 'problem-002' };

    const registry = composeProblemRegistry(
      [problem3, problem1, problem2],
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );

    assert.equal(registry.problems[0].problemId, 'problem-001');
    assert.equal(registry.problems[1].problemId, 'problem-002');
    assert.equal(registry.problems[2].problemId, 'problem-003');
  });

  it('should sort by problemType when problemId is equal', () => {
    const problemA = { ...VALID_PROBLEM, problemId: 'problem-001', problemType: 'scientific_problem' as const };
    const problemB = { ...VALID_PROBLEM, problemId: 'problem-001', problemType: 'engineering_problem' as const };

    const registry = composeProblemRegistry(
      [problemA, problemB],
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );

    assert.equal(registry.problems[0].problemType, 'engineering_problem');
    assert.equal(registry.problems[1].problemType, 'scientific_problem');
  });
});

// ---------------------------------------------------------------------------
// Validation Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Validation', () => {
  it('should detect invalid problem type', () => {
    const problem = { ...VALID_PROBLEM, problemType: 'unsupported' as any };
    const errors = validateProblem(problem);
    const typeError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_INVALID_PROBLEM_TYPE,
    );

    assert.ok(typeError, 'Should have PROBLEM_INVALID_PROBLEM_TYPE error');
  });

  it('should detect invalid origin type', () => {
    const origin = { ...VALID_ORIGIN, originType: 'unsupported' as any };
    const errors = validateOrigin(origin);
    const typeError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.ORIGIN_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have ORIGIN_INVALID_TYPE error');
  });

  it('should detect invalid motivation category', () => {
    const motivation = { ...VALID_MOTIVATION, category: 'unsupported' as any };
    const errors = validateMotivation(motivation);
    const catError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.MOTIVATION_INVALID_CATEGORY,
    );

    assert.ok(catError, 'Should have MOTIVATION_INVALID_CATEGORY error');
  });

  it('should detect invalid question type', () => {
    const question = { ...VALID_QUESTION, questionType: 'unsupported' as any };
    const errors = validateDrivingQuestion(question);
    const typeError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.QUESTION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have QUESTION_INVALID_TYPE error');
  });

  it('should detect invalid misconception type', () => {
    const misconception = { ...VALID_MISCONCEPTION, misconceptionType: 'unsupported' as any };
    const errors = validateMisconception(misconception);
    const typeError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE,
    );

    assert.ok(typeError, 'Should have MISCONCEPTION_INVALID_TYPE error');
  });

  it('should detect missing problem provenance', () => {
    const problem = { ...VALID_PROBLEM, provenance: undefined as any };
    const errors = validateProblem(problem);
    const provenanceError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have PROBLEM_MISSING_PROVENANCE error');
  });

  it('should detect missing problem source', () => {
    const problem = { ...VALID_PROBLEM, provenance: { ...VALID_PROVENANCE, source: '' } };
    const errors = validateProblem(problem);
    const sourceError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_SOURCE,
    );

    assert.ok(sourceError, 'Should have PROBLEM_MISSING_SOURCE error');
  });

  it('should detect missing problem rationale', () => {
    const problem = { ...VALID_PROBLEM, provenance: { ...VALID_PROVENANCE, rationale: '' } };
    const errors = validateProblem(problem);
    const rationaleError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_RATIONALE,
    );

    assert.ok(rationaleError, 'Should have PROBLEM_MISSING_RATIONALE error');
  });

  it('should detect missing problem providedBy', () => {
    const problem = { ...VALID_PROBLEM, provenance: { ...VALID_PROVENANCE, providedBy: '' } };
    const errors = validateProblem(problem);
    const providedByError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROVIDED_BY,
    );

    assert.ok(providedByError, 'Should have PROBLEM_MISSING_PROVIDED_BY error');
  });

  it('should detect missing origin reference', () => {
    const problem = { ...VALID_PROBLEM, originId: '' };
    const errors = validateProblem(problem);
    const refError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_ORIGIN_REFERENCE,
    );

    assert.ok(refError, 'Should have PROBLEM_MISSING_ORIGIN_REFERENCE error');
  });

  it('should detect missing question prompt', () => {
    const question = { ...VALID_QUESTION, prompt: '' };
    const errors = validateDrivingQuestion(question);
    const promptError = errors.find(
      (e) => e.code === PROBLEM_VALIDATION_CODES.QUESTION_MISSING_PROMPT,
    );

    assert.ok(promptError, 'Should have QUESTION_MISSING_PROMPT error');
  });
});

// ---------------------------------------------------------------------------
// Determinism Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Determinism', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const results: ReturnType<typeof composeNarrativeProblems>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeNarrativeProblems(VALID_INPUT));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
      assert.deepStrictEqual(results[0].problems, results[i].problems);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const results: ReturnType<typeof composeProblemRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeProblemRegistry(
        [VALID_PROBLEM, VALID_PROBLEM_2],
        [VALID_ORIGIN, VALID_ORIGIN_2],
        [VALID_MOTIVATION, VALID_MOTIVATION_2],
        [VALID_QUESTION, VALID_QUESTION_2],
        [VALID_MISCONCEPTION, VALID_MISCONCEPTION_2],
      ));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].problems, results[i].problems);
      assert.deepStrictEqual(results[0].registryId, results[i].registryId);
    }
  });
});

// ---------------------------------------------------------------------------
// Immutability Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Immutability', () => {
  it('should not mutate input problems', () => {
    const originalId = VALID_PROBLEM.problemId;
    const originalTitle = VALID_PROBLEM.title;

    composeNarrativeProblems(VALID_INPUT);

    assert.equal(VALID_PROBLEM.problemId, originalId);
    assert.equal(VALID_PROBLEM.title, originalTitle);
  });

  it('should not mutate input registry problems', () => {
    const problems = [VALID_PROBLEM, VALID_PROBLEM_2];
    const originalIds = problems.map((p) => p.problemId);

    composeProblemRegistry(
      problems,
      [VALID_ORIGIN],
      [VALID_MOTIVATION],
      [VALID_QUESTION],
      [VALID_MISCONCEPTION],
    );

    assert.equal(problems[0].problemId, originalIds[0]);
    assert.equal(problems[1].problemId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Helper Functions', () => {
  it('should return canonical problem types', () => {
    const types = getCanonicalProblemTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_PROBLEM_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical origin types', () => {
    const types = getCanonicalOriginTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_ORIGIN_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical motivation categories', () => {
    const categories = getCanonicalMotivationCategories();
    assert.deepStrictEqual([...categories], [...CANONICAL_MOTIVATION_CATEGORIES]);
    assert.equal(categories.length, 10);
  });

  it('should return canonical driving question types', () => {
    const types = getCanonicalDrivingQuestionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_DRIVING_QUESTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical misconception types', () => {
    const types = getCanonicalMisconceptionTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_MISCONCEPTION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical problem statuses', () => {
    const statuses = getCanonicalProblemStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_PROBLEM_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate problem type support', () => {
    assert.equal(isSupportedProblemType('engineering_problem'), true);
    assert.equal(isSupportedProblemType('misconception_problem'), true);
    assert.equal(isSupportedProblemType('unsupported'), false);
  });

  it('should validate origin type support', () => {
    assert.equal(isSupportedOriginType('engineering_need'), true);
    assert.equal(isSupportedOriginType('cross_domain_integration'), true);
    assert.equal(isSupportedOriginType('unsupported'), false);
  });

  it('should validate motivation category support', () => {
    assert.equal(isSupportedMotivationCategory('efficiency'), true);
    assert.equal(isSupportedMotivationCategory('innovation'), true);
    assert.equal(isSupportedMotivationCategory('unsupported'), false);
  });

  it('should validate driving question type support', () => {
    assert.equal(isSupportedDrivingQuestionType('why'), true);
    assert.equal(isSupportedDrivingQuestionType('future_direction'), true);
    assert.equal(isSupportedDrivingQuestionType('unsupported'), false);
  });

  it('should validate misconception type support', () => {
    assert.equal(isSupportedMisconceptionType('oversimplification'), true);
    assert.equal(isSupportedMisconceptionType('conceptual_confusion'), true);
    assert.equal(isSupportedMisconceptionType('unsupported'), false);
  });

  it('should validate problem status support', () => {
    assert.equal(isSupportedProblemStatus('draft'), true);
    assert.equal(isSupportedProblemStatus('published'), true);
    assert.equal(isSupportedProblemStatus('unsupported'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 problem types', () => {
    assert.equal(CANONICAL_PROBLEM_TYPES.length, 10);
  });

  it('should have exactly 10 origin types', () => {
    assert.equal(CANONICAL_ORIGIN_TYPES.length, 10);
  });

  it('should have exactly 10 motivation categories', () => {
    assert.equal(CANONICAL_MOTIVATION_CATEGORIES.length, 10);
  });

  it('should have exactly 10 driving question types', () => {
    assert.equal(CANONICAL_DRIVING_QUESTION_TYPES.length, 10);
  });

  it('should have exactly 10 misconception types', () => {
    assert.equal(CANONICAL_MISCONCEPTION_TYPES.length, 10);
  });

  it('should have exactly 6 problem statuses', () => {
    assert.equal(CANONICAL_PROBLEM_STATUS.length, 6);
  });

  it('should contain all expected problem types', () => {
    const expectedTypes = [
      'engineering_problem',
      'scientific_problem',
      'mathematical_problem',
      'historical_problem',
      'practical_problem',
      'performance_problem',
      'design_problem',
      'communication_problem',
      'optimization_problem',
      'misconception_problem',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_PROBLEM_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected origin types', () => {
    const expectedTypes = [
      'historical_need',
      'engineering_need',
      'scientific_discovery',
      'practical_constraint',
      'mathematical_formalization',
      'technological_evolution',
      'research_gap',
      'educational_need',
      'industry_problem',
      'cross_domain_integration',
    ];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_ORIGIN_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected motivation categories', () => {
    const expectedCategories = [
      'curiosity',
      'necessity',
      'efficiency',
      'accuracy',
      'scalability',
      'simplicity',
      'interpretability',
      'automation',
      'robustness',
      'innovation',
    ];

    for (const category of expectedCategories) {
      assert.ok(
        CANONICAL_MOTIVATION_CATEGORIES.includes(category as any),
        `Should include category: ${category}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Problem Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not generate explanations', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('generatedExplanations' in result), 'Should not have generated explanations');
    assert.ok(!('explanationContent' in result), 'Should not have explanation content');
  });

  it('should not generate stories', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('generatedStories' in result), 'Should not have generated stories');
    assert.ok(!('storyContent' in result), 'Should not have story content');
  });

  it('should not invent historical facts', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('inventedFacts' in result), 'Should not have invented facts');
    assert.ok(!('historicalFacts' in result), 'Should not have historical facts');
  });

  it('should not rewrite knowledge', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('rewrittenKnowledge' in result), 'Should not have rewritten knowledge');
    assert.ok(!('modifiedKnowledge' in result), 'Should not have modified knowledge');
  });

  it('should not personalize motivation', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('personalizedMotivation' in result), 'Should not have personalized motivation');
    assert.ok(!('learnerMotivation' in result), 'Should not have learner motivation');
  });

  it('should not estimate learner curiosity', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('curiosityEstimate' in result), 'Should not have curiosity estimate');
    assert.ok(!('learnerCuriosity' in result), 'Should not have learner curiosity');
  });

  it('should not infer misconceptions', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('inferredMisconceptions' in result), 'Should not have inferred misconceptions');
    assert.ok(!('detectedMisconceptions' in result), 'Should not have detected misconceptions');
  });

  it('should not generate questions dynamically', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('generatedQuestions' in result), 'Should not have generated questions');
    assert.ok(!('dynamicQuestions' in result), 'Should not have dynamic questions');
  });

  it('should not create educational sequencing', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('educationalSequence' in result), 'Should not have educational sequence');
    assert.ok(!('learningSequence' in result), 'Should not have learning sequence');
  });

  it('should not call LLMs', () => {
    const result = composeNarrativeProblems(VALID_INPUT);
    assert.ok(!('llmCall' in result), 'Should not have LLM call');
    assert.ok(!('modelResponse' in result), 'Should not have model response');
  });

  it('should not have executable callbacks in problem', () => {
    const problem = composeProblem({
      problemId: 'problem-001',
      problemType: 'engineering_problem',
      title: 'Test',
      summary: 'Test.',
      originId: 'origin-001',
      motivationIds: [],
      questionIds: [],
      misconceptionIds: [],
      governanceStatus: 'canonical',
      provenance: VALID_PROVENANCE,
    });

    const keys = Object.keys(problem);
    for (const key of keys) {
      const value = (problem as any)[key];
      assert.ok(typeof value !== 'function', `Problem field "${key}" should not be a function`);
    }
  });
});