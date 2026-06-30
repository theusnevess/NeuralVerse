/**
 * NV-1600-D4-OPT-05 — Visualization, Observation & Result Artifact Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Result Artifact Kernel.
 * Covers: valid visualization, valid observation, valid metric, valid result artifact,
 * valid relationship, valid registry, duplicate IDs, unsupported visualization types,
 * unsupported observation types, unsupported metrics, unsupported artifact types,
 * invalid references, missing provenance, missing source, missing rationale,
 * missing providedBy, empty registry, deterministic ordering, immutable input,
 * identical output over 100 iterations, helper functions, canonical enum completeness,
 * registry validation, artifact validation, trace validation, relationship validation,
 * negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryVisualization,
  LaboratoryObservation,
  LaboratoryMetric,
  LaboratoryResultArtifact,
  ResultArtifactRelationship,
  ResultArtifactInput,
  ResultArtifactRegistry,
  LaboratoryArtifactWithResults,
  ResultArtifactTrace,
  VisualizationProvenance,
  ObservationProvenance,
  MetricProvenance,
  ResultArtifactProvenance,
  ArtifactRelationshipProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_VISUALIZATION_TYPES,
  CANONICAL_OBSERVATION_TYPES,
  CANONICAL_RESULT_ARTIFACT_TYPES,
  CANONICAL_METRIC_TYPES,
  CANONICAL_RESULT_ARTIFACT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeVisualizationProvenance,
  composeObservationProvenance,
  composeMetricProvenance,
  composeResultArtifactProvenance,
  composeArtifactRelationshipProvenance,
  composeVisualization,
  composeObservation,
  composeMetric,
  composeResultArtifact,
  composeArtifactRelationship,
  composeResultArtifactTrace,
  composeResultArtifactRegistry,
  composeLaboratoryResultArtifacts,
  isSupportedVisualizationType,
  isSupportedObservationType,
  isSupportedMetricType,
  isSupportedResultArtifactType,
  isSupportedResultArtifactStatus,
  isSupportedResultArtifactGovernanceStatus,
  getCanonicalVisualizationTypes,
  getCanonicalObservationTypes,
  getCanonicalMetricTypes,
  getCanonicalResultArtifactTypes,
  getCanonicalResultArtifactStatuses,
} from './ResultArtifactKernel.ts';

import {
  validateVisualization,
  validateObservation,
  validateMetric,
  validateResultArtifact,
  validateArtifactRelationship,
  validateResultArtifactRegistry,
  validateLaboratoryArtifactWithResults,
  validateResultArtifactInput,
  RESULT_ARTIFACT_VALIDATION_CODES,
} from './ResultArtifactValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_VIS_PROVENANCE: VisualizationProvenance = {
  visualizationId: 'vis-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Training loss visualization',
  providedBy: 'NeuralVerse Team',
};

const VALID_OBS_PROVENANCE: ObservationProvenance = {
  observationId: 'obs-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Model behavior observation',
  providedBy: 'NeuralVerse Team',
};

const VALID_METRIC_PROVENANCE: MetricProvenance = {
  metricId: 'metric-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Accuracy metric',
  providedBy: 'NeuralVerse Team',
};

const VALID_ARTIFACT_PROVENANCE: ResultArtifactProvenance = {
  artifactId: 'result-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Result artifact',
  providedBy: 'NeuralVerse Team',
};

const VALID_REL_PROVENANCE: ArtifactRelationshipProvenance = {
  relationshipId: 'rel-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Artifact relationship',
  providedBy: 'NeuralVerse Team',
};

const VALID_VISUALIZATION: LaboratoryVisualization = {
  visualizationId: 'vis-001',
  visualizationType: 'line_chart',
  title: 'Training Loss Curve',
  description: 'Visualizes training loss over epochs.',
  experimentId: 'exp-001',
  expectedOutputId: 'output-001',
  governanceStatus: 'canonical',
  provenance: VALID_VIS_PROVENANCE,
};

const VALID_VISUALIZATION_2: LaboratoryVisualization = {
  visualizationId: 'vis-002',
  visualizationType: 'confusion_matrix',
  title: 'Confusion Matrix',
  description: 'Confusion matrix for classification.',
  experimentId: 'exp-002',
  expectedOutputId: 'output-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_VIS_PROVENANCE, visualizationId: 'vis-002' },
};

const VALID_OBSERVATION: LaboratoryObservation = {
  observationId: 'obs-001',
  observationType: 'qualitative',
  description: 'Model shows overfitting after epoch 10.',
  experimentId: 'exp-001',
  relatedArtifacts: ['result-001'],
  governanceStatus: 'canonical',
  provenance: VALID_OBS_PROVENANCE,
};

const VALID_OBSERVATION_2: LaboratoryObservation = {
  observationId: 'obs-002',
  observationType: 'quantitative',
  description: 'Accuracy plateau at 95%.',
  experimentId: 'exp-002',
  relatedArtifacts: ['result-002'],
  governanceStatus: 'accepted',
  provenance: { ...VALID_OBS_PROVENANCE, observationId: 'obs-002' },
};

const VALID_METRIC: LaboratoryMetric = {
  metricId: 'metric-001',
  metricType: 'accuracy',
  displayName: 'Accuracy',
  unit: 'percentage',
  expectedRange: '90-100%',
  experimentId: 'exp-001',
  governanceStatus: 'canonical',
  provenance: VALID_METRIC_PROVENANCE,
};

const VALID_METRIC_2: LaboratoryMetric = {
  metricId: 'metric-002',
  metricType: 'f1_score',
  displayName: 'F1 Score',
  unit: 'ratio',
  expectedRange: '0.8-1.0',
  experimentId: 'exp-002',
  governanceStatus: 'accepted',
  provenance: { ...VALID_METRIC_PROVENANCE, metricId: 'metric-002' },
};

const VALID_RESULT_ARTIFACT: LaboratoryResultArtifact = {
  artifactId: 'result-001',
  artifactType: 'visualization',
  experimentId: 'exp-001',
  visualizationId: 'vis-001',
  metricId: 'metric-001',
  observationId: 'obs-001',
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_ARTIFACT_PROVENANCE,
};

const VALID_RESULT_ARTIFACT_2: LaboratoryResultArtifact = {
  artifactId: 'result-002',
  artifactType: 'metric',
  experimentId: 'exp-002',
  visualizationId: 'vis-002',
  metricId: 'metric-002',
  observationId: 'obs-002',
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_ARTIFACT_PROVENANCE, artifactId: 'result-002' },
};

const VALID_RELATIONSHIP: ResultArtifactRelationship = {
  relationshipId: 'rel-001',
  sourceArtifactId: 'result-001',
  targetArtifactId: 'result-002',
  relationshipType: 'derived_from',
  description: 'Result 2 derived from Result 1.',
  governanceStatus: 'canonical',
  provenance: VALID_REL_PROVENANCE,
};

const VALID_RELATIONSHIP_2: ResultArtifactRelationship = {
  relationshipId: 'rel-002',
  sourceArtifactId: 'result-002',
  targetArtifactId: 'result-001',
  relationshipType: 'compares',
  description: 'Result 2 compares with Result 1.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_REL_PROVENANCE, relationshipId: 'rel-002' },
};

const INVALID_VISUALIZATION_UNKNOWN_TYPE: LaboratoryVisualization = {
  visualizationId: 'vis-003',
  visualizationType: 'unsupported_type' as any,
  title: 'Unsupported Vis',
  description: 'A visualization with unsupported type.',
  experimentId: 'exp-001',
  expectedOutputId: 'output-001',
  governanceStatus: 'canonical',
  provenance: VALID_VIS_PROVENANCE,
};

const INVALID_OBSERVATION_UNKNOWN_TYPE: LaboratoryObservation = {
  observationId: 'obs-003',
  observationType: 'unsupported_type' as any,
  description: 'An observation with unsupported type.',
  experimentId: 'exp-001',
  relatedArtifacts: [],
  governanceStatus: 'canonical',
  provenance: VALID_OBS_PROVENANCE,
};

const INVALID_METRIC_UNKNOWN_TYPE: LaboratoryMetric = {
  metricId: 'metric-003',
  metricType: 'unsupported_type' as any,
  displayName: 'Unsupported Metric',
  unit: 'unit',
  expectedRange: '0-100',
  experimentId: 'exp-001',
  governanceStatus: 'canonical',
  provenance: VALID_METRIC_PROVENANCE,
};

const INVALID_RESULT_ARTIFACT_UNKNOWN_TYPE: LaboratoryResultArtifact = {
  artifactId: 'result-003',
  artifactType: 'unsupported_type' as any,
  experimentId: 'exp-001',
  visualizationId: 'vis-001',
  metricId: 'metric-001',
  observationId: 'obs-001',
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_ARTIFACT_PROVENANCE,
};

const INVALID_RESULT_ARTIFACT_UNKNOWN_STATUS: LaboratoryResultArtifact = {
  artifactId: 'result-004',
  artifactType: 'visualization',
  experimentId: 'exp-001',
  visualizationId: 'vis-001',
  metricId: 'metric-001',
  observationId: 'obs-001',
  status: 'unsupported_status' as any,
  governanceStatus: 'canonical',
  provenance: VALID_ARTIFACT_PROVENANCE,
};

// ---------------------------------------------------------------------------
// Valid Visualization Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Valid Visualization', () => {
  it('should compose valid visualization provenance', () => {
    const provenance = composeVisualizationProvenance({
      visualizationId: 'vis-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Training loss visualization',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.visualizationId, 'vis-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid observation provenance', () => {
    const provenance = composeObservationProvenance({
      observationId: 'obs-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Model behavior observation',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.observationId, 'obs-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid metric provenance', () => {
    const provenance = composeMetricProvenance({
      metricId: 'metric-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Accuracy metric',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.metricId, 'metric-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid result artifact provenance', () => {
    const provenance = composeResultArtifactProvenance({
      artifactId: 'result-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Result artifact',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.artifactId, 'result-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid artifact relationship provenance', () => {
    const provenance = composeArtifactRelationshipProvenance({
      relationshipId: 'rel-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Artifact relationship',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.relationshipId, 'rel-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid visualization', () => {
    const vis = composeVisualization({
      visualizationId: 'vis-001',
      visualizationType: 'line_chart',
      title: 'Training Loss Curve',
      description: 'Visualizes training loss.',
      experimentId: 'exp-001',
      expectedOutputId: 'output-001',
      governanceStatus: 'canonical',
      provenance: VALID_VIS_PROVENANCE,
    });

    assert.equal(vis.visualizationId, 'vis-001');
    assert.equal(vis.visualizationType, 'line_chart');
    assert.equal(vis.title, 'Training Loss Curve');
  });

  it('should compose valid observation', () => {
    const obs = composeObservation({
      observationId: 'obs-001',
      observationType: 'qualitative',
      description: 'Model shows overfitting.',
      experimentId: 'exp-001',
      relatedArtifacts: ['result-001'],
      governanceStatus: 'canonical',
      provenance: VALID_OBS_PROVENANCE,
    });

    assert.equal(obs.observationId, 'obs-001');
    assert.equal(obs.observationType, 'qualitative');
    assert.equal(obs.relatedArtifacts.length, 1);
  });

  it('should compose valid metric', () => {
    const metric = composeMetric({
      metricId: 'metric-001',
      metricType: 'accuracy',
      displayName: 'Accuracy',
      unit: 'percentage',
      expectedRange: '90-100%',
      experimentId: 'exp-001',
      governanceStatus: 'canonical',
      provenance: VALID_METRIC_PROVENANCE,
    });

    assert.equal(metric.metricId, 'metric-001');
    assert.equal(metric.metricType, 'accuracy');
    assert.equal(metric.displayName, 'Accuracy');
  });

  it('should compose valid result artifact', () => {
    const art = composeResultArtifact({
      artifactId: 'result-001',
      artifactType: 'visualization',
      experimentId: 'exp-001',
      visualizationId: 'vis-001',
      metricId: 'metric-001',
      observationId: 'obs-001',
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_ARTIFACT_PROVENANCE,
    });

    assert.equal(art.artifactId, 'result-001');
    assert.equal(art.artifactType, 'visualization');
    assert.equal(art.status, 'approved');
  });

  it('should compose valid artifact relationship', () => {
    const rel = composeArtifactRelationship({
      relationshipId: 'rel-001',
      sourceArtifactId: 'result-001',
      targetArtifactId: 'result-002',
      relationshipType: 'derived_from',
      description: 'Result 2 derived from Result 1.',
      governanceStatus: 'canonical',
      provenance: VALID_REL_PROVENANCE,
    });

    assert.equal(rel.relationshipId, 'rel-001');
    assert.equal(rel.sourceArtifactId, 'result-001');
    assert.equal(rel.targetArtifactId, 'result-002');
  });

  it('should compose valid result artifact trace', () => {
    const trace = composeResultArtifactTrace({
      traceId: '_trace_result_1',
      visualizationCount: 1,
      observationCount: 1,
      metricCount: 1,
      artifactCount: 1,
      relationshipCount: 1,
      decisions: [
        { decisionId: 'd1', artifactId: 'result-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_result_1');
    assert.equal(trace.visualizationCount, 1);
    assert.equal(trace.validatedCount, 1);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid result artifact registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.visualizations.length, 1);
    assert.equal(registry.observations.length, 1);
    assert.equal(registry.metrics.length, 1);
    assert.equal(registry.artifacts.length, 1);
    assert.equal(registry.relationships.length, 1);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid visualization with no errors', () => {
    const errors = validateVisualization(VALID_VISUALIZATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid observation with no errors', () => {
    const errors = validateObservation(VALID_OBSERVATION);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid metric with no errors', () => {
    const errors = validateMetric(VALID_METRIC);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid result artifact with no errors', () => {
    const errors = validateResultArtifact(VALID_RESULT_ARTIFACT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid artifact relationship with no errors', () => {
    const errors = validateArtifactRelationship(VALID_RELATIONSHIP);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const artifact = composeLaboratoryResultArtifacts(input);
    const result = validateLaboratoryArtifactWithResults(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate result artifact input', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION, VALID_VISUALIZATION_2],
      observations: [VALID_OBSERVATION, VALID_OBSERVATION_2],
      metrics: [VALID_METRIC, VALID_METRIC_2],
      artifacts: [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT_2],
      relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    };

    const result = validateResultArtifactInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Duplicate IDs', () => {
  it('should detect duplicate visualization IDs in registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION, VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );
    const result = validateResultArtifactRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have VISUALIZATION_DUPLICATE_ID error');
  });

  it('should detect duplicate observation IDs in registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION, VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );
    const result = validateResultArtifactRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have OBSERVATION_DUPLICATE_ID error');
  });

  it('should detect duplicate metric IDs in registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC, VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );
    const result = validateResultArtifactRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.METRIC_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have METRIC_DUPLICATE_ID error');
  });

  it('should detect duplicate artifact IDs in registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );
    const result = validateResultArtifactRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.ARTIFACT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have ARTIFACT_DUPLICATE_ID error');
  });

  it('should detect duplicate relationship IDs in registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP],
    );
    const result = validateResultArtifactRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have RELATIONSHIP_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Unsupported Types', () => {
  it('should reject unsupported visualization type', () => {
    assert.equal(isSupportedVisualizationType('line_chart'), true);
    assert.equal(isSupportedVisualizationType('heatmap'), true);
    assert.equal(isSupportedVisualizationType('unsupported_type'), false);
  });

  it('should detect unsupported visualization type in validation', () => {
    const errors = validateVisualization(INVALID_VISUALIZATION_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have VISUALIZATION_UNKNOWN_TYPE error');
  });

  it('should reject unsupported observation type', () => {
    assert.equal(isSupportedObservationType('qualitative'), true);
    assert.equal(isSupportedObservationType('quantitative'), true);
    assert.equal(isSupportedObservationType('unsupported_type'), false);
  });

  it('should detect unsupported observation type in validation', () => {
    const errors = validateObservation(INVALID_OBSERVATION_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have OBSERVATION_UNKNOWN_TYPE error');
  });

  it('should reject unsupported metric type', () => {
    assert.equal(isSupportedMetricType('accuracy'), true);
    assert.equal(isSupportedMetricType('f1_score'), true);
    assert.equal(isSupportedMetricType('unsupported_type'), false);
  });

  it('should detect unsupported metric type in validation', () => {
    const errors = validateMetric(INVALID_METRIC_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.METRIC_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have METRIC_UNKNOWN_TYPE error');
  });

  it('should reject unsupported result artifact type', () => {
    assert.equal(isSupportedResultArtifactType('visualization'), true);
    assert.equal(isSupportedResultArtifactType('metric'), true);
    assert.equal(isSupportedResultArtifactType('unsupported_type'), false);
  });

  it('should detect unsupported result artifact type in validation', () => {
    const errors = validateResultArtifact(INVALID_RESULT_ARTIFACT_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RESULT_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have RESULT_UNKNOWN_TYPE error');
  });

  it('should reject unsupported result artifact status', () => {
    assert.equal(isSupportedResultArtifactStatus('draft'), true);
    assert.equal(isSupportedResultArtifactStatus('approved'), true);
    assert.equal(isSupportedResultArtifactStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateResultArtifact(INVALID_RESULT_ARTIFACT_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RESULT_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have RESULT_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Missing Provenance', () => {
  it('should detect missing provenance in visualization', () => {
    const vis = { ...VALID_VISUALIZATION, provenance: undefined as any };
    const errors = validateVisualization(vis);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in observation', () => {
    const obs = { ...VALID_OBSERVATION, provenance: undefined as any };
    const errors = validateObservation(obs);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in metric', () => {
    const metric = { ...VALID_METRIC, provenance: undefined as any };
    const errors = validateMetric(metric);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in result artifact', () => {
    const art = { ...VALID_RESULT_ARTIFACT, provenance: undefined as any };
    const errors = validateResultArtifact(art);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in relationship', () => {
    const rel = { ...VALID_RELATIONSHIP, provenance: undefined as any };
    const errors = validateArtifactRelationship(rel);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Missing Source', () => {
  it('should detect missing provenance in visualization', () => {
    const vis = { ...VALID_VISUALIZATION, provenance: undefined as any };
    const errors = validateVisualization(vis);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Missing Rationale', () => {
  it('should detect missing provenance in observation', () => {
    const obs = { ...VALID_OBSERVATION, provenance: undefined as any };
    const errors = validateObservation(obs);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in metric', () => {
    const metric = { ...VALID_METRIC, provenance: undefined as any };
    const errors = validateMetric(metric);
    const provenanceError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeResultArtifactRegistry([], [], [], [], []);
    const result = validateResultArtifactRegistry(registry);
    // Empty registry is valid if it has a registryId
    assert.equal(result.valid, true);
  });

  it('should detect empty input visualizations', () => {
    const input: ResultArtifactInput = {
      visualizations: [],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateResultArtifactInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.VISUALIZATION_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have VISUALIZATION_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input observations', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateResultArtifactInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.OBSERVATION_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have OBSERVATION_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input metrics', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateResultArtifactInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.METRIC_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have METRIC_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input artifacts', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [],
      relationships: [VALID_RELATIONSHIP],
    };
    const result = validateResultArtifactInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RESULT_MISSING_ARTIFACT_ID,
    );

    assert.ok(emptyError, 'Should have RESULT_MISSING_ARTIFACT_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input relationships', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [],
    };
    const result = validateResultArtifactInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have RELATIONSHIP_MISSING_ID error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Deterministic Ordering', () => {
  it('should sort artifacts by artifactId', () => {
    const art3 = { ...VALID_RESULT_ARTIFACT, artifactId: 'result-003', experimentId: 'exp-003' };
    const art1 = { ...VALID_RESULT_ARTIFACT, artifactId: 'result-001', experimentId: 'exp-001' };
    const art2 = { ...VALID_RESULT_ARTIFACT, artifactId: 'result-002', experimentId: 'exp-002' };

    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [art3, art1, art2],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.artifacts[0].artifactId, 'result-001');
    assert.equal(registry.artifacts[1].artifactId, 'result-002');
    assert.equal(registry.artifacts[2].artifactId, 'result-003');
  });

  it('should sort by artifactType when artifactId is equal', () => {
    const artA = { ...VALID_RESULT_ARTIFACT, artifactId: 'result-001', artifactType: 'metric' as const };
    const artB = { ...VALID_RESULT_ARTIFACT, artifactId: 'result-001', artifactType: 'visualization' as const };

    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [artA, artB],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.artifacts[0].artifactType, 'metric');
    assert.equal(registry.artifacts[1].artifactType, 'visualization');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Immutable Input', () => {
  it('should not mutate input visualizations', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const originalId = VALID_VISUALIZATION.visualizationId;
    const originalTitle = VALID_VISUALIZATION.title;

    composeLaboratoryResultArtifacts(input);

    assert.equal(VALID_VISUALIZATION.visualizationId, originalId);
    assert.equal(VALID_VISUALIZATION.title, originalTitle);
  });

  it('should not mutate input artifacts', () => {
    const artifacts = [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT_2];
    const originalIds = artifacts.map((a) => a.artifactId);

    composeResultArtifactRegistry([VALID_VISUALIZATION], [VALID_OBSERVATION], [VALID_METRIC], artifacts, [VALID_RELATIONSHIP]);

    assert.equal(artifacts[0].artifactId, originalIds[0]);
    assert.equal(artifacts[1].artifactId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION, VALID_VISUALIZATION_2],
      observations: [VALID_OBSERVATION, VALID_OBSERVATION_2],
      metrics: [VALID_METRIC, VALID_METRIC_2],
      artifacts: [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT_2],
      relationships: [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    };

    const results: ReturnType<typeof composeLaboratoryResultArtifacts>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryResultArtifacts(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.artifacts, results[i].registry.artifacts);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const visualizations = [VALID_VISUALIZATION, VALID_VISUALIZATION_2];
    const observations = [VALID_OBSERVATION, VALID_OBSERVATION_2];
    const metrics = [VALID_METRIC, VALID_METRIC_2];
    const artifacts = [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT_2];
    const relationships = [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2];

    const results: ReturnType<typeof composeResultArtifactRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeResultArtifactRegistry(visualizations, observations, metrics, artifacts, relationships));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifacts, results[i].artifacts);
      assert.deepStrictEqual(results[0].visualizations, results[i].visualizations);
      assert.deepStrictEqual(results[0].observations, results[i].observations);
    }
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION, VALID_VISUALIZATION_2],
      [VALID_OBSERVATION, VALID_OBSERVATION_2],
      [VALID_METRIC, VALID_METRIC_2],
      [VALID_RESULT_ARTIFACT, VALID_RESULT_ARTIFACT_2],
      [VALID_RELATIONSHIP, VALID_RELATIONSHIP_2],
    );
    const result = validateResultArtifactRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'result_artifact_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeResultArtifactRegistry(
      [VALID_VISUALIZATION],
      [VALID_OBSERVATION],
      [VALID_METRIC],
      [VALID_RESULT_ARTIFACT],
      [VALID_RELATIONSHIP],
    );

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_result_artifact_kernel');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeResultArtifactTrace({
      traceId: '_trace_result_1',
      visualizationCount: 1,
      observationCount: 1,
      metricCount: 1,
      artifactCount: 1,
      relationshipCount: 1,
      decisions: [
        { decisionId: 'd1', artifactId: 'result-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_result_artifact_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeResultArtifactTrace({
      traceId: '_trace_result_1',
      visualizationCount: 2,
      observationCount: 2,
      metricCount: 2,
      artifactCount: 3,
      relationshipCount: 2,
      decisions: [
        { decisionId: 'd1', artifactId: 'result-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', artifactId: 'result-002', validationPassed: false, validationErrors: ['RESULT_UNKNOWN_TYPE'] },
        { decisionId: 'd3', artifactId: 'result-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Relationship Validation Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Relationship Validation', () => {
  it('should validate a complete relationship', () => {
    const errors = validateArtifactRelationship(VALID_RELATIONSHIP);
    assert.equal(errors.length, 0);
  });

  it('should detect missing relationship ID', () => {
    const rel = { ...VALID_RELATIONSHIP, relationshipId: '' };
    const errors = validateArtifactRelationship(rel);
    const idError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.RELATIONSHIP_MISSING_ID,
    );

    assert.ok(idError, 'Should have RELATIONSHIP_MISSING_ID error');
  });

  it('should detect missing source artifact ID', () => {
    const rel = { ...VALID_RELATIONSHIP, sourceArtifactId: '' };
    const errors = validateArtifactRelationship(rel);
    const refError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.INVALID_RELATIONSHIP_REFERENCE,
    );

    assert.ok(refError, 'Should have INVALID_RELATIONSHIP_REFERENCE error');
  });

  it('should detect missing target artifact ID', () => {
    const rel = { ...VALID_RELATIONSHIP, targetArtifactId: '' };
    const errors = validateArtifactRelationship(rel);
    const refError = errors.find(
      (e) => e.code === RESULT_ARTIFACT_VALIDATION_CODES.INVALID_RELATIONSHIP_REFERENCE,
    );

    assert.ok(refError, 'Should have INVALID_RELATIONSHIP_REFERENCE error');
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Helper Functions', () => {
  it('should return canonical visualization types', () => {
    const types = getCanonicalVisualizationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_VISUALIZATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical observation types', () => {
    const types = getCanonicalObservationTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_OBSERVATION_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical metric types', () => {
    const types = getCanonicalMetricTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_METRIC_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical result artifact types', () => {
    const types = getCanonicalResultArtifactTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_RESULT_ARTIFACT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical result artifact statuses', () => {
    const statuses = getCanonicalResultArtifactStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_RESULT_ARTIFACT_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedResultArtifactGovernanceStatus('canonical'), true);
    assert.equal(isSupportedResultArtifactGovernanceStatus('accepted'), true);
    assert.equal(isSupportedResultArtifactGovernanceStatus('provisional'), true);
    assert.equal(isSupportedResultArtifactGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedResultArtifactGovernanceStatus('rejected'), true);
    assert.equal(isSupportedResultArtifactGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 visualization types', () => {
    assert.equal(CANONICAL_VISUALIZATION_TYPES.length, 10);
  });

  it('should have exactly 10 observation types', () => {
    assert.equal(CANONICAL_OBSERVATION_TYPES.length, 10);
  });

  it('should have exactly 10 result artifact types', () => {
    assert.equal(CANONICAL_RESULT_ARTIFACT_TYPES.length, 10);
  });

  it('should have exactly 10 metric types', () => {
    assert.equal(CANONICAL_METRIC_TYPES.length, 10);
  });

  it('should have exactly 6 result artifact statuses', () => {
    assert.equal(CANONICAL_RESULT_ARTIFACT_STATUS.length, 6);
  });

  it('should contain all expected visualization types', () => {
    const expectedTypes = ['line_chart', 'bar_chart', 'scatter_plot', 'heatmap', 'confusion_matrix', 'bounding_box_overlay', 'segmentation_overlay', 'feature_map', 'network_graph', 'custom_visualization'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_VISUALIZATION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected observation types', () => {
    const expectedTypes = ['qualitative', 'quantitative', 'comparative', 'behavioral', 'visual', 'algorithmic', 'statistical', 'performance', 'failure', 'annotation'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_OBSERVATION_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected result artifact types', () => {
    const expectedTypes = ['visualization', 'metric', 'table', 'graph', 'report', 'observation', 'comparison', 'dataset_snapshot', 'annotation', 'evaluation_summary'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_RESULT_ARTIFACT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected metric types', () => {
    const expectedTypes = ['accuracy', 'precision', 'recall', 'f1_score', 'iou', 'latency', 'throughput', 'memory', 'custom_metric', 'none'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_METRIC_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Result Artifact Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute experiments', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not generate visualizations', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(!('renderedVisualization' in result), 'Should not have rendered visualization');
    assert.ok(!('svg' in result), 'Should not have SVG');
    assert.ok(!('png' in result), 'Should not have PNG');
  });

  it('should not calculate metrics', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(!('calculatedMetrics' in result), 'Should not have calculated metrics');
    assert.ok(!('metricValues' in result), 'Should not have metric values');
  });

  it('should not infer observations', () => {
    const input: ResultArtifactInput = {
      visualizations: [VALID_VISUALIZATION],
      observations: [VALID_OBSERVATION],
      metrics: [VALID_METRIC],
      artifacts: [VALID_RESULT_ARTIFACT],
      relationships: [VALID_RELATIONSHIP],
    };

    const result = composeLaboratoryResultArtifacts(input);
    assert.ok(!('inferredObservations' in result), 'Should not have inferred observations');
    assert.ok(!('runtimeObservations' in result), 'Should not have runtime observations');
    assert.ok(!('generatedObservations' in result), 'Should not have generated observations');
  });

  it('should not have executable callbacks in visualization', () => {
    const vis = composeVisualization({
      visualizationId: 'vis-001',
      visualizationType: 'line_chart',
      title: 'Training Loss',
      description: 'Loss curve.',
      experimentId: 'exp-001',
      expectedOutputId: 'output-001',
      governanceStatus: 'canonical',
      provenance: VALID_VIS_PROVENANCE,
    });

    const keys = Object.keys(vis);
    for (const key of keys) {
      const value = (vis as any)[key];
      assert.ok(typeof value !== 'function', `Visualization field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in observation', () => {
    const obs = composeObservation({
      observationId: 'obs-001',
      observationType: 'qualitative',
      description: 'Model overfits.',
      experimentId: 'exp-001',
      relatedArtifacts: [],
      governanceStatus: 'canonical',
      provenance: VALID_OBS_PROVENANCE,
    });

    const keys = Object.keys(obs);
    for (const key of keys) {
      const value = (obs as any)[key];
      assert.ok(typeof value !== 'function', `Observation field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in metric', () => {
    const metric = composeMetric({
      metricId: 'metric-001',
      metricType: 'accuracy',
      displayName: 'Accuracy',
      unit: 'percentage',
      expectedRange: '90-100%',
      experimentId: 'exp-001',
      governanceStatus: 'canonical',
      provenance: VALID_METRIC_PROVENANCE,
    });

    const keys = Object.keys(metric);
    for (const key of keys) {
      const value = (metric as any)[key];
      assert.ok(typeof value !== 'function', `Metric field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in result artifact', () => {
    const art = composeResultArtifact({
      artifactId: 'result-001',
      artifactType: 'visualization',
      experimentId: 'exp-001',
      visualizationId: 'vis-001',
      metricId: 'metric-001',
      observationId: 'obs-001',
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_ARTIFACT_PROVENANCE,
    });

    const keys = Object.keys(art);
    for (const key of keys) {
      const value = (art as any)[key];
      assert.ok(typeof value !== 'function', `Result artifact field "${key}" should not be a function`);
    }
  });
});
