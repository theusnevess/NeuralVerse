# T2 — Reference Token Catalog

## Stage
T2 of 8

## Objective
Register all Reference-layer (ref.*) tokens across all approved domains.

Reference tokens are raw scale values. They are never used directly in components or context regions. They exist only to be consumed by semantic tokens.

## Deliverables

### Color Reference Tokens
```
ref.color.graphite.950   — Deepest graphite. Application base.
ref.color.graphite.900   — Deep graphite. Primary panel surface.
ref.color.graphite.850   — Mid graphite. Card surface.
ref.color.graphite.800   — Graphite. Elevated card / hover surface.
ref.color.cyan.500       — Scientific cyan. Primary accent base.
ref.color.cyan.400       — Lighter cyan. Hover accent state.
ref.color.cyan.300       — Lightest cyan. Active accent state.
ref.color.green.500      — Laboratory green. Success indicator base.
ref.color.amber.500      — Amber. Anomaly/warning indicator base.
ref.color.red.500        — Red. Critical/error indicator base.
ref.color.blue.500       — Blue. Information indicator base.
ref.color.white          — Pure white. Text and inverse surface base.
ref.color.black          — Pure black. Reserved.
ref.color.transparent    — Transparency base.
```

### Typography Reference Tokens
```
ref.font.family.primary     — Primary interface sans-serif family.
ref.font.family.display     — Display / heading variant family.
ref.font.family.monospace   — Monospace family for code and technical labels.
ref.font.size.100           — Smallest type size step.
ref.font.size.200
ref.font.size.300
ref.font.size.400           — Base body size.
ref.font.size.500
ref.font.size.600
ref.font.size.700
ref.font.size.800
ref.font.size.900           — Largest display size step.
ref.font.weight.regular     — 400
ref.font.weight.medium      — 500
ref.font.weight.semibold    — 600
ref.font.weight.bold        — 700
ref.font.line-height.tight  — Tight line height for headings.
ref.font.line-height.normal — Normal line height for UI.
ref.font.line-height.relaxed — Relaxed for comfortable reading.
ref.font.line-height.reading — Optimized for long-form reading sessions.
ref.font.tracking.tight     — Tight letter spacing.
ref.font.tracking.normal    — Default letter spacing.
ref.font.tracking.wide      — Wide letter spacing for labels/caps.
```

### Spacing Reference Tokens
```
ref.space.0     — 0
ref.space.100   — Smallest step.
ref.space.200
ref.space.300
ref.space.400   — Medium step.
ref.space.500
ref.space.600
ref.space.700
ref.space.800
ref.space.900
ref.space.1000  — Largest step.
```

### Radius Reference Tokens
```
ref.radius.none     — 0. No rounding.
ref.radius.subtle   — 1–2px range. Scientific instrument aesthetic.
ref.radius.soft     — Moderate soft edge.
ref.radius.moderate — Balanced rounding.
ref.radius.round    — Full pill / circle.
```

### Border Reference Tokens
```
ref.border.width.none      — 0.
ref.border.width.thin      — 1px.
ref.border.width.standard  — 1–2px.
ref.border.width.emphasis  — 2px+. Active/focus emphasis.
```

### Shadow Reference Tokens
```
ref.shadow.none    — No shadow.
ref.shadow.subtle  — Barely visible lift.
ref.shadow.soft    — Soft lift for cards.
ref.shadow.medium  — Medium lift for overlays.
```

### Motion Reference Tokens
```
ref.motion.duration.instant  — 0ms. Immediate state.
ref.motion.duration.fast     — Short transition.
ref.motion.duration.normal   — Standard interface transition.
ref.motion.duration.slow     — Panel / overlay transitions.
ref.motion.ease.standard     — Standard easing curve.
ref.motion.ease.enter        — Element entering view.
ref.motion.ease.exit         — Element leaving view.
ref.motion.ease.emphasized   — Emphasized motion (reserved for approved patterns).
```

### Z-Index Reference Tokens
```
ref.z.0   — Base layer.
ref.z.10
ref.z.20
ref.z.30
ref.z.40
ref.z.50
ref.z.60
ref.z.70
ref.z.80
ref.z.90  — Highest reference level.
```

## Gate
All ref.* tokens documented with name and purpose. No CSS values assigned.

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
