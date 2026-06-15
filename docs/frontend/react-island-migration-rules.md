# React Island Migration Rules

## Purpose

These rules govern incremental React modernization after NV-500-UX-007E.4.

## Required Boundary

Every island follows:

```text
Data in.
Callbacks out.
No domain ownership.
```

React may render UI and manage local presentation state only.

## Allowed Responsibilities

React Islands may own:

- Markup composition
- Button, badge, chip, icon, and card presentation
- Local disclosure state
- Menu keyboard movement
- Non-domain visual grouping

## Forbidden Responsibilities

React Islands must never own:

- Retrieval state
- Reference registry logic
- Relationship graph logic
- Search ranking
- Evidence compilation
- Workspace persistence
- Router state
- Graph layout or graph rendering internals
- Cross-island global state

## Fallback Requirement

When a visible surface is migrated, the JavaScript layer should keep a safe fallback where practical. The Discovery Panel migration keeps the previous HTML inside each React root until the bundle mounts.

## Styling Rules

- Use existing CSS classes and design tokens.
- Do not introduce CSS-in-JS.
- Do not introduce Tailwind, Bootstrap, Material UI, or icon packs.
- Do not hardcode colors or spacing.
- Do not create a second visual grammar.

## QA Parity

Every migrated surface must validate:

- Existing click behavior
- Existing keyboard behavior
- Existing hover preview behavior if applicable
- Existing context menu behavior if applicable
- No horizontal overflow at 390px, 768px, 1024px, and 1440px
- No console errors
- Runtime tests still passing
- React build still passing

## Current Production Islands

- `NvHoverPreview`
- `NvContextMenu`
- `NvDiscoveryCard`
