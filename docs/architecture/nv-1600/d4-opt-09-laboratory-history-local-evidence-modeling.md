# D4-OPT-09 — Laboratory History & Local Evidence Modeling

## Purpose

Implements the canonical architecture responsible for describing Laboratory History, Evidence Timeline, Observation Evolution, Hypothesis Evolution, Local Evidence Registry, Evidence Relationships, and Experiment Session Metadata.

This phase **does NOT execute laboratories**.

It **does NOT record learner history**.

It **does NOT perform analytics**.

It **does NOT store runtime results**.

It models only the canonical metadata describing how evidence produced inside laboratory activities can be organized deterministically.

---

## Architecture

The Laboratory Agent models:

- what laboratory evidence may exist

NOT

- what actually happened during execution.

Everything produced here is structural metadata.

Never runtime state.

---

## History Model

A history record represents only metadata.

Example:

- Experiment X
- Observation metadata
- Metric metadata
- Visualization metadata
- Result Artifact metadata

Never actual runtime values.

---

## Evidence Model

Evidence records may reference:

- experiment
- workflow
- configuration
- visualization
- metric
- observation
- hypothesis
- artifact

Only identifiers.

Never runtime payload.

---

## Relationship Model

Relationships describe structural links.

Examples:

- Metric `derived_from` Observation
- Visualization `supports` Hypothesis

Never infer new relationships.

Only compose supplied metadata.

---

## Canonical History Types (10)

```text
experiment_history
observation_history
hypothesis_history
workflow_history
configuration_history
comparison_history
artifact_history
evaluation_history
annotation_history
session_history
```

---

## Canonical Evidence Types (10)

```text
observation
measurement
metric
visualization
annotation
comparison
prediction
hypothesis
result_artifact
evaluation
```

---

## Canonical Evidence Relationship Types (10)

```text
derived_from
supports
contradicts
extends
refines
references
compares
validates
documents
groups
```

---

## History Status (6)

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

- runtime values
- learner answers
- timestamps
- execution history
- interaction history
- learner analytics
- metrics collected during execution
- logs
- files
- images
- predictions
- confidence

Sorting must be deterministic:

```text
historyId
↓
historyType
↓
evidenceId
↓
relationshipId
```

Always identical.

---

## Provenance

Every history object requires:

- `historyId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Missing provenance fails validation.

---

## Validation Layer

### Functions

- `validateHistoryRecord()` — Validates a history record
- `validateEvidenceRecord()` — Validates an evidence record
- `validateEvidenceRelationship()` — Validates an evidence relationship
- `validateHistoryRegistry()` — Validates a complete registry
- `validateLaboratoryArtifactWithHistory()` — Validates a complete artifact
- `validateHistoryInput()` — Validates input data

### Validation Codes

```text
HISTORY_UNKNOWN_TYPE
HISTORY_UNKNOWN_STATUS
EVIDENCE_UNKNOWN_TYPE
RELATIONSHIP_UNKNOWN_TYPE
HISTORY_DUPLICATE_ID
HISTORY_DUPLICATE_TITLE
EVIDENCE_DUPLICATE_ID
RELATIONSHIP_DUPLICATE_ID
HISTORY_MISSING_HISTORY_ID
HISTORY_MISSING_TITLE
HISTORY_INVALID_GOVERNANCE
HISTORY_MISSING_PROVENANCE
HISTORY_INVALID_REFERENCE
EVIDENCE_MISSING_ID
EVIDENCE_MISSING_TITLE
EVIDENCE_INVALID_GOVERNANCE
EVIDENCE_INVALID_REFERENCE
RELATIONSHIP_MISSING_ID
RELATIONSHIP_MISSING_SOURCE
RELATIONSHIP_MISSING_TARGET
RELATIONSHIP_INVALID_GOVERNANCE
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

## Relationships with D4-OPT-01 through D4-OPT-08

- **D4-OPT-01** — Laboratory Contract & Registry Kernel: Provides the foundational laboratory metadata, registry, provenance, and validation. D4-OPT-09 extends these contracts with history types.
- **D4-OPT-02** — Safe Deterministic Execution Model: Provides execution plans, policies, environments, and traces. D4-OPT-09's history records reference experiments.
- **D4-OPT-03** — Laboratory Parameter Space & Configuration Orchestration: Provides parameter spaces, constraints, groups, and configurations. D4-OPT-09's history records reference configurations.
- **D4-OPT-04** — Simulation Scenario Composition & Experiment Modeling: Provides experiment metadata, scenarios, dataset references, expected outputs, and evaluation metadata. D4-OPT-09's history records reference experiments.
- **D4-OPT-05** — Visualization, Observation & Result Artifact Modeling: Provides visualization, observation, metric, and result artifact metadata. D4-OPT-09's evidence records reference these artifacts.
- **D4-OPT-06** — Laboratory Workflow Orchestration: Provides workflow metadata, workflow steps, and workflow registries. D4-OPT-09's history records reference workflows.
- **D4-OPT-07** — Laboratory Interaction & User Action Modeling: Provides interaction metadata and user action metadata. D4-OPT-09's history records may reference interactions.
- **D4-OPT-08** — Predict-Before-Run & Hypothesis Modeling: Provides hypothesis metadata and prediction prompt metadata. D4-OPT-09's evidence records reference hypotheses.

---

## Explicit Non-Responsibilities

This phase MUST NOT:

- Store runtime values
- Store learner answers
- Store timestamps
- Store execution history
- Store interaction history
- Store learner analytics
- Store metrics collected during execution
- Store logs
- Store files
- Store images
- Store predictions
- Store confidence
- Perform execution
- Perform persistence
- Perform synchronization
- Perform network access
- Call LLMs
- Generate evidence
- Infer relationships
- Rewrite evidence

---

## Runtime Limitations

This phase defines metadata only.

Execution consumes metadata.

History consumes metadata.

Neither execution nor history exists in this phase.

---

## Public API

### Kernel Functions

- `composeHistoryProvenance()` — Composes history provenance
- `composeEvidenceProvenance()` — Composes evidence provenance
- `composeEvidenceRelationshipProvenance()` — Composes relationship provenance
- `composeHistoryRecord()` — Composes a history record
- `composeEvidenceRecord()` — Composes an evidence record
- `composeEvidenceRelationship()` — Composes an evidence relationship
- `composeHistoryTrace()` — Composes a trace
- `composeHistoryRegistry()` — Composes a registry
- `composeLaboratoryHistory()` — Main entry point

### Helper Functions

- `isSupportedHistoryType()` — Type guard for history types
- `isSupportedEvidenceType()` — Type guard for evidence types
- `isSupportedEvidenceRelationshipType()` — Type guard for evidence relationship types
- `isSupportedHistoryStatus()` — Type guard for history statuses
- `isSupportedHistoryGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalHistoryTypes()` — Returns canonical history types
- `getCanonicalEvidenceTypes()` — Returns canonical evidence types
- `getCanonicalEvidenceRelationshipTypes()` — Returns canonical evidence relationship types
- `getCanonicalHistoryStatuses()` — Returns canonical history statuses
