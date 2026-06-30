/**
 * NV-1600-D4-OPT-01 — Laboratory Contract & Registry Kernel
 *
 * Deterministic orchestration functions for laboratory metadata.
 * Produces laboratory nodes, artifacts, traces, provenance, and registries.
 *
 * This module never:
 * - Executes code
 * - Executes Python
 * - Executes JavaScript
 * - Spawns processes
 * - Evaluates scripts
 * - Runs simulations
 * - Calls interpreters
 * - Calls compilers
 * - Opens browsers
 * - Accesses filesystem
 * - Performs network requests
 * - Calls LLMs
 * - Downloads resources
 * - Generates educational content
 *
 * Registry only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  Laboratory,
  LaboratoryMetadata,
  LaboratoryProvenance,
  LaboratoryDecision,
  LaboratoryTrace,
  LaboratoryNode,
  LaboratoryArtifact,
  LaboratoryRegistry,
  LaboratoryInput,
  LaboratoryType,
  LaboratoryLevel,
  LaboratoryStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_LABORATORY_TYPES,
  CANONICAL_LABORATORY_LEVELS,
  CANONICAL_LABORATORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Laboratory Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes laboratory provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeLaboratoryProvenance(params: {
  readonly laboratoryId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryProvenance {
  return {
    laboratoryId: params.laboratoryId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory decision from validation results.
 * Pure function. No side effects.
 */
