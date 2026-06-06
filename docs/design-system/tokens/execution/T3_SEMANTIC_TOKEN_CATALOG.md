# T3 — Semantic Token Catalog

## Stage
T3 of 8

## Objective
Register all Semantic-layer (sys.*) tokens. These tokens define purposeful, reusable roles consumed by context tokens and components.

Semantic tokens must always consume reference tokens. They must never define raw values.

---

## Deliverables

### Semantic Color Tokens
```
sys.color.background.base     — App-level base background. Consumes ref.color.graphite.950.
sys.color.background.subtle   — Subtle background variant. Consumes ref.color.graphite.900.
sys.color.surface.base        — Primary panel surface. Consumes ref.color.graphite.900.
sys.color.surface.raised      — Elevated card surface. Consumes ref.color.graphite.850.
sys.color.surface.overlay     — Overlay/modal surface. Consumes ref.color.graphite.800.
sys.color.border.subtle       — Barely visible separator. Consumes ref.color.graphite.800.
sys.color.border.default      — Standard border. Consumes ref.color.graphite.800.
sys.color.border.strong       — High-contrast border. Consumes ref.color.graphite.800 variant.
sys.color.divider.default     — Section divider. Consumes sys.color.border.subtle.
sys.color.text.primary        — Main readable text. Consumes ref.color.white or approved base.
sys.color.text.secondary      — Supporting text. Lower contrast.
sys.color.text.muted          — De-emphasized text. Metadata, labels.
sys.color.text.disabled       — Disabled state text.
sys.color.text.inverse        — Text on accent/primary surfaces.
sys.color.accent.primary      — Primary brand accent. Consumes ref.color.cyan.500.
sys.color.accent.hover        — Accent hover state. Consumes ref.color.cyan.400.
sys.color.accent.active       — Accent active/pressed state. Consumes ref.color.cyan.300.
sys.color.accent.subtle       — Tinted accent background for selection states.
sys.color.semantic.success    — Stable/success. Consumes ref.color.green.500.
sys.color.semantic.warning    — Anomaly/warning. Consumes ref.color.amber.500.
sys.color.semantic.error      — Critical/error. Consumes ref.color.red.500.
sys.color.semantic.info       — Information/data. Consumes ref.color.blue.500.
sys.color.state.hover         — Generic hover overlay tint.
sys.color.state.active        — Generic active/pressed tint.
sys.color.state.focus         — Focus ring color base. Consumes sys.color.accent.primary.
sys.color.state.selected      — Selected state tint. Consumes sys.color.accent.subtle.
sys.color.state.disabled      — Disabled state overlay tint.
```

### Semantic Typography Tokens
```
sys.font.body.family        — Interface body font. Consumes ref.font.family.primary.
sys.font.display.family     — Display / heading font. Consumes ref.font.family.display.
sys.font.code.family        — Code / monospace font. Consumes ref.font.family.monospace.
sys.font.body.size          — Body text size. Consumes ref.font.size.400.
sys.font.body.weight        — Body text weight. Consumes ref.font.weight.regular.
sys.font.body.line-height   — Body line height. Consumes ref.font.line-height.normal.
sys.font.heading.size       — Heading size. Consumes ref.font.size.600+.
sys.font.heading.weight     — Heading weight. Consumes ref.font.weight.semibold.
sys.font.heading.line-height — Heading line height. Consumes ref.font.line-height.tight.
sys.font.caption.size       — Caption / label size. Consumes ref.font.size.200.
sys.font.caption.weight     — Caption weight. Consumes ref.font.weight.medium.
sys.font.caption.line-height — Caption line height. Consumes ref.font.line-height.normal.
sys.font.code.size          — Code text size. Consumes ref.font.size.300.
sys.font.code.weight        — Code weight. Consumes ref.font.weight.regular.
sys.font.code.line-height   — Code line height. Consumes ref.font.line-height.relaxed.
```

### Semantic Spacing Tokens
```
sys.space.inline.xs    — Extra-small inline spacing.
sys.space.inline.sm    — Small inline spacing.
sys.space.inline.md    — Medium inline spacing.
sys.space.inline.lg    — Large inline spacing.
sys.space.stack.xs     — Extra-small vertical stack spacing.
sys.space.stack.sm     — Small vertical stack spacing.
sys.space.stack.md     — Medium vertical stack spacing.
sys.space.stack.lg     — Large vertical stack spacing.
sys.space.stack.xl     — Extra-large vertical stack spacing.
sys.space.inset.xs     — Extra-small inset padding.
sys.space.inset.sm     — Small inset padding.
sys.space.inset.md     — Medium inset padding.
sys.space.inset.lg     — Large inset padding.
sys.space.layout.gap   — Standard layout gap between regions.
sys.space.layout.section — Section-level spacing unit.
```

### Semantic Radius Tokens
```
sys.radius.surface  — Default surface rounding. Consumes ref.radius.subtle.
sys.radius.control  — Interactive control rounding. Consumes ref.radius.soft.
sys.radius.overlay  — Panel / overlay rounding. Consumes ref.radius.moderate.
sys.radius.badge    — Badge / pill rounding. Consumes ref.radius.round.
```

### Semantic Border Tokens
```
sys.border.subtle       — Least visible separation. Consumes ref.border.width.thin.
sys.border.default      — Standard separation. Consumes ref.border.width.standard.
sys.border.strong       — Emphasis separation. Consumes ref.border.width.emphasis.
sys.border.interactive  — Interactive element border. Consumes ref.border.width.standard.
```

### Semantic Elevation / Shadow Tokens
```
sys.elevation.0  — Base surface. No elevation.
sys.elevation.1  — Subtle lift. Panels.
sys.elevation.2  — Moderate lift. Cards.
sys.elevation.3  — Elevated lift. Elevated cards.
sys.elevation.4  — Overlay lift. Modals and command palette.
sys.shadow.surface  — Shadow for level-1 surfaces.
sys.shadow.overlay  — Shadow for overlay panels.
sys.shadow.modal    — Shadow for modal surfaces.
```

### Semantic Motion Tokens
```
sys.motion.duration.feedback    — Immediate feedback (button press, etc.). Consumes ref.motion.duration.fast.
sys.motion.duration.transition  — Interface state transitions. Consumes ref.motion.duration.normal.
sys.motion.duration.overlay     — Panel/modal open-close. Consumes ref.motion.duration.slow.
sys.motion.ease.interface       — Standard interface easing. Consumes ref.motion.ease.standard.
sys.motion.ease.panel           — Panel open/close easing. Consumes ref.motion.ease.enter/exit.
sys.motion.ease.overlay         — Overlay easing. Consumes ref.motion.ease.enter/exit.
sys.motion.intensity.none       — No motion. Disabled state.
sys.motion.intensity.reduced    — Minimal motion. For reduced-motion preference.
sys.motion.intensity.low        — Low intensity. Standard interface transitions.
sys.motion.intensity.medium     — Medium intensity. Panel and overlay transitions.
```

> **FORBIDDEN:** `sys.motion.intensity.high` — Not an approved intensity level.

### Semantic Z-Index Tokens
```
sys.z.base          — Base layer. Content.
sys.z.raised        — Raised elements. Sticky headers.
sys.z.dropdown      — Dropdown menus.
sys.z.sticky        — Sticky interface elements.
sys.z.overlay       — Context panels, drawers.
sys.z.drawer        — Drawer overlays.
sys.z.modal         — Modal surfaces.
sys.z.notification  — Notifications and toasts.
sys.z.debug         — Debug/dev tooling only.
```

## Gate
All sys.* tokens documented with name, purpose, and ref.* dependency. No CSS values assigned.

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
