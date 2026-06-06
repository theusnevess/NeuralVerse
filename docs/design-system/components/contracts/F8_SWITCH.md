# F8 — Switch

## Component ID
```
component-f8-switch
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Toggle a single boolean setting on or off. Switches represent immediate-effect toggles, as opposed to checkboxes which typically require form submission.

## Category
```
input / toggle
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
sys.color.accent.primary      — on-state track fill
sys.color.border.default      — off-state track border/fill
sys.color.surface.overlay     — thumb element (sliding indicator)
sys.color.text.primary        — label text
sys.color.text.disabled       — disabled label text
sys.color.state.disabled      — disabled track
sys.radius.round              — track rounding (pill shape)
sys.motion.duration.feedback  — thumb slide duration
sys.motion.ease.interface     — thumb slide easing
sys.a11y.focus.ring           — focus indicator
sys.a11y.focus.color          — focus ring color
sys.a11y.focus.width          — focus ring width
sys.a11y.focus.offset         — focus ring offset
sys.a11y.disabled.opacity     — disabled opacity
sys.a11y.disabled.cursor      — disabled cursor
sys.a11y.touch.target.minimum — minimum interactive area (track + label)
```

---

## States

```
off (default)
on
hover
focus
disabled-off
disabled-on
```

## Variants

```
standard     — switch with visible label
label-hidden — visually hidden label (aria-label required)
```

## Slots

```
track         — the toggle track element
thumb         — the sliding indicator
label         — required visible or accessible label
helper-text   — optional supporting description
```

---

## Responsive Requirements

```
Touch target must satisfy sys.a11y.touch.target.minimum
Thumb slide must be clearly visible on all display densities
```

---

## Accessibility Requirements

```
Role: switch (role="switch" or native equivalent)
State: aria-checked="true" / "false"
Label: Required — aria-label or aria-labelledby
Keyboard: Space to toggle; Enter may also toggle (context-dependent)
Focus: Visible focus ring using sys.a11y.focus.* tokens
Immediate effect: Must be communicated — label should reflect current state or use status announcement
Disabled: aria-disabled or HTML disabled
```

## Motion Requirements

```
Pattern: Switch Thumb Slide (on ↔ off transition)
Intensity: low
Reduced-motion: Instant on/off state — no thumb animation
```

---

## Forbidden Usage

```
As a confirmation dialog replacement (immediate effect must be safe)
Without visible or accessible label
To replace radio buttons in mutually exclusive option groups (use F7)
With high-intensity thumb animation
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
