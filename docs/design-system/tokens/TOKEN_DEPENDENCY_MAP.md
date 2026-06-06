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
| `sys.color.accent.primary` | `ref.color.cyan.*` | NV-010 |
| `sys.color.background.base` | `ref.color.graphite.950` | NV-010 |
| `sys.color.surface.base` | `ref.color.graphite.900` | NV-010 |
| `sys.color.surface.raised` | `ref.color.graphite.850` | NV-010 |
| `ctx.nav.rail.surface` | `sys.color.surface.base` | NV-012, NV-015 |
| `ctx.workspace.surface` | `sys.color.surface.raised` | NV-012 |
| `ctx.shell.header.surface` | `sys.color.background.base` | NV-012 |

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
