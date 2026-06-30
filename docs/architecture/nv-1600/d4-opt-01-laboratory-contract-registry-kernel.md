# D4-OPT-01 — Laboratory Contract & Registry Kernel

## Purpose

Establishes the canonical Laboratory Contract and Registry architecture for the Laboratory Pipeline. This phase defines the immutable structural foundation of the Laboratory Pipeline — laboratory metadata, canonical contracts, registry organization, provenance, validation, deterministic composition, and public types.

This phase **does not execute laboratories**.

It **does not execute code**.

It **does not create simulations**.

It only establishes the canonical representation of laboratory artifacts.

---

## Architecture

The Laboratory Pipeline follows the exact architectural style established by D2 (Research) and D3 (Curriculum):

- **Single contract file** — `LaboratoryAgentContract.ts`
- **Readonly interfaces** — All properties use `readonly`
- **Pure compose functions** — No side effects, no external dependencies
- **compose\* naming** — All composition functions follow the `compose*` convention
- **Structured validators** — Returns error arrays, never throws exceptions
- **Deterministic ordering** — Sort by `laboratoryId` → `laboratoryType` → `title`
- **Barrel exports** — Single public API via `index.ts`
- **Immutable registries** — Collections wrapped in registries with counts
- **No breaking changes** — Backward compatible with existing pipelines

---

## Files Created

```text
src/agents/laboratory-pipeline/
  LaboratoryAgentContract.ts    — Canonical enums, types, interfaces
  LaboratoryKernel.ts           — Deterministic compose functions
  LaboratoryValidation.ts       — Structured validation layer
  LaboratoryKernel.test.ts      — Deterministic test suite
  index.ts                      — Barrel exports

docs/architecture/nv-1600/
  d4-opt-01-laboratory-contract-registry-kernel.md  — This document
```

---

## Canonical Laboratory Model

### Laboratory Types (10)

```text
interactive_demo
simulation
parameter_exploration
visualization
algorithm_execution
mathematical_experiment
machine_learning
computer_vision
agent_system
capstone_lab
```

### Laboratory Difficulty Levels (5)

```text
beginner
intermediate
advanced
expert
research
```

### Laboratory Status (6)

```text
draft
review
approved
published
deprecated
archived
```

### Governance Status (5)

```text
canonical
accepted
provisional
deprecated
rejected
```

---

## Registry Philosophy

The registry stores laboratory metadata only.

- It never stores execution state.
- It never stores learner progress.
- It never stores runtime results.
- It represents canonical laboratory definitions.
- Ordering is always deterministic: `laboratoryId` → `laboratoryType` → `title`.

---

## Provenance

Every laboratory requires provenance.

Required metadata:

- `laboratoryId`
- `source`
- `governanceStatus`
- `rationale`
- `providedBy`

Missing provenance fails validation.

---

## Validation Layer

### Functions

- `validateLaboratory()` — Validates a single laboratory metadata
- `validateLaboratoryRegistry()` — Validates a complete registry
- `validateLaboratoryArtifact()` — Validates a complete artifact
- `validateLaboratoryInput()` — Validates input data

### Validation Codes

```text
LAB_UNKNOWN_TYPE
LAB_UNKNOWN_LEVEL
LAB_UNKNOWN_STATUS
LAB_DUPLICATE_ID
LAB_DUPLICATE_TITLE
LAB_INVALID_REFERENCE
LAB_EMPTY_REGISTRY
LAB_MISSING_SOURCE
LAB_MISSING_RATIONALE
LAB_MISSING_PROVIDED_BY
LAB_MISSING_PROVENANCE
LAB_INVALID_STATUS
LAB_INVALID_TRACE
LAB_INVALID_ARTIFACT
LAB_INVALID_INPUT
LAB_MISSING_LABORATORY_ID
LAB_MISSING_TITLE
LAB_INVALID_GOVERNANCE
LAB_MISSING_METADATA
LAB_MISSING_PROVENANCE_DATA
LAB_INVALID_NODE
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

## Public API

### Kernel Functions

- `composeLaboratoryProvenance()` — Composes provenance from parameters
- `composeLaboratoryTrace()` — Composes trace from decisions and metadata
- `composeLaboratoryNode()` — Composes node from metadata and provenance
- `composeLaboratoryArtifact()` — Composes artifact from node and trace
- `composeLaboratoryRegistry()` — Composes registry with deterministic ordering
- `composeLaboratory()` — Main entry point for laboratory composition
- `composeLaboratoryRegistryFromInput()` — Composes registry from input

### Helper Functions

- `isSupportedLaboratoryType()` — Type guard for laboratory types
- `isSupportedLaboratoryLevel()` — Type guard for laboratory levels
- `isSupportedLaboratoryStatus()` — Type guard for laboratory statuses
- `isSupportedGovernanceStatus()` — Type guard for governance statuses
- `getCanonicalLaboratoryTypes()` — Returns canonical laboratory types
- `getCanonicalLaboratoryLevels()` — Returns canonical laboratory levels
- `getCanonicalLaboratoryStatuses()` — Returns canonical laboratory statuses
- `getCanonicalGovernanceStatuses()` — Returns canonical governance statuses

---

## Explicit Boundaries

### In Scope

- Canonical laboratory metadata representation
- Laboratory registry organization
- Laboratory provenance tracking
- Deterministic validation
- Deterministic composition
- Public type definitions

### Out of Scope

- Laboratory execution
- Code execution
- Simulation creation
- Runtime state management
- Learner progress tracking
- Educational content generation
- LLM integration
- Network requests
- Filesystem access

---

## Runtime Limitations

This phase must NOT:

- Execute code
- Execute Python
- Execute JavaScript
- Spawn processes
- Evaluate scripts
- Run simulations
- Call interpreters
- Call compilers
- Open browsers
- Access filesystem
- Perform network requests
- Call LLMs
- Download resources
- Generate educational content

---

## Integration

This phase integrates with D1 (Didactic), D2 (Research), and D3 (Curriculum) without modifying any existing architecture.

The Laboratory Pipeline establishes the canonical foundation for:

- Laboratory execution (future phases)
- Simulation orchestration (future phases)
- Runtime state management (future phases)
- Learner progress tracking (future phases)
