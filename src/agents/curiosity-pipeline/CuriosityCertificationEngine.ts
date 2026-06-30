/**
 * NV-2100-D9-OPT-15 — Curiosity Certification & Structural Quality Gate
 *
 * Deterministic orchestration functions for curiosity certification metadata.
 * Produces certification findings, reports, traces, and metadata.
 *
 * This module never:
 * - Performs runtime certification
 * - Publishes artifacts
 * - Moderate content
 * - Repair artifacts
 * - Generate content
 * - Infer humor
 * - Execute certifications
 * - Accesses filesystem
 * - Performs network requests
 * - Calls external APIs
 *
 * Structural certification metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CuriosityCertificationFinding,
  CuriosityCertificationTrace,
  CuriosityCertificationReport,
  CuriosityCertificationMetadata,
  CuriosityCertificationStatus,
  CuriosityCertificationValidationError,
  CuriosityCertificationValidationResult,
  CuriosityFindingSeverity,
  CuriosityQualityDimension,
} from './CuriosityAgentContract.ts';

import {
  CANONICAL_CURIOSITY_CERTIFICATION_STATUS,
  CANONICAL_CURIOSITY_FINDING_SEVERITY,
  CANONICAL_CURIOSITY_QUALITY_DIMENSIONS,
} from './CuriosityAgentContract.ts';

// ---------------------------------------------------------------------------
// Curiosity Certification Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityCertificationFinding(params: {
  readonly findingId: string;
  readonly dimension: CuriosityQualityDimension;
  readonly severity: CuriosityFindingSeverity;
  readonly message: string;
  readonly details: string;
  readonly timestamp: string;
}): CuriosityCertificationFinding {
  return {
    findingId: params.findingId,
    dimension: params.dimension,
    severity: params.severity,
    message: params.message,
    details: params.details,
    timestamp: params.timestamp,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Certification Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification trace from provided parameters.
 * Pure function. No side effects.
 */
