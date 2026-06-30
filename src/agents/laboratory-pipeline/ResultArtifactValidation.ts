/**
 * NV-1600-D4-OPT-05 — Result Artifact Validation Layer
 *
 * Deterministic validation for result artifact metadata.
 * Returns structured errors, never exceptions for expected validation failures.
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
  LaboratoryArtifactWithResults,
  ResultArtifactInput,
  ResultArtifactValidationError,
  ResultArtifactValidationResult,
  ResultArtifactRegistryValidationResult,
  ResultArtifactArtifactValidationResult,
  ResultArtifactInputValidationResult,
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
// Validation Error Codes
// ---------------------------------------------------------------------------

export const RESULT_ARTIFACT_VALIDATION_CODES = {
  VISUALIZATION_UNKNOWN_TYPE: 'VISUALIZATION_UNKNOWN_TYPE',
  OBSERVATION_UNKNOWN_TYPE: 'OBSERVATION_UNKNOWN_TYPE',
  METRIC_UNKNOWN_TYPE: 'METRIC_UNKNOWN_TYPE',
  RESULT_UNKNOWN_TYPE: 'RESULT_UNKNOWN_TYPE',
  RESULT_UNKNOWN_STATUS: 'RESULT_UNKNOWN_STATUS',
  VISUALIZATION_DUPLICATE_ID: 'VISUALIZATION_DUPLICATE_ID',
  OBSERVATION_DUPLICATE_ID: 'OBSERVATION_DUPLICATE_ID',
  METRIC_DUPLICATE_ID: 'METRIC_DUPLICATE_ID',
  ARTIFACT_DUPLICATE_ID: 'ARTIFACT_DUPLICATE_ID',
  INVALID_EXPERIMENT_REFERENCE: 'INVALID_EXPERIMENT_REFERENCE',
  INVALID_VISUALIZATION_REFERENCE: 'INVALID_VISUALIZATION_REFERENCE',
  INVALID_METRIC_REFERENCE: 'INVALID_METRIC_REFERENCE',
  INVALID_OBSERVATION_REFERENCE: 'INVALID_OBSERVATION_REFERENCE',
  INVALID_RELATIONSHIP_REFERENCE: 'INVALID_RELATIONSHIP_REFERENCE',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  VISUALIZATION_INVALID_GOVERNANCE: 'VISUALIZATION_INVALID_GOVERNANCE',
  OBSERVATION_INVALID_GOVERNANCE: 'OBSERVATION_INVALID_GOVERNANCE',
  METRIC_INVALID_GOVERNANCE: 'METRIC_INVALID_GOVERNANCE',
  RESULT_INVALID_GOVERNANCE: 'RESULT_INVALID_GOVERNANCE',
  RELATIONSHIP_INVALID_GOVERNANCE: 'RELATIONSHIP_INVALID_GOVERNANCE',
  VISUALIZATION_MISSING_ID: 'VISUALIZATION_MISSING_ID',
  OBSERVATION_MISSING_ID: 'OBSERVATION_MISSING_ID',
  METRIC_MISSING_ID: 'METRIC_MISSING_ID',
  RESULT_MISSING_ARTIFACT_ID: 'RESULT_MISSING_ARTIFACT_ID',
  RESULT_MISSING_EXPERIMENT_ID: 'RESULT_MISSING_EXPERIMENT_ID',
  RELATIONSHIP_MISSING_ID: 'RELATIONSHIP_MISSING_ID',
  RELATIONSHIP_DUPLICATE_ID: 'RELATIONSHIP_DUPLICATE_ID',
} as const;

// ---------------------------------------------------------------------------
// Single Visualization Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single visualization against canonical invariants.
 * Pure function. No side effects.
 */
export function validateVisualization(
  vis: LaboratoryVisualization,
): readonly ResultArtifactValidationError[] {
  const errors: ResultArtifactValidationError[] = [];

  if (!vis.visualizationId || vis.visualizationId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_MISSING_ID,
      message: 'Visualization is missing a visualization ID.',
      field: 'visualizationId',
      visualizationId: vis.visualizationId,
    });
  }

  if (!vis.title || vis.title.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_MISSING_ID,
      message: 'Visualization is missing a title.',
      field: 'title',
      visualizationId: vis.visualizationId,
    });
  }

  if (!CANONICAL_VISUALIZATION_TYPES.includes(vis.visualizationType)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_UNKNOWN_TYPE,
      message: `Visualization has unsupported type: "${vis.visualizationType}".`,
      field: 'visualizationType',
      visualizationId: vis.visualizationId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(vis.governanceStatus)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_INVALID_GOVERNANCE,
      message: `Visualization has invalid governance status: "${vis.governanceStatus}".`,
      field: 'governanceStatus',
      visualizationId: vis.visualizationId,
    });
  }

  if (!vis.provenance) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Visualization is missing provenance.',
      field: 'provenance',
      visualizationId: vis.visualizationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Observation Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single observation against canonical invariants.
 * Pure function. No side effects.
 */
