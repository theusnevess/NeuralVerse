/**
 * NV-1400-D2-OPT-13-B — Literature Maintenance Orchestration Kernel
 *
 * Deterministic orchestration functions for literature maintenance metadata.
 * Produces maintenance registries, signals, and traces.
 *
 * This module never:
 * - Updates references
 * - Rewrites content
 * - Fetches newer literature
 * - Infers consensus shifts
 * - Calls external APIs
 * - Uses LLMs
 * - Automatically revises canonical content
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchMaintenanceSignal,
  ResearchMaintenanceRegistry,
  ResearchMaintenanceDecision,
  ResearchMaintenanceTrace,
  ResearchMaintenanceInput,
  ResearchArtifactWithMaintenance,
  ResearchMaintenanceSignalType,
  ResearchMaintenancePriority,
  ResearchMaintenanceActionType,
  ResearchMaintenanceProvenance,
  ResearchGovernanceStatus,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_MAINTENANCE_SIGNAL_TYPES,
  CANONICAL_MAINTENANCE_PRIORITIES,
  CANONICAL_MAINTENANCE_ACTIONS,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Maintenance Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes maintenance provenance.
 * Pure function. No side effects.
 */
export function composeMaintenanceProvenance(
  signalId: string,
  referenceId: string,
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  signalType: ResearchMaintenanceSignalType,
  rationale: string,
  providedBy: string,
): ResearchMaintenanceProvenance {
  return {
    signalId,
    referenceId,
    source,
    governanceStatus,
    signalType,
    rationale,
    providedBy,
  };
}

// ---------------------------------------------------------------------------
// Maintenance Signal Composition
// ---------------------------------------------------------------------------

/**
 * Composes a maintenance signal.
 * Pure function. No side effects.
 */
export function composeMaintenanceSignal(
  signalId: string,
  signalType: ResearchMaintenanceSignalType,
  priority: ResearchMaintenancePriority,
  recommendedAction: ResearchMaintenanceActionType,
  affectedReferenceIds: readonly string[],
  affectedArtifactIds: readonly string[],
  replacementReferenceIds: readonly string[],
  source: string,
  governanceStatus: ResearchGovernanceStatus,
  lifecycle: 'active' | 'deprecated' | 'historical',
  rationale: string,
  provenance: ResearchMaintenanceProvenance,
): ResearchMaintenanceSignal {
  return {
    signalId,
    signalType,
    priority,
    recommendedAction,
    affectedReferenceIds: [...affectedReferenceIds],
    affectedArtifactIds: [...affectedArtifactIds],
    replacementReferenceIds: [...replacementReferenceIds],
    source,
    governanceStatus,
    lifecycle,
    rationale,
    provenance,
  };
}

// ---------------------------------------------------------------------------
// Maintenance Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a maintenance registry from signals.
 * Pure function. No side effects.
 */
