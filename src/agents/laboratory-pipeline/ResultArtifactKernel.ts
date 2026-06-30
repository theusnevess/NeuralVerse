/**
 * NV-1600-D4-OPT-05 — Visualization, Observation & Result Artifact Modeling Kernel
 *
 * Deterministic orchestration functions for result artifact metadata.
 * Produces visualizations, observations, metrics, artifacts, relationships,
 * artifacts, traces, and registries.
 *
 * This module never:
 * - Executes experiments
 * - Generates visualizations
 * - Renders charts
 * - Generates SVG
 * - Generates PNG
 * - Calculates metrics
 * - Infers observations
 * - Summarizes experiments
 * - Compares results
 * - Executes algorithms
 * - Accesses datasets
 * - Rewrites artifacts
 * - Generates reports
 * - Generates code
 * - Mutates registries
 *
 * Result artifact metadata only.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryVisualization,
  LaboratoryObservation,
  LaboratoryMetric,
  LaboratoryResultArtifact,
  ResultArtifactRelationship,
  ResultArtifactRegistry,
  ResultArtifactDecision,
  ResultArtifactTrace,
  ResultArtifactInput,
  LaboratoryArtifactWithResults,
  VisualizationProvenance,
  ObservationProvenance,
  MetricProvenance,
  ResultArtifactProvenance,
  ArtifactRelationshipProvenance,
  VisualizationType,
  ObservationType,
  MetricType,
  ResultArtifactType,
  ResultArtifactStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_OBSERVATION_TYPES,
  CANONICAL_RESULT_ARTIFACT_TYPES,
  CANONICAL_METRIC_TYPES,
  CANONICAL_RESULT_ARTIFACT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Visualization Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes visualization provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisualizationProvenance(params: {
  readonly visualizationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): VisualizationProvenance {
  return {
    visualizationId: params.visualizationId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Observation Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes observation provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeObservationProvenance(params: {
  readonly observationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ObservationProvenance {
  return {
    observationId: params.observationId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Metric Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes metric provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeMetricProvenance(params: {
  readonly metricId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): MetricProvenance {
  return {
    metricId: params.metricId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Result Artifact Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes result artifact provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeResultArtifactProvenance(params: {
  readonly artifactId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ResultArtifactProvenance {
  return {
    artifactId: params.artifactId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Artifact Relationship Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes artifact relationship provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeArtifactRelationshipProvenance(params: {
  readonly relationshipId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ArtifactRelationshipProvenance {
  return {
    relationshipId: params.relationshipId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Visualization Composition
// ---------------------------------------------------------------------------

/**
 * Composes a visualization from provided parameters.
 * Pure function. No side effects.
 */
