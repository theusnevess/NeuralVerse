# Living Research Workspace

## Purpose

`NV-500-UX-007E.8` turns the top Retrieval Workspace snapshot into a compact research status surface.

It answers what is being investigated, what changed recently, how much context exists, current research health, and what can continue now.

## Ownership

Existing JavaScript owns state, actions, persistence, retrieval behavior, graph behavior, evidence compilation, and routing.

React owns presentation only through `NvWorkspaceSnapshot` and its child components.

```text
Data in. Callbacks out. No domain ownership.
```

## Payload Contract

The JavaScript controller builds a plain serializable payload with:

- `activeInvestigation`: current query, selected reference, focused cluster, exploration depth, active mode, and last event label.
- `researchHealth`: evidence, unique visited references, pinned references, saved queries, trail events, and derivable subgraph density label.
- `timeline`: up to five compact Knowledge Trail events.
- `pulse`: existing microvisualization HTML plus text summaries for trail, progress, connectivity, and confidence when available.
- `actions`: booleans that decide which quick actions render.

## Callback Contract

React receives callbacks and never mutates workspace state directly:

- `onResumeInvestigation`
- `onCompileCurrentEvidence`
- `onSaveQuery`
- `onOpenPinned`
- `onClearSession`
- `onOpenTimelineEvent`

## Valid Actions

Only currently valid actions render. `Export Snapshot` is intentionally absent and remains future work.

## Fallback Behavior

`renderResearchSnapshot()` writes compact fallback HTML before React enhancement. If the React bridge or bundle fails, the fallback still shows the current query or selected reference and session artifact count.

## Forbidden Responsibilities

- No Retrieval Engine changes.
- No Evidence Compiler changes.
- No Reference Registry changes.
- No Relationship Graph changes.
- No router changes.
- No persistence schema changes.
- No React-owned localStorage reads or writes.
- No fabricated quality scores or analytics.

## QA Requirements

- Build the React bundle with `npm run build` in `react-build`.
- Run the retrieval runtime tests.
- Smoke-test `#/retrieval-playground` and the existing routes.
- Validate 390, 768, 1024, and 1440 px viewports for no horizontal overflow.
- Verify dashboard updates after search, reference selection, pin/unpin, evidence compile, saved query, reload, and clear session.
- Verify invalid actions are hidden.
- Verify `git diff --check` passes.
