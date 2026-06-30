/**
 * NV-1400-D2-OPT-13-A — Open Research Questions Orchestration Kernel
 *
 * Deterministic orchestration functions for open research question metadata.
 * Produces open question registries, questions, and traces.
 *
 * This module never:
 * - Generates question text
 * - Infers open questions
 * - Predicts future research
 * - Recommends questions
 * - Calls external APIs
 * - Uses LLMs
 * - Writes or modifies question content
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchOpenQuestion,
  ResearchOpenQuestionRegistry,
  ResearchOpenQuestionDecision,
  ResearchOpenQuestionTrace,
  ResearchOpenQuestionInput,
  ResearchArtifactWithOpenQuestions,
  ResearchOpenQuestionCategory,
  ResearchOpenQuestionStatus,
  ResearchOpenQuestionProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_OPEN_QUESTION_CATEGORIES,
  CANONICAL_OPEN_QUESTION_STATUSES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Open Question Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes open question provenance.
 * Pure function. No side effects.
 */
export function composeOpenQuestionProvenance(
  questionId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  category: ResearchOpenQuestionCategory,
  rationale: string,
  providedBy: string,
): ResearchOpenQuestionProvenance {
  return {
    questionId,
    referenceId,
    source,
    governanceStatus,
    category,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Open Question Composition
// ---------------------------------------------------------------------------

/**
 * Composes an open research question.
 * Pure function. No side effects.
 * questionText is supplied by input — never generated.
 */
export function composeOpenQuestion(
  questionId: string,
  questionText: string,
  category: ResearchOpenQuestionCategory,
  status: ResearchOpenQuestionStatus,
  associatedConcepts: readonly string[],
  associatedMethods: readonly string[],
  associatedEvidence: readonly string[],
  associatedBenchmarks: readonly string[],
  associatedDatasets: readonly string[],
  associatedIndustry: readonly string[],
  associatedEvolution: readonly string[],
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchOpenQuestionProvenance,
): ResearchOpenQuestion {
  return {
    questionId,
    questionText,
    category,
    status,
    associatedConcepts: [...associatedConcepts],
    associatedMethods: [...associatedMethods],
    associatedEvidence: [...associatedEvidence],
    associatedBenchmarks: [...associatedBenchmarks],
    associatedDatasets: [...associatedDatasets],
    associatedIndustry: [...associatedIndustry],
    associatedEvolution: [...associatedEvolution],
    source,
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Open Question Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an open question registry from questions.
 * Pure function. No side effects.
 */
export function composeOpenQuestionRegistry(
  registryId: string,
  questions: readonly ResearchOpenQuestion[],
): ResearchOpenQuestionRegistry {
  const sortedQuestions = _sortQuestionsDeterministically(questions);

  return {
    registryId,
    questions: [...sortedQuestions],
    deterministic: true,
    generatedFrom: 'deterministic_open_question_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Open Questions Composition
// ---------------------------------------------------------------------------

/**
 * Composes research open questions from an input.
 * Pure function. No side effects.
 */
export function composeResearchOpenQuestions(
  input: ResearchOpenQuestionInput,
): ResearchArtifactWithOpenQuestions {
  const decisions = _composeDecisions(input);

  const trace: ResearchOpenQuestionTrace = {
    traceId: `_open_question_trace_${input.conceptId}`,
    questionCount: input.questions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_open_question_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeOpenQuestionRegistry(
    `_open_question_registry_${input.conceptId}`,
    input.questions,
  );

  return {
    artifactId: `_open_question_artifact_${input.conceptId}`,
    artifactType: 'concept',
    openQuestionRegistry: registry,
    openQuestionTrace: trace,
  };
}

/**
 * Composes open question decisions from input questions.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchOpenQuestionInput,
): readonly ResearchOpenQuestionDecision[] {
  return input.questions.map((question) => {
    const validationErrors = _validateQuestionForDecision(question);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${question.questionId}`,
      questionId: question.questionId,
      category: question.category,
      status: question.status,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates an open question for decision composition.
 * Returns validation error codes.
 */
function _validateQuestionForDecision(question: ResearchOpenQuestion): readonly string[] {
  const errors: string[] = [];

  if (!question.questionId || question.questionId.trim() === '') {
    errors.push('OPENQ_MISSING_SOURCE');
  }

  if (!question.questionText || question.questionText.trim() === '') {
    errors.push('OPENQ_MISSING_TEXT');
  }

  if (!CANONICAL_OPEN_QUESTION_CATEGORIES.includes(question.category)) {
    errors.push('OPENQ_UNKNOWN_CATEGORY');
  }

  if (!CANONICAL_OPEN_QUESTION_STATUSES.includes(question.status)) {
    errors.push('OPENQ_UNKNOWN_STATUS');
  }

  if (!question.associatedEvidence || question.associatedEvidence.length === 0) {
    errors.push('OPENQ_MISSING_EVIDENCE');
  }

  if (!question.source || question.source.trim() === '') {
    errors.push('OPENQ_MISSING_SOURCE');
  }

  if (!question.provenance || !question.provenance.rationale || question.provenance.rationale.trim() === '') {
    errors.push('OPENQ_MISSING_PROVENANCE');
  }

  if (!question.governanceStatus || question.governanceStatus.trim() === '') {
    errors.push('OPENQ_INVALID_GOVERNANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts open questions deterministically.
 * Sorting based on questionId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortQuestionsDeterministically(
  questions: readonly ResearchOpenQuestion[],
): readonly ResearchOpenQuestion[] {
  return [...questions].sort((a, b) => a.questionId.localeCompare(b.questionId));
}

// ---------------------------------------------------------------------------
// Open Question Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an open question trace.
 * Pure function. No side effects.
 */
export function composeOpenQuestionTrace(
  traceId: string,
  decisions: readonly ResearchOpenQuestionDecision[],
): ResearchOpenQuestionTrace {
  return {
    traceId,
    questionCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_open_question_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Category and Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if an open question category is supported (in canonical categories).
 */
export function isSupportedOpenQuestionCategory(
  category: string,
): category is ResearchOpenQuestionCategory {
  return CANONICAL_OPEN_QUESTION_CATEGORIES.includes(category as ResearchOpenQuestionCategory);
}

/**
 * Checks if an open question status is supported (in canonical statuses).
 */
export function isSupportedOpenQuestionStatus(
  status: string,
): status is ResearchOpenQuestionStatus {
  return CANONICAL_OPEN_QUESTION_STATUSES.includes(status as ResearchOpenQuestionStatus);
}

/**
 * Returns all canonical open question categories.
 */
export function getCanonicalOpenQuestionCategories(): readonly ResearchOpenQuestionCategory[] {
  return CANONICAL_OPEN_QUESTION_CATEGORIES;
}

/**
 * Returns all canonical open question statuses.
 */
export function getCanonicalOpenQuestionStatuses(): readonly ResearchOpenQuestionStatus[] {
  return CANONICAL_OPEN_QUESTION_STATUSES;
}
