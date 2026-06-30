/**
 * NV-2000-D8-OPT-15 — Assessment Certification & Structural Quality Gate Validation
 *
 * Deterministic validation for the Assessment Certification Engine.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import {
  type AssessmentCertificationFinding,
  type AssessmentCertificationReport,
  type AssessmentCertificationValidationResult,
  type AssessmentCertificationValidationError,
  type AssessmentCertificationStatus,
  type AssessmentFindingSeverity,
  type AssessmentQualityDimension,
  CANONICAL_ASSESSMENT_CERTIFICATION_STATUS,
  CANONICAL_ASSESSMENT_FINDING_SEVERITY,
  CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS,
} from './AssessmentAgentContract.ts';

// ============================================================================
// VALIDATION CODES — Stable forever (10 codes)
// ============================================================================

export const ASSESSMENT_CERTIFICATION_VALIDATION_CODES = {
  ASSESSMENT_CERTIFICATION_INVALID_STATUS: 'ASSESSMENT_CERTIFICATION_INVALID_STATUS',
  ASSESSMENT_CERTIFICATION_INVALID_SCORE: 'ASSESSMENT_CERTIFICATION_INVALID_SCORE',
  ASSESSMENT_CERTIFICATION_DUPLICATE_FINDING: 'ASSESSMENT_CERTIFICATION_DUPLICATE_FINDING',
  ASSESSMENT_CERTIFICATION_INVALID_DIMENSION: 'ASSESSMENT_CERTIFICATION_INVALID_DIMENSION',
  ASSESSMENT_CERTIFICATION_INVALID_SEVERITY: 'ASSESSMENT_CERTIFICATION_INVALID_SEVERITY',
  ASSESSMENT_CERTIFICATION_EMPTY_REPORT: 'ASSESSMENT_CERTIFICATION_EMPTY_REPORT',
  ASSESSMENT_CERTIFICATION_MISSING_TRACE: 'ASSESSMENT_CERTIFICATION_MISSING_TRACE',
  ASSESSMENT_CERTIFICATION_MISSING_FINDINGS: 'ASSESSMENT_CERTIFICATION_MISSING_FINDINGS',
  ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY: 'ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY',
  ASSESSMENT_CERTIFICATION_INVALID_REPORT: 'ASSESSMENT_CERTIFICATION_INVALID_REPORT',
} as const;

// ============================================================================
// VALIDATION FUNCTIONS — Pure, never throw
// ============================================================================

/**
 * Validate a single certification finding.
 */
export function validateAssessmentCertificationFinding(
  finding: AssessmentCertificationFinding,
): readonly AssessmentCertificationValidationError[] {
  const errors: AssessmentCertificationValidationError[] = [];

  if (!finding || typeof finding !== 'object') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Finding is not a valid object.',
    });
    return errors;
  }

  if (!finding.id || finding.id.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Finding is missing a valid id.',
      field: 'id',
    });
  }

  if (!CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.includes(finding.dimension)) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_DIMENSION,
      message: `Invalid quality dimension: ${String(finding.dimension)}`,
      field: 'dimension',
      entityId: finding.id,
    });
  }

  if (!CANONICAL_ASSESSMENT_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_SEVERITY,
      message: `Invalid finding severity: ${String(finding.severity)}`,
      field: 'severity',
      entityId: finding.id,
    });
  }

  if (!finding.message || finding.message.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Finding is missing a valid message.',
      field: 'message',
      entityId: finding.id,
    });
  }

  if (!finding.source || finding.source.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Finding is missing a valid source.',
      field: 'source',
      entityId: finding.id,
    });
  }

  return errors;
}

/**
 * Validate assessment certification status.
 */
export function validateAssessmentCertificationStatus(
  status: string,
): readonly AssessmentCertificationValidationError[] {
  const errors: AssessmentCertificationValidationError[] = [];

  if (!CANONICAL_ASSESSMENT_CERTIFICATION_STATUS.includes(status as AssessmentCertificationStatus)) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_STATUS,
      message: `Invalid certification status: ${status}`,
      field: 'status',
    });
  }

  return errors;
}

/**
 * Validate assessment certification score.
 */
