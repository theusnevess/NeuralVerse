/**
 * NV-1700-D6-OPT-03 — Problem-Origin & Motivation Modeling Kernel
 *
 * Deterministic orchestration functions for problem-origin metadata.
 * Produces problems, origins, motivations, questions, misconceptions, and registries.
 *
 * This module never:
 * - Generates explanations
 * - Generates stories
 * - Invents historical facts
 * - Rewrites knowledge
 * - Personalizes motivation
 * - Estimates learner curiosity
 * - Infers misconceptions
 * - Generates questions dynamically
 * - Creates educational sequencing
 * - Calls LLMs
 * - Calls external APIs
 * - Executes runtime logic
 *
 * Problem-origin metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ProblemProvenance,
  NarrativeGovernanceStatus,
  ProblemType,
  OriginType,
  MotivationCategory,
  DrivingQuestionType,
  MisconceptionType,
  ProblemStatus,
  Problem,
  Origin,
  ProblemMotivation,
  DrivingQuestion,
  Misconception,
  ProblemDecision,
  ProblemTrace,
  ProblemRegistry,
  ProblemRegistryMetadata,
  ProblemInput,
  NarrativeUnitType,
  NarrativeMode,
  NarrativeDomain,
  NarrativeStatus,
  NarrativeProvenance,
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
  CANONICAL_NARRATIVE_DOMAINS,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Problem Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes problem provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeProblemProvenance(params: {
  readonly source: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): ProblemProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Origin Composition
// ---------------------------------------------------------------------------

/**
 * Composes an origin from provided parameters.
 * Pure function. No side effects.
 */
