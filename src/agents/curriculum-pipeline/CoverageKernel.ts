/**
 * NV-1500-D3-OPT-06 — Curriculum Coverage & Gap Analysis Kernel
 *
 * Deterministic orchestration functions for curriculum coverage and gap analysis.
 * Produces coverage registries, traces, and artifacts.
 *
 * This module never:
 * - Recommends curriculum improvements
 * - Creates missing curriculum
 * - Reorders curriculum
 * - Infers mastery or readiness
 * - Infers learner difficulty
 * - Estimates completion time
 * - Personalizes curriculum
 * - Schedules activities
 * - Modifies dependencies, progression, learning paths, or roadmaps
 * - Executes laboratories or assessments
 * - Calls external APIs or LLMs
 * - Accesses the network or databases
 * - Introduces probabilistic behavior
 * - Accesses the filesystem
 * - Uses async operations
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumCoverageStatus,
  CurriculumGapType,
  CurriculumCoverageDimension,
  CurriculumCoverageRecord,
  CurriculumGapRecord,
  CurriculumCoverageRegistry,
  CurriculumCoverageDecision,
  CurriculumCoverageTrace,
  CurriculumCoverageInput,
  CurriculumCoverageProvenance,
  CurriculumArtifactWithCoverage,
  CurriculumGovernanceStatus,
  CurriculumGraph,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Coverage Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a coverage status is supported (in canonical coverage statuses).
 */
export function isSupportedCoverageStatus(
  status: string,
): status is CurriculumCoverageStatus {
  return CANONICAL_COVERAGE_STATUS.includes(status as CurriculumCoverageStatus);
}

/**
 * Returns the canonical coverage statuses.
 */
export function getCanonicalCoverageStatuses(): readonly CurriculumCoverageStatus[] {
  return CANONICAL_COVERAGE_STATUS;
}

// ---------------------------------------------------------------------------
// Canonical Gap Type Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a gap type is supported (in canonical gap types).
 */
export function isSupportedGapType(
  type: string,
): type is CurriculumGapType {
  return CANONICAL_GAP_TYPES.includes(type as CurriculumGapType);
}

/**
 * Returns the canonical gap types.
 */
export function getCanonicalGapTypes(): readonly CurriculumGapType[] {
  return CANONICAL_GAP_TYPES;
}

// ---------------------------------------------------------------------------
// Canonical Coverage Dimension Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a coverage dimension is supported (in canonical coverage dimensions).
 */
export function isSupportedCoverageDimension(
  dimension: string,
): dimension is CurriculumCoverageDimension {
  return CANONICAL_COVERAGE_DIMENSIONS.includes(dimension as CurriculumCoverageDimension);
}

/**
 * Returns the canonical coverage dimensions.
 */
