/**
 * NV-1600-D4-OPT-04 — Simulation Scenario Composition & Experiment Modeling Kernel
 *
 * Deterministic orchestration functions for experiment metadata.
 * Produces experiments, scenarios, dataset references, expected outputs,
 * evaluation metadata, artifacts, traces, and registries.
 *
 * This module never:
 * - Executes simulations
 * - Executes experiments
 * - Generates reports
 * - Calculates metrics
 * - Compares outputs
 * - Evaluates results
 * - Loads datasets
 * - Executes algorithms
 * - Invokes execution environments
 * - Optimizes parameters
 * - Infers outcomes
 * - Rewrites experiments
 * - Generates code
 * - Accesses runtime
 * - Mutates registries
 *
 * Experiment metadata only.
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
  ExperimentDecision,
  ExperimentTrace,
  ExperimentInput,
  LaboratoryArtifactWithExperiments,
  ExperimentProvenance,
  ScenarioProvenance,
  DatasetReferenceProvenance,
  ExpectedOutputProvenance,
  EvaluationMetadataProvenance,
  ExperimentType,
  ScenarioType,
  ExpectedOutputType,
  ExperimentStatus,
  LaboratoryGovernanceStatus,
} from './LaboratoryAgentContract.ts';

import {
  CANONICAL_EXPERIMENT_TYPES,
  CANONICAL_SCENARIO_TYPES,
  CANONICAL_EXPECTED_OUTPUT_TYPES,
  CANONICAL_EXPERIMENT_STATUS,
  CANONICAL_GOVERNANCE_STATUSES,
} from './LaboratoryAgentContract.ts';

// ---------------------------------------------------------------------------
// Experiment Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes experiment provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeExperimentProvenance(params: {
  readonly experimentId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ExperimentProvenance {
  return {
    experimentId: params.experimentId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Scenario Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes scenario provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeScenarioProvenance(params: {
  readonly scenarioId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ScenarioProvenance {
  return {
    scenarioId: params.scenarioId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Dataset Reference Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes dataset reference provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeDatasetReferenceProvenance(params: {
  readonly datasetReferenceId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): DatasetReferenceProvenance {
  return {
    datasetReferenceId: params.datasetReferenceId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Expected Output Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes expected output provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeExpectedOutputProvenance(params: {
  readonly expectedOutputId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): ExpectedOutputProvenance {
  return {
    expectedOutputId: params.expectedOutputId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Evaluation Metadata Provenance Composition
// ---------------------------------------------------------------------------

/**
 * Composes evaluation metadata provenance from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvaluationMetadataProvenance(params: {
  readonly evaluationId: string;
  readonly source: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly rationale: string;
  readonly providedBy: string;
}): EvaluationMetadataProvenance {
  return {
    evaluationId: params.evaluationId,
    source: params.source,
    governanceStatus: params.governanceStatus,
    rationale: params.rationale,
    providedBy: params.providedBy,
  };
}

// ---------------------------------------------------------------------------
// Scenario Composition
// ---------------------------------------------------------------------------

/**
 * Composes an experiment scenario from provided parameters.
 * Pure function. No side effects.
 */
