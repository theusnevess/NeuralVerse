# D4-OPT-04 — Simulation Scenario Composition & Experiment Modeling

## Purpose

Implements the canonical Simulation Scenario Composition & Experiment Modeling layer defined by the Laboratory Agent. This phase introduces the canonical representation of an experiment. It models experiment metadata, experiment scenarios, dataset references, execution references, configuration references, expected outputs, and evaluation metadata.

This phase **must never execute** a simulation.

It **must never produce results**.

It **must never evaluate outcomes**.

Everything is structural metadata only.

---

## Architecture

An Experiment is a deterministic composition of laboratory metadata.

It is not an execution.

It is not a simulation.

It is not a result.

---

## Experiment Model

Every experiment contains only metadata:

- `experimentId` — Unique identifier
- `laboratoryId` — The laboratory this experiment belongs to
- `experimentType` — The type of experiment
- `scenarioId` — The scenario this experiment uses
- `configurationId` — The configuration this experiment uses
- `executionPolicyId` — The execution policy for this experiment
- `datasetReferenceIds` — List of dataset reference IDs
- `expectedOutputIds` — List of expected output IDs
- `evaluationMetadataId` — The evaluation metadata for this experiment
- `status` — The experiment status
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

Never embed executable logic.

---

## Experiment Types (10)

```text
algorithm_validation
parameter_exploration
visualization
simulation
comparison
dataset_analysis
mathematical_model
computer_vision
machine_learning
capstone
```

---

## Scenario Model

Scenario metadata only:

- `scenarioId` — Unique identifier
- `scenarioType` — The type of scenario
- `description` — Description of the scenario
- `configurationReference` — Reference to a configuration
- `datasetReference` — Reference to a dataset
- `purpose` — Purpose of the scenario
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

No execution callbacks.

---

## Scenario Types (10)

```text
baseline
reference
controlled
comparative
ablation
stress
edge_case
exploratory
educational
custom
```

---

## Dataset Reference Model

References only:

- `datasetReferenceId` — Unique identifier
- `datasetId` — The dataset being referenced
- `source` — Source of the dataset
- `description` — Description of the dataset
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

Never load datasets.

Never inspect datasets.

---

## Expected Output Model

Metadata describing expected artifacts:

- `expectedOutputId` — Unique identifier
- `outputType` — The type of expected output
- `description` — Description of the output
- `format` — Format of the output
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

Never generate outputs.

---

## Expected Output Types (10)

```text
visualization
metric
comparison
observation
artifact
dataset
graph
table
report
none
```

---

## Evaluation Metadata Model

Metadata only:

- `evaluationId` — Unique identifier
- `evaluationCriteria` — List of evaluation criteria
- `expectedArtifacts` — List of expected artifacts
- `successConditions` — List of success conditions
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

Never compute evaluation.

---

## Experiment Status (6)

```text
draft
review
approved
published
deprecated
archived
```

---

## Registry

Registry stores:

- `experiments` — List of experiments
- `scenarios` — List of scenarios
- `datasetReferences` — List of dataset references
- `expectedOutputs` — List of expected outputs
- `evaluationMetadata` — List of evaluation metadata
- `trace` — Deterministic trace
- `provenance` — Provenance metadata

No runtime state.

---

## Provenance

Every experiment requires:

- `experimentId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Every scenario requires provenance.

Every dataset reference requires provenance.

Every expected output requires provenance.

Every evaluation metadata object requires provenance.

---

## Validation Layer

### Functions

- `validateExperiment()` — Validates a single experiment
- `validateScenario()` — Validates a scenario
- `validateDatasetReference()` — Validates a dataset reference
- `validateExpectedOutput()` — Validates an expected output
- `validateEvaluationMetadata()` — Validates evaluation metadata
- `validateExperimentRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithExperiments()` — Validates a complete artifact
- `validateExperimentInput()` — Validates input data

### Validation Codes

```text
EXPERIMENT_UNKNOWN_TYPE
EXPERIMENT_UNKNOWN_STATUS
SCENARIO_UNKNOWN_TYPE
OUTPUT_UNKNOWN_TYPE
EXPERIMENT_DUPLICATE_ID
SCENARIO_DUPLICATE_ID
DATASET_REFERENCE_DUPLICATE_ID
OUTPUT_DUPLICATE_ID
INVALID_CONFIGURATION_REFERENCE
INVALID_EXECUTION_REFERENCE
INVALID_DATASET_REFERENCE
INVALID_OUTPUT_REFERENCE
INVALID_EVALUATION_REFERENCE
MISSING_PROVENANCE
MISSING_SOURCE
MISSING_RATIONALE
MISSING_PROVIDED_BY
EMPTY_REGISTRY
TRACE_NOT_DETERMINISTIC
TRACE_RANDOM_USED
TRACE_TIME_DEPENDENCY
TRACE_LABORATORY_MUTATED
```

Validation returns structured errors. Never throws exceptions.

---

## Deterministic Guarantees

The implementation never uses:

```text
Math.random
Date.now
performance.now
new Date()
crypto.randomUUID()
uuid
```

No runtime clocks. No randomness.

---

## Deterministic Ordering

Registry ordering:

```text
experimentId
↓
scenarioId
↓
configurationId
↓
datasetReferenceId
↓
expectedOutputId
```

Always identical.

---

## Relationships with D4-OPT-01 through D4-OPT-03

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-04 extends these contracts with experiment and scenario types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-04's experiments reference execution policies.
- **D4-OPT-03** — Laboratory Parameter Space & Configuration Orchestration: Provides parameter spaces, constraints, groups, and configurations. D4-OPT-04's experiments reference configurations.

---

## Public API

### Kernel Functions

- `composeExperimentProvenance()` — Composes experiment provenance
- `composeScenarioProvenance()` — Composes scenario provenance
- `composeDatasetReferenceProvenance()` — Composes dataset reference provenance
- `composeExpectedOutputProvenance()` — Composes expected output provenance
- `composeEvaluationMetadataProvenance()` — Composes evaluation metadata provenance
- `composeScenario()` — Composes a scenario
- `composeDatasetReference()` — Composes a dataset reference
- `composeExpectedOutput()` — Composes an expected output
- `composeEvaluationMetadata()` — Composes evaluation metadata
- `composeExperiment()` — Composes an experiment
- `composeExperimentTrace()` — Composes a trace
- `composeExperimentRegistry()` — Composes a registry
- `composeLaboratoryExperiments()` — Main entry point

### Helper Functions

- `isSupportedExperimentType()` — Type guard for experiment types
- `isSupportedScenarioType()` — Type guard for scenario types
- `isSupportedExpectedOutputType()` — Type guard for expected output types
- `isSupportedExperimentStatus()` — Type guard for experiment statuses
- `isSupportedExperimentGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalExperimentTypes()` — Returns canonical experiment types
- `getCanonicalScenarioTypes()` — Returns canonical scenario types
- `getCanonicalExpectedOutputTypes()` — Returns canonical expected output types
- `getCanonicalExperimentStatuses()` — Returns canonical experiment statuses

---

## Out-of-Scope

This phase MUST NOT:

- Execute simulations
- Execute experiments
- Generate reports
- Calculate metrics
- Compare outputs
- Evaluate results
- Load datasets
- Execute algorithms
- Invoke execution environments
- Optimize parameters
- Infer outcomes
- Rewrite experiments
- Generate code
- Access runtime
- Mutate registries

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

Simulation consumes metadata.

Neither execution nor simulation exists in this phase.
