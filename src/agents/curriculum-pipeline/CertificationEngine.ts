/**
 * NV-1500-D3-OPT-09 — Curriculum Certification & Structural Quality Gate Engine
 *
 * Deterministic orchestration functions for curriculum certification and structural quality gating.
 * Produces certification reports and quality evaluations.
 *
 * This module never:
 * - Modifies curriculum
 * - Rewrites curriculum
 * - Generates curriculum
 * - Recommends educational strategies
 * - Estimates learner success
 * - Predicts outcomes
 * - Modifies dependencies
 * - Modifies graph
 * - Modifies roadmap
 * - Modifies learning paths
 * - Modifies versions
 * - Modifies evolution
 * - Performs governance decisions
 * - Performs migrations
 * - Repairs curriculum
 * - Calls external APIs
 * - Calls LLMs
 * - Accesses network
 * - Accesses filesystem
 * - Accesses databases
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumCompositionCertificationStatus,
  CurriculumCompositionFindingSeverity,
  CurriculumCompositionQualityDimension,
  CurriculumCompositionFinding,
  CurriculumCompositionCertificationReport,
  CurriculumCompositionCertificationInput,
  CurriculumCompositionCertificationValidationResult,
  CurriculumGovernanceStatus,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_CERTIFICATION_STATUS,
  CANONICAL_CURRICULUM_FINDING_SEVERITY,
  CANONICAL_CURRICULUM_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

// ---------------------------------------------------------------------------
// Canonical Certification Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a certification status is supported (in canonical certification statuses).
 */
export function isSupportedCertificationStatus(
  status: string,
): status is CurriculumCompositionCertificationStatus {
  return CANONICAL_CURRICULUM_CERTIFICATION_STATUS.includes(
    status as CurriculumCompositionCertificationStatus,
  );
}

/**
 * Returns the canonical certification statuses.
 */
export function getCanonicalCertificationStatuses(): readonly CurriculumCompositionCertificationStatus[] {
  return CANONICAL_CURRICULUM_CERTIFICATION_STATUS;
}

// ---------------------------------------------------------------------------
// Canonical Finding Severity Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a finding severity is supported (in canonical finding severities).
 */
export function isSupportedFindingSeverity(
  severity: string,
): severity is CurriculumCompositionFindingSeverity {
  return CANONICAL_CURRICULUM_FINDING_SEVERITY.includes(
    severity as CurriculumCompositionFindingSeverity,
  );
}

/**
 * Returns the canonical finding severities.
 */
export function getCanonicalFindingSeverities(): readonly CurriculumCompositionFindingSeverity[] {
  return CANONICAL_CURRICULUM_FINDING_SEVERITY;
}

// ---------------------------------------------------------------------------
// Canonical Quality Dimension Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a quality dimension is supported (in canonical quality dimensions).
 */
export function isSupportedQualityDimension(
  dimension: string,
): dimension is CurriculumCompositionQualityDimension {
  return CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.includes(
    dimension as CurriculumCompositionQualityDimension,
  );
}

/**
 * Returns the canonical quality dimensions.
 */
export function getCanonicalQualityDimensions(): readonly CurriculumCompositionQualityDimension[] {
  return CANONICAL_CURRICULUM_QUALITY_DIMENSIONS;
}

// ---------------------------------------------------------------------------
// Governance Status Helpers
// ---------------------------------------------------------------------------

/**
 * Checks if a governance status is supported.
 */
export function isSupportedCertificationGovernanceStatus(
  status: string,
): status is CurriculumGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(status as CurriculumGovernanceStatus);
}

// ---------------------------------------------------------------------------
// Order Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the severity order for sorting.
 * Lower index means higher severity.
 */
function _getSeverityOrder(severity: CurriculumCompositionFindingSeverity): number {
  const index = CANONICAL_CURRICULUM_FINDING_SEVERITY.indexOf(severity);
  return index === -1 ? -1 : index;
}

/**
 * Returns the dimension order for sorting.
 * Lower index means earlier dimension.
 */
function _getDimensionOrder(dimension: CurriculumCompositionQualityDimension): number {
  const index = CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.indexOf(dimension);
  return index === -1 ? -1 : index;
}