export function composeScenario(params: {
  readonly scenarioId: string;
  readonly scenarioType: ScenarioType;
  readonly description: string;
  readonly configurationReference: string;
  readonly datasetReference: string;
  readonly purpose: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ScenarioProvenance;
}): ExperimentScenario {
  return {
    scenarioId: params.scenarioId,
    scenarioType: params.scenarioType,
    description: params.description,
    configurationReference: params.configurationReference,
    datasetReference: params.datasetReference,
    purpose: params.purpose,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Dataset Reference Composition
// ---------------------------------------------------------------------------

/**
 * Composes a dataset reference from provided parameters.
 * Pure function. No side effects.
 */
export function composeDatasetReference(params: {
  readonly datasetReferenceId: string;
  readonly datasetId: string;
  readonly source: string;
  readonly description: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: DatasetReferenceProvenance;
}): ExperimentDatasetReference {
  return {
    datasetReferenceId: params.datasetReferenceId,
    datasetId: params.datasetId,
    source: params.source,
    description: params.description,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Expected Output Composition
// ---------------------------------------------------------------------------

/**
 * Composes an expected output from provided parameters.
 * Pure function. No side effects.
 */
export function composeExpectedOutput(params: {
  readonly expectedOutputId: string;
  readonly outputType: ExpectedOutputType;
  readonly description: string;
  readonly format: string;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ExpectedOutputProvenance;
}): ExperimentExpectedOutput {
  return {
    expectedOutputId: params.expectedOutputId,
    outputType: params.outputType,
    description: params.description,
    format: params.format,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Evaluation Metadata Composition
// ---------------------------------------------------------------------------

/**
 * Composes evaluation metadata from provided parameters.
 * Pure function. No side effects.
 */
export function composeEvaluationMetadata(params: {
  readonly evaluationId: string;
  readonly evaluationCriteria: readonly string[];
  readonly expectedArtifacts: readonly string[];
  readonly successConditions: readonly string[];
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: EvaluationMetadataProvenance;
}): ExperimentEvaluationMetadata {
  return {
    evaluationId: params.evaluationId,
    evaluationCriteria: [...params.evaluationCriteria],
    expectedArtifacts: [...params.expectedArtifacts],
    successConditions: [...params.successConditions],
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Experiment Composition
// ---------------------------------------------------------------------------

/**
 * Composes a laboratory experiment from provided parameters.
 * Pure function. No side effects.
 */
export function composeExperiment(params: {
  readonly experimentId: string;
  readonly laboratoryId: string;
  readonly experimentType: ExperimentType;
  readonly scenarioId: string;
  readonly configurationId: string;
  readonly executionPolicyId: string;
  readonly datasetReferenceIds: readonly string[];
  readonly expectedOutputIds: readonly string[];
  readonly evaluationMetadataId: string;
  readonly status: ExperimentStatus;
  readonly governanceStatus: LaboratoryGovernanceStatus;
  readonly provenance: ExperimentProvenance;
}): LaboratoryExperiment {
  return {
    experimentId: params.experimentId,
    laboratoryId: params.laboratoryId,
    experimentType: params.experimentType,
    scenarioId: params.scenarioId,
    configurationId: params.configurationId,
    executionPolicyId: params.executionPolicyId,
    datasetReferenceIds: [...params.datasetReferenceIds],
    expectedOutputIds: [...params.expectedOutputIds],
    evaluationMetadataId: params.evaluationMetadataId,
    status: params.status,
    governanceStatus: params.governanceStatus,
    provenance: params.provenance,
  };
}

// ---------------------------------------------------------------------------
// Experiment Decision Composition
// ---------------------------------------------------------------------------

/**
 * Composes an experiment decision from validation results.
 * Pure function. No side effects.
 */
function _composeExperimentDecision(
  experimentId: string,
  validationPassed: boolean,
  validationErrors: readonly string[],
): ExperimentDecision {
  return {
    decisionId: `_decision_exp_${experimentId}`,
    experimentId,
    validationPassed,
    validationErrors,
  };
}

// ---------------------------------------------------------------------------
// Experiment Trace Composition
// ---------------------------------------------------------------------------

/**
 * Composes an experiment trace from decisions and metadata.
 * Pure function. No side effects.
 */
export function composeExperimentTrace(params: {
  readonly traceId: string;
  readonly experimentCount: number;
  readonly scenarioCount: number;
  readonly datasetReferenceCount: number;
  readonly expectedOutputCount: number;
  readonly evaluationMetadataCount: number;
  readonly decisions: readonly ExperimentDecision[];
}): ExperimentTrace {
  return {
    traceId: params.traceId,
    experimentCount: params.experimentCount,
    scenarioCount: params.scenarioCount,
    datasetReferenceCount: params.datasetReferenceCount,
    expectedOutputCount: params.expectedOutputCount,
    evaluationMetadataCount: params.evaluationMetadataCount,
    validatedCount: params.decisions.filter((d) => d.validationPassed).length,
    invalidCount: params.decisions.filter((d) => !d.validationPassed).length,
    decisions: params.decisions,
    deterministic: true,
    generatedFrom: 'deterministic_experiment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Sort Comparator
// ---------------------------------------------------------------------------

/**
 * Deterministic comparator for experiments.
 * Sorts by experimentId, then scenarioId, then configurationId,
 * then datasetReferenceId, then expectedOutputId.
 * Pure function. No side effects.
 */
function _compareExperiment(
  a: LaboratoryExperiment,
  b: LaboratoryExperiment,
): number {
  if (a.experimentId < b.experimentId) return -1;
  if (a.experimentId > b.experimentId) return 1;

  if ((a.scenarioId ?? '') < (b.scenarioId ?? '')) return -1;
  if ((a.scenarioId ?? '') > (b.scenarioId ?? '')) return 1;

  if ((a.configurationId ?? '') < (b.configurationId ?? '')) return -1;
  if ((a.configurationId ?? '') > (b.configurationId ?? '')) return 1;

  const aDatasetRef = (a.datasetReferenceIds ?? [])[0] ?? '';
  const bDatasetRef = (b.datasetReferenceIds ?? [])[0] ?? '';
  if (aDatasetRef < bDatasetRef) return -1;
  if (aDatasetRef > bDatasetRef) return 1;

  const aOutputRef = (a.expectedOutputIds ?? [])[0] ?? '';
  const bOutputRef = (b.expectedOutputIds ?? [])[0] ?? '';
  if (aOutputRef < bOutputRef) return -1;
  if (aOutputRef > bOutputRef) return 1;

  return 0;
}

// ---------------------------------------------------------------------------
// Experiment Registry Composition
// ---------------------------------------------------------------------------

/**
 * Composes an experiment registry from all experiment components.
 * Pure function. No side effects.
 * Deterministic ordering: experimentId → scenarioId → configurationId
 *   → datasetReferenceId → expectedOutputId.
 */
export function composeExperimentRegistry(
  experiments: readonly LaboratoryExperiment[],
  scenarios: readonly ExperimentScenario[],
  datasetReferences: readonly ExperimentDatasetReference[],
  expectedOutputs: readonly ExperimentExpectedOutput[],
  evaluationMetadata: readonly ExperimentEvaluationMetadata[],
): ExperimentRegistry {
  const sortedExperiments = [...experiments].sort(_compareExperiment);

  return {
    registryId: `_exp_registry_${sortedExperiments.length}`,
    experiments: sortedExperiments,
    scenarios: [...scenarios],
    datasetReferences: [...datasetReferences],
    expectedOutputs: [...expectedOutputs],
    evaluationMetadata: [...evaluationMetadata],
    experimentCount: sortedExperiments.length,
    scenarioCount: scenarios.length,
    datasetReferenceCount: datasetReferences.length,
    expectedOutputCount: expectedOutputs.length,
    evaluationMetadataCount: evaluationMetadata.length,
    deterministic: true,
    generatedFrom: 'deterministic_experiment_kernel',
    randomUsed: false,
    timeDependency: false,
  };
}

// ---------------------------------------------------------------------------
// Laboratory Experiments Composition (Main Entry Point)
// ---------------------------------------------------------------------------

/**
 * Composes a complete laboratory experiment artifact from an input.
 * Pure function. No side effects.
 */
export function composeLaboratoryExperiments(
  input: ExperimentInput,
): LaboratoryArtifactWithExperiments {
  const decisions = input.experiments.map((exp) => {
    const errors = _validateExperimentForDecision(exp);
    return _composeExperimentDecision(exp.experimentId, errors.length === 0, errors);
  });

  const trace = composeExperimentTrace({
    traceId: `_trace_exp_${input.experiments.length}`,
    experimentCount: input.experiments.length,
    scenarioCount: input.scenarios.length,
    datasetReferenceCount: input.datasetReferences.length,
    expectedOutputCount: input.expectedOutputs.length,
    evaluationMetadataCount: input.evaluationMetadata.length,
    decisions,
  });

  const registry = composeExperimentRegistry(
    input.experiments,
    input.scenarios,
    input.datasetReferences,
    input.expectedOutputs,
    input.evaluationMetadata,
  );

  return {
    artifactId: `_artifact_exp_${input.experiments.length}`,
    registry,
    trace,
  };
}

/**
 * Validates an experiment for decision composition.
 * Pure function. No side effects.
 */
function _validateExperimentForDecision(
  exp: LaboratoryExperiment,
): readonly string[] {
  const errors: string[] = [];

  if (!exp.experimentId || exp.experimentId.trim() === '') {
    errors.push('EXPERIMENT_MISSING_EXPERIMENT_ID');
  }

  if (!exp.laboratoryId || exp.laboratoryId.trim() === '') {
    errors.push('EXPERIMENT_MISSING_LABORATORY_ID');
  }

  if (!exp.experimentType || !exp.experimentType || !CANONICAL_EXPERIMENT_TYPES.includes(exp.experimentType)) {
    errors.push('EXPERIMENT_UNKNOWN_TYPE');
  }

  if (!exp.status || !exp.status || !CANONICAL_EXPERIMENT_STATUS.includes(exp.status)) {
    errors.push('EXPERIMENT_UNKNOWN_STATUS');
  }

  if (!exp.governanceStatus || !exp.governanceStatus || !CANONICAL_GOVERNANCE_STATUSES.includes(exp.governanceStatus)) {
    errors.push('EXPERIMENT_INVALID_GOVERNANCE');
  }

  if (!exp.provenance) {
    errors.push('EXPERIMENT_MISSING_PROVENANCE');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helper Functions — Type Guards
// ---------------------------------------------------------------------------

/**
 * Checks if a string is a supported experiment type.
 */
export function isSupportedExperimentType(
  experimentType: string,
): experimentType is ExperimentType {
  return CANONICAL_EXPERIMENT_TYPES.includes(experimentType as ExperimentType);
}

/**
 * Checks if a string is a supported scenario type.
 */
export function isSupportedScenarioType(
  scenarioType: string,
): scenarioType is ScenarioType {
  return CANONICAL_SCENARIO_TYPES.includes(scenarioType as ScenarioType);
}

/**
 * Checks if a string is a supported expected output type.
 */
export function isSupportedExpectedOutputType(
  outputType: string,
): outputType is ExpectedOutputType {
  return CANONICAL_EXPECTED_OUTPUT_TYPES.includes(outputType as ExpectedOutputType);
}

/**
 * Checks if a string is a supported experiment status.
 */
export function isSupportedExperimentStatus(
  status: string,
): status is ExperimentStatus {
  return CANONICAL_EXPERIMENT_STATUS.includes(status as ExperimentStatus);
}

/**
 * Checks if a string is a supported governance status.
 */
export function isSupportedExperimentGovernanceStatus(
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
 * Returns the canonical experiment types.
 */
export function getCanonicalExperimentTypes(): readonly ExperimentType[] {
  return CANONICAL_EXPERIMENT_TYPES;
}

/**
 * Returns the canonical scenario types.
 */
export function getCanonicalScenarioTypes(): readonly ScenarioType[] {
  return CANONICAL_SCENARIO_TYPES;
}

/**
 * Returns the canonical expected output types.
 */
export function getCanonicalExpectedOutputTypes(): readonly ExpectedOutputType[] {
  return CANONICAL_EXPECTED_OUTPUT_TYPES;
}

/**
 * Returns the canonical experiment statuses.
 */
export function getCanonicalExperimentStatuses(): readonly ExperimentStatus[] {
  return CANONICAL_EXPERIMENT_STATUS;
}
