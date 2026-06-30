/**
 * NV-1700-D5-OPT-07 — Editorial Quality Validation Layer
 *
 * Deterministic validation for editorial quality metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  EditorialQualityDimension,
  EditorialQualityFinding,
  EditorialQualityReport,
  EditorialQualityRegistry,
  EditorialQualityTrace,
  EditorialQualityInput,
  KnowledgeArtifactWithEditorialQuality,
  EditorialQualityValidationError,
  EditorialQualityDimensionValidationResult,
  EditorialQualityFindingValidationResult,
  EditorialQualityReportValidationResult,
  EditorialQualityRegistryValidationResult,
  EditorialQualityInputValidationResult,
  EditorialQualityTraceValidationResult,
  KnowledgeArtifactWithEditorialQualityValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EDITORIAL_QUALITY_VALIDATION_CODES = {
  QUALITY_DUPLICATE_REPORT: 'QUALITY_DUPLICATE_REPORT',
  QUALITY_DUPLICATE_DIMENSION: 'QUALITY_DUPLICATE_DIMENSION',
  QUALITY_DUPLICATE_FINDING: 'QUALITY_DUPLICATE_FINDING',
  QUALITY_INVALID_DIMENSION: 'QUALITY_INVALID_DIMENSION',
  QUALITY_INVALID_LEVEL: 'QUALITY_INVALID_LEVEL',
  QUALITY_INVALID_FINDING: 'QUALITY_INVALID_FINDING',
  QUALITY_INVALID_SCORE: 'QUALITY_INVALID_SCORE',
  QUALITY_SCORE_OUT_OF_RANGE: 'QUALITY_SCORE_OUT_OF_RANGE',
  QUALITY_MISSING_PROVENANCE: 'QUALITY_MISSING_PROVENANCE',
  QUALITY_MISSING_RATIONALE: 'QUALITY_MISSING_RATIONALE',
  QUALITY_MISSING_SOURCE: 'QUALITY_MISSING_SOURCE',
  QUALITY_INVALID_GOVERNANCE: 'QUALITY_INVALID_GOVERNANCE',
  QUALITY_INVALID_REFERENCES: 'QUALITY_INVALID_REFERENCES',
  QUALITY_EMPTY_REGISTRY: 'QUALITY_EMPTY_REGISTRY',
  QUALITY_INVALID_TRACE: 'QUALITY_INVALID_TRACE',
  QUALITY_MISSING_REPORT_ID: 'QUALITY_MISSING_REPORT_ID',
  QUALITY_MISSING_ARTIFACT_ID: 'QUALITY_MISSING_ARTIFACT_ID',
  QUALITY_MISSING_DIMENSION_ID: 'QUALITY_MISSING_DIMENSION_ID',
  QUALITY_MISSING_FINDING_ID: 'QUALITY_MISSING_FINDING_ID',
  QUALITY_MISSING_PROVIDED_BY: 'QUALITY_MISSING_PROVIDED_BY',
  QUALITY_INVALID_SEVERITY: 'QUALITY_INVALID_SEVERITY',
  QUALITY_INVALID_REGISTRY: 'QUALITY_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Editorial Quality Dimension Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single editorial quality dimension against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityDimension(
  dimension: EditorialQualityDimension,
): readonly EditorialQualityValidationError[] {
  const errors: EditorialQualityValidationError[] = [];

  if (!dimension.dimensionId || dimension.dimensionId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_DIMENSION_ID,
      message: 'Editorial quality dimension is missing a dimension ID.',
      field: 'dimensionId',
      id: dimension.dimensionId,
    });
  }

  if (!CANONICAL_QUALITY_DIMENSIONS.includes(dimension.dimensionType)) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_DIMENSION,
      message: `Editorial quality dimension has unsupported type: "${dimension.dimensionType}".`,
      field: 'dimensionType',
      id: dimension.dimensionId,
    });
  }

  if (!CANONICAL_QUALITY_LEVELS.includes(dimension.qualityLevel)) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_LEVEL,
      message: `Editorial quality dimension has unsupported level: "${dimension.qualityLevel}".`,
      field: 'qualityLevel',
      id: dimension.dimensionId,
    });
  }

  if (dimension.score < 0 || dimension.score > 1) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_SCORE,
      message: `Editorial quality dimension has invalid score: ${dimension.score}.`,
      field: 'score',
      id: dimension.dimensionId,
    });
  }

  if (!dimension.provenance) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
      message: 'Editorial quality dimension is missing provenance.',
      field: 'provenance',
      id: dimension.dimensionId,
    });
  } else {
    if (!dimension.provenance.source || dimension.provenance.source.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_SOURCE,
        message: 'Dimension provenance is missing a source.',
        field: 'provenance.source',
        id: dimension.dimensionId,
      });
    }

    if (!dimension.provenance.rationale || dimension.provenance.rationale.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
        message: 'Dimension provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: dimension.dimensionId,
      });
    }

    if (!dimension.provenance.providedBy || dimension.provenance.providedBy.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
        message: 'Dimension provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: dimension.dimensionId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(dimension.provenance.governanceStatus)) {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_GOVERNANCE,
        message: `Dimension provenance has invalid governance status: "${dimension.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: dimension.dimensionId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Editorial Quality Finding Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single editorial quality finding against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityFinding(
  finding: EditorialQualityFinding,
): readonly EditorialQualityValidationError[] {
  const errors: EditorialQualityValidationError[] = [];

  if (!finding.findingId || finding.findingId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_FINDING_ID,
      message: 'Editorial quality finding is missing a finding ID.',
      field: 'findingId',
      id: finding.findingId,
    });
  }

  if (!CANONICAL_QUALITY_FINDINGS.includes(finding.findingType)) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_FINDING,
      message: `Editorial quality finding has unsupported type: "${finding.findingType}".`,
      field: 'findingType',
      id: finding.findingId,
    });
  }

  if (!CANONICAL_IMPACT_SEVERITY.includes(finding.severity)) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_SEVERITY,
      message: `Editorial quality finding has unsupported severity: "${finding.severity}".`,
      field: 'severity',
      id: finding.findingId,
    });
  }

  if (!finding.affectedArtifactId || finding.affectedArtifactId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
      message: 'Editorial quality finding is missing an affected artifact ID.',
      field: 'affectedArtifactId',
      id: finding.findingId,
    });
  }

  if (!finding.provenance) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
      message: 'Editorial quality finding is missing provenance.',
      field: 'provenance',
      id: finding.findingId,
    });
  } else {
    if (!finding.provenance.source || finding.provenance.source.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_SOURCE,
        message: 'Finding provenance is missing a source.',
        field: 'provenance.source',
        id: finding.findingId,
      });
    }

    if (!finding.provenance.rationale || finding.provenance.rationale.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
        message: 'Finding provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: finding.findingId,
      });
    }

    if (!finding.provenance.providedBy || finding.provenance.providedBy.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
        message: 'Finding provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: finding.findingId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Editorial Quality Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single editorial quality report against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityReport(
  report: EditorialQualityReport,
): readonly EditorialQualityValidationError[] {
  const errors: EditorialQualityValidationError[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_REPORT_ID,
      message: 'Editorial quality report is missing a report ID.',
      field: 'reportId',
      id: report.reportId,
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
      message: 'Editorial quality report is missing an artifact ID.',
      field: 'artifactId',
      id: report.reportId,
    });
  }

  if (report.overallScore < 0 || report.overallScore > 1) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_SCORE,
      message: `Editorial quality report has invalid overall score: ${report.overallScore}.`,
      field: 'overallScore',
      id: report.reportId,
    });
  }

  if (!CANONICAL_QUALITY_LEVELS.includes(report.qualityLevel)) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_LEVEL,
      message: `Editorial quality report has unsupported quality level: "${report.qualityLevel}".`,
      field: 'qualityLevel',
      id: report.reportId,
    });
  }

  if (!report.provenance) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
      message: 'Editorial quality report is missing provenance.',
      field: 'provenance',
      id: report.reportId,
    });
  } else {
    if (!report.provenance.source || report.provenance.source.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_SOURCE,
        message: 'Report provenance is missing a source.',
        field: 'provenance.source',
        id: report.reportId,
      });
    }

    if (!report.provenance.rationale || report.provenance.rationale.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
        message: 'Report provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: report.reportId,
      });
    }

    if (!report.provenance.providedBy || report.provenance.providedBy.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
        message: 'Report provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: report.reportId,
      });
    }
  }

  // Validate each dimension in the report
  for (const dimension of report.dimensions) {
    errors.push(...validateEditorialQualityDimension(dimension));
  }

  // Validate each finding in the report
  for (const finding of report.findings) {
    errors.push(...validateEditorialQualityFinding(finding));
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Editorial Quality Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an editorial quality registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityRegistry(
  registry: EditorialQualityRegistry,
): EditorialQualityRegistryValidationResult {
  const errors: EditorialQualityValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.reports || registry.reports.length === 0) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_EMPTY_REGISTRY,
      message: 'Registry has no reports.',
      field: 'reports',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate report IDs
  const seenReportIds = new Set<string>();
  for (const report of registry.reports) {
    if (seenReportIds.has(report.reportId)) {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_REPORT,
        message: `Duplicate report ID: "${report.reportId}".`,
        id: report.reportId,
      });
    }
    seenReportIds.add(report.reportId);
  }

  // Check for duplicate dimension IDs
  const seenDimensionIds = new Set<string>();
  for (const dimension of registry.dimensions) {
    if (seenDimensionIds.has(dimension.dimensionId)) {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_DIMENSION,
        message: `Duplicate dimension ID: "${dimension.dimensionId}".`,
        id: dimension.dimensionId,
      });
    }
    seenDimensionIds.add(dimension.dimensionId);
  }

  // Check for duplicate finding IDs
  const seenFindingIds = new Set<string>();
  for (const finding of registry.findings) {
    if (seenFindingIds.has(finding.findingId)) {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_DUPLICATE_FINDING,
        message: `Duplicate finding ID: "${finding.findingId}".`,
        id: finding.findingId,
      });
    }
    seenFindingIds.add(finding.findingId);
  }

  // Validate each report
  for (const report of registry.reports) {
    errors.push(...validateEditorialQualityReport(report));
  }

  // Validate each dimension
  for (const dimension of registry.dimensions) {
    errors.push(...validateEditorialQualityDimension(dimension));
  }

  // Validate each finding
  for (const finding of registry.findings) {
    errors.push(...validateEditorialQualityFinding(finding));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'editorial_quality_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates editorial quality input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityInput(
  input: EditorialQualityInput,
): EditorialQualityInputValidationResult {
  const errors: EditorialQualityValidationError[] = [];

  if (!input.reports || input.reports.length === 0) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_EMPTY_REGISTRY,
      message: 'Input has no reports.',
      field: 'reports',
    });
  } else {
    for (const report of input.reports) {
      errors.push(...validateEditorialQualityReport(report));
    }
  }

  for (const dimension of input.dimensions) {
    errors.push(...validateEditorialQualityDimension(dimension));
  }

  for (const finding of input.findings) {
    errors.push(...validateEditorialQualityFinding(finding));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'editorial_quality_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Editorial Quality Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates an editorial quality trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEditorialQualityTrace(
  trace: EditorialQualityTrace,
): EditorialQualityTraceValidationResult {
  const errors: EditorialQualityValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Editorial quality trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Editorial quality trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Editorial quality trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_INVALID_TRACE,
      message: 'Editorial quality trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'editorial_quality_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Editorial Quality Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with editorial quality against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithEditorialQuality(
  artifact: KnowledgeArtifactWithEditorialQuality,
): KnowledgeArtifactWithEditorialQualityValidationResult {
  const errors: EditorialQualityValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: EDITORIAL_QUALITY_VALIDATION_CODES.QUALITY_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each report
  for (const report of artifact.reports) {
    errors.push(...validateEditorialQualityReport(report));
  }

  // Validate each dimension
  for (const dimension of artifact.dimensions) {
    errors.push(...validateEditorialQualityDimension(dimension));
  }

  // Validate each finding
  for (const finding of artifact.findings) {
    errors.push(...validateEditorialQualityFinding(finding));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_editorial_quality_composition',
  };
}
