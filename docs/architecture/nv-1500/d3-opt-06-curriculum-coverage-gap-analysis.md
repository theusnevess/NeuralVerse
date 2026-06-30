# D3-OPT-06 — Curriculum Coverage & Gap Analysis

## Purpose

This phase implements the **deterministic Curriculum Coverage & Gap Analysis** layer for the Curriculum Agent (D3). It extends the D3-OPT-01 Curriculum Graph Kernel, D3-OPT-02 Dependency Orchestration, D3-OPT-03 Progression Intelligence, D3-OPT-04 Learning Path Composition, and D3-OPT-05 Roadmap Orchestration with coverage analysis and gap detection.

This phase does **not** implement:

- curriculum improvement recommendations
- curriculum generation
- learner mastery inference
- learner difficulty estimation
- completion time estimation
- curriculum reordering
- scheduling
- optimization heuristics
- AI-powered analysis

Those belong to later D3 phases or are explicitly forbidden.

## Architecture

The Curriculum Coverage & Gap Analysis follows the same architectural patterns established by D3-OPT-01 through D3-OPT-05:

- **Single monolithic contract file** (`CurriculumAgentContract.ts`) extended with coverage types
- **Pure deterministic kernel** (`CoverageKernel.ts`) with compose functions
- **Validation layer** (`CoverageValidation.ts`) returning structured errors
- **Barrel exports** (`index.ts`) organizing the public API

### Files

| File | Purpose |
|------|---------|
| `CurriculumAgentContract.ts` | Extended with coverage types (D3-OPT-06) |
| `CoverageKernel.ts` | Deterministic coverage composition functions |
| `CoverageValidation.ts` | Structured coverage validation layer |
| `CoverageKernel.test.ts` | Deterministic test suite |
| `index.ts` | Barrel exports (extended) |

## Coverage Model

The Coverage Engine evaluates **how the curriculum graph covers the canonical competency model**, identifies structural gaps, overlaps and orphaned curriculum elements. It produces deterministic metadata for governance.

The coverage model answers: "How complete is the curriculum coverage?"

It does **not** answer: "How should we improve the curriculum?"

This distinction is critical:
- Coverage analysis is **curriculum-owned** — it depends only on graph structure and metadata
- Improvement recommendations are **governance-owned** — they depend on policy decisions

## Gap Model

The Gap Engine identifies structural gaps in the curriculum graph. It detects:

- missing concepts
- missing competencies
- missing assessments
- missing laboratories
- missing reviews
- missing capstones
- missing dependencies
- orphan nodes
- redundant nodes
- disconnected paths

It does **not**:
- suggest fixes
- prioritize fixes
- estimate educational quality
- infer learner impact

## Canonical Coverage Status

The kernel supports exactly 8 canonical coverage statuses:

| Status | Purpose |
|--------|---------|
| `fully_covered` | Entity is fully covered by curriculum |
| `partially_covered` | Entity is partially covered |
| `not_covered` | Entity is not covered |
| `redundant` | Entity has redundant coverage |
| `orphaned` | Entity is orphaned in curriculum |
| `blocked` | Entity coverage is blocked |
| `deprecated` | Entity is deprecated |
| `unknown` | Coverage status is unknown |

## Canonical Gap Types

The kernel supports exactly 10 canonical gap types:

| Gap Type | Purpose |
|----------|---------|
| `missing_concept` | Concept is missing from curriculum |
| `missing_competency` | Competency is missing from curriculum |
| `missing_assessment` | Assessment is missing from curriculum |
| `missing_laboratory` | Laboratory is missing from curriculum |
| `missing_review` | Review is missing from curriculum |
| `missing_capstone` | Capstone is missing from curriculum |
| `missing_dependency` | Dependency is missing |
| `orphan_node` | Node is orphaned in curriculum |
| `redundant_node` | Node is redundant in curriculum |
| `disconnected_path` | Path is disconnected in curriculum |

## Canonical Coverage Dimensions

The kernel supports exactly 12 canonical coverage dimensions:

| Dimension | Purpose |
|-----------|---------|
| `concept` | Concept coverage |
| `competency` | Competency coverage |
| `lesson` | Lesson coverage |
| `module` | Module coverage |
| `learning_path` | Learning path coverage |
| `assessment` | Assessment coverage |
| `laboratory` | Laboratory coverage |
| `review` | Review coverage |
| `capstone` | Capstone coverage |
| `dependency` | Dependency coverage |
| `progression` | Progression coverage |
| `roadmap` | Roadmap coverage |

## Provenance Model

Every coverage record requires:

