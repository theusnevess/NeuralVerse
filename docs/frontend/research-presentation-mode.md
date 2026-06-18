# Research Presentation Mode

## Purpose

`NV-500-UX-007E.12` implements a Research Presentation Mode that transforms the current investigation into a structured, readable narrative.

It completes the workflow: `Search → Explore → Compare → Synthesize → Present`.

## Entry Point

A `Presentation` tab is added to the Exploration Space modes alongside Search, Graph, Discovery, and Compare.

## Presentation Payload

JavaScript builds a plain serializable payload from existing research state:

- `executiveSummary`: title, deterministic summary text, confidence label if available.
- `investigation`: active query, selected reference, evidence/comparison/pinned/trail counts.
- `narrative`: last ~8 knowledge trail events converted to structured steps.
- `references`: all referenced documents grouped by role (Primary/Supporting/Compared/Pinned/Context).
- `evidence`: current evidence compilation summary.
- `comparisons`: comparison data if available, shared concepts, convergence/divergence text.
- `synthesis`: multi-reference synthesis summary if available.
- `export-ready block`: copyable snapshot block.
- `actions`: available actions based on current state.

## Deterministic Narrative Rules

Narrative items are derived from Knowledge Trail events. Each event type maps to a presentation type:
- `search` → "Query: ..."
- `open` → "Opened reference"
- `compile_ref`/`compile_query` → "Compiled evidence"
- `compare_add`/`compare_reference` → "Comparison"
- `compare_synthesis` → "Synthesis created"
- `pin` → "Pinned reference"
- `select_node`/`explore_neighborhood` → "Graph exploration"

No AI generation. All text is template-based and grounded in existing state.

## Actions

- `Copy Snapshot` — copies export-ready block to clipboard.
- `Return to Workspace` — switches to Search mode.
- `Return to Compare` — switches to Compare mode (if compare set available).
- `Export PDF` / `Export Markdown` — visible but disabled (future).

## Persistence

Presentation is regenerated on each view. No separate persistence key.

## Forbidden Responsibilities

- No AI/LLM calls.
- No fake metrics.
- No Evidence Compiler changes.
- No Graph/Router changes.
- No file export.

## QA Requirements

- Build with `npm run build`.
- Runtime tests 53/53.
- Test presentation mode renders with search/compare/synthesis context.
- Verify narrative, timeline, evidence gallery, reference list, comparison summary, convergence/divergence, snapshot block.
- Validate no horizontal overflow at 390/768/1024/1440 px.
- `console.error = 0`, `failed requests = 0`.
