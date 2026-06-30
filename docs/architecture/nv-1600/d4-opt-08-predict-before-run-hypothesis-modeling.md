# D4-OPT-08 — Predict-Before-Run & Hypothesis Modeling

## Purpose

Implements the canonical Predict-Before-Run & Hypothesis Modeling layer defined by the Laboratory Agent architecture. This phase introduces deterministic metadata describing hypotheses, predictions, and expected observations that may be associated with a laboratory experience before execution.

This layer is **pure metadata**.

It must **never** store learner answers, execute experiments, evaluate correctness, infer mastery, or generate hypotheses automatically.

---

## Architecture

The Laboratory Agent models prediction opportunities.

It never stores predictions.

It never evaluates predictions.

It never grades hypotheses.

It never infers learner understanding.

Must remain:

- deterministic
- immutable
- declarative
- metadata-only
- pure functional
- side-effect free

Must NOT introduce:

- learner responses
- prediction storage
- correctness evaluation
- grading
- scoring
- adaptive behavior
- recommendation systems
- execution
- runtime hypothesis generation
- AI-generated predictions
- LLM integration
- analytics
- telemetry
- session state
- persistence

---

## Predict-Before-Run Philosophy

A hypothesis represents a possible expectation presented before an experiment.

It describes:

- hypothesis category
- associated experiment
- associated workflow
- associated parameter
- associated visualization
- associated observation target

It is **never** a learner response.

---

## Hypothesis Model

A hypothesis contains:

- `hypothesisId` — Unique identifier
- `hypothesisType` — The type of hypothesis
- `name` — Name of the hypothesis
- `description` — Description of the hypothesis
- `experimentId` — Reference to an experiment
- `workflowId` — Reference to a workflow
- `parameterId` — Reference to a parameter
- `visualizationId` — Reference to a visualization
- `observationTargetId` — Reference to an observation target
- `prompts` — List of prediction prompts
- `status` — The hypothesis status
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

---

## Prediction Prompt Model

A prediction prompt contains:

- `promptId` — Unique identifier
- `promptType` — The type of prompt
- `title` — Title of the prompt
- `description` — Description of the prompt
- `hypothesisId` — The hypothesis this prompt belongs to
- `observationTargetId` — The observation target
- `reasoningCategory` — The reasoning category
- `governanceStatus` — The governance status

It never stores:

- learner answer
- correctness
- confidence
- timestamps
- attempts

---

## Observation Target Model

Observation targets identify what the learner should observe after execution.

They reference only:

- `experimentId`
- `workflowId`
- `resultArtifactId`
- `visualizationId`
- `metricId`
- `parameterId`

Metadata only.

---

## Canonical Hypothesis Types (10)

```text
expected_behavior
expected_visual_pattern
expected_metric
algorithm_prediction
parameter_effect
dataset_prediction
performance_prediction
comparison_prediction
failure_prediction
custom
```

---

## Canonical Prediction Prompt Types (10)

```text
multiple_choice
ranking
ordering
selection
free_observation
visual_prediction
parameter_prediction
comparison_prediction
metric_prediction
reflection
```

---

## Canonical Observation Targets (10)

```text
visualization
metric
algorithm
dataset
parameter
workflow
experiment
comparison
result_artifact
custom
```

---

## Hypothesis Status (6)

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

Registry stores metadata only.

Never stores:

- predictions
- learner input
- scores
- evaluations
- attempts
- runtime state

Sorting must be deterministic:

```text
hypothesisId
↓
hypothesisType
↓
predictionPromptType
↓
observationTarget
```

Always identical.

---

## Provenance

Every hypothesis requires:

