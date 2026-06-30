/**
 * NV-1600-D4-OPT-10 — Laboratory Certification & Structural Quality Gate
 *
 * Deterministic certification engine for laboratory metadata.
 * Determines whether a laboratory artifact is structurally valid according to the canonical architecture.
 *
 * This module never:
 * - Executes laboratories
 * - Certifies educational quality
 * - Validates runtime behavior
 * - Evaluates learner performance
 * - Repairs artifacts
 * - Mutates artifacts
 * - Executes artifacts
 * - Infers metadata
 * - Creates findings automatically
 * - Performs analytics
 * - Performs persistence
 * - Performs synchronization
 * - Performs networking
 * - Calls LLMs
 * - Calls external APIs
 * - Creates runtime state
 *
 * Certification metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryCompositionFinding,
  LaboratoryCompositionCertificationReport,
  LaboratoryCompositionCertificationInput,
  LaboratoryCompositionCertificationProvenance,
  LaboratoryCompositionCertificationStatus,
  LaboratoryCompositionFindingSeverity,
  LaboratoryCompositionQualityDimension,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_CERTIFICATION_STATUS,
  CANONICAL_FINDING_SEVERITY,
  CANONICAL_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Blocking Dimensions
// ---------------------------------------------------------------------------

const BLOCKING_DIMENSIONS: readonly LaboratoryCompositionQualityDimension[] = [
  'registry_integrity',
  'execution_integrity',
  'experiment_integrity',
  'determinism',
  'architectural_boundary',
  'validation_integrity',
];

// ---------------------------------------------------------------------------
// Penalty Values
// ---------------------------------------------------------------------------

const ERROR_PENALTY = 20;
const WARNING_PENALTY = 5;
const RECOMMENDATION_PENALTY = 1;

// ---------------------------------------------------------------------------
// Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeCertificationFinding(params: {
  readonly findingId: string;
  readonly severity: LaboratoryCompositionFindingSeverity;
  readonly qualityDimension: LaboratoryCompositionQualityDimension;
  readonly code: string;
  readonly message: string;
  readonly rationale: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
}): LaboratoryCompositionFinding {
  return {
    findingId: params.findingId,
    severity: params.severity,
    qualityDimension: params.qualityDimension,
    code: params.code,
    message: params.message,
    rationale: params.rationale,
    governanceStatus: params.governanceStatus,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator for Findings
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for findings.
 * Sorts by severity, then qualityDimension, then findingId.
 * Pure function. No side effects.
 */
