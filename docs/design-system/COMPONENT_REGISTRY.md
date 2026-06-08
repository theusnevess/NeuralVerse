# COMPONENT_REGISTRY.md

## Purpose

This file is the canonical registry of approved NeuralVerse components.

No component may be implemented unless it exists in this registry.

---

## Governance Rules

- Every component requires a registry entry before implementation.
- Every component must declare purpose, dependencies, states, variants, accessibility requirements, and motion requirements.
- Components must consume approved tokens only.
- Components must not introduce page-specific visual language.
- Components must not expand project scope.

---

## Component Entry Template

```text
Component ID:
Component Name:
Category:
Purpose:
Canonical Decision Source:
Owner:
Dependencies:
Token Dependencies:
Layout Dependencies:
Navigation Dependencies:
Accessibility Requirements:
Motion Requirements:
Responsive Requirements:
States:
Variants:
Slots:
Forbidden Usage:
Implementation Status:
Lifecycle Status:
Version:
Review Owner:
Last Reviewed:
Notes:
```

---

## Approved Component Entries

### Button

```text
Component ID: component-button
Component Name: Button
Category: foundation / input
Purpose: Trigger explicit user actions.
Canonical Decision Source: NV-013, NV-014, NV-017, NV-018
Owner: Component Designer
Dependencies: Token Registry, Accessibility Matrix, Motion Registry
Token Dependencies: color.accent.primary, color.text.primary, font.family.primary, space.400, motion.duration.normal
Layout Dependencies: none
Navigation Dependencies: none
Accessibility Requirements: Keyboard activation, visible focus, semantic button role.
Motion Requirements: Focus Transition
Responsive Requirements: Must remain usable on mobile and desktop.
States: default, hover, focus, active, disabled, loading
Variants: action, secondary-action, quiet-action
Slots: label, optional leading icon, optional trailing icon
Forbidden Usage: Navigation replacement without contract, decorative-only usage.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
Review Owner: Frontend Architect
Last Reviewed: Initial bootstrap
Notes: Registry entry only. No UI implementation authorized by this entry alone.
```

### Input

```text
Component ID: component-input
Component Name: Input
Category: input
Purpose: Capture user-provided text or structured interface input.
Canonical Decision Source: NV-013, NV-014, NV-017, NV-018
Owner: Component Designer
Dependencies: Token Registry, Accessibility Matrix
Token Dependencies: color.text.primary, font.family.primary, space.400, motion.duration.normal
Layout Dependencies: form/control layout rules
Navigation Dependencies: none
Accessibility Requirements: Label association, keyboard support, visible focus, error semantics.
Motion Requirements: Focus Transition
Responsive Requirements: Must preserve readable hit area on mobile.
States: default, hover, focus, disabled, error, loading
Variants: text, search-compatible
Slots: label, input field, helper text, error message
Forbidden Usage: Unlabeled input, placeholder-only label.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
Review Owner: Frontend Architect
Last Reviewed: Initial bootstrap
Notes: Search-specific usage must also satisfy Search contract.
```

### NavigationRail

```text
Component ID: component-navigation-rail
Component Name: NavigationRail
Category: navigation / region
Purpose: Provide primary platform navigation.
Canonical Decision Source: NV-012, NV-015, NV-017, NV-018
Owner: Frontend Architect
Dependencies: Navigation Contracts, Token Registry, Accessibility Matrix, Motion Registry
Token Dependencies: color.accent.primary, color.text.primary, font.family.primary, space.400, motion.duration.normal
Layout Dependencies: Layout Architecture, Region Specifications
Navigation Dependencies: Navigation Rail Contract
Accessibility Requirements: Keyboard traversal, active state semantics, focus management.
Motion Requirements: Navigation Transition, Panel Expansion when collapsible.
Responsive Requirements: Must adapt to mobile-first layout.
States: default, hover, focus, active, collapsed, expanded
Variants: primary rail
Slots: brand area, nav items, secondary area
Forbidden Usage: Arbitrary dashboard sidebar behavior.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
Review Owner: UX Architect
Last Reviewed: Initial bootstrap
Notes: Must preserve scientific workspace identity, not corporate dashboard behavior.
```

### ContextPanel

