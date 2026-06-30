/**
 * NV-1600-D4-OPT-08 — Hypothesis Validation Layer
 *
 * Deterministic validation for hypothesis metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryHypothesis,
  LaboratoryPredictionPrompt,
  LaboratoryHypothesisRegistry,
  LaboratoryArtifactWithHypotheses,
  LaboratoryHypothesisInput,
  LaboratoryHypothesisValidationError,
  LaboratoryHypothesisValidationResult,
  LaboratoryHypothesisRegistryValidationResult,
  LaboratoryHypothesisArtifactValidationResult,
  LaboratoryHypothesisInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HYPOTHESIS_TYPES,
  CANONICAL_PREDICTION_PROMPT_TYPES,
  CANONICAL_OBSERVATION_TARGETS,
  CANONICAL_HYPOTHESIS_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const HYPOTHESIS_VALIDATION_CODES = {
  HYPOTHESIS_UNKNOWN_TYPE: 'HYPOTHESIS_UNKNOWN_TYPE',
  HYPOTHESIS_UNKNOWN_STATUS: 'HYPOTHESIS_UNKNOWN_STATUS',
  PROMPT_UNKNOWN_TYPE: 'PROMPT_UNKNOWN_TYPE',
  OBSERVATION_TARGET_UNKNOWN: 'OBSERVATION_TARGET_UNKNOWN',
  HYPOTHESIS_DUPLICATE_ID: 'HYPOTHESIS_DUPLICATE_ID',
  HYPOTHESIS_DUPLICATE_NAME: 'HYPOTHESIS_DUPLICATE_NAME',
  PROMPT_DUPLICATE_ID: 'PROMPT_DUPLICATE_ID',
  HYPOTHESIS_MISSING_HYPOTHESIS_ID: 'HYPOTHESIS_MISSING_HYPOTHESIS_ID',
  HYPOTHESIS_MISSING_NAME: 'HYPOTHESIS_MISSING_NAME',
  HYPOTHESIS_MISSING_PROMPTS: 'HYPOTHESIS_MISSING_PROMPTS',
  HYPOTHESIS_INVALID_GOVERNANCE: 'HYPOTHESIS_INVALID_GOVERNANCE',
  HYPOTHESIS_MISSING_PROVENANCE: 'HYPOTHESIS_MISSING_PROVENANCE',
  HYPOTHESIS_INVALID_REFERENCE: 'HYPOTHESIS_INVALID_REFERENCE',
  PROMPT_MISSING_ID: 'PROMPT_MISSING_ID',
  PROMPT_MISSING_TITLE: 'PROMPT_MISSING_TITLE',
  PROMPT_INVALID_GOVERNANCE: 'PROMPT_INVALID_GOVERNANCE',
  PROMPT_INVALID_REFERENCE: 'PROMPT_INVALID_REFERENCE',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  REGISTRY_DUPLICATE_HYPOTHESIS_ID: 'REGISTRY_DUPLICATE_HYPOTHESIS_ID',
  REGISTRY_DUPLICATE_HYPOTHESIS_NAME: 'REGISTRY_DUPLICATE_HYPOTHESIS_NAME',
  REGISTRY_DUPLICATE_PROMPT_ID: 'REGISTRY_DUPLICATE_PROMPT_ID',
} as const;

// ---------------------------------------------------------------------------
// Single Prediction Prompt Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single prediction prompt against canonical invariants.
 * Pure function. No side effects.
 */