function _composeDecision(
  laboratoryId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryDecision {
  return {
    decisionId: `_decision_${laboratoryId}`,
    laboratoryId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeLaboratoryTrace(params: {
  readonly traceId: string;
  readonly laboratoryCount: number;
  readonly decisions: readonly LaboratoryDecision[];
}): LaboratoryTrace {
  return {
    traceId: params.traceId,
    laboratoryCount: params.laboratoryCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Node Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory node from metadata and provenance.
 * Pure function. No side effects.
 */
export function composeLaboratoryNode(params: {
  readonly laboratoryId: string;
  readonly metadata: LaboratoryMetadata;
  readonly provenance: LaboratoryProvenance;
}): LaboratoryNode {
  return {
    nodeId: `_node_${params.laboratoryId}`,
    laboratoryId: params.laboratoryId,
    metadata: params.metadata,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Artifact Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory artifact from a node and trace.
 * Pure function. No side effects.
 */
export function composeLaboratoryArtifact(params: {
  readonly artifactId: string;
  readonly laboratoryNode: LaboratoryNode;
  readonly trace: LaboratoryTrace;
}): LaboratoryArtifact {
  return {
    artifactId: params.artifactId,
    laboratoryNode: params.laboratoryNode,
    trace: params.trace,
  };
}

export function composeLaboratoryArtifactFromComponents(
  artifactId: string,
  laboratory: Laboratory | LaboratoryArtifact,
  trace: LaboratoryTrace,
  provenance: LaboratoryProvenance,
): LaboratoryArtifact {
  const metadata = 'metadata' in laboratory
    ? laboratory.metadata
    : (laboratory as LaboratoryArtifact).laboratoryNode.metadata;
  const _id = metadata.laboratoryId;
  const laboratoryNode: LaboratoryNode = {
    nodeId: `_node_${metadata.laboratoryId}`,
    laboratoryId: metadata.laboratoryId,
    metadata,
    provenance,
  };
  const enrichedTrace: LaboratoryTrace = {
    ...trace,
    laboratory: 'metadata' in laboratory ? laboratory : { metadata, provenance },
  };
  return {
    artifactId,
    laboratoryNode,
    trace: enrichedTrace,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for laboratory metadata.
 * Sorts by laboratoryId, then laboratoryType, then title.
 * Pure function. No side effects.
 */
function _compareLaboratoryMetadata(
  a: LaboratoryMetadata,
  b: LaboratoryMetadata,
): number {
  if (a.laboratoryId < b.laboratoryId) return -1;
  if (a.laboratoryId > b.laboratoryId) return 1;

  if (a.laboratoryType < b.laboratoryType) return -1;
  if (a.laboratoryType > b.laboratoryType) return 1;

  if (a.title < b.title) return -1;
  if (a.title > b.title) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Laboratory Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory registry from laboratory metadata.
 * Pure function. No side effects.
 * Deterministic ordering: laboratoryId → laboratoryType → title.
 */
export function composeLaboratoryRegistry(
  laboratories: readonly LaboratoryMetadata[],
): LaboratoryRegistry {
  const sorted = [...laboratories].sort(_compareLaboratoryMetadata);

  return {
    registryId: `_registry_${sorted.length}`,
    laboratories: sorted,
    nodeCount: sorted.length,
    deterministic: true,
    generatedFrom: 'deterministic_laboratory_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratory(
  input: LaboratoryInput,
): LaboratoryArtifact {
  const decisions = input.laboratories.map((lab) => {
    const errors = _validateLaboratoryForDecision(lab);
    return _composeDecision(lab.laboratoryId, errors.length === 0, errors);
  });

  const trace = composeLaboratoryTrace({
    traceId: `_trace_labs_${input.laboratories.length}`,
    laboratoryCount: input.laboratories.length,
    decisions,
  });

  const firstLab = input.laboratories[0];
  const provenance = composeLaboratoryProvenance({
    laboratoryId: firstLab.laboratoryId,
    source: firstLab.author,
    governanceStatus: firstLab.governanceStatus,
    rationale: `Registry of ${input.laboratories.length} laboratories`,
    providedBy: firstLab.author,
  });

  const node = composeLaboratoryNode({
    laboratoryId: firstLab.laboratoryId,
    metadata: firstLab,
    provenance,
  });

  return composeLaboratoryArtifact({
    artifactId: `_artifact_lab_${firstLab.laboratoryId}`,
    laboratoryNode: node,
    trace,
  });
}

/**
 * Composes a laboratory registry from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryRegistryFromInput(
  input: LaboratoryInput,
): LaboratoryRegistry {
  return composeLaboratoryRegistry(input.laboratories);
}

/**
 * Composes decisions for all laboratories in an input.
 * Pure function. No side effects.
 */
function _validateLaboratoryForDecision(
  lab: LaboratoryMetadata,
): readonly string[] {
  const errors: string[] = [];

  if (!lab.laboratoryId || lab.laboratoryId.trim() === '') {
    errors.push('LAB_MISSING_LABORATORY_ID');
  }

  if (!lab.title || lab.title.trim() === '') {
    errors.push('LAB_MISSING_TITLE');
  }

  if (!CANONICAL_LABORATORY_TYPES.includes(lab.laboratoryType)) {
    errors.push('LAB_UNKNOWN_TYPE');
  }

  if (!CANONICAL_LABORATORY_LEVELS.includes(lab.laboratoryLevel)) {
    errors.push('LAB_UNKNOWN_LEVEL');
  }

  if (!CANONICAL_LABORATORY_STATUS.includes(lab.status)) {
    errors.push('LAB_UNKNOWN_STATUS');
  }

  if (!lab.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(lab.governanceStatus)) {
    errors.push('LAB_INVALID_GOVERNANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported laboratory type.
 */
export function isSupportedLaboratoryType(
  laboratoryType: string,
): laboratoryType is LaboratoryType {
  return CANONICAL_LABORATORY_TYPES.includes(laboratoryType as LaboratoryType);
}

/**
 * Checks if a string is a supported laboratory level.
 */
export function isSupportedLaboratoryLevel(
  laboratoryLevel: string,
): laboratoryLevel is LaboratoryLevel {
  return CANONICAL_LABORATORY_LEVELS.includes(laboratoryLevel as LaboratoryLevel);
}

/**
 * Checks if a string is a supported laboratory status.
 */
export function isSupportedLaboratoryStatus(
  status: string,
): status is LaboratoryStatus {
  return CANONICAL_LABORATORY_STATUS.includes(status as LaboratoryStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedGovernanceStatus(
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
 * Returns the canonical laboratory types.
 */
export function getCanonicalLaboratoryTypes(): readonly LaboratoryType[] {
  return CANONICAL_LABORATORY_TYPES;
}

/**
 * Returns the canonical laboratory levels.
 */
export function getCanonicalLaboratoryLevels(): readonly LaboratoryLevel[] {
  return CANONICAL_LABORATORY_LEVELS;
}

/**
 * Returns the canonical laboratory statuses.
 */
export function getCanonicalLaboratoryStatuses(): readonly LaboratoryStatus[] {
  return CANONICAL_LABORATORY_STATUS;
}

/**
 * Returns the canonical governance statuses.
 */
export function getCanonicalGovernanceStatuses(): readonly LaboratoryGovernanceStatus[] {
  return CANONICAL_GOVERNANCE_STATUSES;
}