// ---------------------------------------------------------------------------
// Compose Certification Finding
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum composition finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeCertificationFinding(params: {
  readonly findingId: string;
  readonly severity: CurriculumCompositionFindingSeverity;
  readonly dimension: CurriculumCompositionQualityDimension;
  readonly code: string;
  readonly message: string;
  readonly rationale: string;
  readonly source: string;
  readonly governanceStatus: CurriculumGovernanceStatus;
  readonly providedBy: string;
}): CurriculumCompositionFinding {
  return {
    findingId: params.findingId,
    severity: params.severity,
    dimension: params.dimension,
    code: params.code,
    message: params.message,
    rationale: params.rationale,
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sorting
// ---------------------------------------------------------------------------

/**
 * Sorts findings deterministically by severity, then dimension, then findingId.
 */
function _sortFindingsDeterministically(
  findings: readonly CurriculumCompositionFinding[],
): readonly CurriculumCompositionFinding[] {
  return [...findings].sort((a, b) => {
    const severityCompare = _getSeverityOrder(a.severity) - _getSeverityOrder(b.severity);
    if (severityCompare !== 0) return severityCompare;
    const dimensionCompare = _getDimensionOrder(a.dimension) - _getDimensionOrder(b.dimension);
    if (dimensionCompare !== 0) return dimensionCompare;
    return a.findingId.localeCompare(b.findingId);
  });
}

// ---------------------------------------------------------------------------
// Certification Status Resolution
// ---------------------------------------------------------------------------

/**
 * Determines the certification status based on findings.
 * Pure function. No side effects.
 *
 * - 'certified': no findings exist
 * - 'certified_with_warnings': only warnings and recommendations, no errors
 * - 'needs_revision': contains non-blocking errors
 * - 'blocked': contains structural violations (errors in critical dimensions)
 */
function _resolveCertificationStatus(
  findings: readonly CurriculumCompositionFinding[],
): CurriculumCompositionCertificationStatus {
  if (findings.length === 0) {
    return 'certified';
  }

  const hasErrors = findings.some((f) => f.severity === 'error');
  const hasWarnings = findings.some((f) => f.severity === 'warning');
  const hasRecommendations = findings.some((f) => f.severity === 'recommendation');

  if (!hasErrors) {
    if (hasWarnings || hasRecommendations) {
      return 'certified_with_warnings';
    }
    return 'certified';
  }

  // Check for blocking errors (structural violations)
  const blockingDimensions: CurriculumCompositionQualityDimension[] = [
    'graph_integrity',
    'dependency_integrity',
    'determinism',
    'architectural_boundary',
    'validation_integrity',
    'provenance_integrity',
  ];

  const hasBlockingError = findings.some(
    (f) =>
      f.severity === 'error' && blockingDimensions.includes(f.dimension),
  );

  if (hasBlockingError) {
    return 'blocked';
  }

  return 'needs_revision';
}

// ---------------------------------------------------------------------------
// Quality Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates a quality score based on findings.
 * Range: 0-100
 * Pure function. No side effects.
 *
 * Starting from 100, deductions are applied:
 * - error: -20 points
 * - warning: -5 points
 * - recommendation: -1 point
 *
 * Minimum score is 0.
 */
function _calculateQualityScore(
  findings: readonly CurriculumCompositionFinding[],
): number {
  let score = 100;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'error':
        score -= 20;
        break;
      case 'warning':
        score -= 5;
        break;
      case 'recommendation':
        score -= 1;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Compose Certification Report
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum composition certification report from an input.
 * Pure function. No side effects.
 * Findings sorted by severity, then dimension, then findingId.
 */
export function composeCertificationReport(
  input: CurriculumCompositionCertificationInput,
): CurriculumCompositionCertificationReport {
  const sortedFindings = _sortFindingsDeterministically(input.findings);
  const status = _resolveCertificationStatus(sortedFindings);
  const qualityScore = input.qualityScore !== undefined
    ? input.qualityScore
    : _calculateQualityScore(sortedFindings);

  const errorCount = sortedFindings.filter((f) => f.severity === 'error').length;
  const warningCount = sortedFindings.filter((f) => f.severity === 'warning').length;
  const recommendationCount = sortedFindings.filter((f) => f.severity === 'recommendation').length;

  return {
    reportId: input.reportId,
    artifactId: input.artifactId,
    status,
    findings: sortedFindings,
    findingCount: sortedFindings.length,
    errorCount,
    warningCount,
    recommendationCount,
    qualityScore,
    dimensionsChecked: [...input.dimensionsChecked],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Certification Finding from Input
// ---------------------------------------------------------------------------

/**
 * Composes certification findings from an input's findings array.
 * Pure function. No side effects.
 */
function _composeFindingsFromInput(
  inputFindings: readonly CurriculumCompositionFinding[],
): readonly CurriculumCompositionFinding[] {
  return inputFindings.map((finding) => ({
    ...finding,
  }));
}

// ---------------------------------------------------------------------------
// Compose Curriculum Certification
// ---------------------------------------------------------------------------

/**
 * Composes a curriculum composition certification report from an input.
 * Pure function. No side effects.
 * Findings sorted by severity, then dimension, then findingId.
 */
export function certifyCurriculumComposition(
  input: CurriculumCompositionCertificationInput,
): CurriculumCompositionCertificationReport {
  const sortedFindings = _sortFindingsDeterministically(
    _composeFindingsFromInput(input.findings),
  );
  const status = _resolveCertificationStatus(sortedFindings);

  const errorCount = sortedFindings.filter((f) => f.severity === 'error').length;
  const warningCount = sortedFindings.filter((f) => f.severity === 'warning').length;
  const recommendationCount = sortedFindings.filter((f) => f.severity === 'recommendation').length;

  return {
    reportId: input.reportId,
    artifactId: input.artifactId,
    status,
    findings: sortedFindings,
    findingCount: sortedFindings.length,
    errorCount,
    warningCount,
    recommendationCount,
    qualityScore: input.qualityScore,
    dimensionsChecked: [...input.dimensionsChecked],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}

// ---------------------------------------------------------------------------
// Compose Certification Report from Parameters
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from parameters.
 * Pure function. No side effects.
 */
export function composeCertificationReportFromParams(params: {
  readonly reportId: string;
  readonly artifactId: string;
  readonly findings: readonly CurriculumCompositionFinding[];
  readonly dimensionsChecked: readonly CurriculumCompositionQualityDimension[];
}): CurriculumCompositionCertificationReport {
  const sortedFindings = _sortFindingsDeterministically(params.findings);
  const status = _resolveCertificationStatus(sortedFindings);
  const qualityScore = _calculateQualityScore(sortedFindings);

  const errorCount = sortedFindings.filter((f) => f.severity === 'error').length;
  const warningCount = sortedFindings.filter((f) => f.severity === 'warning').length;
  const recommendationCount = sortedFindings.filter((f) => f.severity === 'recommendation').length;

  return {
    reportId: params.reportId,
    artifactId: params.artifactId,
    status,
    findings: sortedFindings,
    findingCount: sortedFindings.length,
    errorCount,
    warningCount,
    recommendationCount,
    qualityScore,
    dimensionsChecked: [...params.dimensionsChecked],
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
    curriculumMutated: false,
  };
}
