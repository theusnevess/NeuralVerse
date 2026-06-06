# F7 — Radio

## Component ID
```
component-f7-radio
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Allow users to select exactly one option from a mutually exclusive group. Radio buttons must always appear in a group of two or more.

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
(All F6 — Checkbox token dependencies)
sys.radius.round  — radio circular shape (overrides sys.radius.subtle)
```

---

## States

```
unselected (default)
selected
hover
focus
disabled-unselected
disabled-selected
error
```

## Variants

```
standard     — radio with visible label
label-hidden — visually hidden label (aria-label required)
```

## Slots

```
control       — the radio element itself
label         — required visible or accessible label
helper-text   — optional per-option description
group-label   — required group label (fieldset/legend or aria-labelledby)
error-message — group-level error
```

---

## Responsive Requirements

```
Touch target must satisfy sys.a11y.touch.target.minimum
Radio group must remain scannable at all widths
```

---

## Accessibility Requirements

```
Role: radio (native <input type="radio"> preferred)
Group: Must be wrapped in radiogroup role — fieldset/legend or role="radiogroup" + aria-labelledby
Keyboard: Arrow keys navigate within group; Tab moves between groups
Focus: Visible focus ring using sys.a11y.focus.* tokens
Selected state: aria-checked="true" / "false"
Error: aria-describedby on group error message
Disabled: aria-disabled or HTML disabled (per option or per group)
```

## Motion Requirements

```
Pattern: Selection State Transition (selected fill appearance)
Intensity: low
Reduced-motion: Instant selected/unselected state
```

---

## Forbidden Usage

```
Single radio button without a group (always 2+ options)
Replacing checkbox for independent boolean selections (use F6)
Without group label
Without keyboard group navigation contract
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