export function validateAssessmentCertificationScore(
  score: number,
): readonly AssessmentCertificationValidationError[] {
  const errors: AssessmentCertificationValidationError[] = [];

  if (typeof score !== 'number') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_SCORE,
      message: `Score is not a number: ${String(score)}`,
      field: 'score',
    });
  } else if (score < 0 || score > 100) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_SCORE,
      message: `Score out of range: ${score}. Must be between 0 and 100.`,
      field: 'score',
    });
  }

  return errors;
}

/**
 * Validate an AssessmentCertificationReport.
 */
export function validateAssessmentCertificationReport(
  report: AssessmentCertificationReport,
): AssessmentCertificationValidationResult {
  const errors: AssessmentCertificationValidationError[] = [];

  if (!report || typeof report !== 'object') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is not a valid object.',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'certification_report_validation',
    };
  }

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is missing a valid reportId.',
      field: 'reportId',
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is missing a valid artifactId.',
      field: 'artifactId',
    });
  }

  if (!report.artifactTitle || report.artifactTitle.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is missing a valid artifactTitle.',
      field: 'artifactTitle',
    });
  }

  const statusErrors = validateAssessmentCertificationStatus(report.status);
  errors.push(...statusErrors);

  const scoreErrors = validateAssessmentCertificationScore(report.score);
  errors.push(...scoreErrors);

  if (!Array.isArray(report.findings)) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_MISSING_FINDINGS,
      message: 'Certification report is missing findings array.',
      field: 'findings',
    });
  } else if (report.findings.length === 0) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_EMPTY_REPORT,
      message: 'Certification report has no findings.',
      field: 'findings',
    });
  } else {
    const findingIds = new Set<string>();
    for (const finding of report.findings) {
      if (findingIds.has(finding.id)) {
        errors.push({
          code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_DUPLICATE_FINDING,
          message: `Duplicate finding id: ${finding.id}`,
          field: 'findings',
          entityId: finding.id,
        });
      }
      findingIds.add(finding.id);

      const findingErrors = validateAssessmentCertificationFinding(finding);
      errors.push(...findingErrors);
    }
  }

  if (!Array.isArray(report.dimensionsChecked)) {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_DIMENSION,
      message: 'Certification report is missing dimensionsChecked array.',
      field: 'dimensionsChecked',
    });
  } else {
    for (const dimension of report.dimensionsChecked) {
      if (!CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.includes(dimension)) {
        errors.push({
          code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_DIMENSION,
          message: `Invalid quality dimension in dimensionsChecked: ${String(dimension)}`,
          field: 'dimensionsChecked',
        });
      }
    }
  }

  if (!report.certifiedAt || report.certifiedAt.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is missing a valid certifiedAt.',
      field: 'certifiedAt',
    });
  }

  if (!report.certifiedBy || report.certifiedBy.trim() === '') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
      message: 'Certification report is missing a valid certifiedBy.',
      field: 'certifiedBy',
    });
  }

  if (!report.trace || typeof report.trace !== 'object') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_MISSING_TRACE,
      message: 'Certification report is missing trace metadata.',
      field: 'trace',
    });
  } else {
    if (report.trace.deterministic !== true) {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_MISSING_TRACE,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (report.trace.randomUsed !== false) {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_MISSING_TRACE,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (report.trace.timeDependency !== false) {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_MISSING_TRACE,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  if (!report.metadata || typeof report.metadata !== 'object') {
    errors.push({
      code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY,
      message: 'Certification report is missing metadata.',
      field: 'metadata',
    });
  } else {
    if (report.metadata.totalDimensions !== CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length) {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_REGISTRY_INCONSISTENCY,
        message: `Metadata totalDimensions (${report.metadata.totalDimensions}) does not match canonical count (${CANONICAL_ASSESSMENT_QUALITY_DIMENSIONS.length}).`,
        field: 'metadata.totalDimensions',
      });
    }
    if (typeof report.metadata.totalDimensions !== 'number') {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
        message: 'Metadata totalDimensions is not a number.',
        field: 'metadata.totalDimensions',
      });
    }
    if (typeof report.metadata.checkedDimensions !== 'number') {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
        message: 'Metadata checkedDimensions is not a number.',
        field: 'metadata.checkedDimensions',
      });
    }
    if (typeof report.metadata.findingCount !== 'number') {
      errors.push({
        code: ASSESSMENT_CERTIFICATION_VALIDATION_CODES.ASSESSMENT_CERTIFICATION_INVALID_REPORT,
        message: 'Metadata findingCount is not a number.',
        field: 'metadata.findingCount',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_report_validation',
  };
}
