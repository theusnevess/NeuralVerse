/**
 * NV-1600-D4-OPT-07 — Interaction Validation Layer
 *
 * Deterministic validation for interaction metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryInteraction,
  LaboratoryUserAction,
  LaboratoryInteractionRegistry,
  LaboratoryArtifactWithInteractions,
  LaboratoryInteractionInput,
  LaboratoryInteractionValidationError,
  LaboratoryInteractionValidationResult,
  LaboratoryInteractionRegistryValidationResult,
  LaboratoryInteractionArtifactValidationResult,
  LaboratoryInteractionInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_INTERACTION_TYPES,
  CANONICAL_USER_ACTION_TYPES,
  CANONICAL_INTERACTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const INTERACTION_VALIDATION_CODES = {
  INTERACTION_UNKNOWN_TYPE: 'INTERACTION_UNKNOWN_TYPE',
  INTERACTION_UNKNOWN_STATUS: 'INTERACTION_UNKNOWN_STATUS',
  ACTION_UNKNOWN_TYPE: 'ACTION_UNKNOWN_TYPE',
  INTERACTION_DUPLICATE_ID: 'INTERACTION_DUPLICATE_ID',
  INTERACTION_DUPLICATE_NAME: 'INTERACTION_DUPLICATE_NAME',
  ACTION_DUPLICATE_ID: 'ACTION_DUPLICATE_ID',
  INTERACTION_MISSING_INTERACTION_ID: 'INTERACTION_MISSING_INTERACTION_ID',
  INTERACTION_MISSING_NAME: 'INTERACTION_MISSING_NAME',
  INTERACTION_MISSING_STEPS: 'INTERACTION_MISSING_STEPS',
  INTERACTION_INVALID_GOVERNANCE: 'INTERACTION_INVALID_GOVERNANCE',
  INTERACTION_MISSING_PROVENANCE: 'INTERACTION_MISSING_PROVENANCE',
  INTERACTION_INVALID_REFERENCE: 'INTERACTION_INVALID_REFERENCE',
  ACTION_MISSING_ID: 'ACTION_MISSING_ID',
  ACTION_MISSING_TITLE: 'ACTION_MISSING_TITLE',
  ACTION_INVALID_GOVERNANCE: 'ACTION_INVALID_GOVERNANCE',
  ACTION_INVALID_REFERENCE: 'ACTION_INVALID_REFERENCE',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  REGISTRY_DUPLICATE_INTERACTION_ID: 'REGISTRY_DUPLICATE_INTERACTION_ID',
  REGISTRY_DUPLICATE_INTERACTION_NAME: 'REGISTRY_DUPLICATE_INTERACTION_NAME',
  REGISTRY_DUPLICATE_ACTION_ID: 'REGISTRY_DUPLICATE_ACTION_ID',
} as const;

// ---------------------------------------------------------------------------
// Single User Action Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single user action against canonical invariants.
 * Pure function. No side effects.
 */
export function validateUserAction(
  action: LaboratoryUserAction,
): readonly LaboratoryInteractionValidationError[] {
  const errors: LaboratoryInteractionValidationError[] = [];

  if (!action.actionId || action.actionId.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.ACTION_MISSING_ID,
      message: 'User action is missing an action ID.',
      field: 'actionId',
      actionId: action.actionId,
    });
  }

  if (!action.title || action.title.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.ACTION_MISSING_TITLE,
      message: 'User action is missing a title.',
      field: 'title',
      actionId: action.actionId,
    });
  }

  if (!CANONICAL_USER_ACTION_TYPES.includes(action.actionType)) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.ACTION_UNKNOWN_TYPE,
      message: `User action has unsupported type: "${action.actionType}".`,
      field: 'actionType',
      actionId: action.actionId,
    });
  }

  if (!action.targetId || action.targetId.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.ACTION_INVALID_REFERENCE,
      message: 'User action is missing a target ID.',
      field: 'targetId',
      actionId: action.actionId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(action.governanceStatus)) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.ACTION_INVALID_GOVERNANCE,
      message: `User action has invalid governance status: "${action.governanceStatus}".`,
      field: 'governanceStatus',
      actionId: action.actionId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Interaction Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single interaction against canonical invariants.
 * Pure function. No side effects.
 */
