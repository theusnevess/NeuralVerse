/**
 * NV-1900-D7-OPT-13 — Application Certification Validation Layer
 *
 * Deterministic validation for certification metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  ApplicationCertificationReport,
  ApplicationCertificationFinding,
  ApplicationCertificationValidationError,
  ApplicationCertificationValidationResult,
} from './ApplicationAgentContract.ts';

import {
  CANONICAL_APPLICATION_CERTIFICATION_STATUS,
  CANONICAL_APPLICATION_FINDING_SEVERITY,
  CANONICAL_APPLICATION_QUALITY_DIMENSIONS,
} from './ApplicationAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CERTIFICATION_VALIDATION_CODES = {
  CERTIFICATION_INVALID_STATUS: 'CERTIFICATION_INVALID_STATUS',
  CERTIFICATION_INVALID_SCORE: 'CERTIFICATION_INVALID_SCORE',
  CERTIFICATION_DUPLICATE_FINDING: 'CERTIFICATION_DUPLICATE_FINDING',
  CERTIFICATION_INVALID_DIMENSION: 'CERTIFICATION_INVALID_DIMENSION',
  CERTIFICATION_INVALID_SEVERITY: 'CERTIFICATION_INVALID_SEVERITY',
  CERTIFICATION_EMPTY_REPORT: 'CERTIFICATION_EMPTY_REPORT',
  CERTIFICATION_MISSING_TRACE: 'CERTIFICATION_MISSING_TRACE',
  CERTIFICATION_MISSING_FINDINGS: 'CERTIFICATION_MISSING_FINDINGS',
  CERTIFICATION_REGISTRY_INCONSISTENCY: 'CERTIFICATION_REGISTRY_INCONSISTENCY',
  CERTIFICATION_INVALID_REPORT: 'CERTIFICATION_INVALID_REPORT',
} as const;

// ---------------------------------------------------------------------------
// Certification Finding Validation
// ---------------------------------------------------------------------------

export function validateCertificationFinding(
  finding: ApplicationCertificationFinding,
): readonly ApplicationCertificationValidationError[] {
  const errors: ApplicationCertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_FINDING,
      message: 'Certification finding is missing a finding ID.',
      field: 'findingId',
    });
  }

  if (!CANONICAL_APPLICATION_QUALITY_DIMENSIONS.includes(finding.dimension)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_DIMENSION,
      message: `Certification finding has invalid dimension: "${finding.dimension}".`,
      field: 'dimension',
    });
  }

  if (!CANONICAL_APPLICATION_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SEVERITY,
      message: `Certification finding has invalid severity: "${finding.severity}".`,
      field: 'severity',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Status Validation
// ---------------------------------------------------------------------------

export function validateCertificationStatus(
  status: string,
): readonly ApplicationCertificationValidationError[] {
  const errors: ApplicationCertificationValidationError[] = [];

  if (!CANONICAL_APPLICATION_CERTIFICATION_STATUS.includes(status as any)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_STATUS,
      message: `Invalid certification status: "${status}".`,
      field: 'status',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Score Validation
// ---------------------------------------------------------------------------

export function validateCertificationScore(
  score: number,
): readonly ApplicationCertificationValidationError[] {
  const errors: ApplicationCertificationValidationError[] = [];

  if (typeof score !== 'number' || score < 0 || score > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SCORE,
      message: `Invalid certification score: ${score}.`,
      field: 'score',
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Report Validation
// ---------------------------------------------------------------------------

export function validateCertificationReport(
  report: ApplicationCertificationReport,
): ApplicationCertificationValidationResult {
  const errors: ApplicationCertificationValidationError[] = [];

  if (!report.certificationId || report.certificationId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_EMPTY_REPORT,
      message: 'Certification report is missing a certification ID.',
      field: 'certificationId',
    });
  }

  if (!CANONICAL_APPLICATION_CERTIFICATION_STATUS.includes(report.status)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_STATUS,
      message: `Certification report has invalid status: "${report.status}".`,
      field: 'status',
    });
  }

  if (report.score < 0 || report.score > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_INVALID_SCORE,
      message: `Certification report has invalid score: ${report.score}.`,
      field: 'score',
    });
  }

  if (report.findings.length === 0 && report.status !== 'certified') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_MISSING_FINDINGS,
      message: 'Certification report has no findings but is not certified.',
      field: 'findings',
    });
  }

  // Check for duplicate finding IDs
  const seenFindingIds = new Set<string>();
  for (const finding of report.findings) {
    if (seenFindingIds.has(finding.findingId)) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERTIFICATION_DUPLICATE_FINDING,
        message: `Duplicate finding ID: "${finding.findingId}".`,
        field: 'findings',
      });
    }
    seenFindingIds.add(finding.findingId);
  }

  // Validate each finding
  for (const finding of report.findings) {
    errors.push(...validateCertificationFinding(finding));
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
