/**
 * NV-1700-D5-OPT-09 — Knowledge Gap Detection & Coverage Audit Kernel
 *
 * Deterministic orchestration functions for coverage audit metadata.
 * Produces components, gaps, reports, traces, and registries.
 *
 * This module never:
 * - Generates missing content
 * - Repairs artifacts
 * - Creates new knowledge
 * - Generates explanations
 * - Writes summaries
 * - Creates laboratories
 * - Creates assessments
 * - Creates visualizations
 * - Creates references
 * - Fills gaps automatically
 * - Modifies artifacts
 * - Estimates learner mastery
 * - Calls LLMs
 * - Calls external APIs
 *
 * Knowledge coverage audit metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeCoverageComponent,
  KnowledgeGap,
  KnowledgeCoverageReport,
  CoverageProvenance,
  KnowledgeCoverageTrace,
  KnowledgeCoverageRegistry,
  KnowledgeCoverageRegistryMetadata,
  KnowledgeCoverageInput,
  CoverageComponentType,
  GapType,
  CoverageLevel,
  CoverageStatus,
  KnowledgeGovernanceStatus,
  ImpactSeverity,
  KnowledgeArtifactWithCoverage,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_COVERAGE_COMPONENT_TYPES,
  CANONICAL_GAP_TYPES,
  CANONICAL_COVERAGE_LEVELS,
  CANONICAL_COVERAGE_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
  CANONICAL_IMPACT_SEVERITY,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Coverage Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes coverage provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverageProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): CoverageProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Component Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge coverage component from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverageComponent(params: {
  readonly componentId: string;
  readonly artifactId: string;
  readonly componentType: CoverageComponentType;
  readonly coverageLevel: CoverageLevel;
  readonly provenance: CoverageProvenance;
}): KnowledgeCoverageComponent {
  return {
    componentId: params.componentId,
    artifactId: params.artifactId,
    componentType: params.componentType,
    coverageLevel: params.coverageLevel,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Gap Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge gap from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeGap(params: {
  readonly gapId: string;
  readonly artifactId: string;
  readonly gapType: GapType;
  readonly severity: ImpactSeverity;
  readonly rationale: string;
  readonly provenance: CoverageProvenance;
}): KnowledgeGap {
  return {
    gapId: params.gapId,
    artifactId: params.artifactId,
    gapType: params.gapType,
    severity: params.severity,
    rationale: params.rationale,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge coverage report from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverageReport(params: {
  readonly reportId: string;
  readonly artifactId: string;
  readonly components: readonly KnowledgeCoverageComponent[];
  readonly gaps: readonly KnowledgeGap[];
  readonly overallCoverageLevel: CoverageLevel;
  readonly provenance: CoverageProvenance;
}): KnowledgeCoverageReport {
  return {
    reportId: params.reportId,
    artifactId: params.artifactId,
    components: [...params.components],
    gaps: [...params.gaps],
    overallCoverageLevel: params.overallCoverageLevel,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge coverage trace from metadata.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverageTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly compositionMetadata: string;
  readonly deterministicMetadata: string;
}): KnowledgeCoverageTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    compositionMetadata: params.compositionMetadata,
    deterministicMetadata: params.deterministicMetadata,
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for knowledge coverage reports.
 * Sorts by reportId, then artifactId.
 * Pure function. No side effects.
 */
