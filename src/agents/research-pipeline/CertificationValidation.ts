/**
 * NV-1400-D2-OPT-11 — Certification Validation Layer
 *
 * Deterministic validation for research composition certification.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ResearchCompositionCertificationReport,
  ResearchCompositionCertificationInput,
  ResearchCompositionCertificationValidationError,
  ResearchCompositionCertificationValidationResult,
  ResearchCompositionFinding,
} from './ResearchAgentContract.ts';

import {
  CANONICAL_CERTIFICATION_STATUSES,
  CANONICAL_FINDING_SEVERITIES,
  CANONICAL_QUALITY_DIMENSIONS,
} from './ResearchAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CERTIFICATION_VALIDATION_CODES = {
  CERT_INVALID_STATUS: 'CERT_INVALID_STATUS',
  CERT_FINDING_NO_SEVERITY: 'CERT_FINDING_NO_SEVERITY',
  CERT_FINDING_NO_DIMENSION: 'CERT_FINDING_NO_DIMENSION',
  CERT_FINDING_NO_CODE: 'CERT_FINDING_NO_CODE',
  CERT_FINDING_NO_MESSAGE: 'CERT_FINDING_NO_MESSAGE',
  CERT_FINDING_NO_RATIONALE: 'CERT_FINDING_NO_RATIONALE',
  CERT_INVALID_SCORE: 'CERT_INVALID_SCORE',
  CERT_BLOCKED_WITHOUT_ERROR: 'CERT_BLOCKED_WITHOUT_ERROR',
  CERT_CERTIFIED_WITH_ERROR: 'CERT_CERTIFIED_WITH_ERROR',
} as const;

// ---------------------------------------------------------------------------
// Finding Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single certification finding.
 * Pure function. No side effects.
 */
export function validateCertificationFinding(
  finding: ResearchCompositionFinding,
): readonly ResearchCompositionCertificationValidationError[] {
  const errors: ResearchCompositionCertificationValidationError[] = [];

  if (!finding.code || finding.code.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Certification finding is missing a code.',
      field: 'code',
    });
  }

  if (!finding.message || finding.message.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_MESSAGE,
      message: 'Certification finding is missing a message.',
      field: 'message',
    });
  }

  if (!finding.severity || !CANONICAL_FINDING_SEVERITIES.includes(finding.severity)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_SEVERITY,
      message: `Certification finding has invalid severity: "${finding.severity}".`,
      field: 'severity',
    });
  }

  if (!finding.qualityDimension || !CANONICAL_QUALITY_DIMENSIONS.includes(finding.qualityDimension)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION,
      message: `Certification finding has invalid quality dimension: "${finding.qualityDimension}".`,
      field: 'qualityDimension',
    });
  }

  if (!finding.rationale || finding.rationale.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_RATIONALE,
      message: 'Certification finding is missing a rationale.',
      field: 'rationale',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification report for structural integrity.
 * Pure function. No side effects.
 */
export function validateCertificationReport(
  report: ResearchCompositionCertificationReport,
): readonly ResearchCompositionCertificationValidationError[] {
  const errors: ResearchCompositionCertificationValidationError[] = [];

  if (!report.certificationId || report.certificationId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification report is missing a certification ID.',
      field: 'certificationId',
    });
  }

  // Validate status
  if (!report.status || !CANONICAL_CERTIFICATION_STATUSES.includes(report.status)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: `Certification report has invalid status: "${report.status}".`,
      field: 'status',
    });
  }

  // Validate findings
  if (!report.findings) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Certification report is missing findings.',
      field: 'findings',
    });
  } else {
    for (const finding of report.findings) {
      errors.push(...validateCertificationFinding(finding));
    }
  }

  // Validate quality score
  if (typeof report.qualityScore !== 'number' || report.qualityScore < 0 || report.qualityScore > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
      message: `Certification report has invalid quality score: ${report.qualityScore}.`,
      field: 'qualityScore',
    });
  }

  // Validate dimensions checked
  if (!report.dimensionsChecked || report.dimensionsChecked.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION,
      message: 'Certification report has no dimensions checked.',
      field: 'dimensionsChecked',
    });
  }

  // Validate status consistency
  if (report.status === 'blocked' && report.findings) {
    const hasErrors = report.findings.some((f) => f.severity === 'error');
    if (!hasErrors) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_BLOCKED_WITHOUT_ERROR,
        message: 'Certification report is blocked but has no error findings.',
        field: 'status',
      });
    }
  }

  if (report.status === 'certified' && report.findings) {
    const hasErrors = report.findings.some((f) => f.severity === 'error');
    if (hasErrors) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_CERTIFIED_WITH_ERROR,
        message: 'Certification report is certified but has error findings.',
        field: 'status',
      });
    }
  }

  // Validate trace metadata
  if (report.deterministic !== true) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification report must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (report.randomUsed !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification report must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (report.timeDependency !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification report must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates research composition certification input.
 * Pure function. No side effects.
 */
export function validateCertificationInput(
  input: ResearchCompositionCertificationInput,
): readonly ResearchCompositionCertificationValidationError[] {
  const errors: ResearchCompositionCertificationValidationError[] = [];

  if (!input.conceptId || input.conceptId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification input is missing concept ID.',
      field: 'conceptId',
    });
  }

  if (!input.conceptLabel || input.conceptLabel.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: 'Certification input is missing concept label.',
      field: 'conceptLabel',
    });
  }

  return errors;
}
