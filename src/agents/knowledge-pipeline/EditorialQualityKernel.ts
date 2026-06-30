/**
 * NV-1700-D5-OPT-07 — Editorial Quality Index & Governance Scoring Kernel
 *
 * Deterministic orchestration functions for editorial quality metadata.
 * Produces dimensions, findings, reports, traces, and registries.
 *
 * This module never:
 * - Infers missing knowledge
 * - Generates scores automatically from AI reasoning
 * - Rewrites artifacts
 * - Repairs deficiencies
 * - Creates recommendations
 * - Estimates learner outcomes
 * - Calls LLMs
 * - Calls external APIs
 *
 * Editorial quality metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EditorialQualityDimension,
  EditorialQualityFinding,
  EditorialQualityReport,
  QualityProvenance,
  EditorialQualityTrace,
  EditorialQualityRegistry,
  EditorialQualityRegistryMetadata,
  EditorialQualityInput,
  QualityDimensionType,
  QualityLevel,
  QualityFindingType,
  QualityStatus,
  KnowledgeGovernanceStatus,
  ImpactSeverity,
  KnowledgeArtifactWithEditorialQuality,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_QUALITY_DIMENSIONS,
  CANONICAL_QUALITY_LEVELS,
  CANONICAL_QUALITY_FINDINGS,
  CANONICAL_QUALITY_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_IMPACT_SEVERITY,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Quality Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes quality provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeEditorialQualityProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): QualityProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Dimension Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality dimension from provided parameters.
 * Pure function. No side effects.
 */
