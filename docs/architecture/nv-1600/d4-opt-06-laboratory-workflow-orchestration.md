# D4-OPT-06 — Laboratory Workflow Orchestration

## Purpose

Implements the canonical Laboratory Workflow Orchestration layer described by the Laboratory Agent architecture. This phase introduces deterministic workflow composition for laboratory experiences. It models how laboratory artifacts are organized into reproducible workflows, while explicitly forbidding runtime execution, scheduling, orchestration engines, pipelines, or executable DAGs.

This is a **metadata-only orchestration layer**.

---

## Architecture

The implementation must follow exactly the architectural patterns established by D4-OPT-01 through D4-OPT-05.

No architectural redesign is allowed.

Must remain:

- deterministic
- immutable
- declarative
- metadata-only
- pure functional
- side-effect free

Must NOT introduce:

- execution
- callbacks
- async
- promises
- timers
- schedulers
- DAG execution
- workflow engines
- orchestration runtime
- background jobs
- event systems
- queues
- state machines
- interpreters
- execution graphs

---

## Workflow Philosophy

A workflow represents only metadata describing how laboratory artifacts are connected.

It never embeds execution logic.

It never executes workflows.

It models workflows only.

---

## Workflow Model

A workflow contains:

- `workflowId` — Unique identifier
- `workflowType` — The type of workflow
- `name` — Name of the workflow
- `description` — Description of the workflow
- `laboratoryId` — The laboratory this workflow belongs to
- `steps` — Ordered list of workflow steps
- `status` — The workflow status
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

It may reference:

- laboratory
- configuration
- execution policy
- experiment
- result artifact
- visualization
- dataset reference
- expected output

---

## Workflow Step Model

A workflow step contains:

- `stepId` — Unique identifier
- `stepType` — The type of step
- `stepOrder` — The order of the step
- `title` — Title of the step
- `description` — Description of the step
- `experimentId` — Reference to an experiment
- `configurationId` — Reference to a configuration
- `executionPolicyId` — Reference to an execution policy
- `resultArtifactId` — Reference to a result artifact
- `visualizationId` — Reference to a visualization
- `governanceStatus` — The governance status

Each step references metadata only.

No executable objects.

---

## Canonical Workflow Types (10)

```text
single_experiment
multi_experiment
comparison
parameter_sweep
educational_sequence
guided_walkthrough
research_validation
visualization_pipeline
capstone_workflow
custom
```

---

## Canonical Workflow Step Types (10)

```text
prepare
configure
execute_metadata
observe
compare
visualize
record
evaluate
review
complete
```

---

## Workflow Status (6)

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

- Never execution state.
- Never runtime state.
- Never learner progress.
- Never results.

Sorting must be deterministic:

```text
workflowId
↓
workflowType
↓
stepOrder
↓
stepId
```

Always identical.

---

## Provenance

Every workflow requires:

- `workflowId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Missing provenance fails validation.

---

## Validation Layer

### Functions

- `validateWorkflow()` — Validates a single workflow
- `validateWorkflowStep()` — Validates a workflow step
- `validateWorkflowRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithWorkflows()` — Validates a complete artifact
- `validateWorkflowInput()` — Validates input data

### Validation Codes

```text
WORKFLOW_UNKNOWN_TYPE
WORKFLOW_UNKNOWN_STATUS
STEP_UNKNOWN_TYPE
WORKFLOW_DUPLICATE_ID
WORKFLOW_DUPLICATE_NAME
STEP_DUPLICATE_ID
WORKFLOW_MISSING_WORKFLOW_ID
WORKFLOW_MISSING_NAME
WORKFLOW_MISSING_LABORATORY_ID
WORKFLOW_MISSING_STEPS
WORKFLOW_INVALID_GOVERNANCE
WORKFLOW_MISSING_PROVENANCE
WORKFLOW_INVALID_REFERENCE
STEP_MISSING_ID
STEP_MISSING_TITLE
STEP_INVALID_GOVERNANCE
STEP_INVALID_ORDER
MISSING_PROVENANCE
MISSING_SOURCE
MISSING_RATIONALE
MISSING_PROVIDED_BY
EMPTY_REGISTRY
TRACE_NOT_DETERMINISTIC
TRACE_RANDOM_USED
TRACE_TIME_DEPENDENCY
TRACE_LABORATORY_MUTATED
REGISTRY_DUPLICATE_WORKFLOW_ID
REGISTRY_DUPLICATE_WORKFLOW_NAME
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

## Relationships with D4-OPT-01 through D4-OPT-05

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-06 extends these contracts with workflow types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-06's workflows reference execution policies.
- **D4-OPT-03** — Laboratory Parameter Space & Configuration Orchestration: Provides parameter spaces, constraints, groups, and configurations. D4-OPT-06's workflows reference configurations.
- **D4-OPT-04** — Simulation Scenario Composition & Experiment Modeling: Provides experiment metadata, scenarios, dataset references, expected outputs, and evaluation metadata. D4-OPT-06's workflows reference experiments.
- **D4-OPT-05** — Visualization, Observation & Result Artifact Modeling: Provides visualization, observation, metric, and result artifact metadata. D4-OPT-06's workflows reference result artifacts and visualizations.

---

## Explicit Boundaries

### In Scope

- Workflow metadata representation
- Workflow step metadata
- Workflow registry organization
- Workflow provenance tracking
- Deterministic validation
- Deterministic composition
- Public type definitions

### Out of Scope

- Workflow execution
- Runtime scheduling
- Orchestration engines
- Pipeline execution
- Background jobs
- Event systems
- Queues
- State machines
- Interpreters
- Execution graphs

---

## Forbidden Responsibilities

This phase MUST NOT:

- Execute workflows
- Schedule workflows
- Run pipeline execution
- Use workflow engines
- Use orchestration runtime
- Use background jobs
- Use event systems
- Use queues
- Use state machines
- Use interpreters
- Use execution graphs
- Use DAG execution
- Use callbacks
- Use async
- Use promises
- Use timers

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

Orchestration consumes metadata.

Neither execution nor orchestration exists in this phase.

---

## Public API

### Kernel Functions

- `composeWorkflowProvenance()` — Composes workflow provenance
- `composeWorkflowStep()` — Composes a workflow step
- `composeWorkflow()` — Composes a workflow
- `composeWorkflowTrace()` — Composes a trace
- `composeWorkflowRegistry()` — Composes a registry
- `composeLaboratoryWorkflows()` — Main entry point

### Helper Functions

- `isSupportedWorkflowType()` — Type guard for workflow types
- `isSupportedWorkflowStepType()` — Type guard for workflow step types
- `isSupportedWorkflowStatus()` — Type guard for workflow statuses
- `isSupportedWorkflowGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalWorkflowTypes()` — Returns canonical workflow types
- `getCanonicalWorkflowStepTypes()` — Returns canonical workflow step types
- `getCanonicalWorkflowStatuses()` — Returns canonical workflow statuses
