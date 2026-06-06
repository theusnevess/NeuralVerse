# T5 — Accessibility Token Catalog

## Stage
T5 of 8

## Objective
Register all Accessibility (sys.a11y.*) tokens. These tokens enforce WCAG compliance, focus management, reduced motion, and touch target standards.

Accessibility tokens must be traceable to NV-017 and the ACCESSIBILITY_MATRIX.

---

## Deliverables

### Focus Ring Tokens
```
sys.a11y.focus.ring     — Focus ring style definition (outline shorthand role).
sys.a11y.focus.offset   — Focus ring offset distance from element.
sys.a11y.focus.color    — Focus ring color. Consumes sys.color.accent.primary.
sys.a11y.focus.width    — Focus ring width. Consumes ref.border.width.emphasis.
```

### Contrast Tokens
```
sys.a11y.contrast.standard  — Standard contrast ratio target (WCAG AA: 4.5:1 text, 3:1 UI).
sys.a11y.contrast.high      — Enhanced contrast target (WCAG AAA: 7:1).
```

### Disabled State Tokens
```
sys.a11y.disabled.opacity  — Opacity for disabled elements.
sys.a11y.disabled.cursor   — Cursor value for disabled interactive elements.
sys.a11y.disabled.text     — Disabled text color. Consumes sys.color.text.disabled.
sys.a11y.disabled.surface  — Disabled surface color. Consumes sys.color.state.disabled.
```

### Motion Sensitivity Tokens
```
sys.a11y.motion.reduced  — Motion behavior for prefers-reduced-motion. Consumes sys.motion.intensity.reduced.
sys.a11y.motion.none     — Motion behavior for prefers-reduced-motion: no-preference off. Consumes sys.motion.intensity.none.
```

> **Note:** `sys.a11y.motion.reduced` resolves to `sys.motion.intensity.reduced`, never to `sys.motion.intensity.high`.

### Touch Target Tokens
```
sys.a11y.touch.target.minimum  — Minimum touch/click target size (44×44px WCAG 2.5.5).
```

### Reading Width Tokens
```
sys.a11y.reading.width.standard   — Standard comfortable reading width (~65ch).
sys.a11y.reading.width.enhanced   — Enhanced readability width (~75ch) for extended sessions.
```

---

## Accessibility Validation Chain

| Token | Depends On | WCAG Criterion |
| :--- | :--- | :--- |
| `sys.a11y.focus.color` | `sys.color.accent.primary` | 2.4.7 Focus Visible |
| `sys.a11y.contrast.standard` | `sys.color.text.primary` + `sys.color.background.base` | 1.4.3 Contrast (AA) |
| `sys.a11y.contrast.high` | `sys.color.text.primary` + `sys.color.background.base` | 1.4.6 Contrast (AAA) |
| `sys.a11y.motion.reduced` | `sys.motion.intensity.reduced` | 2.3.3 Animation from Interactions |
| `sys.a11y.touch.target.minimum` | — | 2.5.5 Target Size |
| `sys.a11y.disabled.opacity` | — | 1.4.3 Contrast (disabled exclusion applies) |

---

## Gate
All sys.a11y.* tokens documented with name, purpose, dependency, and WCAG reference. No CSS values assigned.

## Status
```
READY
```

## Documentation Only
```
No CSS.
No frontend code.
No component implementation.
No educational content.
No backend.
```

## Review Log
```
Created as part of NV-023-TASK-002.
```
