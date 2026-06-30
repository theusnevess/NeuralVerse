/**
 * NV-1500-D3-OPT-09 — Curriculum Certification & Structural Quality Gate Validation Layer
 *
 * Deterministic validation for curriculum certification and quality gate structures.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CurriculumCompositionFinding,
  CurriculumCompositionCertificationReport,
  CurriculumCompositionCertificationInput,
  CurriculumCompositionCertificationValidationError,
  CurriculumCompositionCertificationValidationResult,
} from './CurriculumAgentContract.ts';

import {
  CANONICAL_CURRICULUM_CERTIFICATION_STATUS,
  CANONICAL_CURRICULUM_FINDING_SEVERITY,
  CANONICAL_CURRICULUM_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './CurriculumAgentContract.ts';

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
  CERT_BLOCKED_WITHOUT_ERROR: 'CERT_BLOCKED_WITHOUT_ERROR',
  CERT_CERTIFIED_WITH_ERROR: 'CERT_CERTIFIED_WITH_ERROR',
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
} as const;

// ---------------------------------------------------------------------------
// Certification Finding Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single curriculum composition finding against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationFinding(
  finding: CurriculumCompositionFinding,
): readonly CurriculumCompositionCertificationValidationError[] {
  const errors: CurriculumCompositionCertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Certification finding is missing a finding ID.',
      field: 'findingId',
      findingId: finding.findingId,
    });
  }

  if (!finding.severity || !CANONICAL_CURRICULUM_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_SEVERITY,
      message: `Certification finding has invalid severity: "${finding.severity}".`,
      field: 'severity',
      findingId: finding.findingId,
    });
  }

  if (!finding.dimension || !CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.includes(finding.dimension)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_DIMENSION,
      message: `Certification finding has invalid dimension: "${finding.dimension}".`,
      field: 'dimension',
      findingId: finding.findingId,
    });
  }

  if (!finding.code || finding.code.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_CODE,
      message: 'Certification finding is missing a code.',
      field: 'code',
      findingId: finding.findingId,
    });
  }

  if (!finding.message || finding.message.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_MESSAGE,
      message: 'Certification finding is missing a message.',
      field: 'message',
      findingId: finding.findingId,
    });
  }

  if (!finding.rationale || finding.rationale.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_FINDING_NO_RATIONALE,
      message: 'Certification finding is missing a rationale.',
      field: 'rationale',
      findingId: finding.findingId,
    });
  }

  if (!finding.source || finding.source.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_SOURCE,
      message: 'Certification finding is missing a source.',
      field: 'source',
      findingId: finding.findingId,
    });
  }

  if (!finding.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(finding.governanceStatus)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_GOVERNANCE_STATUS,
      message: `Certification finding has invalid governance status: "${finding.governanceStatus}".`,
      field: 'governanceStatus',
      findingId: finding.findingId,
    });
  }

  if (!finding.providedBy || finding.providedBy.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_PROVIDED_BY,
      message: 'Certification finding is missing a providedBy.',
      field: 'providedBy',
      findingId: finding.findingId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Certification Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a curriculum composition certification report against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationReport(
  report: CurriculumCompositionCertificationReport,
): CurriculumCompositionCertificationValidationResult {
  const errors: CurriculumCompositionCertificationValidationError[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
      message: 'Certification report is missing a report ID.',
      field: 'reportId',
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
      message: 'Certification report is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!CANONICAL_CURRICULUM_CERTIFICATION_STATUS.includes(report.status)) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_STATUS,
      message: `Certification report has invalid status: "${report.status}".`,
      field: 'status',
    });
  }

  // Validate each finding
  const seenFindingIds = new Set<string>();
  for (const finding of report.findings) {
    errors.push(...validateCertificationFinding(finding));

    // Duplicate finding check
    if (seenFindingIds.has(finding.findingId)) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_DUPLICATE_FINDING,
        message: `Duplicate finding ID: "${finding.findingId}".`,
        findingId: finding.findingId,
      });
    }
    seenFindingIds.add(finding.findingId);
  }

  // Score validation
  if (report.qualityScore < 0 || report.qualityScore > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
      message: `Certification report has invalid quality score: ${report.qualityScore}. Must be between 0 and 100.`,
      field: 'qualityScore',
    });
  }

  // Dimensions check
  if (!report.dimensionsChecked || report.dimensionsChecked.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_DIMENSIONS,
      message: 'Certification report has no dimensions checked.',
      field: 'dimensionsChecked',
    });
  }

  // Business rule: Blocked status must have errors
  if (report.status === 'blocked' && report.errorCount === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_BLOCKED_WITHOUT_ERROR,
      message: 'Certification report is blocked but has no errors.',
      field: 'status',
    });
  }

  // Business rule: Certified status must not have errors
  if (report.status === 'certified' && report.errorCount > 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_CERTIFIED_WITH_ERROR,
      message: 'Certification report is certified but has errors.',
      field: 'status',
    });
  }

  // Deterministic metadata check
  if (report.deterministic !== true) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (report.randomUsed !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (report.timeDependency !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  if (report.curriculumMutated !== false) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_TRACE,
      message: 'Certification report must declare curriculumMutated: false.',
      field: 'curriculumMutated',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curriculum_certification_structural_quality_gate',
  };
}

// ---------------------------------------------------------------------------
// Certification Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates curriculum certification input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateCertificationInput(
  input: CurriculumCompositionCertificationInput,
): readonly CurriculumCompositionCertificationValidationError[] {
  const errors: CurriculumCompositionCertificationValidationError[] = [];

  if (!input.reportId || input.reportId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_REPORT_ID,
      message: 'Certification input is missing a report ID.',
      field: 'reportId',
    });
  }

  if (!input.artifactId || input.artifactId.trim() === '') {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_MISSING_ARTIFACT_ID,
      message: 'Certification input is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  // Validate findings
  if (!input.findings || input.findings.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_FINDINGS,
      message: 'Certification input has no findings.',
      field: 'findings',
    });
  } else {
    const seenFindingIds = new Set<string>();
    for (const finding of input.findings) {
      errors.push(...validateCertificationFinding(finding));

      if (seenFindingIds.has(finding.findingId)) {
        errors.push({
          code: CERTIFICATION_VALIDATION_CODES.CERT_DUPLICATE_FINDING,
          message: `Duplicate finding ID: "${finding.findingId}".`,
          findingId: finding.findingId,
        });
      }
      seenFindingIds.add(finding.findingId);
    }
  }

  // Score validation
  if (input.qualityScore < 0 || input.qualityScore > 100) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_INVALID_SCORE,
      message: `Certification input has invalid quality score: ${input.qualityScore}. Must be between 0 and 100.`,
      field: 'qualityScore',
    });
  }

  // Dimensions check
  if (!input.dimensionsChecked || input.dimensionsChecked.length === 0) {
    errors.push({
      code: CERTIFICATION_VALIDATION_CODES.CERT_EMPTY_DIMENSIONS,
      message: 'Certification input has no dimensions checked.',
      field: 'dimensionsChecked',
    });
  }

  // Validate dimensions
  for (const dimension of input.dimensionsChecked) {
    if (!CANONICAL_CURRICULUM_QUALITY_DIMENSIONS.includes(dimension)) {
      errors.push({
        code: CERTIFICATION_VALIDATION_CODES.CERT_UNKNOWN_DIMENSION,
        message: `Certification input has unknown dimension: "${dimension}".`,
        field: 'dimensionsChecked',
      });
    }
  }

  return errors;
}
