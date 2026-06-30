/**
 * NV-1700-D5-OPT-06 — Impact Validation Layer
 *
 * Deterministic validation for impact metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeImpact,
  ConsistencyReport,
  ImpactRelationship,
  ConsistencyRegistry,
  ConsistencyTrace,
  ConsistencyInput,
  KnowledgeArtifactWithConsistency,
  ImpactValidationError,
  KnowledgeImpactValidationResult,
  ConsistencyReportValidationResult,
  ImpactRelationshipValidationResult,
  ConsistencyRegistryValidationResult,
  ConsistencyInputValidationResult,
  ConsistencyTraceValidationResult,
  KnowledgeArtifactWithConsistencyValidationResult,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_IMPACT_TYPES,
  CANONICAL_IMPACT_SEVERITY,
  CANONICAL_CONSISTENCY_STATUS,
  CANONICAL_IMPACT_RESOLUTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const IMPACT_VALIDATION_CODES = {
  IMPACT_DUPLICATE_IMPACT: 'IMPACT_DUPLICATE_IMPACT',
  IMPACT_DUPLICATE_REPORT: 'IMPACT_DUPLICATE_REPORT',
  IMPACT_DUPLICATE_RELATIONSHIP: 'IMPACT_DUPLICATE_RELATIONSHIP',
  IMPACT_INVALID_SEVERITY: 'IMPACT_INVALID_SEVERITY',
  IMPACT_INVALID_TYPE: 'IMPACT_INVALID_TYPE',
  IMPACT_INVALID_STATUS: 'IMPACT_INVALID_STATUS',
  IMPACT_INVALID_REFERENCE: 'IMPACT_INVALID_REFERENCE',
  IMPACT_SELF_REFERENCE: 'IMPACT_SELF_REFERENCE',
  IMPACT_MISSING_PROVENANCE: 'IMPACT_MISSING_PROVENANCE',
  IMPACT_MISSING_RATIONALE: 'IMPACT_MISSING_RATIONALE',
  IMPACT_MISSING_SOURCE: 'IMPACT_MISSING_SOURCE',
  IMPACT_MISSING_TARGET: 'IMPACT_MISSING_TARGET',
  IMPACT_INVALID_GOVERNANCE: 'IMPACT_INVALID_GOVERNANCE',
  IMPACT_EMPTY_REGISTRY: 'IMPACT_EMPTY_REGISTRY',
  IMPACT_INVALID_TRACE: 'IMPACT_INVALID_TRACE',
  IMPACT_RELATIONSHIP_VALIDATION: 'IMPACT_RELATIONSHIP_VALIDATION',
  IMPACT_MISSING_IMPACT_ID: 'IMPACT_MISSING_IMPACT_ID',
  IMPACT_MISSING_SOURCE_ARTIFACT: 'IMPACT_MISSING_SOURCE_ARTIFACT',
  IMPACT_MISSING_TARGET_ARTIFACT: 'IMPACT_MISSING_TARGET_ARTIFACT',
  IMPACT_MISSING_REPORT_ID: 'IMPACT_MISSING_REPORT_ID',
  IMPACT_MISSING_ARTIFACT_ID: 'IMPACT_MISSING_ARTIFACT_ID',
  IMPACT_MISSING_RELATIONSHIP_ID: 'IMPACT_MISSING_RELATIONSHIP_ID',
  IMPACT_MISSING_PROVIDED_BY: 'IMPACT_MISSING_PROVIDED_BY',
  IMPACT_INVALID_RESOLUTION_STATUS: 'IMPACT_INVALID_RESOLUTION_STATUS',
  IMPACT_INVALID_REGISTRY: 'IMPACT_INVALID_REGISTRY',
} as const;

// ---------------------------------------------------------------------------
// Single Knowledge Impact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single knowledge impact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeImpact(
  impact: KnowledgeImpact,
): readonly ImpactValidationError[] {
  const errors: ImpactValidationError[] = [];

  if (!impact.impactId || impact.impactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_IMPACT_ID,
      message: 'Knowledge impact is missing an impact ID.',
      field: 'impactId',
      id: impact.impactId,
    });
  }

  if (!impact.sourceArtifactId || impact.sourceArtifactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE_ARTIFACT,
      message: 'Knowledge impact is missing a source artifact ID.',
      field: 'sourceArtifactId',
      id: impact.impactId,
    });
  }

  if (!impact.targetArtifactId || impact.targetArtifactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_TARGET_ARTIFACT,
      message: 'Knowledge impact is missing a target artifact ID.',
      field: 'targetArtifactId',
      id: impact.impactId,
    });
  }

  if (impact.sourceArtifactId === impact.targetArtifactId) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_SELF_REFERENCE,
      message: 'Knowledge impact references itself.',
      field: 'targetArtifactId',
      id: impact.impactId,
    });
  }

  if (!CANONICAL_IMPACT_TYPES.includes(impact.impactType)) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TYPE,
      message: `Knowledge impact has unsupported type: "${impact.impactType}".`,
      field: 'impactType',
      id: impact.impactId,
    });
  }

  if (!CANONICAL_IMPACT_SEVERITY.includes(impact.severity)) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_SEVERITY,
      message: `Knowledge impact has unsupported severity: "${impact.severity}".`,
      field: 'severity',
      id: impact.impactId,
    });
  }

  if (!impact.provenance) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
      message: 'Knowledge impact is missing provenance.',
      field: 'provenance',
      id: impact.impactId,
    });
  } else {
    if (!impact.provenance.source || impact.provenance.source.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE,
        message: 'Impact provenance is missing a source.',
        field: 'provenance.source',
        id: impact.impactId,
      });
    }

    if (!impact.provenance.rationale || impact.provenance.rationale.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
        message: 'Impact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: impact.impactId,
      });
    }

    if (!impact.provenance.providedBy || impact.provenance.providedBy.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
        message: 'Impact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: impact.impactId,
      });
    }

    if (!CANONICAL_GOVERNANCE_STATUSES.includes(impact.provenance.governanceStatus)) {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_GOVERNANCE,
        message: `Impact provenance has invalid governance status: "${impact.provenance.governanceStatus}".`,
        field: 'provenance.governanceStatus',
        id: impact.impactId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Consistency Report Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single consistency report against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConsistencyReport(
  report: ConsistencyReport,
): readonly ImpactValidationError[] {
  const errors: ImpactValidationError[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_REPORT_ID,
      message: 'Consistency report is missing a report ID.',
      field: 'reportId',
      id: report.reportId,
    });
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_ARTIFACT_ID,
      message: 'Consistency report is missing an artifact ID.',
      field: 'artifactId',
      id: report.reportId,
    });
  }

  if (!report.provenance) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
      message: 'Consistency report is missing provenance.',
      field: 'provenance',
      id: report.reportId,
    });
  } else {
    if (!report.provenance.source || report.provenance.source.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE,
        message: 'Report provenance is missing a source.',
        field: 'provenance.source',
        id: report.reportId,
      });
    }

    if (!report.provenance.rationale || report.provenance.rationale.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
        message: 'Report provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: report.reportId,
      });
    }

    if (!report.provenance.providedBy || report.provenance.providedBy.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
        message: 'Report provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: report.reportId,
      });
    }
  }

  // Validate each impact in the report
  for (const impact of report.impacts) {
    errors.push(...validateKnowledgeImpact(impact));
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Impact Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single impact relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateImpactRelationship(
  relationship: ImpactRelationship,
): readonly ImpactValidationError[] {
  const errors: ImpactValidationError[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_RELATIONSHIP_ID,
      message: 'Impact relationship is missing a relationship ID.',
      field: 'relationshipId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.sourceArtifactId || relationship.sourceArtifactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE_ARTIFACT,
      message: 'Impact relationship is missing a source artifact ID.',
      field: 'sourceArtifactId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.targetArtifactId || relationship.targetArtifactId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_TARGET_ARTIFACT,
      message: 'Impact relationship is missing a target artifact ID.',
      field: 'targetArtifactId',
      id: relationship.relationshipId,
    });
  }

  if (relationship.sourceArtifactId === relationship.targetArtifactId) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_SELF_REFERENCE,
      message: 'Impact relationship references itself.',
      field: 'targetArtifactId',
      id: relationship.relationshipId,
    });
  }

  if (!relationship.provenance) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
      message: 'Impact relationship is missing provenance.',
      field: 'provenance',
      id: relationship.relationshipId,
    });
  } else {
    if (!relationship.provenance.source || relationship.provenance.source.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE,
        message: 'Relationship provenance is missing a source.',
        field: 'provenance.source',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.rationale || relationship.provenance.rationale.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
        message: 'Relationship provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: relationship.relationshipId,
      });
    }

    if (!relationship.provenance.providedBy || relationship.provenance.providedBy.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
        message: 'Relationship provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: relationship.relationshipId,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Consistency Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a consistency registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConsistencyRegistry(
  registry: ConsistencyRegistry,
): ConsistencyRegistryValidationResult {
  const errors: ImpactValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.reports || registry.reports.length === 0) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_EMPTY_REGISTRY,
      message: 'Registry has no reports.',
      field: 'reports',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate report IDs
  const seenReportIds = new Set<string>();
  for (const report of registry.reports) {
    if (seenReportIds.has(report.reportId)) {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_DUPLICATE_REPORT,
        message: `Duplicate report ID: "${report.reportId}".`,
        id: report.reportId,
      });
    }
    seenReportIds.add(report.reportId);
  }

  // Check for duplicate relationship IDs
  const seenRelationshipIds = new Set<string>();
  for (const relationship of registry.relationships) {
    if (seenRelationshipIds.has(relationship.relationshipId)) {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_DUPLICATE_RELATIONSHIP,
        message: `Duplicate relationship ID: "${relationship.relationshipId}".`,
        id: relationship.relationshipId,
      });
    }
    seenRelationshipIds.add(relationship.relationshipId);
  }

  // Validate each report
  for (const report of registry.reports) {
    errors.push(...validateConsistencyReport(report));
  }

  // Validate each relationship
  for (const relationship of registry.relationships) {
    errors.push(...validateImpactRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'consistency_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Consistency Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates consistency input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConsistencyInput(
  input: ConsistencyInput,
): ConsistencyInputValidationResult {
  const errors: ImpactValidationError[] = [];

  if (!input.reports || input.reports.length === 0) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_EMPTY_REGISTRY,
      message: 'Input has no reports.',
      field: 'reports',
    });
  } else {
    for (const report of input.reports) {
      errors.push(...validateConsistencyReport(report));
    }
  }

  for (const relationship of input.relationships) {
    errors.push(...validateImpactRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'consistency_input_composition',
  };
}

// ---------------------------------------------------------------------------
// Consistency Trace Validation
// ---------------------------------------------------------------------------

/**
 * Validates a consistency trace against canonical invariants.
 * Pure function. No side effects.
 */
