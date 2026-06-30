/**
 * NV-1400-D2-OPT-13-A — Open Research Question Validation Layer
 *
 * Deterministic validation for open research question metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchOpenQuestion,
  ResearchOpenQuestionRegistry,
  ResearchArtifactWithOpenQuestions,
  ResearchOpenQuestionValidationError,
  ResearchOpenQuestionValidationResult,
  ResearchOpenQuestionInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_OPEN_QUESTION_CATEGORIES,
  CANONICAL_OPEN_QUESTION_STATUSES,
  CANONICAL_GOVERNANCE_STATUSES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const OPEN_QUESTION_VALIDATION_CODES = {
  OPENQ_UNKNOWN_CATEGORY: 'OPENQ_UNKNOWN_CATEGORY',
  OPENQ_UNKNOWN_STATUS: 'OPENQ_UNKNOWN_STATUS',
  OPENQ_DUPLICATE_ID: 'OPENQ_DUPLICATE_ID',
  OPENQ_DUPLICATE_QUESTION: 'OPENQ_DUPLICATE_QUESTION',
  OPENQ_MISSING_TEXT: 'OPENQ_MISSING_TEXT',
  OPENQ_MISSING_CATEGORY: 'OPENQ_MISSING_CATEGORY',
  OPENQ_MISSING_EVIDENCE: 'OPENQ_MISSING_EVIDENCE',
  OPENQ_MISSING_SOURCE: 'OPENQ_MISSING_SOURCE',
  OPENQ_MISSING_PROVENANCE: 'OPENQ_MISSING_PROVENANCE',
  OPENQ_INVALID_REFERENCE: 'OPENQ_INVALID_REFERENCE',
  OPENQ_EMPTY_REGISTRY: 'OPENQ_EMPTY_REGISTRY',
  OPENQ_INVALID_GOVERNANCE: 'OPENQ_INVALID_GOVERNANCE',
  OPENQ_GENERATED_CONTENT_FORBIDDEN: 'OPENQ_GENERATED_CONTENT_FORBIDDEN',
  OPENQ_SPECULATIVE_CONCLUSION_FORBIDDEN: 'OPENQ_SPECULATIVE_CONCLUSION_FORBIDDEN',
} as const;

// ---------------------------------------------------------------------------
// Question Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single open question.
 * Pure function. No side effects.
 */
