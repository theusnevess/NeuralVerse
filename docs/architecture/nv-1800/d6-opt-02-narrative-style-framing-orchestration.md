# D6-OPT-02 — Narrative Style & Framing Orchestration

## Purpose

This optimization introduces the deterministic representation of narrative framing strategies for the NeuralVerse Narrative Agent. It enables the Narrative Agent to describe **how** knowledge should be narrated without ever generating the narrative itself.

This layer models presentation strategies only. It never generates lesson prose, invents knowledge, or changes canonical meaning.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts    — Extended with style types
  NarrativeStyleKernel.ts      — Style composition functions
  NarrativeStyleValidation.ts  — Style validation layer
  NarrativeStyleKernel.test.ts — Test suite (~70 tests)
  index.ts                     — Updated public API barrel
```

## Style Philosophy

```
Every concept can be narrated through different narrative frames.
Narrative framing changes presentation.
It never changes truth.
```

Narrative style is metadata. Narrative framing is metadata. No generated educational text belongs in this layer.

## Style Model

A Narrative Style describes **how** a concept should be presented:

- `styleId` — unique identifier
- `styleType` — one of 10 canonical narrative styles
- `preferredFrame` — one of 10 canonical framing strategies
- `motivationType` — one of 10 canonical motivation types
- `tone` — one of 8 canonical narrative tones
- `domain` — knowledge domain
- `knowledgeArtifactId` — references governed knowledge
- `curriculumNodeId` — references curriculum structure
- `lessonId` — references didactic placement
- `sequencePriority` — deterministic ordering
- `summary` — metadata description
- `tags` — categorization tags
- `provenance` — mandatory governance metadata

## Framing Model

A Narrative Frame defines structural narrative strategies:

- `frameId` — unique identifier
- `frameType` — one of 10 canonical framing strategies
- `openingStrategy` — how to begin
- `transitionStrategy` — how to connect sections
- `closureStrategy` — how to conclude
- `supportedStyles` — compatible narrative styles
- `provenance` — mandatory governance metadata

No generated text. Strategy metadata only.

## Motivation Model

A Narrative Motivation describes why a concept matters:

- `motivationId` — unique identifier
- `motivationType` — one of 10 canonical motivation types
- `title` — descriptive title
- `description` — metadata description
- `domain` — knowledge domain
- `knowledgeArtifactId` — references governed knowledge
- `provenance` — mandatory governance metadata

## Registry Model

The `NarrativeStyleRegistry` stores narrative styles only:

- `styles` — sorted narrative styles
- `metadata` — counts and metadata
- `trace` — deterministic trace metadata

Deterministic sorting: `styleId` → `styleType` → `preferredFrame` → `sequencePriority`. No insertion-order dependence.

## Provenance Model

Every style object requires provenance with:

- `source` — origin of the style metadata
- `governanceStatus` — canonical governance status
- `providedBy` — responsible entity
- `rationale` — justification for the style

Missing provenance fails validation.

## Deterministic Guarantees

- All composition functions are pure with no side effects
- Trace metadata declares `deterministic: true`, `randomUsed: false`, `timeDependency: false`
- No timestamps, runtime identifiers, or clocks in trace metadata
- Input arrays are copied before sorting: `[...items].sort(...)`
- All public interfaces use `readonly`

## Validation Strategy

- Never throws exceptions for expected validation failures
- Always returns structured `NarrativeStyleValidationError[]`
- Uses stable validation codes (e.g., `STYLE_DUPLICATE_ID`)
- Covers: style type, frame, tone, motivation, status, provenance, references, duplicates, registry emptiness, trace integrity

## Out of Scope

This optimization does NOT implement:

- Problem origin modeling
- Historical timeline generation
- Incremental concept construction
- Application context mapping
- Laboratory synchronization
- Cross-module continuity
- Lesson closure synthesis
- Narrative certification
- Public facade
- Generated lesson text
- LLM calls
- Curriculum modification
- Knowledge creation

These belong to later D6 optimizations.

## Relationship with D1–D6-OPT-01

D6-OPT-02 extends D6-OPT-01 (Narrative Contract & Registry Kernel) without modifying it. D6-OPT-01 remains fully preserved. Only additive architecture is permitted.

D6-OPT-02 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- Knowledge Agent (D5)
- Curriculum & Dependency Agent (D3)
- Didactic Architecture Agent (D1)

D6-OPT-02 produces:

- Narrative style metadata
- Framing strategy metadata
- Motivation metadata
- Tone metadata
- Style registries
- Artifacts with applied style

## Public API

### Constants

- `CANONICAL_NARRATIVE_STYLES` — 10 values
- `CANONICAL_NARRATIVE_FRAMES` — 10 values
- `CANONICAL_MOTIVATION_TYPES` — 10 values
- `CANONICAL_NARRATIVE_TONES` — 8 values
- `CANONICAL_NARRATIVE_STYLE_STATUS` — 6 values

### Composition Functions

- `composeNarrativeStyle()`
- `composeNarrativeFrame()`
- `composeNarrativeMotivation()`
- `composeNarrativeTone()`
- `composeNarrativeStyleTrace()`
- `composeNarrativeStyleRegistry()`
- `composeNarrativeStyleRegistryFromInput()`
- `composeNarrativeStyleOrchestration()`
- `composeNarrativeArtifactWithStyle()`

### Helper Functions

- `isSupportedNarrativeStyle()`
- `isSupportedNarrativeFrame()`
- `isSupportedMotivationType()`
- `isSupportedNarrativeTone()`
- `isSupportedNarrativeStyleStatus()`
- `getCanonicalNarrativeStyles()`
- `getCanonicalNarrativeFrames()`
- `getCanonicalMotivationTypes()`
- `getCanonicalNarrativeTones()`
- `getCanonicalNarrativeStyleStatuses()`

### Validation Functions

- `validateNarrativeStyle()`
- `validateNarrativeFrame()`
- `validateNarrativeMotivation()`
- `validateNarrativeStyleRegistry()`
- `validateNarrativeStyleTrace()`
- `validateNarrativeArtifactWithStyle()`
- `validateNarrativeStyleInput()`

## Future D6 Extensions

- D6-OPT-03: Problem-origin framing
- D6-OPT-04: Historical timeline construction
- D6-OPT-05: Incremental construction engine
- D6-OPT-06: Application-driven context
- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
