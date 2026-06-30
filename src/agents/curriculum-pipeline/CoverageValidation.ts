/**
 * NV-1500-D3-OPT-06 — Curriculum Coverage & Gap Analysis Validation Layer
 *
 * Deterministic validation for curriculum coverage and gap analysis structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumCoverageRecord,
  CurriculumGapRecord,
  CurriculumCoverageRegistry,
  CurriculumArtifactWithCoverage,
  CurriculumCoverageInput,
  CurriculumCoverageValidationError,
  CurriculumCoverageValidationResult,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const COVERAGE_VALIDATION_CODES = {
  COVERAGE_UNKNOWN_STATUS: 'COVERAGE_UNKNOWN_STATUS',
  COVERAGE_UNKNOWN_DIMENSION: 'COVERAGE_UNKNOWN_DIMENSION',
  GAP_UNKNOWN_TYPE: 'GAP_UNKNOWN_TYPE',
  COVERAGE_DUPLICATE_RECORD: 'COVERAGE_DUPLICATE_RECORD',
  GAP_DUPLICATE_RECORD: 'GAP_DUPLICATE_RECORD',
  COVERAGE_INVALID_REFERENCE: 'COVERAGE_INVALID_REFERENCE',
  COVERAGE_EMPTY_REGISTRY: 'COVERAGE_EMPTY_REGISTRY',
  GAP_EMPTY_REGISTRY: 'GAP_EMPTY_REGISTRY',
  COVERAGE_MISSING_SOURCE: 'COVERAGE_MISSING_SOURCE',
  COVERAGE_MISSING_PROVENANCE: 'COVERAGE_MISSING_PROVENANCE',
  COVERAGE_INVALID_STATUS: 'COVERAGE_INVALID_STATUS',
  COVERAGE_MISSING_ID: 'COVERAGE_MISSING_ID',
  COVERAGE_MISSING_ENTITY_ID: 'COVERAGE_MISSING_ENTITY_ID',
  COVERAGE_INVALID_SCORE: 'COVERAGE_INVALID_SCORE',
  COVERAGE_MISSING_RATIONALE: 'COVERAGE_MISSING_RATIONALE',
  COVERAGE_MISSING_PROVIDED_BY: 'COVERAGE_MISSING_PROVIDED_BY',
  COVERAGE_MISSING_REGISTRY_ID: 'COVERAGE_MISSING_REGISTRY_ID',
  COVERAGE_MISSING_GRAPH_ID: 'COVERAGE_MISSING_GRAPH_ID',
  COVERAGE_TRACE_NOT_DETERMINISTIC: 'COVERAGE_TRACE_NOT_DETERMINISTIC',
  COVERAGE_TRACE_RANDOM_USED: 'COVERAGE_TRACE_RANDOM_USED',
  COVERAGE_TRACE_TIME_DEPENDENCY: 'COVERAGE_TRACE_TIME_DEPENDENCY',
  COVERAGE_TRACE_CURRICULUM_MUTATED: 'COVERAGE_TRACE_CURRICULUM_MUTATED',
  GAP_MISSING_ID: 'GAP_MISSING_ID',
  GAP_MISSING_ENTITY_ID: 'GAP_MISSING_ENTITY_ID',
  GAP_MISSING_DESCRIPTION: 'GAP_MISSING_DESCRIPTION',
  GAP_MISSING_SOURCE: 'GAP_MISSING_SOURCE',
  GAP_MISSING_RATIONALE: 'GAP_MISSING_RATIONALE',
  GAP_MISSING_PROVIDED_BY: 'GAP_MISSING_PROVIDED_BY',
  GAP_INVALID_SEVERITY: 'GAP_INVALID_SEVERITY',
} as const;

// ---------------------------------------------------------------------------
// Coverage Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum coverage record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCoverageRecord(
  record: CurriculumCoverageRecord,
  graphNodeIds: readonly string[],
): readonly CurriculumCoverageValidationError[] {
  const errors: CurriculumCoverageValidationError[] = [];

  if (!record.coverageId || record.coverageId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ID,
      message: 'Curriculum coverage record is missing a coverage ID.',
      field: 'coverageId',
      coverageId: record.coverageId,
    });
  }

  if (!record.entityId || record.entityId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ENTITY_ID,
      message: 'Curriculum coverage record is missing an entity ID.',
      field: 'entityId',
      coverageId: record.coverageId,
    });
  }

  // Entity existence check
  if (record.entityId && !graphNodeIds.includes(record.entityId)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_REFERENCE,
      message: `Curriculum coverage record references non-existent curriculum node: "${record.entityId}".`,
      field: 'entityId',
      coverageId: record.coverageId,
      entityId: record.entityId,
    });
  }

  if (!CANONICAL_COVERAGE_DIMENSIONS.includes(record.dimension)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_UNKNOWN_DIMENSION,
      message: `Curriculum coverage record has unsupported dimension: "${record.dimension}".`,
      field: 'dimension',
      coverageId: record.coverageId,
    });
  }

  if (!CANONICAL_COVERAGE_STATUS.includes(record.coverageStatus)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_UNKNOWN_STATUS,
      message: `Curriculum coverage record has unsupported coverage status: "${record.coverageStatus}".`,
      field: 'coverageStatus',
      coverageId: record.coverageId,
    });
  }

  if (typeof record.coverageScore !== 'number' || record.coverageScore < 0 || record.coverageScore > 1) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_SCORE,
      message: `Curriculum coverage record has invalid coverage score: "${record.coverageScore}". Must be between 0 and 1.`,
      field: 'coverageScore',
      coverageId: record.coverageId,
    });
  }

  if (!record.source || record.source.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
      message: 'Curriculum coverage record is missing a source.',
      field: 'source',
      coverageId: record.coverageId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(record.governanceStatus)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_STATUS,
      message: `Curriculum coverage record has invalid governance status: "${record.governanceStatus}".`,
      field: 'governanceStatus',
      coverageId: record.coverageId,
    });
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
      message: 'Curriculum coverage record is missing a rationale.',
      field: 'rationale',
      coverageId: record.coverageId,
    });
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
      message: 'Curriculum coverage record is missing a providedBy.',
      field: 'providedBy',
      coverageId: record.coverageId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Gap Record Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum gap record against canonical invariants.
 * Pure function. No side effects.
 */
