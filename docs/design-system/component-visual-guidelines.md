# Component Visual Guidelines

## Cards

Cards should use one shared geometry system:

- compact internal padding
- subtle border
- quiet elevation
- no nested-card appearance unless the nested item is a true repeated artifact

Hover state is limited to a small surface lift, border refinement, and slight contrast increase.

## Buttons

Buttons support:

- Primary
- Secondary
- Ghost
- Context
- Icon-only

States must be visible for:

- default
- hover
- focus-visible
- active
- disabled
- selected when applicable

Do not create custom button surfaces inside feature CSS.

## Badges and Chips

Badges and chips share:

- pill radius
- caption typography
- compact padding
- token-based border
- baseline alignment

They should support scanning, not dominate hierarchy.

## Panels

Panels should align:

- header rhythm
- section spacing
- divider treatment
- action alignment
- metric grouping

Inspector, Compare, Presentation, Memory, and Workspace Snapshot should feel like the same family.

## Metrics

Metric rows should read as:

```text
label
value
optional microvisualization
```

Avoid oversized statistic cards unless the metric is the primary content.

## Microvisualizations

Microvisualizations answer one question each. Keep them compact and subordinate to text.

## Empty States

Empty states should follow:

```text
Scientific visual
Title
Short description
Primary action
Optional secondary action
```

Avoid verbose instructional copy.

## Forbidden Patterns

- Hardcoded colors
- Heavy outlines
- Strong glows
- Arbitrary spacing
- Component-specific button variants
- Decorative motion
- Page-specific visual forks
