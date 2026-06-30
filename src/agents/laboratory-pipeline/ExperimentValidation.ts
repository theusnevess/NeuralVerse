/**
 * NV-1600-D4-OPT-04 — Experiment Validation Layer
 *
 * Deterministic validation for experiment metadata.
 * Returns structured errors, never exceptions for expected validation failures.
 *
 * Deterministic. No Math.random. No Date.now. No global mutable state.
 */

import type {
  LaboratoryExperiment,
  ExperimentScenario,
  ExperimentDatasetReference,
  ExperimentExpectedOutput,
  ExperimentEvaluationMetadata,
  ExperimentRegistry,
  LaboratoryArtifactWithExperiments,
  ExperimentInput,
  ExperimentValidationError,
  ExperimentValidationResult,
  ExperimentRegistryValidationResult,
  ExperimentArtifactValidationResult,
  ExperimentInputValidationResult,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_SCENARIO_TYPES,
  CANONICAL_EXPECTED_OUTPUT_TYPES,
  CANONICAL_EXPERIMENT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Validation Error Codes
// ---------------------------------------------------------------------------

export const EXPERIMENT_VALIDATION_CODES = {
  EXPERIMENT_UNKNOWN_TYPE: 'EXPERIMENT_UNKNOWN_TYPE',
  EXPERIMENT_UNKNOWN_STATUS: 'EXPERIMENT_UNKNOWN_STATUS',
  SCENARIO_UNKNOWN_TYPE: 'SCENARIO_UNKNOWN_TYPE',
  OUTPUT_UNKNOWN_TYPE: 'OUTPUT_UNKNOWN_TYPE',
  EXPERIMENT_DUPLICATE_ID: 'EXPERIMENT_DUPLICATE_ID',
  SCENARIO_DUPLICATE_ID: 'SCENARIO_DUPLICATE_ID',
  DATASET_REFERENCE_DUPLICATE_ID: 'DATASET_REFERENCE_DUPLICATE_ID',
  OUTPUT_DUPLICATE_ID: 'OUTPUT_DUPLICATE_ID',
  INVALID_CONFIGURATION_REFERENCE: 'INVALID_CONFIGURATION_REFERENCE',
  INVALID_EXECUTION_REFERENCE: 'INVALID_EXECUTION_REFERENCE',
  INVALID_DATASET_REFERENCE: 'INVALID_DATASET_REFERENCE',
  INVALID_OUTPUT_REFERENCE: 'INVALID_OUTPUT_REFERENCE',
  INVALID_EVALUATION_REFERENCE: 'INVALID_EVALUATION_REFERENCE',
  MISSING_PROVENANCE: 'MISSING_PROVENANCE',
  MISSING_SOURCE: 'MISSING_SOURCE',
  MISSING_RATIONALE: 'MISSING_RATIONALE',
  MISSING_PROVIDED_BY: 'MISSING_PROVIDED_BY',
  EMPTY_REGISTRY: 'EMPTY_REGISTRY',
  TRACE_NOT_DETERMINISTIC: 'TRACE_NOT_DETERMINISTIC',
  TRACE_RANDOM_USED: 'TRACE_RANDOM_USED',
  TRACE_TIME_DEPENDENCY: 'TRACE_TIME_DEPENDENCY',
  TRACE_LABORATORY_MUTATED: 'TRACE_LABORATORY_MUTATED',
  EXPERIMENT_INVALID_GOVERNANCE: 'EXPERIMENT_INVALID_GOVERNANCE',
  EXPERIMENT_MISSING_EXPERIMENT_ID: 'EXPERIMENT_MISSING_EXPERIMENT_ID',
  EXPERIMENT_MISSING_LABORATORY_ID: 'EXPERIMENT_MISSING_LABORATORY_ID',
  SCENARIO_MISSING_ID: 'SCENARIO_MISSING_ID',
  SCENARIO_INVALID_GOVERNANCE: 'SCENARIO_INVALID_GOVERNANCE',
  DATASET_REFERENCE_MISSING_ID: 'DATASET_REFERENCE_MISSING_ID',
  DATASET_REFERENCE_INVALID_GOVERNANCE: 'DATASET_REFERENCE_INVALID_GOVERNANCE',
  OUTPUT_MISSING_ID: 'OUTPUT_MISSING_ID',
  OUTPUT_INVALID_GOVERNANCE: 'OUTPUT_INVALID_GOVERNANCE',
  EVALUATION_MISSING_ID: 'EVALUATION_MISSING_ID',
  EVALUATION_INVALID_GOVERNANCE: 'EVALUATION_INVALID_GOVERNANCE',
  EVALUATION_DUPLICATE_ID: 'EVALUATION_DUPLICATE_ID',
} as const;

// ---------------------------------------------------------------------------
// Single Experiment Validation
// ---------------------------------------------------------------------------

/**
 * Validates a single experiment against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExperiment(
  experiment: LaboratoryExperiment,
): readonly ExperimentValidationError[] {
  const errors: ExperimentValidationError[] = [];

  if (!experiment.experimentId || experiment.experimentId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_MISSING_EXPERIMENT_ID,
      message: 'Experiment is missing an experiment ID.',
      field: 'experimentId',
      experimentId: experiment.experimentId,
    });
  }

  if (!experiment.laboratoryId || experiment.laboratoryId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_MISSING_LABORATORY_ID,
      message: 'Experiment is missing a laboratory ID.',
      field: 'laboratoryId',
      experimentId: experiment.experimentId,
    });
  }

  if (!experiment.experimentType || !CANONICAL_EXPERIMENT_TYPES.includes(experiment.experimentType)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_UNKNOWN_TYPE,
      message: `Experiment has unsupported type: "${experiment.experimentType}".`,
      field: 'experimentType',
      experimentId: experiment.experimentId,
    });
  }

  if (!experiment.status || !CANONICAL_EXPERIMENT_STATUS.includes(experiment.status)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_UNKNOWN_STATUS,
      message: `Experiment has unsupported status: "${experiment.status}".`,
      field: 'status',
      experimentId: experiment.experimentId,
    });
  }

  if (!experiment.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(experiment.governanceStatus)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_INVALID_GOVERNANCE,
      message: `Experiment has invalid governance status: "${experiment.governanceStatus}".`,
      field: 'governanceStatus',
      experimentId: experiment.experimentId,
    });
  }

  if (!experiment.provenance) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Experiment is missing provenance.',
      field: 'provenance',
      experimentId: experiment.experimentId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Scenario Validation
// ---------------------------------------------------------------------------

/**
 * Validates a scenario against canonical invariants.
 * Pure function. No side effects.
 */
export function validateScenario(
  scenario: ExperimentScenario,
): readonly ExperimentValidationError[] {
  const errors: ExperimentValidationError[] = [];

  if (!scenario.scenarioId || scenario.scenarioId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.SCENARIO_MISSING_ID,
      message: 'Scenario is missing a scenario ID.',
      field: 'scenarioId',
      scenarioId: scenario.scenarioId,
    });
  }

  if (!scenario.description || scenario.description.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.SCENARIO_MISSING_ID,
      message: 'Scenario is missing a description.',
      field: 'description',
      scenarioId: scenario.scenarioId,
    });
  }

  if (!CANONICAL_SCENARIO_TYPES.includes(scenario.scenarioType)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.SCENARIO_UNKNOWN_TYPE,
      message: `Scenario has unsupported type: "${scenario.scenarioType}".`,
      field: 'scenarioType',
      scenarioId: scenario.scenarioId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(scenario.governanceStatus)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.SCENARIO_INVALID_GOVERNANCE,
      message: `Scenario has invalid governance status: "${scenario.governanceStatus}".`,
      field: 'governanceStatus',
      scenarioId: scenario.scenarioId,
    });
  }

  if (!scenario.provenance) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Scenario is missing provenance.',
      field: 'provenance',
      scenarioId: scenario.scenarioId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Dataset Reference Validation