- `coverageId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Every gap record requires:

- `gapId` — unique identifier
- `source` — source authority
- `governanceStatus` — canonical | accepted | provisional | deprecated | rejected
- `rationale` — justification for inclusion
- `providedBy` — providing authority

Mandatory.

## Validation Strategy

Validation returns structured errors, never exceptions for expected validation failures.

### Validation Codes

| Code | Meaning |
|------|---------|
| `COVERAGE_UNKNOWN_STATUS` | Non-canonical coverage status |
| `COVERAGE_UNKNOWN_DIMENSION` | Non-canonical coverage dimension |
| `GAP_UNKNOWN_TYPE` | Non-canonical gap type |
| `COVERAGE_DUPLICATE_RECORD` | Duplicate coverage record ID |
| `GAP_DUPLICATE_RECORD` | Duplicate gap record ID |
| `COVERAGE_INVALID_REFERENCE` | References non-existent curriculum node |
| `COVERAGE_EMPTY_REGISTRY` | Registry has no coverage records or gap records |
| `GAP_EMPTY_REGISTRY` | Registry has no gap records |
| `COVERAGE_MISSING_SOURCE` | Missing source field |
| `COVERAGE_MISSING_PROVENANCE` | Missing provenance data |
| `COVERAGE_INVALID_STATUS` | Invalid governance status |

## Deterministic Guarantees

The kernel provides the following deterministic guarantees:

1. **Identical input produces identical output** — no randomness, no time dependency
2. **Deterministic ordering** — coverage records sorted by dimension, then coverageStatus, then entityId; gap records sorted by gapType, then entityId, then gapId
3. **No mutation** — all compose functions return new objects; inputs are never modified
4. **No side effects** — no network access, no filesystem access, no global state
5. **No inference** — the kernel does not infer mastery, generate content, or model learners

### Forbidden

The kernel never:

- Uses `Math.random`, `Date.now`, `performance.now`, `new Date()`
- Uses `crypto.randomUUID()` or UUID generation
- Accesses network (`fetch`, `axios`, `XMLHttpRequest`, `WebSocket`)
- Accesses browser APIs (`navigator`, `window`, `document`, `localStorage`)
- Accesses filesystem
- Uses `async` or `Promise`
- Generates curriculum content
- Infers learner mastery
- Personalizes learning
- Modifies curriculum graphs
- Creates new curriculum nodes
- Infers new dependencies
- Reorders curriculum outside deterministic canonical ordering
- Executes assessments
- Models learner state
- Recommends curriculum improvements
- Estimates completion time or workload
- Schedules activities
- Calls APIs or LLMs
- Accesses databases

## Relationship with Curriculum Graph

This phase integrates with D3-OPT-01 as follows:

- **Consumes**: `CurriculumGraph` and `CurriculumNode` from D3-OPT-01
- **Never modifies**: The curriculum graph structure
- **Never inserts**: New nodes or edges
- **Never rewrites**: Existing relationships
- **Metadata only**: Coverage analysis is metadata layered on top of the graph

## Relationship with Dependency Orchestration

This phase integrates with D3-OPT-02 as follows:

- **Consumes**: `CurriculumDependency` and `CurriculumDependencyRegistry` from D3-OPT-02
- **Uses**: Dependency metadata for coverage analysis
- **Never modifies**: The dependency registry
- **Never inserts**: New dependencies
- **Metadata only**: Coverage analysis uses dependency metadata

## Relationship with Progression Intelligence

This phase integrates with D3-OPT-03 as follows:

- **Consumes**: `CurriculumProgressionNode` and `CurriculumProgressionRegistry` from D3-OPT-03
- **Uses**: Progression metadata for coverage analysis
- **Never modifies**: The progression registry
- **Never inserts**: New progressions
- **Metadata only**: Coverage analysis uses progression metadata

## Relationship with Learning Paths

This phase integrates with D3-OPT-04 as follows:

- **Consumes**: `CurriculumLearningPath` and `CurriculumLearningPathRegistry` from D3-OPT-04
- **Uses**: Learning path metadata for coverage analysis
- **Never modifies**: The learning path registry
- **Never inserts**: New learning paths
- **Metadata only**: Coverage analysis uses learning path metadata

## Relationship with Roadmaps

This phase integrates with D3-OPT-05 as follows:

- **Consumes**: `CurriculumRoadmap` and `CurriculumRoadmapRegistry` from D3-OPT-05
- **Uses**: Roadmap metadata for coverage analysis
- **Never modifies**: The roadmap registry
- **Never inserts**: New roadmaps
- **Metadata only**: Coverage analysis uses roadmap metadata

## Explicit Boundaries

The Coverage Engine MUST NOT:

- recommend curriculum improvements
- create missing curriculum
- reorder curriculum
- infer mastery
- infer readiness
- infer learner difficulty
- estimate completion time
- personalize curriculum
- schedule activities
- modify dependencies
- modify progression
- modify learning paths
- modify roadmaps
- execute laboratories
- execute assessments
- call external APIs
- call LLMs
- access the network
- access databases

## Public API

### Compose Functions

- `composeCoverageRecord(params)` — compose a coverage record
- `composeGapRecord(params)` — compose a gap record
- `composeCoverageRegistry(params)` — compose a coverage registry
- `composeCoverageTrace(registryId, coverageRecords, gapRecords)` — compose a coverage trace
- `composeCoverageProvenance(record)` — compose coverage provenance
- `composeCurriculumCoverage(input)` — compose coverage from input
- `composeCurriculumArtifactWithCoverage(params)` — compose artifact with coverage

### Helper Functions

- `isSupportedCoverageStatus(status)` — check coverage status support
- `isSupportedGapType(type)` — check gap type support
- `isSupportedCoverageDimension(dimension)` — check coverage dimension support
- `isSupportedCoverageGovernanceStatus(status)` — check governance status support
- `getCanonicalCoverageStatuses()` — return canonical coverage statuses
- `getCanonicalGapTypes()` — return canonical gap types
- `getCanonicalCoverageDimensions()` — return canonical coverage dimensions

### Validation Functions

- `validateCoverageRecord(record, graphNodeIds)` — validate a coverage record
- `validateGapRecord(record, graphNodeIds)` — validate a gap record
- `validateCoverageRegistry(registry, graphNodeIds)` — validate a registry
- `validateCurriculumArtifactWithCoverage(artifact)` — validate an artifact
- `validateCoverageInput(input, graphNodeIds)` — validate input

## Out of Scope

The following capabilities are explicitly out of scope for this phase:

- curriculum improvement recommendations
- curriculum generation
- learner mastery inference
- learner difficulty estimation
- completion time estimation
- curriculum reordering
- scheduling
- optimization heuristics
- AI-powered analysis
- learner modeling
- content generation
- graph rewriting
- runtime execution

## Runtime Limitations

- All operations are synchronous and deterministic
- No external dependencies
- No network access
- No filesystem access
- No async operations
- No global mutable state
- No randomness
- No time dependency
