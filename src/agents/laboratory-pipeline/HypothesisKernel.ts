/**
 * NV-1600-D4-OPT-08 — Predict-Before-Run & Hypothesis Modeling Kernel
 *
 * Deterministic orchestration functions for hypothesis metadata.
 * Produces hypotheses, prediction prompts, artifacts, traces, and registries.
 *
 * This module never:
 * - Stores learner answers
 * - Executes experiments
 * - Evaluates correctness
 * - Infers mastery
 * - Generates hypotheses automatically
 * - Uses AI-generated predictions
 * - Uses LLM integration
 * - Uses analytics
 * - Uses telemetry
 * - Uses session state
 * - Uses persistence
 * - Uses adaptive behavior
 * - Uses recommendation systems
 *
 * Hypothesis metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryHypothesis,
  LaboratoryPredictionPrompt,
  LaboratoryHypothesisRegistry,
  LaboratoryHypothesisDecision,
  LaboratoryHypothesisTrace,
  LaboratoryHypothesisInput,
  LaboratoryArtifactWithHypotheses,
  LaboratoryHypothesisProvenance,
  LaboratoryHypothesisType,
  LaboratoryPredictionPromptType,
  LaboratoryObservationTarget,
  LaboratoryHypothesisStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HYPOTHESIS_TYPES,
  CANONICAL_PREDICTION_PROMPT_TYPES,
  CANONICAL_OBSERVATION_TARGETS,
  CANONICAL_HYPOTHESIS_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Hypothesis Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes hypothesis provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeHypothesisProvenance(params: {
  readonly hypothesisId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryHypothesisProvenance {
  return {
    hypothesisId: params.hypothesisId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Prediction Prompt Composition
// ---------------------------------------------------------------------------

/**
 * Composes a prediction prompt from provided parameters.
 * Pure function. No side effects.
 */
