# FOUNDATION_COMPONENT_DEPENDENCY_MAP.md

## Purpose
Define the canonical token dependency map for all M2 Foundation Components.

No component may consume reference tokens directly. All dependencies must flow through the semantic layer.

---

## Dependency Direction

```
ref.* → sys.* → ctx.* → cmp.*    (APPROVED)
Component → ref.* directly        (FORBIDDEN)
```

---

## F1 — Divider

```
sys.color.border.subtle   → visual separation line
sys.space.stack.sm        → vertical margin context
```

---

## F2 — Badge

```
sys.color.semantic.success  → success variant
sys.color.semantic.warning  → warning variant
sys.color.semantic.error    → error variant
sys.color.semantic.info     → info variant
sys.color.accent.subtle     → accent variant
sys.color.text.inverse      → badge label text
sys.font.caption.size       → badge label size
sys.font.caption.weight     → badge label weight
sys.radius.badge            → badge rounding
sys.space.inline.xs         → horizontal padding
```

---

## F3 — Button

```
sys.color.accent.primary    → primary action background
sys.color.accent.hover      → hover state background
sys.color.accent.active     → pressed state background
sys.color.text.inverse      → primary label text
sys.color.surface.raised    → secondary surface background
sys.color.state.hover       → secondary hover overlay
sys.color.text.primary      → secondary label text
sys.color.text.muted        → quiet variant text
sys.color.state.disabled    → disabled surface
sys.color.text.disabled     → disabled label
sys.font.body.size          → label size
sys.font.body.weight        → label weight (medium override)
sys.font.body.family        → label font
sys.space.inset.sm          → horizontal padding (compact)
sys.space.inset.md          → horizontal padding (default)
sys.radius.control          → button rounding
sys.border.interactive      → secondary border
sys.motion.duration.feedback → hover/press transition duration
sys.motion.ease.interface    → easing curve
sys.a11y.focus.ring         → focus indicator
sys.a11y.focus.color        → focus ring color
sys.a11y.focus.width        → focus ring width
sys.a11y.focus.offset       → focus ring offset
sys.a11y.disabled.opacity   → disabled state opacity
sys.a11y.disabled.cursor    → disabled cursor
sys.a11y.touch.target.minimum → minimum interactive size
```

---

## F4 — Input

```
sys.color.surface.base      → field background
sys.color.border.default    → default border
sys.color.border.strong     → focus border
sys.color.semantic.error    → error border
sys.color.text.primary      → input text
sys.color.text.muted        → placeholder text
sys.color.text.disabled     → disabled text
sys.color.state.disabled    → disabled surface
sys.font.body.size          → input text size
sys.font.body.family        → input font
sys.font.caption.size       → helper/error text size
sys.space.inset.sm          → internal padding
sys.radius.control          → field rounding
sys.border.default          → field border width
sys.motion.duration.feedback → border/focus transition
sys.a11y.focus.ring         → focus indicator
sys.a11y.focus.color        → focus ring color
sys.a11y.focus.width        → focus ring width
sys.a11y.touch.target.minimum → minimum field height
```

---

## F5 — Textarea

```
(All F4 — Input dependencies)
sys.font.body.line-height   → multi-line text line height
sys.font.code.family        → optional monospace mode
sys.space.inset.md          → larger internal padding
```

---

## F6 — Checkbox

```
sys.color.accent.primary    → checked state fill
sys.color.surface.base      → unchecked background
sys.color.border.default    → unchecked border
sys.color.text.primary      → label text
sys.color.text.disabled     → disabled label
sys.color.state.disabled    → disabled control surface
sys.font.body.size          → label size
sys.font.body.family        → label font
sys.radius.subtle           → control rounding
sys.motion.duration.feedback → check state transition
sys.a11y.focus.ring         → focus indicator
sys.a11y.focus.color        → focus ring color
sys.a11y.touch.target.minimum → minimum control area
```

---

## F7 — Radio

```
(All F6 — Checkbox dependencies, with full-circle rounding)
sys.radius.round            → radio button shape
```

---

## F8 — Switch

```
sys.color.accent.primary    → on-state track
sys.color.border.default    → off-state track
sys.color.surface.overlay   → thumb element
sys.color.text.primary      → label text
sys.color.text.disabled     → disabled label
sys.color.state.disabled    → disabled track
sys.radius.round            → track and thumb rounding
sys.motion.duration.feedback → thumb slide transition
sys.motion.ease.interface   → slide easing
sys.a11y.focus.ring         → focus indicator
sys.a11y.focus.color        → focus ring color
sys.a11y.touch.target.minimum → minimum interactive area
```

---

## F9 — Tooltip

```
sys.color.surface.overlay   → tooltip background
sys.color.text.inverse      → tooltip text
sys.color.border.subtle     → tooltip border (optional)
sys.font.caption.size       → tooltip text size
sys.font.caption.weight     → tooltip text weight
sys.font.body.family        → tooltip font
sys.space.inset.xs          → tooltip padding
sys.radius.surface          → tooltip rounding
sys.shadow.overlay          → tooltip elevation
sys.z.dropdown              → tooltip z-index
sys.motion.duration.feedback → show/hide transition
sys.motion.ease.enter       → tooltip enter easing
sys.motion.ease.exit        → tooltip exit easing
```

---

## Review Log

```
Created as part of NV-023-TASK-003.
```
