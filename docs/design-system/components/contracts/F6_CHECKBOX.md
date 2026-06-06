# F6 — Checkbox

## Component ID
```
component-f6-checkbox
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Allow users to select one or more independent boolean options. Each checkbox operates independently from others in a group.

## Category
```
input / selection
```

## Canonical Decision Source
```
NV-013 Component Taxonomy
NV-014 Design Tokens
NV-016 Motion System
NV-017 Accessibility System
```

---

## Token Dependencies

```
sys.color.accent.primary      — checked state fill / checkmark background
sys.color.surface.base        — unchecked background
sys.color.border.default      — unchecked border
sys.color.border.strong       — focus border
sys.color.semantic.error      — error/invalid state border
sys.color.text.primary        — label text
sys.color.text.disabled       — disabled label
sys.color.state.disabled      — disabled control surface
sys.font.body.size            — label text size
sys.font.body.family          — label font family
sys.radius.subtle             — control box rounding
sys.motion.duration.feedback  — check/uncheck transition
sys.motion.ease.interface     — transition easing
sys.a11y.focus.ring           — focus indicator
sys.a11y.focus.color          — focus ring color
sys.a11y.focus.width          — focus ring width
sys.a11y.focus.offset         — focus ring offset
sys.a11y.disabled.opacity     — disabled opacity
sys.a11y.disabled.cursor      — disabled cursor
sys.a11y.touch.target.minimum — minimum interactive area (control + label)
```

---

## States

```
unchecked (default)
checked
indeterminate
hover
focus
disabled-unchecked
disabled-checked
error
```

## Variants

```
standard     — checkbox with visible label
label-hidden — visually hidden label (aria-label required)
```

## Slots

```
control      — the checkbox element itself
label        — required visible or accessible label
helper-text  — optional supporting description
error-message — programmatically associated error
```

---

## Responsive Requirements

```
Touch target must satisfy sys.a11y.touch.target.minimum (control + label area)
Label must remain readable and not truncate on narrow viewports
```

---

## Accessibility Requirements

```
Role: checkbox (native <input type="checkbox"> preferred)
Checked state: aria-checked="true" / "false" / "mixed" (indeterminate)
Label: <label for> or aria-labelledby — required
Group label: aria-labelledby or fieldset/legend when in group
Keyboard: Space to toggle
Focus: Visible focus ring using sys.a11y.focus.* tokens
Error: aria-describedby on error message + aria-invalid="true"
Disabled: aria-disabled or HTML disabled
```

## Motion Requirements

```
Pattern: Selection State Transition (check fill appearance)
Intensity: low
Reduced-motion: Instant checked/unchecked state
```

---

## Forbidden Usage

```
As a radio-like group where only one option should be selected (use F7 Radio)
Without visible or accessible label
Indeterminate state without programmatic management
Icon replacing checkmark without accessible alternative
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
