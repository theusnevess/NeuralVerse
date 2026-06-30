# NV-1300-D1C — Media & Laboratory Orchestration

## Overview

NV-1300-D1C transforms the Didactic Architecture Agent into a complete instructional composer capable of deterministically orchestrating visualizations and executable laboratories as integral parts of an explanation.

## Orchestration Pipeline

```
Pedagogical Planner
        |
        v
Semantic Dependency Resolver
        |
        v
Example Selection
        |
        v
Media Orchestrator
        |
        +-------------+
        v             v
Visualization     Laboratory
 Orchestrator       Placer
        |             |
        +------+------+
               v
Instructional Transition Engine
               v
Evidence Tracer
               v
Final Lesson Composition
```

## New Modules

### 1. visualization-orchestrator.js

Deterministically selects and places visualizations within a didactic plan.

**Factory:** `createVisualizationOrchestrator()`

**Responsibilities:**
- Determine whether visualization is appropriate
- Select the optimal visualization(s)
- Determine placement position
- Provide selection justification

**Key Methods:**
- `shouldInsertVisualization(plan)` — boolean decision
- `scoreVisualization(viz, plan)` — deterministic score
- `selectVisualization(plan)` — returns selected visualizations
- `buildVisualizationPlacement(plan, selected)` — placement positions
- `explainSelection(selected, plan)` — human-readable explanation

**Scoring Dimensions:**
- Concept coverage (30%)
- Semantic proximity (20%)
- Difficulty compatibility (15%)
- Visual explanatory power (15%)
- Mathematical suitability (10%)
- Laboratory complementarity (5%)
- Canonical priority (5%)

**Constraints:**
- Maximum 2 visualizations per explanation
- Only when visual explanation > text explanation
- Strong affinity concepts get priority

### 2. laboratory-placer.js

Deterministically selects and places laboratories within a didactic plan.

**Factory:** `createLaboratoryPlacer()`

**Responsibilities:**
- Determine whether laboratory should appear
- Select the optimal laboratory
- Determine insertion point
- Assign instructional role

**Key Methods:**
- `scoreLaboratory(lab, plan)` — deterministic score
- `selectLaboratory(plan)` — returns selected laboratory
- `buildPlacement(plan, labResult)` — placement details
- `explainPlacement(plan, labResult, placement)` — explanation

**Laboratory Roles:**
- `exploration` — Open-ended discovery
- `guided_practice` — Step-by-step reinforcement
- `validation` — Verify understanding
- `comparison` — Compare approaches
- `challenge` — Push beyond basics
- `experiment` — Test hypotheses
- `post_explanation` — Consolidate after explanation
- `implementation` — Real-world practice

**Constraints:**
- Maximum 1 laboratory per explanation
- Only when interaction > passive observation

### 3. media-orchestrator.js

Central coordinator for visualization and laboratory orchestration.

**Factory:** `createMediaOrchestrator(deps)`

**Dependencies:**
- `visualizationOrchestrator`
- `laboratoryPlacer`
- `transitionEngine`
- `densityOptimizer`

**Key Methods:**
- `buildMediaPlan(plan)` — complete media plan
- `validateMediaPlan(mediaPlan)` — validation
- `getMediaTimeline(mediaPlan)` — timeline extraction

**Output Structure:**
```javascript
{
  visualizations: [...],
  laboratory: {...},
  timeline: [...],
  transitions: [...],
  densityMetrics: {...},
  evidence: [...],
  warnings: [...]
}
```

### 4. instructional-transition-engine.js

Generates deterministic transitions between instructional sections.

**Factory:** `createInstructionalTransitionEngine()`

**Key Methods:**
- `generateTransition(from, to, plan)` — single transition
- `buildSectionTransitions(plan, timeline)` — all transitions
- `validateTransitions(transitions)` — validation

**Transition Types:**
- `conceptual` — Sequential progression
- `media_to_concept` — Media to text
- `concept_to_media` — Text to media
- `media_to_media` — Media to media
- `recap` — Prerequisite review
- `cross_domain` — Domain connection
- `summary` — Consolidation

### 5. media-density-optimizer.js

Prevents consecutive media elements and ensures natural alternation.

