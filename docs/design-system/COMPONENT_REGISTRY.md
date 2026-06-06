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
```
