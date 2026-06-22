# Knowledge Graph Interaction Redesign

## Problem

The previous Knowledge Graph accumulated expanded branches and kept too much unrelated structure visible. After repeated interactions, modules, lessons, and artifacts could read as a scattered force graph rather than a curriculum atlas.

## Interaction Redesign

NV-900-UI10C replaces ad hoc expansion with staged focus. A node click selects the node, updates the inspector, highlights direct lineage, dims unrelated visible context, and switches the graph to the selected node's local neighborhood.

Explicit actions are available in the toolbar and inspector: Focus, Expand children, Collapse, Back to parent, Open resource, Center view, Fit, and zoom controls.

## Graph State Model

```js
{
  mode: "overview" | "path" | "module" | "lesson" | "artifact",
  focusedNodeId: string | null,
  expandedNodeIds: Set<string>,
  selectedNodeId: string | null
}
```

The renderer derives visible nodes and edges from this state. Reset clears selection and expansion, returns to `overview`, and fits Learning Paths only.

## Focus Levels

Level 1 shows Learning Paths only. Path cards include module, lesson, and artifact count badges.

Level 2 shows the selected Learning Path and contained Modules.

Level 3 shows the parent Learning Path, selected Module, contained Lessons, and faded sibling Modules.

Level 4 shows the parent Module, selected Lesson, contained Artifacts, and faded sibling Lessons.

Artifact focus shows the parent Lesson, selected Artifact, sibling Artifacts, and declared dependencies when available.

## Layout Rules

Layouts are deterministic rows and arcs, not force simulation. Parent context is placed above, the selected node is centered, children are arranged below in an arc, and siblings are smaller dimmed context. Dependency edges are dashed.

## Search Behavior

Search resolves a matching node, switches to the correct focus mode, expands lineage through state, centers the target, highlights it, and updates the inspector. Searching for an artifact shows the artifact neighborhood rather than revealing it in a full graph.

## Accessibility Model

The page maintains a single `h1` and at most one `aria-current="page"`. SVG nodes are keyboard focusable buttons with Enter and Space selection. The fallback text list can operate the same focus model. Toolbar and inspector actions are native buttons. Reduced motion disables graph transitions and reveal animations.

## Performance Model

The default overview does not render modules, lessons, or artifacts. Focus modes render only the active neighborhood. There is no force loop. Stale renderer listeners are destroyed on route changes, and the controller keeps one SVG root per render.

## QA Summary

`scripts/nv-900-ui10-verify.js` validates overview, path focus, module focus, lesson focus, artifact focus, reset, artifact search, inspector actions, overlap, clipped labels, toolbar usability, mobile usability, accessibility baseline, and zero console/page/request failures.

## Screenshots Generated

Screenshots are generated under `/tmp/neuralverse-graph-interaction-redesign`:

- `overview-paths-only-1440.png`
- `focused-path-modules-1440.png`
- `focused-module-lessons-1440.png`
- `focused-lesson-artifacts-1440.png`
- `artifact-neighborhood-1440.png`
- `search-to-artifact-focus-1440.png`
- `selected-node-inspector-1440.png`
- `mobile-focused-path-390.png`
- `mobile-focused-lesson-390.png`
