# D6-OPT-04 — Analogy, Metaphor & Intuition Modeling

## Purpose

This optimization introduces the deterministic structural representation of cognitive bridges used to transform complex technical concepts into understandable mental models. It models analogies, metaphors, intuitive bridges, conceptual mappings, abstraction levels, and explanatory transitions.

This layer models metadata only. It does not generate explanations, analogies, metaphors, or educational content.

## Philosophy

Humans rarely understand difficult ideas directly. They understand them by mapping the unknown onto something already familiar. D6 models those mappings as canonical educational metadata.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts   — Extended with analogy types
  AnalogyKernel.ts            — Analogy composition functions
  AnalogyValidation.ts        — Analogy validation layer
  AnalogyKernel.test.ts       — Test suite (~65 tests)
  index.ts                    — Updated public API barrel
```

## Canonical Enums

### Analogy Types (10)

`structural`, `functional`, `behavioral`, `mechanical`, `physical`, `biological`, `mathematical`, `computational`, `everyday_life`, `historical`

### Metaphor Types (10)

`journey`, `construction`, `flow`, `container`, `network`, `ecosystem`, `toolbox`, `machine`, `language`, `navigation`

### Intuition Types (10)

`visual`, `spatial`, `physical`, `numerical`, `behavioral`, `causal`, `comparative`, `incremental`, `probabilistic`, `systems`

### Mapping Types (10)

`one_to_one`, `one_to_many`, `many_to_one`, `behavior_mapping`, `structure_mapping`, `role_mapping`, `process_mapping`, `constraint_mapping`, `component_mapping`, `system_mapping`

### Abstraction Levels (10)

`concrete`, `observable`, `practical`, `operational`, `conceptual`, `algorithmic`, `mathematical`, `architectural`, `theoretical`, `research`

### Analogy Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### Analogy

- `analogyId` — unique identifier
- `analogyType` — one of 10 canonical analogy types
- `title` — descriptive title
- `description` — metadata description
- `sourceConceptId` — the familiar concept
- `targetConceptId` — the unknown concept
- `mappingId` — references a concept mapping
- `abstractionLevel` — one of 10 canonical levels
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### Metaphor

- `metaphorId` — unique identifier
- `metaphorType` — one of 10 canonical metaphor types
- `title` — descriptive title
- `description` — metadata description
- `relatedAnalogyId` — references an analogy
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### Intuition

- `intuitionId` — unique identifier
- `intuitionType` — one of 10 canonical intuition types
- `title` — descriptive title
- `description` — metadata description
- `supportedConceptId` — the concept being supported
- `abstractionLevel` — one of 10 canonical levels
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### ConceptMapping

- `mappingId` — unique identifier
- `mappingType` — one of 10 canonical mapping types
- `sourceArtifactId` — source artifact
- `targetArtifactId` — target artifact
- `description` — metadata description
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### CognitiveBridge

- `bridgeId` — unique identifier
- `analogyId` — references an analogy
- `metaphorId` — references a metaphor
- `intuitionId` — references an intuition
- `mappingId` — references a mapping
- `bridgePurpose` — purpose statement
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Abstraction Model

Abstraction levels provide a canonical framework for reasoning about how concrete or abstract a given analogy, intuition, or mapping is:

1. `concrete` — directly observable
2. `observable` — visible with effort
3. `practical` — applicable in practice
4. `operational` — used in operations
5. `conceptual` — abstract concept
6. `algorithmic` — process-level
7. `mathematical` — formal representation
8. `architectural` — structural design
9. `theoretical` — theoretical framework
10. `research` — research frontier

## Cognitive Bridge Model

A Cognitive Bridge connects multiple analogy-layer entities:

- Analogy (structural mapping)
- Metaphor (language framing)
- Intuition (cognitive entry point)
- ConceptMapping (formal correspondence)

The bridge declares its purpose for connecting these entities.

## Registry Model

The `AnalogyRegistry` stores all analogy-layer entities:

- `analogies` — sorted analogies
- `metaphors` — sorted metaphors
- `intuitions` — sorted intuitions
- `mappings` — sorted concept mappings
- `bridges` — sorted cognitive bridges
- `metadata` — counts and metadata
- `trace` — deterministic trace metadata

Deterministic sorting for each collection. No insertion-order dependence.

## Provenance Model

Every entity requires provenance with:

- `source` — origin of the metadata
- `governanceStatus` — canonical governance status
- `providedBy` — responsible entity
- `rationale` — justification

Missing provenance fails validation.

## Deterministic Guarantees

- All composition functions are pure with no side effects
- Trace metadata declares `deterministic: true`, `randomUsed: false`, `timeDependency: false`
- No timestamps, runtime identifiers, or clocks in trace metadata
- Input arrays are copied before sorting: `[...items].sort(...)`
- All public interfaces use `readonly`

## Validation Strategy

- Never throws exceptions for expected validation failures
- Always returns structured `AnalogyValidationError[]`
- Uses stable validation codes (e.g., `ANALOGY_DUPLICATE_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Analogy generation
- Metaphor invention
- Automatic intuition inference
- Explanation rewriting
- Analogy personalization
- Learner understanding inference
- Educational content generation
- Reasoning execution
- LLM calls
- External API access
- Knowledge mutation

## Relationship with D6-OPT-01 through D6-OPT-03

D6-OPT-04 extends D6-OPT-01, D6-OPT-02, and D6-OPT-03 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-04 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- D6-OPT-03 Problem Registry
- Knowledge Agent (D5)

D6-OPT-04 produces:

- Analogy metadata
- Metaphor metadata
- Intuition metadata
- Concept mapping metadata
- Cognitive bridge metadata
- Analogy registries
- Artifacts with applied analogies

## Public API

### Constants

- `CANONICAL_ANALOGY_TYPES` — 10 values
- `CANONICAL_METAPHOR_TYPES` — 10 values
- `CANONICAL_INTUITION_TYPES` — 10 values
- `CANONICAL_MAPPING_TYPES` — 10 values
- `CANONICAL_ABSTRACTION_LEVELS` — 10 values
- `CANONICAL_ANALOGY_STATUS` — 6 values

### Composition Functions

- `composeAnalogyProvenance()`
- `composeAnalogy()`
- `composeMetaphor()`
- `composeIntuition()`
- `composeConceptMapping()`
- `composeCognitiveBridge()`
- `composeAnalogyTrace()`
- `composeAnalogyRegistry()`
- `composeAnalogyRegistryFromInput()`
- `composeNarrativeAnalogies()`
- `composeNarrativeArtifactWithAnalogies()`

### Helper Functions

- `isSupportedAnalogyType()`
- `isSupportedMetaphorType()`
- `isSupportedIntuitionType()`
- `isSupportedMappingType()`
- `isSupportedAbstractionLevel()`
- `isSupportedAnalogyStatus()`
- `getCanonicalAnalogyTypes()`
- `getCanonicalMetaphorTypes()`
- `getCanonicalIntuitionTypes()`
- `getCanonicalMappingTypes()`
- `getCanonicalAbstractionLevels()`
- `getCanonicalAnalogyStatuses()`

### Validation Functions

- `validateAnalogy()`
- `validateMetaphor()`
- `validateIntuition()`
- `validateConceptMapping()`
- `validateCognitiveBridge()`
- `validateAnalogyRegistry()`
- `validateAnalogyInput()`
- `validateNarrativeArtifactWithAnalogies()`

## Future D6 Extensions

- D6-OPT-05: Incremental construction engine
- D6-OPT-06: Application-driven context
- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