- `hypothesisId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Missing provenance fails validation.

---

## Validation Layer

### Functions

- `validateHypothesis()` — Validates a single hypothesis
- `validatePredictionPrompt()` — Validates a prediction prompt
- `validateHypothesisRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithHypotheses()` — Validates a complete artifact
- `validateHypothesisInput()` — Validates input data

### Validation Codes

```text
HYPOTHESIS_UNKNOWN_TYPE
HYPOTHESIS_UNKNOWN_STATUS
PROMPT_UNKNOWN_TYPE
OBSERVATION_TARGET_UNKNOWN
HYPOTHESIS_DUPLICATE_ID
HYPOTHESIS_DUPLICATE_NAME
PROMPT_DUPLICATE_ID
HYPOTHESIS_MISSING_HYPOTHESIS_ID
HYPOTHESIS_MISSING_NAME
HYPOTHESIS_MISSING_PROMPTS
HYPOTHESIS_INVALID_GOVERNANCE
HYPOTHESIS_MISSING_PROVENANCE
HYPOTHESIS_INVALID_REFERENCE
PROMPT_MISSING_ID
PROMPT_MISSING_TITLE
PROMPT_INVALID_GOVERNANCE
PROMPT_INVALID_REFERENCE
MISSING_PROVENANCE
MISSING_SOURCE
MISSING_RATIONALE
MISSING_PROVIDED_BY
EMPTY_REGISTRY
TRACE_NOT_DETERMINISTIC
TRACE_RANDOM_USED
TRACE_TIME_DEPENDENCY
TRACE_LABORATORY_MUTATED
REGISTRY_DUPLICATE_HYPOTHESIS_ID
REGISTRY_DUPLICATE_HYPOTHESIS_NAME
REGISTRY_DUPLICATE_PROMPT_ID
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

## Relationships with D4-OPT-01 through D4-OPT-07

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-08 extends these contracts with hypothesis types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-08's hypotheses reference experiments that use execution policies.
- **D4-OPT-03** — Laboratory Parameter Space & Configuration Orchestration: Provides parameter spaces, constraints, groups, and configurations. D4-OPT-08's hypotheses reference parameters.
- **D4-OPT-04** — Simulation Scenario Composition & Experiment Modeling: Provides experiment metadata, scenarios, dataset references, expected outputs, and evaluation metadata. D4-OPT-08's hypotheses reference experiments.
- **D4-OPT-05** — Visualization, Observation & Result Artifact Modeling: Provides visualization, observation, metric, and result artifact metadata. D4-OPT-08's hypotheses reference visualizations.
- **D4-OPT-06** — Laboratory Workflow Orchestration: Provides workflow metadata, workflow steps, and workflow registries. D4-OPT-08's hypotheses reference workflows.
- **D4-OPT-07** — Laboratory Interaction & User Action Modeling: Provides interaction metadata and user action metadata. D4-OPT-08's hypotheses are associated with interactions.

---

## Explicit Boundaries

### In Scope

- Hypothesis metadata representation
- Prediction prompt metadata
- Observation target metadata
- Hypothesis registry organization
- Hypothesis provenance tracking
- Deterministic validation
- Deterministic composition
- Public type definitions

### Out of Scope

- Learner responses
- Prediction storage
- Correctness evaluation
- Grading
- Scoring
- Adaptive behavior
- Recommendation systems
- Execution
- Runtime hypothesis generation
- AI-generated predictions
- LLM integration
- Analytics
- Telemetry
- Session state
- Persistence

---

## Forbidden Responsibilities

This phase MUST NOT:

- Store learner answers
- Execute experiments
- Evaluate correctness
- Infer mastery
- Generate hypotheses automatically
- Use AI-generated predictions
- Use LLM integration
- Use analytics
- Use telemetry
- Use session state
- Use persistence
- Use adaptive behavior
- Use recommendation systems

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

Prediction consumes metadata.

Neither execution nor prediction exists in this phase.

---

## Public API

### Kernel Functions

- `composeHypothesisProvenance()` — Composes hypothesis provenance
- `composePredictionPrompt()` — Composes a prediction prompt
- `composeHypothesis()` — Composes a hypothesis
- `composeHypothesisTrace()` — Composes a trace
- `composeHypothesisRegistry()` — Composes a registry
- `composeLaboratoryHypotheses()` — Main entry point

### Helper Functions

- `isSupportedHypothesisType()` — Type guard for hypothesis types
- `isSupportedPredictionPromptType()` — Type guard for prediction prompt types
- `isSupportedObservationTarget()` — Type guard for observation targets
- `isSupportedHypothesisStatus()` — Type guard for hypothesis statuses
- `isSupportedHypothesisGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalHypothesisTypes()` — Returns canonical hypothesis types
- `getCanonicalPredictionPromptTypes()` — Returns canonical prediction prompt types
- `getCanonicalObservationTargets()` — Returns canonical observation targets
- `getCanonicalHypothesisStatuses()` — Returns canonical hypothesis statuses