export function validateInteraction(
  inter: LaboratoryInteraction,
): readonly LaboratoryInteractionValidationError[] {
  const errors: LaboratoryInteractionValidationError[] = [];

  if (!inter.interactionId || inter.interactionId.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_INTERACTION_ID,
      message: 'Interaction is missing an interaction ID.',
      field: 'interactionId',
      interactionId: inter.interactionId,
    });
  }

  if (!inter.name || inter.name.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_NAME,
      message: 'Interaction is missing a name.',
      field: 'name',
      interactionId: inter.interactionId,
    });
  }

  if (!CANONICAL_INTERACTION_TYPES.includes(inter.interactionType)) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_UNKNOWN_TYPE,
      message: `Interaction has unsupported type: "${inter.interactionType}".`,
      field: 'interactionType',
      interactionId: inter.interactionId,
    });
  }

  if (!CANONICAL_INTERACTION_STATUS.includes(inter.status)) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_UNKNOWN_STATUS,
      message: `Interaction has unsupported status: "${inter.status}".`,
      field: 'status',
      interactionId: inter.interactionId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(inter.governanceStatus)) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_INVALID_GOVERNANCE,
      message: `Interaction has invalid governance status: "${inter.governanceStatus}".`,
      field: 'governanceStatus',
      interactionId: inter.interactionId,
    });
  }

  if (!inter.provenance) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_PROVENANCE,
      message: 'Interaction is missing provenance.',
      field: 'provenance',
      interactionId: inter.interactionId,
    });
  }

  if (!inter.actions || inter.actions.length === 0) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_MISSING_STEPS,
      message: 'Interaction has no actions.',
      field: 'actions',
      interactionId: inter.interactionId,
    });
  } else {
    // Check for duplicate action IDs
    const seenActionIds = new Set<string>();
    for (const action of inter.actions) {
      if (seenActionIds.has(action.actionId)) {
        errors.push({
          code: INTERACTION_VALIDATION_CODES.ACTION_DUPLICATE_ID,
          message: `Duplicate action ID: "${action.actionId}".`,
          field: 'actionId',
          interactionId: inter.interactionId,
          actionId: action.actionId,
        });
      }
      seenActionIds.add(action.actionId);
    }

    // Validate each action
    for (const action of inter.actions) {
      errors.push(...validateUserAction(action));
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Interaction Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an interaction registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateInteractionRegistry(
  registry: LaboratoryInteractionRegistry,
): LaboratoryInteractionRegistryValidationResult {
  const errors: LaboratoryInteractionValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.interactions || registry.interactions.length === 0) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry has no interactions.',
      field: 'interactions',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate interaction IDs
  const seenInteractionIds = new Set<string>();
  for (const inter of registry.interactions) {
    if (seenInteractionIds.has(inter.interactionId)) {
      errors.push({
        code: INTERACTION_VALIDATION_CODES.REGISTRY_DUPLICATE_INTERACTION_ID,
        message: `Duplicate interaction ID: "${inter.interactionId}".`,
        interactionId: inter.interactionId,
      });
    }
    seenInteractionIds.add(inter.interactionId);
  }

  // Check for duplicate interaction names
  const seenInteractionNames = new Set<string>();
  for (const inter of registry.interactions) {
    if (seenInteractionNames.has(inter.name)) {
      errors.push({
        code: INTERACTION_VALIDATION_CODES.REGISTRY_DUPLICATE_INTERACTION_NAME,
        message: `Duplicate interaction name: "${inter.name}".`,
        field: 'name',
        interactionId: inter.interactionId,
      });
    }
    seenInteractionNames.add(inter.name);
  }

  // Check for duplicate action IDs across all interactions
  const seenActionIds = new Set<string>();
  for (const inter of registry.interactions) {
    for (const action of inter.actions) {
      if (seenActionIds.has(action.actionId)) {
        errors.push({
          code: INTERACTION_VALIDATION_CODES.REGISTRY_DUPLICATE_ACTION_ID,
          message: `Duplicate action ID: "${action.actionId}".`,
          actionId: action.actionId,
        });
      }
      seenActionIds.add(action.actionId);
    }
  }

  // Validate each interaction
  for (const inter of registry.interactions) {
    errors.push(...validateInteraction(inter));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'interaction_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with interactions against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithInteractions(
  artifact: LaboratoryArtifactWithInteractions,
): LaboratoryInteractionArtifactValidationResult {
  const errors: LaboratoryInteractionValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.INTERACTION_INVALID_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateInteractionRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: INTERACTION_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: INTERACTION_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: INTERACTION_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'interaction_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates interaction input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateInteractionInput(
  input: LaboratoryInteractionInput,
): LaboratoryInteractionInputValidationResult {
  const errors: LaboratoryInteractionValidationError[] = [];

  if (!input.interactions || input.interactions.length === 0) {
    errors.push({
      code: INTERACTION_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Input has no interactions.',
      field: 'interactions',
    });
  } else {
    for (const inter of input.interactions) {
      errors.push(...validateInteraction(inter));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'interaction_input_composition',
  };
}
