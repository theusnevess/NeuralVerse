/**
 * D10-OPT-17 — Certification Validation Layer
 *
 * Deterministic validation for certification metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Exactly 10 stable validation codes. Codes must never change.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeCertificationFinding,
  KnowledgeCertificationReport,
  KnowledgeCertificationValidationError,
  KnowledgeCertificationFindingValidationResult,
  KnowledgeCertificationStatusValidationResult,
  KnowledgeCertificationScoreValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS,
  CANONICAL_KNOWLEDGE_FINDING_SEVERITY,
  CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Stable Validation Codes (exactly 10, prefix KNOWLEDGE_CERTIFICATION_)
// ---------------------------------------------------------------------------

export const KNOWLEDGE_CERTIFICATION_VALIDATION_CODES = {
  KNOWLEDGE_CERTIFICATION_INVALID_STATUS: 'KNOWLEDGE_CERTIFICATION_INVALID_STATUS',
  KNOWLEDGE_CERTIFICATION_INVALID_SCORE: 'KNOWLEDGE_CERTIFICATION_INVALID_SCORE',
  KNOWLEDGE_CERTIFICATION_INVALID_FINDING: 'KNOWLEDGE_CERTIFICATION_INVALID_FINDING',
  KNOWLEDGE_CERTIFICATION_INVALID_TRACE: 'KNOWLEDGE_CERTIFICATION_INVALID_TRACE',
  KNOWLEDGE_CERTIFICATION_INVALID_DIMENSION: 'KNOWLEDGE_CERTIFICATION_INVALID_DIMENSION',
  KNOWLEDGE_CERTIFICATION_MISSING_REPORT: 'KNOWLEDGE_CERTIFICATION_MISSING_REPORT',
  KNOWLEDGE_CERTIFICATION_MISSING_FINDING: 'KNOWLEDGE_CERTIFICATION_MISSING_FINDING',
  KNOWLEDGE_CERTIFICATION_MISSING_METADATA: 'KNOWLEDGE_CERTIFICATION_MISSING_METADATA',
  KNOWLEDGE_CERTIFICATION_INVALID_CONFIGURATION: 'KNOWLEDGE_CERTIFICATION_INVALID_CONFIGURATION',
  KNOWLEDGE_CERTIFICATION_INVALID_REPORT: 'KNOWLEDGE_CERTIFICATION_INVALID_REPORT',
} as const;

// ---------------------------------------------------------------------------
// Finding Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeCertificationFinding(
  finding: KnowledgeCertificationFinding,
): KnowledgeCertificationFindingValidationResult {
  const errors: KnowledgeCertificationValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_MISSING_FINDING,
      message: 'Certification finding is missing a finding ID.',
      field: 'findingId',
    });
  }

  if (!CANONICAL_KNOWLEDGE_QUALITY_DIMENSIONS.includes(finding.dimension)) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_DIMENSION,
      message: `Certification finding has unsupported dimension: "${finding.dimension}".`,
      field: 'dimension',
    });
  }

  if (!CANONICAL_KNOWLEDGE_FINDING_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_FINDING,
      message: `Certification finding has unsupported severity: "${finding.severity}".`,
      field: 'severity',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_certification_finding_validation',
  };
}

// ---------------------------------------------------------------------------
// Status Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeCertificationStatus(
  status: string,
): KnowledgeCertificationStatusValidationResult {
  const errors: KnowledgeCertificationValidationError[] = [];

  if (!CANONICAL_KNOWLEDGE_CERTIFICATION_STATUS.includes(status as any)) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_STATUS,
      message: `Certification status has unsupported value: "${status}".`,
      field: 'certificationStatus',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_certification_status_validation',
  };
}

// ---------------------------------------------------------------------------
// Score Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeCertificationScore(
  score: number,
): KnowledgeCertificationScoreValidationResult {
  const errors: KnowledgeCertificationValidationError[] = [];

  if (score < 0 || score > 100) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_SCORE,
      message: `Certification score must be between 0 and 100, got ${score}.`,
      field: 'certificationScore',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_certification_score_validation',
  };
}

// ---------------------------------------------------------------------------
// Report Validation
// ---------------------------------------------------------------------------

export function validateKnowledgeCertificationReport(
  report: KnowledgeCertificationReport,
): { readonly valid: boolean; readonly errors: readonly KnowledgeCertificationValidationError[] } {
  const errors: KnowledgeCertificationValidationError[] = [];

  if (!report.findings) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_MISSING_REPORT,
      message: 'Certification report is missing findings.',
      field: 'findings',
    });
  }

  if (!report.metadata) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_MISSING_METADATA,
      message: 'Certification report is missing metadata.',
      field: 'metadata',
    });
  }

  if (!report.trace) {
    errors.push({
      code: KNOWLEDGE_CERTIFICATION_VALIDATION_CODES.KNOWLEDGE_CERTIFICATION_INVALID_TRACE,
      message: 'Certification report is missing trace.',
      field: 'trace',
    });
  }

  if (report.findings) {
    for (const finding of report.findings) {
      errors.push(...validateKnowledgeCertificationFinding(finding).errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
