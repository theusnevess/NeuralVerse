# F4 — Input

## Component ID
```
component-f4-input
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Capture single-line user-provided text or structured interface input. The foundational text entry component.

## Category
```
input / text
```

## Canonical Decision Source
```
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-016 Motion System
NV-017 Accessibility System
NV-018 Frontend Architecture
```

---

## Token Dependencies

```
sys.color.surface.base        — field background
sys.color.border.default      — default border
sys.color.border.strong       — focus border
sys.color.semantic.error      — error state border
sys.color.semantic.warning    — warning state border
sys.color.text.primary        — input text
sys.color.text.muted          — placeholder text
sys.color.text.disabled       — disabled text
sys.color.state.disabled      — disabled field surface
sys.font.body.size            — input text size
sys.font.body.family          — input font family
sys.font.body.line-height     — input text line height
sys.font.caption.size         — label / helper / error text size
sys.font.caption.weight       — label weight
sys.space.inset.sm            — field internal padding
sys.radius.control            — field rounding
sys.border.default            — field border width (default)
sys.border.interactive        — field border width (focus)
sys.motion.duration.feedback  — border and focus ring transition
sys.motion.ease.interface     — transition easing
sys.a11y.focus.ring           — focus indicator
sys.a11y.focus.color          — focus ring color
sys.a11y.focus.width          — focus ring width
sys.a11y.focus.offset         — focus ring offset
sys.a11y.disabled.cursor      — disabled cursor
sys.a11y.touch.target.minimum — minimum field height
```

---

## States

```
default
hover
focus
disabled
error
warning
loading
```

## Variants

```
text             — standard single-line text
search-compatible — includes affordances for search role integration
```

## Slots

```
label            — required (visible or visually hidden, never placeholder-only)
input-field      — the text entry element
leading-icon     — optional icon before input
trailing-icon    — optional icon or action after input
helper-text      — supporting instruction below field
error-message    — programmatically associated error
```

---

## Responsive Requirements

```
Must maintain sys.a11y.touch.target.minimum height on mobile
Label must always be visible (never rely on placeholder as label)
Helper and error text must remain readable at all widths
```

---

## Accessibility Requirements

```
Role: textbox (native <input type="text"> or equivalent)
Label: Programmatic association required — <label for> or aria-labelledby
Placeholder: Must not replace visible label
Helper text: aria-describedby association when present
Error message: aria-describedby + aria-invalid="true" in error state
Keyboard: Full text entry, navigation, and editing
Focus: Visible focus ring using sys.a11y.focus.* tokens
Disabled: aria-disabled or HTML disabled (UX context determines which)
```

## Motion Requirements

```
Pattern: Focus Transition (border and focus ring)
Intensity: reduced
Reduced-motion: Instant state change
```

---

## Forbidden Usage

```
Placeholder-only label (no programmatic label association)
Input without visible or accessible label
Arbitrary border colors outside token system
Input used as textarea without explicit resize behavior
```

---

## Owner
```
Component Designer
```

## Version
```
1.0.0
```

## Review Log
```
Created as part of NV-023-TASK-003.
```
