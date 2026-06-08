# TOKEN_DEPENDENCY_MAP.md

## Purpose
Define the canonical dependency direction between token layers and critical cross-domain dependencies.

---

## Dependency Direction

### Approved
```
Reference → Semantic → Context → Component
```

### Forbidden
```
Component → Context          (reverse inheritance)
Component → Semantic         (reverse inheritance)
Semantic → Reference mutation (semantic layer must not redefine ref values)
Context → Reference direct override (ctx must consume sys, not ref directly)
```

---

## Critical Token Dependencies

### Color Chain

| Consumer | Depends On | Source Decision |
| :--- | :--- | :--- |
| `sys.color.text.primary` | `ref.color.white` or approved text base | NV-010, NV-017 |
| `sys.color.text.secondary` | `ref.color.graphite.800` | NV-010, NV-023-TASK-007B (C-001) |
| `sys.color.text.muted` | `ref.color.graphite.800` | NV-010, NV-023-TASK-007B (C-001) |
| `sys.color.text.disabled` | `ref.color.graphite.800` | NV-010, NV-023-TASK-007B (C-001) |
| `sys.color.accent.primary` | `ref.color.cyan.*` | NV-010 |
| `sys.color.background.base` | `ref.color.graphite.950` | NV-010 |
| `sys.color.surface.base` | `ref.color.graphite.900` | NV-010 |
| `sys.color.surface.raised` | `ref.color.graphite.850` | NV-010 |
| `sys.color.overlay.backdrop` | `ref.color.black` | NV-010, NV-023-TASK-007B (C-002) |
| `ctx.nav.rail.surface` | `sys.color.surface.base` | NV-012, NV-015 |
| `ctx.workspace.surface` | `sys.color.surface.raised` | NV-012 |
| `ctx.shell.header.surface` | `sys.color.background.base` | NV-012 |
| `ctx.overlay.backdrop` | `sys.color.overlay.backdrop` | NV-012, NV-023-TASK-007B (C-002) |

> **Governed Deferred Decisions (C-001 — NV-023-TASK-007B):**
> The following tokens require alpha-channel reference values not yet in the approved ref.* palette.
> They consume `ref.color.transparent` as a safe fallback until NV-010 defines the alpha scale.
>
> | Token | Deferred Dependency | Blocker |
> | :--- | :--- | :--- |
> | `sys.color.accent.subtle` | `ref.color.cyan.alpha-100` (pending) | NV-010 amendment |
> | `sys.color.state.hover` | `ref.color.white.alpha-08` (pending) | NV-010 amendment |
> | `sys.color.state.active` | `ref.color.white.alpha-12` (pending) | NV-010 amendment |
> | `sys.color.state.disabled` | `ref.color.white.alpha-04` (pending) | NV-010 amendment |

### Accessibility Chain

| Consumer | Depends On | Source Decision |
| :--- | :--- | :--- |
| `sys.a11y.focus.color` | `sys.color.accent.primary` | NV-017 |
| `sys.a11y.motion.reduced` | `sys.motion.intensity.none` | NV-016, NV-017 |
| `sys.a11y.contrast.standard` | `sys.color.text.primary` + `sys.color.background.base` | NV-010, NV-017 |

### Typography Chain

| Consumer | Depends On | Source Decision |
| :--- | :--- | :--- |
| `ctx.reading.body.font` | `sys.font.body.*` | NV-011 |
| `ctx.reading.heading.font` | `sys.font.heading.*` | NV-011 |
| `ctx.reading.code.font` | `sys.font.code.*` | NV-011 |
| `ctx.navigation.label.font` | `sys.font.body.*` | NV-011, NV-015 |

### Spacing Chain

| Consumer | Depends On | Source Decision |
| :--- | :--- | :--- |
| `ctx.reading.section-gap` | `sys.space.stack.*` | NV-012 |
| `ctx.shell.padding` | `sys.space.inset.*` | NV-012 |
| `ctx.nav.rail.padding` | `sys.space.inset.*` | NV-012, NV-015 |

### Motion Chain

| Consumer | Depends On | Source Decision |
| :--- | :--- | :--- |
| `ctx.nav.motion` | `sys.motion.duration.transition` | NV-016 |
| `ctx.panel.motion` | `sys.motion.duration.transition` | NV-016 |
| `ctx.overlay.motion` | `sys.motion.duration.overlay` | NV-016 |
| `ctx.feedback.motion` | `sys.motion.duration.feedback` | NV-016 |

---

## Validation

A token dependency is valid only if:
- The consumer is at a higher layer than the provider
- The provider exists in the TOKEN_REGISTRY
- The chain can be traced to a canonical NV-0xx decision

---

## Governed Exception Registry (C-003 — NV-023-TASK-007B)

The following `sys.a11y.*` tokens hold raw scalar values without a corresponding `ref.a11y.*` token.
This is a formally governed exception, not a hierarchy violation.

### Rationale

Accessibility constants (touch target sizes, reading widths, focus offsets, disabled opacity)
are absolute WCAG-defined values, not visual style scales. Creating a `ref.a11y.*` scale would
add indirection without semantic benefit and could be confused with visual scale tokens.

### Governed Exception Entries

| Token | Value | Standard | Exception Type |
| :--- | :--- | :--- | :--- |
| `sys.a11y.focus.offset` | `3px` | WCAG 2.4.7 | Accessibility constant |
| `sys.a11y.disabled.opacity` | `0.38` | WCAG 1.4.3 | Accessibility constant |
| `sys.a11y.disabled.cursor` | `not-allowed` | WCAG 1.4.3 | Accessibility constant |
| `sys.a11y.touch.target.minimum` | `44px` | WCAG 2.5.5 | Accessibility constant |
| `sys.a11y.reading.width.standard` | `65ch` | NV-017 | Accessibility constant |
| `sys.a11y.reading.width.enhanced` | `75ch` | NV-017 | Accessibility constant |
| `sys.a11y.contrast.standard` | `4.5` | WCAG 1.4.3 | Accessibility constant |
| `sys.a11y.contrast.high` | `7` | WCAG 1.4.6 | Accessibility constant |

Decision: `ref.a11y.*` scale is NOT created. Exception approved by NV-023-TASK-007B.

---

## Change Log

```
NV-023-TASK-002 (Initial registration):
  Created with color, accessibility, typography, spacing, and motion chains.

NV-023-TASK-007B (M6 Condition Resolution):
  Color chain: Added sys.color.text.secondary/muted/disabled, sys.color.overlay.backdrop,
               ctx.overlay.backdrop consumption update.
  Governed deferred decisions: accent.subtle, state.hover/active/disabled.
  Governed exception: sys.a11y.* scalar constants (C-003).
```
