# Task Package — NV-023-TASK-009A

## Task ID

```text
NV-023-TASK-009A
```

## Task Name

```text
F1–F3 Foundation Components Implementation
```

## Milestone

```text
M2 Foundation Components — Limited: F1, F2, F3
```

## Authorization

```text
HUB AUTHORIZED — following APPROVE M7 (NV-023-TASK-008A)
```

---

## Purpose

Implement the first safe subset of Foundation Components (F1–F3) in `website/styles/components.css`.

This task does NOT implement F4–F9.

This task does NOT implement regions, layout, or shell.

---

## Scope

```text
Implementation of website/styles/components.css — F1, F2, F3 only.
Creation of NV-023-TASK-009A documentation package.
Backlog update.
```

---

## Authorized Files

```text
website/styles/components.css
docs/implementation/phase-1/packages/NV-023-TASK-009A.md   (this file)
docs/implementation/phase-1/reviews/NV-023-TASK-009A_REVIEW.md
docs/implementation/phase-1/validations/NV-023-TASK-009A_VALIDATION.md
docs/implementation/phase-1/backlog/PHASE_1_BACKLOG.md
```

---

## Forbidden Files

```text
website/index.html
website/styles/tokens.css
website/styles/base.css
website/styles/layout.css
website/styles/utilities.css
website/scripts/main.js
website/scripts/navigation.js
website/scripts/ui-state.js
```

---

## Components Implemented

### F1 — Divider

```text
Registry: component-f1-divider
Selectors: .nv-divider, .nv-divider[aria-orientation="vertical"]
Token deps verified: sys.color.divider.default, sys.color.border.subtle,
                     sys.space.stack.sm, sys.space.inline.xs, sys.border.subtle
Motion: none (registered as none)
Accessibility: decorative by default — aria-hidden/role="separator" in markup
```

### F2 — Badge

```text
Registry: component-f2-badge
Selectors: .nv-badge and [data-variant="neutral|info|success|warning|error"]
Token deps verified: sys.color.semantic.*, sys.color.surface.overlay,
                     sys.color.text.primary/inverse, sys.font.caption.*,
                     sys.radius.badge, sys.space.inset.xs, sys.space.inline.xs
Motion: none (registered as none)
Accessibility: non-interactive, pointer-events: none, user-select: none
Note: sys.color.accent.subtle is transparent (governed deferred NV-023-TASK-007B).
      Neutral variant uses sys.color.surface.overlay as safe fallback.
```

### F3 — Button

```text
Registry: component-f3-button
Selectors: .nv-button and all authorized states/variants
Token deps verified: sys.color.accent.*, sys.color.surface.raised/overlay,
                     sys.color.border.default/strong, sys.color.text.primary/inverse,
                     sys.font.body.*, sys.space.inset.sm/md, sys.space.inline.sm,
                     sys.radius.control, sys.border.interactive,
                     sys.motion.duration.feedback, sys.motion.ease.interface,
                     sys.a11y.focus.ring/offset, sys.a11y.disabled.opacity/cursor,
                     sys.a11y.touch.target.minimum
Motion: Button Press Feedback (low), Focus Transition (reduced)
Accessibility: :focus-visible, :disabled, [aria-disabled="true"]
```

---

## NOT Implemented (F4–F9)

```text
F4 Input     — deferred to NV-023-TASK-009B
F5 Textarea  — deferred to NV-023-TASK-009B
F6 Checkbox  — deferred to NV-023-TASK-009B
F7 Radio     — deferred to NV-023-TASK-009B
F8 Switch    — deferred to NV-023-TASK-009B
F9 Tooltip   — deferred to NV-023-TASK-009B
```

---

## Token Governance

All 38 `var(--*)` references cross-checked against:

- `docs/design-system/TOKEN_REGISTRY.md` — all present ✅
- `website/styles/tokens.css` — all present ✅

Zero unregistered tokens consumed.

Zero raw color, spacing, typography, radius, border, or shadow values (except browser normalization: `1em` vertical height for inline divider, `transparent` values via token, `none` for layout resets).

---

## Motion Governance

| Component | Motion Pattern | Registry Entry | Intensity |
| :--- | :--- | :--- | :--- |
| F1 Divider | none | none registered | — |
| F2 Badge | none | none registered | — |
| F3 Button hover/active | Button Press Feedback | motion-button-press-feedback | low |
| F3 Button focus | Focus Transition | motion-focus-transition | reduced |

Zero `@keyframes`. Zero decorative animation. Zero infinite loops.

Motion inherits reduced-motion baseline from `base.css` and token remap from `tokens.css`.

---

## Definition of Complete

```text
F1, F2, F3 implemented with verified tokens
F4–F9 absent
No forbidden files modified
No forbidden selectors
No @keyframes
Accessibility states implemented
Reduced-motion compatible via base.css + tokens.css inheritance
Repository clean
Commit made
```

---

## Validation Commands

```bash
git diff --check
git status
git diff --name-only HEAD~1 HEAD

grep -o "var(--[^)]*)" website/styles/components.css | sed 's/var(//;s/)//' | sort -u
grep -n "@keyframes" website/styles/components.css
grep -n "\.nv-input\|\.nv-textarea\|\.nv-checkbox\|\.nv-radio\|\.nv-switch\|\.nv-tooltip" website/styles/components.css
```

---

## Canonical References

```text
COMPONENT_REGISTRY.md — F1, F2, F3 entries
ACCESSIBILITY_MATRIX.md — a11y-f1, a11y-f2, a11y-f3 entries
MOTION_REGISTRY.md — motion-button-press-feedback, motion-focus-transition
TOKEN_REGISTRY.md — all consumed tokens
website/styles/tokens.css — implemented token layer
website/styles/base.css — reduced motion baseline
```

---

## Review Log

```text
NV-023-TASK-009A created.
Author: Antigravity
Date: 2026-06-08
Status: IN PROGRESS
```
