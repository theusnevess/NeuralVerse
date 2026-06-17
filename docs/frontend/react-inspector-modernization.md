# React Inspector Modernization

## Purpose

`NV-500-UX-007E.6` modernizes the Retrieval Workspace Inspector as a React Island presentation surface.

The Inspector now uses React components for:

- Reference Inspector
- Evidence Inspector
- Relationship Inspector
- Inspector empty states

React improves structure, spacing, scanability, and component reuse. It does not own retrieval behavior.

## Boundary

JavaScript remains authoritative for:

- selected reference
- selected relationship
- compiled evidence
- graph synchronization
- pinned state
- recently viewed state
- knowledge trail events
- persistence
- routing and tab switching

React receives serializable props and invokes callbacks only.

## Island

The active island is:

```text
NvInspectorPanel
```

It dispatches by mode:

```text
reference     -> NvReferenceInspectorPanel
evidence      -> NvEvidenceInspectorPanel
relationship  -> NvRelationshipInspectorPanel
empty         -> NvInspectorEmptyState
```

## Fallback

The vanilla renderer still writes functional HTML before the React mount attempt. If the local React bundle or bridge is unavailable, the fallback remains usable.

## Styling

Inspector components use existing CSS tokens and Retrieval Workspace classes. The implementation avoids CSS-in-JS, external UI libraries, and hardcoded colors.

## Accessibility

Inspector actions render as semantic `button` elements. Relationship rows, lineage rows, and supporting reference actions expose accessible labels and preserve keyboard activation through native controls.

## QA Contract

Every Inspector change must verify:

- reference selection updates the Reference Inspector
- evidence compilation updates the Evidence Inspector
- graph edge selection updates the Relationship Inspector
- actions call existing JavaScript callbacks
- no horizontal overflow at 390, 768, 1024, and 1440 px
- `console.error` remains zero
- retrieval runtime tests pass

## Forbidden Responsibilities

React Inspector components must not:

- query the Retrieval Engine
- mutate workspace state directly
- write localStorage
- switch routes directly
- recalculate graph topology
- compile evidence
- duplicate persistence logic
