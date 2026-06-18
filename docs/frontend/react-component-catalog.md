# React Component Catalog

## NV-500-UX-007E.2 / E.5 — Shared Presentation Primitives

All shared React island presentation primitives live in `react-build/src/components.jsx`.

---

## Component Index

| Component | File | Status | Description |
|---|---|---|---|
| `NvScientificIcon` | `react-build/src/components.jsx` | ✅ v1 | CSS-mask scientific icon |
| `NvButton` | `react-build/src/components.jsx` | ✅ v1 | Token-driven button |
| `NvActionGroup` | `react-build/src/components.jsx` | ✅ v1 | Token-driven action grouping |
| `NvBadge` | `react-build/src/components.jsx` | ✅ v1 | Status badge |
| `NvChip` | `react-build/src/components.jsx` | ✅ v1 | Inline label chip |
| `NvContributionBar` | `react-build/src/components.jsx` | ✅ v1 | Qualitative contribution microvisualization |
| `NvDiscoveryCard` | `react-build/src/NvDiscoveryCard.jsx` | ✅ v1 | Discovery Panel island card |
| `NvInspectorSection` | `react-build/src/components.jsx` | ✅ v1 | Inspector section wrapper |
| `NvMemoryCard` | `react-build/src/components.jsx` | ✅ v1 | Memory-layer card primitive |
| `NvMetric` | `react-build/src/components.jsx` | ✅ v1 | Single metric display |
| `NvMicroViz` | `react-build/src/components.jsx` | ✅ v1 | Pre-rendered HTML wrapper |
| `NvCardShell` | `react-build/src/components.jsx` | ✅ v1 | Card container |
| `NvEmptyState` | `react-build/src/components.jsx` | ✅ v1 | Empty state block |
| `NvSectionHeader` | `react-build/src/components.jsx` | ✅ v1 | Section title with line |
| `NvStatusPill` | `react-build/src/components.jsx` | ✅ v1 | Compact status label |
| `NvInspectorPanel` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Multi-mode Inspector Island (reference/evidence/relationship/empty) |
| `NvInspectorHeader` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Inspector title + meta row |
| `NvInspectorMetricRow` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Row of pre-rendered microvisualization HTML |
| `NvInspectorActionBar` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Token-mapped inspector action row |
| `NvReferenceInspectorPanel` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Reference mode body for `NvInspectorPanel` |
| `NvEvidenceInspectorPanel` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Evidence mode body for `NvInspectorPanel` |
| `NvRelationshipInspectorPanel` | `react-build/src/NvInspectorPanel.jsx` | ✅ v1 | Relationship mode body for `NvInspectorPanel` |
| `NvMemoryLayer` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Memory Layer Island (four-column footer) |
| `NvMemoryColumn` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Single memory column wrapper |
| `NvPinnedReferenceItem` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Pinned reference card |
| `NvRecentReferenceItem` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Recently viewed reference card |
| `NvSavedQueryItem` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Saved query row with rerun + delete |
| `NvKnowledgeTrailItem` | `react-build/src/NvMemoryLayer.jsx` | ✅ v1 | Knowledge trail event row |
| `NvCompareWorkspace` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Semantic compare workspace island |
| `NvCompareTray` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Selected compare reference tray |
| `NvCompareColumn` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Single compared reference column |
| `NvCompareMatrix` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Responsive metadata comparison grid |
| `NvCompareSection` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Compare section wrapper |
| `NvCompareMetricRow` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Label/value row for compare metrics |
| `NvCompareSharedConcepts` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Shared concepts/types/relationship patterns |
| `NvCompareUniqueRelationships` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Per-reference unique concepts and relationships |
| `NvCompareEvidenceContribution` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Current evidence contribution display |
| `NvCompareGraphPosition` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Graph position and connectivity display |
| `NvCompareActions` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Per-reference compare actions |
| `NvCompareConvergenceLine` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Shared analytical context display |
| `NvCompareSemanticDiff` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Unique concepts/relationships per reference |
| `NvCompareEvidenceOverlap` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Per-reference evidence contribution overlap |
| `NvCompareGraphSyncStatus` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Graph sync information display |
| `NvCompareSetManager` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Saved compare sets manager (deferred) |
| `NvCompareEmptyState` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Compare empty state component |
| `NvCompareSynthesisPanel` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Comparative evidence synthesis panel |
| `NvCompareSynthesisSummary` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Templated synthesis summary |
| `NvCompareSynthesisActions` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Synthesis action buttons |
| `NvSharedSupportReferences` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Shared support reference cards |
| `NvDivergentEvidenceNotes` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Per-reference divergent evidence notes |
| `NvSourceContributionMap` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Contribution level visualization per source |
| `NvSynthesisConfidenceSummary` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Qualitative confidence display |
| `NvExportReadyEvidenceBlock` | `react-build/src/NvCompareWorkspace.jsx` | ✅ v1 | Copy-ready export evidence block |

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