export function validatePredictionPrompt(
  prompt: LaboratoryPredictionPrompt,
): readonly LaboratoryHypothesisValidationError[] {
  const errors: LaboratoryHypothesisValidationError[] = [];

  if (!prompt.promptId || prompt.promptId.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.PROMPT_MISSING_ID,
      message: 'Prediction prompt is missing a prompt ID.',
      field: 'promptId',
      promptId: prompt.promptId,
    });
  }

  if (!prompt.title || prompt.title.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.PROMPT_MISSING_TITLE,
      message: 'Prediction prompt is missing a title.',
      field: 'title',
      promptId: prompt.promptId,
    });
  }

  if (!CANONICAL_PREDICTION_PROMPT_TYPES.includes(prompt.promptType)) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.PROMPT_UNKNOWN_TYPE,
      message: `Prediction prompt has unsupported type: "${prompt.promptType}".`,
      field: 'promptType',
      promptId: prompt.promptId,
    });
  }

  if (!prompt.observationTargetId || prompt.observationTargetId.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.PROMPT_INVALID_REFERENCE,
      message: 'Prediction prompt is missing an observation target ID.',
      field: 'observationTargetId',
      promptId: prompt.promptId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(prompt.governanceStatus)) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.PROMPT_INVALID_GOVERNANCE,
      message: `Prediction prompt has invalid governance status: "${prompt.governanceStatus}".`,
      field: 'governanceStatus',
      promptId: prompt.promptId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Hypothesis Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single hypothesis against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHypothesis(
  hyp: LaboratoryHypothesis,
): readonly LaboratoryHypothesisValidationError[] {
  const errors: LaboratoryHypothesisValidationError[] = [];

  if (!hyp.hypothesisId || hyp.hypothesisId.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_HYPOTHESIS_ID,
      message: 'Hypothesis is missing a hypothesis ID.',
      field: 'hypothesisId',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!hyp.name || hyp.name.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_NAME,
      message: 'Hypothesis is missing a name.',
      field: 'name',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!CANONICAL_HYPOTHESIS_TYPES.includes(hyp.hypothesisType)) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_UNKNOWN_TYPE,
      message: `Hypothesis has unsupported type: "${hyp.hypothesisType}".`,
      field: 'hypothesisType',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!CANONICAL_HYPOTHESIS_STATUS.includes(hyp.status)) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_UNKNOWN_STATUS,
      message: `Hypothesis has unsupported status: "${hyp.status}".`,
      field: 'status',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(hyp.governanceStatus)) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_INVALID_GOVERNANCE,
      message: `Hypothesis has invalid governance status: "${hyp.governanceStatus}".`,
      field: 'governanceStatus',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!hyp.provenance) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROVENANCE,
      message: 'Hypothesis is missing provenance.',
      field: 'provenance',
      hypothesisId: hyp.hypothesisId,
    });
  }

  if (!hyp.prompts || hyp.prompts.length === 0) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_MISSING_PROMPTS,
      message: 'Hypothesis has no prompts.',
      field: 'prompts',
      hypothesisId: hyp.hypothesisId,
    });
  } else {
    // Check for duplicate prompt IDs
    const seenPromptIds = new Set<string>();
    for (const prompt of hyp.prompts) {
      if (seenPromptIds.has(prompt.promptId)) {
        errors.push({
          code: HYPOTHESIS_VALIDATION_CODES.PROMPT_DUPLICATE_ID,
          message: `Duplicate prompt ID: "${prompt.promptId}".`,
          field: 'promptId',
          hypothesisId: hyp.hypothesisId,
          promptId: prompt.promptId,
        });
      }
      seenPromptIds.add(prompt.promptId);
    }

    // Validate each prompt
    for (const prompt of hyp.prompts) {
      errors.push(...validatePredictionPrompt(prompt));
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Hypothesis Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a hypothesis registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHypothesisRegistry(
  registry: LaboratoryHypothesisRegistry,
): LaboratoryHypothesisRegistryValidationResult {
  const errors: LaboratoryHypothesisValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.hypotheses || registry.hypotheses.length === 0) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry has no hypotheses.',
      field: 'hypotheses',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate hypothesis IDs
  const seenHypothesisIds = new Set<string>();
  for (const hyp of registry.hypotheses) {
    if (seenHypothesisIds.has(hyp.hypothesisId)) {
      errors.push({
        code: HYPOTHESIS_VALIDATION_CODES.REGISTRY_DUPLICATE_HYPOTHESIS_ID,
        message: `Duplicate hypothesis ID: "${hyp.hypothesisId}".`,
        hypothesisId: hyp.hypothesisId,
      });
    }
    seenHypothesisIds.add(hyp.hypothesisId);
  }

  // Check for duplicate hypothesis names
  const seenHypothesisNames = new Set<string>();
  for (const hyp of registry.hypotheses) {
    if (seenHypothesisNames.has(hyp.name)) {
      errors.push({
        code: HYPOTHESIS_VALIDATION_CODES.REGISTRY_DUPLICATE_HYPOTHESIS_NAME,
        message: `Duplicate hypothesis name: "${hyp.name}".`,
        field: 'name',
        hypothesisId: hyp.hypothesisId,
      });
    }
    seenHypothesisNames.add(hyp.name);
  }

  // Check for duplicate prompt IDs across all hypotheses
  const seenPromptIds = new Set<string>();
  for (const hyp of registry.hypotheses) {
    for (const prompt of hyp.prompts) {
      if (seenPromptIds.has(prompt.promptId)) {
        errors.push({
          code: HYPOTHESIS_VALIDATION_CODES.REGISTRY_DUPLICATE_PROMPT_ID,
          message: `Duplicate prompt ID: "${prompt.promptId}".`,
          promptId: prompt.promptId,
        });
      }
      seenPromptIds.add(prompt.promptId);
    }
  }

  // Validate each hypothesis
  for (const hyp of registry.hypotheses) {
    errors.push(...validateHypothesis(hyp));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'hypothesis_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with hypotheses against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithHypotheses(
  artifact: LaboratoryArtifactWithHypotheses,
): LaboratoryHypothesisArtifactValidationResult {
  const errors: LaboratoryHypothesisValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.HYPOTHESIS_INVALID_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateHypothesisRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: HYPOTHESIS_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: HYPOTHESIS_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: HYPOTHESIS_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'hypothesis_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates hypothesis input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHypothesisInput(
  input: LaboratoryHypothesisInput,
): LaboratoryHypothesisInputValidationResult {
  const errors: LaboratoryHypothesisValidationError[] = [];

  if (!input.hypotheses || input.hypotheses.length === 0) {
    errors.push({
      code: HYPOTHESIS_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Input has no hypotheses.',
      field: 'hypotheses',
    });
  } else {
    for (const hyp of input.hypotheses) {
      errors.push(...validateHypothesis(hyp));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'hypothesis_input_composition',
  };
}