**Factory:** `createMediaDensityOptimizer()`

**Key Methods:**
- `measureDensity(timeline)` — density analysis
- `optimizeSequence(timeline)` — optimization
- `balance(timeline)` — balanced timeline

**Constraints:**
- Maximum 1 consecutive media element
- Minimum 1 text section between media
- Visualization before laboratory preference

## Modified Modules

### pedagogical-planner.js

**New Dependencies:**
- `mediaOrchestrator`

**New Plan Fields:**
- `mediaPlan` — Complete media plan
- `visualizations` — Selected visualizations
- `laboratories` — Selected laboratories
- `mediaTimeline` — Media timeline
- `transitionMap` — Section transitions
- `densityMetrics` — Density analysis

### didactic-architecture-agent.js

**New Imports:**
- `createVisualizationOrchestrator`
- `createLaboratoryPlacer`
- `createMediaOrchestrator`
- `createInstructionalTransitionEngine`
- `createMediaDensityOptimizer`

**New Accessor Methods:**
- `getVisualizationOrchestrator()`
- `getLaboratoryPlacer()`
- `getMediaOrchestrator()`
- `getTransitionEngine()`
- `getDensityOptimizer()`
- `getMediaPlan()`
- `getVisualizationPlan()`
- `getLaboratoryPlan()`
- `getTransitionMap()`

## Visualization Selection Rules

Visualization appears only when:
- Visual explanation > text explanation
- Concept has strong visual affinity
- Visualization layer is included in plan
- Suitable visualizations exist in registry

**Strong Affinity Concepts:**
- word-embeddings (vector space)
- self-attention (attention weights)
- gradient-descent (loss surfaces)
- pca (dimensional projection)
- bayes-theorem (probability regions)
- linear-models (regression lines)

**Maximum:** 2 visualizations per explanation

## Laboratory Selection Rules

Laboratory appears when:
- Interaction > passive observation
- Concept has laboratory affinity
- Laboratory layer is included in plan
- Suitable laboratories exist in registry

**Strong Affinity Concepts:**
- gradient-descent (exploration)
- pca (experiment)
- word-embeddings (exploration)
- self-attention (guided_practice)
- bayes-theorem (experiment)

**Maximum:** 1 laboratory per explanation

## Media Timeline

Deterministic timeline generation:

```
Motivation
    |
    v
Core Concept
    |
    v
Visualization
    |
    v
Mathematics
    |
    v
Example
    |
    v
Laboratory
    |
    v
Summary
    |
    v
Forward Links
```

## Transition Requirements

Every media insertion requires:
- Why now?
- What dependency?
- Expected learning purpose?
- Evidence source?

## Density Optimization

**Avoids:**
```
Visualization
Visualization
Visualization
```

**Instead:**
```
Concept
    |
    v
Visualization
    |
    v
Example
    |
    v
Mathematics
    |
    v
Laboratory
    |
    v
Summary
```

## Evidence Expansion

Evidence now includes:
- Concept IDs
- Artifact IDs
- Visualization IDs
- Laboratory IDs
- Shared Knowledge IDs
- Selection Reason
- Placement Reason
- Score Values

## Determinism

**Forbidden:**
- Math.random
- Date.now ordering
- LLM decisions
- Popularity ranking
- Usage statistics
- Hidden heuristics

Media plans are identical for identical inputs.

## Performance

- Visualization scoring: <10 ms
- Laboratory scoring: <10 ms
- Media orchestration: <15 ms
- Total overhead: <40 ms

## Accessibility

Generated plans preserve:
- Screen reader compatibility
- Semantic headings
- Keyboard navigation
- Non-color communication
- Visualization alternative descriptions

## Governance

**Forbidden:**
- Modifying visualization registry
- Modifying laboratory registry
- Modifying curriculum
- Learner inference
- Mastery estimation
- Adaptive recommendations
- Cloud services

## Validators

- `nv-1300-d1c-validator.js` — Structural validation
- `nv-1300-d1c-verify.js` — Deterministic verification

## Future Extension Points

- Additional visualization types
- Additional laboratory roles
- Custom scoring dimensions
- Domain-specific affinity rules
- Cross-media dependencies
