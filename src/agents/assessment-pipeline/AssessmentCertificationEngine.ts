/**
 * NV-2000-D8-OPT-15 — Deterministic Assessment Certification & Structural Quality Gate
 *
 * Pure deterministic compose functions for assessment certification.
 * The Assessment Agent certifies that assessment artifacts are structurally
 * complete, internally consistent, deterministic, immutable, and compliant
 * with every canonical requirement established throughout D8-OPT-01 through D8-OPT-14.
 *
 * This module does not repair artifacts, does not generate missing metadata,
 * does not evaluate learners, does not calculate grades, and does not infer mastery.
 * It only certifies structural quality.
 *
 * Guarantees:
 * - Same inputs always produce identical outputs.
 * - No global mutable state reads.
 * - No random values.
 * - No time dependency.
 * - Canonical order is always preserved.
 *
 * Deterministic. No Math.random. No Date.now.
 */

import {
  type AssessmentCertificationFinding,
  type AssessmentCertificationMetadata,
  type AssessmentCertificationReport,
  type AssessmentCertificationStatus,
  type AssessmentCertificationTrace,
  type AssessmentCertificationValidationResult,
  type AssessmentCertificationValidationError,
  type AssessmentFindingSeverity,
  type AssessmentQualityDimension,
  CANONICAL_ASSESSMENT_CERTIFICATION_STATUS,
  CANONICAL_ASSESSMENT_FINDING_SEVERITY,
  CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// HELPER FUNCTIONS — Canonical lookups and type guards
// ============================================================================

/**
 * Type guard: is the value a supported assessment certification status?
 */
export function isSupportedAssessmentCertificationStatus(
  value: string,
): value is AssessmentCertificationStatus {
  return CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.includes(
    value as AssessmentCertificationStatus,
  );
}

/**
 * Type guard: is the value a supported assessment finding severity?
 */
export function isSupportedAssessmentFindingSeverity(
  value: string,
): value is AssessmentFindingSeverity {
  return CANONICAL_ASSESSMENT_FINDING_SEVERITY.includes(
    value as AssessmentFindingSeverity,
  );
}

/**
 * Type guard: is the value a supported assessment quality dimension?
 */
export function isSupportedAssessmentQualityDimension(
  value: string,
): value is AssessmentQualityDimension {
  return CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.includes(
    value as AssessmentQualityDimension,
  );
}

/**
 * Returns a copy of canonical assessment certification statuses.
 */
export function getCanonicalAssessmentCertificationStatuses(): readonly AssessmentCertificationStatus[] {
  return [...CANONICAL_ASSESSMENT_CERTIFICATION_STATUS];
}

/**
 * Returns a copy of canonical assessment finding severities.
 */
export function getCanonicalAssessmentFindingSeverities(): readonly AssessmentFindingSeverity[] {
  return [...CANONICAL_ASSESSMENT_FINDING_SEVERITY];
}

/**
 * Returns a copy of canonical assessment quality dimensions.
 */
export function getCanonicalAssessmentQualityDimensions(): readonly AssessmentQualityDimension[] {
  return [...CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS];
}

// ============================================================================
// COMPOSE FUNCTIONS — Pure deterministic composition
// ============================================================================

/**
 * Deterministic ID generator.
 */
function _deterministicId(prefix: string, parts: readonly string[]): string {
  const slug = parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
  return `${prefix}-${slug}`;
}

/**
 * Deterministic content hash for generating stable IDs from arbitrary content.
 * Produces a hex-like string based on deterministic string operations.
 */
function _deterministicContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return absHash.substring(0, 12);
}

/**
 * Compose an immutable AssessmentCertificationFinding.
 */
export function composeAssessmentCertificationFinding(params: {
  readonly id: string;
  readonly dimension: AssessmentQualityDimension;
  readonly severity: AssessmentFindingSeverity;
  readonly message: string;
  readonly field?: string;
  readonly entityId?: string;
  readonly source: string;
}): AssessmentCertificationFinding {
  return {
    id: params.id,
    dimension: params.dimension,
    severity: params.severity,
    message: params.message,
    field: params.field,
    entityId: params.entityId,
    source: params.source,
  };
}

