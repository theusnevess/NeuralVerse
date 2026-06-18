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

When a visible surface is migrated, the JavaScript layer must keep a safe fallback where practical. Discovery, Inspector, Evidence, Relationship, and Memory surfaces render fallback HTML first; React then mounts through `tryMountReactIsland()`. If the bundle, bridge, or component is unavailable, the fallback remains visible and functional.

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

| Island | Container | Status |
|---|---|---|
| `NvHoverPreview` | `.nv-hover-preview-layer .nv-react-hover-preview-root` | ✅ Active |
| `NvContextMenu` | `.nv-context-menu-layer .nv-react-context-menu-root` | ✅ Active |
| `NvDiscoveryCard` | `.nv-react-discovery-card-root[data-discovery-card-id]` | ✅ Active |
| `NvInspectorPanel` | `#selected-reference-container` / `#evidence-compilation-container` / `#selected-relationship-container` | ✅ Active (E.5) |
| `NvMemoryLayer` | `#memory-layer-grid` | ✅ Active (E.5) |
| `NvWorkspaceSnapshot` | `#research-snapshot-container` | ✅ Active (E.8) |
| `NvCompareWorkspace` | `#compare-workspace-container` | ✅ Active (E.9) |

## QA Parity Checklist — E.5

| Check | Required |
|---|---|
| Reference Inspector renders after select | ✅ |
| Evidence Inspector renders after compile | ✅ |
| Relationship Inspector renders after edge select | ✅ |
| NvContributionBar visible in Evidence supporting refs | ✅ |
| Memory Layer columns all visible | ✅ |
| Knowledge Trail updates on exploration | ✅ |
| Pinned references persist after reload | ✅ |
| Saved queries persist after reload | ✅ |
| Fallback HTML remains if React unavailable | ✅ |
| Context menus unchanged | ✅ |
| Hover previews unchanged | ✅ |
| Discovery Panels unchanged | ✅ |
| Graph interactions unchanged | ✅ |
| No horizontal overflow at 390–1440px | ✅ |
| No console errors | ✅ |
| 53/53 runtime tests pass | ✅ |
| React build passes | ✅ |

## E.5 Ownership Boundaries

React owns only visible UI for Inspector sections, Memory cards/columns, and qualitative evidence contribution bars.

JavaScript remains the owner for selected reference state, selected relationship state, evidence data, pin state, saved queries, knowledge trail events, context menus, hover previews, localStorage persistence, Retrieval state, and graph state.

Allowed E.5 callbacks:

- `onOpenReference`
- `onPinReference`
- `onUnpinReference`
- `onCompileEvidence`
- `onFollowSource`
- `onFollowTarget`
- `onRerunQuery`
- `onRestoreTrail`
- `onOpenContextMenu`
- `onShowHoverPreview`

## Forbidden Migrations (All Phases)

- Graph rendering internals (SVG, D3 force simulation)
- Router
- Retrieval state (`retrievalState` object)
- Evidence compiler logic
- Persistence ownership (localStorage read/write)
- Discovery recommendation logic
- Reference Registry domain logic
- Relationship Graph domain logic

## E.9 Compare Island Rules

- Compare selection lives in existing JavaScript state.
- React receives only plain serializable compare payloads.
- React must not read `localStorage` or persist compare selection.
- No multi-reference Evidence Compiler contract is introduced.
- Unique concepts and shared concepts must come from existing reference metadata only.
- Relationship comparisons must come from existing relationship records only.
- Graph position is descriptive only and must not alter graph layout or rendering.
