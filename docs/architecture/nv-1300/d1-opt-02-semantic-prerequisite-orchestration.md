# D1-OPT-02 — Semantic Dependency & Prerequisite Orchestration

## Purpose

Extends the Didactic Agent so lesson composition can detect and represent prerequisite needs deterministically using governed concept/dependency metadata. The Didactic Agent consumes dependency information and uses it to improve lesson sequencing — it does not define, alter, or generate dependency relationships.

## Boundaries

### What This Phase Does

- Defines deterministic types for concept references, prerequisite references, prerequisite status, support actions, and dependency traces.
- Implements a pure `analyzePrerequisites(input, graph)` function that maps governed dependency metadata to prerequisite decisions.
- Integrates prerequisite analysis into `composeLessonPlanWithDependencies` without altering canonical stage order.
- Validates prerequisite decisions, dependency traces, and dependency graph integrity.

### What This Phase Does NOT Do

- Does not define or alter curriculum dependency graphs.
- Does not create alternate learning paths.
- Does not infer learner mastery.
- Does not generate prerequisite explanations as canonical content.
- Does not insert non-canonical stages.
- Does not reorder the 13 canonical stages.
- Does not use LLMs, cloud APIs, randomness, or hidden state.

## Dependency Ownership

The dependency graph is governed externally (e.g., by the Curriculum & Dependency Agent). The Didactic Agent is a **consumer** of this graph, not an author. The `DidacticDependencyGraph` type is a read-only input contract.

## Relationship with Curriculum & Dependency Agent

| Agent | Role | Dependency Graph |
|-------|------|-----------------|
| Curriculum & Dependency Agent | Author/maintainer | Writes and validates |
| Didactic Agent (D1-OPT-02) | Consumer/orchestrator | Reads and acts on decisions |

The Didactic Agent never modifies the dependency graph. It reads prerequisites and produces orchestration metadata (support actions, dependency traces) that inform lesson composition.

## Deterministic Types

### DidacticConceptReference

| Field | Type | Purpose |
|-------|------|---------|
| `conceptId` | `string` | Unique identifier |
| `label` | `string` | Human-readable name |
| `source` | `string` | Governance source |
| `lifecycle` | `'active' \| 'deprecated' \| 'experimental'` | Concept lifecycle status |

### DidacticPrerequisiteReference

| Field | Type | Purpose |
|-------|------|---------|
| `conceptId` | `string` | Prerequisite concept ID |
| `label` | `string` | Human-readable name |
| `dependencyType` | `DidacticDependencyType` | How the prerequisite relates |
| `requiredDepth` | `DidacticRequiredDepth` | How well the prerequisite must be known |
| `rationale` | `string` | Why this prerequisite matters (mandatory) |
| `source` | `string` | Governance source (mandatory) |

### DidacticDependencyType

| Value | Meaning | Support Action when Missing |
|-------|---------|---------------------------|
| `required` | Must be known before proceeding | `block_or_recap_required` |
| `recommended` | Strongly suggested | `insert_recap` |
| `optional_background` | Helpful context | `add_context_note` |
| `enrichment` | Extends understanding | `add_forward_connection` |
| `co_requisite` | Must be learned in parallel | `insert_parallel_context` |

### DidacticRequiredDepth

| Value | Meaning |
|-------|---------|
| `awareness` | Surface-level familiarity |
| `basic_understanding` | Can explain the concept |
| `working_knowledge` | Can apply in simple cases |
| `advanced_understanding` | Can reason about edge cases |
| `mastery` | Can teach and extend |

### DidacticPrerequisiteStatus

| Value | Meaning |
|-------|---------|
| `known` | Present in lesson concept list or encountered list |
| `missing` | Not found anywhere |
| `unknown` | Explicitly marked as unknown (fails validation if used) |

### DidacticPrerequisiteSupportAction

| Value | When Applied |
|-------|-------------|
| `none` | Prerequisite is known |
| `block_or_recap_required` | Required prerequisite is missing |
| `insert_recap` | Recommended prerequisite is missing |
| `add_context_note` | Optional background is missing |
| `add_forward_connection` | Enrichment prerequisite is missing |
| `insert_parallel_context` | Co-requisite is missing |

## Supported Support Actions

The analyzer maps dependency type + status to a support action:

```
required + missing     → block_or_recap_required
recommended + missing  → insert_recap
optional_background    → add_context_note
enrichment + missing   → add_forward_connection
co_requisite + missing → insert_parallel_context
* + known              → none
```

## Pipeline Integration

`composeLessonPlanWithDependencies(input)`:
1. Delegates to `composeLessonPlan(input)` for core stage logic (preserves D1-OPT-01 exactly).
2. If no `dependencyGraph` is provided, returns the base plan unchanged.
3. Analyzes prerequisites deterministically via `analyzePrerequisites`.
4. Builds a `DidacticDependencyTrace` from decisions.
5. Attaches the trace to the plan as `dependencyTrace`.
6. Canonical stage order is never altered.

## Validation Strategy

### Structural Validation (D1-OPT-01)
- Canonical stage order
- No duplicate stages
- No non-canonical stages
- Trace metadata present and correct

### Prerequisite Validation (D1-OPT-02)
- Prerequisite decision without rationale → `PREREQ_DECISION_NO_RATIONALE`
- Missing dependency source → `PREREQ_MISSING_SOURCE`
- Unsupported dependency type → `PREREQ_UNSUPPORTED_DEPENDENCY_TYPE`
- Unsupported requiredDepth → `PREREQ_UNSUPPORTED_REQUIRED_DEPTH`
- Required missing prerequisite with wrong action → `PREREQ_REQUIRED_MISSING_NO_ACTION`
- Unknown prerequisite status → `PREREQ_UNKNOWN_STATUS_TREATED_AS_KNOWN`
- Blocked stage without dependency trace → `BLOCKED_STAGE_NO_DEPENDENCY_TRACE`
- Dependency trace missing conceptId → `DEPENDENCY_TRACE_MISSING_CONCEPT_ID`

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical prerequisite decisions.
2. **No mutation**: Dependency graph, lesson input, and concept data are never modified.
3. **No fabrication**: Missing prerequisites produce orchestration metadata, not explanations.
4. **No inference**: Learner mastery is never inferred or used.
5. **Graph-driven**: All prerequisite decisions are derived from the governed dependency graph.
6. **Traceable**: Every plan with dependencies includes `DidacticDependencyTrace`.

## Out-of-Scope Features

- No UI integration
- No prerequisite explanation generation
- No adaptive prerequisite sequencing
- No learner progress tracking
- No prerequisite graph visualization
- No dynamic dependency graph modification

## Files

| File | Purpose |
|------|---------|
| `DidacticAgentContract.ts` | Extended with prerequisite types |
| `PrerequisiteAnalyzer.ts` | Pure deterministic prerequisite analysis |
| `PipelineComposer.ts` | Extended with `composeLessonPlanWithDependencies` |
| `ValidationLayer.ts` | Extended with prerequisite validation |
| `index.ts` | Public API exports |
| `DidacticPrerequisite.test.ts` | Test suite (10 required + 3 additional) |
