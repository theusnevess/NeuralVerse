# NV-1300-D1A — Core Didactic Planning Engine

**Version:** 1.0
**Status:** READY
**Date:** 2026-06-26

## Purpose

Transform the Didactic Architecture Agent (NV-1000-A1) from a direct response generator into a deterministic pedagogical planner. The agent must now build a structured instructional plan before producing any didactic response.

## Architecture

```
User Prompt
  → Intent Detection
  → Context Extraction
  → Pedagogical Planner
    → Composition DAG
    → Instructional Layer Selection
    → Difficulty Preset Application
    → Perspective Selection
    → Evidence Traceability
  → Response Assembly from Plan
  → Plan Metadata Attached
```

## Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `website/scripts/agents/pedagogical-planner.js` | Core deterministic planner | ~280 |
| `website/scripts/agents/composition-graph.js` | DAG representation, validation, topological sort | ~195 |
| `website/scripts/agents/instructional-layers.js` | 10-layer system with deterministic skip rules | ~230 |
| `website/scripts/agents/difficulty-ladder.js` | 4 depth presets | ~195 |
| `website/scripts/agents/multi-perspective-engine.js` | 8 presentation modes | ~270 |
| `scripts/nv-1300-d1a-verify.js` | 150+ validation checks | ~400 |
| `docs/architecture/nv-1300/nv-1300-d1a-core-didactic-planning.md` | This document | — |

## Files Modified

| File | Changes |
|------|---------|
| `website/scripts/agents/didactic-architecture-agent.js` | Added planner imports, initialization, plan building in `run()`, plan metadata attachment, new API exposure |
| `website/scripts/app.js` | Bumped agent import version for cache invalidation |

## Planner Schema

### Input

```javascript
{
  query: string,
  intent: string,
  mode: string,
  topic: string,
  difficulty: "essentials" | "standard" | "deep_dive" | "research_notes",
  perspective: "intuitive" | "visual" | "mathematical" | "engineering" |
               "implementation_first" | "historical" | "research" | "analogy_driven",
  availableResources: {
    concepts: [],
    artifacts: [],
    visualizations: [],
    laboratories: [],
    sharedKnowledge: []
  },
  conceptIds: string[]
}
```

### Output

```javascript
{
  id: string,                    // deterministic: "plan-didactic-{difficulty}-{topic-slug}"
  topic: string,
  intent: string,
  mode: string,
  difficulty: string,
  selectedPerspective: string,
  layers: [{ id, label, purpose, complexity }],
  sections: [{ id, label, type, included, content, metadata }],
  evidence: [{ layerId, sourceType, sourceId, reason }],
  warnings: string[],
  omissions: [{ layerId, reason, severity }],
  graph: { valid, nodes, edges, errors, sorted },
  generatedAt: null              // deterministic requirement
}
```

## Composition DAG

The canonical section order defines the pedagogical flow:

```
Motivation
  → Context
    → Intuition
      → Core Explanation
        → Visualization
          → Mathematics
            → Algorithm
              → Implementation
                → Laboratory
                  → Misconception
                    → Assessment
                      → Summary
                        → Forward Connections
```

### Graph Properties

- **Cyclic check:** DFS-based cycle detection
- **Topological sort:** Kahn's algorithm (stable, deterministic)
- **Validation:** Duplicate node detection, dangling edge detection, self-loop detection
- **Determinism:** Same sections always produce the same graph

## Instructional Layers

| # | Layer | Purpose | Complexity | Default Skip Rules |
|---|-------|---------|------------|-------------------|
| 1 | motivation | Why this matters | 1 | Never skipped |
| 2 | context | Curriculum position | 1 | Never skipped |
| 3 | intuition | Mental models before formalism | 2 | Never skipped |
| 4 | core_explanation | Canonical explanation | 3 | Never skipped |
| 5 | visualization | Spatial/parametric understanding | 3 | Skipped if no viz resource |
| 6 | mathematics | Formulas and derivations | 4 | Skipped at essentials difficulty |
| 7 | algorithm | Computational steps | 4 | Skipped at essentials difficulty |
| 8 | implementation | Code patterns | 5 | Skipped at essentials; skipped at standard without lab |
| 9 | laboratory | Interactive experimentation | 5 | Skipped if no lab resource |
| 10 | limitations_tradeoffs | Failure modes and alternatives | 3 | Skipped at essentials difficulty |