export function validateGapRecord(
  record: CurriculumGapRecord,
  graphNodeIds: readonly string[],
): readonly CurriculumCoverageValidationError[] {
  const errors: CurriculumCoverageValidationError[] = [];

  if (!record.gapId || record.gapId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_ID,
      message: 'Curriculum gap record is missing a gap ID.',
      field: 'gapId',
      gapId: record.gapId,
    });
  }

  if (!record.entityId || record.entityId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_ENTITY_ID,
      message: 'Curriculum gap record is missing an entity ID.',
      field: 'entityId',
      gapId: record.gapId,
    });
  }

  // Entity existence check
  if (record.entityId && !graphNodeIds.includes(record.entityId)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_REFERENCE,
      message: `Curriculum gap record references non-existent curriculum node: "${record.entityId}".`,
      field: 'entityId',
      gapId: record.gapId,
      entityId: record.entityId,
    });
  }

  if (!CANONICAL_GAP_TYPES.includes(record.gapType)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_UNKNOWN_TYPE,
      message: `Curriculum gap record has unsupported gap type: "${record.gapType}".`,
      field: 'gapType',
      gapId: record.gapId,
    });
  }

  if (!CANONICAL_COVERAGE_DIMENSIONS.includes(record.dimension)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_UNKNOWN_DIMENSION,
      message: `Curriculum gap record has unsupported dimension: "${record.dimension}".`,
      field: 'dimension',
      gapId: record.gapId,
    });
  }

  const validSeverities = ['critical', 'high', 'medium', 'low', 'informational'];
  if (!validSeverities.includes(record.severity)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_INVALID_SEVERITY,
      message: `Curriculum gap record has invalid severity: "${record.severity}".`,
      field: 'severity',
      gapId: record.gapId,
    });
  }

  if (!record.description || record.description.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_DESCRIPTION,
      message: 'Curriculum gap record is missing a description.',
      field: 'description',
      gapId: record.gapId,
    });
  }

  if (!record.source || record.source.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_SOURCE,
      message: 'Curriculum gap record is missing a source.',
      field: 'source',
      gapId: record.gapId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(record.governanceStatus)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_STATUS,
      message: `Curriculum gap record has invalid governance status: "${record.governanceStatus}".`,
      field: 'governanceStatus',
      gapId: record.gapId,
    });
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_RATIONALE,
      message: 'Curriculum gap record is missing a rationale.',
      field: 'rationale',
      gapId: record.gapId,
    });
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.GAP_MISSING_PROVIDED_BY,
      message: 'Curriculum gap record is missing a providedBy.',
      field: 'providedBy',
      gapId: record.gapId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Coverage Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum coverage registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCoverageRegistry(
  registry: CurriculumCoverageRegistry,
  graphNodeIds: readonly string[],
): CurriculumCoverageValidationResult {
  const errors: CurriculumCoverageValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_REGISTRY_ID,
      message: 'Curriculum coverage registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.graphId || registry.graphId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_GRAPH_ID,
      message: 'Curriculum coverage registry is missing a graph ID.',
      field: 'graphId',
    });
  }

  // Empty registry check
  if (registry.coverageRecords.length === 0 && registry.gapRecords.length === 0) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
      message: 'Curriculum coverage registry has no coverage records or gap records.',
      field: 'coverageRecords',
    });
  }

  // Duplicate coverage record ID check
  const seenCoverageIds = new Set<string>();
  for (const record of registry.coverageRecords) {
    if (seenCoverageIds.has(record.coverageId)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_RECORD,
        message: `Duplicate coverage record ID: "${record.coverageId}".`,
        coverageId: record.coverageId,
      });
    }
    seenCoverageIds.add(record.coverageId);
  }

  // Duplicate gap record ID check
  const seenGapIds = new Set<string>();
  for (const record of registry.gapRecords) {
    if (seenGapIds.has(record.gapId)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.GAP_DUPLICATE_RECORD,
        message: `Duplicate gap record ID: "${record.gapId}".`,
        gapId: record.gapId,
      });
    }
    seenGapIds.add(record.gapId);
  }

  // Validate each coverage record
  for (const record of registry.coverageRecords) {
    errors.push(...validateCoverageRecord(record, graphNodeIds));
  }

  // Validate each gap record
  for (const record of registry.gapRecords) {
    errors.push(...validateGapRecord(record, graphNodeIds));
  }

  // Deterministic metadata check
  if (registry.deterministic !== true) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum coverage registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_RANDOM_USED,
      message: 'Curriculum coverage registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum coverage registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_coverage_gap_analysis',
  };
}