export function composeVisualization(params: {
  readonly visualizationId: string;
  readonly visualizationType: VisualizationType;
  readonly title: string;
  readonly description: string;
  readonly experimentId: string;
  readonly expectedOutputId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: VisualizationProvenance;
}): LaboratoryVisualization {
  return {
    visualizationId: params.visualizationId,
    visualizationType: params.visualizationType,
    title: params.title,
    description: params.description,
    experimentId: params.experimentId,
    expectedOutputId: params.expectedOutputId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Observation Composition
// ---------------------------------------------------------------------------

/**
 * Composes an observation from provided parameters.
 * Pure function. No side effects.
 */
export function composeObservation(params: {
  readonly observationId: string;
  readonly observationType: ObservationType;
  readonly description: string;
  readonly experimentId: string;
  readonly relatedArtifacts: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ObservationProvenance;
}): LaboratoryObservation {
  return {
    observationId: params.observationId,
    observationType: params.observationType,
    description: params.description,
    experimentId: params.experimentId,
    relatedArtifacts: [...params.relatedArtifacts],
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Metric Composition
// ---------------------------------------------------------------------------

/**
 * Composes a metric from provided parameters.
 * Pure function. No side effects.
 */
export function composeMetric(params: {
  readonly metricId: string;
  readonly metricType: MetricType;
  readonly displayName: string;
  readonly unit: string;
  readonly expectedRange: string;
  readonly experimentId: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: MetricProvenance;
}): LaboratoryMetric {
  return {
    metricId: params.metricId,
    metricType: params.metricType,
    displayName: params.displayName,
    unit: params.unit,
    expectedRange: params.expectedRange,
    experimentId: params.experimentId,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Result Artifact Composition
// ---------------------------------------------------------------------------

/**
 * Composes a result artifact from provided parameters.
 * Pure function. No side effects.
 */
export function composeResultArtifact(params: {
  readonly artifactId: string;
  readonly artifactType: ResultArtifactType;
  readonly experimentId: string;
  readonly visualizationId: string;
  readonly metricId: string;
  readonly observationId: string;
  readonly status: ResultArtifactStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ResultArtifactProvenance;
}): LaboratoryResultArtifact {
  return {
    artifactId: params.artifactId,
    artifactType: params.artifactType,
    experimentId: params.experimentId,
    visualizationId: params.visualizationId,
    metricId: params.metricId,
    observationId: params.observationId,
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Artifact Relationship Composition
// ---------------------------------------------------------------------------

/**
 * Composes an artifact relationship from provided parameters.
 * Pure function. No side effects.
 */
export function composeArtifactRelationship(params: {
  readonly relationshipId: string;
  readonly sourceArtifactId: string;
  readonly targetArtifactId: string;
  readonly relationshipType: string;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ArtifactRelationshipProvenance;
}): ResultArtifactRelationship {
  return {
    relationshipId: params.relationshipId,
    sourceArtifactId: params.sourceArtifactId,
    targetArtifactId: params.targetArtifactId,
    relationshipType: params.relationshipType,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Result Artifact Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes a result artifact decision from validation results.
 * Pure function. No side effects.
 */
function _composeResultArtifactDecision(
  artifactId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): ResultArtifactDecision {
  return {
    decisionId: `_decision_result_${artifactId}`,
    artifactId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Result Artifact Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes a result artifact trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeResultArtifactTrace(params: {
  readonly traceId: string;
  readonly visualizationCount: number;
  readonly observationCount: number;
  readonly metricCount: number;
  readonly artifactCount: number;
  readonly relationshipCount: number;
  readonly decisions: readonly ResultArtifactDecision[];
}): ResultArtifactTrace {
  return {
    traceId: params.traceId,
    visualizationCount: params.visualizationCount,
    observationCount: params.observationCount,
    metricCount: params.metricCount,
    artifactCount: params.artifactCount,
    relationshipCount: params.relationshipCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_result_artifact_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for result artifacts.
 * Sorts by artifactId, then artifactType, then experimentId,
 * then visualizationId, then metricId, then observationId.
 * Pure function. No side effects.
 */
function _compareResultArtifact(
  a: LaboratoryResultArtifact,
  b: LaboratoryResultArtifact,
): number {
  if (a.artifactId < b.artifactId) return -1;
  if (a.artifactId > b.artifactId) return 1;

  if (a.artifactType < b.artifactType) return -1;
  if (a.artifactType > b.artifactType) return 1;

  if (a.experimentId < b.experimentId) return -1;
  if (a.experimentId > b.experimentId) return 1;

  if (a.visualizationId < b.visualizationId) return -1;
  if (a.visualizationId > b.visualizationId) return 1;

  if (a.metricId < b.metricId) return -1;
  if (a.metricId > b.metricId) return 1;

  if (a.observationId < b.observationId) return -1;
  if (a.observationId > b.observationId) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Result Artifact Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes a result artifact registry from all components.
 * Pure function. No side effects.
 * Deterministic ordering: artifactId → artifactType → experimentId
 *   → visualizationId → metricId → observationId.
 */
export function composeResultArtifactRegistry(
  visualizations: readonly LaboratoryVisualization[],
  observations: readonly LaboratoryObservation[],
  metrics: readonly LaboratoryMetric[],
  artifacts: readonly LaboratoryResultArtifact[],
  relationships: readonly ResultArtifactRelationship[],
): ResultArtifactRegistry {
  const sortedArtifacts = [...artifacts].sort(_compareResultArtifact);

  return {
    registryId: `_result_registry_${sortedArtifacts.length}`,
    visualizations: [...visualizations],
    observations: [...observations],
    metrics: [...metrics],
    artifacts: sortedArtifacts,
    relationships: [...relationships],
    visualizationCount: visualizations.length,
    observationCount: observations.length,
    metricCount: metrics.length,
    artifactCount: sortedArtifacts.length,
    relationshipCount: relationships.length,
    deterministic: true,
    generatedFrom: 'deterministic_result_artifact_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Result Artifacts Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory result artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryResultArtifacts(
  input: ResultArtifactInput,
): LaboratoryArtifactWithResults {
  const decisions = input.artifacts.map((art) => {
    const errors = _validateResultArtifactForDecision(art);
    return _composeResultArtifactDecision(art.artifactId, errors.length === 0, errors);
  });

  const trace = composeResultArtifactTrace({
    traceId: `_trace_result_${input.artifacts.length}`,
    visualizationCount: input.visualizations.length,
    observationCount: input.observations.length,
    metricCount: input.metrics.length,
    artifactCount: input.artifacts.length,
    relationshipCount: input.relationships.length,
    decisions,
  });

  const registry = composeResultArtifactRegistry(
    input.visualizations,
    input.observations,
    input.metrics,
    input.artifacts,
    input.relationships,
  );

  return {
    artifactId: `_artifact_result_${input.artifacts.length}`,
    registry,
    trace,
  };
}

/**
 * Validates a result artifact for decision composition.
 * Pure function. No side effects.
 */
function _validateResultArtifactForDecision(
  art: LaboratoryResultArtifact,
): readonly string[] {
  const errors: string[] = [];

  if (!art.artifactId || art.artifactId.trim() === '') {
    errors.push('RESULT_MISSING_ARTIFACT_ID');
  }

  if (!art.experimentId || art.experimentId.trim() === '') {
    errors.push('RESULT_MISSING_EXPERIMENT_ID');
  }

  if (!CANONICAL_RESULT_ARTIFACT_TYPES.includes(art.artifactType)) {
    errors.push('RESULT_UNKNOWN_TYPE');
  }

  if (!CANONICAL_RESULT_ARTIFACT_STATUS.includes(art.status)) {
    errors.push('RESULT_UNKNOWN_STATUS');
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(art.governanceStatus)) {
    errors.push('RESULT_INVALID_GOVERNANCE');
  }

  if (!art.provenance) {
    errors.push('RESULT_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported visualization type.
 */
export function isSupportedVisualizationType(
  visualizationType: string,
): visualizationType is VisualizationType {
  return CANONICAL_VISUALIZATION_TYPES.includes(visualizationType as VisualizationType);
}

/**
 * Checks if a string is a supported observation type.
 */
export function isSupportedObservationType(
  observationType: string,
): observationType is ObservationType {
  return CANONICAL_OBSERVATION_TYPES.includes(observationType as ObservationType);
}

/**
 * Checks if a string is a supported metric type.
 */
export function isSupportedMetricType(
  metricType: string,
): metricType is MetricType {
  return CANONICAL_METRIC_TYPES.includes(metricType as MetricType);
}

/**
 * Checks if a string is a supported result artifact type.
 */
export function isSupportedResultArtifactType(
  artifactType: string,
): artifactType is ResultArtifactType {
  return CANONICAL_RESULT_ARTIFACT_TYPES.includes(artifactType as ResultArtifactType);
}

/**
 * Checks if a string is a supported result artifact status.
 */
export function isSupportedResultArtifactStatus(
  status: string,
): status is ResultArtifactStatus {
  return CANONICAL_RESULT_ARTIFACT_STATUS.includes(status as ResultArtifactStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedResultArtifactGovernanceStatus(
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
 * Returns the canonical visualization types.
 */
export function getCanonicalVisualizationTypes(): readonly VisualizationType[] {
  return CANONICAL_VISUALIZATION_TYPES;
}

/**
 * Returns the canonical observation types.
 */
export function getCanonicalObservationTypes(): readonly ObservationType[] {
  return CANONICAL_OBSERVATION_TYPES;
}

/**
 * Returns the canonical metric types.
 */
export function getCanonicalMetricTypes(): readonly MetricType[] {
  return CANONICAL_METRIC_TYPES;
}

/**
 * Returns the canonical result artifact types.
 */
export function getCanonicalResultArtifactTypes(): readonly ResultArtifactType[] {
  return CANONICAL_RESULT_ARTIFACT_TYPES;
}

/**
 * Returns the canonical result artifact statuses.
 */
export function getCanonicalResultArtifactStatuses(): readonly ResultArtifactStatus[] {
  return CANONICAL_RESULT_ARTIFACT_STATUS;
}
