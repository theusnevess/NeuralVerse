# D6-OPT-06 — Narrative Emotion, Curiosity & Engagement Modeling

## Purpose

This optimization introduces the structural representation of educational engagement. It models curiosity triggers, cognitive tension, surprise opportunities, engagement moments, intellectual rewards, pacing modulation, attention recovery, and narrative momentum.

This layer models metadata only. It does not generate emotional text, manipulate users, infer emotions, personalize engagement, or create psychological profiles.

## Philosophy

The Narrative Agent does not attempt to manipulate emotions. Instead, it structurally represents educational moments that naturally sustain attention during learning. Engagement is treated as pedagogical metadata. Never as psychological profiling.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts          — Extended with engagement types
  NarrativeEngagementKernel.ts       — Engagement composition functions
  NarrativeEngagementValidation.ts   — Engagement validation layer
  NarrativeEngagementKernel.test.ts  — Test suite (~65 tests)
  index.ts                           — Updated public API barrel
```

## Canonical Enums

### Curiosity Trigger Types (10)

`unexpected_result`, `counterintuitive_fact`, `historical_question`, `engineering_problem`, `scientific_mystery`, `prediction_request`, `comparison`, `hidden_pattern`, `future_application`, `knowledge_gap`

### Engagement Types (10)

`active_prediction`, `guided_observation`, `concept_connection`, `mental_simulation`, `interactive_reflection`, `progressive_discovery`, `comparison`, `problem_solving`, `application`, `synthesis`

### Narrative Tension Types (10)

`unanswered_question`, `knowledge_conflict`, `engineering_tradeoff`, `scientific_uncertainty`, `mathematical_gap`, `algorithmic_limitation`, `unexpected_behavior`, `performance_constraint`, `design_decision`, `conceptual_conflict`

### Surprise Types (10)

`counterintuitive`, `historical`, `experimental`, `visual`, `mathematical`, `algorithmic`, `performance`, `comparison`, `real_world`, `research`

### Intellectual Reward Types (10)

`problem_resolution`, `conceptual_clarity`, `pattern_recognition`, `system_understanding`, `algorithm_mastery`, `visual_understanding`, `mathematical_insight`, `engineering_insight`, `practical_application`, `research_connection`

### Attention Recovery Types (10)

`analogy`, `visualization`, `question`, `example`, `comparison`, `laboratory_reference`, `historical_context`, `implementation`, `real_world_case`, `summary`

### Narrative Momentum Types (10)

`steady`, `accelerating`, `deepening`, `iterative`, `exploratory`, `comparative`, `hierarchical`, `convergent`, `progressive`, `reflective`

### Engagement Status (6)

`draft`, `review`, `approved`, `published`, `deprecated`, `archived`

## Models

### CuriosityTrigger

- `triggerId` — unique identifier
- `triggerType` — one of 10 canonical trigger types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### EngagementPoint

- `engagementId` — unique identifier
- `engagementType` — one of 10 canonical engagement types
- `title` — descriptive title
- `description` — metadata description
- `relatedStageId` — references a narrative stage
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### NarrativeTension

- `tensionId` — unique identifier
- `tensionType` — one of 10 canonical tension types
- `title` — descriptive title
- `description` — metadata description
- `resolutionReferenceId` — references resolution knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### SurpriseMoment

- `surpriseId` — unique identifier
- `surpriseType` — one of 10 canonical surprise types
- `title` — descriptive title
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### IntellectualReward

- `rewardId` — unique identifier
- `rewardType` — one of 10 canonical reward types
- `title` — descriptive title
- `description` — metadata description
- `relatedConceptId` — references a concept
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### AttentionRecovery

- `recoveryId` — unique identifier
- `recoveryType` — one of 10 canonical recovery types
- `description` — metadata description
- `relatedArtifactId` — references governed knowledge
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

### NarrativeMomentum

- `momentumId` — unique identifier
- `momentumType` — one of 10 canonical momentum types
- `description` — metadata description
- `relatedFlowId` — references a narrative flow
- `governanceStatus` — canonical governance status
- `provenance` — mandatory governance metadata

## Registry Model

The `EngagementRegistry` stores all engagement-layer entities:

- `curiosityTriggers` — sorted triggers
- `engagementPoints` — sorted engagement points
- `tensions` — sorted tensions
- `surprises` — sorted surprises
- `rewards` — sorted rewards
- `recoveryEntries` — sorted recovery entries
- `momentumEntries` — sorted momentum entries
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
- Always returns structured `EngagementValidationError[]`
- Uses stable validation codes (e.g., `ENGAGEMENT_DUPLICATE_TRIGGER_ID`)
- Covers: all entity types, duplicate detection, enum validation, provenance validation, registry integrity

## Out of Scope

This optimization does NOT implement:

- Learner emotion inference
- Curiosity estimation
- Engagement manipulation
- Pacing personalization
- Motivational text generation
- Emotional adaptation
- Psychological profiling
- LLM calls
- External API access
- Knowledge mutation

## Relationship with D6-OPT-01 through D6-OPT-05

D6-OPT-06 extends D6-OPT-01 through D6-OPT-05 without modifying them. All previous exports remain fully backward compatible. Only additive architecture is permitted.

D6-OPT-06 consumes governed outputs from:

- D6-OPT-01 Narrative Registry
- D6-OPT-02 Narrative Style Registry
- D6-OPT-03 Problem Registry
- D6-OPT-04 Analogy Registry
- D6-OPT-05 Story Flow Registry
- Knowledge Agent (D5)

D6-OPT-06 produces:

- Curiosity trigger metadata
- Engagement point metadata
- Narrative tension metadata
- Surprise moment metadata
- Intellectual reward metadata
- Attention recovery metadata
- Narrative momentum metadata
- Engagement registries
- Artifacts with applied engagement

## Public API

### Constants

- `CANONICAL_CURIOSITY_TRIGGER_TYPES` — 10 values
- `CANONICAL_ENGAGEMENT_TYPES` — 10 values
- `CANONICAL_NARRATIVE_TENSION_TYPES` — 10 values
- `CANONICAL_SURPRISE_TYPES` — 10 values
- `CANONICAL_REWARD_TYPES` — 10 values
- `CANONICAL_ATTENTION_RECOVERY_TYPES` — 10 values
- `CANONICAL_MOMENTUM_TYPES` — 10 values
- `CANONICAL_ENGAGEMENT_STATUS` — 6 values

### Composition Functions

- `composeCuriosityProvenance()`
- `composeCuriosityTrigger()`
- `composeEngagementPoint()`
- `composeNarrativeTension()`
- `composeSurpriseMoment()`
- `composeIntellectualReward()`
- `composeAttentionRecovery()`
- `composeNarrativeMomentum()`
- `composeEngagementTrace()`
- `composeEngagementRegistry()`
- `composeEngagementRegistryFromInput()`
- `composeNarrativeEngagement()`
- `composeNarrativeArtifactWithEngagement()`

### Helper Functions

- `isSupportedCuriosityTriggerType()`
- `isSupportedEngagementType()`
- `isSupportedNarrativeTensionType()`
- `isSupportedSurpriseType()`
- `isSupportedIntellectualRewardType()`
- `isSupportedAttentionRecoveryType()`
- `isSupportedNarrativeMomentumType()`
- `isSupportedEngagementStatus()`
- `getCanonicalCuriosityTriggerTypes()`
- `getCanonicalEngagementTypes()`
- `getCanonicalNarrativeTensionTypes()`
- `getCanonicalSurpriseTypes()`
- `getCanonicalIntellectualRewardTypes()`
- `getCanonicalAttentionRecoveryTypes()`
- `getCanonicalNarrativeMomentumTypes()`
- `getCanonicalEngagementStatuses()`

### Validation Functions

- `validateCuriosityTrigger()`
- `validateEngagementPoint()`
- `validateNarrativeTension()`
- `validateSurpriseMoment()`
- `validateIntellectualReward()`
- `validateAttentionRecovery()`
- `validateNarrativeMomentum()`
- `validateEngagementRegistry()`
- `validateEngagementInput()`
- `validateNarrativeArtifactWithEngagement()`

## Future D6 Extensions

- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