// ---------------------------------------------------------------------------
// Artifact With Coverage Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum artifact with coverage against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCurriculumArtifactWithCoverage(
  artifact: CurriculumArtifactWithCoverage,
): CurriculumCoverageValidationResult {
  const errors: CurriculumCoverageValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
      message: 'Curriculum artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate coverage registry
  if (artifact.coverageRegistry && artifact.graph) {
    const graphNodeIds = artifact.graph.nodes.map((n) => n.nodeId);
    const registryResult = validateCoverageRegistry(
      artifact.coverageRegistry,
      graphNodeIds,
    );
    errors.push(...registryResult.errors);
  }

  // Deterministic metadata check
  if (artifact.deterministic !== true) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_NOT_DETERMINISTIC,
      message: 'Curriculum artifact must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (artifact.randomUsed !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_RANDOM_USED,
      message: 'Curriculum artifact must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (artifact.timeDependency !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_TRACE_TIME_DEPENDENCY,
      message: 'Curriculum artifact must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_coverage_gap_analysis',
  };
}

// ---------------------------------------------------------------------------
// Coverage Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum coverage input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCoverageInput(
  input: CurriculumCoverageInput,
  graphNodeIds: readonly string[],
): readonly CurriculumCoverageValidationError[] {
  const errors: CurriculumCoverageValidationError[] = [];

  if (!input.registryId || input.registryId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_REGISTRY_ID,
      message: 'Curriculum coverage input is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!input.graphId || input.graphId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_GRAPH_ID,
      message: 'Curriculum coverage input is missing a graph ID.',
      field: 'graphId',
    });
  }

  if (!input.coverageRecords || input.coverageRecords.length === 0) {
    if (!input.gapRecords || input.gapRecords.length === 0) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
        message: 'Curriculum coverage input has no coverage records or gap records.',
        field: 'coverageRecords',
      });
    }
  } else {
    for (const record of input.coverageRecords) {
      errors.push(...validateCoverageRecord(record, graphNodeIds));
    }
  }

  if (input.gapRecords && input.gapRecords.length > 0) {
    for (const record of input.gapRecords) {
      errors.push(...validateGapRecord(record, graphNodeIds));
    }
  }

  return errors;
}
