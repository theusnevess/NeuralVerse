/**
 * NV-1700-D6-OPT-03 — Problem-Origin Validation Layer
 *
 * Deterministic validation for problem-origin metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  Problem,
  Origin,
  ProblemMotivation,
  DrivingQuestion,
  Misconception,
  ProblemRegistry,
  ProblemInput,
  NarrativeArtifactWithProblems,
  ProblemValidationError,
  ProblemUnitValidationResult,
  OriginValidationResult,
  ProblemMotivationValidationResult,
  DrivingQuestionValidationResult,
  MisconceptionValidationResult,
  ProblemRegistryValidationResult,
  ProblemInputValidationResult,
  NarrativeArtifactWithProblemsValidationResult,
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

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const PROBLEM_VALIDATION_CODES = {
  PROBLEM_DUPLICATE_ID: 'PROBLEM_DUPLICATE_ID',
  PROBLEM_DUPLICATE_TITLE: 'PROBLEM_DUPLICATE_TITLE',
  PROBLEM_INVALID_PROBLEM_TYPE: 'PROBLEM_INVALID_PROBLEM_TYPE',
  PROBLEM_INVALID_GOVERNANCE_STATUS: 'PROBLEM_INVALID_GOVERNANCE_STATUS',
  PROBLEM_MISSING_PROVENANCE: 'PROBLEM_MISSING_PROVENANCE',
  PROBLEM_MISSING_SOURCE: 'PROBLEM_MISSING_SOURCE',
  PROBLEM_MISSING_RATIONALE: 'PROBLEM_MISSING_RATIONALE',
  PROBLEM_MISSING_PROVIDED_BY: 'PROBLEM_MISSING_PROVIDED_BY',
  PROBLEM_MISSING_PROBLEM_ID: 'PROBLEM_MISSING_PROBLEM_ID',
  PROBLEM_MISSING_TITLE: 'PROBLEM_MISSING_TITLE',
  PROBLEM_MISSING_ORIGIN_REFERENCE: 'PROBLEM_MISSING_ORIGIN_REFERENCE',
  PROBLEM_EMPTY_REGISTRY: 'PROBLEM_EMPTY_REGISTRY',
  PROBLEM_INVALID_TRACE: 'PROBLEM_INVALID_TRACE',
  PROBLEM_TRACE_RANDOM_USED: 'PROBLEM_TRACE_RANDOM_USED',
  PROBLEM_TRACE_TIME_DEPENDENCY: 'PROBLEM_TRACE_TIME_DEPENDENCY',
  ORIGIN_DUPLICATE_ID: 'ORIGIN_DUPLICATE_ID',
  ORIGIN_INVALID_TYPE: 'ORIGIN_INVALID_TYPE',
  ORIGIN_MISSING_PROVENANCE: 'ORIGIN_MISSING_PROVENANCE',
  ORIGIN_MISSING_SOURCE: 'ORIGIN_MISSING_SOURCE',
  ORIGIN_MISSING_RATIONALE: 'ORIGIN_MISSING_RATIONALE',
  ORIGIN_MISSING_PROVIDED_BY: 'ORIGIN_MISSING_PROVIDED_BY',
  ORIGIN_MISSING_ORIGIN_ID: 'ORIGIN_MISSING_ORIGIN_ID',
  ORIGIN_MISSING_TITLE: 'ORIGIN_MISSING_TITLE',
  MOTIVATION_DUPLICATE_ID: 'MOTIVATION_DUPLICATE_ID',
  MOTIVATION_INVALID_CATEGORY: 'MOTIVATION_INVALID_CATEGORY',
  MOTIVATION_MISSING_PROVENANCE: 'MOTIVATION_MISSING_PROVENANCE',
  MOTIVATION_MISSING_SOURCE: 'MOTIVATION_MISSING_SOURCE',
  MOTIVATION_MISSING_RATIONALE: 'MOTIVATION_MISSING_RATIONALE',
  MOTIVATION_MISSING_PROVIDED_BY: 'MOTIVATION_MISSING_PROVIDED_BY',
  MOTIVATION_MISSING_MOTIVATION_ID: 'MOTIVATION_MISSING_MOTIVATION_ID',
  MOTIVATION_MISSING_TITLE: 'MOTIVATION_MISSING_TITLE',
  QUESTION_DUPLICATE_ID: 'QUESTION_DUPLICATE_ID',
  QUESTION_INVALID_TYPE: 'QUESTION_INVALID_TYPE',
  QUESTION_MISSING_PROVENANCE: 'QUESTION_MISSING_PROVENANCE',
  QUESTION_MISSING_SOURCE: 'QUESTION_MISSING_SOURCE',
  QUESTION_MISSING_RATIONALE: 'QUESTION_MISSING_RATIONALE',
  QUESTION_MISSING_PROVIDED_BY: 'QUESTION_MISSING_PROVIDED_BY',
  QUESTION_MISSING_QUESTION_ID: 'QUESTION_MISSING_QUESTION_ID',
  QUESTION_MISSING_PROMPT: 'QUESTION_MISSING_PROMPT',
  MISCONCEPTION_DUPLICATE_ID: 'MISCONCEPTION_DUPLICATE_ID',
  MISCONCEPTION_INVALID_TYPE: 'MISCONCEPTION_INVALID_TYPE',
  MISCONCEPTION_MISSING_PROVENANCE: 'MISCONCEPTION_MISSING_PROVENANCE',
  MISCONCEPTION_MISSING_SOURCE: 'MISCONCEPTION_MISSING_SOURCE',
  MISCONCEPTION_MISSING_RATIONALE: 'MISCONCEPTION_MISSING_RATIONALE',
  MISCONCEPTION_MISSING_PROVIDED_BY: 'MISCONCEPTION_MISSING_PROVIDED_BY',
  MISCONCEPTION_MISSING_MISCONCEPTION_ID: 'MISCONCEPTION_MISSING_MISCONCEPTION_ID',
  MISCONCEPTION_MISSING_TITLE: 'MISCONCEPTION_MISSING_TITLE',
} as const;

// ---------------------------------------------------------------------------
// Single Problem Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single problem against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProblem(
  problem: Problem,
): readonly ProblemValidationError[] {
  const errors: ProblemValidationError[] = [];

  if (!problem.problemId || problem.problemId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROBLEM_ID,
      message: 'Problem is missing a problem ID.',
      field: 'problemId',
      problemId: problem.problemId,
    });
  }

  if (!problem.title || problem.title.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_TITLE,
      message: 'Problem is missing a title.',
      field: 'title',
      problemId: problem.problemId,
    });
  }

  if (!CANONICAL_PROBLEM_TYPES.includes(problem.problemType)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_INVALID_PROBLEM_TYPE,
      message: `Problem has unsupported type: "${problem.problemType}".`,
      field: 'problemType',
      problemId: problem.problemId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(problem.governanceStatus)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_INVALID_GOVERNANCE_STATUS,
      message: `Problem has invalid governance status: "${problem.governanceStatus}".`,
      field: 'governanceStatus',
      problemId: problem.problemId,
    });
  }

  if (!problem.provenance) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROVENANCE,
      message: 'Problem is missing provenance.',
      field: 'provenance',
      problemId: problem.problemId,
    });
  } else {
    if (!problem.provenance.source || problem.provenance.source.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_SOURCE,
        message: 'Problem provenance is missing a source.',
        field: 'provenance.source',
        problemId: problem.problemId,
      });
    }

    if (!problem.provenance.rationale || problem.provenance.rationale.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_RATIONALE,
        message: 'Problem provenance is missing a rationale.',
        field: 'provenance.rationale',
        problemId: problem.problemId,
      });
    }

    if (!problem.provenance.providedBy || problem.provenance.providedBy.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROVIDED_BY,
        message: 'Problem provenance is missing providedBy.',
        field: 'provenance.providedBy',
        problemId: problem.problemId,
      });
    }
  }

  if (!problem.originId || problem.originId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_ORIGIN_REFERENCE,
      message: 'Problem is missing an origin reference.',
      field: 'originId',
      problemId: problem.problemId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Origin Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single origin against canonical invariants.
 * Pure function. No side effects.
 */
