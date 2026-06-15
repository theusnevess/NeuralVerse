# Contextual Action Menus

## Purpose

NV-500-UX-007E.3 adds local action menus to the Retrieval Workspace so researchers can act where intent appears: graph nodes, relationships, discovery cards, search results, memory entries, evidence references, and inspector cross-links.

Menus reduce navigation friction. They do not replace existing left-click flows.

## React Island Boundary

`NvContextMenu` is a React Island mounted by the vanilla workspace controller.

React owns:

- Menu rendering
- Menu item layout
- Keyboard menu navigation
- ARIA menu semantics
- Visual states

The existing JavaScript controller owns:

- Payload construction
- Action validity
- Action execution
- Retrieval state
- Graph state
- Persistence
- Routing and inspector synchronization

Contract:

```text
Data in.
Callbacks out.
No domain ownership in React.
```

## Target Types

- `graph-node`
- `graph-edge`
- `discovery-panel`
- `reference-card`
- `pinned-reference`
- `recent-reference`
- `saved-query`
- `knowledge-trail-entry`
- `evidence-reference`
- `inspector-cross-link`
- `relationship-chip`

## Action Catalog

- `open`
- `preview`
- `pin`
- `unpin`
- `compare`
- `compile-evidence`
- `follow-source`
- `follow-target`
- `open-relationship`
- `explore-neighborhood`
- `rerun-query`
- `restore-trail-context`
- `copy-reference-id`
- `copy-query`
- `copy-relationship-id`

## Target / Action Matrix

| Target | Actions |
|---|---|
| Graph node | Open, Preview, Pin/Unpin, Compare, Compile Evidence, Explore Neighborhood, Copy Reference ID |
| Graph edge | Preview, Follow Source, Follow Target, Open Relationship, Copy Relationship ID |
| Discovery panel | Open, Preview, Pin/Unpin, Compare, Compile Evidence, Explore Neighborhood, Copy Reference ID |
| Reference card | Open, Preview, Pin/Unpin, Compare, Compile Evidence, Copy Reference ID |
| Pinned reference | Open, Preview, Unpin, Compare, Compile Evidence, Explore Neighborhood, Copy Reference ID |
| Recent reference | Open, Preview, Pin, Compile Evidence, Copy Reference ID |
| Saved query | Rerun Query, Preview, Copy Query |
| Knowledge trail entry | Restore Trail Context, Preview, Open Reference if available, Rerun Query if available, Copy Reference ID if available |
| Evidence reference | Open, Preview, Pin/Unpin, Compare, Compile Evidence, Explore Neighborhood, Copy Reference ID |
| Inspector cross-link | Open, Preview, Pin/Unpin, Compare, Compile Evidence, Explore Neighborhood, Copy Reference ID |
| Relationship chip | Preview, Follow Source, Follow Target, Open Relationship, Copy Relationship ID |

## Accessibility Contract

- Menu root uses `role="menu"`.
- Menu actions use semantic `button` elements with `role="menuitem"`.
- Disabled actions use `disabled` and `aria-disabled`.
- Focus moves to the first enabled action on open.
- Escape closes and returns focus to the trigger where possible.
- Arrow keys, Home, End, Enter, and Space are supported.
- Tab closes the menu predictably.
- Menu icons are decorative and do not replace text labels.

## Keyboard Behavior

- `Shift + F10` opens a menu for the focused contextual target.
- `ContextMenu` key opens a menu where supported by the browser.
- `Enter` or `Space` on explicit menu triggers opens the menu through the native button behavior.
- Existing `Enter` or `Space` behavior for normal cards and nodes remains unchanged.

## Styling Contract

Menus use existing NeuralVerse tokens and scientific iconography. They are positioned as fixed overlays and do not participate in layout flow.

The menu layer sits above hover previews and below modal-class overlays.

## QA Requirements

- Right-click opens menus for supported targets.
- Explicit menu triggers open menus where present.
- Keyboard activation opens menus.
- Escape and outside click close menus.
- Menus remain inside the viewport.
- No horizontal overflow at 390px, 768px, 1024px, or 1440px.
- Existing left-click actions remain unchanged.
- React build passes.
- Retrieval runtime tests pass.

## Forbidden Responsibilities

The menu island must never own:

- Retrieval logic
- Reference registry logic
- Relationship graph logic
- Evidence compilation
- Graph rendering
- Persistence
- Routing
- Search ranking