```text
Component ID: component-context-panel
Component Name: ContextPanel
Category: layout / navigation / region
Purpose: Display contextual interface support related to the active workspace.
Canonical Decision Source: NV-012, NV-015, NV-017, NV-018
Owner: Frontend Architect
Dependencies: Navigation Contracts, Token Registry, Accessibility Matrix, Motion Registry
Token Dependencies: color.text.primary, font.family.primary, space.400, motion.duration.normal
Layout Dependencies: Region Specifications
Navigation Dependencies: Context Navigation Contract
Accessibility Requirements: Landmark or complementary semantics when applicable, focus-safe behavior.
Motion Requirements: Panel Expansion
Responsive Requirements: Must collapse or stack safely on narrow viewports.
States: default, focus-within, collapsed, expanded
Variants: contextual, supporting
Slots: heading, context items, metadata area
Forbidden Usage: Primary navigation replacement.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
Review Owner: UX Architect
Last Reviewed: Initial bootstrap
Notes: Must reduce cognitive load.
```

### SearchBar

```text
Component ID: component-search-bar
Component Name: SearchBar
Category: input / navigation
Purpose: Provide controlled search entry point.
Canonical Decision Source: NV-015, NV-017, NV-018
Owner: UX Architect
Dependencies: Search Contract, Token Registry, Accessibility Matrix, Motion Registry
Token Dependencies: color.text.primary, font.family.primary, space.400, motion.duration.normal
Layout Dependencies: none
Navigation Dependencies: Search Contract
Accessibility Requirements: Labeling, keyboard entry, result relationship semantics.
Motion Requirements: Search Invocation, Focus Transition
Responsive Requirements: Must remain reachable and usable on mobile.
States: default, focus, active, loading, empty, results-visible
Variants: compact, expanded
Slots: input, optional shortcut hint, optional result trigger
Forbidden Usage: Global command palette replacement unless contract permits.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
Review Owner: UX Architect
Last Reviewed: Initial bootstrap
Notes: Search behavior requires Navigation Contract compliance.
```

---

## Deprecated Component Entries

None.

---

## Review Log

```text
Initial bootstrap:
Created as part of NV-023-TASK-001.

NV-023-TASK-003 (M2 Foundation Components):
Added F1-F9 foundation component entries.
```

---

## M2 Foundation Component Entries

### F1 — Divider

```text
Component ID: component-f1-divider
Component Name: Divider
Category: layout / visual
Purpose: Provide visual and structural separation between content regions.
Canonical Decision Source: NV-012, NV-013, NV-014
Owner: Component Designer
Contract: docs/design-system/components/contracts/F1_DIVIDER.md
Token Dependencies: sys.color.border.subtle, sys.color.divider.default, sys.space.stack.sm
Accessibility Requirements: role separator when meaningful; aria-hidden when decorative.
Motion Requirements: none
States: default, vertical
Variants: horizontal, vertical
Slots: none
Forbidden Usage: As primary content delimiter, as decorative graphic, with hardcoded colors.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F2 — Badge

```text
Component ID: component-f2-badge
Component Name: Badge
Category: display / status
Purpose: Communicate status, category, count, or label metadata inline.
Canonical Decision Source: NV-010, NV-013, NV-014, NV-017
Owner: Component Designer
Contract: docs/design-system/components/contracts/F2_BADGE.md
Token Dependencies: sys.color.semantic.*, sys.color.accent.subtle, sys.color.text.inverse, sys.font.caption.*, sys.radius.badge, sys.space.inline.xs
Accessibility Requirements: Color must not be sole meaning carrier; label text required; icon-only badges forbidden without accessible text.
Motion Requirements: none
States: default
Variants: success, warning, error, info, accent, neutral
Slots: label, leading-icon optional
Forbidden Usage: As interactive trigger without role; as navigation; with arbitrary colors.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F3 — Button