export function composePredictionPrompt(params: {
  readonly promptId: string;
  readonly promptType: LaboratoryPredictionPromptType;
  readonly title: string;
  readonly description: string;
  readonly hypothesisId: string;
  readonly observationTargetId: string;
  readonly reasoningCategory: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryPredictionPrompt {
  return {
    promptId: params.promptId,
    promptType: params.promptType,
    title: params.title,
    description: params.description,
    hypothesisId: params.hypothesisId,
    observationTargetId: params.observationTargetId,
    reasoningCategory: params.reasoningCategory,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Hypothesis Composition
// ---------------------------------------------------------------------------

/**
 * Composes a hypothesis from provided parameters.
 * Pure function. No side effects.
 */
export function composeHypothesis(params: {
  readonly hypothesisId: string;
  readonly hypothesisType: LaboratoryHypothesisType;
  readonly name: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly parameterId: string;
  readonly visualizationId: string;
  readonly observationTargetId: string;
  readonly prompts: readonly LaboratoryPredictionPrompt[];
  readonly status: LaboratoryHypothesisStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryHypothesisProvenance;
}): LaboratoryHypothesis {
  return {
    hypothesisId: params.hypothesisId,
    hypothesisType: params.hypothesisType,
    name: params.name,
    description: params.description,
    experimentId: params.experimentId,
    workflowId: params.workflowId,
    parameterId: params.parameterId,
    visualizationId: params.visualizationId,
    observationTargetId: params.observationTargetId,
    prompts: [...params.prompts],
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Hypothesis Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a hypothesis decision from validation results.
 * Pure function. No side effects.
 */
function _composeHypothesisDecision(
  hypothesisId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryHypothesisDecision {
  return {
    decisionId: `_decision_hypothesis_${hypothesisId}`,
    hypothesisId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Hypothesis Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a hypothesis trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeHypothesisTrace(params: {
  readonly traceId: string;
  readonly hypothesisCount: number;
  readonly promptCount: number;
  readonly decisions: readonly LaboratoryHypothesisDecision[];
}): LaboratoryHypothesisTrace {
  return {
    traceId: params.traceId,
    hypothesisCount: params.hypothesisCount,
    promptCount: params.promptCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_hypothesis_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for hypotheses.
 * Sorts by hypothesisId, then hypothesisType, then predictionPromptType, then observationTarget.
 * Pure function. No side effects.
 */
function _compareHypothesis(
  a: LaboratoryHypothesis,
  b: LaboratoryHypothesis,
): number {
  if (a.hypothesisId < b.hypothesisId) return -1;
  if (a.hypothesisId > b.hypothesisId) return 1;

  if (a.hypothesisType < b.hypothesisType) return -1;
  if (a.hypothesisType > b.hypothesisType) return 1;

  const aPromptType = a.prompts[0]?.promptType ?? '';
  const bPromptType = b.prompts[0]?.promptType ?? '';
  if (aPromptType < bPromptType) return -1;
  if (aPromptType > bPromptType) return 1;

  if (a.observationTargetId < b.observationTargetId) return -1;
  if (a.observationTargetId > b.observationTargetId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Hypothesis Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a hypothesis registry from hypotheses.
 * Pure function. No side effects.
 * Deterministic ordering: hypothesisId → hypothesisType → predictionPromptType → observationTarget.
 */
export function composeHypothesisRegistry(
  hypotheses: readonly LaboratoryHypothesis[],
): LaboratoryHypothesisRegistry {
  const sortedHypotheses = [...hypotheses].sort(_compareHypothesis);

  const totalPrompts = sortedHypotheses.reduce((sum, hyp) => sum + hyp.prompts.length, 0);

  return {
    registryId: `_hypothesis_registry_${sortedHypotheses.length}`,
    hypotheses: sortedHypotheses,
    hypothesisCount: sortedHypotheses.length,
    promptCount: totalPrompts,
    deterministic: true,
    generatedFrom: 'deterministic_hypothesis_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Hypotheses Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory hypothesis artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryHypotheses(
  input: LaboratoryHypothesisInput,
): LaboratoryArtifactWithHypotheses {
  const decisions = input.hypotheses.map((hyp) => {
    const errors = _validateHypothesisForDecision(hyp);
    return _composeHypothesisDecision(hyp.hypothesisId, errors.length === 0, errors);
  });

  const totalPrompts = input.hypotheses.reduce((sum, hyp) => sum + hyp.prompts.length, 0);

  const trace = composeHypothesisTrace({
    traceId: `_trace_hypothesis_${input.hypotheses.length}`,
    hypothesisCount: input.hypotheses.length,
    promptCount: totalPrompts,
    decisions,
  });

  const registry = composeHypothesisRegistry(input.hypotheses);

  return {
    artifactId: `_artifact_hypothesis_${input.hypotheses.length}`,
    registry,
    trace,
  };
}

/**
 * Validates a hypothesis for decision composition.
 * Pure function. No side effects.
 */
function _validateHypothesisForDecision(
  hyp: LaboratoryHypothesis,
): readonly string[] {
  const errors: string[] = [];

  if (!hyp.hypothesisId || hyp.hypothesisId.trim() === '') {
    errors.push('HYPOTHESIS_MISSING_HYPOTHESIS_ID');
  }

  if (!hyp.name || hyp.name.trim() === '') {
    errors.push('HYPOTHESIS_MISSING_NAME');
  }

  if (!CANONICAL_HYPOTHESIS_TYPES.includes(hyp.hypothesisType)) {
    errors.push('HYPOTHESIS_UNKNOWN_TYPE');
  }

  if (!CANONICAL_HYPOTHESIS_STATUS.includes(hyp.status)) {
    errors.push('HYPOTHESIS_UNKNOWN_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(hyp.governanceStatus)) {
    errors.push('HYPOTHESIS_INVALID_GOVERNANCE');
  }

  if (!hyp.provenance) {
    errors.push('HYPOTHESIS_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported hypothesis type.
 */
export function isSupportedHypothesisType(
  hypothesisType: string,
): hypothesisType is LaboratoryHypothesisType {
  return CANONICAL_HYPOTHESIS_TYPES.includes(hypothesisType as LaboratoryHypothesisType);
}

/**
 * Checks if a string is a supported prediction prompt type.
 */
export function isSupportedPredictionPromptType(
  promptType: string,
): promptType is LaboratoryPredictionPromptType {
  return CANONICAL_PREDICTION_PROMPT_TYPES.includes(promptType as LaboratoryPredictionPromptType);
}

/**
 * Checks if a string is a supported observation target.
 */
export function isSupportedObservationTarget(
  target: string,
): target is LaboratoryObservationTarget {
  return CANONICAL_OBSERVATION_TARGETS.includes(target as LaboratoryObservationTarget);
}

/**
 * Checks if a string is a supported hypothesis status.
 */
export function isSupportedHypothesisStatus(
  status: string,
): status is LaboratoryHypothesisStatus {
  return CANONICAL_HYPOTHESIS_STATUS.includes(status as LaboratoryHypothesisStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedHypothesisGovernanceStatus(
  governanceStatus: string,
): governanceStatus is LaboratoryGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as LaboratoryGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical hypothesis types.
 */
export function getCanonicalHypothesisTypes(): readonly LaboratoryHypothesisType[] {
  return CANONICAL_HYPOTHESIS_TYPES;
}

/**
 * Returns the canonical prediction prompt types.
 */
export function getCanonicalPredictionPromptTypes(): readonly LaboratoryPredictionPromptType[] {
  return CANONICAL_PREDICTION_PROMPT_TYPES;
}

/**
 * Returns the canonical observation targets.
 */
export function getCanonicalObservationTargets(): readonly LaboratoryObservationTarget[] {
  return CANONICAL_OBSERVATION_TARGETS;
}

/**
 * Returns the canonical hypothesis statuses.
 */
export function getCanonicalHypothesisStatuses(): readonly LaboratoryHypothesisStatus[] {
  return CANONICAL_HYPOTHESIS_STATUS;
}