## NvDiscoveryCard

Production island for Retrieval Workspace Discovery Panels.

```javascript
bridge.mount(root, NvDiscoveryCard, {
  data: {
    reference,
    reasonLabel,
    relationshipCount,
    relevanceHtml,
    densityHtml,
    connectivityHtml,
    clusterHtml,
    actions: ["preview", "open", "pin", "compare"],
  },
  callbacks: {
    onAction(action, referenceId) {},
  },
})
```

React owns card layout and local preview disclosure. The JS layer owns opening,
pinning, context menus, hover previews, persistence, and Retrieval state.

---

## NvCompareWorkspace

Production island for Semantic Compare inside Retrieval Workspace Compare mode.

```javascript
bridge.mount(root, NvCompareWorkspace, {
  data: {
    items,
    shared,
    differences,
    graphContext,
    evidenceContext,
    feedback,
    limit: 4,
  },
  callbacks: {
    onOpenReference(id) {},
    onTogglePin(id) {},
    onCompile(id) {},
    onRemove(id) {},
    onClear() {},
  },
})
```

React owns only rendering. JavaScript owns compare selection, payload derivation, retrieval data, evidence data, graph context, and callbacks.

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

---

## NvInspectorPanel

Multi-mode Inspector Island. `data.mode` determines which panel is rendered.

```javascript
// Reference mode
bridge.mount(root, NvInspectorPanel, {
  data: {
    mode: 'reference',
    reference: {
      id, title, type, source, sourceLabel,
      relationshipCount, summary, isPinned,
      keywords, connections, metrics, minimapHtml,
    },
  },
  callbacks: {
    onOpenReference(id) {},
    onPinReference(id) {},
    onUnpinReference(id) {},
    onFollowRelationship(relId) {},
  },
})

// Evidence mode
bridge.mount(root, NvInspectorPanel, {
  data: {
    mode: 'evidence',
    evidence: {
      mode, confidence, confidenceLabel, confidenceExplanation,
      confidenceVariant, summary, confidenceGaugeHtml, coverageStripHtml,
      supportingRefs: [
        { ref, role, contributionLevel, contributionLabel, reasonLabel }
      ],
    },
  },
  callbacks: { onOpenReference(id) {} },
})

// Relationship mode
bridge.mount(root, NvInspectorPanel, {
  data: {
    mode: 'relationship',
    relationship: { id, type, strength, sourceReferenceId, targetReferenceId, context },
  },
  callbacks: {
    onFollowSource(id) {},
    onFollowTarget(id) {},
  },
})
```

React owns inspector section layout, headers, metrics, badges, buttons, contribution bars, empty states.

JS owns all state, selection, actions, persistence.

Callbacks currently used by the Retrieval Workspace host page:

- `onOpenReference(id)`
- `onPinReference(id)`
- `onUnpinReference(id)`
- `onCompileEvidence()`
- `onFollowRelationship(relId)`
- `onFollowSource(id)`
- `onFollowTarget(id)`

---

## NvMemoryLayer

Memory Layer Island. Renders four memory columns.

```javascript
bridge.mount(root, NvMemoryLayer, {
  data: {
    pinned: [{ id, title, type, relationshipCount }],
    recent: [{ id, title, type, relationshipCount }],
    savedQueries: ['neural networks'],
    trail: [{ id, type, label, timestamp }],
    trailSummaryHtml: '',
  },
  callbacks: {
    onOpenReference(id) {},
    onPinReference(id) {},
    onUnpinReference(id) {},
    onRerunQuery(query) {},
    onDeleteQuery(query) {},
    onRestoreTrail(event) {},
    onClearTrail() {},
  },
})
```

React owns column layout, cards, labels, icons, buttons, empty states.

JS owns memory arrays, trail events, saved queries, pin state, localStorage persistence.

Fallback remains the existing `renderMemoryLayer()` HTML in `website/scripts/retrieval-playground.js`. React mounts into `#memory-layer-grid` only after that fallback has been rendered, and `NvMemoryLayer` does not create a nested grid wrapper.
