/**
 * NV-2100-D9-OPT-08 — Laboratory Curiosity Validation Layer
 *
 * Deterministic validation for laboratory curiosity metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryChallenge,
  WhatIfPrompt,
  ExperimentCuriosity,
  ExplorationRelationship,
  ExplorationRegistry,
  ExplorationInput,
  LaboratoryCuriosityTrace,
  CuriosityArtifactWithExploration,
  ExplorationValidationError,
  ExplorationRegistryValidationResult,
  ExplorationInputValidationResult,
  ExplorationTraceValidationResult,
  CuriosityArtifactWithExplorationValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_LAB_CHALLENGE_TYPES,
  CANONICAL_WHATS_IF_TYPES,
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_EXPLORATION_OBJECTIVES,
  CANONICAL_EXPLORATION_STATUS,
  CANONICAL_CURIOSITY_GOVERNANCE,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EXPLORATION_VALIDATION_CODES = {
  EXPLORATION_DUPLICATE_ID: 'EXPLORATION_DUPLICATE_ID',
  EXPLORATION_DUPLICATE_TITLE: 'EXPLORATION_DUPLICATE_TITLE',
  EXPLORATION_INVALID_CHALLENGE: 'EXPLORATION_INVALID_CHALLENGE',
  EXPLORATION_INVALID_WHATS_IF: 'EXPLORATION_INVALID_WHATS_IF',
  EXPLORATION_INVALID_EXPERIMENT: 'EXPLORATION_INVALID_EXPERIMENT',
  EXPLORATION_INVALID_OBJECTIVE: 'EXPLORATION_INVALID_OBJECTIVE',
  EXPLORATION_INVALID_STATUS: 'EXPLORATION_INVALID_STATUS',
  EXPLORATION_INVALID_GOVERNANCE: 'EXPLORATION_INVALID_GOVERNANCE',
  EXPLORATION_MISSING_PROVENANCE: 'EXPLORATION_MISSING_PROVENANCE',
  EXPLORATION_MISSING_PROVIDER: 'EXPLORATION_MISSING_PROVIDER',
  EXPLORATION_MISSING_RATIONALE: 'EXPLORATION_MISSING_RATIONALE',
  EXPLORATION_MISSING_CURIOSITY_REFERENCE: 'EXPLORATION_MISSING_CURIOSITY_REFERENCE',
  EXPLORATION_MISSING_PROFILE_ID: 'EXPLORATION_MISSING_PROFILE_ID',
  EXPLORATION_MISSING_TITLE: 'EXPLORATION_MISSING_TITLE',
  EXPLORATION_MISSING_EXPLORATION: 'EXPLORATION_MISSING_EXPLORATION',
  EXPLORATION_SELF_RELATIONSHIP: 'EXPLORATION_SELF_RELATIONSHIP',
  EXPLORATION_EMPTY_REGISTRY: 'EXPLORATION_EMPTY_REGISTRY',
  EXPLORATION_INVALID_TRACE: 'EXPLORATION_INVALID_TRACE',
  EXPLORATION_REGISTRY_INCONSISTENCY: 'EXPLORATION_REGISTRY_INCONSISTENCY',
  EXPLORATION_INVALID_CONFIGURATION: 'EXPLORATION_INVALID_CONFIGURATION',
  EXPLORATION_INVALID_REFERENCE: 'EXPLORATION_INVALID_REFERENCE',
  EXPLORATION_INVALID_RELATIONSHIP: 'EXPLORATION_INVALID_RELATIONSHIP',
  EXPLORATION_MISSING_RELATIONSHIP: 'EXPLORATION_MISSING_RELATIONSHIP',
  EXPLORATION_MISSING_GOVERNANCE: 'EXPLORATION_MISSING_GOVERNANCE',
} as const;

// ---------------------------------------------------------------------------
// Single Challenge Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single laboratory challenge against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryChallenge(
  challenge: LaboratoryChallenge,
): readonly ExplorationValidationError[] {
  const errors: ExplorationValidationError[] = [];

  if (!challenge.challengeId || challenge.challengeId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROFILE_ID,
      message: 'Laboratory challenge is missing a challenge ID.',
      field: 'challengeId',
      profileId: challenge.challengeId,
    });
  }

  if (!challenge.title || challenge.title.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_TITLE,
      message: 'Laboratory challenge is missing a title.',
      field: 'title',
      profileId: challenge.challengeId,
    });
  }

  if (!CANONICAL_LAB_CHALLENGE_TYPES.includes(challenge.challengeType)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CHALLENGE,
      message: `Laboratory challenge has unsupported challenge type: "${challenge.challengeType}".`,
      field: 'challengeType',
      profileId: challenge.challengeId,
    });
  }

  if (!challenge.challengeDescription || challenge.challengeDescription.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Laboratory challenge is missing challenge description.',
      field: 'challengeDescription',
      profileId: challenge.challengeId,
    });
  }

  if (!challenge.expectedOutcome || challenge.expectedOutcome.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Laboratory challenge is missing expected outcome.',
      field: 'expectedOutcome',
      profileId: challenge.challengeId,
    });
  }

  if (!challenge.difficultyLevel || challenge.difficultyLevel.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Laboratory challenge is missing difficulty level.',
      field: 'difficultyLevel',
      profileId: challenge.challengeId,
    });
  }

  if (!CANONICAL_EXPLORATION_STATUS.includes(challenge.status)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_STATUS,
      message: `Laboratory challenge has unsupported status: "${challenge.status}".`,
      field: 'status',
      profileId: challenge.challengeId,
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(challenge.governance)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_GOVERNANCE,
      message: `Laboratory challenge has invalid governance: "${challenge.governance}".`,
      field: 'governance',
      profileId: challenge.challengeId,
    });
  }

  if (!challenge.provenance) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
      message: 'Laboratory challenge is missing provenance.',
      field: 'provenance',
      profileId: challenge.challengeId,
    });
  } else {
    if (!challenge.provenance.provider || challenge.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
        message: 'Laboratory challenge provenance is missing a provider.',
        field: 'provenance.provider',
        profileId: challenge.challengeId,
      });
    }

    if (!challenge.provenance.rationale || challenge.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
        message: 'Laboratory challenge provenance is missing a rationale.',
        field: 'provenance.rationale',
        profileId: challenge.challengeId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// What-If Prompt Validation
// ---------------------------------------------------------------------------

/**
 * Validates a what-if prompt against canonical invariants.
 * Pure function. No side effects.
 */
