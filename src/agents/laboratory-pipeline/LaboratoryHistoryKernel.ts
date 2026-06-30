/**
 * NV-1600-D4-OPT-09 — Laboratory History & Local Evidence Modeling Kernel
 *
 * Deterministic orchestration functions for history metadata.
 * Produces history records, evidence records, evidence relationships, artifacts, traces, and registries.
 *
 * This module never:
 * - Stores runtime values
 * - Stores learner answers
 * - Stores timestamps
 * - Stores execution history
 * - Stores interaction history
 * - Stores learner analytics
 * - Stores metrics collected during execution
 * - Stores logs
 * - Stores files
 * - Stores images
 * - Stores predictions
 * - Stores confidence
 * - Performs execution
 * - Performs persistence
 * - Performs synchronization
 * - Performs network access
 * - Calls LLMs
 * - Generates evidence
 * - Infers relationships
 * - Rewrites evidence
 *
 * History metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryHistoryRecord,
  LaboratoryEvidenceRecord,
  LaboratoryEvidenceRelationship,
  LaboratoryHistoryRegistry,
  LaboratoryHistoryDecision,
  LaboratoryHistoryTrace,
  LaboratoryHistoryInput,
  LaboratoryArtifactWithHistory,
  LaboratoryHistoryProvenance,
  LaboratoryEvidenceProvenance,
  LaboratoryEvidenceRelationshipProvenance,
  LaboratoryHistoryType,
  LaboratoryEvidenceType,
  LaboratoryEvidenceRelationshipType,
  LaboratoryHistoryStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HISTORY_TYPES,
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_RELATIONSHIP_TYPES,
  CANONICAL_HISTORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// History Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes history provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeHistoryProvenance(params: {
  readonly historyId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryHistoryProvenance {
  return {
    historyId: params.historyId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Evidence Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes evidence provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceProvenance(params: {
  readonly evidenceId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryEvidenceProvenance {
  return {
    evidenceId: params.evidenceId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Evidence Relationship Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes evidence relationship provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceRelationshipProvenance(params: {
  readonly relationshipId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): LaboratoryEvidenceRelationshipProvenance {
  return {
    relationshipId: params.relationshipId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// History Record Composition
// ---------------------------------------------------------------------------

/**
 * Composes a history record from provided parameters.
 * Pure function. No side effects.
 */
