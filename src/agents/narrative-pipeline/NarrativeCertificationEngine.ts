/**
 * NV-1700-D6-OPT-10 — Narrative Certification Engine
 *
 * Deterministic certification engine for narrative artifacts.
 * Evaluates structural integrity without modifying artifacts.
 *
 * This module never:
 * - Generates narratives
 * - Repairs narrative artifacts
 * - Modifies registries
 * - Infers missing metadata
 * - Accesses external APIs
 * - Invokes LLMs
 * - Personalizes narrative
 * - Schedules execution
 * - Creates hidden state
 *
 * Certification is structural only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  CertificationProvenance,
  NarrativeGovernanceStatus,
  NarrativeCertificationStatus,
  NarrativeFindingSeverity,
  NarrativeQualityDimension,
  CertificationFinding,
  CertificationReport,
  NarrativeFacadeTraceMetadata,
  NarrativeFacadeValidationError,
} from './NarrativeAgentContract.ts';

import {
  CANONICAL_NARRATIVE_CERTIFICATION_STATUS,
  CANONICAL_NARRATIVE_FINDING_SEVERITY,
  CANONICAL_NARRATIVE_QUALITY_DIMENSIONS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './NarrativeAgentContract.ts';

// ---------------------------------------------------------------------------
// Certification Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeCertificationFinding(params: {
  readonly findingId: string;
  readonly severity: NarrativeFindingSeverity;
  readonly qualityDimension: NarrativeQualityDimension;
  readonly message: string;
  readonly artifactReference: string;
  readonly provenance: CertificationProvenance;
}): CertificationFinding {
  return {
    findingId: params.findingId,
    severity: params.severity,
    qualityDimension: params.qualityDimension,
    message: params.message,
    artifactReference: params.artifactReference,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Certification Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from provided parameters.
 * Pure function. No side effects.
 */