export function getCanonicalCoverageDimensions(): readonly CurriculumCoverageDimension[] {
  return CANONICAL_COVERAGE_DIMENSIONS;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedCoverageGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Dimension Order Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the canonical order index for a coverage dimension.
 * Lower index means earlier dimension.
 */
function _getDimensionOrder(dimension: CurriculumCoverageDimension): number {
  const index = CANONICAL_COVERAGE_DIMENSIONS.indexOf(dimension);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for a coverage status.
 * Lower index means earlier status.
 */
function _getStatusOrder(status: CurriculumCoverageStatus): number {
  const index = CANONICAL_COVERAGE_STATUS.indexOf(status);
  return index === -1 ? -1 : index;
}

/**
 * Returns the canonical order index for a gap type.
 * Lower index means earlier type.
 */
function _getGapTypeOrder(gapType: CurriculumGapType): number {
  const index = CANONICAL_GAP_TYPES.indexOf(gapType);
  return index === -1 ? -1 : index;
}

/**
 * Returns the severity order for sorting.
 * Lower index means higher severity.
 */
function _getSeverityOrder(severity: string): number {
  const order: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    informational: 4,
  };
  return order[severity] ?? -1;
}

// ---------------------------------------------------------------------------
// Compose Coverage Record
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum coverage record from provided parameters.
 * Pure function. No side effects.
 */
export function composeCoverageRecord(params: {
  readonly coverageId: string;
  readonly entityId: string;
  readonly dimension: CurriculumCoverageDimension;
  readonly coverageStatus: CurriculumCoverageStatus;
  readonly coverageScore: number;
  readonly coveredBy: readonly string[];
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumCoverageRecord {
  return {
    coverageId: params.coverageId,
    entityId: params.entityId,
    dimension: params.dimension,
    coverageStatus: params.coverageStatus,
    coverageScore: params.coverageScore,
    coveredBy: [...params.coveredBy],
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Gap Record
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum gap record from provided parameters.
 * Pure function. No side effects.
 */
export function composeGapRecord(params: {
  readonly gapId: string;
  readonly entityId: string;
  readonly gapType: CurriculumGapType;
  readonly dimension: CurriculumCoverageDimension;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  readonly description: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): CurriculumGapRecord {
  return {
    gapId: params.gapId,
    entityId: params.entityId,
    gapType: params.gapType,
    dimension: params.dimension,
    severity: params.severity,
    description: params.description,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Compose Coverage Provenance
// ---------------------------------------------------------------------------

/**
 * Composes coverage provenance from a coverage record.
 * Pure function. No side effects.
 */
export function composeCoverageProvenance(
  record: CurriculumCoverageRecord,
): CurriculumCoverageProvenance {
  return {
    coverageId: record.coverageId,
    source: record.source,
    governanceStatus: record.governanceStatus,
    rationale: record.rationale,
    providedBy: record.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts coverage records deterministically by dimension, then coverageStatus, then entityId.
 */
function _sortCoverageRecordsDeterministically(
  records: readonly CurriculumCoverageRecord[],
): readonly CurriculumCoverageRecord[] {
  return [...records].sort((a, b) => {
    const dimCompare = _getDimensionOrder(a.dimension) - _getDimensionOrder(b.dimension);
    if (dimCompare !== 0) return dimCompare;
    const statusCompare = _getStatusOrder(a.coverageStatus) - _getStatusOrder(b.coverageStatus);
    if (statusCompare !== 0) return statusCompare;
    return a.entityId.localeCompare(b.entityId);
  });
}

/**
 * Sorts gap records deterministically by gapType, then entityId, then gapId.
 */
function _sortGapRecordsDeterministically(
  records: readonly CurriculumGapRecord[],
): readonly CurriculumGapRecord[] {
  return [...records].sort((a, b) => {
    const typeCompare = _getGapTypeOrder(a.gapType) - _getGapTypeOrder(b.gapType);
    if (typeCompare !== 0) return typeCompare;
    const entityCompare = a.entityId.localeCompare(b.entityId);
    if (entityCompare !== 0) return entityCompare;
    return a.gapId.localeCompare(b.gapId);
  });
}

// ---------------------------------------------------------------------------
// Compose Coverage Decisions
// ---------------------------------------------------------------------------

/**
 * Composes decisions for a coverage registry.
 * Pure function. No side effects.
 */
function _composeCoverageDecisions(
  records: readonly CurriculumCoverageRecord[],
): readonly CurriculumCoverageDecision[] {
  return records.map((record) => {
    const validationErrors = _validateCoverageRecordForDecision(record);
    return {
      decisionId: `_decision_${record.coverageId}`,
      coverageId: record.coverageId,
      validationPassed: validationErrors.length === 0,
      validationErrors,
    };
  });
}

/**
 * Validates a coverage record for decision composition.
 * Returns validation error codes.
 */
function _validateCoverageRecordForDecision(record: CurriculumCoverageRecord): readonly string[] {
  const errors: string[] = [];

  if (!record.coverageId || record.coverageId.trim() === '') {
    errors.push('COVERAGE_MISSING_ID');
  }

  if (!record.entityId || record.entityId.trim() === '') {
    errors.push('COVERAGE_MISSING_ENTITY_ID');
  }

  if (!isSupportedCoverageDimension(record.dimension)) {
    errors.push('COVERAGE_UNKNOWN_DIMENSION');
  }

  if (!isSupportedCoverageStatus(record.coverageStatus)) {
    errors.push('COVERAGE_UNKNOWN_STATUS');
  }

  if (typeof record.coverageScore !== 'number' || record.coverageScore < 0 || record.coverageScore > 1) {
    errors.push('COVERAGE_INVALID_SCORE');
  }

  if (!record.source || record.source.trim() === '') {
    errors.push('COVERAGE_MISSING_SOURCE');
  }

  if (!isSupportedCoverageGovernanceStatus(record.governanceStatus)) {
    errors.push('COVERAGE_INVALID_STATUS');
  }

  if (!record.rationale || record.rationale.trim() === '') {
    errors.push('COVERAGE_MISSING_RATIONALE');
  }

  if (!record.providedBy || record.providedBy.trim() === '') {
    errors.push('COVERAGE_MISSING_PROVIDED_BY');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Compose Curriculum Coverage
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum coverage registry from an input.
 * Pure function. No side effects.
 * Coverage records sorted by dimension, then coverageStatus, then entityId.
 * Gap records sorted by gapType, then entityId, then gapId.
 */
export function composeCurriculumCoverage(
  input: CurriculumCoverageInput,
): CurriculumCoverageRegistry {
  const sortedCoverageRecords = _sortCoverageRecordsDeterministically(input.coverageRecords);
  const sortedGapRecords = _sortGapRecordsDeterministically(input.gapRecords);

  return {
    registryId: input.registryId,
    graphId: input.graphId,
    coverageRecords: sortedCoverageRecords,
    gapRecords: sortedGapRecords,
    coverageCount: sortedCoverageRecords.length,
    gapCount: sortedGapRecords.length,
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Coverage Registry
// ---------------------------------------------------------------------------

/**
 * Composes a coverage registry from parameters.
 * Pure function. No side effects.
 * Records sorted deterministically.
 */
export function composeCoverageRegistry(params: {
  readonly registryId: string;
  readonly graphId: string;
  readonly coverageRecords: readonly CurriculumCoverageRecord[];
  readonly gapRecords: readonly CurriculumGapRecord[];
}): CurriculumCoverageRegistry {
  const sortedCoverageRecords = _sortCoverageRecordsDeterministically(params.coverageRecords);
  const sortedGapRecords = _sortGapRecordsDeterministically(params.gapRecords);

  return {
    registryId: params.registryId,
    graphId: params.graphId,
    coverageRecords: sortedCoverageRecords,
    gapRecords: sortedGapRecords,
    coverageCount: sortedCoverageRecords.length,
    gapCount: sortedGapRecords.length,
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Coverage Trace
// ---------------------------------------------------------------------------

/**
 * Composes a trace for a coverage registry.
 * Pure function. No side effects.
 */
export function composeCoverageTrace(
  registryId: string,
  coverageRecords: readonly CurriculumCoverageRecord[],
  gapRecords: readonly CurriculumGapRecord[],
): CurriculumCoverageTrace {
  const decisions = _composeCoverageDecisions(coverageRecords);

  return {
    traceId: `_trace_cov_${registryId}`,
    registryId,
    coverageCount: coverageRecords.length,
    gapCount: gapRecords.length,
    decisionsCount: decisions.length,
    validatedCount: decisions.filter((d) => d.validationPassed).length,
    invalidCount: decisions.filter((d) => !d.validationPassed).length,
    decisions,
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Curriculum Artifact With Coverage
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum artifact containing graph, coverage registry, trace, and validation.
 * Pure function. No side effects.
 */
export function composeCurriculumArtifactWithCoverage(params: {
  readonly artifactId: string;
  readonly graph: CurriculumGraph;
  readonly coverageRegistry: CurriculumCoverageRegistry;
  readonly coverageTrace: CurriculumCoverageTrace;
  readonly validation: CurriculumArtifactWithCoverage['validation'];
}): CurriculumArtifactWithCoverage {
  return {
    artifactId: params.artifactId,
    graph: params.graph,
    coverageRegistry: params.coverageRegistry,
    coverageTrace: params.coverageTrace,
    validation: params.validation,
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}
