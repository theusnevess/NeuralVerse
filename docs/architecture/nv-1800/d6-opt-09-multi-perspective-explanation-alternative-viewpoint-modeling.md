# D6-OPT-09 — Multi-Perspective Explanation & Alternative Viewpoint Modeling

## Purpose

This optimization introduces deterministic modeling of multiple explanatory viewpoints. It represents multiple perspectives, alternative explanations, disciplinary viewpoints, abstraction viewpoints, implementation viewpoints, mathematical viewpoints, engineering viewpoints, and research viewpoints.

This layer models metadata only. It does not generate explanations, rewrite explanations, select the best explanation, personalize viewpoints, or infer learner preferences.

## Philosophy

Complex concepts become easier to understand when viewed from multiple complementary perspectives. The Narrative Agent models those perspectives. It never generates them.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts             — Extended with perspective types
  PerspectiveNarrativeKernel.ts         — Perspective composition functions
  PerspectiveNarrativeValidation.ts     — Perspective validation layer
  PerspectiveNarrativeKernel.test.ts    — Test suite (~50 tests)
  index.ts                              — Updated public API barrel
```

## Canonical Enums

### Perspective Types (10)

`mathematical`, `computational`, `engineering`, `scientific`, `statistical`, `physical`, `algorithmic`, `architectural`, `implementation`, `research`

### Explanation Types (10)

`formal`, `intuitive`, `visual`, `practical`, `historical`, `algorithmic`, `mathematical`, `engineering`, `comparative`, `research`

### Alternative View Types (10)

`different_domain`, `different_abstraction`, `different_method`, `different_algorithm`, `different_history`, `different_application`, `different_visualization`, `different_mathematics`, `different_engineering`, `different_research`

### Disciplinary View Types (10)

`computer_science`, `mathematics`, `statistics`, `physics`, `engineering`, `biology`, `economics`, `robotics`, `artificial_intelligence`, `software_engineering`

### Explanation Abstraction Types (10)

`concrete`, `operational`, `procedural`, `conceptual`, `structural`, `systemic`, `algorithmic`, `formal`, `theoretical`, `research`

### Implementation View Types (10)

`pseudocode`, `python`, `c_plus_plus`, `mathematical_model`, `block_diagram`, `architecture`, `pipeline`, `api`, `framework`, `production_system`

### Perspective Flow Types (10)

`single_view`, `progressive_views`, `comparative_views`, `parallel_views`, `zoom_levels`, `disciplinary_switch`, `implementation_progression`, `research_progression`, `abstraction_progression`, `integrated_views`

### Perspective Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### Perspective

- `perspectiveId` — unique identifier
- `perspectiveType` — one of 10 canonical perspective types
- `title` — descriptive title
- `description` — metadata description
- `relatedConceptId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### ExplanationView

- `viewId` — unique identifier
- `explanationType` — one of 10 canonical explanation types
- `title` — descriptive title
- `description` — metadata description
- `perspectiveId` — references a perspective
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### AlternativeView

- `alternativeId` — unique identifier
- `alternativeType` — one of 10 canonical alternative view types
- `sourceViewId` — source explanation view
- `targetViewId` — target explanation view
- `description` — metadata description
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### DisciplinaryView

- `disciplinaryViewId` — unique identifier
- `disciplinaryType` — one of 10 canonical disciplinary view types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### ImplementationView

- `implementationViewId` — unique identifier
- `implementationType` — one of 10 canonical implementation view types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### AbstractionView

- `abstractionViewId` — unique identifier
- `abstractionType` — one of 10 canonical abstraction types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### PerspectiveFlow

- `flowId` — unique identifier
- `flowType` — one of 10 canonical flow types
- `perspectiveIds` — references to perspectives
- `viewIds` — references to views
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Registry Model

The `PerspectiveRegistry` stores all perspective-layer entities:

- `perspectives` — sorted perspectives
- `explanationViews` — sorted explanation views
- `alternativeViews` — sorted alternative views
- `disciplinaryViews` — sorted disciplinary views
- `implementationViews` — sorted implementation views
- `abstractionViews` — sorted abstraction views
- `perspectiveFlows` — sorted perspective flows
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
- Always returns structured `PerspectiveValidationError[]`
- Uses stable validation codes (e.g., `PERSPECTIVE_DUPLICATE_PERSPECTIVE_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Explanation generation
- Best explanation selection
- Viewpoint personalization
- Learner preference inference
- Content rewriting
- LLM calls
- External API access
- Narrative artifact mutation

## Relationship with D6-OPT-01 through D6-OPT-08

D6-OPT-09 extends D6-OPT-01 through D6-OPT-08 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-09 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- D6-OPT-03 Problem Registry
- D6-OPT-04 Analogy Registry
- D6-OPT-05 Story Flow Registry
- D6-OPT-06 Engagement Registry
- D6-OPT-07 Historical Registry
- D6-OPT-08 Application Registry
- Knowledge Agent (D5)

D6-OPT-09 produces:

- Perspective metadata
- Explanation view metadata
- Alternative view metadata
- Disciplinary view metadata
- Implementation view metadata
- Abstraction view metadata
- Perspective flow metadata
- Perspective registries
- Artifacts with applied perspectives

## Public API

### Constants

- `CANONICAL_PERSPECTIVE_TYPES` — 10 values
- `CANONICAL_EXPLANATION_TYPES` — 10 values
- `CANONICAL_ALTERNATIVE_VIEW_TYPES` — 10 values
- `CANONICAL_DISCIPLINARY_VIEW_TYPES` — 10 values
- `CANONICAL_EXPLANATION_ABSTRACTION_TYPES` — 10 values
- `CANONICAL_IMPLEMENTATION_VIEW_TYPES` — 10 values
- `CANONICAL_PERSPECTIVE_FLOW_TYPES` — 10 values
- `CANONICAL_PERSPECTIVE_STATUS` — 6 values

### Composition Functions

- `composePerspectiveProvenance()`
- `composePerspective()`
- `composeExplanationView()`
- `composeAlternativeView()`
- `composeDisciplinaryView()`
- `composeImplementationView()`
- `composeAbstractionView()`
- `composePerspectiveFlow()`
- `composePerspectiveTrace()`
- `composePerspectiveRegistry()`
- `composePerspectiveRegistryFromInput()`
- `composeNarrativePerspectives()`
- `composeNarrativeArtifactWithPerspectives()`

### Helper Functions

- `isSupportedPerspectiveType()`
- `isSupportedExplanationType()`
- `isSupportedAlternativeViewType()`
- `isSupportedDisciplinaryViewType()`
- `isSupportedExplanationAbstractionType()`
- `isSupportedImplementationViewType()`
- `isSupportedPerspectiveFlowType()`
- `isSupportedPerspectiveStatus()`
- `getCanonicalPerspectiveTypes()`
- `getCanonicalExplanationTypes()`
- `getCanonicalAlternativeViewTypes()`
- `getCanonicalDisciplinaryViewTypes()`
- `getCanonicalExplanationAbstractionTypes()`
- `getCanonicalImplementationViewTypes()`
- `getCanonicalPerspectiveFlowTypes()`
- `getCanonicalPerspectiveStatuses()`

### Validation Functions

- `validatePerspective()`
- `validateExplanationView()`
- `validateAlternativeView()`
- `validateDisciplinaryView()`
- `validateImplementationView()`
- `validateAbstractionView()`
- `validatePerspectiveFlow()`
- `validatePerspectiveRegistry()`
- `validatePerspectiveInput()`
- `validateNarrativeArtifactWithPerspectives()`

## Future D6 Extensions

- D6-OPT-10: Narrative certification & public facade
