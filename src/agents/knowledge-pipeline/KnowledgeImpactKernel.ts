/**
 * NV-1700-D5-OPT-06 — Dependency-Aware Consistency Analysis & Impact Validation Kernel
 *
 * Deterministic orchestration functions for impact metadata.
 * Produces impacts, reports, relationships, traces, and registries.
 *
 * This module never:
 * - Performs automatic repairs
 * - Mutates artifacts
 * - Generates knowledge
 * - Infers dependencies
 * - Infers relationships
 * - Publishes automatically
 * - Makes editorial decisions
 * - Calls LLMs
 * - Calls external APIs
 *
 * Dependency-aware consistency analysis metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  KnowledgeImpact,
  ConsistencyReport,
  ImpactRelationship,
  ImpactProvenance,
  ConsistencyTrace,
  ConsistencyRegistry,
  ConsistencyRegistryMetadata,
  ConsistencyInput,
  ImpactType,
  ImpactSeverity,
  ConsistencyStatus,
  ImpactResolutionStatus,
  KnowledgeGovernanceStatus,
  KnowledgeArtifactWithConsistency,
} from './KnowledgeAgentContract.ts';

import {
  CANONICAL_IMPACT_TYPES,
  CANONICAL_IMPACT_SEVERITY,
  CANONICAL_CONSISTENCY_STATUS,
  CANONICAL_IMPACT_RESOLUTION_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './KnowledgeAgentContract.ts';

// ---------------------------------------------------------------------------
// Impact Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes impact provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeImpactProvenance(params: {
  readonly source: string;
  readonly governanceStatus: KnowledgeGovernanceStatus;
  readonly providedBy: string;
  readonly rationale: string;
}): ImpactProvenance {
  return {
    source: params.source,
    governanceStatus: params.governanceStatus,
    providedBy: params.providedBy,
    rationale: params.rationale,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Impact Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge impact from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeImpact(params: {
  readonly impactId: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly impactType: ImpactType;
  readonly severity: ImpactSeverity;
  readonly description: string;
  readonly rationale: string;
  readonly provenance: ImpactProvenance;
}): KnowledgeImpact {
  return {
    impactId: params.impactId,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    impactType: params.impactType,
    severity: params.severity,
    description: params.description,
    rationale: params.rationale,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Consistency Report Composition
// ---------------------------------------------------------------------------

/**
 * Composes a consistency report from provided parameters.
 * Pure function. No side effects.
 */
