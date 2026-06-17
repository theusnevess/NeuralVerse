# Research Dashboard Components

## Components

| Component | Responsibility |
|---|---|
| `NvWorkspaceSnapshot` | Top-level dashboard island |
| `NvActiveInvestigation` | Current query, selected reference, cluster, depth, mode, and last event |
| `NvResearchHealth` | Accumulated research context counts and qualitative state |
| `NvResearchHealthMetric` | Accessible compact metric chip |
| `NvSessionTimeline` | Last five meaningful Knowledge Trail events |
| `NvTimelineEventCompact` | Keyboard-accessible compact timeline event |
| `NvKnowledgePulse` | Current investigation summary and microvisual signals |
| `NvSnapshotActions` | Valid quick actions wired to JavaScript callbacks |

## Reused Primitives

- `NvButton`
- `NvBadge`
- `NvMicroViz`
- `NvScientificIcon`

## Visual Rules

- Keep the dashboard compact.
- Do not create a hero banner.
- Prefer readable labels over icon-only meaning.
- Show unavailable values as neutral state, not fake data.
- Use one microvisualization for one concept.
- Hide invalid actions instead of rendering disabled dead controls.
- Use `Starting`, `Building`, `Active`, and `Dense` only as context accumulation labels.

## Accessibility

- The dashboard uses a labelled `section`.
- The session timeline is an ordered list.
- Stats expose text labels.
- Icons are decorative unless paired with accessible text.
- Snapshot actions are semantic buttons with visible focus states.

## Reuse Guidelines

Future dashboard additions should extend the serializable payload rather than reading domain state inside React.

The ownership rule remains:

```text
Data in. Callbacks out. No domain ownership.
```

## Forbidden Responsibilities

- React must not read or write `localStorage`.
- React must not call retrieval, graph, evidence, or registry services directly.
- React must not introduce global state libraries or routing.
- Dashboard components must not fabricate analytics, confidence, density, or quality scores.
