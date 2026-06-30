# D6-OPT-01 — Narrative Contract & Registry Kernel

## Purpose

This optimization establishes the canonical structural foundation of the **Narrative Agent** (D6). It defines the deterministic registry responsible for representing governed narrative units inside NeuralVerse.

The Narrative Agent transforms governed technical knowledge into coherent, memorable, and pedagogically effective learning narratives. It does **not** invent knowledge, define curriculum dependencies, create canonical facts, or generate lesson prose. It only models narrative metadata and narrative structure.

## Architecture

```
src/agents/narrative-pipeline/
  NarrativeAgentContract.ts    — Canonical type system
  NarrativeKernel.ts           — Composition functions & helpers
  NarrativeValidation.ts       — Deterministic validation layer
  NarrativeKernel.test.ts      — Test suite (~50 tests)
  index.ts                     — Public API barrel
```

## Narrative Philosophy

```
Narrative improves comprehension.
Narrative must never override correctness.
```

The selected narrative frame changes presentation. It never changes canonical meaning.

## Narrative Unit Model

A narrative unit represents structural narrative metadata. Fields include:

- `narrativeId` — unique identifier
- `title` — descriptive title
- `unitType` — one of 10 canonical narrative unit types
- `narrativeMode` — one of 8 canonical narrative modes
- `domain` — one of 10 canonical knowledge domains
- `status` — one of 6 canonical narrative statuses
- `canonicalKnowledgeId` — references governed knowledge
- `curriculumNodeId` — references curriculum structure
- `lessonId` — references didactic placement
- `laboratoryId` — optional, metadata-only
- `sequenceOrder` — deterministic ordering
- `summary` — metadata, not final lesson prose
- `tags` — categorization tags
- `provenance` — mandatory governance metadata

## Narrative Mode Model

Eight canonical narrative modes correspond to the Narrative Agent's multiple narrative style capabilities:

1. `historical_discovery` — framing through historical development
2. `engineering_problem` — framing through practical challenges
3. `scientific_investigation` — framing through investigation
4. `industrial_case_study` — framing through real-world applications
5. `everyday_analogy` — framing through familiar comparisons
6. `step_by_step_construction` — framing through incremental building
7. `failure_driven_explanation` — framing through failure analysis
8. `research_evolution` — framing through research progression

## Registry Model

The `NarrativeRegistry` stores narrative units only. It contains:

- `narratives` — sorted narrative units
- `registryMetadata` — counts and metadata
- `trace` — deterministic trace metadata

Deterministic sorting: `narrativeId` → `unitType` → `sequenceOrder` → `title`. No insertion-order dependence.

## Provenance Model

Every narrative unit requires provenance with:

- `source` — origin of the narrative metadata
- `governanceStatus` — canonical governance status
- `providedBy` — responsible entity
- `rationale` — justification for the narrative framing

Missing provenance fails validation.

## Deterministic Guarantees

- All composition functions are pure with no side effects
- Trace metadata declares `deterministic: true`, `randomUsed: false`, `timeDependency: false`
- No timestamps, runtime identifiers, or clocks in trace metadata
- Input arrays are copied before sorting: `[...items].sort(...)`
- All public interfaces use `readonly`

## Validation Strategy

- Never throws exceptions for expected validation failures
- Always returns structured `NarrativeValidationError[]`
- Uses stable validation codes (e.g., `NARRATIVE_DUPLICATE_ID`)
- Covers: unit type, mode, domain, status, governance status, provenance, canonical references, sequence order, duplicate detection, registry emptiness, trace integrity

## Non-Responsibilities

This optimization does NOT implement:

- Multiple narrative style orchestration
- Problem-origin framing
- Historical timeline construction
- Incremental construction engine
- Application-driven context
- Laboratory-synchronized narrative
- Cross-module continuity
- Lesson closure synthesis
- Narrative certification
- Public facade
- LLM generation
- Lesson prose generation
- Unsupported historical claims
- Curriculum sequencing
- Knowledge creation or rewriting

These belong to later D6 optimizations.

## Relationship with D1–D5

D6 consumes governed outputs from:

- Shared Knowledge Infrastructure
- Obsidian & Knowledge Governance Agent (D5)
- Knowledge Agent (D5)
- Research Agent (D2)
- Application Agent (D4)
- Curriculum & Dependency Agent (D3)
- Didactic Architecture Agent (D1)
- Concept Layer
- Laboratory Agent (D4)
- Parametric Visualization System

D6 produces:

- Narrative openings
- Conceptual motivation
- Historical framing
- Problem-solution framing
- Transitions
- Lesson closures
- Cross-module continuity
- Narrative metadata

## Public API

### Constants

- `CANONICAL_NARRATIVE_UNIT_TYPES` — 10 values
- `CANONICAL_NARRATIVE_MODES` — 8 values
- `CANONICAL_NARRATIVE_DOMAINS` — 10 values
- `CANONICAL_NARRATIVE_STATUS` — 6 values
- `CANONICAL_GOVERNANCE_STATUSES` — 5 values

### Composition Functions

- `composeNarrativeProvenance()`
- `composeNarrativeUnit()`
- `composeNarrativeTrace()`
- `composeNarrativeArtifact()`
- `composeNarrativeRegistry()`
- `composeNarrativeRegistryFromInput()`
- `composeNarrative()`

### Helper Functions

- `isSupportedNarrativeUnitType()`
- `isSupportedNarrativeMode()`
- `isSupportedNarrativeDomain()`
- `isSupportedNarrativeStatus()`
- `isSupportedNarrativeGovernanceStatus()`
- `getCanonicalNarrativeUnitTypes()`
- `getCanonicalNarrativeModes()`
- `getCanonicalNarrativeDomains()`
- `getCanonicalNarrativeStatuses()`
- `getCanonicalNarrativeGovernanceStatuses()`

### Validation Functions

- `validateNarrativeUnit()`
- `validateNarrativeRegistry()`
- `validateNarrativeInput()`
- `validateNarrativeTrace()`
- `validateNarrativeArtifact()`

## Future D6 Extensions

- D6-OPT-02: Multiple narrative style orchestration
- D6-OPT-03: Problem-origin framing
- D6-OPT-04: Historical timeline construction
- D6-OPT-05: Incremental construction engine
- D6-OPT-06: Application-driven context
- D6-OPT-07: Laboratory-synchronized narrative
- D6-OPT-08: Cross-module continuity
- D6-OPT-09: Lesson closure synthesis
- D6-OPT-10: Narrative certification & public facade
