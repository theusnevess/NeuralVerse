# D2-OPT-09 — Research Reading Path Orchestration

## Purpose

The Research Reading Path Orchestration Layer creates deterministic research reading paths based exclusively on governed metadata. It organizes canonical reading sequences without recommending papers, ranking publications, or inferring learner ability.

## Architecture

The Research Reading Path Orchestration Layer extends the Research Pipeline Kernel with reading-path-specific types and functions. It follows the same deterministic, immutable, and governed patterns established by the Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, Benchmark Intelligence, Dataset Mapping Orchestration, Industry Adoption Intelligence, and Scientific Evolution Mapping.

### Core Principles

1. **Reading Paths are deterministic metadata** — They organize existing scientific artifacts.
2. **Not generated** — Reading paths are provided, not inferred.
3. **Not personalized** — Reading paths do not adapt to learner profiles.
4. **Not recommendations** — Reading paths do not recommend papers.

## Reading Path Model

The Reading Path Model is a deterministic, immutable, and governed collection of ordered reading sequences.

### Properties

- **Immutable** — Reading path contents cannot be modified after composition.
- **Deterministic ordering** — Nodes are sorted by order, publicationYear, and nodeId.
- **Evidence-backed** — Each path references scientific evidence.
- **Provenance-governed** — Each path has provenance and governance status.

### Composition

A reading path is composed using `composeReadingPath()`:

```typescript
const path = composeReadingPath(
  'path-001',
  'foundational',
  'Deep Learning Foundations',
  'A foundational reading path for deep learning.',
  [node1, node2, node3],
  ['ref-001', 'ref-002'],
  ['timeline-001'],
  ['benchmark-001'],
  ['dataset-001'],
  ['evolution-001'],
  'canonical',
  'active',
  'Essential reading for deep learning.',
  provenance,
);
```

## Canonical Path Types

The system supports exactly 10 canonical reading path types:

| Path Type | Description |
|-----------|-------------|
| `foundational` | Foundational reading for a topic |
| `historical` | Historical perspective on a topic |
| `implementation` | Implementation-focused reading |
| `mathematical` | Mathematical foundations |
| `comparative` | Comparative analysis reading |
| `survey` | Survey of a field |
| `benchmark_oriented` | Benchmark-focused reading |
| `dataset_oriented` | Dataset-focused reading |
| `industry_oriented` | Industry-focused reading |
| `advanced` | Advanced topics reading |

Unknown path types fail validation with `READING_PATH_UNKNOWN_TYPE`.

## Canonical Stages

The system supports exactly 10 canonical reading path stages:

| Stage | Description |
|-------|-------------|
| `introduction` | Introduction to the topic |
| `background` | Background material |
| `core_foundation` | Core foundational material |
| `methodology` | Methodology description |
| `evaluation` | Evaluation and results |
| `comparison` | Comparison with alternatives |
| `extensions` | Extensions and improvements |
| `applications` | Real-world applications |
| `limitations` | Limitations and challenges |
| `future_directions` | Future research directions |

Unknown stages fail validation with `READING_PATH_UNKNOWN_STAGE`.

## Deterministic Ordering

Reading paths use deterministic ordering based on:

1. **order** — Explicit order number
2. **publicationYear** — Publication year (secondary sort)
3. **nodeId** — Node ID (final tie-break)

### Ordering Rules

Allowed ordering metadata:
- `publicationYear`
- `timelinePosition`
- `evolutionPosition`
- `explicitCanonicalOrder`
- `nodeId` (final tie-break)

Forbidden ordering metadata:
- Popularity
- Citations
- Downloads
- Impact factor

## Provenance Requirements

Every reading path must expose provenance with the following fields:

| Field | Type | Required |
|-------|------|----------|
| `pathId` | string | Yes |
| `referenceId` | string | Yes |
| `source` | string | Yes |
| `governanceStatus` | ResearchGovernanceStatus | Yes |
| `pathType` | ResearchReadingPathType | Yes |
| `rationale` | string | Yes |
| `providedBy` | string | Yes |

Reading paths without provenance fail validation with `READING_PATH_MISSING_PROVENANCE`.

## Validation Strategy