export function composeCuriosityCertificationTrace(params: {
  readonly traceId?: string;
} = {}): CuriosityCertificationTrace {
  return {
    traceId: params.traceId || '_certification_trace_default',
    generatedFrom: 'deterministic_curiosity_certification_engine',
    deterministic: true,
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Certification Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes certification metadata from findings and dimensions.
 * Pure function. No side effects.
 */
export function composeCuriosityCertificationMetadata(
  findings: readonly CuriosityCertificationFinding[],
  dimensions: readonly CuriosityQualityDimension[],
): CuriosityCertificationMetadata {
  const totalFindings = findings.length;
  const criticalFindings = findings.filter((f) => f.severity === 'critical').length;
  const highFindings = findings.filter((f) => f.severity === 'high').length;
  const mediumFindings = findings.filter((f) => f.severity === 'medium').length;
  const lowFindings = findings.filter((f) => f.severity === 'low').length;
  const infoFindings = findings.filter((f) => f.severity === 'info').length;

  const failedDimensions = new Set(findings.filter((f) => f.severity === 'critical' || f.severity === 'high').map((f) => f.dimension)).size;
  const warningDimensions = new Set(findings.filter((f) => f.severity === 'medium' || f.severity === 'low').map((f) => f.dimension)).size;
  const certifiedDimensions = dimensions.length - failedDimensions - warningDimensions;

  return {
    totalDimensions: dimensions.length,
    certifiedDimensions: Math.max(0, certifiedDimensions),
    warningDimensions,
    failedDimensions,
    totalFindings,
    criticalFindings,
    highFindings,
    mediumFindings,
    lowFindings,
    infoFindings,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Certification Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates the certification score from findings and dimensions.
 * Pure function. No side effects.
 *
 * Score formula:
 * - Start at 100
 * - Critical finding: -15 points each
 * - High finding: -10 points each
 * - Medium finding: -5 points each
 * - Low finding: -2 points each
 * - Info finding: 0 points
 * - Minimum score: 0
 * - Maximum score: 100
 */
export function calculateCuriosityCertificationScore(
  findings: readonly CuriosityCertificationFinding[],
  _dimensions: readonly CuriosityQualityDimension[],
): number {
  let score = 100;

  for (const finding of findings) {
    switch (finding.severity) {
      case 'critical':
        score -= 15;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
      case 'info':
        break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ---------------------------------------------------------------------------
// Curiosity Certification Status Determination
// ---------------------------------------------------------------------------

/**
 * Determines certification status from score and findings.
 * Pure function. No side effects.
 */
export function determineCuriosityCertificationStatus(
  score: number,
  findings: readonly CuriosityCertificationFinding[],
): CuriosityCertificationStatus {
  const hasCritical = findings.some((f) => f.severity === 'critical');
  const hasHigh = findings.some((f) => f.severity === 'high');
  const hasMedium = findings.some((f) => f.severity === 'medium');

  if (findings.length === 0) {
    return 'passed';
  }

  if (hasCritical) {
    return 'failed';
  }

  if (score < 50) {
    return 'failed';
  }

  if (hasHigh || hasMedium) {
    return 'passed_with_warnings';
  }

  if (score >= 80) {
    return 'passed';
  }

  if (score >= 60) {
    return 'passed_with_warnings';
  }

  return 'incomplete';
}

// ---------------------------------------------------------------------------
// Curiosity Certification Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from findings and dimensions.
 * Pure function. No side effects.
 */
export function composeCuriosityCertificationReport(params: {
  readonly reportId: string;
  readonly findings: readonly CuriosityCertificationFinding[];
  readonly dimensions: readonly CuriosityQualityDimension[];
}): CuriosityCertificationReport {
  const score = calculateCuriosityCertificationScore(params.findings, params.dimensions);
  const status = determineCuriosityCertificationStatus(score, params.findings);
  const metadata = composeCuriosityCertificationMetadata(params.findings, params.dimensions);
  const trace = composeCuriosityCertificationTrace();

  return {
    reportId: params.reportId,
    certificationStatus: status,
    certificationScore: score,
    findings: [...params.findings],
    dimensions: [...params.dimensions],
    metadata,
    trace,
    deterministic: true,
    generatedFrom: 'deterministic_curiosity_certification_engine',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Curiosity Certification: isSuccessful
// ---------------------------------------------------------------------------

/**
 * Determines whether a certification report indicates success.
 * Pure function. No side effects.
 */
export function isCuriosityCertificationSuccessful(
  report: CuriosityCertificationReport,
): boolean {
  return report.certificationStatus === 'passed' || report.certificationStatus === 'passed_with_warnings';
}

// ---------------------------------------------------------------------------
// Curiosity Artifact Certification
// ---------------------------------------------------------------------------

/**
 * Certifies a curiosity artifact against all 22 architectural dimensions.
 * Produces a deterministic certification report.
 * Pure function. No side effects.
 */
export function certifyCuriosityArtifact(params: {
  readonly reportId: string;
  readonly hasRegistry: boolean;
  readonly hasPurpose: boolean;
  readonly hasHumor: boolean;
  readonly hasCulturalReference: boolean;
  readonly hasCards: boolean;
  readonly hasKnowledgeEvolution: boolean;
  readonly hasDiscoveries: boolean;
  readonly hasLaboratoryCuriosity: boolean;
  readonly hasMisconceptions: boolean;
  readonly hasPresentation: boolean;
  readonly hasPreferences: boolean;
  readonly hasGovernance: boolean;
  readonly hasStorage: boolean;
  readonly hasSafety: boolean;
  readonly hasTraceability: boolean;
  readonly hasMetadata: boolean;
  readonly hasValidation: boolean;
  readonly hasDeterminism: boolean;
  readonly hasImmutability: boolean;
  readonly hasDocumentation: boolean;
  readonly hasCrossAgentBoundary: boolean;
  readonly hasPublicApi: boolean;
}): CuriosityCertificationReport {
  const dimensions: CuriosityQualityDimension[] = [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS];
  const findings: CuriosityCertificationFinding[] = [];
  let findingCounter = 0;

  const checks: Array<{
    dimension: CuriosityQualityDimension;
    has: boolean;
    missingMessage: string;
    missingDetails: string;
  }> = [
    { dimension: 'registry', has: params.hasRegistry, missingMessage: 'Curiosity registry not configured', missingDetails: 'Registry metadata is required for structural compliance' },
    { dimension: 'purpose', has: params.hasPurpose, missingMessage: 'Educational purpose not configured', missingDetails: 'Purpose metadata is required for structural compliance' },
    { dimension: 'humor', has: params.hasHumor, missingMessage: 'Humor governance not configured', missingDetails: 'Humor metadata is required for structural compliance' },
    { dimension: 'cultural_reference', has: params.hasCulturalReference, missingMessage: 'Cultural reference governance not configured', missingDetails: 'Cultural reference metadata is required for structural compliance' },
    { dimension: 'cards', has: params.hasCards, missingMessage: 'Curiosity cards not configured', missingDetails: 'Card metadata is required for structural compliance' },
    { dimension: 'knowledge_evolution', has: params.hasKnowledgeEvolution, missingMessage: 'Knowledge evolution not configured', missingDetails: 'Knowledge evolution metadata is required for structural compliance' },
    { dimension: 'discoveries', has: params.hasDiscoveries, missingMessage: 'Unexpected discoveries not configured', missingDetails: 'Discovery metadata is required for structural compliance' },
    { dimension: 'laboratory_curiosity', has: params.hasLaboratoryCuriosity, missingMessage: 'Laboratory curiosity not configured', missingDetails: 'Laboratory curiosity metadata is required for structural compliance' },
    { dimension: 'misconceptions', has: params.hasMisconceptions, missingMessage: 'Misconception metadata not configured', missingDetails: 'Misconception metadata is required for structural compliance' },
    { dimension: 'presentation', has: params.hasPresentation, missingMessage: 'Visual presentation not configured', missingDetails: 'Presentation metadata is required for structural compliance' },
    { dimension: 'preferences', has: params.hasPreferences, missingMessage: 'User preferences not configured', missingDetails: 'Preference metadata is required for structural compliance' },
    { dimension: 'governance', has: params.hasGovernance, missingMessage: 'Governance workflow not configured', missingDetails: 'Governance metadata is required for structural compliance' },
    { dimension: 'storage', has: params.hasStorage, missingMessage: 'Storage separation not configured', missingDetails: 'Storage metadata is required for structural compliance' },
    { dimension: 'safety', has: params.hasSafety, missingMessage: 'Safety certification not configured', missingDetails: 'Safety metadata is required for structural compliance' },
    { dimension: 'traceability', has: params.hasTraceability, missingMessage: 'Traceability not configured', missingDetails: 'Trace metadata is required for structural compliance' },
    { dimension: 'metadata', has: params.hasMetadata, missingMessage: 'Metadata integrity not verified', missingDetails: 'Metadata integrity is required for structural compliance' },
    { dimension: 'validation', has: params.hasValidation, missingMessage: 'Validation layer not present', missingDetails: 'Validation layer is required for structural compliance' },
    { dimension: 'determinism', has: params.hasDeterminism, missingMessage: 'Determinism not guaranteed', missingDetails: 'Deterministic behavior is required for structural compliance' },
    { dimension: 'immutability', has: params.hasImmutability, missingMessage: 'Immutability not enforced', missingDetails: 'Immutability is required for structural compliance' },
    { dimension: 'documentation', has: params.hasDocumentation, missingMessage: 'Documentation not provided', missingDetails: 'Documentation is required for structural compliance' },
    { dimension: 'cross_agent_boundary', has: params.hasCrossAgentBoundary, missingMessage: 'Cross-agent boundaries not enforced', missingDetails: 'Cross-agent boundary compliance is required for structural compliance' },
    { dimension: 'public_api', has: params.hasPublicApi, missingMessage: 'Public API not exported', missingDetails: 'Public API exports are required for structural compliance' },
  ];

  for (const check of checks) {
    if (!check.has) {
      findingCounter++;
      findings.push(
        composeCuriosityCertificationFinding({
          findingId: `finding_${findingCounter}_${check.dimension}`,
          dimension: check.dimension,
          severity: 'high',
          message: check.missingMessage,
          details: check.missingDetails,
          timestamp: 'deterministic_timestamp',
        }),
      );
    }
  }

  return composeCuriosityCertificationReport({
    reportId: params.reportId,
    findings,
    dimensions,
  });
}

// ---------------------------------------------------------------------------
// Curiosity Certification: Validation Entry Point
// ---------------------------------------------------------------------------

/**
 * Validates a certification report and returns the validation result.
 * Pure function. No side effects.
 */
export function validateCuriosityCertification(
  report: CuriosityCertificationReport,
): CuriosityCertificationValidationResult {
  const errors: CuriosityCertificationValidationError[] = [];

  if (!report) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_MISSING_REPORT',
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
      code: 'CURIOSITY_CERTIFICATION_INVALID_REPORT',
      message: 'Report ID must be non-empty',
      path: 'report.reportId',
    });
  }

  if (!CANONICAL_CURIOSITY_CERTIFICATION_STATUS.includes(report.certificationStatus)) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_INVALID_STATUS',
      message: `Invalid certification status: ${report.certificationStatus}`,
      path: 'report.certificationStatus',
    });
  }

  if (typeof report.certificationScore !== 'number' || !isFinite(report.certificationScore) || report.certificationScore < 0 || report.certificationScore > 100) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_INVALID_SCORE',
      message: `Invalid certification score: ${report.certificationScore}`,
      path: 'report.certificationScore',
    });
  }

  if (!Array.isArray(report.findings)) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION',
      message: 'Findings must be an array',
      path: 'report.findings',
    });
  }

  if (!Array.isArray(report.dimensions)) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_INVALID_CONFIGURATION',
      message: 'Dimensions must be an array',
      path: 'report.dimensions',
    });
  }

  if (!report.metadata) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_MISSING_METADATA',
      message: 'Certification metadata must be provided',
      path: 'report.metadata',
    });
  }

  if (!report.trace) {
    errors.push({
      code: 'CURIOSITY_CERTIFICATION_INVALID_TRACE',
      message: 'Certification trace must be provided',
      path: 'report.trace',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'curiosity_certification_validation',
  };
}

// ---------------------------------------------------------------------------
// Helper: Type Guards
// ---------------------------------------------------------------------------

/**
 * Type guard for supported curiosity certification statuses.
 * Pure function. No side effects.
 */
export function isSupportedCuriosityCertificationStatus(
  value: string,
): value is CuriosityCertificationStatus {
  return CANONICAL_CURIOSITY_CERTIFICATION_STATUS.includes(value as CuriosityCertificationStatus);
}

/**
 * Type guard for supported curiosity finding severities.
 * Pure function. No side effects.
 */
export function isSupportedCuriosityFindingSeverity(
  value: string,
): value is CuriosityFindingSeverity {
  return CANONICAL_CURIOSITY_FINDING_SEVERITY.includes(value as CuriosityFindingSeverity);
}

/**
 * Type guard for supported curiosity quality dimensions.
 * Pure function. No side effects.
 */
export function isSupportedCuriosityQualityDimension(
  value: string,
): value is CuriosityQualityDimension {
  return CANONICAL_CURIOSITY_QUALITY_DIMENSIONS.includes(value as CuriosityQualityDimension);
}

// ---------------------------------------------------------------------------
// Helper: Canonical Getters (defensive copies)
// ---------------------------------------------------------------------------

/**
 * Returns canonical curiosity certification statuses.
 * Defensive copy. Pure function. No side effects.
 */
export function getCanonicalCuriosityCertificationStatuses(): readonly CuriosityCertificationStatus[] {
  return [...CANONICAL_CURIOSITY_CERTIFICATION_STATUS];
}

/**
 * Returns canonical curiosity finding severities.
 * Defensive copy. Pure function. No side effects.
 */
export function getCanonicalCuriosityFindingSeverities(): readonly CuriosityFindingSeverity[] {
  return [...CANONICAL_CURIOSITY_FINDING_SEVERITY];
}

/**
 * Returns canonical curiosity quality dimensions.
 * Defensive copy. Pure function. No side effects.
 */
export function getCanonicalCuriosityQualityDimensions(): readonly CuriosityQualityDimension[] {
  return [...CANONICAL_CURIOSITY_QUALITY_DIMENSIONS];
}