export function validateWhatIfPrompt(
  prompt: WhatIfPrompt,
): readonly ExplorationValidationError[] {
  const errors: ExplorationValidationError[] = [];

  if (!prompt.promptId || prompt.promptId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_EXPLORATION,
      message: 'What-if prompt is missing a prompt ID.',
      field: 'promptId',
    });
  }

  if (!prompt.title || prompt.title.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_TITLE,
      message: 'What-if prompt is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_WHATS_IF_TYPES.includes(prompt.promptType)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_WHATS_IF,
      message: `What-if prompt has unsupported prompt type: "${prompt.promptType}".`,
      field: 'promptType',
    });
  }

  if (!prompt.promptDescription || prompt.promptDescription.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'What-if prompt is missing prompt description.',
      field: 'promptDescription',
    });
  }

  if (!prompt.expectedInsight || prompt.expectedInsight.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'What-if prompt is missing expected insight.',
      field: 'expectedInsight',
    });
  }

  if (!CANONICAL_EXPLORATION_STATUS.includes(prompt.status)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_STATUS,
      message: `What-if prompt has unsupported status: "${prompt.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(prompt.governance)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_GOVERNANCE,
      message: `What-if prompt has invalid governance: "${prompt.governance}".`,
      field: 'governance',
    });
  }

  if (!prompt.provenance) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
      message: 'What-if prompt is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!prompt.provenance.provider || prompt.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
        message: 'What-if prompt provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!prompt.provenance.rationale || prompt.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
        message: 'What-if prompt provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Experiment Curiosity Validation
// ---------------------------------------------------------------------------

/**
 * Validates an experiment curiosity against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExperimentCuriosity(
  experiment: ExperimentCuriosity,
): readonly ExplorationValidationError[] {
  const errors: ExplorationValidationError[] = [];

  if (!experiment.experimentId || experiment.experimentId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_EXPLORATION,
      message: 'Experiment curiosity is missing an experiment ID.',
      field: 'experimentId',
    });
  }

  if (!experiment.title || experiment.title.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_TITLE,
      message: 'Experiment curiosity is missing a title.',
      field: 'title',
    });
  }

  if (!CANONICAL_EXPERIMENT_TYPES.includes(experiment.experimentType)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_EXPERIMENT,
      message: `Experiment curiosity has unsupported experiment type: "${experiment.experimentType}".`,
      field: 'experimentType',
    });
  }

  if (!experiment.experimentDescription || experiment.experimentDescription.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Experiment curiosity is missing experiment description.',
      field: 'experimentDescription',
    });
  }

  if (!experiment.hypothesis || experiment.hypothesis.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Experiment curiosity is missing hypothesis.',
      field: 'hypothesis',
    });
  }

  if (!experiment.expectedResult || experiment.expectedResult.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_CONFIGURATION,
      message: 'Experiment curiosity is missing expected result.',
      field: 'expectedResult',
    });
  }

  if (!CANONICAL_EXPLORATION_STATUS.includes(experiment.status)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_STATUS,
      message: `Experiment curiosity has unsupported status: "${experiment.status}".`,
      field: 'status',
    });
  }

  if (!CANONICAL_CURIOSITY_GOVERNANCE.includes(experiment.governance)) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_GOVERNANCE,
      message: `Experiment curiosity has invalid governance: "${experiment.governance}".`,
      field: 'governance',
    });
  }

  if (!experiment.provenance) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
      message: 'Experiment curiosity is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!experiment.provenance.provider || experiment.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
        message: 'Experiment curiosity provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!experiment.provenance.rationale || experiment.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
        message: 'Experiment curiosity provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Exploration Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates an exploration relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExplorationRelationship(
  relationship: ExplorationRelationship,
): readonly ExplorationValidationError[] {
  const errors: ExplorationValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Exploration relationship is missing a relationship ID.',
      field: 'relationshipId',
    });
  }

  if (!relationship.sourceProfileId || relationship.sourceProfileId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Exploration relationship is missing a source profile ID.',
      field: 'sourceProfileId',
    });
  }

  if (!relationship.targetProfileId || relationship.targetProfileId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Exploration relationship is missing a target profile ID.',
      field: 'targetProfileId',
    });
  }

  if (relationship.sourceProfileId === relationship.targetProfileId) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_SELF_RELATIONSHIP,
      message: 'Exploration relationship cannot be a self-relationship.',
      field: 'targetProfileId',
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
      message: 'Exploration relationship is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!relationship.provenance.provider || relationship.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
        message: 'Exploration relationship provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
        message: 'Exploration relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Exploration Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an exploration registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExplorationRegistry(
  registry: ExplorationRegistry,
): ExplorationRegistryValidationResult {
  const errors: ExplorationValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.challenges || registry.challenges.length === 0) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY,
      message: 'Registry has no challenges.',
      field: 'challenges',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate challenge IDs
  const seenIds = new Set<string>();
  for (const challenge of registry.challenges) {
    if (seenIds.has(challenge.challengeId)) {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_ID,
        message: `Duplicate challenge ID: "${challenge.challengeId}".`,
        profileId: challenge.challengeId,
      });
    }
    seenIds.add(challenge.challengeId);
  }

  // Check for duplicate titles
  const seenTitles = new Set<string>();
  for (const challenge of registry.challenges) {
    if (seenTitles.has(challenge.title)) {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_DUPLICATE_TITLE,
        message: `Duplicate challenge title: "${challenge.title}".`,
        field: 'title',
        profileId: challenge.challengeId,
      });
    }
    seenTitles.add(challenge.title);
  }

  // Validate each challenge
  for (const challenge of registry.challenges) {
    errors.push(...validateLaboratoryChallenge(challenge));
  }

  // Validate each prompt
  for (const prompt of registry.prompts) {
    errors.push(...validateWhatIfPrompt(prompt));
  }

  // Validate each experiment
  for (const experiment of registry.experiments) {
    errors.push(...validateExperimentCuriosity(experiment));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateExplorationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'exploration_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Exploration Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates exploration input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExplorationInput(
  input: ExplorationInput,
): ExplorationInputValidationResult {
  const errors: ExplorationValidationError[] = [];

  if (!input.challenges || input.challenges.length === 0) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY,
      message: 'Input has no challenges.',
      field: 'challenges',
    });
  } else {
    for (const challenge of input.challenges) {
      errors.push(...validateLaboratoryChallenge(challenge));
    }
  }

  for (const prompt of input.prompts) {
    errors.push(...validateWhatIfPrompt(prompt));
  }

  for (const experiment of input.experiments) {
    errors.push(...validateExperimentCuriosity(experiment));
  }

  for (const relationship of input.relationships) {
    errors.push(...validateExplorationRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'exploration_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Exploration Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates an exploration trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExplorationTrace(
  trace: LaboratoryCuriosityTrace,
): ExplorationTraceValidationResult {
  const errors: ExplorationValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Exploration trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Exploration trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Exploration trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_INVALID_TRACE,
      message: 'Exploration trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'exploration_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Curiosity Artifact With Exploration Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curiosity artifact with exploration against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCuriosityArtifactWithExploration(
  artifact: CuriosityArtifactWithExploration,
): CuriosityArtifactWithExplorationValidationResult {
  const errors: ExplorationValidationError[] = [];

  if (!artifact.curiosityId || artifact.curiosityId.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_CURIOSITY_REFERENCE,
      message: 'Curiosity artifact is missing a curiosity ID.',
      field: 'curiosityId',
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_TITLE,
      message: 'Curiosity artifact is missing a title.',
      field: 'title',
    });
  }

  if (!artifact.challenges || artifact.challenges.length === 0) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_EMPTY_REGISTRY,
      message: 'Curiosity artifact has no challenges.',
      field: 'challenges',
    });
  } else {
    for (const challenge of artifact.challenges) {
      errors.push(...validateLaboratoryChallenge(challenge));
    }
  }

  if (!artifact.provenance) {
    errors.push({
      code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVENANCE,
      message: 'Curiosity artifact is missing provenance.',
      field: 'provenance',
    });
  } else {
    if (!artifact.provenance.provider || artifact.provenance.provider.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_PROVIDER,
        message: 'Curiosity artifact provenance is missing a provider.',
        field: 'provenance.provider',
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: EXPLORATION_VALIDATION_CODES.EXPLORATION_MISSING_RATIONALE,
        message: 'Curiosity artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_artifact_with_exploration_composition',
  };
}
