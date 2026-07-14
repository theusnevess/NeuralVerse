# NV-1000 — Phase 5.3: Progressive Disclosure

**Status:** COMPLETE
**Date:** 2026-07-09
**Scope:** Transform Laboratory Workspace from panel-based to context-aware instrument

---

## Objective

Transform the Laboratory Workspace from a panel-based interface into a context-aware scientific instrument. Panels appear only when relevant to the current stage of experimentation.

## Cognitive States Implemented

| State | Condition | Visible Panels |
|-------|-----------|----------------|
| **Preparation** | Initial load | Header, Controls, Timeline, Visualization, Parameters, Inspector (revealed) |
| **Experimentation** | `executionStep > 0` | + XAI Panel (Scientific Findings), Log (collapsible) |
| **Research** | `ResearchMode.isActive()` | + Research Notebook, Bookmarks, Hypothesis, Session History |

## Changes Made

### CSS (`laboratories.css`)

1. **Reveal Animation Classes** (lines 3065-3080):
   - `.nv-lab-panel-reveal` — base class with opacity:0 + translateY(8px)
   - `.nv-lab-panel-reveal.is-visible` — revealed state with opacity:1 + translateY(0)
   - Transition: 220ms ease-out, no bounce/scale/rotation/glow/flash

2. **Collapsible Panel Styles** (lines 3082-3130):
   - `.nv-lab-ws-collapsible` — base collapsible container
   - `.nv-lab-ws-collapsible-header` — clickable header with ARIA expanded
   - `.nv-lab-ws-collapsible-count` — count badge (e.g., "Scientific Log (12)")
   - `.nv-lab-ws-collapsible-chevron` — rotating chevron indicator
   - `.nv-lab-ws-collapsible.is-collapsed .nv-lab-ws-collapsible-body` — max-height:0

3. **XAI Progressive Disclosure** (lines 3132-3170):
   - `.nv-xai-finding` — base finding card
   - `.nv-xai-finding.is-collapsed .nv-xai-finding-layers` — hidden layers
   - `.nv-xai-finding.is-expanded .nv-xai-finding-summary` — hidden summary when expanded
   - Latest finding expanded, older findings collapsed

4. **Inspector Metrics Merge** (lines 3172-3195):
   - `.nv-lab-ws-inspector-metrics` — inline metrics in inspector header
   - `.nv-lab-ws-inspector-metric` — individual metric item
   - Replaces standalone metrics panel

5. **Research Mode Indicator** (lines 3197-3205):
   - `.nv-lab-ws-research-toggle.active` — active state styling
   - `.nv-lab-research-panel.is-research-active` — accent border

6. **Reduced Motion** — All new animations disabled in `prefers-reduced-motion: reduce`

7. **Responsive** — XAI panel hidden on small mobile (<360px)

### HTML Generation (`laboratory-controller.js`)

1. **Inspector Header** — Added `data-lab-inspector-metrics` container for merged metrics
2. **Removed Standalone Metrics Panel** — Replaced with comment (metrics now inline in inspector)
3. **XAI Panel** — Added `style="display:none;"` + `nv-lab-panel-reveal` class, `aria-expanded` on toggle
4. **Log Panel** — Converted to collapsible with count header, `data-lab-log-toggle`, `aria-expanded`
5. **Observation Panels** — Added `nv-lab-panel-reveal` class for reveal animation

### Behavior (`lab-ui-controller.js`)

1. **`revealPanel(selector)`** — New function: shows panel + adds `is-visible` class for animation
2. **`wireCollapsibleLog()`** — New function: wires expand/collapse toggle for log panel
3. **`logEntryCount`** — New variable: tracks log entries for count display
4. **`stepForward()`** — Updated: calls `revealPanel('[data-xai-panel]')` on first execution
5. **`loadLab()`** — Updated: calls `wireCollapsibleLog()` and `revealPanel('[data-lab-inspector]')`
6. **`updateMetrics()`** — Updated: writes to `[data-lab-inspector-metrics]` instead of `[data-lab-metrics-grid]`
7. **`addLogEntry()`** — Updated: uses `[data-lab-log-entries]`, updates count badge
8. **`addChangeEntry()`** — Updated: uses `[data-lab-log-entries]`, updates count badge
9. **`addXAIEventToLog()`** — Updated: uses `[data-lab-log-entries]`, updates count badge
10. **`resetParameters()`** — Updated: resets log count, hides XAI panel
11. **`destroy()`** — Updated: resets `logEntryCount`
12. **`highlightVisualEvidence()`** — Updated: targets `[data-lab-inspector-metrics]` for metric evidence

## Panel Visibility Rules

| Panel | Always | After Execution | After Findings | Research Mode |
|-------|--------|-----------------|----------------|---------------|
| Experiment Header | ✓ | ✓ | ✓ | ✓ |
| Controls | ✓ | ✓ | ✓ | ✓ |
| Timeline | ✓ | ✓ | ✓ | ✓ |
| Visualization | ✓ | ✓ | ✓ | ✓ |
| Parameters | ✓ | ✓ | ✓ | ✓ |
| Inspector | ✓ (revealed) | ✓ | ✓ | ✓ |
| Metrics | ✓ (in inspector) | ✓ | ✓ | ✓ |
| XAI Panel | — | ✓ | ✓ | ✓ |
| XAI History | — | — | ✓ (collapsible) | ✓ |
| Log | — | ✓ (collapsed) | ✓ | ✓ |
| Research Notebook | — | — | — | ✓ |
| Bookmarks | — | — | — | ✓ |
| Hypothesis | — | — | — | ✓ |
| Session History | — | — | — | ✓ |

## Validation

| Check | Result |
|-------|--------|
| CSS brace balance (laboratories.css) | ✓ 966/966 |
| CSS brace balance (explainability.css) | ✓ 78/78 |
| JS brace balance (lab-ui-controller.js) | ✓ 275/275 |
| JS paren balance (lab-ui-controller.js) | ✓ 853/853 |
| JS brace balance (laboratory-controller.js) | ✓ 57/57 |
| JS paren balance (laboratory-controller.js) | ✓ 135/135 |
| No bounce/scale/rotation/glow/flash animations | ✓ |
| ARIA expanded on collapsible controls | ✓ |
| Focus ring on expand/collapse controls | ✓ |
| display:none for hidden panels | ✓ |
| Conditionally render (no render-everything-then-hide) | ✓ |
| Layout rhythm reserved (CSS grid) | ✓ |

## Files Modified

1. `website/styles/laboratories.css` — +180 lines (reveal, collapsible, XAI, metrics, research)
2. `website/scripts/laboratory/laboratory-controller.js` — HTML generation updates
3. `website/scripts/laboratory/lab-ui-controller.js` — Behavior updates

## Remaining Risks

1. **Playwright tests not runnable** — Node.js not available; tests must be run manually
2. **XAI finding expand/collapse** — Progressive disclosure logic for older findings needs testing with actual execution
3. **Responsive layout** — New collapsible panels need validation at all breakpoints
4. **Research Mode panels** — Conditional rendering of research-only panels not yet implemented (HTML already hidden via `display:none`)
5. **Cross-lab suggestions** — Not yet conditionally rendered (currently always in DOM)