function _compareFindings(
  a: LaboratoryCompositionFinding,
  b: LaboratoryCompositionFinding,
): number {
  const severityOrder: Record<string, number> = { error: 0, warning: 1, recommendation: 2 };
  const aSeverity = severityOrder[a.severity] ?? 3;
  const bSeverity = severityOrder[b.severity] ?? 3;

  if (aSeverity < bSeverity) return -1;
  if (aSeverity > bSeverity) return 1;

  if (a.qualityDimension < b.qualityDimension) return -1;
  if (a.qualityDimension > b.qualityDimension) return 1;

  if (a.findingId < b.findingId) return -1;
  if (a.findingId > b.findingId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Quality Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the quality score from findings.
 * Pure function. No side effects.
 * Range: 0..100
 */
function _calculateQualityScore(findings: readonly LaboratoryCompositionFinding[]): number {
  let score = 100;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'error':
        score -= ERROR_PENALTY;
        break;
      case 'warning':
        score -= WARNING_PENALTY;
        break;
      case 'recommendation':
        score -= RECOMMENDATION_PENALTY;
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Certification Status Resolution
// ---------------------------------------------------------------------------

/**
 * Resolves the certification status from findings.
 * Pure function. No side effects.
 */
function _resolveCertificationStatus(
  findings: readonly LaboratoryCompositionFinding[],
): LaboratoryCompositionCertificationStatus {
  const hasErrors = findings.some((f) => f.severity === 'error');
  const hasBlockingErrors = findings.some(
    (f) => f.severity === 'error' && BLOCKING_DIMENSIONS.includes(f.qualityDimension),
  );

  if (hasBlockingErrors) {
    return 'blocked';
  }

  if (hasErrors) {
    return 'needs_revision';
  }

  const hasWarnings = findings.some((f) => f.severity === 'warning');
  if (hasWarnings) {
    return 'certified_with_warnings';
  }

  return 'certified';
}

// ---------------------------------------------------------------------------
// Certification Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from provided parameters.
 * Pure function. No side effects.
 */
export function composeCertificationReport(params: {
  readonly certificationId: string;
  readonly artifactId: string;
  readonly findings: readonly LaboratoryCompositionFinding[];
  readonly dimensionsChecked: readonly LaboratoryCompositionQualityDimension[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryCompositionCertificationProvenance;
}): LaboratoryCompositionCertificationReport {
  const sortedFindings = [...params.findings].sort(_compareFindings);
  const certificationStatus = _resolveCertificationStatus(sortedFindings);
  const qualityScore = _calculateQualityScore(sortedFindings);

  return {
    certificationId: params.certificationId,
    artifactId: params.artifactId,
    certificationStatus,
    qualityScore,
    findings: sortedFindings,
    findingCount: sortedFindings.length,
    errorCount: sortedFindings.filter((f) => f.severity === 'error').length,
    warningCount: sortedFindings.filter((f) => f.severity === 'warning').length,
    recommendationCount: sortedFindings.filter((f) => f.severity === 'recommendation').length,
    dimensionsChecked: [...params.dimensionsChecked],
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
    deterministic: true,
    generatedFrom: 'deterministic_certification_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Certification Report From Params (Convenience)
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from minimal parameters.
 * Pure function. No side effects.
 */
export function composeCertificationReportFromParams(params: {
  readonly certificationId: string;
  readonly artifactId: string;
  readonly findings: readonly LaboratoryCompositionFinding[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: LaboratoryCompositionCertificationProvenance;
}): LaboratoryCompositionCertificationReport {
  const dimensionsChecked = [...new Set(params.findings.map((f) => f.qualityDimension))];

  return composeCertificationReport({
    certificationId: params.certificationId,
    artifactId: params.artifactId,
    findings: params.findings,
    dimensionsChecked,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  });
}

// ---------------------------------------------------------------------------
// Main Certification Function
// ---------------------------------------------------------------------------

/**
 * Certifies a laboratory composition from an input.
 * Pure function. No side effects.
 */
export function certifyLaboratoryComposition(
  input: LaboratoryCompositionCertificationInput,
): LaboratoryCompositionCertificationReport {
  return composeCertificationReport({
    certificationId: input.certificationId,
    artifactId: input.artifactId,
    findings: input.findings,
    dimensionsChecked: input.dimensionsChecked,
    governanceStatus: input.governanceStatus,
    provenance: input.provenance,
  });
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported certification status.
 */
export function isSupportedCertificationStatus(
  status: string,
): status is LaboratoryCompositionCertificationStatus {
  return CANONICAL_CERTIFICATION_STATUS.includes(status as LaboratoryCompositionCertificationStatus);
}

/**
 * Checks if a string is a supported finding severity.
 */
export function isSupportedFindingSeverity(
  severity: string,
): severity is LaboratoryCompositionFindingSeverity {
  return CANONICAL_FINDING_SEVERITY.includes(severity as LaboratoryCompositionFindingSeverity);
}

/**
 * Checks if a string is a supported quality dimension.
 */
export function isSupportedQualityDimension(
  dimension: string,
): dimension is LaboratoryCompositionQualityDimension {
  return CANONICAL_QUALITY_DIMENSIONS.includes(dimension as LaboratoryCompositionQualityDimension);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedCertificationGovernanceStatus(
  governanceStatus: string,
): governanceStatus is LaboratoryGovernanceStatus {
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as LaboratoryGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical certification statuses.
 */
export function getCanonicalCertificationStatuses(): readonly LaboratoryCompositionCertificationStatus[] {
  return CANONICAL_CERTIFICATION_STATUS;
}

/**
 * Returns the canonical finding severities.
 */
export function getCanonicalFindingSeverities(): readonly LaboratoryCompositionFindingSeverity[] {
  return CANONICAL_FINDING_SEVERITY;
}

/**
 * Returns the canonical quality dimensions.
 */
export function getCanonicalQualityDimensions(): readonly LaboratoryCompositionQualityDimension[] {
  return CANONICAL_QUALITY_DIMENSIONS;
}