export function composeConsistencyReport(params: {
  readonly reportId: string;
  readonly artifactId: string;
  readonly impacts: readonly KnowledgeImpact[];
  readonly affectedArtifacts: readonly string[];
  readonly summary: string;
  readonly provenance: ImpactProvenance;
}): ConsistencyReport {
  return {
    reportId: params.reportId,
    artifactId: params.artifactId,
    impacts: [...params.impacts],
    affectedArtifacts: [...params.affectedArtifacts],
    summary: params.summary,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Impact Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an impact relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeImpactRelationship(params: {
  readonly relationshipId: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly provenance: ImpactProvenance;
}): ImpactRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    relationshipType: params.relationshipType,
    description: params.description,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Consistency Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a consistency trace from metadata.
 * Pure function. No side effects.
 */
export function composeConsistencyTrace(params: {
  readonly traceId: string;
  readonly decisionCount: number;
  readonly validationCount: number;
  readonly registryVersion: string;
  readonly compositionVersion: string;
  readonly deterministicHashMetadata: string;
  readonly compositionMetadata: string;
}): ConsistencyTrace {
  return {
    traceId: params.traceId,
    decisionCount: params.decisionCount,
    validationCount: params.validationCount,
    registryVersion: params.registryVersion,
    compositionVersion: params.compositionVersion,
    deterministicHashMetadata: params.deterministicHashMetadata,
    compositionMetadata: params.compositionMetadata,
    deterministic: true,
    generatedFrom: 'deterministic_impact_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparators
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for consistency reports.
 * Sorts by reportId, then artifactId.
 * Pure function. No side effects.
 */
function _compareConsistencyReport(
  a: ConsistencyReport,
  b: ConsistencyReport,
): number {
  if (a.reportId < b.reportId) return -1;
  if (a.reportId > b.reportId) return 1;

  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  return 0;
}

/**
 * Deterministic comparator for impact relationships.
 * Sorts by relationshipId, then sourceArtifactId, then targetArtifactId.
 * Pure function. No side effects.
 */
function _compareImpactRelationship(
  a: ImpactRelationship,
  b: ImpactRelationship,
): number {
  if (a.relationshipId < b.relationshipId) return -1;
  if (a.relationshipId > b.relationshipId) return 1;

  if (a.sourceArtifactId < b.sourceArtifactId) return -1;
  if (a.sourceArtifactId > b.sourceArtifactId) return 1;

  if (a.targetArtifactId < b.targetArtifactId) return -1;
  if (a.targetArtifactId > b.targetArtifactId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Consistency Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a consistency registry from reports and relationships.
 * Pure function. No side effects.
 * Deterministic ordering for all collections.
 */
export function composeConsistencyRegistry(
  reports: readonly ConsistencyReport[],
  relationships: readonly ImpactRelationship[],
): ConsistencyRegistry {
  const sortedReports = [...reports].sort(_compareConsistencyReport);
  const sortedRelationships = [...relationships].sort(_compareImpactRelationship);

  const impactTypes = new Set(
    sortedReports.flatMap((r) => r.impacts.map((i) => i.impactType)),
  );

  const metadata: ConsistencyRegistryMetadata = {
    registryId: `_registry_${sortedReports.length}_${sortedRelationships.length}`,
    reportCount: sortedReports.length,
    impactCount: sortedReports.reduce((sum, r) => sum + r.impacts.length, 0),
    relationshipCount: sortedRelationships.length,
    impactTypeCount: impactTypes.size,
  };

  return {
    registryId: metadata.registryId,
    reports: sortedReports,
    relationships: sortedRelationships,
    metadata,
    trace: {
      traceId: `_trace_${sortedReports.length}_${sortedRelationships.length}`,
      decisionCount: 0,
      validationCount: 0,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministicHashMetadata: '_hash_default',
      compositionMetadata: '_composition_default',
      deterministic: true,
      generatedFrom: 'deterministic_impact_kernel',
      randomUsed: false,
      timeDependency: false,
    },
    deterministic: true,
    generatedFrom: 'deterministic_impact_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Consistency Registry From Input Composition
// ---------------------------------------------------------------------------

/**
 * Composes a consistency registry from an input.
 * Pure function. No side effects.
 */
export function composeConsistencyRegistryFromInput(
  input: ConsistencyInput,
): ConsistencyRegistry {
  return composeConsistencyRegistry(
    input.reports,
    input.relationships,
  );
}

// ---------------------------------------------------------------------------
// Knowledge Consistency Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete consistency registry from an input.
 * Pure function. No side effects.
 */
export function composeKnowledgeConsistency(
  input: ConsistencyInput,
): ConsistencyRegistry {
  let decisionCount = 0;
  let validationCount = 0;

  for (const report of input.reports) {
    decisionCount++;
    const errors = _validateReportForDecision(report);
    if (errors.length === 0) validationCount++;
  }

  for (const relationship of input.relationships) {
    decisionCount++;
    const errors = _validateRelationshipForDecision(relationship);
    if (errors.length === 0) validationCount++;
  }

  const registry = composeConsistencyRegistry(
    input.reports,
    input.relationships,
  );

  return {
    ...registry,
    trace: composeConsistencyTrace({
      traceId: `_trace_${input.reports.length}_${input.relationships.length}`,
      decisionCount,
      validationCount,
      registryVersion: '1.0.0',
      compositionVersion: '1.0.0',
      deterministicHashMetadata: '_hash_default',
      compositionMetadata: '_composition_default',
    }),
  };
}

/**
 * Validates a consistency report for decision composition.
 * Pure function. No side effects.
 */
function _validateReportForDecision(
  report: ConsistencyReport,
): readonly string[] {
  const errors: string[] = [];

  if (!report.reportId || report.reportId.trim() === '') {
    errors.push('IMPACT_MISSING_REPORT_ID');
  }

  if (!report.artifactId || report.artifactId.trim() === '') {
    errors.push('IMPACT_MISSING_ARTIFACT_ID');
  }

  if (!report.provenance) {
    errors.push('IMPACT_MISSING_PROVENANCE');
  }

  return errors;
}

/**
 * Validates an impact relationship for decision composition.
 * Pure function. No side effects.
 */
function _validateRelationshipForDecision(
  relationship: ImpactRelationship,
): readonly string[] {
  const errors: string[] = [];

  if (!relationship.relationshipId || relationship.relationshipId.trim() === '') {
    errors.push('IMPACT_MISSING_RELATIONSHIP_ID');
  }

  if (!relationship.sourceArtifactId || relationship.sourceArtifactId.trim() === '') {
    errors.push('IMPACT_MISSING_SOURCE_ARTIFACT');
  }

  if (!relationship.targetArtifactId || relationship.targetArtifactId.trim() === '') {
    errors.push('IMPACT_MISSING_TARGET_ARTIFACT');
  }

  if (relationship.sourceArtifactId === relationship.targetArtifactId) {
    errors.push('IMPACT_SELF_REFERENCE');
  }

  if (!relationship.provenance) {
    errors.push('IMPACT_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Knowledge Artifact With Consistency Composition
// ---------------------------------------------------------------------------

/**
 * Composes a knowledge artifact with consistency from provided parameters.
 * Pure function. No side effects.
 */
export function composeKnowledgeArtifactWithConsistency(params: {
  readonly knowledgeId: string;
  readonly title: string;
  readonly reports: readonly ConsistencyReport[];
  readonly relationships: readonly ImpactRelationship[];
  readonly provenance: ImpactProvenance;
}): KnowledgeArtifactWithConsistency {
  return {
    knowledgeId: params.knowledgeId,
    title: params.title,
    reports: [...params.reports],
    relationships: [...params.relationships],
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported impact type.
 */
export function isSupportedImpactType(
  impactType: string,
): impactType is ImpactType {
  return CANONICAL_IMPACT_TYPES.includes(impactType as ImpactType);
}

/**
 * Checks if a string is a supported impact severity.
 */
export function isSupportedImpactSeverity(
  severity: string,
): severity is ImpactSeverity {
  return CANONICAL_IMPACT_SEVERITY.includes(severity as ImpactSeverity);
}

/**
 * Checks if a string is a supported consistency status.
 */
export function isSupportedConsistencyStatus(
  status: string,
): status is ConsistencyStatus {
  return CANONICAL_CONSISTENCY_STATUS.includes(status as ConsistencyStatus);
}

/**
 * Checks if a string is a supported impact resolution status.
 */
export function isSupportedImpactResolutionStatus(
  resolutionStatus: string,
): resolutionStatus is ImpactResolutionStatus {
  return CANONICAL_IMPACT_RESOLUTION_STATUS.includes(
    resolutionStatus as ImpactResolutionStatus,
  );
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
 * Returns the canonical impact types.
 */
export function getCanonicalImpactTypes(): readonly ImpactType[] {
  return CANONICAL_IMPACT_TYPES;
}

/**
 * Returns the canonical impact severities.
 */
export function getCanonicalImpactSeverities(): readonly ImpactSeverity[] {
  return CANONICAL_IMPACT_SEVERITY;
}

/**
 * Returns the canonical consistency statuses.
 */
export function getCanonicalConsistencyStatuses(): readonly ConsistencyStatus[] {
  return CANONICAL_CONSISTENCY_STATUS;
}

/**
 * Returns the canonical impact resolution statuses.
 */
export function getCanonicalImpactResolutionStatuses(): readonly ImpactResolutionStatus[] {
  return CANONICAL_IMPACT_RESOLUTION_STATUS;
}
