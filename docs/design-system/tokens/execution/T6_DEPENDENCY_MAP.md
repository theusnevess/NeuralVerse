# T6 — Dependency Map

## Stage
T6 of 8

## Objective
Validate and record all inter-token dependencies. Full map: See TOKEN_DEPENDENCY_MAP.md.

## Approved Direction
```
Reference → Semantic → Context → Component
```

## Forbidden (must be absent)
```
Component → Context
Component → Semantic
Semantic → Reference mutation
Context → Reference direct override
```

## Key Dependency Chains

### Color
```
ref.color.graphite.* → sys.color.background.* → ctx.shell.header.surface
ref.color.graphite.* → sys.color.surface.*    → ctx.nav.rail.surface / ctx.workspace.surface
ref.color.cyan.*     → sys.color.accent.*     → ctx.nav.item.text-active / sys.a11y.focus.color
ref.color.green.500  → sys.color.semantic.success
ref.color.amber.500  → sys.color.semantic.warning
ref.color.red.500    → sys.color.semantic.error
ref.color.blue.500   → sys.color.semantic.info
```

### Typography
```
ref.font.family.primary   → sys.font.body.family    → ctx.reading.body.font / ctx.navigation.label.font
ref.font.family.display   → sys.font.display.family → ctx.reading.heading.font
ref.font.family.monospace → sys.font.code.family    → ctx.reading.code.font
```

### Spacing
```
ref.space.* → sys.space.inset.* → ctx.shell.padding / ctx.nav.rail.padding / ctx.workspace.padding
ref.space.* → sys.space.stack.* → ctx.reading.section-gap / ctx.reading.block-gap
```

### Motion
```
ref.motion.duration.fast   → sys.motion.duration.feedback   → ctx.feedback.motion
ref.motion.duration.normal → sys.motion.duration.transition → ctx.nav.motion / ctx.panel.motion
ref.motion.duration.slow   → sys.motion.duration.overlay    → ctx.overlay.motion
sys.motion.intensity.reduced → sys.a11y.motion.reduced
sys.motion.intensity.none    → sys.a11y.motion.none
```

### Z-Index
```
ref.z.* → sys.z.sticky  → ctx.shell.z
ref.z.* → sys.z.raised  → ctx.nav.z
ref.z.* → sys.z.overlay → ctx.context-panel.z / ctx.overlay.z
ref.z.* → sys.z.modal   → ctx.modal.z
```

## Gate
All dependency chains traced. Forbidden directions confirmed absent.

## Status
```
READY
```

## Documentation Only
```
No CSS. No frontend code. No component implementation. No educational content. No backend.
```
