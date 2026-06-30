/**
 * NV-1400-D2-OPT-13-B — Literature Maintenance Validation Layer
 *
 * Deterministic validation for literature maintenance metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchMaintenanceSignal,
  ResearchMaintenanceRegistry,
  ResearchArtifactWithMaintenance,
  ResearchMaintenanceValidationError,
  ResearchMaintenanceValidationResult,
  ResearchMaintenanceInput,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_MAINTENANCE_SIGNAL_TYPES,
  CANONICAL_MAINTENANCE_PRIORITIES,
  CANONICAL_MAINTENANCE_ACTIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const MAINTENANCE_VALIDATION_CODES = {
  MAINT_UNKNOWN_SIGNAL_TYPE: 'MAINT_UNKNOWN_SIGNAL_TYPE',
  MAINT_UNKNOWN_PRIORITY: 'MAINT_UNKNOWN_PRIORITY',
  MAINT_UNKNOWN_ACTION: 'MAINT_UNKNOWN_ACTION',
  MAINT_DUPLICATE_SIGNAL: 'MAINT_DUPLICATE_SIGNAL',
  MAINT_MISSING_SOURCE: 'MAINT_MISSING_SOURCE',
  MAINT_MISSING_PROVENANCE: 'MAINT_MISSING_PROVENANCE',
  MAINT_MISSING_RATIONALE: 'MAINT_MISSING_RATIONALE',
  MAINT_MISSING_AFFECTED_REFERENCE: 'MAINT_MISSING_AFFECTED_REFERENCE',
  MAINT_INVALID_REPLACEMENT_REFERENCE: 'MAINT_INVALID_REPLACEMENT_REFERENCE',
  MAINT_EMPTY_REGISTRY: 'MAINT_EMPTY_REGISTRY',
  MAINT_AUTOMATIC_REVISION_FORBIDDEN: 'MAINT_AUTOMATIC_REVISION_FORBIDDEN',
  MAINT_LIVE_SEARCH_FORBIDDEN: 'MAINT_LIVE_SEARCH_FORBIDDEN',
  MAINT_INVALID_GOVERNANCE: 'MAINT_INVALID_GOVERNANCE',
  MAINT_INVALID_STATUS: 'MAINT_INVALID_STATUS',
} as const;

// ---------------------------------------------------------------------------
// Signal Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single maintenance signal.
 * Pure function. No side effects.
 */
