# Comparative Research Mode

## Purpose

`NV-500-UX-007E.10` evolves the Semantic Compare Workspace into a persistent, investigation-aware **Comparative Research Mode**.

Comparison becomes part of the continuous research workflow, not an isolated panel.

## Context

Extends the E.9 `NvCompareWorkspace` island with convergence analysis, semantic diffs, evidence overlap display, bidirectional graph sync, and persistent compare state.

## Compare Persistence

Compare selection (`compareSelection`) and feedback (`compareFeedback`) are persisted within the existing `neuralverse.retrievalWorkspace.v1` localStorage key.

No schema migration is required. Fields are optional; legacy payloads without the fields default to empty selection.

## Convergence Line

A visual center section shows shared analytical context across compared references:

- Shared concepts from reference keywords.
- Shared relationship types from existing relationship data.
- Common graph neighborhood labels, derived from adjacent references shared by all compared items.
- Shared evidence reference IDs when active evidence exists.

## Semantic Diff Sections

Displays unique aspects per compared reference:

- Unique concepts not shared by other compared references.
- Unique relationship types not shared across the set.
- Unique connected references available only to the specific reference.

Empty states are explicit (`No shared concepts detected from current metadata.`) rather than vague blank sections.

## Evidence Overlap

When active evidence exists:

- Shows which compared references contribute to the current evidence.
- Shows qualitative contribution labels (Primary, Supporting, Not used).
- Displays evidence-only absent state clearly when no evidence exists.

When no evidence exists: `No active evidence compilation. Compile evidence to compare support context.`

## Bidirectional Graph Synchronization

### Compare -> Graph

- `Focus in Graph` action selects the reference and switches to graph mode.
- Does not reset zoom/pan unnecessarily.

### Graph -> Compare

- Graph node context actions expose `Add to Compare` / `Already in Compare`.
- Existing E.9 entry points preserved.

Graph layout algorithm remains unchanged.

## Saved Compare Sets

Deferred to future phase. Current implementation returns `null` from `NvCompareSetManager`.

## Actions

- `Open Reference`
- `Pin / Unpin`
- `Compile Evidence` (single-reference compiler path)
- `Compile from Set` (triggers compile from current query if available)
- `Focus in Graph`
- `Remove`
- `Clear Compare`

## Ownership Boundary

JavaScript owns compare selection, add/remove/clear, payload derivation, graph sync callbacks, localStorage persistence, and entry point wiring.

React owns rendering, local expansion toggles, visual grouping, and button rendering.

```text
Data in. Callbacks out. No domain ownership.
```

## Forbidden Responsibilities

- No Evidence Compiler contract change.
- No Graph logic change.
- No Router change.
- No fake semantic scores, embeddings, or AI summaries.
- No new persistence schemas.

## QA Requirements

- Build the React bundle with `npm run build` in `react-build`.
- Run the retrieval runtime tests (53/53).
- Test compare persistence after reload.
- Test graph sync focus action.
- Validate convergence line, semantic diff, evidence overlap rendering.
- Validate no horizontal overflow at 390, 768, 1024, and 1440 px.
- Verify `console.error = 0` and `failed requests = 0`.
- Verify `git diff --check` passes.
