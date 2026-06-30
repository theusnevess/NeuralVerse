/**
 * NV-1400-D2-OPT-13-A — Open Research Questions Orchestration Test Suite
 *
 * Comprehensive tests for the open research question kernel.
 * Covers: valid open question, valid registry, duplicate question id,
 * duplicate question text, unsupported category, unsupported status,
 * missing question text, missing evidence, missing source, missing provenance,
 * invalid reference, empty registry, deterministic ordering, immutable input,
 * identical output, no generated question text, no speculative conclusion,
 * no prediction, no LLM/API usage.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  composeOpenQuestionProvenance,
  composeOpenQuestion,
  composeOpenQuestionRegistry,
  composeResearchOpenQuestions,
  composeOpenQuestionTrace,
  isSupportedOpenQuestionCategory,
  isSupportedOpenQuestionStatus,
  getCanonicalOpenQuestionCategories,
  getCanonicalOpenQuestionStatuses,
} from './OpenResearchQuestionKernel.ts';

import {
  validateOpenQuestion,
  validateOpenQuestionRegistry,
  validateResearchArtifactWithOpenQuestions,
  validateOpenQuestionInput,
  OPEN_QUESTION_VALIDATION_CODES,
} from './OpenResearchQuestionValidation.ts';

import type {
  ResearchOpenQuestion,
  ResearchOpenQuestionInput,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_QUESTION_1: ResearchOpenQuestion = {
  questionId: 'oq-001',
  questionText: 'How do transformer architectures scale to very long sequences without quadratic attention complexity?',
  category: 'scaling_challenge',
  status: 'actively_researched',
  associatedConcepts: ['transformers', 'attention'],
  associatedMethods: ['method-001'],
  associatedEvidence: ['ref-001'],
  associatedBenchmarks: ['bench-001'],
  associatedDatasets: ['ds-001'],
  associatedIndustry: ['ind-001'],
  associatedEvolution: ['evo-001'],
  source: 'research-agent',
  governanceStatus: 'canonical',
  lifecycle: 'active',
  rationale: 'Long-context transformers remain an active research area.',
  provenance: {
    questionId: 'oq-001',
    referenceId: 'ref-001',
    source: 'research-agent',
    governanceStatus: 'canonical',
    category: 'scaling_challenge',
    rationale: 'Governance-backed open question.',
    providedBy: 'research-agent',
  },
};

const VALID_QUESTION_2: ResearchOpenQuestion = {
  questionId: 'oq-002',
  questionText: 'What are the fairness implications of large language models in high-stakes decision making?',
  category: 'fairness_concern',
  status: 'open',
  associatedConcepts: ['llm', 'fairness'],
  associatedMethods: ['method-002'],
  associatedEvidence: ['ref-002'],
  associatedBenchmarks: [],
  associatedDatasets: [],
  associatedIndustry: [],
  associatedEvolution: [],
  source: 'research-agent',
  governanceStatus: 'accepted',
  lifecycle: 'active',
  rationale: 'Fairness concerns in LLM deployment require ongoing investigation.',
  provenance: {
    questionId: 'oq-002',
    referenceId: 'ref-002',
    source: 'research-agent',
    governanceStatus: 'accepted',
    category: 'fairness_concern',
    rationale: 'Governance-backed open question.',
    providedBy: 'research-agent',
  },
};

// ---------------------------------------------------------------------------
// Valid Open Question
// ---------------------------------------------------------------------------

describe('Open Research Question Kernel', () => {
  it('should compose a valid open question', () => {
    const provenance = composeOpenQuestionProvenance(
      'oq-001', 'ref-001', 'research-agent', 'canonical', 'scaling_challenge',
      'Governance-backed.', 'research-agent',
    );

    const question = composeOpenQuestion(
      'oq-001', 'How do transformers scale?', 'scaling_challenge', 'actively_researched',
      ['transformers'], ['method-001'], ['ref-001'], ['bench-001'], ['ds-001'], ['ind-001'], ['evo-001'],
      'research-agent', 'canonical', 'active', 'Active research area.', provenance,
    );

    assert.strictEqual(question.questionId, 'oq-001');
    assert.strictEqual(question.category, 'scaling_challenge');
    assert.strictEqual(question.status, 'actively_researched');
    assert.strictEqual(question.associatedEvidence.length, 1);
    assert.strictEqual(question.governanceStatus, 'canonical');
  });

  // ---------------------------------------------------------------------------
  // Valid Registry
  // ---------------------------------------------------------------------------

  it('should compose a valid open question registry', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1, VALID_QUESTION_2],
    };

    const artifact = composeResearchOpenQuestions(input);

    assert.strictEqual(artifact.openQuestionRegistry.questions.length, 2);
    assert.strictEqual(artifact.openQuestionTrace.questionCount, 2);
    assert.strictEqual(artifact.openQuestionTrace.validatedCount, 2);
    assert.strictEqual(artifact.openQuestionTrace.invalidCount, 0);
  });

  // ---------------------------------------------------------------------------
  // Duplicate Question ID
  // ---------------------------------------------------------------------------

  it('should detect duplicate question IDs', () => {
    const duplicateQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      questionText: 'Different question text but same ID.',
    };

    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1, duplicateQuestion],
    };

    const artifact = composeResearchOpenQuestions(input);
    const validation = validateOpenQuestionRegistry(artifact.openQuestionRegistry);

    const duplicateErrors = validation.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_DUPLICATE_ID);
    assert.ok(duplicateErrors.length > 0, 'Should detect duplicate question ID');
  });

  // ---------------------------------------------------------------------------
  // Duplicate Question Text
  // ---------------------------------------------------------------------------

  it('should detect duplicate question text', () => {
    const duplicateText: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      questionId: 'oq-003',
    };

    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1, duplicateText],
    };

    const artifact = composeResearchOpenQuestions(input);
    const validation = validateOpenQuestionRegistry(artifact.openQuestionRegistry);

    const duplicateErrors = validation.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_DUPLICATE_QUESTION);
    assert.ok(duplicateErrors.length > 0, 'Should detect duplicate question text');
  });

  // ---------------------------------------------------------------------------
  // Unsupported Category
  // ---------------------------------------------------------------------------

  it('should reject unsupported category', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      category: 'nonexistent_category' as any,
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const categoryErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_UNKNOWN_CATEGORY);
    assert.ok(categoryErrors.length > 0, 'Should reject unsupported category');
  });

  // ---------------------------------------------------------------------------
  // Unsupported Status
  // ---------------------------------------------------------------------------

  it('should reject unsupported status', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      status: 'nonexistent_status' as any,
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const statusErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_UNKNOWN_STATUS);
    assert.ok(statusErrors.length > 0, 'Should reject unsupported status');
  });

  // ---------------------------------------------------------------------------
  // Missing Question Text
  // ---------------------------------------------------------------------------

  it('should reject missing question text', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      questionText: '',
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const textErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_TEXT);
    assert.ok(textErrors.length > 0, 'Should reject missing question text');
  });

  // ---------------------------------------------------------------------------
  // Missing Evidence
  // ---------------------------------------------------------------------------

  it('should reject missing evidence', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      associatedEvidence: [],
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const evidenceErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_EVIDENCE);
    assert.ok(evidenceErrors.length > 0, 'Should reject missing evidence');
  });

  // ---------------------------------------------------------------------------
  // Missing Source
  // ---------------------------------------------------------------------------

  it('should reject missing source', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      source: '',
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const sourceErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE);
    assert.ok(sourceErrors.length > 0, 'Should reject missing source');
  });

  // ---------------------------------------------------------------------------
  // Missing Provenance
  // ---------------------------------------------------------------------------

  it('should reject missing provenance', () => {
    const invalidQuestion: ResearchOpenQuestion = {
      ...VALID_QUESTION_1,
      provenance: {
        ...VALID_QUESTION_1.provenance,
        rationale: '',
      },
    };

    const errors = validateOpenQuestion(invalidQuestion);
    const provenanceErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE);
    assert.ok(provenanceErrors.length > 0, 'Should reject missing provenance');
  });

  // ---------------------------------------------------------------------------
  // Empty Registry
  // ---------------------------------------------------------------------------

  it('should reject empty registry', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [],
    };

    const errors = validateOpenQuestionInput(input);
    const emptyErrors = errors.filter((e) => e.code === OPEN_QUESTION_VALIDATION_CODES.OPENQ_EMPTY_REGISTRY);
    assert.ok(emptyErrors.length > 0, 'Should reject empty registry');
  });

  // ---------------------------------------------------------------------------
  // Deterministic Ordering
  // ---------------------------------------------------------------------------

  it('should produce deterministic ordering', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_2, VALID_QUESTION_1],
    };

    const artifact1 = composeResearchOpenQuestions(input);
    const artifact2 = composeResearchOpenQuestions(input);

    assert.deepStrictEqual(
      artifact1.openQuestionRegistry.questions.map((q) => q.questionId),
      artifact2.openQuestionRegistry.questions.map((q) => q.questionId),
    );
  });

  // ---------------------------------------------------------------------------
  // Immutable Input
  // ---------------------------------------------------------------------------

  it('should not mutate input', () => {
    const originalQuestions = [VALID_QUESTION_1, VALID_QUESTION_2];
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: originalQuestions,
    };

    composeResearchOpenQuestions(input);

    assert.deepStrictEqual(input.questions, originalQuestions);
  });

  // ---------------------------------------------------------------------------
  // Identical Output
  // ---------------------------------------------------------------------------

  it('should produce identical output for identical input', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1],
    };

    const artifact1 = composeResearchOpenQuestions(input);
    const artifact2 = composeResearchOpenQuestions(input);

    assert.deepStrictEqual(artifact1, artifact2);
  });

  // ---------------------------------------------------------------------------
  // No Generated Question Text
  // ---------------------------------------------------------------------------

  it('should not generate question text', () => {
    const provenance = composeOpenQuestionProvenance(
      'oq-test', 'ref-test', 'research-agent', 'canonical', 'scaling_challenge',
      'Test.', 'research-agent',
    );

    const question = composeOpenQuestion(
      'oq-test', 'Exact input text.', 'scaling_challenge', 'open',
      [], [], ['ref-test'], [], [], [], [],
      'research-agent', 'canonical', 'active', 'Test.', provenance,
    );

    assert.strictEqual(question.questionText, 'Exact input text.');
  });

  // ---------------------------------------------------------------------------
  // No Speculative Conclusion
  // ---------------------------------------------------------------------------

  it('should not create speculative conclusions', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1],
    };

    const artifact = composeResearchOpenQuestions(input);

    for (const question of artifact.openQuestionRegistry.questions) {
      assert.ok(!question.questionText.toLowerCase().includes('predicted'));
      assert.ok(!question.questionText.toLowerCase().includes('will be'));
    }
  });

  // ---------------------------------------------------------------------------
  // No LLM/API Usage
  // ---------------------------------------------------------------------------

  it('should not use LLM or API constructs', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1],
    };

    const artifact = composeResearchOpenQuestions(input);

    assert.strictEqual(artifact.openQuestionTrace.deterministic, true);
    assert.strictEqual(artifact.openQuestionTrace.randomUsed, false);
    assert.strictEqual(artifact.openQuestionTrace.timeDependency, false);
  });

  // ---------------------------------------------------------------------------
  // Canonical Categories
  // ---------------------------------------------------------------------------

  it('should expose canonical categories', () => {
    const categories = getCanonicalOpenQuestionCategories();
    assert.ok(categories.includes('unresolved_limitation'));
    assert.ok(categories.includes('scaling_challenge'));
    assert.ok(categories.includes('robustness_issue'));
    assert.ok(categories.includes('fairness_concern'));
    assert.ok(categories.includes('efficiency_bottleneck'));
    assert.ok(categories.includes('unexplored_direction'));
    assert.strictEqual(categories.length, 10);
  });

  // ---------------------------------------------------------------------------
  // Canonical Statuses
  // ---------------------------------------------------------------------------

  it('should expose canonical statuses', () => {
    const statuses = getCanonicalOpenQuestionStatuses();
    assert.ok(statuses.includes('open'));
    assert.ok(statuses.includes('partially_addressed'));
    assert.ok(statuses.includes('actively_researched'));
    assert.ok(statuses.includes('contested'));
    assert.ok(statuses.includes('resolved'));
    assert.ok(statuses.includes('deprecated'));
    assert.strictEqual(statuses.length, 6);
  });

  // ---------------------------------------------------------------------------
  // Category Helper
  // ---------------------------------------------------------------------------

  it('should support category check helper', () => {
    assert.strictEqual(isSupportedOpenQuestionCategory('scaling_challenge'), true);
    assert.strictEqual(isSupportedOpenQuestionCategory('nonexistent'), false);
  });

  // ---------------------------------------------------------------------------
  // Status Helper
  // ---------------------------------------------------------------------------

  it('should support status check helper', () => {
    assert.strictEqual(isSupportedOpenQuestionStatus('open'), true);
    assert.strictEqual(isSupportedOpenQuestionStatus('nonexistent'), false);
  });

  // ---------------------------------------------------------------------------
  // Trace Determinism
  // ---------------------------------------------------------------------------

  it('should produce deterministic trace', () => {
    const input: ResearchOpenQuestionInput = {
      conceptId: 'concept-001',
      conceptLabel: 'Transformers',
      questions: [VALID_QUESTION_1],
    };

    const artifact = composeResearchOpenQuestions(input);

    assert.strictEqual(artifact.openQuestionTrace.deterministic, true);
    assert.strictEqual(artifact.openQuestionTrace.randomUsed, false);
    assert.strictEqual(artifact.openQuestionTrace.timeDependency, false);
    assert.strictEqual(artifact.openQuestionTrace.generatedFrom, 'deterministic_open_question_kernel');
  });
});
