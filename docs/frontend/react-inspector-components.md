# React Inspector Components

## Canonical Components

| Component | Responsibility |
|---|---|
| `NvInspectorPanel` | Top-level Inspector Island dispatcher |
| `NvReferenceInspectorPanel` | Reference presentation surface |
| `NvEvidenceInspectorPanel` | Evidence synthesis presentation surface |
| `NvRelationshipInspectorPanel` | Relationship presentation surface |
| `NvInspectorHeader` | Scientific title, icon, badge, and metadata header |
| `NvInspectorBadgeRow` | Compact keyword/status badge row |
| `NvInspectorMetricRow` | Wrapper for trusted JS-rendered microvisualization HTML |
| `NvMetricRow` | Compact label/value provenance rows |
| `NvInspectorActionBar` | Shared compact action rendering |
| `NvInspectorDivider` | Token-driven divider primitive |
| `NvInspectorEmptyState` | Inspector-specific empty state wrapper |

## Data Contract

Components receive plain serializable data:

```js
{
  mode: "reference" | "evidence" | "relationship" | "empty",
  reference?: {},
  evidence?: {},
  relationship?: {},
  emptyConfig?: {}
}
```

Callbacks are supplied separately by the host JavaScript:

```js
{
  onPinReference,
  onUnpinReference,
  onCompileEvidence,
  onOpenReference,
  onOpenRelationship,
  onFollowSource,
  onFollowTarget,
  onExploreNeighborhood,
  onReturnToSearch
}
```

## Reuse Rules

- Use `NvInspectorSection` for all Inspector subsections.
- Use `NvInspectorActionBar` for action groups.
- Use `NvMetricRow` for compact provenance and metadata.
- Use `NvInspectorMetricRow` only for trusted NeuralVerse microvisualization HTML.
- Do not create nested cards inside Inspector sections unless the item is a repeated row.

## Visual Rules

- Title first, metadata second, actions after primary context.
- Avoid stacked bordered boxes.
- Keep metrics compact.
- Keep supporting references and lineage rows scan-friendly.
- Icons supplement text and never replace labels.

## Accessibility Rules

- Actions must be buttons.
- Cross-links rendered as rows must have accessible labels.
- Hidden or truncated text must not remove accessible names.
- Focus-visible styling must remain visible through existing token styles.

## Future Reuse

These components are intended for future analytical panels across NeuralVerse, provided the same rule is preserved:

```text
Data in. Callbacks out. No domain ownership.
```
