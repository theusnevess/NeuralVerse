# D2-OPT-06 — Dataset Mapping Orchestration

## Purpose

The Dataset Mapping Orchestration Layer models governed research datasets and their relationships with scientific methods, benchmarks, and research evidence. It provides deterministic dataset metadata orchestration without downloading, preprocessing, or executing datasets.

## Architecture

The Dataset Mapping Orchestration Layer extends the Research Pipeline Kernel with dataset-specific types and functions. It follows the same deterministic, immutable, and governed patterns established by the Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, and Benchmark Intelligence.

### Core Principles

1. **Datasets are governed scientific artifacts** — Each dataset has a governance status, provenance, and rationale.
2. **Datasets provide research context** — Datasets are associated with evidence, benchmarks, and methods.
3. **Datasets do NOT define benchmark results** — Dataset metadata is separate from benchmark execution.
4. **Datasets do NOT define scientific quality** — Quality is determined by evidence, not dataset characteristics.

## Dataset Registry

The Dataset Registry is a deterministic, immutable, and governed collection of datasets.

### Properties

- **Immutable** — Registry contents cannot be modified after composition.
- **Deterministic ordering** — Datasets are sorted by `datasetId` for consistent ordering.
- **Governed** — Each dataset has a governance status and provenance.
- **Evidence-backed** — Each dataset references scientific evidence.

### Composition

The registry is composed using `composeDatasetRegistry()`:

```typescript
const registry = composeDatasetRegistry('registry-001', [dataset1, dataset2]);
```

## Canonical Domains

The system supports exactly 12 canonical dataset domains:

| Domain | Description |
|--------|-------------|
| `computer_vision` | Image and video processing tasks |
| `natural_language_processing` | Text and language tasks |
| `speech` | Speech processing tasks |
| `audio` | Audio processing tasks |
| `multimodal` | Multiple modality tasks |
| `robotics` | Robotics tasks |
| `reinforcement_learning` | Reinforcement learning tasks |
| `tabular` | Structured data tasks |
| `graph` | Graph-structured data tasks |
| `timeseries` | Time series tasks |
| `recommendation` | Recommendation system tasks |
| `scientific_computing` | Scientific computation tasks |

Unknown domains fail validation with `DATASET_UNKNOWN_DOMAIN`.

## Canonical Tasks

The system supports exactly 16 canonical dataset tasks:

| Task | Description |
|------|-------------|
| `classification` | Classification tasks |
| `regression` | Regression tasks |
| `object_detection` | Object detection tasks |
| `image_segmentation` | Image segmentation tasks |
| `instance_segmentation` | Instance segmentation tasks |
| `semantic_segmentation` | Semantic segmentation tasks |
| `language_modeling` | Language modeling tasks |
| `translation` | Translation tasks |
| `question_answering` | Question answering tasks |
| `retrieval` | Retrieval tasks |
| `reasoning` | Reasoning tasks |
| `planning` | Planning tasks |
| `speech_recognition` | Speech recognition tasks |
| `speech_synthesis` | Speech synthesis tasks |
| `forecasting` | Forecasting tasks |
| `recommendation` | Recommendation tasks |

Unknown tasks fail validation with `DATASET_UNKNOWN_TASK`.

## Annotation Model

The system supports exactly 6 canonical annotation types:

| Annotation Type | Description |
|----------------|-------------|
| `manual` | Human-annotated datasets |
| `semi_automatic` | Semi-automatic annotation |
| `automatic` | Automatically annotated datasets |
| `synthetic` | Synthetically generated datasets |
| `expert_reviewed` | Expert-reviewed datasets |
| `crowdsourced` | Crowdsourced annotation |

Unknown annotation types fail validation with `DATASET_UNKNOWN_ANNOTATION`.

## Licensing Model

The system supports exactly 9 canonical dataset licenses:

| License | Description |
|---------|-------------|
| `cc_by_4_0` | Creative Commons Attribution 4.0 |
| `cc_by_sa_4_0` | Creative Commons Attribution-ShareAlike 4.0 |
| `cc_by_nc_4_0` | Creative Commons Attribution-NonCommercial 4.0 |
| `cc0_1_0` | Creative Commons Zero 1.0 |
| `apache_2_0` | Apache License 2.0 |
| `mit` | MIT License |
| `gpl_3_0` | GNU General Public License 3.0 |
| `proprietary` | Proprietary license |
| `custom` | Custom license |

Unknown licenses fail validation with `DATASET_MISSING_LICENSE`.

## Scale Model

The system supports exactly 6 canonical dataset scales:

| Scale | Description |
|-------|-------------|
| `toy` | Small toy datasets |
| `small` | Small-scale datasets |
| `medium` | Medium-scale datasets |
| `large` | Large-scale datasets |
| `very_large` | Very large-scale datasets |
| `web_scale` | Web-scale datasets |

Unknown scales fail validation with `DATASET_UNKNOWN_SCALE`.

## Provenance Requirements

Every dataset must expose provenance with the following fields:

