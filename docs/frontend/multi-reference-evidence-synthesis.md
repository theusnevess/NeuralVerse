# Multi-Reference Evidence Synthesis

## Purpose

`NV-500-UX-007E.11` adds a Multi-Reference Evidence Synthesis layer that allows users to synthesize evidence from the current Compare Set.

It closes the analytical workflow: `Search → Explore → Compare → Synthesize`.

## Evidence Compiler Compatibility

The existing Evidence Compiler remains unchanged.

This phase builds a comparative synthesis payload purely from existing reference metadata, keywords, relationships, current evidence state, and graph context.

No multi-reference compiler method is added. No compiler contract is changed.

## Synthesis Payload

JavaScript builds a plain serializable `compareSynthesis` payload from the compare set:

- `compareSet`: compared references with metadata.
- `summary`: templated text summary grounded in visible metadata.
- `sharedSupport`: references contributing shared concepts or overlapping relationships.
- `divergentNotes`: unique concepts and relationships per reference with deterministic notes.
- `contributionMap`: per-reference contribution levels (Primary/Supporting/Minor/Context).
- `confidence`: qualitative confidence label (High/Moderate/Limited Support) with rationale.
- `provenance`: reference count, concept count, relationship overlap count, evidence source count.
- `export-ready block`: text block suitable for future copy.

Rules:
- No AI-generated claims.
- No fake metrics or percentages.
- No unsupported confidence precision.

## Confidence Derivation

Deterministic rules:
- **High Support**: at least 2 shared concepts AND (at least 2 overlapping relationship patterns OR at least 1 evidence overlap).
- **Moderate Support**: at least 1 shared concept OR relationship overlap OR evidence overlap.
- **Limited Support**: minimal overlap.

## Persistence

`compareSynthesis` is persisted as an optional key inside `neuralverse.retrievalWorkspace.v1` localStorage state. Backward-compatible: defaults to null when absent.

## Actions

- `Compile Evidence from Compare Set` — builds synthesis payload.
- `Recompile Synthesis` — rebuilds with current state.
- `Clear Synthesis` — clears the synthesis.
- `Copy Block` — copies export-ready text block.
- `Open Reference` — selects a support reference.
- `Pin / Unpin` — toggles pin on support reference.
- `Return to Compare` — navigates back to compare.
- `Export Snapshot` — visible but disabled (future).

## Placement

The synthesis panel renders inside the Compare Workspace, between the Convergence Line and the Matrix columns.

## Ownership Boundary

JavaScript owns compare set, payload aggregation, callbacks, workspace state, persistence, and Evidence Compiler invocation paths.

React renders synthesis presentation only.

```text
Data in. Callbacks out. No domain ownership.
```

## Forbidden Responsibilities

- No Evidence Compiler contract changes.
- No Retrieval contract changes.
- No AI/LLM calls.
- No fake metrics or scores.
- No React-owned state or localStorage access.
- No router changes.

## QA Requirements

- Build the React bundle with `npm run build`.
- Run the retrieval runtime tests (53/53).
- Test compile from compare set with 2-4 references.
- Verify shared support, divergent notes, contribution map, confidence, and export block.
- Verify low-overlap state renders correctly.
- Verify reload persistence.
- Validate no horizontal overflow at 390, 768, 1024, 1440 px.
- `console.error = 0`, `failed requests = 0`.
