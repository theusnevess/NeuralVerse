# Knowledge Graph Visual Redesign

## Problem

The Graph view in UI10C functioned with the correct stage model but looked visually flat: small card fills, grid-like placement, thin typography, and an overall debug-board feel. Nodes resembled UI buttons rather than premium knowledge cards.

## Before/After Summary

| Aspect | Before (UI10C) | After (UI10D) |
|---|---|---|
| Card fill | Flat solid color | SVG linear gradient |
| Shape | Sharp corners (rx=18/14/12/8) | Same, but with gradient depth |
| Overview layout | Strict CSS grid (3 columns) | Golden-angle spiral (organic) |
| Path card size | 390x132 | 400x140 |
| Module card size | 270x90 | 280x96 |
| Lesson card size | 220x70 | 230x74 |
| Artifact card size | 172x52 | 180x56 |
| Path title font | 14px | 16px |
| Module title font | 12px | 14px |
| Lesson title font | 11px | 12px |
| Artifact title font | 10px | 11px |
| Hover | brightness(1.2), translateY(-2px) | scale(1.02), stronger glow |
| Selected glow | opacity 0.55, blur 6px | opacity 0.7, blur 10px, scale(1.06) |
| Count badges | M, L, A only | M, L, A + Reviewed/total |
| Stage navigation | getParent for Back | stageHistory stack for Back |
| Spacing | ROW_GAP=250, COL_GAP=330 | ROW_GAP=260, COL_GAP=360 |

## Stage-Based Model

Overview → golden-angle spiral of large path cards. Each path card shows title, type label, and three count badges (M=modules, L=lessons, A=artifacts) plus a reviewed-status badge.

Path focus → hero path card above, module cards arranged in an arc below.

Module focus → parent path card above (medium opacity), hero module card centered, sibling modules on the sides (dimmed), lesson cards in arc below.

Lesson focus → parent module card above, hero lesson card centered, sibling lessons dimmed on the sides, artifact cards in arc below.

Artifact focus → parent lesson card above, hero artifact card centered, siblings and dependencies in arc below.

## Visual Design Decisions

- **Gradients**: subtle top-left to bottom-right linear gradients per type give cards depth without neon or toy-like styling.
- **Spiral overview**: the golden-angle spiral distributes 19 path cards across the canvas without a rigid grid, creating a scientific atlas feel.
- **Font sizes**: all visible labels are >= 11px; path and module labels are >= 14px for readability at default zoom.
- **Hover elevation**: cards scale to 1.02 with a brighter glow, preserving the premium feel without sudden jumps.
- **Selected state**: cards scale to 1.06 with a strong glow and thicker stroke so the active node is unmistakable.
- **Count badges**: compact monospace chips with type prefixes (M, L, A) followed by numbers, plus a green-tinted Reviewed count.
- **Edges**: not rendered in overview; in focused stages, contains edges are curved between parent and children rows.

## Interaction Behavior

- Click any card → changes to that card's stage (focus + select).
- `Back` button → pops the stageHistory stack, returning to the previous stage.
- `Overview` button → resets all state, returns to full atlas.
- `Search` → finds node, switches to correct stage, expands ancestors, centers target.
- `Open resource` → navigates to curriculum route.

## Responsive Behavior

- 1440px → full atlas with spiral, workspace with right inspector.
- 1024px → narrower inspector (20rem).
- 768px → single-column workspace, inspector below canvas, legend hidden.
- 520px → toolbar collapses behind "Graph Controls" details toggle.
- 390px → no overflow, compact toolbar, inspector as bottom section.

## Accessibility Validation

- Single `h1` per page.
- At most one `aria-current="page"`.
- SVG nodes are `<g role="button" tabindex="0">` with aria-label.
- Enter/Space activate focused node.
- Arrow keys move focus between visible nodes.
- Keyboard focus-visible ring on cards.
- Fallback text list with focus buttons.
- `prefers-reduced-motion` disables all transitions and animations.

## Performance Validation

- Overview renders only path nodes (max ~19), no edges.
- Focus stages render only the local neighborhood (10-15 nodes max).
- No force simulation or continuous animation loop.
- Stale SVG roots destroyed on route change.
- Controller clears stageHistory on reset.
- Duplicate event listeners prevented by renderer destroy/rebuild.

## Playwright Results

`scripts/nv-900-ui10d-visual-audit.js` validates:
- Overview shows only path cards
- All path cards >= 240px wide, >= 100px tall on desktop
- >= 90% of visible labels have font-size >= 11px
- Path/module labels >= 14px
- Path stage shows modules
- Module stage shows lessons
- Lesson stage shows artifacts
- Artifact stage shows neighborhood
- Back returns to previous stage
- Reset returns to overview
- Search focuses artifact stage
- No horizontal overflow at 1440, 1024, 768, 390
- Single h1
- Single aria-current="page"
- Keyboard focus and Enter activation
- Reduced motion respected
- Inspector has content
- 0 console.error, pageerror, failed requests

## Screenshots

Saved under `/tmp/neuralverse-graph-redesign`:
- graph-before-1440.png
- graph-after-1440.png
- graph-after-1024.png
- graph-after-768.png
- graph-after-390.png