export function validateOrigin(
  origin: Origin,
): readonly ProblemValidationError[] {
  const errors: ProblemValidationError[] = [];

  if (!origin.originId || origin.originId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_ORIGIN_ID,
      message: 'Origin is missing an origin ID.',
      field: 'originId',
      originId: origin.originId,
    });
  }

  if (!origin.title || origin.title.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_TITLE,
      message: 'Origin is missing a title.',
      field: 'title',
      originId: origin.originId,
    });
  }

  if (!CANONICAL_ORIGIN_TYPES.includes(origin.originType)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.ORIGIN_INVALID_TYPE,
      message: `Origin has unsupported type: "${origin.originType}".`,
      field: 'originType',
      originId: origin.originId,
    });
  }

  if (!origin.provenance) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_PROVENANCE,
      message: 'Origin is missing provenance.',
      field: 'provenance',
      originId: origin.originId,
    });
  } else {
    if (!origin.provenance.source || origin.provenance.source.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_SOURCE,
        message: 'Origin provenance is missing a source.',
        field: 'provenance.source',
        originId: origin.originId,
      });
    }

    if (!origin.provenance.rationale || origin.provenance.rationale.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_RATIONALE,
        message: 'Origin provenance is missing a rationale.',
        field: 'provenance.rationale',
        originId: origin.originId,
      });
    }

    if (!origin.provenance.providedBy || origin.provenance.providedBy.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.ORIGIN_MISSING_PROVIDED_BY,
        message: 'Origin provenance is missing providedBy.',
        field: 'provenance.providedBy',
        originId: origin.originId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Problem Motivation Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single problem motivation against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMotivation(
  motivation: ProblemMotivation,
): readonly ProblemValidationError[] {
  const errors: ProblemValidationError[] = [];

  if (!motivation.motivationId || motivation.motivationId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_MOTIVATION_ID,
      message: 'Motivation is missing a motivation ID.',
      field: 'motivationId',
      motivationId: motivation.motivationId,
    });
  }

  if (!motivation.title || motivation.title.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_TITLE,
      message: 'Motivation is missing a title.',
      field: 'title',
      motivationId: motivation.motivationId,
    });
  }

  if (!CANONICAL_MOTIVATION_CATEGORIES.includes(motivation.category)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MOTIVATION_INVALID_CATEGORY,
      message: `Motivation has unsupported category: "${motivation.category}".`,
      field: 'category',
      motivationId: motivation.motivationId,
    });
  }

  if (!motivation.provenance) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_PROVENANCE,
      message: 'Motivation is missing provenance.',
      field: 'provenance',
      motivationId: motivation.motivationId,
    });
  } else {
    if (!motivation.provenance.source || motivation.provenance.source.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_SOURCE,
        message: 'Motivation provenance is missing a source.',
        field: 'provenance.source',
        motivationId: motivation.motivationId,
      });
    }

    if (!motivation.provenance.rationale || motivation.provenance.rationale.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_RATIONALE,
        message: 'Motivation provenance is missing a rationale.',
        field: 'provenance.rationale',
        motivationId: motivation.motivationId,
      });
    }

    if (!motivation.provenance.providedBy || motivation.provenance.providedBy.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MOTIVATION_MISSING_PROVIDED_BY,
        message: 'Motivation provenance is missing providedBy.',
        field: 'provenance.providedBy',
        motivationId: motivation.motivationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Driving Question Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single driving question against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDrivingQuestion(
  question: DrivingQuestion,
): readonly ProblemValidationError[] {
  const errors: ProblemValidationError[] = [];

  if (!question.questionId || question.questionId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_QUESTION_ID,
      message: 'Driving question is missing a question ID.',
      field: 'questionId',
      questionId: question.questionId,
    });
  }

  if (!question.prompt || question.prompt.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_PROMPT,
      message: 'Driving question is missing a prompt.',
      field: 'prompt',
      questionId: question.questionId,
    });
  }

  if (!CANONICAL_DRIVING_QUESTION_TYPES.includes(question.questionType)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.QUESTION_INVALID_TYPE,
      message: `Driving question has unsupported type: "${question.questionType}".`,
      field: 'questionType',
      questionId: question.questionId,
    });
  }

  if (!question.provenance) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_PROVENANCE,
      message: 'Driving question is missing provenance.',
      field: 'provenance',
      questionId: question.questionId,
    });
  } else {
    if (!question.provenance.source || question.provenance.source.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_SOURCE,
        message: 'Driving question provenance is missing a source.',
        field: 'provenance.source',
        questionId: question.questionId,
      });
    }

    if (!question.provenance.rationale || question.provenance.rationale.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_RATIONALE,
        message: 'Driving question provenance is missing a rationale.',
        field: 'provenance.rationale',
        questionId: question.questionId,
      });
    }

    if (!question.provenance.providedBy || question.provenance.providedBy.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.QUESTION_MISSING_PROVIDED_BY,
        message: 'Driving question provenance is missing providedBy.',
        field: 'provenance.providedBy',
        questionId: question.questionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Misconception Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single misconception against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMisconception(
  misconception: Misconception,
): readonly ProblemValidationError[] {
  const errors: ProblemValidationError[] = [];

  if (!misconception.misconceptionId || misconception.misconceptionId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_MISCONCEPTION_ID,
      message: 'Misconception is missing a misconception ID.',
      field: 'misconceptionId',
      misconceptionId: misconception.misconceptionId,
    });
  }

  if (!misconception.title || misconception.title.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_TITLE,
      message: 'Misconception is missing a title.',
      field: 'title',
      misconceptionId: misconception.misconceptionId,
    });
  }

  if (!CANONICAL_MISCONCEPTION_TYPES.includes(misconception.misconceptionType)) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_INVALID_TYPE,
      message: `Misconception has unsupported type: "${misconception.misconceptionType}".`,
      field: 'misconceptionType',
      misconceptionId: misconception.misconceptionId,
    });
  }

  if (!misconception.provenance) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVENANCE,
      message: 'Misconception is missing provenance.',
      field: 'provenance',
      misconceptionId: misconception.misconceptionId,
    });
  } else {
    if (!misconception.provenance.source || misconception.provenance.source.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_SOURCE,
        message: 'Misconception provenance is missing a source.',
        field: 'provenance.source',
        misconceptionId: misconception.misconceptionId,
      });
    }

    if (!misconception.provenance.rationale || misconception.provenance.rationale.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_RATIONALE,
        message: 'Misconception provenance is missing a rationale.',
        field: 'provenance.rationale',
        misconceptionId: misconception.misconceptionId,
      });
    }

    if (!misconception.provenance.providedBy || misconception.provenance.providedBy.trim() === '') {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_MISSING_PROVIDED_BY,
        message: 'Misconception provenance is missing providedBy.',
        field: 'provenance.providedBy',
        misconceptionId: misconception.misconceptionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Problem Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a problem registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProblemRegistry(
  registry: ProblemRegistry,
): ProblemRegistryValidationResult {
  const errors: ProblemValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_EMPTY_REGISTRY,
      message: 'Problem registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_INVALID_TRACE,
      message: 'Problem registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_TRACE_RANDOM_USED,
      message: 'Problem registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_TRACE_TIME_DEPENDENCY,
      message: 'Problem registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate problem IDs
  const seenProblemIds = new Set<string>();
  for (const problem of registry.problems) {
    if (seenProblemIds.has(problem.problemId)) {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.PROBLEM_DUPLICATE_ID,
        message: `Duplicate problem ID: "${problem.problemId}".`,
        problemId: problem.problemId,
      });
    }
    seenProblemIds.add(problem.problemId);
  }

  // Check for duplicate origin IDs
  const seenOriginIds = new Set<string>();
  for (const origin of registry.origins) {
    if (seenOriginIds.has(origin.originId)) {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.ORIGIN_DUPLICATE_ID,
        message: `Duplicate origin ID: "${origin.originId}".`,
        originId: origin.originId,
      });
    }
    seenOriginIds.add(origin.originId);
  }

  // Check for duplicate motivation IDs
  const seenMotivationIds = new Set<string>();
  for (const motivation of registry.motivations) {
    if (seenMotivationIds.has(motivation.motivationId)) {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MOTIVATION_DUPLICATE_ID,
        message: `Duplicate motivation ID: "${motivation.motivationId}".`,
        motivationId: motivation.motivationId,
      });
    }
    seenMotivationIds.add(motivation.motivationId);
  }

  // Check for duplicate question IDs
  const seenQuestionIds = new Set<string>();
  for (const question of registry.questions) {
    if (seenQuestionIds.has(question.questionId)) {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.QUESTION_DUPLICATE_ID,
        message: `Duplicate question ID: "${question.questionId}".`,
        questionId: question.questionId,
      });
    }
    seenQuestionIds.add(question.questionId);
  }

  // Check for duplicate misconception IDs
  const seenMisconceptionIds = new Set<string>();
  for (const misconception of registry.misconceptions) {
    if (seenMisconceptionIds.has(misconception.misconceptionId)) {
      errors.push({
        code: PROBLEM_VALIDATION_CODES.MISCONCEPTION_DUPLICATE_ID,
        message: `Duplicate misconception ID: "${misconception.misconceptionId}".`,
        misconceptionId: misconception.misconceptionId,
      });
    }
    seenMisconceptionIds.add(misconception.misconceptionId);
  }

  // Validate each entity
  for (const problem of registry.problems) {
    errors.push(...validateProblem(problem));
  }

  for (const origin of registry.origins) {
    errors.push(...validateOrigin(origin));
  }

  for (const motivation of registry.motivations) {
    errors.push(...validateMotivation(motivation));
  }

  for (const question of registry.questions) {
    errors.push(...validateDrivingQuestion(question));
  }

  for (const misconception of registry.misconceptions) {
    errors.push(...validateMisconception(misconception));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'problem_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Problem Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates problem input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateProblemInput(
  input: ProblemInput,
): ProblemInputValidationResult {
  const errors: ProblemValidationError[] = [];

  for (const problem of input.problems) {
    errors.push(...validateProblem(problem));
  }

  for (const origin of input.origins) {
    errors.push(...validateOrigin(origin));
  }

  for (const motivation of input.motivations) {
    errors.push(...validateMotivation(motivation));
  }

  for (const question of input.questions) {
    errors.push(...validateDrivingQuestion(question));
  }

  for (const misconception of input.misconceptions) {
    errors.push(...validateMisconception(misconception));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'problem_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Problems Validation
// ---------------------------------------------------------------------------

/**
 * Validates a narrative artifact with problems against canonical invariants.
 * Pure function. No side effects.
 */
export function validateNarrativeArtifactWithProblems(
  artifact: NarrativeArtifactWithProblems,
): NarrativeArtifactWithProblemsValidationResult {
  const errors: ProblemValidationError[] = [];

  if (!artifact.narrativeId || artifact.narrativeId.trim() === '') {
    errors.push({
      code: PROBLEM_VALIDATION_CODES.PROBLEM_MISSING_PROBLEM_ID,
      message: 'Narrative artifact with problems is missing a narrative ID.',
      field: 'narrativeId',
    });
  }

  for (const problem of artifact.problems) {
    errors.push(...validateProblem(problem));
  }

  for (const origin of artifact.origins) {
    errors.push(...validateOrigin(origin));
  }

  for (const motivation of artifact.motivations) {
    errors.push(...validateMotivation(motivation));
  }

  for (const question of artifact.questions) {
    errors.push(...validateDrivingQuestion(question));
  }

  for (const misconception of artifact.misconceptions) {
    errors.push(...validateMisconception(misconception));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'narrative_artifact_with_problems_composition',
  };
}