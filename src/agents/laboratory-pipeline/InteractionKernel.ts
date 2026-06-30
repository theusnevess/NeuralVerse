/**
 * NV-1600-D4-OPT-07 — Laboratory Interaction & User Action Modeling Kernel
 *
 * Deterministic orchestration functions for interaction metadata.
 * Produces interactions, user actions, artifacts, traces, and registries.
 *
 * This module never:
 * - Executes interactions
 * - Handles click events
 * - Uses UI events
 * - Uses callbacks
 * - Uses listeners
 * - Uses event emitters
 * - Stores runtime state
 * - Stores execution history
 * - Stores learner progress
 * - Uses telemetry
 * - Uses analytics
 * - Uses session state
 * - Uses browser APIs
 * - Uses persistence
 * - Uses synchronization
 * - Uses prediction engines
 * - Uses adaptive behavior
 *
 * Interaction metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryInteraction,
  LaboratoryUserAction,
  LaboratoryInteractionRegistry,
  LaboratoryInteractionDecision,
  LaboratoryInteractionTrace,
  LaboratoryInteractionInput,
  LaboratoryArtifactWithInteractions,
  LaboratoryInteractionProvenance,
  LaboratoryInteractionType,
  LaboratoryUserActionType,
  LaboratoryInteractionStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_INTERACTION_TYPES,
  CANONICAL_USER_ACTION_TYPES,
  CANONICAL_INTERACTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Interaction Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes interaction provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeInteractionProvenance(params: {
  readonly interactionId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryInteractionProvenance {
  return {
    interactionId: params.interactionId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// User Action Composition
// ---------------------------------------------------------------------------

/**
 * Composes a user action from provided parameters.
 * Pure function. No side effects.
 */
