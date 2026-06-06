# F3 — Button

## Component ID
```
component-f3-button
```

## Status
```
Implementation Status: Not Implemented
Lifecycle Status:      Approved
```

---

## Purpose
Trigger explicit, single user actions. Buttons represent the primary interactive affordance in NeuralVerse.

## Category
```
input / action
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
sys.color.accent.primary      — action variant: default background
sys.color.accent.hover        — action variant: hover background
sys.color.accent.active       — action variant: pressed background
sys.color.text.inverse        — action variant: label text
sys.color.surface.raised      — secondary-action variant: default background
sys.color.state.hover         — secondary-action variant: hover overlay
sys.color.border.interactive  — secondary-action variant: border
sys.color.text.primary        — secondary-action variant: label text
sys.color.text.muted          — quiet-action variant: label text
sys.color.state.disabled      — disabled surface (all variants)
sys.color.text.disabled       — disabled label (all variants)
sys.font.body.family          — label font family
sys.font.body.size            — label font size
sys.font.body.weight          — label weight (medium override at component level)
sys.space.inset.sm            — compact variant: horizontal padding
sys.space.inset.md            — default variant: horizontal padding
sys.space.stack.xs            — vertical padding (all variants)
sys.radius.control            — button rounding
sys.motion.duration.feedback  — hover and press transition duration
sys.motion.ease.interface     — transition easing
sys.a11y.focus.ring           — focus ring style
sys.a11y.focus.color          — focus ring color
sys.a11y.focus.width          — focus ring width
sys.a11y.focus.offset         — focus ring offset
sys.a11y.disabled.opacity     — disabled state opacity
sys.a11y.disabled.cursor      — disabled cursor
sys.a11y.touch.target.minimum — minimum touch/click target size
```

---

## States

```
default
hover
focus
active (pressed)
disabled
loading
```

## Variants

```
action           — primary CTA, accent-colored
secondary-action — supporting action, bordered surface
quiet-action     — low-emphasis, ghost/text style
```

## Sizes

```
default — standard interface size
compact — reduced padding for dense UI contexts
```

## Slots

```
label              — required visible text
leading-icon       — optional icon before label
trailing-icon      — optional icon after label
loading-indicator  — replaces content during loading state
```

---

## Responsive Requirements

```
Must maintain sys.a11y.touch.target.minimum on mobile
Label must not truncate without explicit max-width constraint
Loading state must preserve button dimensions (no layout shift)
```

---

## Accessibility Requirements

```
Role: button (native <button> or role="button" with tabindex)
Keyboard: Enter and Space activation required
Focus: Visible focus ring using sys.a11y.focus.* tokens
Accessible name: Required — label text or aria-label
Disabled: aria-disabled="true" (not HTML disabled, to preserve tab focus for UX context)
Loading: aria-busy="true" during loading state
Icon-only: aria-label required when no visible label
```

## Motion Requirements

```
Pattern: Focus Transition (focus ring appearance)
Pattern: Button Press Feedback (hover/active background shift)
Intensity: low
Reduced-motion: Instant state change — no transition
```

---

## Forbidden Usage

```
As navigation element without explicit nav contract
As form submission without form context
Decorative-only usage
Nested interactive elements inside button
Icon-only without aria-label
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