export function composeHistoryRecord(params: {
  readonly historyId: string;
  readonly historyType: LaboratoryHistoryType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly configurationId: string;
  readonly evidenceIds: readonly string[];
  readonly status: LaboratoryHistoryStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryHistoryProvenance;
}): LaboratoryHistoryRecord {
  return {
    historyId: params.historyId,
    historyType: params.historyType,
    title: params.title,
    description: params.description,
    experimentId: params.experimentId,
    workflowId: params.workflowId,
    configurationId: params.configurationId,
    evidenceIds: [...params.evidenceIds],
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Evidence Record Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence record from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceRecord(params: {
  readonly evidenceId: string;
  readonly evidenceType: LaboratoryEvidenceType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly workflowId: string;
  readonly configurationId: string;
  readonly visualizationId: string;
  readonly metricId: string;
  readonly observationId: string;
  readonly hypothesisId: string;
  readonly artifactId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryEvidenceProvenance;
}): LaboratoryEvidenceRecord {
  return {
    evidenceId: params.evidenceId,
    evidenceType: params.evidenceType,
    title: params.title,
    description: params.description,
    experimentId: params.experimentId,
    workflowId: params.workflowId,
    configurationId: params.configurationId,
    visualizationId: params.visualizationId,
    metricId: params.metricId,
    observationId: params.observationId,
    hypothesisId: params.hypothesisId,
    artifactId: params.artifactId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Evidence Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an evidence relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvidenceRelationship(params: {
  readonly relationshipId: string;
  readonly sourceEvidenceId: string;
  readonly targetEvidenceId: string;
  readonly relationshipType: LaboratoryEvidenceRelationshipType;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryEvidenceRelationshipProvenance;
}): LaboratoryEvidenceRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceEvidenceId: params.sourceEvidenceId,
    targetEvidenceId: params.targetEvidenceId,
    relationshipType: params.relationshipType,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// History Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a history decision from validation results.
 * Pure function. No side effects.
 */
function _composeHistoryDecision(
  historyId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): LaboratoryHistoryDecision {
  return {
    decisionId: `_decision_history_${historyId}`,
    historyId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// History Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a history trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeHistoryTrace(params: {
  readonly traceId: string;
  readonly historyCount: number;
  readonly evidenceCount: number;
  readonly relationshipCount: number;
  readonly decisions: readonly LaboratoryHistoryDecision[];
}): LaboratoryHistoryTrace {
  return {
    traceId: params.traceId,
    historyCount: params.historyCount,
    evidenceCount: params.evidenceCount,
    relationshipCount: params.relationshipCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_history_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for history records.
 * Sorts by historyId, then historyType, then evidenceId, then relationshipId.
 * Pure function. No side effects.
 */
function _compareHistoryRecord(
  a: LaboratoryHistoryRecord,
  b: LaboratoryHistoryRecord,
): number {
  if (a.historyId < b.historyId) return -1;
  if (a.historyId > b.historyId) return 1;

  if (a.historyType < b.historyType) return -1;
  if (a.historyType > b.historyType) return 1;

  const aEvidenceId = a.evidenceIds[0] ?? '';
  const bEvidenceId = b.evidenceIds[0] ?? '';
  if (aEvidenceId < bEvidenceId) return -1;
  if (aEvidenceId > bEvidenceId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// History Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a history registry from all history components.
 * Pure function. No side effects.
 * Deterministic ordering: historyId → historyType → evidenceId → relationshipId.
 */
export function composeHistoryRegistry(
  histories: readonly LaboratoryHistoryRecord[],
  evidence: readonly LaboratoryEvidenceRecord[],
  relationships: readonly LaboratoryEvidenceRelationship[],
): LaboratoryHistoryRegistry {
  const sortedHistories = [...histories].sort(_compareHistoryRecord);

  return {
    registryId: `_history_registry_${sortedHistories.length}`,
    histories: sortedHistories,
    evidence: [...evidence],
    relationships: [...relationships],
    historyCount: sortedHistories.length,
    evidenceCount: evidence.length,
    relationshipCount: relationships.length,
    deterministic: true,
    generatedFrom: 'deterministic_history_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory History Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory history artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryHistory(
  input: LaboratoryHistoryInput,
): LaboratoryArtifactWithHistory {
  const decisions = input.histories.map((hist) => {
    const errors = _validateHistoryForDecision(hist);
    return _composeHistoryDecision(hist.historyId, errors.length === 0, errors);
  });

  const trace = composeHistoryTrace({
    traceId: `_trace_history_${input.histories.length}`,
    historyCount: input.histories.length,
    evidenceCount: input.evidence.length,
    relationshipCount: input.relationships.length,
    decisions,
  });

  const registry = composeHistoryRegistry(
    input.histories,
    input.evidence,
    input.relationships,
  );

  return {
    artifactId: `_artifact_history_${input.histories.length}`,
    registry,
    trace,
  };
}

/**
 * Validates a history record for decision composition.
 * Pure function. No side effects.
 */
function _validateHistoryForDecision(
  hist: LaboratoryHistoryRecord,
): readonly string[] {
  const errors: string[] = [];

  if (!hist.historyId || hist.historyId.trim() === '') {
    errors.push('HISTORY_MISSING_HISTORY_ID');
  }

  if (!hist.title || hist.title.trim() === '') {
    errors.push('HISTORY_MISSING_TITLE');
  }

  if (!CANONICAL_HISTORY_TYPES.includes(hist.historyType)) {
    errors.push('HISTORY_UNKNOWN_TYPE');
  }

  if (!CANONICAL_HISTORY_STATUS.includes(hist.status)) {
    errors.push('HISTORY_UNKNOWN_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(hist.governanceStatus)) {
    errors.push('HISTORY_INVALID_GOVERNANCE');
  }

  if (!hist.provenance) {
    errors.push('HISTORY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported history type.
 */
export function isSupportedHistoryType(
  historyType: string,
): historyType is LaboratoryHistoryType {
  return CANONICAL_HISTORY_TYPES.includes(historyType as LaboratoryHistoryType);
}

/**
 * Checks if a string is a supported evidence type.
 */
export function isSupportedEvidenceType(
  evidenceType: string,
): evidenceType is LaboratoryEvidenceType {
  return CANONICAL_EVIDENCE_TYPES.includes(evidenceType as LaboratoryEvidenceType);
}

/**
 * Checks if a string is a supported evidence relationship type.
 */
export function isSupportedEvidenceRelationshipType(
  relationshipType: string,
): relationshipType is LaboratoryEvidenceRelationshipType {
  return CANONICAL_EVIDENCE_RELATIONSHIP_TYPES.includes(relationshipType as LaboratoryEvidenceRelationshipType);
}

/**
 * Checks if a string is a supported history status.
 */
export function isSupportedHistoryStatus(
  status: string,
): status is LaboratoryHistoryStatus {
  return CANONICAL_HISTORY_STATUS.includes(status as LaboratoryHistoryStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedHistoryGovernanceStatus(
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
 * Returns the canonical history types.
 */
export function getCanonicalHistoryTypes(): readonly LaboratoryHistoryType[] {
  return CANONICAL_HISTORY_TYPES;
}

/**
 * Returns the canonical evidence types.
 */
export function getCanonicalEvidenceTypes(): readonly LaboratoryEvidenceType[] {
  return CANONICAL_EVIDENCE_TYPES;
}

/**
 * Returns the canonical evidence relationship types.
 */
export function getCanonicalEvidenceRelationshipTypes(): readonly LaboratoryEvidenceRelationshipType[] {
  return CANONICAL_EVIDENCE_RELATIONSHIP_TYPES;
}

/**
 * Returns the canonical history statuses.
 */
export function getCanonicalHistoryStatuses(): readonly LaboratoryHistoryStatus[] {
  return CANONICAL_HISTORY_STATUS;
}