Each skipped layer produces an omission record with reason and severity.

## Difficulty Presets

| Preset | Allowed Layers | Max Words/Section | Emphasis |
|--------|---------------|-------------------|----------|
| **essentials** | motivation, intuition, core_explanation, summary | 150 | Analogies, intuition, minimal formalism |
| **standard** | All 13 layers (resource-dependent) | 300 | Balanced coverage |
| **deep_dive** | All 13 layers | 500 | Mathematics, algorithms, implementation |
| **research_notes** | All 13 layers | 600 | Research papers, limitations, open questions |

**Critical rule:** Presets represent explanation depth, NOT learner ability. No learner inference.

## Multi-Perspective Engine

| Perspective | Emphasis Layers | Deemphasis Layers |
|------------|----------------|-------------------|
| intuitive | motivation, intuition, core_explanation, summary | mathematics, algorithm |
| visual | visualization, intuition, core_explanation | mathematics, algorithm |
| mathematical | mathematics, algorithm, core_explanation | motivation, intuition |
| engineering | implementation, limitations_tradeoffs, laboratory | motivation, intuition |
| implementation_first | algorithm, implementation, laboratory | motivation, context |
| historical | context, motivation, core_explanation | implementation, laboratory |
| research | limitations_tradeoffs, forward_connections, context | intuition, motivation |
| analogy_driven | intuition, misconception, core_explanation | mathematics, algorithm |

Each perspective reorders sections by priority while preserving factual content.

## Evidence Traceability

Every included layer references canonical sources:

```javascript
{
  layerId: "visualization",
  sourceType: "visualization",
  sourceId: "attention-head-weights",
  reason: "Visualization resource for layer: visualization"
}
```

Source types: `concept`, `artifact`, `visualization`, `laboratory`, `sharedKnowledge`, `none`

Fallback: If no canonical source exists, evidence entry uses `sourceType: "none"` with explicit reason.

## Governance Rules

The D1A implementation must not:

- Modify canonical knowledge
- Invent curriculum structure
- Estimate learner mastery or competence
- Generate unsupported factual claims
- Replace governed educational sources
- Call cloud services
- Require local LLM
- Mutate user memory or review scheduling

**Forbidden learner-inference terms in runtime UI:** mastery, mastered, competence, competency, proficiency, skill score, IQ, rank, XP, streak, achievement, certified learner, passed learner, failed learner, weakness, strength score.

## Determinism Requirements

For identical input:

- Same plan ID
- Same graph structure
- Same layer order
- Same omitted layers
- Same perspective
- Same response metadata

**Forbidden:** Math.random, Date.now, performance.now (for ordering), network calls, unstable object iteration without sorting.

## Fallback Behavior

| Scenario | Behavior |
|----------|----------|
| Concept data unavailable | Reduced plan with motivation/core/summary; warning added |
| Visualization unavailable | Visualization layer omitted; omission recorded |
| Laboratory unavailable | Laboratory layer omitted; omission recorded |
| Empty query | Safe invalid plan returned with reason |
| Invalid input | Safe invalid plan returned with reason |

## Validation

Run `node scripts/nv-1300-d1a-verify.js` for 150+ checks covering:

- Module existence and factory exposure
- Syntax validation
- Graph DAG validity and cycle detection
- Layer selection correctness
- Difficulty preset application
- Perspective selection
- Deterministic output (1000 iterations)
- No forbidden patterns
- No learner-inference terms
- No curriculum mutation
- No external requests
- Evidence traceability
- Existing agent mode preservation

## Known Limitations

1. **Concept data expansion:** Current 41 concepts limit the planner's ability to resolve prerequisites for many topics. Expansion to 160 concepts (NV-1100-P4A target) will improve plan quality.

2. **Visualization mapping:** The planner discovers visualizations via ParametricRegistry but does not yet perform semantic matching between topic descriptions and visualization concepts.

3. **Laboratory placement:** D1A uses simple availability checks. Advanced placement logic (exploratory vs. guided vs. validation) is deferred to D1B.

## Next Phases

| Phase | Scope |
|-------|-------|
| **D1B** | Laboratory orchestration, advanced lab placement, misconception expansion |
| **D1C** | Memory/Review bridge, evidence tracer, cross-domain connector |
| **D1D** | Generative augmentation (optional local LLM), agent collaboration |
| **D1E** | Full accessibility, cognitive load optimizer, transition generator |