export function validateConsistencyTrace(
  trace: ConsistencyTrace,
): ConsistencyTraceValidationResult {
  const errors: ImpactValidationError[] = [];

  if (!trace.traceId || trace.traceId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Consistency trace is missing a trace ID.',
      field: 'traceId',
    });
  }

  if (trace.deterministic !== true) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Consistency trace must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (trace.randomUsed !== false) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Consistency trace must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (trace.timeDependency !== false) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_INVALID_TRACE,
      message: 'Consistency trace must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'consistency_trace_composition',
  };
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Consistency Validation
// ---------------------------------------------------------------------------

/**
 * Validates a knowledge artifact with consistency against canonical invariants.
 * Pure function. No side effects.
 */
export function validateKnowledgeArtifactWithConsistency(
  artifact: KnowledgeArtifactWithConsistency,
): KnowledgeArtifactWithConsistencyValidationResult {
  const errors: ImpactValidationError[] = [];

  if (!artifact.knowledgeId || artifact.knowledgeId.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a knowledge ID.',
      field: 'knowledgeId',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.title || artifact.title.trim() === '') {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_ARTIFACT_ID,
      message: 'Knowledge artifact is missing a title.',
      field: 'title',
      id: artifact.knowledgeId,
    });
  }

  if (!artifact.provenance) {
    errors.push({
      code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVENANCE,
      message: 'Knowledge artifact is missing provenance.',
      field: 'provenance',
      id: artifact.knowledgeId,
    });
  } else {
    if (!artifact.provenance.source || artifact.provenance.source.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_SOURCE,
        message: 'Knowledge artifact provenance is missing a source.',
        field: 'provenance.source',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.rationale || artifact.provenance.rationale.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_RATIONALE,
        message: 'Knowledge artifact provenance is missing a rationale.',
        field: 'provenance.rationale',
        id: artifact.knowledgeId,
      });
    }

    if (!artifact.provenance.providedBy || artifact.provenance.providedBy.trim() === '') {
      errors.push({
        code: IMPACT_VALIDATION_CODES.IMPACT_MISSING_PROVIDED_BY,
        message: 'Knowledge artifact provenance is missing providedBy.',
        field: 'provenance.providedBy',
        id: artifact.knowledgeId,
      });
    }
  }

  // Validate each report
  for (const report of artifact.reports) {
    errors.push(...validateConsistencyReport(report));
  }

  // Validate each relationship
  for (const relationship of artifact.relationships) {
    errors.push(...validateImpactRelationship(relationship));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'knowledge_artifact_with_consistency_composition',
  };
}
