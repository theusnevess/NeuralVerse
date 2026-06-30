# D2-OPT-07 — Industry Adoption Intelligence Orchestration

## Purpose

The Industry Adoption Intelligence Layer models governed metadata describing where and how research methods are adopted in real-world engineering. It provides deterministic adoption metadata orchestration without monitoring companies, collecting market data, or ranking technologies.

## Architecture

The Industry Adoption Intelligence Layer extends the Research Pipeline Kernel with industry-specific types and functions. It follows the same deterministic, immutable, and governed patterns established by the Evidence Kernel, Lineage Orchestration, Comparison Engine, Timeline Orchestration, Benchmark Intelligence, and Dataset Mapping Orchestration.

### Core Principles

1. **Industry adoption is contextual metadata** — It provides context about real-world usage, not scientific evidence.
2. **Not scientific evidence** — Adoption metadata does not prove method superiority.
3. **Not recommendation** — Adoption metadata does not recommend technologies.
4. **Governed metadata only** — All industry records have governance status and provenance.

## Industry Registry

The Industry Registry is a deterministic, immutable, and governed collection of industry adoption records.

### Properties

- **Immutable** — Registry contents cannot be modified after composition.
- **Deterministic ordering** — Records are sorted by `industryId` for consistent ordering.
- **Governed** — Each record has a governance status and provenance.
- **Evidence-backed** — Each record references scientific evidence.

### Composition

The registry is composed using `composeIndustryRegistry()`:

```typescript
const registry = composeIndustryRegistry('registry-001', [record1, record2]);
```

## Canonical Sectors

The system supports exactly 14 canonical industry sectors:

| Sector | Description |
|--------|-------------|
| `healthcare` | Healthcare industry |
| `finance` | Financial services |
| `manufacturing` | Manufacturing industry |
| `automotive` | Automotive industry |
| `robotics` | Robotics industry |
| `agriculture` | Agriculture industry |
| `education` | Education sector |
| `cybersecurity` | Cybersecurity industry |
| `telecommunications` | Telecommunications industry |
| `retail` | Retail industry |
| `logistics` | Logistics industry |
| `energy` | Energy industry |
| `government` | Government sector |
| `scientific_research` | Scientific research sector |

Unknown sectors fail validation with `INDUSTRY_UNKNOWN_SECTOR`.

## Adoption Model

### Adoption Types

The system supports exactly 7 canonical adoption types:

| Adoption Type | Description |
|---------------|-------------|
| `research_only` | Used only in research contexts |
| `prototype` | Used in prototype implementations |
| `pilot` | Used in pilot projects |
| `production` | Used in production systems |
| `standard_practice` | Considered standard practice |
| `legacy` | Used in legacy systems |
| `deprecated` | Deprecated adoption |

Unknown adoption types fail validation with `INDUSTRY_UNKNOWN_ADOPTION_TYPE`.

### Adoption Stages

The system supports exactly 5 canonical adoption stages:

| Adoption Stage | Description |
|----------------|-------------|
| `experimental` | Experimental adoption |
| `emerging` | Emerging adoption |
| `growing` | Growing adoption |
| `established` | Established adoption |
| `mature` | Mature adoption |

Unknown stages fail validation with `INDUSTRY_UNKNOWN_STAGE`.

## Use Case Model

Each industry record contains one or more use cases describing specific applications:

| Field | Type | Required |
|-------|------|----------|
| `useCaseId` | string | Yes |
| `title` | string | Yes |
| `description` | string | Yes |
| `sector` | ResearchIndustrySector | Yes |
| `adoptionType` | ResearchAdoptionType | Yes |
| `adoptionStage` | ResearchAdoptionStage | Yes |
| `associatedMethods` | readonly string[] | Yes |
| `rationale` | string | Yes |

## Provenance Requirements

Every industry record must expose provenance with the following fields:

| Field | Type | Required |
|-------|------|----------|
| `industryId` | string | Yes |
| `referenceId` | string | Yes |
| `source` | string | Yes |
| `governanceStatus` | ResearchGovernanceStatus | Yes |
| `sector` | ResearchIndustrySector | Yes |
| `adoptionType` | ResearchAdoptionType | Yes |
| `adoptionStage` | ResearchAdoptionStage | Yes |
| `rationale` | string | Yes |

Records without provenance fail validation with `INDUSTRY_MISSING_PROVENANCE`.