// ---------------------------------------------------------------------------

/**
 * Validates a dataset reference against canonical invariants.
 * Pure function. No side effects.
 */
export function validateDatasetReference(
  ref: ExperimentDatasetReference,
): readonly ExperimentValidationError[] {
  const errors: ExperimentValidationError[] = [];

  if (!ref.datasetReferenceId || ref.datasetReferenceId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_MISSING_ID,
      message: 'Dataset reference is missing a reference ID.',
      field: 'datasetReferenceId',
      datasetReferenceId: ref.datasetReferenceId,
    });
  }

  if (!ref.datasetId || ref.datasetId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.INVALID_DATASET_REFERENCE,
      message: 'Dataset reference is missing a dataset ID.',
      field: 'datasetId',
      datasetReferenceId: ref.datasetReferenceId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(ref.governanceStatus)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_INVALID_GOVERNANCE,
      message: `Dataset reference has invalid governance status: "${ref.governanceStatus}".`,
      field: 'governanceStatus',
      datasetReferenceId: ref.datasetReferenceId,
    });
  }

  if (!ref.provenance) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Dataset reference is missing provenance.',
      field: 'provenance',
      datasetReferenceId: ref.datasetReferenceId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Expected Output Validation
// ---------------------------------------------------------------------------

/**
 * Validates an expected output against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExpectedOutput(
  output: ExperimentExpectedOutput,
): readonly ExperimentValidationError[] {
  const errors: ExperimentValidationError[] = [];

  if (!output.expectedOutputId || output.expectedOutputId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.OUTPUT_MISSING_ID,
      message: 'Expected output is missing an output ID.',
      field: 'expectedOutputId',
      expectedOutputId: output.expectedOutputId,
    });
  }

  if (!CANONICAL_EXPECTED_OUTPUT_TYPES.includes(output.outputType)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.OUTPUT_UNKNOWN_TYPE,
      message: `Expected output has unsupported type: "${output.outputType}".`,
      field: 'outputType',
      expectedOutputId: output.expectedOutputId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(output.governanceStatus)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.OUTPUT_INVALID_GOVERNANCE,
      message: `Expected output has invalid governance status: "${output.governanceStatus}".`,
      field: 'governanceStatus',
      expectedOutputId: output.expectedOutputId,
    });
  }

  if (!output.provenance) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Expected output is missing provenance.',
      field: 'provenance',
      expectedOutputId: output.expectedOutputId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Evaluation Metadata Validation
// ---------------------------------------------------------------------------

/**
 * Validates evaluation metadata against canonical invariants.
 * Pure function. No side effects.
 */
