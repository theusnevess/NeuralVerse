# D6-OPT-05 — Story Arc, Cognitive Progression & Narrative Flow Modeling

## Purpose

This optimization introduces the deterministic structural representation of how a narrative progresses from beginning to end. It models story arcs, cognitive progression, narrative transitions, attention shifts, conceptual escalation, and resolution points.

This layer models metadata only. It does not generate narrative text, perform storytelling, personalize explanations, or invent narrative flow.

## Philosophy

A good explanation is not merely correct. It presents ideas in an order that minimizes cognitive load while maximizing understanding. D6 models that order.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts   — Extended with story flow types
  StoryFlowKernel.ts          — Story flow composition functions
  StoryFlowValidation.ts      — Story flow validation layer
  StoryFlowKernel.test.ts     — Test suite (~65 tests)
  index.ts                    — Updated public API barrel
```

## Canonical Enums

### Story Arc Types (10)

`classical`, `engineering`, `scientific_discovery`, `historical`, `investigation`, `problem_solution`, `incremental_learning`, `comparison`, `exploration`, `research`

### Narrative Stages (10)

`hook`, `context`, `problem`, `motivation`, `intuition`, `development`, `deepening`, `application`, `synthesis`, `conclusion`

### Transition Types (10)

`context_shift`, `zoom_in`, `zoom_out`, `analogy_transition`, `comparison_transition`, `historical_transition`, `mathematical_transition`, `implementation_transition`, `reflection_transition`, `summary_transition`

### Cognitive Progression Types (10)

`observation_to_pattern`, `pattern_to_concept`, `concept_to_model`, `model_to_algorithm`, `algorithm_to_system`, `simple_to_complex`, `known_to_unknown`, `concrete_to_abstract`, `intuition_to_formalism`, `theory_to_practice`

### Attention Shift Types (10)

`focus_problem`, `focus_solution`, `focus_visualization`, `focus_equation`, `focus_algorithm`, `focus_history`, `focus_application`, `focus_limitation`, `focus_tradeoff`, `focus_summary`

### Story Flow Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### StoryArc

- `storyArcId` — unique identifier
- `storyArcType` — one of 10 canonical story arc types
- `title` — descriptive title
- `stageIds` — references to narrative stages
- `flowId` — references a narrative flow
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### NarrativeStage

- `stageId` — unique identifier
- `stageType` — one of 10 canonical stage types
- `title` — descriptive title
- `description` — metadata description
- `order` — deterministic ordering
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### NarrativeTransition

- `transitionId` — unique identifier
- `transitionType` — one of 10 canonical transition types
- `sourceStageId` — source stage
- `targetStageId` — target stage
- `description` — metadata description
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### CognitiveProgression

- `progressionId` — unique identifier
- `progressionType` — one of 10 canonical progression types
- `sourceConceptId` — source concept
- `targetConceptId` — target concept
- `description` — metadata description
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### AttentionShift

- `shiftId` — unique identifier
- `shiftType` — one of 10 canonical shift types
- `trigger` — what triggers the shift
- `destination` — where attention goes
- `description` — metadata description
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### NarrativeFlow

- `flowId` — unique identifier
- `storyArcId` — references a story arc
- `transitionIds` — references to transitions
- `progressionIds` — references to progressions
- `attentionShiftIds` — references to attention shifts
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Cognitive Progression Model

Cognitive progressions model the canonical ways understanding advances:

1. `observation_to_pattern` — from noticing to recognizing patterns
2. `pattern_to_concept` — from patterns to abstract concepts
3. `concept_to_model` — from concepts to formal models
4. `model_to_algorithm` — from models to executable algorithms
5. `algorithm_to_system` — from algorithms to complete systems
6. `simple_to_complex` — from simple to complex
7. `known_to_unknown` — from familiar to unfamiliar
8. `concrete_to_abstract` — from concrete to abstract
9. `intuition_to_formalism` — from intuitive to formal
10. `theory_to_practice` — from theory to practice

## Registry Model

The `StoryFlowRegistry` stores all story flow entities:

- `storyArcs` — sorted story arcs
- `stages` — sorted narrative stages
- `transitions` — sorted transitions
- `progressions` — sorted cognitive progressions
- `attentionShifts` — sorted attention shifts
- `flows` — sorted narrative flows
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
- Always returns structured `StoryFlowValidationError[]`
- Uses stable validation codes (e.g., `STORY_FLOW_DUPLICATE_ARC_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Story generation
- Explanation generation
- Narrative flow invention
- Sequencing personalization
- Learner cognition inference
- Comprehension estimation
- Storytelling execution
- LLM calls
- External API access
- Knowledge mutation

## Relationship with D6-OPT-01 through D6-OPT-04

D6-OPT-05 extends D6-OPT-01, D6-OPT-02, D6-OPT-03, and D6-OPT-04 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-05 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- D6-OPT-03 Problem Registry
- D6-OPT-04 Analogy Registry
- Knowledge Agent (D5)
- Curriculum & Dependency Agent (D3)

D6-OPT-05 produces:

- Story arc metadata
- Narrative stage metadata
- Transition metadata
- Cognitive progression metadata
- Attention shift metadata
- Narrative flow metadata
- Story flow registries
- Artifacts with applied story flow

## Public API

### Constants

- `CANONICAL_STORY_ARC_TYPES` — 10 values
- `CANONICAL_NARRATIVE_STAGES` — 10 values
- `CANONICAL_TRANSITION_TYPES` — 10 values
- `CANONICAL_COGNITIVE_PROGRESSIONS` — 10 values
- `CANONICAL_ATTENTION_SHIFT_TYPES` — 10 values
- `CANONICAL_STORY_FLOW_STATUS` — 6 values

### Composition Functions

- `composeStoryArcProvenance()`
- `composeStoryArc()`
- `composeNarrativeStage()`
- `composeNarrativeTransition()`
- `composeCognitiveProgression()`
- `composeAttentionShift()`
- `composeNarrativeFlow()`
- `composeStoryFlowTrace()`
- `composeStoryFlowRegistry()`
- `composeStoryFlowRegistryFromInput()`
- `composeNarrativeFlowArtifacts()`
- `composeNarrativeArtifactWithStoryFlow()`

### Helper Functions

- `isSupportedStoryArcType()`
- `isSupportedNarrativeStageType()`
- `isSupportedTransitionType()`
- `isSupportedCognitiveProgressionType()`
- `isSupportedAttentionShiftType()`
- `isSupportedStoryFlowStatus()`
- `getCanonicalStoryArcTypes()`
- `getCanonicalNarrativeStageTypes()`
- `getCanonicalTransitionTypes()`
- `getCanonicalCognitiveProgressionTypes()`
- `getCanonicalAttentionShiftTypes()`
- `getCanonicalStoryFlowStatuses()`

### Validation Functions

- `validateStoryArc()`
- `validateNarrativeStage()`
- `validateNarrativeTransition()`
- `validateCognitiveProgression()`
- `validateAttentionShift()`
- `validateNarrativeFlow()`
- `validateStoryFlowRegistry()`
- `validateStoryFlowInput()`
- `validateNarrativeArtifactWithStoryFlow()`

## Future D6 Extensions

- D6-OPT-06: Application-driven context
- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
