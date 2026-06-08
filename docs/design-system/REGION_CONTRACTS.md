# REGION_CONTRACTS.md

## Purpose

This file defines canonical layout and region contracts for NeuralVerse.

No layout structure or region components may be implemented unless they exist here.

---

## Approved Region Contracts

### R1 Global Header

```text
Region ID:
region-contract-global-header

Region Name:
R1 Global Header

Purpose:
Global orientation and platform-level action access region.

Responsibilities:
- Provide persistent global branding/identity access.
- Expose global platform controls (such as search activation and settings).
- Expose user profile and notification entry points.

Boundaries:
- Placed at the extreme top of the layout viewport.
- Spans 100% viewport width.
- Height is constrained by internal layout content and context tokens.

Inputs:
- Command palette triggers.
- Navigation history/state.

Outputs:
- Active route changes.
- Command palette visibility toggle.
- Search input values.

Allowed Behaviors:
- Sticking to the top of the page during vertical scrolling.
- Displaying primary application logotype.
- Accommodating search bars and user status badge triggers.

Forbidden Behaviors:
- Embedding page-specific navigation tabs.
- Functioning as a marketing hero area.
- Showing detailed dashboard metrics or feeds.
- Creating secondary vertical side rails within itself.

Token Dependencies:
- ctx.shell.header.surface
- ctx.shell.header.border
- ctx.shell.padding
- ctx.shell.z

Accessibility Requirements:
- Programmatic `<header>` landmark.
- Focusable interactive elements with explicit label names.
- Logical tab order from top-left to top-right.
- Focus ring outline decoration visible.

Motion Requirements:
- No continuous motion.
- Minimal state transition durations using sys.motion.duration.feedback.

Responsive Requirements:
- Switch to compact layout on narrow screens (e.g., hide optional labels, show icon triggers only).
- Keep branding and core access controls visible.

Review Gates:
- Registration Gate: PASS (registered in COMPONENT_REGISTRY.md)
- Token Gate: PASS
- Accessibility Gate: PENDING
```

---

### R3 Main Workspace

```text
Region ID:
region-contract-main-workspace

Region Name:
R3 Main Workspace

Purpose:
Primary active work area for rendered workspace and future knowledge surfaces.

Responsibilities:
- Render active view routes and workspace layouts.
- Host focal interactive controls and datasets.
- Anchor scroll containers for page content.

Boundaries:
- Positioned in the central area of the application shell.
- Flanked by R2 Navigation Rail on the left and R4 Context Panel on the right.
- Separated from R1 Global Header at the top.

Inputs:
- Active routing parameters.
- Context data streams.

Outputs:
- User inputs within interactive workspace forms/controls.
- Internal component event updates.

Allowed Behaviors:
- Independent scrolling behavior (maintaining sticky header and rail).
- Displaying cards, content grids, code views, and layout partitions.

Forbidden Behaviors:
- Hosting global shell controls (e.g., global settings, main navigation triggers).
- Competing with R4 Context Panel for complementary metadata display.
- Nesting duplicate sidebar layout regions.

Token Dependencies:
- ctx.workspace.background
- ctx.workspace.surface
- ctx.workspace.border
- ctx.workspace.padding
- ctx.workspace.radius
- ctx.workspace.elevation
- ctx.workspace.label.font
- ctx.workspace.metadata.font

Accessibility Requirements:
- Programmatic `<main>` landmark.
- Must act as the skip-link navigation destination target.
- Keyboard focus entry point handled safely.
- Proper heading hierarchy starting with a single `<h1>`.

Motion Requirements:
- None or low-intensity workspace state transition animation only.
- Respect reduced motion settings.

Responsive Requirements:
- Mobile-first adaptive design.
- Prevent horizontal scrollbars on primary content areas.
- Wrap content columns cleanly.

Review Gates:
- Registration Gate: PASS (registered in COMPONENT_REGISTRY.md)
- Token Gate: PASS
- Accessibility Gate: PENDING
```
