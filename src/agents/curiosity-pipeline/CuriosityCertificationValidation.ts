/**
 * NV-2100-D9-OPT-15 — Curiosity Certification Validation Layer
 *
 * Deterministic validation for curiosity certification structural quality gate.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityCertificationFinding,
  CuriosityCertificationReport,
  CuriosityCertificationStatus,
  CuriosityFindingSeverity,
  CuriosityQualityDimension,
  CuriosityCertificationValidationError,
  CuriosityCertificationValidationResult,
  CuriosityCertificationFindingValidationResult,
  CuriosityCertificationStatusValidationResult,
  CuriosityCertificationScoreValidationResult,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_FINDING_SEVERITY,
  CANONICAL_CURIOSITY_QUALITY_DIMENSIONS,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CURIOSITY_CERTIFICATION_VALIDATION_CODES = {
  CURIOSITY_CERTIFICATION_INVALID_STATUS: 'CURIOSITY_CERTIFICATION_INVALID_STATUS',
  CURIOSITY_CERTIFICATION_INVALID_SCORE: 'CURIOSITY_CERTIFICATION_INVALID_SCORE',
  CURIOSITY_CERTIFICATION_INVALID_FINDING: 'CURIOSITY_CERTIFICATION_INVALID_FINDING',
  CURIOSITY_CERTIFICATION_INVALID_TRACE: 'CURIOSITY_CERTIFICATION_INVALID_TRACE',
  CURIOSITY_CERTIFICATION_INVALID_DIMENSION: 'CURIOSITY_CERTIFICATION_INVALID_DIMENSION',
  CURIOSITY_CERTIFICATION_MISSING_REPORT: 'CURIOSITY_CERTIFICATION_MISSING_REPORT',
  CURIOSITY_CERTIFICATION_MISSING_FINDING: 'CURIOSITY_CERTIFICATION_MISSING_FINDING',
  CURIOSITY_CERTIFICATION_MISSING_METADATA: 'CURIOSITY_CERTIFICATION_MISSING_METADATA',
  CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION: 'CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION',
  CURIOSITY_CERTIFICATION_INVALID_REPORT: 'CURIOSITY_CERTIFICATION_INVALID_REPORT',
} as const;

// ---------------------------------------------------------------------------
// Validation: CuriosityCertificationFinding
// ---------------------------------------------------------------------------

export function validateCuriosityCertificationFinding(
  finding: CuriosityCertificationFinding,
): CuriosityCertificationFindingValidationResult {
  const errors: CuriosityCertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.length === 0) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_FINDING,
      message: 'Finding ID must be non-empty',
      path: 'finding.findingId',
    });
  }

  if (!CANONICAL_CURIOSITY_QUALITY_DIMENSIONS.includes(finding.dimension)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_DIMENSION,
      message: `Invalid quality dimension: ${finding.dimension}`,
      path: 'finding.dimension',
    });
  }

  if (!CANONICAL_CURIOSITY_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_FINDING,
      message: `Invalid finding severity: ${finding.severity}`,
      path: 'finding.severity',
    });
  }

  if (!finding.message || finding.message.length === 0) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_FINDING,
      message: 'Finding message must be non-empty',
      path: 'finding.message',
    });
  }

  if (!finding.timestamp || finding.timestamp.length === 0) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_FINDING,
      message: 'Finding timestamp must be non-empty',
      path: 'finding.timestamp',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_certification_finding_validation',
  };
}

// ---------------------------------------------------------------------------
// Validation: CuriosityCertificationStatus
// ---------------------------------------------------------------------------

export function validateCuriosityCertificationStatus(
  status: CuriosityCertificationStatus,
): CuriosityCertificationStatusValidationResult {
  const errors: CuriosityCertificationValidationError[] = [];

  if (!CANONICAL_CURIOSITY_CERTIFICATION_STATUS.includes(status)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_STATUS,
      message: `Invalid certification status: ${status}`,
      path: 'status',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_certification_status_validation',
  };
}

// ---------------------------------------------------------------------------
// Validation: CuriosityCertificationScore
// ---------------------------------------------------------------------------

export function validateCuriosityCertificationScore(
  score: number,
): CuriosityCertificationScoreValidationResult {
  const errors: CuriosityCertificationValidationError[] = [];

  if (typeof score !== 'number' || !isFinite(score)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_SCORE,
      message: `Certification score must be a finite number, got: ${score}`,
      path: 'score',
    });
  } else if (score < 0 || score > 100) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_SCORE,
      message: `Certification score must be between 0 and 100, got: ${score}`,
      path: 'score',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_certification_score_validation',
  };
}

// ---------------------------------------------------------------------------
// Validation: CuriosityCertificationReport
// ---------------------------------------------------------------------------

export function validateCuriosityCertificationReport(
  report: CuriosityCertificationReport,
): CuriosityCertificationValidationResult {
  const errors: CuriosityCertificationValidationError[] = [];

  if (!report) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_REPORT,
      message: 'Certification report must be provided',
      path: 'report',
    });
    return {
      valid: false,
      errors,
      checkedAt: 'curiosity_certification_validation',
    };
  }

  if (!report.reportId || report.reportId.length === 0) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_REPORT,
      message: 'Report ID must be non-empty',
      path: 'report.reportId',
    });
  }

  if (!CANONICAL_CURIOSITY_CERTIFICATION_STATUS.includes(report.certificationStatus)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_STATUS,
      message: `Invalid certification status: ${report.certificationStatus}`,
      path: 'report.certificationStatus',
    });
  }

  if (typeof report.certificationScore !== 'number' || !isFinite(report.certificationScore) || report.certificationScore < 0 || report.certificationScore > 100) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_SCORE,
      message: `Invalid certification score: ${report.certificationScore}`,
      path: 'report.certificationScore',
    });
  }

  if (!Array.isArray(report.findings)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Findings must be an array',
      path: 'report.findings',
    });
  }

  if (!Array.isArray(report.dimensions)) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Dimensions must be an array',
      path: 'report.dimensions',
    });
  }

  if (!report.metadata) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_MISSING_METADATA,
      message: 'Certification metadata must be provided',
      path: 'report.metadata',
    });
  }

  if (!report.trace) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE,
      message: 'Certification trace must be provided',
      path: 'report.trace',
    });
  }

  if (report.trace && report.trace.generatedFrom !== 'deterministic_curiosity_certification_engine') {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE,
      message: `Invalid trace generatedFrom: ${report.trace.generatedFrom}`,
      path: 'report.trace.generatedFrom',
    });
  }

  if (report.trace && report.trace.deterministic !== true) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE,
      message: 'Trace must be deterministic',
      path: 'report.trace.deterministic',
    });
  }

  if (report.trace && report.trace.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE,
      message: 'Trace must not indicate random usage',
      path: 'report.trace.randomUsed',
    });
  }

  if (report.trace && report.trace.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_TRACE,
      message: 'Trace must not indicate time dependency',
      path: 'report.trace.timeDependency',
    });
  }

  if (report.deterministic !== true) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Report must be deterministic',
      path: 'report.deterministic',
    });
  }

  if (report.generatedFrom !== 'deterministic_curiosity_certification_engine') {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: `Invalid generatedFrom: ${report.generatedFrom}`,
      path: 'report.generatedFrom',
    });
  }

  if (report.randomUsed !== false) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Report must not indicate random usage',
      path: 'report.randomUsed',
    });
  }

  if (report.timeDependency !== false) {
    errors.push({
      code: CURIOSITY_CERTIFICATION_VALIDATION_CODES.CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION,
      message: 'Report must not indicate time dependency',
      path: 'report.timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_certification_validation',
  };
}