```text
Component ID: component-f3-button
Component Name: Button
Category: input / action
Purpose: Trigger explicit, single user actions.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017, NV-018
Owner: Component Designer
Contract: docs/design-system/components/contracts/F3_BUTTON.md
Token Dependencies: sys.color.accent.*, sys.color.surface.raised, sys.color.state.*, sys.color.text.*, sys.font.body.*, sys.space.inset.*, sys.radius.control, sys.border.interactive, sys.motion.duration.feedback, sys.motion.ease.interface, sys.a11y.focus.*, sys.a11y.disabled.*, sys.a11y.touch.target.minimum
Accessibility Requirements: Enter and Space activation; visible focus ring; accessible name required; aria-disabled for disabled; aria-busy for loading.
Motion Requirements: Focus Transition, Button Press Feedback
States: default, hover, focus, active, disabled, loading
Variants: action, secondary-action, quiet-action
Slots: label, leading-icon, trailing-icon, loading-indicator
Forbidden Usage: As navigation without contract; decorative-only; nested interactives; icon-only without aria-label.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F4 — Input

```text
Component ID: component-f4-input
Component Name: Input
Category: input / text
Purpose: Capture single-line user-provided text or structured input.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017, NV-018
Owner: Component Designer
Contract: docs/design-system/components/contracts/F4_INPUT.md
Token Dependencies: sys.color.surface.base, sys.color.border.*, sys.color.semantic.error, sys.color.text.*, sys.color.state.disabled, sys.font.body.*, sys.font.caption.*, sys.space.inset.sm, sys.radius.control, sys.motion.duration.feedback, sys.a11y.focus.*, sys.a11y.touch.target.minimum
Accessibility Requirements: Programmatic label required; aria-describedby for helper/error; aria-invalid in error state; full keyboard support.
Motion Requirements: Focus Transition
States: default, hover, focus, disabled, error, warning, loading
Variants: text, search-compatible
Slots: label, input-field, leading-icon, trailing-icon, helper-text, error-message
Forbidden Usage: Placeholder-only label; without accessible label; arbitrary borders; as textarea.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F5 — Textarea

```text
Component ID: component-f5-textarea
Component Name: Textarea
Category: input / text
Purpose: Capture multi-line user-provided text.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017, NV-018
Owner: Component Designer
Contract: docs/design-system/components/contracts/F5_TEXTAREA.md
Token Dependencies: All F4 Input tokens plus sys.font.body.line-height, sys.font.code.family, sys.space.inset.md
Accessibility Requirements: aria-multiline true; same label/error rules as F4; character count as aria-live when applicable.
Motion Requirements: Focus Transition
States: default, hover, focus, disabled, error, warning
Variants: standard, fixed, monospace
Slots: label, textarea-field, helper-text, error-message, character-count
Forbidden Usage: Placeholder-only label; as code editor without monospace variant; without label.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F6 — Checkbox

```text
Component ID: component-f6-checkbox
Component Name: Checkbox
Category: input / selection
Purpose: Allow selection of one or more independent boolean options.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017
Owner: Component Designer
Contract: docs/design-system/components/contracts/F6_CHECKBOX.md
Token Dependencies: sys.color.accent.primary, sys.color.surface.base, sys.color.border.*, sys.color.semantic.error, sys.color.text.*, sys.color.state.disabled, sys.font.body.*, sys.radius.subtle, sys.motion.duration.feedback, sys.a11y.focus.*, sys.a11y.disabled.*, sys.a11y.touch.target.minimum
Accessibility Requirements: Native checkbox or role checkbox; aria-checked including mixed; label required; group label for grouped checkboxes; Space to toggle.
Motion Requirements: Selection State Transition
States: unchecked, checked, indeterminate, hover, focus, disabled-unchecked, disabled-checked, error
Variants: standard, label-hidden
Slots: control, label, helper-text, error-message
Forbidden Usage: As radio group replacement; without label; indeterminate without programmatic management.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F7 — Radio

```text
Component ID: component-f7-radio
Component Name: Radio
Category: input / selection
Purpose: Allow selection of exactly one option from a mutually exclusive group.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017
Owner: Component Designer
Contract: docs/design-system/components/contracts/F7_RADIO.md
Token Dependencies: All F6 Checkbox tokens plus sys.radius.round
Accessibility Requirements: Native radio or role radio; radiogroup wrapper required; Arrow key navigation within group; group label via fieldset/legend or aria-labelledby.
Motion Requirements: Selection State Transition
States: unselected, selected, hover, focus, disabled-unselected, disabled-selected, error
Variants: standard, label-hidden
Slots: control, label, helper-text, group-label, error-message
Forbidden Usage: Single radio without group; replacing checkbox for independent booleans; without group label.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F8 — Switch

```text
Component ID: component-f8-switch
Component Name: Switch
Category: input / toggle
Purpose: Toggle a single boolean setting with immediate effect.
Canonical Decision Source: NV-013, NV-014, NV-016, NV-017
Owner: Component Designer
Contract: docs/design-system/components/contracts/F8_SWITCH.md
Token Dependencies: sys.color.accent.primary, sys.color.border.default, sys.color.surface.overlay, sys.color.text.*, sys.color.state.disabled, sys.radius.round, sys.motion.duration.feedback, sys.motion.ease.interface, sys.a11y.focus.*, sys.a11y.disabled.*, sys.a11y.touch.target.minimum
Accessibility Requirements: role switch; aria-checked true/false; label required; Space to toggle; immediate effect communicated.
Motion Requirements: Switch Thumb Slide
States: off, on, hover, focus, disabled-off, disabled-on
Variants: standard, label-hidden
Slots: track, thumb, label, helper-text
Forbidden Usage: As confirmation dialog replacement; without label; as radio group replacement; with high-intensity animation.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

