# Research Dashboard Components

## Components

| Component | Responsibility |
|---|---|
| `NvWorkspaceSnapshot` | Top-level dashboard island |
| `NvSessionStatus` | Compact session state and progress |
| `NvResearchStats` | Pinned, recent, saved query, evidence, and trail counts |
| `NvKnowledgePulse` | Current investigation summary and microvisual signals |
| `NvActivityTimelineMini` | Compact recent activity trail |

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

## Accessibility

- The dashboard uses a labelled `section`.
- The mini timeline is an ordered list.
- Stats expose text labels.
- Icons are decorative unless paired with accessible text.
- The empty-state CTA is a semantic button.

## Reuse Guidelines

Future dashboard additions should extend the serializable payload rather than reading domain state inside React.

The ownership rule remains:

```text
Data in. Callbacks out. No domain ownership.
```