export function composeOrigin(params: {
  readonly originId: string;
  readonly originType: OriginType;
  readonly title: string;
  readonly description: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}): Origin {
  return {
    originId: params.originId,
    originType: params.originType,
    title: params.title,
    description: params.description,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Problem Motivation Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem motivation from provided parameters.
 * Pure function. No side effects.
 */
export function composeMotivation(params: {
  readonly motivationId: string;
  readonly category: MotivationCategory;
  readonly title: string;
  readonly description: string;
  readonly importance: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}): ProblemMotivation {
  return {
    motivationId: params.motivationId,
    category: params.category,
    title: params.title,
    description: params.description,
    importance: params.importance,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Driving Question Composition
// ---------------------------------------------------------------------------

/**
 * Composes a driving question from provided parameters.
 * Pure function. No side effects.
 */
export function composeDrivingQuestion(params: {
  readonly questionId: string;
  readonly questionType: DrivingQuestionType;
  readonly prompt: string;
  readonly relatedArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}): DrivingQuestion {
  return {
    questionId: params.questionId,
    questionType: params.questionType,
    prompt: params.prompt,
    relatedArtifactId: params.relatedArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Misconception Composition
// ---------------------------------------------------------------------------

/**
 * Composes a misconception from provided parameters.
 * Pure function. No side effects.
 */
export function composeMisconception(params: {
  readonly misconceptionId: string;
  readonly misconceptionType: MisconceptionType;
  readonly title: string;
  readonly description: string;
  readonly correctiveArtifactId: string;
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}): Misconception {
  return {
    misconceptionId: params.misconceptionId,
    misconceptionType: params.misconceptionType,
    title: params.title,
    description: params.description,
    correctiveArtifactId: params.correctiveArtifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Problem Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem decision from validation results.
 * Pure function. No side effects.
 */
function _composeProblemDecision(
  problemId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): ProblemDecision {
  return {
    decisionId: `_decision_${problemId}`,
    problemId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Problem Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeProblemTrace(params: {
  readonly traceId: string;
  readonly decisions: readonly ProblemDecision[];
  readonly registryVersion: string;
  readonly pipelineVersion: string;
  readonly problemCount: number;
  readonly originCount: number;
  readonly motivationCount: number;
  readonly questionCount: number;
  readonly misconceptionCount: number;
}): ProblemTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisions.length,
    validationCount: params.decisions.filter((d) => d.validationPassed).length,
    problemCount: params.problemCount,
    originCount: params.originCount,
    motivationCount: params.motivationCount,
    questionCount: params.questionCount,
    misconceptionCount: params.misconceptionCount,
    registryVersion: params.registryVersion,
    pipelineVersion: params.pipelineVersion,
    compositionMetadata: {},
    deterministicMetadata: {},
    deterministic: true,
    generatedFrom: 'deterministic_problem_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Problem Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem from provided parameters.
 * Pure function. No side effects.
 */
export function composeProblem(params: {
  readonly problemId: string;
  readonly problemType: ProblemType;
  readonly title: string;
  readonly summary: string;
  readonly originId: string;
  readonly motivationIds: readonly string[];
  readonly questionIds: readonly string[];
  readonly misconceptionIds: readonly string[];
  readonly governanceStatus: NarrativeGovernanceStatus;
  readonly provenance: ProblemProvenance;
}): Problem {
  return {
    problemId: params.problemId,
    problemType: params.problemType,
    title: params.title,
    summary: params.summary,
    originId: params.originId,
    motivationIds: [...params.motivationIds],
    questionIds: [...params.questionIds],
    misconceptionIds: [...params.misconceptionIds],
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Narrative Artifact With Problems Composition
// ---------------------------------------------------------------------------

/**
 * Composes a narrative artifact with applied problems.
 * Pure function. No side effects.
 */
export function composeNarrativeArtifactWithProblems(params: {
  readonly narrativeId: string;
  readonly title: string;
  readonly unitType: NarrativeUnitType;
  readonly narrativeMode: NarrativeMode;
  readonly domain: NarrativeDomain;
  readonly status: NarrativeStatus;
  readonly canonicalKnowledgeId: string;
  readonly curriculumNodeId: string;
  readonly lessonId: string;
  readonly laboratoryId: string;
  readonly sequenceOrder: number;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly provenance: NarrativeProvenance;
  readonly problems: readonly Problem[];
  readonly origins: readonly Origin[];
  readonly motivations: readonly ProblemMotivation[];
  readonly questions: readonly DrivingQuestion[];
  readonly misconceptions: readonly Misconception[];
}): NarrativeArtifactWithProblems {
  return {
    narrativeId: params.narrativeId,
    title: params.title,
    unitType: params.unitType,
    narrativeMode: params.narrativeMode,
    domain: params.domain,
    status: params.status,
    canonicalKnowledgeId: params.canonicalKnowledgeId,
    curriculumNodeId: params.curriculumNodeId,
    lessonId: params.lessonId,
    laboratoryId: params.laboratoryId,
    sequenceOrder: params.sequenceOrder,
    summary: params.summary,
    tags: [...params.tags],
    provenance: params.provenance,
    problems: [...params.problems],
    origins: [...params.origins],
    motivations: [...params.motivations],
    questions: [...params.questions],
    misconceptions: [...params.misconceptions],
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for problems.
 * Sorts by problemId, then problemType, then originId.
 * Pure function. No side effects.
 */
function _compareProblem(a: Problem, b: Problem): number {
  if (a.problemId < b.problemId) return -1;
  if (a.problemId > b.problemId) return 1;

  if (a.problemType < b.problemType) return -1;
  if (a.problemType > b.problemType) return 1;

  if (a.originId < b.originId) return -1;
  if (a.originId > b.originId) return 1;

  return 0;
}

/**
 * Deterministic comparator for origins.
 * Sorts by originId, then originType.
 * Pure function. No side effects.
 */
function _compareOrigin(a: Origin, b: Origin): number {
  if (a.originId < b.originId) return -1;
  if (a.originId > b.originId) return 1;

  if (a.originType < b.originType) return -1;
  if (a.originType > b.originType) return 1;

  return 0;
}

/**
 * Deterministic comparator for motivations.
 * Sorts by motivationId, then category.
 * Pure function. No side effects.
 */
function _compareMotivation(a: ProblemMotivation, b: ProblemMotivation): number {
  if (a.motivationId < b.motivationId) return -1;
  if (a.motivationId > b.motivationId) return 1;

  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;

  return 0;
}

/**
 * Deterministic comparator for questions.
 * Sorts by questionId, then questionType.
 * Pure function. No side effects.
 */
function _compareQuestion(a: DrivingQuestion, b: DrivingQuestion): number {
  if (a.questionId < b.questionId) return -1;
  if (a.questionId > b.questionId) return 1;

  if (a.questionType < b.questionType) return -1;
  if (a.questionType > b.questionType) return 1;

  return 0;
}

/**
 * Deterministic comparator for misconceptions.
 * Sorts by misconceptionId, then misconceptionType.
 * Pure function. No side effects.
 */
function _compareMisconception(a: Misconception, b: Misconception): number {
  if (a.misconceptionId < b.misconceptionId) return -1;
  if (a.misconceptionId > b.misconceptionId) return 1;

  if (a.misconceptionType < b.misconceptionType) return -1;
  if (a.misconceptionType > b.misconceptionType) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Problem Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem registry from input data.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeProblemRegistry(
  problems: readonly Problem[],
  origins: readonly Origin[],
  motivations: readonly ProblemMotivation[],
  questions: readonly DrivingQuestion[],
  misconceptions: readonly Misconception[],
): ProblemRegistry {
  const sortedProblems = [...problems].sort(_compareProblem);
  const sortedOrigins = [...origins].sort(_compareOrigin);
  const sortedMotivations = [...motivations].sort(_compareMotivation);
  const sortedQuestions = [...questions].sort(_compareQuestion);
  const sortedMisconceptions = [...misconceptions].sort(_compareMisconception);

  const metadata: ProblemRegistryMetadata = {
    registryId: `_problem_registry_${sortedProblems.length}`,
    problemCount: sortedProblems.length,
    originCount: sortedOrigins.length,
    motivationCount: sortedMotivations.length,
    questionCount: sortedQuestions.length,
    misconceptionCount: sortedMisconceptions.length,
  };

  return {
    registryId: metadata.registryId,
    problems: sortedProblems,
    origins: sortedOrigins,
    motivations: sortedMotivations,
    questions: sortedQuestions,
    misconceptions: sortedMisconceptions,
    metadata,
    trace: {
      traceId: `_problem_trace_${sortedProblems.length}`,
      decisionCount: 0,
      validationCount: 0,
      problemCount: sortedProblems.length,
      originCount: sortedOrigins.length,
      motivationCount: sortedMotivations.length,
      questionCount: sortedQuestions.length,
      misconceptionCount: sortedMisconceptions.length,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      compositionMetadata: {},
      deterministicMetadata: {},
      deterministic: true,
      generatedFrom: 'deterministic_problem_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_problem_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Problem Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a problem registry from an input.
 * Pure function. No side effects.
 */
export function composeProblemRegistryFromInput(
  input: ProblemInput,
): ProblemRegistry {
  return composeProblemRegistry(
    input.problems,
    input.origins,
    input.motivations,
    input.questions,
    input.misconceptions,
  );
}

// ---------------------------------------------------------------------------
// Narrative Problems Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete problem registry from an input.
 * Pure function. No side effects.
 */
export function composeNarrativeProblems(
  input: ProblemInput,
): ProblemRegistry {
  const decisions = input.problems.map((problem) => {
    const errors = _validateProblemForDecision(problem);
    return _composeProblemDecision(problem.problemId, errors.length === 0, errors);
  });

  const registry = composeProblemRegistry(
    input.problems,
    input.origins,
    input.motivations,
    input.questions,
    input.misconceptions,
  );

  return {
    ...registry,
    trace: composeProblemTrace({
      traceId: `_problem_trace_${input.problems.length}`,
      decisions,
      registryVersion: '1.0.0',
      pipelineVersion: '1.0.0',
      problemCount: input.problems.length,
      originCount: input.origins.length,
      motivationCount: input.motivations.length,
      questionCount: input.questions.length,
      misconceptionCount: input.misconceptions.length,
    }),
  };
}

/**
 * Validates a problem for decision composition.
 * Pure function. No side effects.
 */
function _validateProblemForDecision(
  problem: Problem,
): readonly string[] {
  const errors: string[] = [];

  if (!problem.problemId || problem.problemId.trim() === '') {
    errors.push('PROBLEM_MISSING_PROBLEM_ID');
  }

  if (!problem.title || problem.title.trim() === '') {
    errors.push('PROBLEM_MISSING_TITLE');
  }

  if (!CANONICAL_PROBLEM_TYPES.includes(problem.problemType)) {
    errors.push('PROBLEM_INVALID_PROBLEM_TYPE');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(problem.governanceStatus)) {
    errors.push('PROBLEM_INVALID_GOVERNANCE_STATUS');
  }

  if (!problem.provenance) {
    errors.push('PROBLEM_MISSING_PROVENANCE');
  }

  if (!problem.originId || problem.originId.trim() === '') {
    errors.push('PROBLEM_MISSING_ORIGIN_REFERENCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported problem type.
 */
export function isSupportedProblemType(
  problemType: string,
): problemType is ProblemType {
  return CANONICAL_PROBLEM_TYPES.includes(problemType as ProblemType);
}

/**
 * Checks if a string is a supported origin type.
 */
export function isSupportedOriginType(
  originType: string,
): originType is OriginType {
  return CANONICAL_ORIGIN_TYPES.includes(originType as OriginType);
}

/**
 * Checks if a string is a supported motivation category.
 */
export function isSupportedMotivationCategory(
  category: string,
): category is MotivationCategory {
  return CANONICAL_MOTIVATION_CATEGORIES.includes(category as MotivationCategory);
}

/**
 * Checks if a string is a supported driving question type.
 */
export function isSupportedDrivingQuestionType(
  questionType: string,
): questionType is DrivingQuestionType {
  return CANONICAL_DRIVING_QUESTION_TYPES.includes(questionType as DrivingQuestionType);
}

/**
 * Checks if a string is a supported misconception type.
 */
export function isSupportedMisconceptionType(
  misconceptionType: string,
): misconceptionType is MisconceptionType {
  return CANONICAL_MISCONCEPTION_TYPES.includes(misconceptionType as MisconceptionType);
}

/**
 * Checks if a string is a supported problem status.
 */
export function isSupportedProblemStatus(
  status: string,
): status is ProblemStatus {
  return CANONICAL_PROBLEM_STATUS.includes(status as ProblemStatus);
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical problem types.
 */
export function getCanonicalProblemTypes(): readonly ProblemType[] {
  return CANONICAL_PROBLEM_TYPES;
}

/**
 * Returns the canonical origin types.
 */
export function getCanonicalOriginTypes(): readonly OriginType[] {
  return CANONICAL_ORIGIN_TYPES;
}

/**
 * Returns the canonical motivation categories.
 */
export function getCanonicalMotivationCategories(): readonly MotivationCategory[] {
  return CANONICAL_MOTIVATION_CATEGORIES;
}

/**
 * Returns the canonical driving question types.
 */
export function getCanonicalDrivingQuestionTypes(): readonly DrivingQuestionType[] {
  return CANONICAL_DRIVING_QUESTION_TYPES;
}

/**
 * Returns the canonical misconception types.
 */
export function getCanonicalMisconceptionTypes(): readonly MisconceptionType[] {
  return CANONICAL_MISCONCEPTION_TYPES;
}

/**
 * Returns the canonical problem statuses.
 */
export function getCanonicalProblemStatuses(): readonly ProblemStatus[] {
  return CANONICAL_PROBLEM_STATUS;
}
