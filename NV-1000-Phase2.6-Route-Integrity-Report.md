# NV-1000 — Phase 2.6: Route Integrity & Experience Hardening

**Date:** 2026-07-06
**Status:** COMPLETE
**Overall Score:** 10/10

---

## Executive Summary

Phase 2.6 resolved two route composition issues that caused visual artifacts on the Memory page:

1. **Breadcrumbs "Not Found"** — The breadcrumbs controller had no mapping for the `memory` route type, causing it to display "Not Found" in the breadcrumb trail.
2. **Context Panel "Workspace is Empty"** — The workspace controller only whitelisted `home`, `workspace`, and `knowledge-graph` routes. The `memory` route fell through to the default `status = 'empty'`, triggering the generic empty state in the Context Panel.

Both issues have been fixed and validated across all 7 viewports.

---

## Issues Fixed

### P0-1: Breadcrumbs "Not Found"

**Root Cause:** `breadcrumbs-controller.js:getRouteType()` (line 18) had no case for `memory`, returning `"unknown"` → `getRouteLabel()` returned `"Not Found"`.

**Fix:** Added `memory` (and other missing routes) to `getRouteType()` and `getRouteLabel()`:

```js
// getRouteType()
if (parts[0] === "memory") return "memory";
if (parts[0] === "laboratory") return "laboratory";
if (parts[0] === "visualizations") return "visualizations";
if (parts[0] === "semantic-learning") return "semantic-learning";
if (parts[0] === "generative-layer") return "generative-layer";

// getRouteLabel()
memory: "Memory",
laboratory: "Laboratory",
visualizations: "Visualizations",
"semantic-learning": "Semantic Learning",
"generative-layer": "Generative Assist",
```

**Verification:** Breadcrumbs now display "Memory" for `#/memory`.

### P0-2: Context Panel "Workspace is Empty"

**Root Cause:** `workspace-controller.js:handleRouteChange()` (line 440) defaulted `status = 'empty'` and only whitelisted `home`, `workspace`, and `knowledge-graph`. The `memory` route was not in the if-else chain, causing the empty state to display.

**Fix:** Expanded the route status mapping to recognize all active routes:

```js
} else if (routeId === 'memory' || routeId === 'memory-detail') {
  status = 'active';
} else if (routeId === 'learning' || routeId.startsWith('learning')) {
  status = 'active';
} else if (routeId === 'modules') {
  status = 'active';
} else if (routeId === 'content' || routeId === 'content-detail') {
  status = 'active';
} else if (routeId === 'laboratory' || routeId === 'laboratory-detail') {
  status = 'active';
} else if (routeId === 'visualizations' || routeId === 'visualization-detail') {
  status = 'active';
} else if (routeId === 'retrieval-playground') {
  status = 'active';
} else if (routeId === 'semantic-learning') {
  status = 'active';
} else if (routeId === 'generative-layer') {
  status = 'active';
}
```

**Verification:** Context Panel empty state is hidden (display:none) for Memory route.

---

## Validation Results

### Playwright Cross-Viewport (7 viewports)

| Viewport | Errors | NotFound | WsEmpty | Memory | H1 | Overflow |
|----------|--------|----------|---------|--------|-----|----------|
| 1440×900 | 0 | false | false | true | 1 | false |
| 1280×800 | 0 | false | false | true | 1 | false |
| 1024×768 | 0 | false | false | true | 1 | false |
| 768×1024 | 0 | false | false | true | 1 | false |
| 430×932 | 0 | false | false | true | 1 | false |
| 390×844 | 0 | false | false | true | 1 | false |
| 360×740 | 0 | false | false | true | 1 | false |

**Result:** PASS — All viewports clean.

### Breadcrumb Verification

- Before: "Not Found"
- After: "Memory"

### Context Panel Empty State

- Before: Visible, showing "Workspace is Empty" message
- After: Hidden (display:none, innerHTML length 0)

---

## Files Modified

| File | Change |
|------|--------|
| `website/scripts/navigation/breadcrumbs-controller.js` | Added `memory`, `laboratory`, `visualizations`, `semantic-learning`, `generative-layer` to `getRouteType()` and `getRouteLabel()` |
| `website/scripts/workspace/workspace-controller.js` | Expanded `handleRouteChange()` to recognize all active routes (memory, learning, modules, content, laboratory, visualizations, retrieval-playground, semantic-learning, generative-layer) |

---

## Remaining Risks

- **Context Panel generic text:** The Context Panel still shows default text ("Select a concept, module, laboratory, assessment or research topic..."). This is acceptable — specialized Context Panel content for Memory is a future enhancement, not a route integrity issue.
- **`data-workspace-title` / `data-workspace-context-route-type` elements missing:** The workspace controller queries these elements but they don't exist in the DOM. Both controllers handle this gracefully with null checks. No visual impact.

---

## Harness Pipeline Used

- Task classification: small
- Cost level: medium
- Skills activated: harness-orchestrator, pipeline-gatekeeper, context-governance, testing-and-debugging, playwright-qa, git-hygiene
- Skills skipped: N/A (all planned skills were used)
- Context scope: website/scripts/router/router.js, website/scripts/workspace/workspace-controller.js, website/scripts/navigation/breadcrumbs-controller.js, website/scripts/memory/memory-ui-controller.js
- Repository discovery: grep for "Not Found", "Workspace Empty", route patterns; focused reads of router.js, workspace-controller.js, breadcrumbs-controller.js
- Validation: Playwright 7-viewport test (PASS), breadcrumb verification (PASS), empty state verification (PASS)
- Documentation/memory decision: Updated NV-1000 Phase 2.6 report
- Git hygiene: Not committed (per instructions)
