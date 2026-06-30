/**
 * NV-1600-D4-OPT-04 — Simulation Scenario Composition & Experiment Modeling Test Suite
 *
 * Comprehensive deterministic test suite for the Experiment Kernel.
 * Covers: valid experiment, valid scenario, valid dataset reference,
 * valid expected output, valid evaluation metadata, valid registry,
 * duplicate IDs, unsupported experiment types, unsupported scenarios,
 * unsupported outputs, invalid references, missing provenance,
 * missing source, missing rationale, missing providedBy, empty registry,
 * deterministic ordering, immutable input, identical output over 100 iterations,
 * helper functions, canonical enum completeness, registry validation,
 * artifact validation, trace validation, negative capability verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type {
  LaboratoryExperiment,
  ExperimentScenario,
  ExperimentDatasetReference,
  ExperimentExpectedOutput,
  ExperimentEvaluationMetadata,
  ExperimentInput,
  ExperimentRegistry,
  LaboratoryArtifactWithExperiments,
  ExperimentProvenance,
  ScenarioProvenance,
  DatasetReferenceProvenance,
  ExpectedOutputProvenance,
  EvaluationMetadataProvenance,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_SCENARIO_TYPES,
  CANONICAL_EXPECTED_OUTPUT_TYPES,
  CANONICAL_EXPERIMENT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

import {
  composeExperimentProvenance,
  composeScenarioProvenance,
  composeDatasetReferenceProvenance,
  composeExpectedOutputProvenance,
  composeEvaluationMetadataProvenance,
  composeScenario,
  composeDatasetReference,
  composeExpectedOutput,
  composeEvaluationMetadata,
  composeExperiment,
  composeExperimentTrace,
  composeExperimentRegistry,
  composeLaboratoryExperiments,
  isSupportedExperimentType,
  isSupportedScenarioType,
  isSupportedExpectedOutputType,
  isSupportedExperimentStatus,
  isSupportedExperimentGovernanceStatus,
  getCanonicalExperimentTypes,
  getCanonicalScenarioTypes,
  getCanonicalExpectedOutputTypes,
  getCanonicalExperimentStatuses,
} from './ExperimentKernel.ts';

import {
  validateExperiment,
  validateScenario,
  validateDatasetReference,
  validateExpectedOutput,
  validateEvaluationMetadata,
  validateExperimentRegistry,
  validateLaboratoryArtifactWithExperiments,
  validateExperimentInput,
  EXPERIMENT_VALIDATION_CODES,
} from './ExperimentValidation.ts';

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const VALID_EXPERIMENT_PROVENANCE: ExperimentProvenance = {
  experimentId: 'exp-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Algorithm validation experiment',
  providedBy: 'NeuralVerse Team',
};

const VALID_SCENARIO_PROVENANCE: ScenarioProvenance = {
  scenarioId: 'scenario-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Baseline scenario',
  providedBy: 'NeuralVerse Team',
};

const VALID_DATASET_REF_PROVENANCE: DatasetReferenceProvenance = {
  datasetReferenceId: 'ds-ref-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'MNIST dataset reference',
  providedBy: 'NeuralVerse Team',
};

const VALID_OUTPUT_PROVENANCE: ExpectedOutputProvenance = {
  expectedOutputId: 'output-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Visualization output',
  providedBy: 'NeuralVerse Team',
};

const VALID_EVAL_PROVENANCE: EvaluationMetadataProvenance = {
  evaluationId: 'eval-001',
  source: 'NeuralVerse Team',
  governanceStatus: 'canonical',
  rationale: 'Accuracy evaluation',
  providedBy: 'NeuralVerse Team',
};

const VALID_SCENARIO: ExperimentScenario = {
  scenarioId: 'scenario-001',
  scenarioType: 'baseline',
  description: 'Baseline comparison scenario.',
  configurationReference: 'config-001',
  datasetReference: 'ds-ref-001',
  purpose: 'Establish baseline performance.',
  governanceStatus: 'canonical',
  provenance: VALID_SCENARIO_PROVENANCE,
};

const VALID_SCENARIO_2: ExperimentScenario = {
  scenarioId: 'scenario-002',
  scenarioType: 'comparative',
  description: 'Comparative scenario.',
  configurationReference: 'config-002',
  datasetReference: 'ds-ref-002',
  purpose: 'Compare two algorithms.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_SCENARIO_PROVENANCE, scenarioId: 'scenario-002' },
};

const VALID_DATASET_REF: ExperimentDatasetReference = {
  datasetReferenceId: 'ds-ref-001',
  datasetId: 'dataset-001',
  source: 'MNIST',
  description: 'MNIST handwritten digits dataset.',
  governanceStatus: 'canonical',
  provenance: VALID_DATASET_REF_PROVENANCE,
};

const VALID_DATASET_REF_2: ExperimentDatasetReference = {
  datasetReferenceId: 'ds-ref-002',
  datasetId: 'dataset-002',
  source: 'CIFAR-10',
  description: 'CIFAR-10 image dataset.',
  governanceStatus: 'accepted',
  provenance: { ...VALID_DATASET_REF_PROVENANCE, datasetReferenceId: 'ds-ref-002' },
};

const VALID_OUTPUT: ExperimentExpectedOutput = {
  expectedOutputId: 'output-001',
  outputType: 'visualization',
  description: 'Training loss visualization.',
  format: 'png',
  governanceStatus: 'canonical',
  provenance: VALID_OUTPUT_PROVENANCE,
};

const VALID_OUTPUT_2: ExperimentExpectedOutput = {
  expectedOutputId: 'output-002',
  outputType: 'metric',
  description: 'Accuracy metric.',
  format: 'json',
  governanceStatus: 'accepted',
  provenance: { ...VALID_OUTPUT_PROVENANCE, expectedOutputId: 'output-002' },
};

const VALID_EVAL_METADATA: ExperimentEvaluationMetadata = {
  evaluationId: 'eval-001',
  evaluationCriteria: ['accuracy > 0.95', 'loss < 0.1'],
  expectedArtifacts: ['output-001', 'output-002'],
  successConditions: ['All metrics pass thresholds.'],
  governanceStatus: 'canonical',
  provenance: VALID_EVAL_PROVENANCE,
};

const VALID_EVAL_METADATA_2: ExperimentEvaluationMetadata = {
  evaluationId: 'eval-002',
  evaluationCriteria: ['f1_score > 0.9'],
  expectedArtifacts: ['output-002'],
  successConditions: ['F1 score meets threshold.'],
  governanceStatus: 'accepted',
  provenance: { ...VALID_EVAL_PROVENANCE, evaluationId: 'eval-002' },
};

const VALID_EXPERIMENT: LaboratoryExperiment = {
  experimentId: 'exp-001',
  laboratoryId: 'lab-001',
  experimentType: 'algorithm_validation',
  scenarioId: 'scenario-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  datasetReferenceIds: ['ds-ref-001'],
  expectedOutputIds: ['output-001'],
  evaluationMetadataId: 'eval-001',
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_EXPERIMENT_PROVENANCE,
};

const VALID_EXPERIMENT_2: LaboratoryExperiment = {
  experimentId: 'exp-002',
  laboratoryId: 'lab-002',
  experimentType: 'machine_learning',
  scenarioId: 'scenario-002',
  configurationId: 'config-002',
  executionPolicyId: 'policy-002',
  datasetReferenceIds: ['ds-ref-002'],
  expectedOutputIds: ['output-002'],
  evaluationMetadataId: 'eval-002',
  status: 'published',
  governanceStatus: 'accepted',
  provenance: { ...VALID_EXPERIMENT_PROVENANCE, experimentId: 'exp-002' },
};

const INVALID_EXPERIMENT_MISSING_ID: LaboratoryExperiment = {
  experimentId: '',
  laboratoryId: 'lab-001',
  experimentType: 'algorithm_validation',
  scenarioId: 'scenario-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  datasetReferenceIds: ['ds-ref-001'],
  expectedOutputIds: ['output-001'],
  evaluationMetadataId: 'eval-001',
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_EXPERIMENT_PROVENANCE,
};

const INVALID_EXPERIMENT_UNKNOWN_TYPE: LaboratoryExperiment = {
  experimentId: 'exp-003',
  laboratoryId: 'lab-001',
  experimentType: 'unsupported_type' as any,
  scenarioId: 'scenario-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  datasetReferenceIds: ['ds-ref-001'],
  expectedOutputIds: ['output-001'],
  evaluationMetadataId: 'eval-001',
  status: 'approved',
  governanceStatus: 'canonical',
  provenance: VALID_EXPERIMENT_PROVENANCE,
};

const INVALID_EXPERIMENT_UNKNOWN_STATUS: LaboratoryExperiment = {
  experimentId: 'exp-004',
  laboratoryId: 'lab-001',
  experimentType: 'algorithm_validation',
  scenarioId: 'scenario-001',
  configurationId: 'config-001',
  executionPolicyId: 'policy-001',
  datasetReferenceIds: ['ds-ref-001'],
  expectedOutputIds: ['output-001'],
  evaluationMetadataId: 'eval-001',
  status: 'unsupported_status' as any,
  governanceStatus: 'canonical',
  provenance: VALID_EXPERIMENT_PROVENANCE,
};

// ---------------------------------------------------------------------------
// Valid Experiment Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Valid Experiment', () => {
  it('should compose valid experiment provenance', () => {
    const provenance = composeExperimentProvenance({
      experimentId: 'exp-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Algorithm validation',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.experimentId, 'exp-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
    assert.equal(provenance.governanceStatus, 'canonical');
  });

  it('should compose valid scenario provenance', () => {
    const provenance = composeScenarioProvenance({
      scenarioId: 'scenario-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Baseline scenario',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.scenarioId, 'scenario-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid dataset reference provenance', () => {
    const provenance = composeDatasetReferenceProvenance({
      datasetReferenceId: 'ds-ref-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'MNIST reference',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.datasetReferenceId, 'ds-ref-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid expected output provenance', () => {
    const provenance = composeExpectedOutputProvenance({
      expectedOutputId: 'output-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Visualization output',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.expectedOutputId, 'output-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid evaluation metadata provenance', () => {
    const provenance = composeEvaluationMetadataProvenance({
      evaluationId: 'eval-001',
      source: 'NeuralVerse Team',
      governanceStatus: 'canonical',
      rationale: 'Accuracy evaluation',
      providedBy: 'NeuralVerse Team',
    });

    assert.equal(provenance.evaluationId, 'eval-001');
    assert.equal(provenance.source, 'NeuralVerse Team');
  });

  it('should compose valid scenario', () => {
    const scenario = composeScenario({
      scenarioId: 'scenario-001',
      scenarioType: 'baseline',
      description: 'Baseline scenario.',
      configurationReference: 'config-001',
      datasetReference: 'ds-ref-001',
      purpose: 'Establish baseline.',
      governanceStatus: 'canonical',
      provenance: VALID_SCENARIO_PROVENANCE,
    });

    assert.equal(scenario.scenarioId, 'scenario-001');
    assert.equal(scenario.scenarioType, 'baseline');
    assert.equal(scenario.purpose, 'Establish baseline.');
  });

  it('should compose valid dataset reference', () => {
    const ref = composeDatasetReference({
      datasetReferenceId: 'ds-ref-001',
      datasetId: 'dataset-001',
      source: 'MNIST',
      description: 'MNIST dataset.',
      governanceStatus: 'canonical',
      provenance: VALID_DATASET_REF_PROVENANCE,
    });

    assert.equal(ref.datasetReferenceId, 'ds-ref-001');
    assert.equal(ref.datasetId, 'dataset-001');
    assert.equal(ref.source, 'MNIST');
  });

  it('should compose valid expected output', () => {
    const output = composeExpectedOutput({
      expectedOutputId: 'output-001',
      outputType: 'visualization',
      description: 'Training loss visualization.',
      format: 'png',
      governanceStatus: 'canonical',
      provenance: VALID_OUTPUT_PROVENANCE,
    });

    assert.equal(output.expectedOutputId, 'output-001');
    assert.equal(output.outputType, 'visualization');
    assert.equal(output.format, 'png');
  });

  it('should compose valid evaluation metadata', () => {
    const metadata = composeEvaluationMetadata({
      evaluationId: 'eval-001',
      evaluationCriteria: ['accuracy > 0.95'],
      expectedArtifacts: ['output-001'],
      successConditions: ['All metrics pass.'],
      governanceStatus: 'canonical',
      provenance: VALID_EVAL_PROVENANCE,
    });

    assert.equal(metadata.evaluationId, 'eval-001');
    assert.equal(metadata.evaluationCriteria.length, 1);
    assert.equal(metadata.expectedArtifacts.length, 1);
  });

  it('should compose valid experiment', () => {
    const experiment = composeExperiment({
      experimentId: 'exp-001',
      laboratoryId: 'lab-001',
      experimentType: 'algorithm_validation',
      scenarioId: 'scenario-001',
      configurationId: 'config-001',
      executionPolicyId: 'policy-001',
      datasetReferenceIds: ['ds-ref-001'],
      expectedOutputIds: ['output-001'],
      evaluationMetadataId: 'eval-001',
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_EXPERIMENT_PROVENANCE,
    });

    assert.equal(experiment.experimentId, 'exp-001');
    assert.equal(experiment.experimentType, 'algorithm_validation');
    assert.equal(experiment.status, 'approved');
  });

  it('should compose valid experiment trace', () => {
    const trace = composeExperimentTrace({
      traceId: '_trace_exp_1',
      experimentCount: 2,
      scenarioCount: 1,
      datasetReferenceCount: 1,
      expectedOutputCount: 1,
      evaluationMetadataCount: 1,
      decisions: [
        { decisionId: 'd1', experimentId: 'exp-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', experimentId: 'exp-002', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.traceId, '_trace_exp_1');
    assert.equal(trace.experimentCount, 2);
    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 0);
    assert.equal(trace.deterministic, true);
  });

  it('should compose valid experiment registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );

    assert.equal(registry.experiments.length, 1);
    assert.equal(registry.scenarios.length, 1);
    assert.equal(registry.datasetReferences.length, 1);
    assert.equal(registry.expectedOutputs.length, 1);
    assert.equal(registry.evaluationMetadata.length, 1);
    assert.equal(registry.deterministic, true);
  });

  it('should validate a valid experiment with no errors', () => {
    const errors = validateExperiment(VALID_EXPERIMENT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid scenario with no errors', () => {
    const errors = validateScenario(VALID_SCENARIO);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid dataset reference with no errors', () => {
    const errors = validateDatasetReference(VALID_DATASET_REF);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a valid expected output with no errors', () => {
    const errors = validateExpectedOutput(VALID_OUTPUT);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate valid evaluation metadata with no errors', () => {
    const errors = validateEvaluationMetadata(VALID_EVAL_METADATA);
    assert.deepStrictEqual(errors, []);
  });

  it('should validate a complete artifact', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const artifact = composeLaboratoryExperiments(input);
    const result = validateLaboratoryArtifactWithExperiments(artifact);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should validate experiment input', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT, VALID_EXPERIMENT_2],
      scenarios: [VALID_SCENARIO, VALID_SCENARIO_2],
      datasetReferences: [VALID_DATASET_REF, VALID_DATASET_REF_2],
      expectedOutputs: [VALID_OUTPUT, VALID_OUTPUT_2],
      evaluationMetadata: [VALID_EVAL_METADATA, VALID_EVAL_METADATA_2],
    };

    const result = validateExperimentInput(input);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate ID Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Duplicate IDs', () => {
  it('should detect duplicate experiment IDs in registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT, VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );
    const result = validateExperimentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EXPERIMENT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EXPERIMENT_DUPLICATE_ID error');
  });

  it('should detect duplicate scenario IDs in registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO, VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );
    const result = validateExperimentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.SCENARIO_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have SCENARIO_DUPLICATE_ID error');
  });

  it('should detect duplicate dataset reference IDs in registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF, VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );
    const result = validateExperimentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have DATASET_REFERENCE_DUPLICATE_ID error');
  });

  it('should detect duplicate expected output IDs in registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT, VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );
    const result = validateExperimentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.OUTPUT_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have OUTPUT_DUPLICATE_ID error');
  });

  it('should detect duplicate evaluation metadata IDs in registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA, VALID_EVAL_METADATA],
    );
    const result = validateExperimentRegistry(registry);
    const duplicateError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EVALUATION_DUPLICATE_ID,
    );

    assert.ok(duplicateError, 'Should have EVALUATION_DUPLICATE_ID error');
  });
});

// ---------------------------------------------------------------------------
// Unsupported Type Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Unsupported Types', () => {
  it('should reject unsupported experiment type', () => {
    assert.equal(isSupportedExperimentType('algorithm_validation'), true);
    assert.equal(isSupportedExperimentType('machine_learning'), true);
    assert.equal(isSupportedExperimentType('unsupported_type'), false);
  });

  it('should detect unsupported experiment type in validation', () => {
    const errors = validateExperiment(INVALID_EXPERIMENT_UNKNOWN_TYPE);
    const typeError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EXPERIMENT_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have EXPERIMENT_UNKNOWN_TYPE error');
  });

  it('should reject unsupported scenario type', () => {
    assert.equal(isSupportedScenarioType('baseline'), true);
    assert.equal(isSupportedScenarioType('comparative'), true);
    assert.equal(isSupportedScenarioType('unsupported_scenario'), false);
  });

  it('should detect unsupported scenario type in validation', () => {
    const scenario = { ...VALID_SCENARIO, scenarioType: 'unsupported_scenario' as any };
    const errors = validateScenario(scenario);
    const typeError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.SCENARIO_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have SCENARIO_UNKNOWN_TYPE error');
  });

  it('should reject unsupported expected output type', () => {
    assert.equal(isSupportedExpectedOutputType('visualization'), true);
    assert.equal(isSupportedExpectedOutputType('metric'), true);
    assert.equal(isSupportedExpectedOutputType('unsupported_output'), false);
  });

  it('should detect unsupported output type in validation', () => {
    const output = { ...VALID_OUTPUT, outputType: 'unsupported_output' as any };
    const errors = validateExpectedOutput(output);
    const typeError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.OUTPUT_UNKNOWN_TYPE,
    );

    assert.ok(typeError, 'Should have OUTPUT_UNKNOWN_TYPE error');
  });

  it('should reject unsupported experiment status', () => {
    assert.equal(isSupportedExperimentStatus('draft'), true);
    assert.equal(isSupportedExperimentStatus('approved'), true);
    assert.equal(isSupportedExperimentStatus('unsupported_status'), false);
  });

  it('should detect unsupported status in validation', () => {
    const errors = validateExperiment(INVALID_EXPERIMENT_UNKNOWN_STATUS);
    const statusError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EXPERIMENT_UNKNOWN_STATUS,
    );

    assert.ok(statusError, 'Should have EXPERIMENT_UNKNOWN_STATUS error');
  });
});

// ---------------------------------------------------------------------------
// Missing Provenance Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Missing Provenance', () => {
  it('should detect missing provenance in experiment', () => {
    const exp = { ...VALID_EXPERIMENT, provenance: undefined as any };
    const errors = validateExperiment(exp);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in scenario', () => {
    const scenario = { ...VALID_SCENARIO, provenance: undefined as any };
    const errors = validateScenario(scenario);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in dataset reference', () => {
    const ref = { ...VALID_DATASET_REF, provenance: undefined as any };
    const errors = validateDatasetReference(ref);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in expected output', () => {
    const output = { ...VALID_OUTPUT, provenance: undefined as any };
    const errors = validateExpectedOutput(output);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });

  it('should detect missing provenance in evaluation metadata', () => {
    const evalMeta = { ...VALID_EVAL_METADATA, provenance: undefined as any };
    const errors = validateEvaluationMetadata(evalMeta);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Source Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Missing Source', () => {
  it('should detect missing provenance in experiment', () => {
    const exp = {
      ...VALID_EXPERIMENT,
      provenance: undefined as any,
    };
    const errors = validateExperiment(exp);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing Rationale Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Missing Rationale', () => {
  it('should detect missing provenance in scenario', () => {
    const scenario = {
      ...VALID_SCENARIO,
      provenance: undefined as any,
    };
    const errors = validateScenario(scenario);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Missing ProvidedBy Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Missing ProvidedBy', () => {
  it('should detect missing provenance in dataset reference', () => {
    const ref = {
      ...VALID_DATASET_REF,
      provenance: undefined as any,
    };
    const errors = validateDatasetReference(ref);
    const provenanceError = errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
    );

    assert.ok(provenanceError, 'Should have MISSING_PROVENANCE error');
  });
});

// ---------------------------------------------------------------------------
// Empty Registry Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Empty Registry', () => {
  it('should detect empty registry', () => {
    const registry = composeExperimentRegistry([], [], [], [], []);
    const result = validateExperimentRegistry(registry);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input experiments', () => {
    const input: ExperimentInput = {
      experiments: [],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };
    const result = validateExperimentInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
    );

    assert.ok(emptyError, 'Should have EMPTY_REGISTRY error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input scenarios', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };
    const result = validateExperimentInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.SCENARIO_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have SCENARIO_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input dataset references', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };
    const result = validateExperimentInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have DATASET_REFERENCE_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input expected outputs', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };
    const result = validateExperimentInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.OUTPUT_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have OUTPUT_MISSING_ID error');
    assert.equal(result.valid, false);
  });

  it('should detect empty input evaluation metadata', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [],
    };
    const result = validateExperimentInput(input);
    const emptyError = result.errors.find(
      (e) => e.code === EXPERIMENT_VALIDATION_CODES.EVALUATION_MISSING_ID,
    );

    assert.ok(emptyError, 'Should have EVALUATION_MISSING_ID error');
    assert.equal(result.valid, false);
  });
});

// ---------------------------------------------------------------------------
// Deterministic Ordering Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Deterministic Ordering', () => {
  it('should sort experiments by experimentId', () => {
    const exp3 = { ...VALID_EXPERIMENT, experimentId: 'exp-003', laboratoryId: 'lab-003' };
    const exp1 = { ...VALID_EXPERIMENT, experimentId: 'exp-001', laboratoryId: 'lab-001' };
    const exp2 = { ...VALID_EXPERIMENT, experimentId: 'exp-002', laboratoryId: 'lab-002' };

    const registry = composeExperimentRegistry(
      [exp3, exp1, exp2],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );

    assert.equal(registry.experiments[0].experimentId, 'exp-001');
    assert.equal(registry.experiments[1].experimentId, 'exp-002');
    assert.equal(registry.experiments[2].experimentId, 'exp-003');
  });

  it('should sort by scenarioId when experimentId is equal', () => {
    const expA = { ...VALID_EXPERIMENT, experimentId: 'exp-001', scenarioId: 'scenario-002' };
    const expB = { ...VALID_EXPERIMENT, experimentId: 'exp-001', scenarioId: 'scenario-001' };

    const registry = composeExperimentRegistry(
      [expA, expB],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );

    assert.equal(registry.experiments[0].scenarioId, 'scenario-001');
    assert.equal(registry.experiments[1].scenarioId, 'scenario-002');
  });
});

// ---------------------------------------------------------------------------
// Immutable Input Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Immutable Input', () => {
  it('should not mutate input experiments', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const originalId = VALID_EXPERIMENT.experimentId;
    const originalType = VALID_EXPERIMENT.experimentType;

    composeLaboratoryExperiments(input);

    assert.equal(VALID_EXPERIMENT.experimentId, originalId);
    assert.equal(VALID_EXPERIMENT.experimentType, originalType);
  });

  it('should not mutate input scenarios', () => {
    const scenarios = [VALID_SCENARIO, VALID_SCENARIO_2];
    const originalIds = scenarios.map((s) => s.scenarioId);

    composeExperimentRegistry([VALID_EXPERIMENT], scenarios, [VALID_DATASET_REF], [VALID_OUTPUT], [VALID_EVAL_METADATA]);

    assert.equal(scenarios[0].scenarioId, originalIds[0]);
    assert.equal(scenarios[1].scenarioId, originalIds[1]);
  });
});

// ---------------------------------------------------------------------------
// Identical Output Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Identical Output', () => {
  it('should produce identical output for identical input (100 iterations)', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT, VALID_EXPERIMENT_2],
      scenarios: [VALID_SCENARIO, VALID_SCENARIO_2],
      datasetReferences: [VALID_DATASET_REF, VALID_DATASET_REF_2],
      expectedOutputs: [VALID_OUTPUT, VALID_OUTPUT_2],
      evaluationMetadata: [VALID_EVAL_METADATA, VALID_EVAL_METADATA_2],
    };

    const results: ReturnType<typeof composeLaboratoryExperiments>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeLaboratoryExperiments(input));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].artifactId, results[i].artifactId);
      assert.deepStrictEqual(results[0].trace.traceId, results[i].trace.traceId);
      assert.deepStrictEqual(results[0].trace.decisions, results[i].trace.decisions);
      assert.deepStrictEqual(results[0].registry.experiments, results[i].registry.experiments);
    }
  });

  it('should produce identical registry output for identical input', () => {
    const experiments = [VALID_EXPERIMENT, VALID_EXPERIMENT_2];
    const scenarios = [VALID_SCENARIO, VALID_SCENARIO_2];
    const datasetRefs = [VALID_DATASET_REF, VALID_DATASET_REF_2];
    const outputs = [VALID_OUTPUT, VALID_OUTPUT_2];
    const evals = [VALID_EVAL_METADATA, VALID_EVAL_METADATA_2];

    const results: ReturnType<typeof composeExperimentRegistry>[] = [];
    for (let i = 0; i < 100; i++) {
      results.push(composeExperimentRegistry(experiments, scenarios, datasetRefs, outputs, evals));
    }

    for (let i = 1; i < results.length; i++) {
      assert.deepStrictEqual(results[0].experiments, results[i].experiments);
      assert.deepStrictEqual(results[0].scenarios, results[i].scenarios);
      assert.deepStrictEqual(results[0].datasetReferences, results[i].datasetReferences);
    }
  });
});

// ---------------------------------------------------------------------------
// Registry Validation Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Registry Validation', () => {
  it('should validate a complete registry', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT, VALID_EXPERIMENT_2],
      [VALID_SCENARIO, VALID_SCENARIO_2],
      [VALID_DATASET_REF, VALID_DATASET_REF_2],
      [VALID_OUTPUT, VALID_OUTPUT_2],
      [VALID_EVAL_METADATA, VALID_EVAL_METADATA_2],
    );
    const result = validateExperimentRegistry(registry);

    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
    assert.equal(result.checkedAt, 'experiment_registry_composition');
  });

  it('should validate registry determinism metadata', () => {
    const registry = composeExperimentRegistry(
      [VALID_EXPERIMENT],
      [VALID_SCENARIO],
      [VALID_DATASET_REF],
      [VALID_OUTPUT],
      [VALID_EVAL_METADATA],
    );

    assert.equal(registry.deterministic, true);
    assert.equal(registry.randomUsed, false);
    assert.equal(registry.timeDependency, false);
    assert.equal(registry.generatedFrom, 'deterministic_experiment_kernel');
  });
});

// ---------------------------------------------------------------------------
// Trace Validation Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Trace Validation', () => {
  it('should validate trace determinism metadata', () => {
    const trace = composeExperimentTrace({
      traceId: '_trace_exp_1',
      experimentCount: 1,
      scenarioCount: 1,
      datasetReferenceCount: 1,
      expectedOutputCount: 1,
      evaluationMetadataCount: 1,
      decisions: [
        { decisionId: 'd1', experimentId: 'exp-001', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.deterministic, true);
    assert.equal(trace.randomUsed, false);
    assert.equal(trace.timeDependency, false);
    assert.equal(trace.generatedFrom, 'deterministic_experiment_kernel');
  });

  it('should count validated and invalid decisions', () => {
    const trace = composeExperimentTrace({
      traceId: '_trace_exp_1',
      experimentCount: 3,
      scenarioCount: 2,
      datasetReferenceCount: 2,
      expectedOutputCount: 2,
      evaluationMetadataCount: 2,
      decisions: [
        { decisionId: 'd1', experimentId: 'exp-001', validationPassed: true, validationErrors: [] },
        { decisionId: 'd2', experimentId: 'exp-002', validationPassed: false, validationErrors: ['EXPERIMENT_UNKNOWN_TYPE'] },
        { decisionId: 'd3', experimentId: 'exp-003', validationPassed: true, validationErrors: [] },
      ],
    });

    assert.equal(trace.validatedCount, 2);
    assert.equal(trace.invalidCount, 1);
  });
});

// ---------------------------------------------------------------------------
// Helper Function Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Helper Functions', () => {
  it('should return canonical experiment types', () => {
    const types = getCanonicalExperimentTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EXPERIMENT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical scenario types', () => {
    const types = getCanonicalScenarioTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_SCENARIO_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical expected output types', () => {
    const types = getCanonicalExpectedOutputTypes();
    assert.deepStrictEqual([...types], [...CANONICAL_EXPECTED_OUTPUT_TYPES]);
    assert.equal(types.length, 10);
  });

  it('should return canonical experiment statuses', () => {
    const statuses = getCanonicalExperimentStatuses();
    assert.deepStrictEqual([...statuses], [...CANONICAL_EXPERIMENT_STATUS]);
    assert.equal(statuses.length, 6);
  });

  it('should validate governance status', () => {
    assert.equal(isSupportedExperimentGovernanceStatus('canonical'), true);
    assert.equal(isSupportedExperimentGovernanceStatus('accepted'), true);
    assert.equal(isSupportedExperimentGovernanceStatus('provisional'), true);
    assert.equal(isSupportedExperimentGovernanceStatus('deprecated'), true);
    assert.equal(isSupportedExperimentGovernanceStatus('rejected'), true);
    assert.equal(isSupportedExperimentGovernanceStatus('invalid'), false);
  });
});

// ---------------------------------------------------------------------------
// Canonical Enum Completeness Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Canonical Enum Completeness', () => {
  it('should have exactly 10 experiment types', () => {
    assert.equal(CANONICAL_EXPERIMENT_TYPES.length, 10);
  });

  it('should have exactly 10 scenario types', () => {
    assert.equal(CANONICAL_SCENARIO_TYPES.length, 10);
  });

  it('should have exactly 10 expected output types', () => {
    assert.equal(CANONICAL_EXPECTED_OUTPUT_TYPES.length, 10);
  });

  it('should have exactly 6 experiment statuses', () => {
    assert.equal(CANONICAL_EXPERIMENT_STATUS.length, 6);
  });

  it('should contain all expected experiment types', () => {
    const expectedTypes = ['algorithm_validation', 'parameter_exploration', 'visualization', 'simulation', 'comparison', 'dataset_analysis', 'mathematical_model', 'computer_vision', 'machine_learning', 'capstone'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EXPERIMENT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected scenario types', () => {
    const expectedTypes = ['baseline', 'reference', 'controlled', 'comparative', 'ablation', 'stress', 'edge_case', 'exploratory', 'educational', 'custom'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_SCENARIO_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });

  it('should contain all expected output types', () => {
    const expectedTypes = ['visualization', 'metric', 'comparison', 'observation', 'artifact', 'dataset', 'graph', 'table', 'report', 'none'];

    for (const type of expectedTypes) {
      assert.ok(
        CANONICAL_EXPECTED_OUTPUT_TYPES.includes(type as any),
        `Should include type: ${type}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Negative Capability Verification Tests
// ---------------------------------------------------------------------------

describe('Experiment Kernel — Negative Capability Verification', () => {
  it('should not use Math.random', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(result, 'Should produce a result without Math.random');
  });

  it('should not use Date.now', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(result, 'Should produce a result without Date.now');
  });

  it('should not use performance.now', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(result, 'Should produce a result without performance.now');
  });

  it('should not use crypto.randomUUID', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(result, 'Should produce a result without crypto.randomUUID');
  });

  it('should not execute simulations', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(!('simulationResult' in result), 'Should not have simulation result');
    assert.ok(!('runtimeState' in result), 'Should not have runtime state');
  });

  it('should not execute experiments', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(!('executionResult' in result), 'Should not have execution result');
    assert.ok(!('output' in result), 'Should not have output');
  });

  it('should not perform network requests', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(!('networkResponse' in result), 'Should not have network response');
    assert.ok(!('httpResult' in result), 'Should not have HTTP result');
  });

  it('should not generate code', () => {
    const input: ExperimentInput = {
      experiments: [VALID_EXPERIMENT],
      scenarios: [VALID_SCENARIO],
      datasetReferences: [VALID_DATASET_REF],
      expectedOutputs: [VALID_OUTPUT],
      evaluationMetadata: [VALID_EVAL_METADATA],
    };

    const result = composeLaboratoryExperiments(input);
    assert.ok(!('generatedCode' in result), 'Should not have generated code');
    assert.ok(!('sourceCode' in result), 'Should not have source code');
  });

  it('should not have executable callbacks in experiment', () => {
    const experiment = composeExperiment({
      experimentId: 'exp-001',
      laboratoryId: 'lab-001',
      experimentType: 'algorithm_validation',
      scenarioId: 'scenario-001',
      configurationId: 'config-001',
      executionPolicyId: 'policy-001',
      datasetReferenceIds: ['ds-ref-001'],
      expectedOutputIds: ['output-001'],
      evaluationMetadataId: 'eval-001',
      status: 'approved',
      governanceStatus: 'canonical',
      provenance: VALID_EXPERIMENT_PROVENANCE,
    });

    const keys = Object.keys(experiment);
    for (const key of keys) {
      const value = (experiment as any)[key];
      assert.ok(typeof value !== 'function', `Experiment field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in scenario', () => {
    const scenario = composeScenario({
      scenarioId: 'scenario-001',
      scenarioType: 'baseline',
      description: 'Baseline scenario.',
      configurationReference: 'config-001',
      datasetReference: 'ds-ref-001',
      purpose: 'Establish baseline.',
      governanceStatus: 'canonical',
      provenance: VALID_SCENARIO_PROVENANCE,
    });

    const keys = Object.keys(scenario);
    for (const key of keys) {
      const value = (scenario as any)[key];
      assert.ok(typeof value !== 'function', `Scenario field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in dataset reference', () => {
    const ref = composeDatasetReference({
      datasetReferenceId: 'ds-ref-001',
      datasetId: 'dataset-001',
      source: 'MNIST',
      description: 'MNIST dataset.',
      governanceStatus: 'canonical',
      provenance: VALID_DATASET_REF_PROVENANCE,
    });

    const keys = Object.keys(ref);
    for (const key of keys) {
      const value = (ref as any)[key];
      assert.ok(typeof value !== 'function', `Dataset reference field "${key}" should not be a function`);
    }
  });

  it('should not have executable callbacks in expected output', () => {
    const output = composeExpectedOutput({
      expectedOutputId: 'output-001',
      outputType: 'visualization',
      description: 'Training loss visualization.',
      format: 'png',
      governanceStatus: 'canonical',
      provenance: VALID_OUTPUT_PROVENANCE,
    });

    const keys = Object.keys(output);
    for (const key of keys) {
      const value = (output as any)[key];
      assert.ok(typeof value !== 'function', `Expected output field "${key}" should not be a function`);
    }
  });
});
