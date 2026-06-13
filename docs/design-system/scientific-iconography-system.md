# Scientific Iconography System

## Purpose

The NeuralVerse scientific iconography system defines the official vector language for research interactions across navigation, retrieval, graph exploration, evidence, memory, collections, inspectors, empty states, badges, and action surfaces.

The system builds on the approved Visual Grammar of Knowledge and SVG Asset System. It does not replace the primitive asset library or introduce a competing visual language.

## Principles

- Icons represent research concepts, not decoration.
- One concept -> one official icon.
- Do not create ad hoc variants for the same meaning.
- Icons supplement nearby text; they must not hide critical meaning.
- State changes are expressed through CSS and context, not duplicate SVG files.
- Scientific clarity is preferred over ornamental detail.
- Legibility at 24px is the primary drawing constraint.

## Icon Families

- Search & Discovery: search, semantic discovery, active query, and exploration entry points.
- Knowledge Graph: clusters, relationships, neighborhoods, and semantic paths.
- Evidence: convergence, synthesis, confidence, verification, and source support.
- Memory & Session: research memory, recent activity, session continuity, and trail history.
- Collections: pinned references, saved queries, reading queue, and organized groups.
- Inspector: metadata, review, annotation, and reference detail concepts.

## Drawing Contracts

Every official scientific icon must use:

- `viewBox="0 0 24 24"`
- `stroke-width="1.75"`
- `stroke-linecap="round"`
- `stroke-linejoin="round"`
- `fill="none"` by default
- `currentColor` for stroke and any meaningful color
- no hardcoded hex, RGB, HSL, or named colors
- no raster images
- no scripts
- no external references
- no inline animation

If fill is used, its opacity must be `0.1` or lower, and fill must not carry the only semantic cue.

## State Model

Icons support state through CSS classes:

- `.nv-scientific-icon`
- `.nv-scientific-icon--sm`
- `.nv-scientific-icon--md`
- `.nv-scientific-icon--lg`
- `.nv-scientific-icon--xl`
- `.nv-scientific-icon--muted`
- `.nv-scientific-icon--active`
- `.nv-scientific-icon--selected`
- `.nv-scientific-icon--disabled`

Do not create state-specific files such as `*-active.svg`, `*-hover.svg`, or `*-disabled.svg`.

## Accessibility Requirements

- Decorative icons must use `aria-hidden="true"`.
- Meaningful icons must have accessible text nearby or be inside a labelled control.
- Icon-only buttons must provide `aria-label`.
- Focus is owned by the containing interactive element, not by decorative SVG paths.
- Critical information must never be conveyed by color alone.

## Usage Rules

- Use the icon from the registered family that matches the concept.
- Pair icons with text in navigation, inspector, evidence, and memory surfaces.
- Use `currentColor` inheritance so icons adapt to themes and state.
- Use the CSS utility size scale instead of editing SVG viewBox or geometry.
- Prefer the official icon over newly drawn local variants.

## Forbidden Usage

- Do not import external icon packs.
- Do not use icon fonts.
- Do not add third-party SVGs.
- Do not duplicate an icon to create color or state variants.
- Do not use icons as decorative backgrounds.
- Do not use a scientific icon for unrelated marketing decoration.

## Maintenance Rules

- Register every new icon in the Scientific Icon Semantics Registry before UI adoption.
- Add every approved icon to the Scientific Icon Inventory.
- Preserve the drawing contract during edits.
- Validate icons for currentColor, viewBox, stroke width, and absence of external references.
- Retire concepts by updating the registry instead of silently replacing files.
