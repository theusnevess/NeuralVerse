# React Premium Components

## Boundary

React components remain presentation-only.

React owns:

- composition
- rendering
- layout
- visual states

Existing JavaScript owns:

- workspace state
- retrieval state
- graph state
- persistence
- action execution
- routing

## Polished Components

The NV-600.3 polish layer applies to React-rendered components through shared CSS classes:

- `NvDiscoveryCard`
- `NvMemoryCard`
- `NvInspectorSection`
- `NvWorkspaceSnapshot`
- `NvHoverPreview`
- `NvContextMenu`
- shared badges, chips, buttons, metrics, and microvisualizations

## Styling Contract

React components must use:

- existing class names
- design tokens
- `premium-components.css`
- Motion Foundation tokens

React components must not use:

- CSS-in-JS
- hardcoded colors
- hardcoded spacing
- domain-specific styling forks

## Accessibility

Components must preserve:

- semantic buttons
- visible focus
- keyboard navigation
- accessible names
- reduced motion

## Future Guidance

New React islands should first reuse shared primitives and the premium polish layer. If a new component requires a visual exception, document the reason before adding local styles.