function _compareKnowledgeCoverageReport(
  a: KnowledgeCoverageReport,
  b: KnowledgeCoverageReport,
): number {
  if (a.reportId < b.reportId) return -1;
  if (a.reportId > b.reportId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  return 0;
}

/**
 * Deterministic comparator for knowledge coverage components.
 * Sorts by componentId, then artifactId, then componentType.
 * Pure function. No side effects.
 */
function _compareKnowledgeCoverageComponent(
  a: KnowledgeCoverageComponent,
  b: KnowledgeCoverageComponent,
): number {
  if (a.componentId < b.componentId) return -1;
  if (a.componentId > b.componentId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  if (a.componentType < b.componentType) return -1;
  if (a.componentType > b.componentType) return 1;

  return 0;
}

/**
 * Deterministic comparator for knowledge gaps.
 * Sorts by gapId, then artifactId, then gapType.
 * Pure function. No side effects.
 */
function _compareKnowledgeGap(
  a: KnowledgeGap,
  b: KnowledgeGap,
): number {
  if (a.gapId < b.gapId) return -1;
  if (a.gapId > b.gapId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  if (a.gapType < b.gapType) return -1;
  if (a.gapType > b.gapType) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge coverage registry from reports, components, and gaps.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeKnowledgeCoverageRegistry(
  reports: readonly KnowledgeCoverageReport[],
  components: readonly KnowledgeCoverageComponent[],
  gaps: readonly KnowledgeGap[],
): KnowledgeCoverageRegistry {
  const sortedReports = [...reports].sort(_compareKnowledgeCoverageReport);
  const sortedComponents = [...components].sort(_compareKnowledgeCoverageComponent);
  const sortedGaps = [...gaps].sort(_compareKnowledgeGap);

  const componentTypes = new Set(sortedComponents.map((c) => c.componentType));

  const metadata: KnowledgeCoverageRegistryMetadata = {
    registryId: `_registry_${sortedReports.length}_${sortedComponents.length}_${sortedGaps.length}`,
    reportCount: sortedReports.length,
    componentCount: sortedComponents.length,
    gapCount: sortedGaps.length,
    componentTypeCount: componentTypes.size,
  };

  return {
    registryId: metadata.registryId,
    reports: sortedReports,
    components: sortedComponents,
    gaps: sortedGaps,
    metadata,
    trace: {
      traceId: `_trace_${sortedReports.length}_${sortedComponents.length}_${sortedGaps.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      compositionMetadata: '_composition_default',
      deterministicMetadata: '_deterministic_default',
      deterministic: true,
      generatedFrom: 'deterministic_coverage_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_coverage_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge coverage registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverageRegistryFromInput(
  input: KnowledgeCoverageInput,
): KnowledgeCoverageRegistry {
  return composeKnowledgeCoverageRegistry(
    input.reports,
    input.components,
    input.gaps,
  );
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete knowledge coverage registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeCoverage(
  input: KnowledgeCoverageInput,
): KnowledgeCoverageRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const report of input.reports) {
    decisionCount++;
    const errors = _validateReportForDecision(report);
    if (errors.length === 0) validationCount++;
  }

  for (const component of input.components) {
    decisionCount++;
    const errors = _validateComponentForDecision(component);
    if (errors.length === 0) validationCount++;
  }

  for (const gap of input.gaps) {
    decisionCount++;
    const errors = _validateGapForDecision(gap);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeKnowledgeCoverageRegistry(
    input.reports,
    input.components,
    input.gaps,
  );

  return {
    ...registry,
    trace: composeKnowledgeCoverageTrace({
      traceId: `_trace_${input.reports.length}_${input.components.length}_${input.gaps.length}`,
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
 * Validates a knowledge coverage report for decision composition.
 * Pure function. No side effects.
 */
function _validateReportForDecision(
  report: KnowledgeCoverageReport,
): readonly string[] {
  const errors: string[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push('COVERAGE_MISSING_REPORT_ID');
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push('COVERAGE_MISSING_ARTIFACT_ID');
  }

  if (!CANONICAL_COVERAGE_LEVELS.includes(report.overallCoverageLevel)) {
    errors.push('COVERAGE_INVALID_LEVEL');
  }

  if (!report.provenance) {
    errors.push('COVERAGE_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a knowledge coverage component for decision composition.
 * Pure function. No side effects.
 */
function _validateComponentForDecision(
  component: KnowledgeCoverageComponent,
): readonly string[] {
  const errors: string[] = [];

  if (!component.componentId || component.componentId.trim() === '') {
    errors.push('COVERAGE_MISSING_COMPONENT_ID');
  }

  if (!CANONICAL_COVERAGE_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push('COVERAGE_INVALID_COMPONENT');
  }

  if (!CANONICAL_COVERAGE_LEVELS.includes(component.coverageLevel)) {
    errors.push('COVERAGE_INVALID_LEVEL');
  }

  if (!component.provenance) {
    errors.push('COVERAGE_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates a knowledge gap for decision composition.
 * Pure function. No side effects.
 */
function _validateGapForDecision(
  gap: KnowledgeGap,
): readonly string[] {
  const errors: string[] = [];

  if (!gap.gapId || gap.gapId.trim() === '') {
    errors.push('COVERAGE_MISSING_GAP_ID');
  }

  if (!CANONICAL_GAP_TYPES.includes(gap.gapType)) {
    errors.push('COVERAGE_INVALID_GAP');
  }

  if (!CANONICAL_IMPACT_SEVERITY.includes(gap.severity)) {
    errors.push('COVERAGE_INVALID_SEVERITY');
  }

  if (!gap.provenance) {
    errors.push('COVERAGE_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Coverage Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with coverage from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithCoverage(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly reports: readonly KnowledgeCoverageReport[];
  readonly components: readonly KnowledgeCoverageComponent[];
  readonly gaps: readonly KnowledgeGap[];
  readonly provenance: CoverageProvenance;
}): KnowledgeArtifactWithCoverage {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    reports: [...params.reports],
    components: [...params.components],
    gaps: [...params.gaps],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported coverage component type.
 */
export function isSupportedCoverageComponent(
  componentType: string,
): componentType is CoverageComponentType {
  return CANONICAL_COVERAGE_COMPONENT_TYPES.includes(componentType as CoverageComponentType);
}

/**
 * Checks if a string is a supported gap type.
 */
export function isSupportedGapType(
  gapType: string,
): gapType is GapType {
  return CANONICAL_GAP_TYPES.includes(gapType as GapType);
}

/**
 * Checks if a string is a supported coverage level.
 */
export function isSupportedCoverageLevel(
  coverageLevel: string,
): coverageLevel is CoverageLevel {
  return CANONICAL_COVERAGE_LEVELS.includes(coverageLevel as CoverageLevel);
}

/**
 * Checks if a string is a supported coverage status.
 */
export function isSupportedCoverageStatus(
  status: string,
): status is CoverageStatus {
  return CANONICAL_COVERAGE_STATUS.includes(status as CoverageStatus);
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
 * Returns the canonical coverage component types.
 */
export function getCanonicalCoverageComponents(): readonly CoverageComponentType[] {
  return CANONICAL_COVERAGE_COMPONENT_TYPES;
}

/**
 * Returns the canonical gap types.
 */
export function getCanonicalGapTypes(): readonly GapType[] {
  return CANONICAL_GAP_TYPES;
}

/**
 * Returns the canonical coverage levels.
 */
export function getCanonicalCoverageLevels(): readonly CoverageLevel[] {
  return CANONICAL_COVERAGE_LEVELS;
}

/**
 * Returns the canonical coverage statuses.
 */
export function getCanonicalCoverageStatuses(): readonly CoverageStatus[] {
  return CANONICAL_COVERAGE_STATUS;
}