## Validation Strategy

The validation layer returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Description |
|------|-------------|
| `INDUSTRY_UNKNOWN_SECTOR` | Unknown industry sector |
| `INDUSTRY_UNKNOWN_ADOPTION_TYPE` | Unknown adoption type |
| `INDUSTRY_UNKNOWN_STAGE` | Unknown adoption stage |
| `INDUSTRY_DUPLICATE_ID` | Duplicate industry ID |
| `INDUSTRY_DUPLICATE_RECORD` | Duplicate industry record (same sector + adoptionType) |
| `INDUSTRY_MISSING_SOURCE` | Missing industry source |
| `INDUSTRY_MISSING_EVIDENCE` | Missing associated evidence |
| `INDUSTRY_MISSING_USE_CASE` | Missing use case |
| `INDUSTRY_INVALID_REFERENCE` | Invalid industry reference |
| `INDUSTRY_EMPTY_REGISTRY` | Empty industry registry |
| `INDUSTRY_MISSING_PROVENANCE` | Missing provenance |
| `INDUSTRY_INVALID_STATUS` | Invalid governance status |

### Validation Functions

- `validateIndustryRecord()` — Validates a single industry record
- `validateIndustryRegistry()` — Validates an industry registry
- `validateResearchArtifactWithIndustry()` — Validates a complete artifact
- `validateIndustryInput()` — Validates industry input

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
  generatedFrom: 'deterministic_industry_kernel',
  randomUsed: false,
  timeDependency: false,
}
```

## Relationship with Evidence

Every industry record references scientific evidence through `associatedEvidence`. Industry metadata never replaces evidence. Evidence provides the scientific foundation for industry adoption.

```
ResearchIndustryReference
  ↓ associatedEvidence
ResearchEvidence
  ↓
ResearchReference
```

## Relationship with Benchmark

Industry records can reference benchmarks through `associatedBenchmarks`. Industry metadata never replaces benchmark metadata. Benchmarks provide evaluation context for industry adoption.

```
ResearchIndustryReference
  ↓ associatedBenchmarks
ResearchBenchmark
  ↓
ResearchEvidence
```

## Relationship with Dataset

Industry records can reference datasets through `associatedDatasets`. Industry metadata never replaces dataset metadata. Datasets provide data context for industry adoption.

```
ResearchIndustryReference
  ↓ associatedDatasets
ResearchDataset
  ↓
ResearchEvidence
```

## Relationship with Methods

Industry records reference methods through `associatedMethods`. Industry metadata never replaces method metadata. Methods provide algorithmic context for industry adoption.

```
ResearchIndustryReference
  ↓ associatedMethods
ResearchMethod
  ↓
ResearchEvidence
```

## Out-of-Scope Items

This phase MUST NOT implement:

- **Company monitoring** — No tracking of companies or organizations
- **Market data collection** — No collection of market statistics
- **Technology ranking** — No ranking or recommendation of technologies
- **Adoption estimation** — No estimation of adoption levels
- **Trend prediction** — No prediction of future trends
- **Web crawling** — No scraping of websites
- **API calls** — No external service calls
- **Educational summaries** — No content generation
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

- `ResearchIndustrySector`
- `ResearchAdoptionType`
- `ResearchAdoptionStage`
- `ResearchIndustryUseCase`
- `ResearchIndustryReference`
- `ResearchIndustryDecision`
- `ResearchIndustryTrace`
- `ResearchIndustryRegistry`
- `ResearchIndustryInput`
- `ResearchArtifactWithIndustry`
- `ResearchIndustryValidationResult`
- `ResearchIndustryValidationError`
- `ResearchIndustryProvenance`
- `ResearchIndustryStatus`

### Functions

- `composeIndustryProvenance()`
- `composeIndustryUseCase()`
- `composeIndustryReference()`
- `composeIndustryRegistry()`
- `composeResearchIndustry()`
- `composeIndustryTrace()`
- `isSupportedIndustrySector()`
- `isSupportedAdoptionType()`
- `isSupportedAdoptionStage()`
- `getCanonicalIndustrySectors()`
- `getCanonicalAdoptionTypes()`
- `getCanonicalAdoptionStages()`

### Validation

- `INDUSTRY_VALIDATION_CODES`
- `validateIndustryRecord()`
- `validateIndustryRegistry()`
- `validateResearchArtifactWithIndustry()`
- `validateIndustryInput()`
