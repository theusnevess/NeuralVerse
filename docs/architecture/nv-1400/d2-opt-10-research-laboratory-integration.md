# D2-OPT-10 — Research Laboratory Integration Orchestration

## Purpose

The Research Laboratory Integration Layer connects scientific literature with deterministic educational laboratories. It exposes governed laboratory metadata describing which laboratories reproduce or validate specific scientific work, without executing laboratories or generating code.

## Architecture

The Research Laboratory Integration Layer extends the Research Pipeline Kernel with laboratory-specific types and functions. It follows the same deterministic, immutable, and governed patterns established by the Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, Benchmark Intelligence, Dataset Mapping Orchestration, Industry Adoption Intelligence, Scientific Evolution Mapping, and Research Reading Path Orchestration.

### Core Principles

1. **Research identifies reproducible experiments** — Laboratory Agent executes them.
2. **Responsibilities remain separated** — Research Agent only maps metadata.
3. **No execution** — Research Agent never executes laboratories.
4. **No code generation** — Research Agent never generates laboratory code.

## Laboratory Metadata Model

The Laboratory Metadata Model is a deterministic, immutable, and governed collection of laboratory metadata.

### Properties

- **Immutable** — Laboratory metadata cannot be modified after composition.
- **Deterministic ordering** — Laboratories are sorted by laboratoryId.
- **Evidence-backed** — Each laboratory references scientific evidence.
- **Provenance-governed** — Each laboratory has provenance and governance status.
- **No executable code** — Laboratory metadata is purely descriptive.

### Composition

Laboratory metadata is composed using `composeLaboratoryMetadata()`:

```typescript
const metadata = composeLaboratoryMetadata(
  'lab-001',
  'algorithm_reproduction',
  'reproduction',
  'after_reading',
  'CNN Algorithm Reproduction',
  'Reproduce the CNN algorithm from the original paper.',
  ['ref-001', 'ref-002'],
  ['method-001'],
  ['benchmark-001'],
  ['dataset-001'],
  ['path-001'],
  'https://example.com',
  'canonical',
  'active',
  'Essential reproduction.',
  provenance,
);
```

## Canonical Laboratory Types

The system supports exactly 10 canonical laboratory types:

| Laboratory Type | Description |
|-----------------|-------------|
| `algorithm_reproduction` | Reproduce an algorithm from a paper |
| `paper_reproduction` | Reproduce results from a paper |
| `concept_visualization` | Visualize a scientific concept |
| `comparative_experiment` | Compare multiple methods |
| `parameter_exploration` | Explore parameter spaces |
| `benchmark_replication` | Replicate benchmark results |
| `dataset_exploration` | Explore dataset characteristics |
| `ablation_study` | Conduct ablation studies |
| `failure_analysis` | Analyze failure cases |
| `engineering_case` | Engineering case study |

Unknown types fail validation with `LABMETA_UNKNOWN_TYPE`.

## Canonical Laboratory Purposes

The system supports exactly 6 canonical laboratory purposes:

| Purpose | Description |
|---------|-------------|
| `understanding` | Enhance understanding of concepts |
| `validation` | Validate scientific claims |
| `comparison` | Compare different approaches |
| `exploration` | Explore research spaces |
| `reproduction` | Reproduce scientific results |
| `experimentation` | Conduct new experiments |

Unknown purposes fail validation with `LABMETA_UNKNOWN_PURPOSE`.

## Canonical Integration Modes

The system supports exactly 7 canonical integration modes:

| Integration Mode | Description |
|------------------|-------------|
| `before_reading` | Before reading the paper |
| `during_reading` | While reading the paper |
| `after_reading` | After reading the paper |
| `after_comparison` | After comparing methods |
| `after_benchmark` | After benchmarking |
| `after_dataset` | After exploring datasets |
| `after_evolution` | After studying evolution |

Unknown integration modes fail validation with `LABMETA_UNKNOWN_MODE`.

## Provenance Requirements

Every laboratory metadata entry must expose provenance with the following fields:

| Field | Type | Required |
|-------|------|----------|
| `laboratoryId` | string | Yes |
| `referenceId` | string | Yes |
| `source` | string | Yes |
| `governanceStatus` | ResearchGovernanceStatus | Yes |
| `laboratoryType` | ResearchLaboratoryType | Yes |
| `purpose` | ResearchLaboratoryPurpose | Yes |
| `rationale` | string | Yes |
| `providedBy` | string | Yes |

Metadata without provenance fails validation with `LABMETA_MISSING_PROVENANCE`.

## Validation Strategy

The validation layer returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Description |
|------|-------------|
| `LABMETA_UNKNOWN_TYPE` | Unknown laboratory type |
| `LABMETA_UNKNOWN_PURPOSE` | Unknown laboratory purpose |
| `LABMETA_UNKNOWN_MODE` | Unknown integration mode |
| `LABMETA_DUPLICATE_ID` | Duplicate laboratory ID |
| `LABMETA_DUPLICATE_RECORD` | Duplicate laboratory record |
| `LABMETA_MISSING_SOURCE` | Missing source/ID |
| `LABMETA_MISSING_EVIDENCE` | Missing associated evidence |
| `LABMETA_INVALID_REFERENCE` | Invalid reference |
| `LABMETA_MISSING_PROVENANCE` | Missing provenance |
| `LABMETA_EMPTY_REGISTRY` | Empty registry |
| `LABMETA_INVALID_STATUS` | Invalid governance status |

