# React Component Catalog

## NV-500-UX-007E.2 — Shared Presentation Primitives

All shared React island presentation primitives live in `react-build/src/components.jsx`.

---

## Component Index

| Component | File | Status | Description |
|---|---|---|---|
| `NvScientificIcon` | `react-build/src/components.jsx` | ✅ v1 | CSS-mask scientific icon |
| `NvButton` | `react-build/src/components.jsx` | ✅ v1 | Token-driven button |
| `NvBadge` | `react-build/src/components.jsx` | ✅ v1 | Status badge |
| `NvChip` | `react-build/src/components.jsx` | ✅ v1 | Inline label chip |
| `NvMetric` | `react-build/src/components.jsx` | ✅ v1 | Single metric display |
| `NvMicroViz` | `react-build/src/components.jsx` | ✅ v1 | Pre-rendered HTML wrapper |
| `NvCardShell` | `react-build/src/components.jsx` | ✅ v1 | Card container |
| `NvEmptyState` | `react-build/src/components.jsx` | ✅ v1 | Empty state block |
| `NvSectionHeader` | `react-build/src/components.jsx` | ✅ v1 | Section title with line |

---

## NvScientificIcon

Maps to the existing `--nv-scientific-icon-url` CSS mask pattern.

```javascript
NvScientificIcon({
  iconPath: "assets/icons/scientific/inspector/reference-details.svg",
  size: "md",   // "sm" | "md" | "lg"
  label: "Reference details icon",  // omit for decorative icons
})
```

---

## NvButton

Maps to `.nv-button[data-variant]`.

```javascript
NvButton({
  variant: "primary",   // "primary" | "secondary" | "ghost"
  onClick: handleClick,
  disabled: false,
  children: "Open Reference",
  ariaLabel: "Open reference details",
})
```

---

## NvBadge

Maps to `.nv-badge[data-variant]`.

```javascript
NvBadge({
  variant: "info",   // "info" | "success" | "warning" | "error" | "neutral"
  children: "paper",
})
```

---

## NvChip

Maps to `.continuation-chip` (accent) or `.nv-chip` (default).

```javascript
NvChip({
  variant: "accent",   // "default" | "accent"
  onClick: handleClick,  // renders as <button> when provided
  children: "neural networks",
})
```

---

## NvMetric

Inline metric label, maps to `.nv-hover-preview__metrics span`.

```javascript
NvMetric({ label: "14 relationships" })
NvMetric({ label: "High relevance" })
```

---

## NvMicroViz

Thin wrapper for pre-rendered microvisualization HTML from the JS layer.

> ⚠️ Never pass untrusted HTML. This accepts only output from NeuralVerse's own
> rendering functions (renderRelevanceMeter, renderConnectivityScore, etc.).

```javascript
NvMicroViz({
  html: renderRelevanceMeter("High relevance"),
  ariaLabel: "Reference microvisualizations",
})
```

---

## NvCardShell

Maps to `.nv-card[.nv-card--selected]`.

```javascript
NvCardShell({
  selected: true,
  onClick: handleClick,
  role: "article",
  ariaLabel: "Reference: Attention is All You Need",
  children: <...>,
})
```

---

## NvEmptyState

Maps to `.nv-empty-state` pattern.

```javascript
NvEmptyState({
  icon: "🕸️",
  title: "No Selected Reference",
  subtitle: "Select a reference from the registry to explore its topology.",
  actions: <NvButton variant="secondary">Browse Registry</NvButton>,
})
```

---

## NvSectionHeader

Maps to `.discovery-section-title` with its `::after` decorative rule.

```javascript
NvSectionHeader({
  label: "Related References",
  trailing: <NvBadge variant="info">4</NvBadge>,
  level: 4,
})
```

---

## Component Rules

All components in this catalog must:

1. Accept only plain props (no DOM refs, no React context)
2. Be stateless whenever possible
3. Use only existing CSS classes — never hardcode colors or spacing
4. Be independently importable
5. Compose via children, not inheritance
6. Support `className` passthrough for layout adjustments
7. Include an `ariaLabel` or forward aria attributes where needed