export function validateObservation(
  obs: LaboratoryObservation,
): readonly ResultArtifactValidationError[] {
  const errors: ResultArtifactValidationError[] = [];

  if (!obs.observationId || obs.observationId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_MISSING_ID,
      message: 'Observation is missing an observation ID.',
      field: 'observationId',
      observationId: obs.observationId,
    });
  }

  if (!obs.description || obs.description.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_MISSING_ID,
      message: 'Observation is missing a description.',
      field: 'description',
      observationId: obs.observationId,
    });
  }

  if (!CANONICAL_OBSERVATION_TYPES.includes(obs.observationType)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_UNKNOWN_TYPE,
      message: `Observation has unsupported type: "${obs.observationType}".`,
      field: 'observationType',
      observationId: obs.observationId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(obs.governanceStatus)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_INVALID_GOVERNANCE,
      message: `Observation has invalid governance status: "${obs.governanceStatus}".`,
      field: 'governanceStatus',
      observationId: obs.observationId,
    });
  }

  if (!obs.provenance) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Observation is missing provenance.',
      field: 'provenance',
      observationId: obs.observationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Metric Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single metric against canonical invariants.
 * Pure function. No side effects.
 */
export function validateMetric(
  metric: LaboratoryMetric,
): readonly ResultArtifactValidationError[] {
  const errors: ResultArtifactValidationError[] = [];

  if (!metric.metricId || metric.metricId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_MISSING_ID,
      message: 'Metric is missing a metric ID.',
      field: 'metricId',
      metricId: metric.metricId,
    });
  }

  if (!metric.displayName || metric.displayName.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_MISSING_ID,
      message: 'Metric is missing a display name.',
      field: 'displayName',
      metricId: metric.metricId,
    });
  }

  if (!CANONICAL_METRIC_TYPES.includes(metric.metricType)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_UNKNOWN_TYPE,
      message: `Metric has unsupported type: "${metric.metricType}".`,
      field: 'metricType',
      metricId: metric.metricId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(metric.governanceStatus)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_INVALID_GOVERNANCE,
      message: `Metric has invalid governance status: "${metric.governanceStatus}".`,
      field: 'governanceStatus',
      metricId: metric.metricId,
    });
  }

  if (!metric.provenance) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Metric is missing provenance.',
      field: 'provenance',
      metricId: metric.metricId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Single Result Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single result artifact against canonical invariants.
 * Pure function. No side effects.
 */
export function validateResultArtifact(
  art: LaboratoryResultArtifact,
): readonly ResultArtifactValidationError[] {
  const errors: ResultArtifactValidationError[] = [];

  if (!art.artifactId || art.artifactId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_MISSING_ARTIFACT_ID,
      message: 'Result artifact is missing an artifact ID.',
      field: 'artifactId',
      artifactId: art.artifactId,
    });
  }

  if (!art.experimentId || art.experimentId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_MISSING_EXPERIMENT_ID,
      message: 'Result artifact is missing an experiment ID.',
      field: 'experimentId',
      artifactId: art.artifactId,
    });
  }

  if (!CANONICAL_RESULT_ARTIFACT_TYPES.includes(art.artifactType)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_UNKNOWN_TYPE,
      message: `Result artifact has unsupported type: "${art.artifactType}".`,
      field: 'artifactType',
      artifactId: art.artifactId,
    });
  }

  if (!CANONICAL_RESULT_ARTIFACT_STATUS.includes(art.status)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_UNKNOWN_STATUS,
      message: `Result artifact has unsupported status: "${art.status}".`,
      field: 'status',
      artifactId: art.artifactId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(art.governanceStatus)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_INVALID_GOVERNANCE,
      message: `Result artifact has invalid governance status: "${art.governanceStatus}".`,
      field: 'governanceStatus',
      artifactId: art.artifactId,
    });
  }

  if (!art.provenance) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Result artifact is missing provenance.',
      field: 'provenance',
      artifactId: art.artifactId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Artifact Relationship Validation
// ---------------------------------------------------------------------------

/**
 * Validates an artifact relationship against canonical invariants.
 * Pure function. No side effects.
 */