### Validation Functions

- `validateLaboratoryMetadata()` — Validates single laboratory metadata
- `validateLaboratoryRegistry()` — Validates laboratory registry
- `validateResearchArtifactWithLaboratories()` — Validates complete artifact
- `validateLaboratoryInput()` — Validates laboratory input

## Deterministic Guarantees

The system guarantees deterministic behavior:

- **No `Math.random`** — No random number generation
- **No `Date.now`** — No time-dependent behavior
- **No `performance.now`** — No performance timing
- **No `new Date()`** — No date construction
- **No UUID generation** — No unique identifier generation
- **No global mutable state** — No shared mutable state

### Trace Metadata

Every trace includes deterministic guarantees:

```typescript
{
  deterministic: true,
  generatedFrom: 'deterministic_laboratory_kernel',
  randomUsed: false,
  timeDependency: false,
}
```

## Relationship with Laboratory Agent

The Research Agent exposes laboratory metadata. The Laboratory Agent executes laboratories. Responsibilities remain completely separated.

```
ResearchLaboratoryMetadata
  ↓ (metadata only)
Laboratory Agent
  ↓ (execution)
Laboratory Results
```

## Relationship with Didactic Agent

The Didactic Agent uses laboratory metadata for educational sequencing. Research metadata provides scientific context.

```
ResearchLaboratoryMetadata
  ↓ (metadata only)
Didactic Agent
  ↓ (sequencing)
Educational Path
```

## Relationship with Evidence

Laboratory metadata consumes metadata from Evidence. Laboratory metadata never modifies Evidence metadata. Evidence provides scientific foundation for laboratories.

```
ResearchLaboratoryMetadata
  ↓ associatedEvidence
ResearchEvidence
  ↓
ResearchReference
```

## Relationship with Reading Paths

Laboratory metadata can reference Reading Paths. Laboratory metadata never modifies Reading Path metadata. Reading Paths provide educational context for laboratories.

```
ResearchLaboratoryMetadata
  ↓ associatedReadingPaths
ResearchReadingPath
  ↓
ResearchEvidence
```

## Relationship with Benchmark

Laboratory metadata can reference Benchmarks. Laboratory metadata never modifies Benchmark metadata. Benchmarks provide evaluation context for laboratories.

```
ResearchLaboratoryMetadata
  ↓ associatedBenchmarks
ResearchBenchmark
  ↓
ResearchEvidence
```

## Relationship with Dataset

Laboratory metadata can reference Datasets. Laboratory metadata never modifies Dataset metadata. Datasets provide data context for laboratories.

```
ResearchLaboratoryMetadata
  ↓ associatedDatasets
ResearchDataset
  ↓
ResearchEvidence
```

## Out-of-Scope Items

This phase MUST NOT implement:

- **Laboratory execution** — No execution of laboratories
- **Simulation execution** — No simulation execution
- **Code generation** — No generation of laboratory code
- **Notebook execution** — No notebook execution
- **Parameter optimization** — No parameter optimization
- **Benchmark execution** — No benchmark execution
- **Sandbox execution** — No sandbox execution
- **Visualization rendering** — No visualization rendering
- **Laboratory sequencing** — No sequencing of laboratories
- **Assessment generation** — No assessment generation
- **LLM reasoning** — No language model inference

## Explicit Architectural Boundary

The Research Agent MUST NEVER expose:

- `execute()` — No execution function
- `run()` — No run function
- `simulate()` — No simulation function
- `callback` — No callback handler
- `handler` — No event handler
- `runtime` — No runtime execution
- `sandbox` — No sandbox execution
- `code` — No code generation
- `script` — No script generation

Any executable behavior belongs exclusively to the Laboratory Agent.

## Runtime Limitations

- No browser APIs
- No filesystem access
- No network requests
- No external service calls
- No hidden state
- No side effects

## Public API

### Types

- `ResearchLaboratoryType`
- `ResearchLaboratoryPurpose`
- `ResearchLaboratoryIntegrationMode`
- `ResearchLaboratoryMetadata`
- `ResearchLaboratoryRegistry`
- `ResearchLaboratoryDecision`
- `ResearchLaboratoryTrace`
- `ResearchLaboratoryInput`
- `ResearchArtifactWithLaboratories`
- `ResearchLaboratoryValidationResult`
- `ResearchLaboratoryValidationError`
- `ResearchLaboratoryProvenance`
- `ResearchLaboratoryStatus`

### Functions

- `composeLaboratoryProvenance()`
- `composeLaboratoryMetadata()`
- `composeLaboratoryRegistry()`
- `composeResearchLaboratories()`
- `composeLaboratoryTrace()`
- `isSupportedLaboratoryType()`
- `isSupportedLaboratoryPurpose()`
- `isSupportedLaboratoryIntegrationMode()`
- `getCanonicalLaboratoryTypes()`
- `getCanonicalLaboratoryPurposes()`
- `getCanonicalLaboratoryIntegrationModes()`

### Validation

- `LABORATORY_VALIDATION_CODES`
- `validateLaboratoryMetadata()`
- `validateLaboratoryRegistry()`
- `validateResearchArtifactWithLaboratories()`
- `validateLaboratoryInput()`