export function validateEvaluationMetadata(
  metadata: ExperimentEvaluationMetadata,
): readonly ExperimentValidationError[] {
  const errors: ExperimentValidationError[] = [];

  if (!metadata.evaluationId || metadata.evaluationId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EVALUATION_MISSING_ID,
      message: 'Evaluation metadata is missing an evaluation ID.',
      field: 'evaluationId',
      evaluationId: metadata.evaluationId,
    });
  }

  if (!CANONICAL_GOVERNANCE_STATUSES.includes(metadata.governanceStatus)) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EVALUATION_INVALID_GOVERNANCE,
      message: `Evaluation metadata has invalid governance status: "${metadata.governanceStatus}".`,
      field: 'governanceStatus',
      evaluationId: metadata.evaluationId,
    });
  }

  if (!metadata.provenance) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.MISSING_PROVENANCE,
      message: 'Evaluation metadata is missing provenance.',
      field: 'provenance',
      evaluationId: metadata.evaluationId,
    });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Experiment Registry Validation
// ---------------------------------------------------------------------------

/**
 * Validates an experiment registry against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExperimentRegistry(
  registry: ExperimentRegistry,
): ExperimentRegistryValidationResult {
  const errors: ExperimentValidationError[] = [];

  if (!registry.registryId || registry.registryId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry is missing a registry ID.',
      field: 'registryId',
    });
  }

  if (!registry.experiments || registry.experiments.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Registry has no experiments.',
      field: 'experiments',
    });
  }

  if (registry.deterministic !== true) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Registry must declare deterministic: true.',
      field: 'deterministic',
    });
  }

  if (registry.randomUsed !== false) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.TRACE_RANDOM_USED,
      message: 'Registry must declare randomUsed: false.',
      field: 'randomUsed',
    });
  }

  if (registry.timeDependency !== false) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
      message: 'Registry must declare timeDependency: false.',
      field: 'timeDependency',
    });
  }

  // Check for duplicate experiment IDs
  const seenExperimentIds = new Set<string>();
  for (const exp of registry.experiments) {
    if (seenExperimentIds.has(exp.experimentId)) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.EXPERIMENT_DUPLICATE_ID,
        message: `Duplicate experiment ID: "${exp.experimentId}".`,
        experimentId: exp.experimentId,
      });
    }
    seenExperimentIds.add(exp.experimentId);
  }

  // Check for duplicate scenario IDs
  const seenScenarioIds = new Set<string>();
  for (const scenario of registry.scenarios) {
    if (seenScenarioIds.has(scenario.scenarioId)) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.SCENARIO_DUPLICATE_ID,
        message: `Duplicate scenario ID: "${scenario.scenarioId}".`,
        scenarioId: scenario.scenarioId,
      });
    }
    seenScenarioIds.add(scenario.scenarioId);
  }

  // Check for duplicate dataset reference IDs
  const seenDatasetRefIds = new Set<string>();
  for (const ref of registry.datasetReferences) {
    if (seenDatasetRefIds.has(ref.datasetReferenceId)) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_DUPLICATE_ID,
        message: `Duplicate dataset reference ID: "${ref.datasetReferenceId}".`,
        datasetReferenceId: ref.datasetReferenceId,
      });
    }
    seenDatasetRefIds.add(ref.datasetReferenceId);
  }

  // Check for duplicate expected output IDs
  const seenOutputIds = new Set<string>();
  for (const output of registry.expectedOutputs) {
    if (seenOutputIds.has(output.expectedOutputId)) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.OUTPUT_DUPLICATE_ID,
        message: `Duplicate expected output ID: "${output.expectedOutputId}".`,
        expectedOutputId: output.expectedOutputId,
      });
    }
    seenOutputIds.add(output.expectedOutputId);
  }

  // Check for duplicate evaluation metadata IDs
  const seenEvaluationIds = new Set<string>();
  for (const evalMeta of registry.evaluationMetadata) {
    if (seenEvaluationIds.has(evalMeta.evaluationId)) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.EVALUATION_DUPLICATE_ID,
        message: `Duplicate evaluation metadata ID: "${evalMeta.evaluationId}".`,
        evaluationId: evalMeta.evaluationId,
      });
    }
    seenEvaluationIds.add(evalMeta.evaluationId);
  }

  // Validate each experiment
  for (const exp of registry.experiments) {
    errors.push(...validateExperiment(exp));
  }

  // Validate each scenario
  for (const scenario of registry.scenarios) {
    errors.push(...validateScenario(scenario));
  }

  // Validate each dataset reference
  for (const ref of registry.datasetReferences) {
    errors.push(...validateDatasetReference(ref));
  }

  // Validate each expected output
  for (const output of registry.expectedOutputs) {
    errors.push(...validateExpectedOutput(output));
  }

  // Validate each evaluation metadata
  for (const evalMeta of registry.evaluationMetadata) {
    errors.push(...validateEvaluationMetadata(evalMeta));
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'experiment_registry_composition',
  };
}

// ---------------------------------------------------------------------------
// Artifact Validation
// ---------------------------------------------------------------------------

/**
 * Validates a laboratory artifact with experiments against canonical invariants.
 * Pure function. No side effects.
 */