export function validateOpenQuestion(
  question: ResearchOpenQuestion,
): readonly ResearchOpenQuestionValidationError[] {
  const errors: ResearchOpenQuestionValidationError[] = [];

  if (!question.questionId || question.questionId.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE,
      message: 'Open question is missing a question ID.',
      field: 'questionId',
      questionId: question.questionId,
    });
  }

  if (!question.questionText || question.questionText.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_TEXT,
      message: 'Open question is missing question text.',
      field: 'questionText',
      questionId: question.questionId,
    });
  }

  if (!question.category || question.category.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_CATEGORY,
      message: 'Open question is missing a category.',
      field: 'category',
      questionId: question.questionId,
    });
  } else if (!CANONICAL_OPEN_QUESTION_CATEGORIES.includes(question.category)) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_UNKNOWN_CATEGORY,
      message: `Open question has unsupported category: "${question.category}".`,
      field: 'category',
      questionId: question.questionId,
    });
  }

  if (!question.status || question.status.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_UNKNOWN_STATUS,
      message: 'Open question is missing a status.',
      field: 'status',
      questionId: question.questionId,
    });
  } else if (!CANONICAL_OPEN_QUESTION_STATUSES.includes(question.status)) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_UNKNOWN_STATUS,
      message: `Open question has unsupported status: "${question.status}".`,
      field: 'status',
      questionId: question.questionId,
    });
  }

  if (!question.associatedEvidence || question.associatedEvidence.length === 0) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_EVIDENCE,
      message: 'Open question has no associated evidence.',
      field: 'associatedEvidence',
      questionId: question.questionId,
    });
  }

  if (!question.source || question.source.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE,
      message: 'Open question is missing a source.',
      field: 'source',
      questionId: question.questionId,
    });
  }

  if (!question.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(question.governanceStatus)) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_INVALID_GOVERNANCE,
      message: `Open question has invalid governance status: "${question.governanceStatus}".`,
      field: 'governanceStatus',
      questionId: question.questionId,
    });
  }

  if (!question.provenance || typeof question.provenance !== 'object') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Open question is missing provenance.',
      field: 'provenance',
      questionId: question.questionId,
    });
  } else {
    if (!question.provenance.rationale || question.provenance.rationale.trim() === '') {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
        message: 'Open question provenance is missing rationale.',
        field: 'provenance.rationale',
        questionId: question.questionId,
      });
    }
    if (!question.provenance.source || question.provenance.source.trim() === '') {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE,
        message: 'Open question provenance is missing source.',
        field: 'provenance.source',
        questionId: question.questionId,
      });
    }
  }

  if (!question.rationale || question.rationale.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Open question is missing a rationale.',
      field: 'rationale',
      questionId: question.questionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an open question registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateOpenQuestionRegistry(
  registry: ResearchOpenQuestionRegistry,
): readonly ResearchOpenQuestionValidationError[] {
  const errors: ResearchOpenQuestionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_EMPTY_REGISTRY,
      message: 'Open question registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.questions || registry.questions.length === 0) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_EMPTY_REGISTRY,
      message: 'Open question registry is empty.',
      field: 'questions',
    });
    return errors;
  }

  // Check for duplicate question IDs
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  for (const question of registry.questions) {
    // Individual question validation
    errors.push(...validateOpenQuestion(question));

    // Duplicate question ID
    if (seenIds.has(question.questionId)) {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_DUPLICATE_ID,
        message: `Duplicate open question ID: "${question.questionId}".`,
        questionId: question.questionId,
      });
    }
    seenIds.add(question.questionId);

    // Duplicate question text
    const normalizedText = question.questionText.trim().toLowerCase();
    if (seenTexts.has(normalizedText)) {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_DUPLICATE_QUESTION,
        message: `Duplicate open question text: "${question.questionText}".`,
        questionId: question.questionId,
      });
    }
    seenTexts.add(normalizedText);
  }

  // Validate determinism flags
  if (registry.deterministic !== true) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }
  if (registry.randomUsed !== false) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }
  if (registry.timeDependency !== false) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a research artifact with open questions.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithOpenQuestions(
  artifact: ResearchArtifactWithOpenQuestions,
): ResearchOpenQuestionValidationResult {
  const errors: ResearchOpenQuestionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate open question registry
  errors.push(...validateOpenQuestionRegistry(artifact.openQuestionRegistry));

  // Validate trace
  if (!artifact.openQuestionTrace || typeof artifact.openQuestionTrace !== 'object') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
      message: 'Research artifact is missing open question trace.',
      field: 'openQuestionTrace',
    });
  } else {
    if (artifact.openQuestionTrace.deterministic !== true) {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
        message: 'Open question trace must declare deterministic: true.',
        field: 'openQuestionTrace.deterministic',
      });
    }
    if (artifact.openQuestionTrace.randomUsed !== false) {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
        message: 'Open question trace must declare randomUsed: false.',
        field: 'openQuestionTrace.randomUsed',
      });
    }
    if (artifact.openQuestionTrace.timeDependency !== false) {
      errors.push({
        code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_PROVENANCE,
        message: 'Open question trace must declare timeDependency: false.',
        field: 'openQuestionTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'open_question_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research open question input.
 * Pure function. No side effects.
 */
export function validateOpenQuestionInput(
  input: ResearchOpenQuestionInput,
): readonly ResearchOpenQuestionValidationError[] {
  const errors: ResearchOpenQuestionValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE,
      message: 'Open question input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_MISSING_SOURCE,
      message: 'Open question input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.questions || input.questions.length === 0) {
    errors.push({
      code: OPEN_QUESTION_VALIDATION_CODES.OPENQ_EMPTY_REGISTRY,
      message: 'Open question input has no questions.',
      field: 'questions',
    });
  } else {
    for (const question of input.questions) {
      errors.push(...validateOpenQuestion(question));
    }
  }

  return errors;
}
