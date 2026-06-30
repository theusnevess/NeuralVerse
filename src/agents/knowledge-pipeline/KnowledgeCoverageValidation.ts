/**
 * NV-1700-D5-OPT-09 — Knowledge Coverage Validation Layer
 *
 * Deterministic validation for coverage audit metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeCoverageComponent,
  KnowledgeGap,
  KnowledgeCoverageReport,
  KnowledgeCoverageRegistry,
  KnowledgeCoverageTrace,
  KnowledgeCoverageInput,
  KnowledgeArtifactWithCoverage,
  KnowledgeCoverageValidationError,
  KnowledgeCoverageComponentValidationResult,
  KnowledgeGapValidationResult,
  KnowledgeCoverageReportValidationResult,
  KnowledgeCoverageRegistryValidationResult,
  KnowledgeCoverageInputValidationResult,
  KnowledgeCoverageTraceValidationResult,
  KnowledgeArtifactWithCoverageValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const COVERAGE_VALIDATION_CODES = {
  COVERAGE_DUPLICATE_REPORT: 'COVERAGE_DUPLICATE_REPORT',
  COVERAGE_DUPLICATE_COMPONENT: 'COVERAGE_DUPLICATE_COMPONENT',
  COVERAGE_DUPLICATE_GAP: 'COVERAGE_DUPLICATE_GAP',
  COVERAGE_INVALID_COMPONENT: 'COVERAGE_INVALID_COMPONENT',
  COVERAGE_INVALID_GAP: 'COVERAGE_INVALID_GAP',
  COVERAGE_INVALID_LEVEL: 'COVERAGE_INVALID_LEVEL',
  COVERAGE_INVALID_SEVERITY: 'COVERAGE_INVALID_SEVERITY',
  COVERAGE_MISSING_PROVENANCE: 'COVERAGE_MISSING_PROVENANCE',
  COVERAGE_MISSING_RATIONALE: 'COVERAGE_MISSING_RATIONALE',
  COVERAGE_MISSING_SOURCE: 'COVERAGE_MISSING_SOURCE',
  COVERAGE_INVALID_GOVERNANCE: 'COVERAGE_INVALID_GOVERNANCE',
  COVERAGE_INVALID_REFERENCES: 'COVERAGE_INVALID_REFERENCES',
  COVERAGE_EMPTY_REGISTRY: 'COVERAGE_EMPTY_REGISTRY',
  COVERAGE_INVALID_TRACE: 'COVERAGE_INVALID_TRACE',
  COVERAGE_MISSING_REPORT_ID: 'COVERAGE_MISSING_REPORT_ID',
  COVERAGE_MISSING_COMPONENT_ID: 'COVERAGE_MISSING_COMPONENT_ID',
  COVERAGE_MISSING_GAP_ID: 'COVERAGE_MISSING_GAP_ID',
  COVERAGE_MISSING_ARTIFACT_ID: 'COVERAGE_MISSING_ARTIFACT_ID',
  COVERAGE_MISSING_PROVIDED_BY: 'COVERAGE_MISSING_PROVIDED_BY',
  COVERAGE_INVALID_REGISTRY: 'COVERAGE_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Knowledge Coverage Component Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge coverage component against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCoverageComponent(
  component: KnowledgeCoverageComponent,
): readonly KnowledgeCoverageValidationError[] {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!component.componentId || component.componentId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_COMPONENT_ID,
      message: 'Knowledge coverage component is missing a component ID.',
      field: 'componentId',
      id: component.componentId,
    });
  }

  if (!component.artifactId || component.artifactId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
      message: 'Knowledge coverage component is missing an artifact ID.',
      field: 'artifactId',
      id: component.componentId,
    });
  }

  if (!CANONICAL_COVERAGE_COMPONENT_TYPES.includes(component.componentType)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_COMPONENT,
      message: `Knowledge coverage component has unsupported type: "${component.componentType}".`,
      field: 'componentType',
      id: component.componentId,
    });
  }

  if (!CANONICAL_COVERAGE_LEVELS.includes(component.coverageLevel)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_LEVEL,
      message: `Knowledge coverage component has unsupported level: "${component.coverageLevel}".`,
      field: 'coverageLevel',
      id: component.componentId,
    });
  }

  if (!component.provenance) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
      message: 'Knowledge coverage component is missing provenance.',
      field: 'provenance',
      id: component.componentId,
    });
  } else {
    if (!component.provenance.source || component.provenance.source.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
        message: 'Component provenance is missing a source.',
        field: 'provenance.source',
        id: component.componentId,
      });
    }

    if (!component.provenance.rationale || component.provenance.rationale.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
        message: 'Component provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: component.componentId,
      });
    }

    if (!component.provenance.providedBy || component.provenance.providedBy.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
        message: 'Component provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: component.componentId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(component.provenance.governanceStatus)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_GOVERNANCE,
        message: `Component provenance has invalid governance status: "${component.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: component.componentId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Gap Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge gap against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeGap(
  gap: KnowledgeGap,
): readonly KnowledgeCoverageValidationError[] {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!gap.gapId || gap.gapId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_GAP_ID,
      message: 'Knowledge gap is missing a gap ID.',
      field: 'gapId',
      id: gap.gapId,
    });
  }

  if (!gap.artifactId || gap.artifactId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
      message: 'Knowledge gap is missing an artifact ID.',
      field: 'artifactId',
      id: gap.gapId,
    });
  }

  if (!CANONICAL_GAP_TYPES.includes(gap.gapType)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_GAP,
      message: `Knowledge gap has unsupported type: "${gap.gapType}".`,
      field: 'gapType',
      id: gap.gapId,
    });
  }

  if (!CANONICAL_IMPACT_SEVERITY.includes(gap.severity)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_SEVERITY,
      message: `Knowledge gap has unsupported severity: "${gap.severity}".`,
      field: 'severity',
      id: gap.gapId,
    });
  }

  if (!gap.provenance) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
      message: 'Knowledge gap is missing provenance.',
      field: 'provenance',
      id: gap.gapId,
    });
  } else {
    if (!gap.provenance.source || gap.provenance.source.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
        message: 'Gap provenance is missing a source.',
        field: 'provenance.source',
        id: gap.gapId,
      });
    }

    if (!gap.provenance.rationale || gap.provenance.rationale.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
        message: 'Gap provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: gap.gapId,
      });
    }

    if (!gap.provenance.providedBy || gap.provenance.providedBy.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
        message: 'Gap provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: gap.gapId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge coverage report against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCoverageReport(
  report: KnowledgeCoverageReport,
): readonly KnowledgeCoverageValidationError[] {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_REPORT_ID,
      message: 'Knowledge coverage report is missing a report ID.',
      field: 'reportId',
      id: report.reportId,
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
      message: 'Knowledge coverage report is missing an artifact ID.',
      field: 'artifactId',
      id: report.reportId,
    });
  }

  if (!CANONICAL_COVERAGE_LEVELS.includes(report.overallCoverageLevel)) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_LEVEL,
      message: `Knowledge coverage report has unsupported overall level: "${report.overallCoverageLevel}".`,
      field: 'overallCoverageLevel',
      id: report.reportId,
    });
  }

  if (!report.provenance) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
      message: 'Knowledge coverage report is missing provenance.',
      field: 'provenance',
      id: report.reportId,
    });
  } else {
    if (!report.provenance.source || report.provenance.source.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
        message: 'Report provenance is missing a source.',
        field: 'provenance.source',
        id: report.reportId,
      });
    }

    if (!report.provenance.rationale || report.provenance.rationale.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
        message: 'Report provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: report.reportId,
      });
    }

    if (!report.provenance.providedBy || report.provenance.providedBy.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
        message: 'Report provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: report.reportId,
      });
    }
  }

  // Validate each component in the report
  for (const component of report.components) {
    errors.push(...validateKnowledgeCoverageComponent(component));
  }

  // Validate each gap in the report
  for (const gap of report.gaps) {
    errors.push(...validateKnowledgeGap(gap));
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge coverage registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCoverageRegistry(
  registry: KnowledgeCoverageRegistry,
): KnowledgeCoverageRegistryValidationResult {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.reports || registry.reports.length === 0) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
      message: 'Registry has no reports.',
      field: 'reports',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate report IDs
  const seenReportIds = new Set<string>();
  for (const report of registry.reports) {
    if (seenReportIds.has(report.reportId)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_REPORT,
        message: `Duplicate report ID: "${report.reportId}".`,
        id: report.reportId,
      });
    }
    seenReportIds.add(report.reportId);
  }

  // Check for duplicate component IDs
  const seenComponentIds = new Set<string>();
  for (const component of registry.components) {
    if (seenComponentIds.has(component.componentId)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_COMPONENT,
        message: `Duplicate component ID: "${component.componentId}".`,
        id: component.componentId,
      });
    }
    seenComponentIds.add(component.componentId);
  }

  // Check for duplicate gap IDs
  const seenGapIds = new Set<string>();
  for (const gap of registry.gaps) {
    if (seenGapIds.has(gap.gapId)) {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_DUPLICATE_GAP,
        message: `Duplicate gap ID: "${gap.gapId}".`,
        id: gap.gapId,
      });
    }
    seenGapIds.add(gap.gapId);
  }

  // Validate each report
  for (const report of registry.reports) {
    errors.push(...validateKnowledgeCoverageReport(report));
  }

  // Validate each component
  for (const component of registry.components) {
    errors.push(...validateKnowledgeCoverageComponent(component));
  }

  // Validate each gap
  for (const gap of registry.gaps) {
    errors.push(...validateKnowledgeGap(gap));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_coverage_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates knowledge coverage input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCoverageInput(
  input: KnowledgeCoverageInput,
): KnowledgeCoverageInputValidationResult {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!input.reports || input.reports.length === 0) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_EMPTY_REGISTRY,
      message: 'Input has no reports.',
      field: 'reports',
    });
  } else {
    for (const report of input.reports) {
      errors.push(...validateKnowledgeCoverageReport(report));
    }
  }

  for (const component of input.components) {
    errors.push(...validateKnowledgeCoverageComponent(component));
  }

  for (const gap of input.gaps) {
    errors.push(...validateKnowledgeGap(gap));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_coverage_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Coverage Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge coverage trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeCoverageTrace(
  trace: KnowledgeCoverageTrace,
): KnowledgeCoverageTraceValidationResult {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Knowledge coverage trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Knowledge coverage trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Knowledge coverage trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_INVALID_TRACE,
      message: 'Knowledge coverage trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_coverage_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Coverage Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with coverage against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithCoverage(
  artifact: KnowledgeArtifactWithCoverage,
): KnowledgeArtifactWithCoverageValidationResult {
  const errors: KnowledgeCoverageValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: COVERAGE_VALIDATION_CODES.COVERAGE_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each report
  for (const report of artifact.reports) {
    errors.push(...validateKnowledgeCoverageReport(report));
  }

  // Validate each component
  for (const component of artifact.components) {
    errors.push(...validateKnowledgeCoverageComponent(component));
  }

  // Validate each gap
  for (const gap of artifact.gaps) {
    errors.push(...validateKnowledgeGap(gap));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_coverage_composition',
  };
}