### F9 — Tooltip

```text
Component ID: component-f9-tooltip
Component Name: Tooltip
Category: overlay / contextual
Purpose: Provide brief contextual information about an interface element on hover or focus.
Canonical Decision Source: NV-013, NV-014, NV-015, NV-016, NV-017
Owner: Component Designer
Contract: docs/design-system/components/contracts/F9_TOOLTIP.md
Token Dependencies: sys.color.surface.overlay, sys.color.text.inverse, sys.color.border.subtle, sys.font.caption.*, sys.font.body.family, sys.space.inset.xs, sys.radius.surface, sys.shadow.overlay, sys.z.dropdown, sys.motion.duration.feedback, sys.motion.ease.enter, sys.motion.ease.exit, sys.a11y.reading.width.standard
Accessibility Requirements: role tooltip; trigger aria-describedby pointing to tooltip; trigger must have own accessible label; non-interactive content only; Escape to dismiss.
Motion Requirements: Tooltip Reveal
States: hidden, visible
Variants: standard above, below, left, right
Slots: trigger, tooltip-panel, tooltip-label
Forbidden Usage: As primary information container; with interactive content; as dropdown replacement; with long paragraphs; without aria-describedby.
Implementation Status: Not Implemented
Lifecycle Status: Approved
Version: 1.0.0
```

---

## M3 Region Component Entries

### R1 — GlobalHeader

```text
Component ID: component-global-header
Component Name: GlobalHeader
Category: region
Purpose: Global orientation and platform-level action access region.
Canonical Decision Source: NV-012 Layout Architecture, NV-015 Navigation System, NV-018 Frontend Architecture, NV-023 M3 Region Components
Owner: Frontend Architect
Dependencies: Button, SearchBar, Navigation state contract, Command palette trigger contract
Token Dependencies: ctx.shell.header.surface, ctx.shell.header.border, ctx.shell.padding, ctx.shell.z
Accessibility Requirements: header landmark, keyboard reachable actions, accessible action labels, visible focus, predictable focus order
Motion Requirements: none or low-intensity state feedback only, reduced-motion compatible
Responsive Requirements: compact header behavior, preserve access to global actions
Forbidden Usage: marketing hero, dashboard KPI bar, social feed, page-specific navigation, educational content
Implementation Status: Not Implemented
Lifecycle Status: Approved
Review Owner: Antigravity Architect
Version: 1.0.0
```

### R3 — MainWorkspace

```text
Component ID: component-main-workspace
Component Name: MainWorkspace
Category: region
Purpose: Primary active work area for rendered workspace and future knowledge surfaces.
Canonical Decision Source: NV-012 Layout Architecture, NV-018 Frontend Architecture, NV-023 M3 Region Components
Owner: Frontend Architect
Dependencies: Route state, Breadcrumb context, Workspace state
Token Dependencies: ctx.workspace.background, ctx.workspace.surface, ctx.workspace.border, ctx.workspace.padding, ctx.workspace.radius, ctx.workspace.elevation, ctx.workspace.label.font, ctx.workspace.metadata.font
Accessibility Requirements: main landmark, skip-link target, focus entry point, logical reading order, responsive reading support
Motion Requirements: none or low-intensity workspace state clarification only, reduced-motion compatible
Responsive Requirements: mobile-first adaptation, no core horizontal scrolling, preserve readable workspace area
Forbidden Usage: primary navigation ownership, context-panel ownership, final page content, educational content, backend logic
Implementation Status: Not Implemented
Lifecycle Status: Approved
Review Owner: Antigravity Architect
Version: 1.0.0
```