export function validateLaboratoryArtifactWithExperiments(
  artifact: LaboratoryArtifactWithExperiments,
): ExperimentArtifactValidationResult {
  const errors: ExperimentValidationError[] = [];

  if (!artifact.artifactId || artifact.artifactId.trim() === '') {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.INVALID_CONFIGURATION_REFERENCE,
      message: 'Artifact is missing an artifact ID.',
      field: 'artifactId',
    });
  }

  if (!artifact.registry) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Artifact is missing a registry.',
      field: 'registry',
    });
  } else {
    const registryResult = validateExperimentRegistry(artifact.registry);
    errors.push(...registryResult.errors);
  }

  if (!artifact.trace) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
      message: 'Artifact is missing a trace.',
      field: 'trace',
    });
  } else {
    if (artifact.trace.deterministic !== true) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.TRACE_NOT_DETERMINISTIC,
        message: 'Trace must declare deterministic: true.',
        field: 'trace.deterministic',
      });
    }
    if (artifact.trace.randomUsed !== false) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.TRACE_RANDOM_USED,
        message: 'Trace must declare randomUsed: false.',
        field: 'trace.randomUsed',
      });
    }
    if (artifact.trace.timeDependency !== false) {
      errors.push({
        code: EXPERIMENT_VALIDATION_CODES.TRACE_TIME_DEPENDENCY,
        message: 'Trace must declare timeDependency: false.',
        field: 'trace.timeDependency',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'experiment_artifact_composition',
  };
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates experiment input against canonical invariants.
 * Pure function. No side effects.
 */
export function validateExperimentInput(
  input: ExperimentInput,
): ExperimentInputValidationResult {
  const errors: ExperimentValidationError[] = [];

  if (!input.experiments || input.experiments.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EMPTY_REGISTRY,
      message: 'Input has no experiments.',
      field: 'experiments',
    });
  } else {
    for (const exp of input.experiments) {
      errors.push(...validateExperiment(exp));
    }
  }

  if (!input.scenarios || input.scenarios.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.SCENARIO_MISSING_ID,
      message: 'Input has no scenarios.',
      field: 'scenarios',
    });
  } else {
    for (const scenario of input.scenarios) {
      errors.push(...validateScenario(scenario));
    }
  }

  if (!input.datasetReferences || input.datasetReferences.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.DATASET_REFERENCE_MISSING_ID,
      message: 'Input has no dataset references.',
      field: 'datasetReferences',
    });
  } else {
    for (const ref of input.datasetReferences) {
      errors.push(...validateDatasetReference(ref));
    }
  }

  if (!input.expectedOutputs || input.expectedOutputs.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.OUTPUT_MISSING_ID,
      message: 'Input has no expected outputs.',
      field: 'expectedOutputs',
    });
  } else {
    for (const output of input.expectedOutputs) {
      errors.push(...validateExpectedOutput(output));
    }
  }

  if (!input.evaluationMetadata || input.evaluationMetadata.length === 0) {
    errors.push({
      code: EXPERIMENT_VALIDATION_CODES.EVALUATION_MISSING_ID,
      message: 'Input has no evaluation metadata.',
      field: 'evaluationMetadata',
    });
  } else {
    for (const evalMeta of input.evaluationMetadata) {
      errors.push(...validateEvaluationMetadata(evalMeta));
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    checkedAt: 'experiment_input_composition',
  };
}