export function composeNarrativeCertificationReport(params: {
  readonly reportId: string;
  readonly status: NarrativeCertificationStatus;
  readonly qualityScore: number;
  readonly findings: readonly CertificationFinding[];
  readonly trace: NarrativeFacadeTraceMetadata;
  readonly provenance: CertificationProvenance;
}): CertificationReport {
  return {
    reportId: params.reportId,
    status: params.status,
    qualityScore: params.qualityScore,
    findings: [...params.findings],
    trace: params.trace,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Certification Report From Params
// ---------------------------------------------------------------------------

/**
 * Composes a certification report from findings and quality score.
 * Pure function. No side effects.
 */
export function composeNarrativeCertificationReportFromParams(params: {
  readonly reportId: string;
  readonly findings: readonly CertificationFinding[];
  readonly qualityScore: number;
  readonly provenance: CertificationProvenance;
}): CertificationReport {
  const status = _determineCertificationStatus(params.findings, params.qualityScore);

  const trace: NarrativeFacadeTraceMetadata = {
    traceId: `_certification_trace_${params.reportId}`,
    decisionCount: 0,
    validationCount: params.findings.length,
    compositionCount: 0,
    certificationCount: 1,
    deterministic: true,
    generatedFrom: 'deterministic_narrative_facade',
    randomUsed: false,
    timeDependency: false,
  };

  return composeNarrativeCertificationReport({
    reportId: params.reportId,
    status,
    qualityScore: params.qualityScore,
    findings: params.findings,
    trace,
    provenance: params.provenance,
  });
}

// ---------------------------------------------------------------------------
// Determine Certification Status
// ---------------------------------------------------------------------------

/**
 * Determines certification status based on findings and quality score.
 * Pure function. No side effects.
 */
function _determineCertificationStatus(
  findings: readonly CertificationFinding[],
  qualityScore: number,
): NarrativeCertificationStatus {
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warning');

  const hasBlockingDimensions = findings.some((f) =>
    f.qualityDimension === 'registry_integrity' ||
    f.qualityDimension === 'determinism' ||
    f.qualityDimension === 'architectural_boundary' ||
    f.qualityDimension === 'validation_integrity' ||
    f.qualityDimension === 'composition_integrity',
  );

  if (hasBlockingDimensions || errors.length > 0) return 'blocked';
  if (warnings.length > 0) return 'certified_with_warnings';
  if (qualityScore >= 0.8) return 'certified';
  if (qualityScore >= 0.5) return 'certified_with_warnings';
  return 'needs_revision';
}

// ---------------------------------------------------------------------------
// Certification Composition
// ---------------------------------------------------------------------------

/**
 * Composes certification for a narrative artifact.
 * Pure function. No side effects.
 */
export function certifyNarrativeComposition(params: {
  readonly narrativeId: string;
  readonly validationPassed: boolean;
  readonly validationErrorCount: number;
  readonly registryIntegrity: boolean;
  readonly determinismGuarantee: boolean;
  readonly architecturalBoundary: boolean;
  readonly provenanceIntegrity: boolean;
  readonly governanceIntegrity: boolean;
  readonly styleIntegrity: boolean;
  readonly problemIntegrity: boolean;
  readonly analogyIntegrity: boolean;
  readonly storyFlowIntegrity: boolean;
  readonly engagementIntegrity: boolean;
  readonly historicalIntegrity: boolean;
  readonly applicationIntegrity: boolean;
  readonly perspectiveIntegrity: boolean;
  readonly compositionIntegrity: boolean;
  readonly provenance: CertificationProvenance;
}): CertificationReport {
  const findings: CertificationFinding[] = [];
  let findingIndex = 0;

  function _addFinding(severity: NarrativeFindingSeverity, dimension: NarrativeQualityDimension, message: string): void {
    findings.push(composeNarrativeCertificationFinding({
      findingId: `_finding_${params.narrativeId}_${findingIndex++}`,
      severity,
      qualityDimension: dimension,
      message,
      artifactReference: params.narrativeId,
      provenance: params.provenance,
    }));
  }

  if (!params.registryIntegrity) _addFinding('error', 'registry_integrity', 'Registry integrity check failed.');
  if (!params.determinismGuarantee) _addFinding('error', 'determinism', 'Determinism guarantee not met.');
  if (!params.architecturalBoundary) _addFinding('error', 'architectural_boundary', 'Architectural boundary violated.');
  if (!params.validationPassed) _addFinding('error', 'validation_integrity', 'Validation did not pass.');
  if (!params.compositionIntegrity) _addFinding('error', 'composition_integrity', 'Composition integrity check failed.');

  if (!params.provenanceIntegrity) _addFinding('warning', 'provenance_integrity', 'Provenance integrity issue detected.');
  if (!params.governanceIntegrity) _addFinding('warning', 'governance_integrity', 'Governance integrity issue detected.');
  if (!params.styleIntegrity) _addFinding('warning', 'style_integrity', 'Style integrity issue detected.');
  if (!params.problemIntegrity) _addFinding('warning', 'problem_integrity', 'Problem integrity issue detected.');
  if (!params.analogyIntegrity) _addFinding('warning', 'analogy_integrity', 'Analogy integrity issue detected.');
  if (!params.storyFlowIntegrity) _addFinding('warning', 'story_flow_integrity', 'Story flow integrity issue detected.');
  if (!params.engagementIntegrity) _addFinding('warning', 'engagement_integrity', 'Engagement integrity issue detected.');
  if (!params.historicalIntegrity) _addFinding('warning', 'historical_integrity', 'Historical integrity issue detected.');
  if (!params.applicationIntegrity) _addFinding('warning', 'application_integrity', 'Application integrity issue detected.');
  if (!params.perspectiveIntegrity) _addFinding('warning', 'perspective_integrity', 'Perspective integrity issue detected.');

  const qualityScore = _calculateQualityScore(params);

  return composeNarrativeCertificationReportFromParams({
    reportId: `_certification_${params.narrativeId}`,
    findings,
    qualityScore,
    provenance: params.provenance,
  });
}

// ---------------------------------------------------------------------------
// Quality Score Calculation
// ---------------------------------------------------------------------------

/**
 * Calculates quality score based on structural integrity.
 * Pure function. No side effects.
 */
function _calculateQualityScore(params: {
  readonly validationPassed: boolean;
  readonly validationErrorCount: number;
  readonly registryIntegrity: boolean;
  readonly determinismGuarantee: boolean;
  readonly architecturalBoundary: boolean;
  readonly provenanceIntegrity: boolean;
  readonly governanceIntegrity: boolean;
  readonly styleIntegrity: boolean;
  readonly problemIntegrity: boolean;
  readonly analogyIntegrity: boolean;
  readonly storyFlowIntegrity: boolean;
  readonly engagementIntegrity: boolean;
  readonly historicalIntegrity: boolean;
  readonly applicationIntegrity: boolean;
  readonly perspectiveIntegrity: boolean;
  readonly compositionIntegrity: boolean;
}): number {
  let score = 1.0;

  if (!params.validationPassed) score -= 0.2;
  if (params.validationErrorCount > 0) score -= Math.min(0.3, params.validationErrorCount * 0.05);
  if (!params.registryIntegrity) score -= 0.15;
  if (!params.determinismGuarantee) score -= 0.15;
  if (!params.architecturalBoundary) score -= 0.15;
  if (!params.provenanceIntegrity) score -= 0.05;
  if (!params.governanceIntegrity) score -= 0.05;
  if (!params.styleIntegrity) score -= 0.03;
  if (!params.problemIntegrity) score -= 0.03;
  if (!params.analogyIntegrity) score -= 0.03;
  if (!params.storyFlowIntegrity) score -= 0.03;
  if (!params.engagementIntegrity) score -= 0.03;
  if (!params.historicalIntegrity) score -= 0.03;
  if (!params.applicationIntegrity) score -= 0.03;
  if (!params.perspectiveIntegrity) score -= 0.03;
  if (!params.compositionIntegrity) score -= 0.15;

  return Math.max(0, Math.min(1, score));
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

export function isSupportedNarrativeCertificationStatus(
  status: string,
): status is NarrativeCertificationStatus {
  return CANONICAL_NARRATIVE_CERTIFICATION_STATUS.includes(status as NarrativeCertificationStatus);
}

export function isSupportedNarrativeFindingSeverity(
  severity: string,
): severity is NarrativeFindingSeverity {
  return CANONICAL_NARRATIVE_FINDING_SEVERITY.includes(severity as NarrativeFindingSeverity);
}

export function isSupportedNarrativeQualityDimension(
  dimension: string,
): dimension is NarrativeQualityDimension {
  return CANONICAL_NARRATIVE_QUALITY_DIMENSIONS.includes(dimension as NarrativeQualityDimension);
}

// ---------------------------------------------------------------------------
// Canonical Getters
// ---------------------------------------------------------------------------

export function getCanonicalNarrativeCertificationStatuses(): readonly NarrativeCertificationStatus[] {
  return CANONICAL_NARRATIVE_CERTIFICATION_STATUS;
}

export function getCanonicalNarrativeFindingSeverities(): readonly NarrativeFindingSeverity[] {
  return CANONICAL_NARRATIVE_FINDING_SEVERITY;
}

export function getCanonicalNarrativeQualityDimensions(): readonly NarrativeQualityDimension[] {
  return CANONICAL_NARRATIVE_QUALITY_DIMENSIONS;
}