export function composeEditorialQualityDimension(params: {
  readonly dimensionId: string;
  readonly dimensionType: QualityDimensionType;
  readonly qualityLevel: QualityLevel;
  readonly score: number;
  readonly rationale: string;
  readonly provenance: QualityProvenance;
}): EditorialQualityDimension {
  return {
    dimensionId: params.dimensionId,
    dimensionType: params.dimensionType,
    qualityLevel: params.qualityLevel,
    score: params.score,
    rationale: params.rationale,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Finding Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality finding from provided parameters.
 * Pure function. No side effects.
 */
export function composeEditorialQualityFinding(params: {
  readonly findingId: string;
  readonly findingType: QualityFindingType;
  readonly severity: ImpactSeverity;
  readonly description: string;
  readonly affectedArtifactId: string;
  readonly provenance: QualityProvenance;
}): EditorialQualityFinding {
  return {
    findingId: params.findingId,
    findingType: params.findingType,
    severity: params.severity,
    description: params.description,
    affectedArtifactId: params.affectedArtifactId,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality report from provided parameters.
 * Pure function. No side effects.
 */
export function composeEditorialQualityReport(params: {
  readonly reportId: string;
  readonly artifactId: string;
  readonly dimensions: readonly EditorialQualityDimension[];
  readonly findings: readonly EditorialQualityFinding[];
  readonly overallScore: number;
  readonly qualityLevel: QualityLevel;
  readonly summary: string;
  readonly provenance: QualityProvenance;
}): EditorialQualityReport {
  return {
    reportId: params.reportId,
    artifactId: params.artifactId,
    dimensions: [...params.dimensions],
    findings: [...params.findings],
    overallScore: params.overallScore,
    qualityLevel: params.qualityLevel,
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality trace from metadata.
 * Pure function. No side effects.
 */
export function composeEditorialQualityTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly compositionMetadata: string;
  readonly deterministicMetadata: string;
}): EditorialQualityTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    compositionMetadata: params.compositionMetadata,
    deterministicMetadata: params.deterministicMetadata,
    deterministic: true,
    generatedFrom: 'deterministic_quality_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for editorial quality reports.
 * Sorts by reportId, then artifactId.
 * Pure function. No side effects.
 */
function _compareEditorialQualityReport(
  a: EditorialQualityReport,
  b: EditorialQualityReport,
): number {
  if (a.reportId < b.reportId) return -1;
  if (a.reportId > b.reportId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  return 0;
}

/**
 * Deterministic comparator for editorial quality dimensions.
 * Sorts by dimensionId, then dimensionType.
 * Pure function. No side effects.
 */
function _compareEditorialQualityDimension(
  a: EditorialQualityDimension,
  b: EditorialQualityDimension,
): number {
  if (a.dimensionId < b.dimensionId) return -1;
  if (a.dimensionId > b.dimensionId) return 1;

  if (a.dimensionType < b.dimensionType) return -1;
  if (a.dimensionType > b.dimensionType) return 1;

  return 0;
}

/**
 * Deterministic comparator for editorial quality findings.
 * Sorts by findingId, then findingType.
 * Pure function. No side effects.
 */
function _compareEditorialQualityFinding(
  a: EditorialQualityFinding,
  b: EditorialQualityFinding,
): number {
  if (a.findingId < b.findingId) return -1;
  if (a.findingId > b.findingId) return 1;

  if (a.findingType < b.findingType) return -1;
  if (a.findingType > b.findingType) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Editorial Quality Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality registry from reports, dimensions, and findings.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeEditorialQualityRegistry(
  reports: readonly EditorialQualityReport[],
  dimensions: readonly EditorialQualityDimension[],
  findings: readonly EditorialQualityFinding[],
): EditorialQualityRegistry {
  const sortedReports = [...reports].sort(_compareEditorialQualityReport);
  const sortedDimensions = [...dimensions].sort(_compareEditorialQualityDimension);
  const sortedFindings = [...findings].sort(_compareEditorialQualityFinding);

  const dimensionTypes = new Set(sortedDimensions.map((d) => d.dimensionType));

  const metadata: EditorialQualityRegistryMetadata = {
    registryId: `_registry_${sortedReports.length}_${sortedDimensions.length}_${sortedFindings.length}`,
    reportCount: sortedReports.length,
    dimensionCount: sortedDimensions.length,
    findingCount: sortedFindings.length,
    dimensionTypeCount: dimensionTypes.size,
  };

  return {
    registryId: metadata.registryId,
    reports: sortedReports,
    dimensions: sortedDimensions,
    findings: sortedFindings,
    metadata,
    trace: {
      traceId: `_trace_${sortedReports.length}_${sortedDimensions.length}_${sortedFindings.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: true,
      generatedFrom: 'deterministic_quality_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_quality_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes an editorial quality registry from an input.
 * Pure function. No side effects.
 */
export function composeEditorialQualityRegistryFromInput(
  input: EditorialQualityInput,
): EditorialQualityRegistry {
  return composeEditorialQualityRegistry(
    input.reports,
    input.dimensions,
    input.findings,
  );
}

// ---------------------------------------------------------------------------
// Editorial Quality Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete editorial quality registry from an input.
 * Pure function. No side effects.
 */
export function composeEditorialQuality(
  input: EditorialQualityInput,
): EditorialQualityRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const report of input.reports) {
    decisionCount++;
    const errors = _validateReportForDecision(report);
    if (errors.length === 0) validationCount++;
  }

  for (const dimension of input.dimensions) {
    decisionCount++;
    const errors = _validateDimensionForDecision(dimension);
    if (errors.length === 0) validationCount++;
  }

  for (const finding of input.findings) {
    decisionCount++;
    const errors = _validateFindingForDecision(finding);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeEditorialQualityRegistry(
    input.reports,
    input.dimensions,
    input.findings,
  );

  return {
    ...registry,
    trace: composeEditorialQualityTrace({
      traceId: `_trace_${input.reports.length}_${input.dimensions.length}_${input.findings.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
    }),
  };
}

/**
 * Validates an editorial quality report for decision composition.
 * Pure function. No side effects.
 */
function _validateReportForDecision(
  report: EditorialQualityReport,
): readonly string[] {
  const errors: string[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push('QUALITY_MISSING_REPORT_ID');
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push('QUALITY_MISSING_ARTIFACT_ID');
  }

  if (report.overallScore < 0 || report.overallScore > 1) {
    errors.push('QUALITY_INVALID_SCORE');
  }

  if (!CANONICAL_QUALITY_LEVELS.includes(report.qualityLevel)) {
    errors.push('QUALITY_INVALID_LEVEL');
  }

  if (!report.provenance) {
    errors.push('QUALITY_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates an editorial quality dimension for decision composition.
 * Pure function. No side effects.
 */
function _validateDimensionForDecision(
  dimension: EditorialQualityDimension,
): readonly string[] {
  const errors: string[] = [];

  if (!dimension.dimensionId || dimension.dimensionId.trim() === '') {
    errors.push('QUALITY_MISSING_DIMENSION_ID');
  }

  if (!CANONICAL_QUALITY_DIMENSIONS.includes(dimension.dimensionType)) {
    errors.push('QUALITY_INVALID_DIMENSION');
  }

  if (!CANONICAL_QUALITY_LEVELS.includes(dimension.qualityLevel)) {
    errors.push('QUALITY_INVALID_LEVEL');
  }

  if (dimension.score < 0 || dimension.score > 1) {
    errors.push('QUALITY_INVALID_SCORE');
  }

  if (!dimension.provenance) {
    errors.push('QUALITY_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates an editorial quality finding for decision composition.
 * Pure function. No side effects.
 */
function _validateFindingForDecision(
  finding: EditorialQualityFinding,
): readonly string[] {
  const errors: string[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push('QUALITY_MISSING_FINDING_ID');
  }

  if (!CANONICAL_QUALITY_FINDINGS.includes(finding.findingType)) {
    errors.push('QUALITY_INVALID_FINDING');
  }

  if (!CANONICAL_IMPACT_SEVERITY.includes(finding.severity)) {
    errors.push('QUALITY_INVALID_SEVERITY');
  }

  if (!finding.affectedArtifactId || finding.affectedArtifactId.trim() === '') {
    errors.push('QUALITY_MISSING_ARTIFACT_ID');
  }

  if (!finding.provenance) {
    errors.push('QUALITY_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Editorial Quality Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with editorial quality from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithEditorialQuality(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly reports: readonly EditorialQualityReport[];
  readonly dimensions: readonly EditorialQualityDimension[];
  readonly findings: readonly EditorialQualityFinding[];
  readonly provenance: QualityProvenance;
}): KnowledgeArtifactWithEditorialQuality {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    reports: [...params.reports],
    dimensions: [...params.dimensions],
    findings: [...params.findings],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported quality dimension type.
 */
export function isSupportedQualityDimension(
  dimensionType: string,
): dimensionType is QualityDimensionType {
  return CANONICAL_QUALITY_DIMENSIONS.includes(dimensionType as QualityDimensionType);
}

/**
 * Checks if a string is a supported quality level.
 */
export function isSupportedQualityLevel(
  qualityLevel: string,
): qualityLevel is QualityLevel {
  return CANONICAL_QUALITY_LEVELS.includes(qualityLevel as QualityLevel);
}

/**
 * Checks if a string is a supported quality finding type.
 */
export function isSupportedQualityFinding(
  findingType: string,
): findingType is QualityFindingType {
  return CANONICAL_QUALITY_FINDINGS.includes(findingType as QualityFindingType);
}

/**
 * Checks if a string is a supported quality status.
 */
export function isSupportedQualityStatus(
  status: string,
): status is QualityStatus {
  return CANONICAL_QUALITY_STATUS.includes(status as QualityStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedGovernanceStatus(
  governanceStatus: string,
): governanceStatus is KnowledgeGovernanceStatus {
  if (governanceStatus === 'accepted') {
    return true;
  }
  return CANONICAL_GOVERNANCE_STATUSES.includes(
    governanceStatus as KnowledgeGovernanceStatus,
  );
}

// ---------------------------------------------------------------------------
// Helper Functions — Canonical Getters
// ---------------------------------------------------------------------------

/**
 * Returns the canonical quality dimension types.
 */
export function getCanonicalQualityDimensions(): readonly QualityDimensionType[] {
  return CANONICAL_QUALITY_DIMENSIONS;
}

/**
 * Returns the canonical quality levels.
 */
export function getCanonicalQualityLevels(): readonly QualityLevel[] {
  return CANONICAL_QUALITY_LEVELS;
}

/**
 * Returns the canonical quality finding types.
 */
export function getCanonicalQualityFindings(): readonly QualityFindingType[] {
  return CANONICAL_QUALITY_FINDINGS;
}

/**
 * Returns the canonical quality statuses.
 */
export function getCanonicalQualityStatuses(): readonly QualityStatus[] {
  return CANONICAL_QUALITY_STATUS;
}