export function composeUserAction(params: {
  readonly actionId: string;
  readonly actionType: LaboratoryUserActionType;
  readonly title: string;
  readonly description: string;
  readonly targetId: string;
  readonly targetType: string;
  readonly interactionId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryUserAction {
  return {
    actionId: params.actionId,
    actionType: params.actionType,
    title: params.title,
    description: params.description,
    targetId: params.targetId,
    targetType: params.targetType,
    interactionId: params.interactionId,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Interaction Composition
// ---------------------------------------------------------------------------

/**
 * Composes an interaction from provided parameters.
 * Pure function. No side effects.
 */
export function composeInteraction(params: {
  readonly interactionId: string;
  readonly interactionType: LaboratoryInteractionType;
  readonly name: string;
  readonly description: string;
  readonly workflowId: string;
  readonly workflowStepId: string;
  readonly experimentId: string;
  readonly configurationId: string;
  readonly parameterId: string;
  readonly resultArtifactId: string;
  readonly visualizationId: string;
  readonly datasetReferenceId: string;
  readonly actions: readonly LaboratoryUserAction[];
  readonly status: LaboratoryInteractionStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryInteractionProvenance;
}): LaboratoryInteraction {
  return {
    interactionId: params.interactionId,
    interactionType: params.interactionType,
    name: params.name,
    description: params.description,
    workflowId: params.workflowId,
    workflowStepId: params.workflowStepId,
    experimentId: params.experimentId,
    configurationId: params.configurationId,
    parameterId: params.parameterId,
    resultArtifactId: params.resultArtifactId,
    visualizationId: params.visualizationId,
    datasetReferenceId: params.datasetReferenceId,
    actions: [...params.actions],
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Interaction Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an interaction decision from validation results.
 * Pure function. No side effects.
 */
function _composeInteractionDecision(
  interactionId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryInteractionDecision {
  return {
    decisionId: `_decision_interaction_${interactionId}`,
    interactionId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Interaction Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an interaction trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeInteractionTrace(params: {
  readonly traceId: string;
  readonly interactionCount: number;
  readonly actionCount: number;
  readonly decisions: readonly LaboratoryInteractionDecision[];
}): LaboratoryInteractionTrace {
  return {
    traceId: params.traceId,
    interactionCount: params.interactionCount,
    actionCount: params.actionCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_interaction_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for interactions.
 * Sorts by interactionId, then interactionType, then actionType, then targetId.
 * Pure function. No side effects.
 */
function _compareInteraction(
  a: LaboratoryInteraction,
  b: LaboratoryInteraction,
): number {
  if (a.interactionId < b.interactionId) return -1;
  if (a.interactionId > b.interactionId) return 1;

  if (a.interactionType < b.interactionType) return -1;
  if (a.interactionType > b.interactionType) return 1;

  const aActionType = a.actions[0]?.actionType ?? '';
  const bActionType = b.actions[0]?.actionType ?? '';
  if (aActionType < bActionType) return -1;
  if (aActionType > bActionType) return 1;

  const aTargetId = a.actions[0]?.targetId ?? '';
  const bTargetId = b.actions[0]?.targetId ?? '';
  if (aTargetId < bTargetId) return -1;
  if (aTargetId > bTargetId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Interaction Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an interaction registry from interactions.
 * Pure function. No side effects.
 * Deterministic ordering: interactionId → interactionType → actionType → targetId.
 */
export function composeInteractionRegistry(
  interactions: readonly LaboratoryInteraction[],
): LaboratoryInteractionRegistry {
  const sortedInteractions = [...interactions].sort(_compareInteraction);

  const totalActions = sortedInteractions.reduce((sum, inter) => sum + inter.actions.length, 0);

  return {
    registryId: `_interaction_registry_${sortedInteractions.length}`,
    interactions: sortedInteractions,
    interactionCount: sortedInteractions.length,
    actionCount: totalActions,
    deterministic: true,
    generatedFrom: 'deterministic_interaction_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Interactions Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory interaction artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryInteractions(
  input: LaboratoryInteractionInput,
): LaboratoryArtifactWithInteractions {
  const decisions = input.interactions.map((inter) => {
    const errors = _validateInteractionForDecision(inter);
    return _composeInteractionDecision(inter.interactionId, errors.length === 0, errors);
  });

  const totalActions = input.interactions.reduce((sum, inter) => sum + inter.actions.length, 0);

  const trace = composeInteractionTrace({
    traceId: `_trace_interaction_${input.interactions.length}`,
    interactionCount: input.interactions.length,
    actionCount: totalActions,
    decisions,
  });

  const registry = composeInteractionRegistry(input.interactions);

  return {
    artifactId: `_artifact_interaction_${input.interactions.length}`,
    registry,
    trace,
  };
}

/**
 * Validates an interaction for decision composition.
 * Pure function. No side effects.
 */
function _validateInteractionForDecision(
  inter: LaboratoryInteraction,
): readonly string[] {
  const errors: string[] = [];

  if (!inter.interactionId || inter.interactionId.trim() === '') {
    errors.push('INTERACTION_MISSING_INTERACTION_ID');
  }

  if (!inter.name || inter.name.trim() === '') {
    errors.push('INTERACTION_MISSING_NAME');
  }

  if (!CANONICAL_INTERACTION_TYPES.includes(inter.interactionType)) {
    errors.push('INTERACTION_UNKNOWN_TYPE');
  }

  if (!CANONICAL_INTERACTION_STATUS.includes(inter.status)) {
    errors.push('INTERACTION_UNKNOWN_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(inter.governanceStatus)) {
    errors.push('INTERACTION_INVALID_GOVERNANCE');
  }

  if (!inter.provenance) {
    errors.push('INTERACTION_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported interaction type.
 */
export function isSupportedInteractionType(
  interactionType: string,
): interactionType is LaboratoryInteractionType {
  return CANONICAL_INTERACTION_TYPES.includes(interactionType as LaboratoryInteractionType);
}

/**
 * Checks if a string is a supported user action type.
 */
export function isSupportedUserActionType(
  actionType: string,
): actionType is LaboratoryUserActionType {
  return CANONICAL_USER_ACTION_TYPES.includes(actionType as LaboratoryUserActionType);
}

/**
 * Checks if a string is a supported interaction status.
 */
export function isSupportedInteractionStatus(
  status: string,
): status is LaboratoryInteractionStatus {
  return CANONICAL_INTERACTION_STATUS.includes(status as LaboratoryInteractionStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedInteractionGovernanceStatus(
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
 * Returns the canonical interaction types.
 */
export function getCanonicalInteractionTypes(): readonly LaboratoryInteractionType[] {
  return CANONICAL_INTERACTION_TYPES;
}

/**
 * Returns the canonical user action types.
 */
export function getCanonicalUserActionTypes(): readonly LaboratoryUserActionType[] {
  return CANONICAL_USER_ACTION_TYPES;
}

/**
 * Returns the canonical interaction statuses.
 */
export function getCanonicalInteractionStatuses(): readonly LaboratoryInteractionStatus[] {
  return CANONICAL_INTERACTION_STATUS;
}
