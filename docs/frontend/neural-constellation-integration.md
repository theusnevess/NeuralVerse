# Neural Constellation Integration

## Boundary

The Neural Constellation Background is a presentation-only layer. It does not read or mutate routing, Retrieval state, graph state, evidence state, persistence, or user input.

## Files

- `website/index.html`: decorative SVG host.
- `website/styles/neural-constellation.css`: constellation rendering and motion.
- `website/styles/background.css`: profile intensity variables.
- `react-build/src/background/NvBackground.jsx`: profile names recognized by future React wrappers.

## Profile Contract

Existing route state continues to drive `data-workspace-active-view` on `.nv-main-workspace`. CSS selectors map those route profiles to constellation intensity.

React wrappers can still opt into a profile through:

```jsx
<NvBackgroundProvider profile="retrieval">
  {children}
</NvBackgroundProvider>
```

React only applies the profile attribute. CSS owns visuals.

## Reduced Motion

Reduced motion is handled in CSS. Drift and signal pulse animations are disabled, and the layer remains static.

## QA Expectations

Validate that the layer remains behind all UI, does not block pointer interaction, does not introduce failed asset requests, and does not create horizontal overflow at `390`, `768`, `1024`, and `1440` pixels.
