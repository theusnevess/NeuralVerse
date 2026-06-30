/**
 * NV-1600-D4-OPT-09 — History Validation Layer
 *
 * Deterministic validation for history metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryHistoryRecord,
  LaboratoryEvidenceRecord,
  LaboratoryEvidenceRelationship,
  LaboratoryHistoryRegistry,
  LaboratoryArtifactWithHistory,
  LaboratoryHistoryInput,
  LaboratoryHistoryValidationError,
  LaboratoryHistoryValidationResult,
  LaboratoryHistoryRegistryValidationResult,
  LaboratoryHistoryArtifactValidationResult,
  LaboratoryHistoryInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_HISTORY_TYPES,
  CANONICAL_EVIDENCE_TYPES,
  CANONICAL_EVIDENCE_RELATIONSHIP_TYPES,
  CANONICAL_HISTORY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const HISTORY_VALIDATION_CODES = {
  HISTORY_UNKNOWN_TYPE: 'HISTORY_UNKNOWN_TYPE',
  HISTORY_UNKNOWN_STATUS: 'HISTORY_UNKNOWN_STATUS',
  EVIDENCE_UNKNOWN_TYPE: 'EVIDENCE_UNKNOWN_TYPE',
  RELATIONSHIP_UNKNOWN_TYPE: 'RELATIONSHIP_UNKNOWN_TYPE',
  HISTORY_DUPLICATE_ID: 'HISTORY_DUPLICATE_ID',
  HISTORY_DUPLICATE_TITLE: 'HISTORY_DUPLICATE_TITLE',
  EVIDENCE_DUPLICATE_ID: 'EVIDENCE_DUPLICATE_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
  HISTORY_MISSING_HISTORY_ID: 'HISTORY_MISSING_HISTORY_ID',
  HISTORY_MISSING_TITLE: 'HISTORY_MISSING_TITLE',
  HISTORY_INVALID_GOVERNANCE: 'HISTORY_INVALID_GOVERNANCE',
  HISTORY_MISSING_PROVENANCE: 'HISTORY_MISSING_PROVENANCE',
  HISTORY_INVALID_REFERENCE: 'HISTORY_INVALID_REFERENCE',
  EVIDENCE_MISSING_ID: 'EVIDENCE_MISSING_ID',
  EVIDENCE_MISSING_TITLE: 'EVIDENCE_MISSING_TITLE',
  EVIDENCE_INVALID_GOVERNANCE: 'EVIDENCE_INVALID_GOVERNANCE',
  EVIDENCE_INVALID_REFERENCE: 'EVIDENCE_INVALID_REFERENCE',
  RELATIONSHIP_MISSING_ID: 'RELATIONSHIP_MISSING_ID',
  RELATIONSHIP_MISSING_SOURCE: 'RELATIONSHIP_MISSING_SOURCE',
  RELATIONSHIP_MISSING_TARGET: 'RELATIONSHIP_MISSING_TARGET',
  RELATIONSHIP_INVALID_GOVERNANCE: 'RELATIONSHIP_INVALID_GOVERNANCE',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
} as const;

// ---------------------------------------------------------------------------
// Single History Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single history record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHistoryRecord(
  hist: LaboratoryHistoryRecord,
): readonly LaboratoryHistoryValidationError[] {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!hist.historyId || hist.historyId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_MISSING_HISTORY_ID,
      message: 'History record is missing a history ID.',
      field: 'historyId',
      historyId: hist.historyId,
    });
  }

  if (!hist.title || hist.title.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_MISSING_TITLE,
      message: 'History record is missing a title.',
      field: 'title',
      historyId: hist.historyId,
    });
  }

  if (!CANONICAL_HISTORY_TYPES.includes(hist.historyType)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_UNKNOWN_TYPE,
      message: `History record has unsupported type: "${hist.historyType}".`,
      field: 'historyType',
      historyId: hist.historyId,
    });
  }

  if (!CANONICAL_HISTORY_STATUS.includes(hist.status)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_UNKNOWN_STATUS,
      message: `History record has unsupported status: "${hist.status}".`,
      field: 'status',
      historyId: hist.historyId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(hist.governanceStatus)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_INVALID_GOVERNANCE,
      message: `History record has invalid governance status: "${hist.governanceStatus}".`,
      field: 'governanceStatus',
      historyId: hist.historyId,
    });
  }

  if (!hist.provenance) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_MISSING_PROVENANCE,
      message: 'History record is missing provenance.',
      field: 'provenance',
      historyId: hist.historyId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Evidence Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single evidence record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceRecord(
  evidence: LaboratoryEvidenceRecord,
): readonly LaboratoryHistoryValidationError[] {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!evidence.evidenceId || evidence.evidenceId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_ID,
      message: 'Evidence record is missing an evidence ID.',
      field: 'evidenceId',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!evidence.title || evidence.title.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_TITLE,
      message: 'Evidence record is missing a title.',
      field: 'title',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!CANONICAL_EVIDENCE_TYPES.includes(evidence.evidenceType)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EVIDENCE_UNKNOWN_TYPE,
      message: `Evidence record has unsupported type: "${evidence.evidenceType}".`,
      field: 'evidenceType',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(evidence.governanceStatus)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EVIDENCE_INVALID_GOVERNANCE,
      message: `Evidence record has invalid governance status: "${evidence.governanceStatus}".`,
      field: 'governanceStatus',
      evidenceId: evidence.evidenceId,
    });
  }

  if (!evidence.provenance) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Evidence record is missing provenance.',
      field: 'provenance',
      evidenceId: evidence.evidenceId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evidence Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates an evidence relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvidenceRelationship(
  rel: LaboratoryEvidenceRelationship,
): readonly LaboratoryHistoryValidationError[] {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!rel.relationshipId || rel.relationshipId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
      message: 'Evidence relationship is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.sourceEvidenceId || rel.sourceEvidenceId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_SOURCE,
      message: 'Evidence relationship is missing a source evidence ID.',
      field: 'sourceEvidenceId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.targetEvidenceId || rel.targetEvidenceId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_TARGET,
      message: 'Evidence relationship is missing a target evidence ID.',
      field: 'targetEvidenceId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!CANONICAL_EVIDENCE_RELATIONSHIP_TYPES.includes(rel.relationshipType)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_UNKNOWN_TYPE,
      message: `Evidence relationship has unsupported type: "${rel.relationshipType}".`,
      field: 'relationshipType',
      relationshipId: rel.relationshipId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(rel.governanceStatus)) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_INVALID_GOVERNANCE,
      message: `Evidence relationship has invalid governance status: "${rel.governanceStatus}".`,
      field: 'governanceStatus',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.provenance) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Evidence relationship is missing provenance.',
      field: 'provenance',
      relationshipId: rel.relationshipId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// History Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a history registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHistoryRegistry(
  registry: LaboratoryHistoryRegistry,
): LaboratoryHistoryRegistryValidationResult {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.histories || registry.histories.length === 0) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry has no history records.',
      field: 'histories',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate history IDs
  const seenHistoryIds = new Set<string>();
  for (const hist of registry.histories) {
    if (seenHistoryIds.has(hist.historyId)) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.HISTORY_DUPLICATE_ID,
        message: `Duplicate history ID: "${hist.historyId}".`,
        historyId: hist.historyId,
      });
    }
    seenHistoryIds.add(hist.historyId);
  }

  // Check for duplicate history titles
  const seenHistoryTitles = new Set<string>();
  for (const hist of registry.histories) {
    if (seenHistoryTitles.has(hist.title)) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.HISTORY_DUPLICATE_TITLE,
        message: `Duplicate history title: "${hist.title}".`,
        field: 'title',
        historyId: hist.historyId,
      });
    }
    seenHistoryTitles.add(hist.title);
  }

  // Check for duplicate evidence IDs
  const seenEvidenceIds = new Set<string>();
  for (const evidence of registry.evidence) {
    if (seenEvidenceIds.has(evidence.evidenceId)) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.EVIDENCE_DUPLICATE_ID,
        message: `Duplicate evidence ID: "${evidence.evidenceId}".`,
        evidenceId: evidence.evidenceId,
      });
    }
    seenEvidenceIds.add(evidence.evidenceId);
  }

  // Check for duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const rel of registry.relationships) {
    if (seenRelationshipIds.has(rel.relationshipId)) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${rel.relationshipId}".`,
        relationshipId: rel.relationshipId,
      });
    }
    seenRelationshipIds.add(rel.relationshipId);
  }

  // Validate each history record
  for (const hist of registry.histories) {
    errors.push(...validateHistoryRecord(hist));
  }

  // Validate each evidence record
  for (const evidence of registry.evidence) {
    errors.push(...validateEvidenceRecord(evidence));
  }

  // Validate each relationship
  for (const rel of registry.relationships) {
    errors.push(...validateEvidenceRelationship(rel));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'history_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with history against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithHistory(
  artifact: LaboratoryArtifactWithHistory,
): LaboratoryHistoryArtifactValidationResult {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: HISTORY_VALIDATION_CODES.HISTORY_INVALID_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateHistoryRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: HISTORY_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'history_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates history input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateHistoryInput(
  input: LaboratoryHistoryInput,
): LaboratoryHistoryInputValidationResult {
  const errors: LaboratoryHistoryValidationError[] = [];

  if (!input.histories || input.histories.length === 0) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Input has no history records.',
      field: 'histories',
    });
  } else {
    for (const hist of input.histories) {
      errors.push(...validateHistoryRecord(hist));
    }
  }

  if (!input.evidence || input.evidence.length === 0) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.EVIDENCE_MISSING_ID,
      message: 'Input has no evidence records.',
      field: 'evidence',
    });
  } else {
    for (const evidence of input.evidence) {
      errors.push(...validateEvidenceRecord(evidence));
    }
  }

  if (!input.relationships || input.relationships.length === 0) {
    errors.push({
      code: HISTORY_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
      message: 'Input has no relationships.',
      field: 'relationships',
    });
  } else {
    for (const rel of input.relationships) {
      errors.push(...validateEvidenceRelationship(rel));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'history_input_composition',
  };
}