The validation layer returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Description |
|------|-------------|
| `READING_PATH_UNKNOWN_TYPE` | Unknown reading path type |
| `READING_PATH_UNKNOWN_STAGE` | Unknown reading path stage |
| `READING_PATH_DUPLICATE_NODE` | Duplicate node ID |
| `READING_PATH_DUPLICATE_PATH` | Duplicate path ID |
| `READING_PATH_INVALID_ORDER` | Invalid node order |
| `READING_PATH_MISSING_PROVENANCE` | Missing provenance |
| `READING_PATH_INVALID_REFERENCE` | Invalid reference |
| `READING_PATH_EMPTY_PATH` | Empty reading path |
| `READING_PATH_EMPTY_REGISTRY` | Empty registry |
| `READING_PATH_NON_DETERMINISTIC_ORDER` | Non-deterministic ordering |
| `READING_PATH_MISSING_SOURCE` | Missing source/ID |
| `READING_PATH_MISSING_EVIDENCE` | Missing associated evidence |
| `READING_PATH_INVALID_STATUS` | Invalid governance status |

### Validation Functions

- `validateReadingPathNode()` — Validates a single node
- `validateReadingPath()` — Validates a reading path
- `validateReadingPathRegistry()` — Validates a registry
- `validateResearchArtifactWithReadingPaths()` — Validates a complete artifact
- `validateReadingPathInput()` — Validates reading path input

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
  generatedFrom: 'deterministic_reading_path_kernel',
  randomUsed: false,
  timeDependency: false,
}
```

## Relationship with Evidence

Reading Paths consume metadata from Evidence. Reading Paths never modify Evidence metadata. Evidence provides scientific foundation for reading paths.

```
ResearchReadingPath
  ↓ associatedEvidence
ResearchEvidence
  ↓
ResearchReference
```

## Relationship with Timeline

Reading Paths consume metadata from Timeline. Reading Paths never modify Timeline metadata. Timeline provides chronological context for reading paths.

```
ResearchReadingPath
  ↓ associatedTimeline
ResearchTimeline
  ↓
ResearchTimelineEvent
```

## Relationship with Evolution

Reading Paths consume metadata from Evolution. Reading Paths never modify Evolution metadata. Evolution provides evolutionary context for reading paths.

```
ResearchReadingPath
  ↓ associatedEvolution
ResearchEvolutionGraph
  ↓
ResearchEvolutionEdge
```

## Relationship with Curriculum

Reading Paths organize canonical reading sequences. Reading Paths never replace curriculum progression. Curriculum provides educational context for reading paths.

```
ResearchReadingPath
  ↓ (metadata only)
CurriculumProgression
```

## Relationship with Benchmark

Reading Paths can reference Benchmarks. Reading Paths never replace Benchmark metadata. Benchmarks provide evaluation context for reading paths.

```
ResearchReadingPath
  ↓ associatedBenchmarks
ResearchBenchmark
  ↓
ResearchEvidence
```

## Relationship with Dataset

Reading Paths can reference Datasets. Reading Paths never replace Dataset metadata. Datasets provide data context for reading paths.

```
ResearchReadingPath
  ↓ associatedDatasets
ResearchDataset
  ↓
ResearchEvidence
```

## Out-of-Scope Items

This phase MUST NOT implement:

- **Recommendation systems** — No paper recommendations
- **Personalized reading** — No adaptation to learner profiles
- **Adaptive sequencing** — No dynamic path adjustment
- **Learner modeling** — No learner ability inference
- **Paper ranking** — No ranking of publications
- **Citation ranking** — No citation-based ranking
- **Popularity estimation** — No popularity estimation
- **Automatic prerequisite inference** — No prerequisite inference
- **Paper summarization** — No paper summarization
- **LLM reasoning** — No language model inference

## Runtime Limitations

- No browser APIs
- No filesystem access
- No network requests
- No external service calls
- No hidden state
- No side effects

## Public API

### Types

- `ResearchReadingPathType`
- `ResearchReadingPathStage`
- `ResearchReadingPathNode`
- `ResearchReadingPath`
- `ResearchReadingPathRegistry`
- `ResearchReadingPathDecision`
- `ResearchReadingPathTrace`
- `ResearchReadingPathInput`
- `ResearchArtifactWithReadingPaths`
- `ResearchReadingPathValidationResult`
- `ResearchReadingPathValidationError`
- `ResearchReadingPathProvenance`
- `ResearchReadingPathStatus`

### Functions

- `composeReadingPathNode()`
- `composeReadingPathProvenance()`
- `composeReadingPath()`
- `composeReadingPathRegistry()`
- `composeResearchReadingPaths()`
- `composeReadingPathTrace()`
- `isSupportedReadingPathType()`
- `isSupportedReadingPathStage()`
- `getCanonicalReadingPathTypes()`
- `getCanonicalReadingPathStages()`

### Validation

- `READING_PATH_VALIDATION_CODES`
- `validateReadingPathNode()`
- `validateReadingPath()`
- `validateReadingPathRegistry()`
- `validateResearchArtifactWithReadingPaths()`
- `validateReadingPathInput()`