/**
 * Compose an immutable AssessmentCertificationTrace.
 */
export function composeAssessmentCertificationTrace(params: {
  readonly traceId: string;
}): AssessmentCertificationTrace {
  return {
    traceId: params.traceId,
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

/**
 * Compose immutable AssessmentCertificationMetadata.
 */
export function _composeAssessmentCertificationMetadata(params: {
  readonly totalDimensions: number;
  readonly checkedDimensions: number;
  readonly findingCount: number;
}): AssessmentCertificationMetadata {
  return {
    version: '1.0.0',
    generatedFrom: 'deterministic_certification_engine',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
    totalDimensions: params.totalDimensions,
    checkedDimensions: params.checkedDimensions,
    findingCount: params.findingCount,
  };
}

/**
 * Calculate certification score from findings.
 * Score is deterministic based on severity distribution.
 * Returns a value between 0 and 100.
 */
export function calculateAssessmentCertificationScore(
  findings: readonly AssessmentCertificationFinding[],
): number {
  if (findings.length === 0) {
    return 100;
  }

  let penalty = 0;
  for (const finding of findings) {
    switch (finding.severity) {
      case 'info':
        penalty += 0;
        break;
      case 'low':
        penalty += 1;
        break;
      case 'medium':
        penalty += 5;
        break;
      case 'high':
        penalty += 15;
        break;
      case 'critical':
        penalty += 30;
        break;
    }
  }

  const score = Math.max(0, 100 - penalty);
  return score;
}

/**
 * Determine certification status based on score and findings.
 */
export function _determineCertificationStatus(
  score: number,
  findings: readonly AssessmentCertificationFinding[],
): AssessmentCertificationStatus {
  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasHigh = findings.some((f) => f.severity === 'high');

  if (hasCritical) {
    return 'failed';
  }

  if (hasHigh && score < 50) {
    return 'failed';
  }

  if (score >= 90) {
    return findings.length > 0 ? 'passed_with_warnings' : 'passed';
  }

  if (score >= 70) {
    return 'passed_with_warnings';
  }

  if (score >= 50) {
    return 'incomplete';
  }

  return 'failed';
}

/**
 * Check if certification was successful.
 */
export function isAssessmentCertificationSuccessful(
  status: AssessmentCertificationStatus,
): boolean {
  return status === 'passed' || status === 'passed_with_warnings';
}

/**
 * Compose an immutable AssessmentCertificationReport.
 */
export function composeAssessmentCertificationReport(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly findings: readonly AssessmentCertificationFinding[];
  readonly dimensionsChecked: readonly AssessmentQualityDimension[];
  readonly certifiedAt: string;
  readonly certifiedBy: string;
}): AssessmentCertificationReport {
  const score = calculateAssessmentCertificationScore(params.findings);
  const status = _determineCertificationStatus(score, params.findings);
  const traceId = _deterministicId('certification', [params.artifactId]);
  const trace = composeAssessmentCertificationTrace({ traceId });

  const metadata = _composeAssessmentCertificationMetadata({
    totalDimensions: CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length,
    checkedDimensions: params.dimensionsChecked.length,
    findingCount: params.findings.length,
  });

  const reportId = _deterministicId('report', [
    params.artifactId,
    _deterministicContentHash(JSON.stringify(params.findings)),
  ]);

  return {
    reportId,
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    status,
    score,
    findings: [...params.findings],
    dimensionsChecked: [...params.dimensionsChecked],
    certifiedAt: params.certifiedAt,
    certifiedBy: params.certifiedBy,
    trace,
    metadata,
  };
}

/**
 * Certify an assessment artifact.
 * This is the main entry point for the certification engine.
 * It performs deterministic structural certification.
 */
export function certifyAssessmentArtifact(params: {
  readonly artifactId: string;
  readonly artifactTitle: string;
  readonly findings: readonly AssessmentCertificationFinding[];
  readonly certifiedAt: string;
  readonly certifiedBy: string;
}): AssessmentCertificationReport {
  const dimensionsChecked = _extractDimensionsFromFindings(params.findings);

  return composeAssessmentCertificationReport({
    artifactId: params.artifactId,
    artifactTitle: params.artifactTitle,
    findings: params.findings,
    dimensionsChecked,
    certifiedAt: params.certifiedAt,
    certifiedBy: params.certifiedBy,
  });
}

/**
 * Extract unique dimensions from findings.
 */
function _extractDimensionsFromFindings(
  findings: readonly AssessmentCertificationFinding[],
): readonly AssessmentQualityDimension[] {
  const dimensionSet = new Set<AssessmentQualityDimension>();
  for (const finding of findings) {
    dimensionSet.add(finding.dimension);
  }
  return [...dimensionSet].sort();
}

/**
 * Validate an AssessmentCertificationReport.
 */
export function validateAssessmentCertification(
  report: AssessmentCertificationReport,
): AssessmentCertificationValidationResult {
  const errors: AssessmentCertificationValidationError[] = [];

  if (!report || typeof report !== 'object') {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_REPORT',
      message: 'Certification report is not a valid object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'certification_validation',
    };
  }

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_REPORT',
      message: 'Certification report is missing a valid reportId.',
      field: 'reportId',
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_REPORT',
      message: 'Certification report is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.includes(report.status)) {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_STATUS',
      message: `Invalid certification status: ${String(report.status)}`,
      field: 'status',
    });
  }

  if (typeof report.score !== 'number' || report.score < 0 || report.score > 100) {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_SCORE',
      message: `Invalid certification score: ${String(report.score)}`,
      field: 'score',
    });
  }

  if (!Array.isArray(report.findings)) {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_MISSING_FINDINGS',
      message: 'Certification report is missing findings array.',
      field: 'findings',
    });
  } else {
    const findingIds = new Set<string>();
    for (const finding of report.findings) {
      if (findingIds.has(finding.id)) {
        errors.push({
          code: 'ASSESSMENT_CERTIFICATION_DUPLICATE_FINDING',
          message: `Duplicate finding id: ${finding.id}`,
          field: 'findings',
          entityId: finding.id,
        });
      }
      findingIds.add(finding.id);

      if (!CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.includes(finding.dimension)) {
        errors.push({
          code: 'ASSESSMENT_CERTIFICATION_INVALID_DIMENSION',
          message: `Invalid quality dimension: ${String(finding.dimension)}`,
          field: 'dimension',
          entityId: finding.id,
        });
      }

      if (!CANONICAL_ASSESSMENT_FINDING_SEVERITY.includes(finding.severity)) {
        errors.push({
          code: 'ASSESSMENT_CERTIFICATION_INVALID_SEVERITY',
          message: `Invalid finding severity: ${String(finding.severity)}`,
          field: 'severity',
          entityId: finding.id,
        });
      }
    }
  }

  if (!Array.isArray(report.dimensionsChecked)) {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_INVALID_DIMENSION',
      message: 'Certification report is missing dimensionsChecked array.',
      field: 'dimensionsChecked',
    });
  }

  if (!report.trace || typeof report.trace !== 'object') {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_MISSING_TRACE',
      message: 'Certification report is missing trace metadata.',
      field: 'trace',
    });
  } else {
    if (report.trace.deterministic !== true) {
      errors.push({
        code: 'ASSESSMENT_CERTIFICATION_MISSING_TRACE',
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (report.trace.randomUsed !== false) {
      errors.push({
        code: 'ASSESSMENT_CERTIFICATION_MISSING_TRACE',
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (report.trace.timeDependency !== false) {
      errors.push({
        code: 'ASSESSMENT_CERTIFICATION_MISSING_TRACE',
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  if (!report.metadata || typeof report.metadata !== 'object') {
    errors.push({
      code: 'ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY',
      message: 'Certification report is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (report.metadata.totalDimensions !== CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length) {
      errors.push({
        code: 'ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY',
        message: 'Metadata totalDimensions does not match canonical count.',
        field: 'metadata.totalDimensions',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_validation',
  };
}