export function validateArtifactRelationship(
  rel: ResultArtifactRelationship,
): readonly ResultArtifactValidationError[] {
  const errors: ResultArtifactValidationError[] = [];

  if (!rel.relationshipId || rel.relationshipId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
      message: 'Relationship is missing a relationship ID.',
      field: 'relationshipId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.sourceArtifactId || rel.sourceArtifactId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.INVALID_RELATIONSHIP_REFERENCE,
      message: 'Relationship is missing a source artifact ID.',
      field: 'sourceArtifactId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.targetArtifactId || rel.targetArtifactId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.INVALID_RELATIONSHIP_REFERENCE,
      message: 'Relationship is missing a target artifact ID.',
      field: 'targetArtifactId',
      relationshipId: rel.relationshipId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(rel.governanceStatus)) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_INVALID_GOVERNANCE,
      message: `Relationship has invalid governance status: "${rel.governanceStatus}".`,
      field: 'governanceStatus',
      relationshipId: rel.relationshipId,
    });
  }

  if (!rel.provenance) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Relationship is missing provenance.',
      field: 'provenance',
      relationshipId: rel.relationshipId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Result Artifact Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates a result artifact registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateResultArtifactRegistry(
  registry: ResultArtifactRegistry,
): ResultArtifactRegistryValidationResult {
  const errors: ResultArtifactValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate visualization IDs
  const seenVisIds = new Set<string>();
  for (const vis of registry.visualizations) {
    if (seenVisIds.has(vis.visualizationId)) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_DUPLICATE_ID,
        message: `Duplicate visualization ID: "${vis.visualizationId}".`,
        visualizationId: vis.visualizationId,
      });
    }
    seenVisIds.add(vis.visualizationId);
  }

  // Check for duplicate observation IDs
  const seenObsIds = new Set<string>();
  for (const obs of registry.observations) {
    if (seenObsIds.has(obs.observationId)) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_DUPLICATE_ID,
        message: `Duplicate observation ID: "${obs.observationId}".`,
        observationId: obs.observationId,
      });
    }
    seenObsIds.add(obs.observationId);
  }

  // Check for duplicate metric IDs
  const seenMetricIds = new Set<string>();
  for (const metric of registry.metrics) {
    if (seenMetricIds.has(metric.metricId)) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_DUPLICATE_ID,
        message: `Duplicate metric ID: "${metric.metricId}".`,
        metricId: metric.metricId,
      });
    }
    seenMetricIds.add(metric.metricId);
  }

  // Check for duplicate artifact IDs
  const seenArtifactIds = new Set<string>();
  for (const art of registry.artifacts) {
    if (seenArtifactIds.has(art.artifactId)) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.ARTIFACT_DUPLICATE_ID,
        message: `Duplicate artifact ID: "${art.artifactId}".`,
        artifactId: art.artifactId,
      });
    }
    seenArtifactIds.add(art.artifactId);
  }

  // Check for duplicate relationship IDs
  const seenRelIds = new Set<string>();
  for (const rel of registry.relationships) {
    if (seenRelIds.has(rel.relationshipId)) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
        message: `Duplicate relationship ID: "${rel.relationshipId}".`,
        relationshipId: rel.relationshipId,
      });
    }
    seenRelIds.add(rel.relationshipId);
  }

  // Validate each visualization
  for (const vis of registry.visualizations) {
    errors.push(...validateVisualization(vis));
  }

  // Validate each observation
  for (const obs of registry.observations) {
    errors.push(...validateObservation(obs));
  }

  // Validate each metric
  for (const metric of registry.metrics) {
    errors.push(...validateMetric(metric));
  }

  // Validate each artifact
  for (const art of registry.artifacts) {
    errors.push(...validateResultArtifact(art));
  }

  // Validate each relationship
  for (const rel of registry.relationships) {
    errors.push(...validateArtifactRelationship(rel));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'result_artifact_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with results against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithResults(
  artifact: LaboratoryArtifactWithResults,
): ResultArtifactArtifactValidationResult {
  const errors: ResultArtifactValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.INVALID_EXPERIMENT_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateResultArtifactRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: RESULT_ARTIFACT_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'result_artifact_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates result artifact input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateResultArtifactInput(
  input: ResultArtifactInput,
): ResultArtifactInputValidationResult {
  const errors: ResultArtifactValidationError[] = [];

  if (!input.visualizations || input.visualizations.length === 0) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_MISSING_ID,
      message: 'Input has no visualizations.',
      field: 'visualizations',
    });
  } else {
    for (const vis of input.visualizations) {
      errors.push(...validateVisualization(vis));
    }
  }

  if (!input.observations || input.observations.length === 0) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_MISSING_ID,
      message: 'Input has no observations.',
      field: 'observations',
    });
  } else {
    for (const obs of input.observations) {
      errors.push(...validateObservation(obs));
    }
  }

  if (!input.metrics || input.metrics.length === 0) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.METRIC_MISSING_ID,
      message: 'Input has no metrics.',
      field: 'metrics',
    });
  } else {
    for (const metric of input.metrics) {
      errors.push(...validateMetric(metric));
    }
  }

  if (!input.artifacts || input.artifacts.length === 0) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RESULT_MISSING_ARTIFACT_ID,
      message: 'Input has no artifacts.',
      field: 'artifacts',
    });
  } else {
    for (const art of input.artifacts) {
      errors.push(...validateResultArtifact(art));
    }
  }

  if (!input.relationships || input.relationships.length === 0) {
    errors.push({
      code: RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
      message: 'Input has no relationships.',
      field: 'relationships',
    });
  } else {
    for (const rel of input.relationships) {
      errors.push(...validateArtifactRelationship(rel));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'result_artifact_input_composition',
  };
}