export function validateMaintenanceSignal(
  signal: ResearchMaintenanceSignal,
): readonly ResearchMaintenanceValidationError[] {
  const errors: ResearchMaintenanceValidationError[] = [];

  if (!signal.signalId || signal.signalId.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE,
      message: 'Maintenance signal is missing a signal ID.',
      field: 'signalId',
      signalId: signal.signalId,
    });
  }

  if (!signal.signalType || signal.signalType.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_SIGNAL_TYPE,
      message: 'Maintenance signal is missing a signal type.',
      field: 'signalType',
      signalId: signal.signalId,
    });
  } else if (!CANONICAL_MAINTENANCE_SIGNAL_TYPES.includes(signal.signalType)) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_SIGNAL_TYPE,
      message: `Maintenance signal has unsupported signal type: "${signal.signalType}".`,
      field: 'signalType',
      signalId: signal.signalId,
    });
  }

  if (!signal.priority || signal.priority.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_PRIORITY,
      message: 'Maintenance signal is missing a priority.',
      field: 'priority',
      signalId: signal.signalId,
    });
  } else if (!CANONICAL_MAINTENANCE_PRIORITIES.includes(signal.priority)) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_PRIORITY,
      message: `Maintenance signal has unsupported priority: "${signal.priority}".`,
      field: 'priority',
      signalId: signal.signalId,
    });
  }

  if (!signal.recommendedAction || signal.recommendedAction.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_ACTION,
      message: 'Maintenance signal is missing a recommended action.',
      field: 'recommendedAction',
      signalId: signal.signalId,
    });
  } else if (!CANONICAL_MAINTENANCE_ACTIONS.includes(signal.recommendedAction)) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_UNKNOWN_ACTION,
      message: `Maintenance signal has unsupported action: "${signal.recommendedAction}".`,
      field: 'recommendedAction',
      signalId: signal.signalId,
    });
  }

  if (!signal.affectedReferenceIds || signal.affectedReferenceIds.length === 0) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_AFFECTED_REFERENCE,
      message: 'Maintenance signal has no affected reference IDs.',
      field: 'affectedReferenceIds',
      signalId: signal.signalId,
    });
  }

  if (!signal.source || signal.source.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE,
      message: 'Maintenance signal is missing a source.',
      field: 'source',
      signalId: signal.signalId,
    });
  }

  if (!signal.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(signal.governanceStatus)) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_INVALID_GOVERNANCE,
      message: `Maintenance signal has invalid governance status: "${signal.governanceStatus}".`,
      field: 'governanceStatus',
      signalId: signal.signalId,
    });
  }

  if (!signal.provenance || typeof signal.provenance !== 'object') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
      message: 'Maintenance signal is missing provenance.',
      field: 'provenance',
      signalId: signal.signalId,
    });
  } else {
    if (!signal.provenance.rationale || signal.provenance.rationale.trim() === '') {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
        message: 'Maintenance signal provenance is missing rationale.',
        field: 'provenance.rationale',
        signalId: signal.signalId,
      });
    }
    if (!signal.provenance.source || signal.provenance.source.trim() === '') {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE,
        message: 'Maintenance signal provenance is missing source.',
        field: 'provenance.source',
        signalId: signal.signalId,
      });
    }
  }

  if (!signal.rationale || signal.rationale.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_RATIONALE,
      message: 'Maintenance signal is missing a rationale.',
      field: 'rationale',
      signalId: signal.signalId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a maintenance registry for structural integrity.
 * Pure function. No side effects.
 */
export function validateMaintenanceRegistry(
  registry: ResearchMaintenanceRegistry,
): readonly ResearchMaintenanceValidationError[] {
  const errors: ResearchMaintenanceValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_EMPTY_REGISTRY,
      message: 'Maintenance registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.signals || registry.signals.length === 0) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_EMPTY_REGISTRY,
      message: 'Maintenance registry is empty.',
      field: 'signals',
    });
    return errors;
  }

  // Check for duplicate signal IDs
  const seenIds = new Set<string>();

  for (const signal of registry.signals) {
    // Individual signal validation
    errors.push(...validateMaintenanceSignal(signal));

    // Duplicate signal ID
    if (seenIds.has(signal.signalId)) {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_DUPLICATE_SIGNAL,
        message: `Duplicate maintenance signal ID: "${signal.signalId}".`,
        signalId: signal.signalId,
      });
    }
    seenIds.add(signal.signalId);
  }

  // Validate determinism flags
  if (registry.deterministic !== true) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }
  if (registry.randomUsed !== false) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }
  if (registry.timeDependency !== false) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
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
 * Validates a research artifact with maintenance.
 * Pure function. No side effects.
 */
export function validateResearchArtifactWithMaintenance(
  artifact: ResearchArtifactWithMaintenance,
): ResearchMaintenanceValidationResult {
  const errors: ResearchMaintenanceValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
      message: 'Research artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate maintenance registry
  errors.push(...validateMaintenanceRegistry(artifact.maintenanceRegistry));

  // Validate trace
  if (!artifact.maintenanceTrace || typeof artifact.maintenanceTrace !== 'object') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
      message: 'Research artifact is missing maintenance trace.',
      field: 'maintenanceTrace',
    });
  } else {
    if (artifact.maintenanceTrace.deterministic !== true) {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
        message: 'Maintenance trace must declare deterministic: true.',
        field: 'maintenanceTrace.deterministic',
      });
    }
    if (artifact.maintenanceTrace.randomUsed !== false) {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
        message: 'Maintenance trace must declare randomUsed: false.',
        field: 'maintenanceTrace.randomUsed',
      });
    }
    if (artifact.maintenanceTrace.timeDependency !== false) {
      errors.push({
        code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_PROVENANCE,
        message: 'Maintenance trace must declare timeDependency: false.',
        field: 'maintenanceTrace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'maintenance_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research maintenance input.
 * Pure function. No side effects.
 */
export function validateMaintenanceInput(
  input: ResearchMaintenanceInput,
): readonly ResearchMaintenanceValidationError[] {
  const errors: ResearchMaintenanceValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE,
      message: 'Maintenance input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_MISSING_SOURCE,
      message: 'Maintenance input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  if (!input.signals || input.signals.length === 0) {
    errors.push({
      code: MAINTENANCE_VALIDATION_CODES.MAINT_EMPTY_REGISTRY,
      message: 'Maintenance input has no signals.',
      field: 'signals',
    });
  } else {
    for (const signal of input.signals) {
      errors.push(...validateMaintenanceSignal(signal));
    }
  }

  return errors;
}