| Field | Type | Required |
|-------|------|----------|
| `datasetId` | string | Yes |
| `referenceId` | string | Yes |
| `source` | string | Yes |
| `governanceStatus` | ResearchGovernanceStatus | Yes |
| `domain` | ResearchDatasetDomain | Yes |
| `primaryTask` | ResearchDatasetTask | Yes |
| `publicationYear` | number | Yes |
| `rationale` | string | Yes |

Datasets without provenance fail validation with `DATASET_MISSING_PROVENANCE`.

## Validation Strategy

The validation layer returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Description |
|------|-------------|
| `DATASET_UNKNOWN_DOMAIN` | Unknown dataset domain |
| `DATASET_UNKNOWN_TASK` | Unknown dataset task |
| `DATASET_UNKNOWN_SCALE` | Unknown dataset scale |
| `DATASET_UNKNOWN_ANNOTATION` | Unknown annotation type |
| `DATASET_DUPLICATE_ID` | Duplicate dataset ID |
| `DATASET_DUPLICATE_NAME` | Duplicate dataset name |
| `DATASET_MISSING_SOURCE` | Missing dataset source |
| `DATASET_MISSING_EVIDENCE` | Missing associated evidence |
| `DATASET_MISSING_LICENSE` | Missing or unknown license |
| `DATASET_INVALID_REFERENCE` | Invalid dataset reference |
| `DATASET_EMPTY_REGISTRY` | Empty dataset registry |
| `DATASET_MISSING_PROVENANCE` | Missing provenance |
| `DATASET_INVALID_STATUS` | Invalid governance status |

### Validation Functions

- `validateDataset()` — Validates a single dataset
- `validateDatasetRegistry()` — Validates a dataset registry
- `validateResearchArtifactWithDatasets()` — Validates a complete artifact
- `validateDatasetInput()` — Validates dataset input

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
  generatedFrom: 'deterministic_dataset_kernel',
  randomUsed: false,
  timeDependency: false,
}
```

## Relationship with Evidence

Every dataset references scientific evidence through `associatedEvidence`. Dataset metadata never replaces evidence. Evidence provides the scientific foundation for dataset inclusion.

```
ResearchDataset
  ↓ associatedEvidence
ResearchEvidence
  ↓
ResearchReference
```

## Relationship with Benchmark

Every dataset can reference benchmarks through `associatedBenchmarks`. Dataset metadata never replaces benchmark metadata. Benchmarks provide evaluation context for datasets.

```
ResearchDataset
  ↓ associatedBenchmarks
ResearchBenchmark
  ↓
ResearchEvidence
```

## Relationship with Timeline

Datasets can be associated with timeline events through evidence references. Dataset metadata never replaces timeline metadata. Timelines provide chronological context for dataset publication.

```
ResearchDataset
  ↓ associatedEvidence
ResearchEvidence
  ↓
ResearchTimelineEvent
```

## Relationship with Methods

Datasets can reference methods through `associatedMethods`. Dataset metadata never replaces method metadata. Methods provide algorithmic context for dataset usage.

```
ResearchDataset
  ↓ associatedMethods
ResearchMethod
  ↓
ResearchEvidence
```

## Out-of-Scope Items

This phase MUST NOT implement:

- **Dataset download** — No network requests for dataset retrieval
- **Dataset preprocessing** — No data transformation or cleaning
- **Dataset version control** — No version management
- **Data augmentation** — No data generation or modification
- **Benchmark execution** — No model evaluation
- **Model training** — No training loops or optimization
- **Dataset statistics generation** — No statistical analysis
- **Paper retrieval** — No literature search
- **Educational summaries** — No content generation
- **Recommendation systems** — No dataset recommendations
- **Laboratory execution** — No experiment execution
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

- `ResearchDatasetDomain`
- `ResearchDatasetTask`
- `ResearchDatasetAnnotationType`
- `ResearchDatasetLicense`
- `ResearchDatasetScale`
- `ResearchDataset`
- `ResearchDatasetReference`
- `ResearchDatasetDecision`
- `ResearchDatasetTrace`
- `ResearchDatasetRegistry`
- `ResearchDatasetInput`
- `ResearchArtifactWithDatasets`
- `ResearchDatasetValidationResult`
- `ResearchDatasetProvenance`
- `ResearchDatasetStatus`

### Functions

- `composeDatasetProvenance()`
- `composeDataset()`
- `composeDatasetRegistry()`
- `composeResearchDatasets()`
- `composeDatasetTrace()`
- `isSupportedDatasetDomain()`
- `isSupportedDatasetTask()`
- `isSupportedDatasetAnnotationType()`
- `isSupportedDatasetLicense()`
- `isSupportedDatasetScale()`
- `getCanonicalDatasetDomains()`
- `getCanonicalDatasetTasks()`
- `getCanonicalDatasetAnnotationTypes()`
- `getCanonicalDatasetLicenses()`
- `getCanonicalDatasetScales()`

### Validation

- `DATASET_VALIDATION_CODES`
- `validateDataset()`
- `validateDatasetRegistry()`
- `validateResearchArtifactWithDatasets()`
- `validateDatasetInput()`