export function composeMaintenanceRegistry(
  registryId: string,
  signals: readonly ResearchMaintenanceSignal[],
): ResearchMaintenanceRegistry {
  const sortedSignals = _sortSignalsDeterministically(signals);

  return {
    registryId,
    signals: [...sortedSignals],
    deterministic: true,
    generatedFrom: 'deterministic_maintenance_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Research Maintenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes research maintenance from an input.
 * Pure function. No side effects.
 */
export function composeResearchMaintenance(
  input: ResearchMaintenanceInput,
): ResearchArtifactWithMaintenance {
  const decisions = _composeDecisions(input);

  const trace: ResearchMaintenanceTrace = {
    traceId: `_maintenance_trace_${input.conceptId}`,
    signalCount: input.signals.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_maintenance_kernel',
    randomUsed: false,
    timeDependency: false,
  };

  const registry = composeMaintenanceRegistry(
    `_maintenance_registry_${input.conceptId}`,
    input.signals,
  );

  return {
    artifactId: `_maintenance_artifact_${input.conceptId}`,
    artifactType: 'concept',
    maintenanceRegistry: registry,
    maintenanceTrace: trace,
  };
}

/**
 * Composes maintenance decisions from input signals.
 * Pure function. No side effects.
 */
function _composeDecisions(
  input: ResearchMaintenanceInput,
): readonly ResearchMaintenanceDecision[] {
  return input.signals.map((signal) => {
    const validationErrors = _validateSignalForDecision(signal);
    const validationPassed = validationErrors.length === 0;

    return {
      decisionId: `_decision_${signal.signalId}`,
      signalId: signal.signalId,
      signalType: signal.signalType,
      priority: signal.priority,
      recommendedAction: signal.recommendedAction,
      validationPassed,
      validationErrors,
    };
  });
}

/**
 * Validates a maintenance signal for decision composition.
 * Returns validation error codes.
 */
function _validateSignalForDecision(signal: ResearchMaintenanceSignal): readonly string[] {
  const errors: string[] = [];

  if (!signal.signalId || signal.signalId.trim() === '') {
    errors.push('MAINT_MISSING_SOURCE');
  }

  if (!CANONICAL_MAINTENANCE_SIGNAL_TYPES.includes(signal.signalType)) {
    errors.push('MAINT_UNKNOWN_SIGNAL_TYPE');
  }

  if (!CANONICAL_MAINTENANCE_PRIORITIES.includes(signal.priority)) {
    errors.push('MAINT_UNKNOWN_PRIORITY');
  }

  if (!CANONICAL_MAINTENANCE_ACTIONS.includes(signal.recommendedAction)) {
    errors.push('MAINT_UNKNOWN_ACTION');
  }

  if (!signal.affectedReferenceIds || signal.affectedReferenceIds.length === 0) {
    errors.push('MAINT_MISSING_AFFECTED_REFERENCE');
  }

  if (!signal.source || signal.source.trim() === '') {
    errors.push('MAINT_MISSING_SOURCE');
  }

  if (!signal.provenance || !signal.provenance.rationale || signal.provenance.rationale.trim() === '') {
    errors.push('MAINT_MISSING_PROVENANCE');
  }

  if (!signal.rationale || signal.rationale.trim() === '') {
    errors.push('MAINT_MISSING_RATIONALE');
  }

  if (!signal.governanceStatus || signal.governanceStatus.trim() === '') {
    errors.push('MAINT_INVALID_GOVERNANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts maintenance signals deterministically.
 * Sorting based on signalId for consistent ordering.
 * Pure function. No side effects.
 */
function _sortSignalsDeterministically(
  signals: readonly ResearchMaintenanceSignal[],
): readonly ResearchMaintenanceSignal[] {
  return [...signals].sort((a, b) => a.signalId.localeCompare(b.signalId));
}

// ---------------------------------------------------------------------------
// Maintenance Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a maintenance trace.
 * Pure function. No side effects.
 */
export function composeMaintenanceTrace(
  traceId: string,
  decisions: readonly ResearchMaintenanceDecision[],
): ResearchMaintenanceTrace {
  return {
    traceId,
    signalCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions: [...decisions],
    deterministic: true,
    generatedFrom: 'deterministic_maintenance_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Signal Type, Priority, and Action Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a maintenance signal type is supported (in canonical signal types).
 */
export function isSupportedMaintenanceSignalType(
  signalType: string,
): signalType is ResearchMaintenanceSignalType {
  return CANONICAL_MAINTENANCE_SIGNAL_TYPES.includes(signalType as ResearchMaintenanceSignalType);
}

/**
 * Checks if a maintenance priority is supported (in canonical priorities).
 */
export function isSupportedMaintenancePriority(
  priority: string,
): priority is ResearchMaintenancePriority {
  return CANONICAL_MAINTENANCE_PRIORITIES.includes(priority as ResearchMaintenancePriority);
}

/**
 * Checks if a maintenance action is supported (in canonical actions).
 */
export function isSupportedMaintenanceAction(
  action: string,
): action is ResearchMaintenanceActionType {
  return CANONICAL_MAINTENANCE_ACTIONS.includes(action as ResearchMaintenanceActionType);
}

/**
 * Returns all canonical maintenance signal types.
 */
export function getCanonicalMaintenanceSignalTypes(): readonly ResearchMaintenanceSignalType[] {
  return CANONICAL_MAINTENANCE_SIGNAL_TYPES;
}

/**
 * Returns all canonical maintenance priorities.
 */
export function getCanonicalMaintenancePriorities(): readonly ResearchMaintenancePriority[] {
  return CANONICAL_MAINTENANCE_PRIORITIES;
}

/**
 * Returns all canonical maintenance actions.
 */
export function getCanonicalMaintenanceActions(): readonly ResearchMaintenanceActionType[] {
  return CANONICAL_MAINTENANCE_ACTIONS;
}
