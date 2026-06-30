/**
 * NV-1600-D4-OPT-10 — Certification Validation Layer
 *
 * Deterministic validation for certification metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryCompositionFinding,
  LaboratoryCompositionCertificationReport,
  LaboratoryCompositionCertificationInput,
  LaboratoryCompositionCertificationValidationError,
  LaboratoryCompositionCertificationValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_FINDING_SEVERITY,
  CANONICAL_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const CERTIFICATION_VALIDATION_CODES = {
  CERT_INVALID_STATUS: 'CERT_INVALID_STATUS',
  CERT_INVALID_SCORE: 'CERT_INVALID_SCORE',
  CERT_FINDING_NO_SEVERITY: 'CERT_FINDING_NO_SEVERITY',
  CERT_FINDING_NO_DIMENSION: 'CERT_FINDING_NO_DIMENSION',
  CERT_FINDING_NO_CODE: 'CERT_FINDING_NO_CODE',
  CERT_FINDING_NO_MESSAGE: 'CERT_FINDING_NO_MESSAGE',
  CERT_FINDING_NO_RATIONALE: 'CERT_FINDING_NO_RATIONALE',
  CERT_UNKNOWN_DIMENSION: 'CERT_UNKNOWN_DIMENSION',
  CERT_DUPLICATE_FINDING: 'CERT_DUPLICATE_FINDING',
  CERT_INVALID_TRACE: 'CERT_INVALID_TRACE',
  CERT_INVALID_PROVENANCE: 'CERT_INVALID_PROVENANCE',
  CERT_INVALID_REPORT: 'CERT_INVALID_REPORT',
  CERT_MISSING_REPORT_ID: 'CERT_MISSING_REPORT_ID',
  CERT_MISSING_ARTIFACT_ID: 'CERT_MISSING_ARTIFACT_ID',
  CERT_MISSING_SOURCE: 'CERT_MISSING_SOURCE',
  CERT_MISSING_RATIONALE: 'CERT_MISSING_RATIONALE',
  CERT_MISSING_PROVIDED_BY: 'CERT_MISSING_PROVIDED_BY',
  CERT_MISSING_GOVERNANCE_STATUS: 'CERT_MISSING_GOVERNANCE_STATUS',
  CERT_INVALID_SEVERITY: 'CERT_INVALID_SEVERITY',
  CERT_INVALID_GOVERNANCE_STATUS: 'CERT_INVALID_GOVERNANCE_STATUS',
  CERT_EMPTY_FINDINGS: 'CERT_EMPTY_FINDINGS',
  CERT_EMPTY_DIMENSIONS: 'CERT_EMPTY_DIMENSIONS',
  CERT_SCORE_OUT_OF_RANGE: 'CERT_SCORE_OUT_OF_RANGE',
  CERT_INCONSISTENT_COUNTS: 'CERT_INCONSISTENT_COUNTS',
  CERT_BLOCKED_WITHOUT_ERROR: 'CERT_BLOCKED_WITHOUT_ERROR',
  CERT_CERTIFIED_WITH_ERROR: 'CERT_CERTIFIED_WITH_ERROR',
} as const;

// ---------------------------------------------------------------------------
// Single Finding Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single certification finding against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationFinding(
  finding: LaboratoryCompositionFinding,
): readonly LaboratoryCompositionCertificationValidationError[] {
  const errors: LaboratoryCompositionCertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Finding is missing a finding ID.',
      field: 'findingId',
      findingId: finding.findingId,
    });
  }

  if (!finding.severity || finding.severity.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_SEVERITY,
      message: 'Finding is missing a severity.',
      field: 'severity',
      findingId: finding.findingId,
    });
  } else if (!CANONICAL_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SEVERITY,
      message: `Finding has unsupported severity: "${finding.severity}".`,
      field: 'severity',
      findingId: finding.findingId,
    });
  }

  if (!finding.qualityDimension || finding.qualityDimension.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION,
      message: 'Finding is missing a quality dimension.',
      field: 'qualityDimension',
      findingId: finding.findingId,
    });
  } else if (!CANONICAL_QUALITY_DIMENSIONS.includes(finding.qualityDimension)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_UNKNOWN_DIMENSION,
      message: `Finding has unsupported quality dimension: "${finding.qualityDimension}".`,
      field: 'qualityDimension',
      findingId: finding.findingId,
    });
  }

  if (!finding.code || finding.code.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Finding is missing a code.',
      field: 'code',
      findingId: finding.findingId,
    });
  }

  if (!finding.message || finding.message.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_MESSAGE,
      message: 'Finding is missing a message.',
      field: 'message',
      findingId: finding.findingId,
    });
  }

  if (!finding.rationale || finding.rationale.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_RATIONALE,
      message: 'Finding is missing a rationale.',
      field: 'rationale',
      findingId: finding.findingId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(finding.governanceStatus)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_GOVERNANCE_STATUS,
      message: `Finding has invalid governance status: "${finding.governanceStatus}".`,
      field: 'governanceStatus',
      findingId: finding.findingId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a certification report against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationReport(
  report: LaboratoryCompositionCertificationReport,
): readonly LaboratoryCompositionCertificationValidationError[] {
  const errors: LaboratoryCompositionCertificationValidationError[] = [];

  if (!report.certificationId || report.certificationId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
      message: 'Certification report is missing a certification ID.',
      field: 'certificationId',
      certificationId: report.certificationId,
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
      message: 'Certification report is missing an artifact ID.',
      field: 'artifactId',
      certificationId: report.certificationId,
    });
  }

  if (!CANONICAL_CERTIFICATION_STATUS.includes(report.certificationStatus)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: `Certification report has unsupported status: "${report.certificationStatus}".`,
      field: 'certificationStatus',
      certificationId: report.certificationId,
    });
  }

  if (typeof report.qualityScore !== 'number' || report.qualityScore < 0 || report.qualityScore > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_SCORE_OUT_OF_RANGE,
      message: `Certification report has invalid quality score: ${report.qualityScore}.`,
      field: 'qualityScore',
      certificationId: report.certificationId,
    });
  }

  if (!report.findings || report.findings.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_FINDINGS,
      message: 'Certification report has no findings.',
      field: 'findings',
      certificationId: report.certificationId,
    });
  } else {
    // Check for duplicate finding IDs
    const seenFindingIds = new Set<string>();
    for (const finding of report.findings) {
      if (seenFindingIds.has(finding.findingId)) {
        errors.push({
          code: CERTIFICATION_VALIDATION_CODES.CERT_DUPLICATE_FINDING,
          message: `Duplicate finding ID: "${finding.findingId}".`,
          field: 'findingId',
          certificationId: report.certificationId,
          findingId: finding.findingId,
        });
      }
      seenFindingIds.add(finding.findingId);
    }

    // Validate each finding
    for (const finding of report.findings) {
      errors.push(...validateCertificationFinding(finding));
    }
  }

  if (!report.dimensionsChecked || report.dimensionsChecked.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_DIMENSIONS,
      message: 'Certification report has no dimensions checked.',
      field: 'dimensionsChecked',
      certificationId: report.certificationId,
    });
  }

  if (report.deterministic !== true) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare deterministic: true.',
      field: 'deterministic',
      certificationId: report.certificationId,
    });
  }

  if (report.randomUsed !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare randomUsed: false.',
      field: 'randomUsed',
      certificationId: report.certificationId,
    });
  }

  if (report.timeDependency !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare timeDependency: false.',
      field: 'timeDependency',
      certificationId: report.certificationId,
    });
  }

  if (!report.provenance) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_PROVENANCE,
      message: 'Certification report is missing provenance.',
      field: 'provenance',
      certificationId: report.certificationId,
    });
  } else {
    if (!report.provenance.source || report.provenance.source.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_SOURCE,
        message: 'Certification provenance is missing a source.',
        field: 'provenance.source',
        certificationId: report.certificationId,
      });
    }

    if (!report.provenance.rationale || report.provenance.rationale.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_RATIONALE,
        message: 'Certification provenance is missing a rationale.',
        field: 'provenance.rationale',
        certificationId: report.certificationId,
      });
    }

    if (!report.provenance.providedBy || report.provenance.providedBy.trim() === '') {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_PROVIDED_BY,
        message: 'Certification provenance is missing providedBy.',
        field: 'provenance.providedBy',
        certificationId: report.certificationId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates certification input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationInput(
  input: LaboratoryCompositionCertificationInput,
): LaboratoryCompositionCertificationValidationResult {
  const errors: LaboratoryCompositionCertificationValidationError[] = [];

  if (!input.certificationId || input.certificationId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
      message: 'Certification input is missing a certification ID.',
      field: 'certificationId',
    });
  }

  if (!input.artifactId || input.artifactId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
      message: 'Certification input is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!input.findings || input.findings.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_FINDINGS,
      message: 'Certification input has no findings.',
      field: 'findings',
    });
  } else {
    for (const finding of input.findings) {
      errors.push(...validateCertificationFinding(finding));
    }
  }

  if (!input.dimensionsChecked || input.dimensionsChecked.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_DIMENSIONS,
      message: 'Certification input has no dimensions checked.',
      field: 'dimensionsChecked',
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(input.governanceStatus)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_GOVERNANCE_STATUS,
      message: `Certification input has invalid governance status: "${input.governanceStatus}".`,
      field: 'governanceStatus',
    });
  }

  if (!input.provenance) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_PROVENANCE,
      message: 'Certification input is missing provenance.',
      field: 'provenance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'certification_composition',
  };
}
