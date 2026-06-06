# T4 — Context Token Catalog

## Stage
T4 of 8

## Objective
Register all Context-layer (ctx.*) tokens. These tokens assign semantic roles to specific layout regions and shell areas.

Context tokens must always consume semantic tokens. They must never consume reference tokens directly.

---

## Deliverables

### Shell Header Context Tokens
```
ctx.shell.header.surface  — Header background. Consumes sys.color.background.base.
ctx.shell.header.border   — Header bottom border. Consumes sys.color.border.subtle.
ctx.shell.padding         — Header internal padding. Consumes sys.space.inset.md.
ctx.shell.z               — Header z-index. Consumes sys.z.sticky.
```

### Navigation Rail Context Tokens
```
ctx.nav.rail.surface      — Nav rail background. Consumes sys.color.surface.base.
ctx.nav.rail.border       — Nav rail edge border. Consumes sys.color.border.subtle.
ctx.nav.rail.padding      — Nav rail internal padding. Consumes sys.space.inset.sm.
ctx.nav.item.text         — Nav item default text. Consumes sys.color.text.secondary.
ctx.nav.item.text-active  — Nav item active text. Consumes sys.color.accent.primary.
ctx.nav.item.surface-hover  — Nav item hover background. Consumes sys.color.state.hover.
ctx.nav.item.surface-active — Nav item active background. Consumes sys.color.state.selected.
ctx.nav.motion            — Nav transitions. Consumes sys.motion.duration.transition.
ctx.nav.z                 — Nav rail z-index. Consumes sys.z.raised.
```

### Workspace Context Tokens
```
ctx.workspace.background  — Workspace base background. Consumes sys.color.background.base.
ctx.workspace.surface     — Workspace content surface. Consumes sys.color.surface.raised.
ctx.workspace.border      — Workspace region border. Consumes sys.color.border.subtle.
ctx.workspace.padding     — Workspace internal padding. Consumes sys.space.inset.lg.
ctx.workspace.radius      — Workspace surface rounding. Consumes sys.radius.surface.
ctx.workspace.elevation   — Workspace surface elevation. Consumes sys.elevation.1.
```

### Context Panel Context Tokens
```
ctx.context-panel.surface    — Panel background. Consumes sys.color.surface.base.
ctx.context-panel.border     — Panel left border. Consumes sys.color.border.subtle.
ctx.context-panel.padding    — Panel internal padding. Consumes sys.space.inset.md.
ctx.panel.radius             — Panel rounding. Consumes sys.radius.surface.
ctx.panel.elevation          — Panel elevation. Consumes sys.elevation.2.
ctx.panel.motion             — Panel expand/collapse. Consumes sys.motion.duration.transition.
ctx.context-panel.z          — Panel z-index. Consumes sys.z.overlay.
```

### Reading Surface Context Tokens
```
ctx.reading.surface      — Reading area background. Consumes sys.color.surface.raised.
ctx.reading.text         — Reading area body text. Consumes sys.color.text.primary.
ctx.reading.muted        — Reading area secondary text. Consumes sys.color.text.muted.
ctx.reading.section-gap  — Space between reading sections. Consumes sys.space.stack.xl.
ctx.reading.block-gap    — Space between content blocks. Consumes sys.space.stack.md.
ctx.reading.body.font    — Reading body font. Consumes sys.font.body.family.
ctx.reading.heading.font — Reading heading font. Consumes sys.font.display.family.
ctx.reading.caption.font — Reading caption font. Consumes sys.font.body.family.
ctx.reading.code.font    — Reading code font. Consumes sys.font.code.family.
```

### Overlay Context Tokens
```
ctx.overlay.backdrop  — Overlay backdrop tint. Consumes ref.color.black (opacity controlled).
ctx.overlay.surface   — Overlay panel surface. Consumes sys.color.surface.overlay.
ctx.overlay.radius    — Overlay panel rounding. Consumes sys.radius.overlay.
ctx.overlay.elevation — Overlay elevation. Consumes sys.elevation.4.
ctx.overlay.motion    — Overlay open/close motion. Consumes sys.motion.duration.overlay.
ctx.overlay.z         — Overlay z-index. Consumes sys.z.overlay.
ctx.modal.elevation   — Modal-specific elevation. Consumes sys.elevation.4.
ctx.modal.z           — Modal z-index. Consumes sys.z.modal.
```

### Navigation Context Tokens
```
ctx.navigation.label.font    — Nav label typography. Consumes sys.font.body.family.
ctx.navigation.meta.font     — Nav meta text. Consumes sys.font.caption.family.
```

### Workspace Label Context Tokens
```
ctx.workspace.label.font     — Workspace label typography. Consumes sys.font.caption.family.
ctx.workspace.metadata.font  — Workspace metadata typography. Consumes sys.font.caption.family.
```

### Feedback Context Tokens
```
ctx.feedback.motion  — Feedback motion (button responses, etc.). Consumes sys.motion.duration.feedback.
```

## Gate
All ctx.* tokens documented with name, purpose, and sys.* dependency. No CSS values assigned.

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
