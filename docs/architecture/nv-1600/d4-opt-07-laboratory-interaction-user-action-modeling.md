# D4-OPT-07 — Laboratory Interaction & User Action Modeling

## Purpose

Implements the canonical Laboratory Interaction & User Action Modeling layer defined by the Laboratory Agent architecture. This phase introduces the deterministic metadata model describing how a learner may interact with a laboratory experience, while remaining strictly outside runtime execution.

This phase models interaction opportunities only.

It must **never execute actions**, mutate state, evaluate user behavior, or store learner progress.

---

## Architecture

Interactions are modeled.

Interactions are not executed.

User actions are represented as canonical metadata.

The Laboratory Agent never becomes a runtime engine.

Must remain:

- deterministic
- immutable
- declarative
- metadata-only
- pure functional
- side-effect free

Must NOT introduce:

- runtime interaction
- click handling
- UI events
- callbacks
- listeners
- event emitters
- runtime state
- execution history
- learner progress
- telemetry
- analytics
- session state
- browser APIs
- persistence
- synchronization
- prediction engines
- adaptive behavior

---

## Interaction Philosophy

An interaction represents metadata describing a possible learner interaction.

It never stores:

- user values
- runtime state
- learner responses
- interaction history

It models interactions only.

---

## Interaction Model

An interaction contains:

- `interactionId` — Unique identifier
- `interactionType` — The type of interaction
- `name` — Name of the interaction
- `description` — Description of the interaction
- `workflowId` — Reference to a workflow
- `workflowStepId` — Reference to a workflow step
- `experimentId` — Reference to an experiment
- `configurationId` — Reference to a configuration
- `parameterId` — Reference to a parameter
- `resultArtifactId` — Reference to a result artifact
- `visualizationId` — Reference to a visualization
- `datasetReferenceId` — Reference to a dataset
- `actions` — List of user actions
- `status` — The interaction status
- `governanceStatus` — The governance status
- `provenance` — Provenance metadata

---

## User Action Model

A user action contains:

- `actionId` — Unique identifier
- `actionType` — The type of action
- `title` — Title of the action
- `description` — Description of the action
- `targetId` — The target of the action
- `targetType` — The type of target
- `interactionId` — The interaction this action belongs to
- `governanceStatus` — The governance status

It never stores:

- user values
- runtime state
- learner responses
- interaction history

---

## Canonical Interaction Types (10)

```text
parameter_adjustment
prediction_submission
observation_note
comparison_selection
visualization_focus
step_navigation
dataset_selection
experiment_selection
result_inspection
completion_marker
```

---

## Canonical User Action Types (10)

```text
select
modify
inspect
compare
annotate
navigate
confirm
reset
review
complete
```

---

## Interaction Status (6)

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

- Never runtime interaction history.
- Never learner state.
- Never execution logs.
- Never browser events.

Sorting must be deterministic:

```text
interactionId
↓
interactionType
↓
actionType
↓
targetId
```

Always identical.

---

## Provenance

Every interaction requires:

- `interactionId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Missing provenance fails validation.

---

## Validation Layer

### Functions

- `validateInteraction()` — Validates a single interaction
- `validateUserAction()` — Validates a user action
- `validateInteractionRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithInteractions()` — Validates a complete artifact
- `validateInteractionInput()` — Validates input data

### Validation Codes

```text
INTERACTION_UNKNOWN_TYPE
INTERACTION_UNKNOWN_STATUS
ACTION_UNKNOWN_TYPE
INTERACTION_DUPLICATE_ID
INTERACTION_DUPLICATE_NAME
ACTION_DUPLICATE_ID
INTERACTION_MISSING_INTERACTION_ID
INTERACTION_MISSING_NAME
INTERACTION_MISSING_STEPS
INTERACTION_INVALID_GOVERNANCE
INTERACTION_MISSING_PROVENANCE
INTERACTION_INVALID_REFERENCE
ACTION_MISSING_ID
ACTION_MISSING_TITLE
ACTION_INVALID_GOVERNANCE
ACTION_INVALID_REFERENCE
MISSING_PROVENANCE
MISSING_SOURCE
MISSING_RATIONALE
MISSING_PROVIDED_BY
EMPTY_REGISTRY
TRACE_NOT_DETERMINISTIC
TRACE_RANDOM_USED
TRACE_TIME_DEPENDENCY
TRACE_LABORATORY_MUTATED
REGISTRY_DUPLICATE_INTERACTION_ID
REGISTRY_DUPLICATE_INTERACTION_NAME
REGISTRY_DUPLICATE_ACTION_ID
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

## Relationships with D4-OPT-01 through D4-OPT-06

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-07 extends these contracts with interaction types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-07's interactions reference execution policies indirectly through workflows.
- **D4-OPT-03** — Laboratory Parameter Space & Configuration Orchestration: Provides parameter spaces, constraints, groups, and configurations. D4-OPT-07's interactions reference parameters and configurations.
- **D4-OPT-04** — Simulation Scenario Composition & Experiment Modeling: Provides experiment metadata, scenarios, dataset references, expected outputs, and evaluation metadata. D4-OPT-07's interactions reference experiments.
- **D4-OPT-05** — Visualization, Observation & Result Artifact Modeling: Provides visualization, observation, metric, and result artifact metadata. D4-OPT-07's interactions reference visualizations and result artifacts.
- **D4-OPT-06** — Laboratory Workflow Orchestration: Provides workflow metadata, workflow steps, and workflow registries. D4-OPT-07's interactions reference workflows and workflow steps.

---

## Explicit Boundaries

### In Scope

- Interaction metadata representation
- User action metadata
- Interaction registry organization
- Interaction provenance tracking
- Deterministic validation
- Deterministic composition
- Public type definitions

### Out of Scope

- Runtime interaction
- Click handling
- UI events
- Callbacks
- Listeners
- Event emitters
- Runtime state
- Execution history
- Learner progress
- Telemetry
- Analytics
- Session state
- Browser APIs
- Persistence
- Synchronization
- Prediction engines
- Adaptive behavior

---

## Forbidden Responsibilities

This phase MUST NOT:

- Execute interactions
- Handle click events
- Use UI events
- Use callbacks
- Use listeners
- Use event emitters
- Store runtime state
- Store execution history
- Store learner progress
- Use telemetry
- Use analytics
- Use session state
- Use browser APIs
- Use persistence
- Use synchronization
- Use prediction engines
- Use adaptive behavior

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

Interaction consumes metadata.

Neither execution nor interaction exists in this phase.

---

## Public API

### Kernel Functions

- `composeInteractionProvenance()` — Composes interaction provenance
- `composeUserAction()` — Composes a user action
- `composeInteraction()` — Composes an interaction
- `composeInteractionTrace()` — Composes a trace
- `composeInteractionRegistry()` — Composes a registry
- `composeLaboratoryInteractions()` — Main entry point

### Helper Functions

- `isSupportedInteractionType()` — Type guard for interaction types
- `isSupportedUserActionType()` — Type guard for user action types
- `isSupportedInteractionStatus()` — Type guard for interaction statuses
- `isSupportedInteractionGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalInteractionTypes()` — Returns canonical interaction types
- `getCanonicalUserActionTypes()` — Returns canonical user action types
- `getCanonicalInteractionStatuses()` — Returns canonical interaction statuses
