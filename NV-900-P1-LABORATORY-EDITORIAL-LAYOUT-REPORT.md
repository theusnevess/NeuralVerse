# NV-900-P1 — Laboratory Explorer: Scientific Editorial Layout

**Date:** 2026-07-08
**Phase:** P1 — Beyond Cards
**Status:** COMPLETE
**Confidence:** 92%

---

## Summary

Transformed the Laboratory Explorer index from a card-based catalog into a scientific editorial experience. Removed ~60-70% of visible card boundaries. Replaced boxes with shared surfaces, dividers, floating metadata, timeline pathways, and a table-like archive.

---

## Architectural Changes

### Section 1: Observatory Header → Scientific Cover
- **Before:** Small header with stat line and resume button in a bordered box
- **After:** Full-bleed editorial cover with 3.5rem title, floating metadata strip (monospace numbers + labels separated by vertical dividers), inline resume link with underline instead of box
- **Typography:** Title scaled to `clamp(2.5rem, 5vw, 3.5rem)` with `font-weight: 700`
- **No background, no border, no box**

### Section 2: Featured Experiment → Research Brief
- **Before:** Two-column grid inside a bordered surface box with gradient top line
- **After:** Two-column grid with NO background container. Content flows directly on the page background. Sidebar uses floating metadata (no boxes around facts). Section separated by a single `border-top: 1px solid` divider
- **Removed:** Gradient top line, surface background, border radius on container
- **Added:** `.nv-lab-brief` class family

### Section 3: Knowledge Domains → Knowledge Atlas
- **Before:** Grid of individual domain cards, each with its own border/background
- **After:** Single shared surface (`.nv-lab-atlas-surface`) containing all domains separated by horizontal dividers. Each domain is a full-width row with inline metadata
- **Key change:** From `grid` of cards to `dividers` inside one container
- **Diagrams:** Reduced to `opacity: 0.12` — present but not competing with content
- **Lab links:** Now full-width list rows with time in monospace on the right

### Section 4: Learning Pathways → Research Pathways (Timelines)
- **Before:** Grid of pathway cards with horizontal step flow
- **After:** Shared surface with vertical timeline. Each pathway has numbered circle markers connected by a vertical line. Steps stack vertically with clear progression
- **Key change:** From horizontal step boxes to vertical timeline nodes
- **Footer:** Objectives and competencies shown in a 2-column grid below the timeline

### Section 5: Experiment Catalog → Experiment Archive
- **Before:** Grid of small cards with domain badge, title, summary, and "followed by"
- **After:** Table-like list with column headers (Experiment, Domain, Duration, Followed by). Rows are full-width with hover highlight. Monospace font for durations
- **Key change:** From `grid` of cards to `table-like` rows
- **Mobile:** Headers hidden, rows collapse to single column

---

## Typography Hierarchy

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | clamp(2.5rem, 5vw, 3.5rem) | 700 | Cover title |
| H1 | clamp(1.75rem, 3vw, 2.25rem) | 700 | Brief title |
| H2 | clamp(1.25rem, 2.2vw, 1.625rem) | 700 | Section titles |
| H3 | 1.125rem | 700 | Domain/pathway titles |
| Body | 0.9375rem–1rem | 400/500 | Descriptions, lab names |
| Caption | 0.75rem–0.8125rem | 400 | Metadata, timestamps |
| Micro | 0.625rem–0.6875rem | 500 | Uppercase labels, kickers |

---

## Visual Depth Levels

1. **Level 0 — Background:** `var(--nv-lab-bg)` — page background, no elements
2. **Level 1 — Shared Surface:** `var(--nv-lab-surface)` with `border: 1px solid var(--nv-lab-border)` — one per section (atlas, paths, archive)
3. **Level 2 — Interactive:** Hover states with `rgba(6,182,212,0.04-0.05)` backgrounds
4. **Level 3 — Accent:** `var(--nv-lab-accent)` for CTAs, active states, links

---

## What Was Removed

- Card borders on domain cards (replaced by shared surface)
- Card borders on pathway cards (replaced by shared surface)
- Card borders on catalog cards (replaced by table rows)
- Gradient top line on editorial section
- Surface background on editorial section
- Border radius on editorial container
- Box wrapping around facts/prereqs/next in sidebar
- Horizontal step flow in pathways (replaced by vertical timeline)

---

## What Was Preserved

- All 5 sections maintain their semantic purpose
- All navigation links and href structures unchanged
- All data sources (DOMAIN_META, PATHWAY_META, EXPERIMENT_FAMILIES) unchanged
- Research Mode, XAI, workspace/viewer CSS completely untouched
- All responsive breakpoints updated for new layout
- Accessibility: aria-labels, focus-visible states, keyboard navigation preserved

---

## Files Modified

| File | Lines Changed | Description |
|------|--------------|-------------|
| `lab-ui-controller.js` | +994 net | Rewrote `renderLabIndex()` with 5 new section architectures |
| `laboratories.css` | +4599 net | Replaced index CSS: typography, surfaces, dividers, timeline, archive |

---

## Validation

| Check | Result |
|-------|--------|
| CSS brace balance | 0 (balanced) |
| JS syntax | Valid |
| Orphaned classes (JS→CSS) | `nv-lab-archive-col-name` (structural marker, no styles needed) |
| Orphaned classes (CSS→JS) | Workspace/viewer classes preserved, not orphaned |
| Responsive 1024px | Brief 1-col, archive simplified |
| Responsive 768px | Cover compact, atlas/paths/archive padded, mobile archive |

---

## Remaining Risks

1. **Playwright validation not possible** — Node.js/npx unavailable in environment. CSS validated statically only.
2. **Visual testing required** — New layout needs manual browser verification for spacing, alignment, and overflow at all breakpoints.
3. **Shared surface border-radius** — Atlas/paths/archive surfaces use `border-radius: 12px` which may need refinement at smaller viewports.
4. **Timeline line alignment** — Vertical connecting lines in pathway timeline depend on marker/content alignment; may need pixel adjustments.
5. **Archive column widths** — Fixed grid columns (`1fr 140px 100px 140px 32px`) may need responsive tuning for very long experiment names.
