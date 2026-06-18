# Background Provider

## Purpose

The React background helpers expose the NV-600.2 background profile system to future React Islands without giving React ownership of application state.

## Components

```text
NvBackgroundProvider
NvBackgroundSurface
NvBackgroundProfile
```

## Boundary

React owns:

- presentation wrappers
- profile attributes
- composition

Existing JavaScript owns:

- routing
- workspace state
- retrieval state
- graph state
- persistence
- evidence logic

## Data Contract

```jsx
<NvBackgroundProvider profile="retrieval">
  {children}
</NvBackgroundProvider>
```

Allowed profile values:

```text
default
learning
workspace
retrieval
presentation
landing
```

Unknown values fall back to `default`.

## Fallback Behavior

The application-level background is CSS-based and works even if React fails to load. React helpers are progressive enhancement for future scoped surfaces.

## Motion Behavior

Ambient motion is controlled by CSS and the NV-600.1 motion tokens. `prefers-reduced-motion: reduce` disables ambient drift.

## Styling Contract

- No CSS-in-JS.
- No hardcoded colors.
- No domain data in React helpers.
- No background-specific overrides for foreground components.

## QA Requirements

Validate each consuming surface for:

- no horizontal overflow
- no contrast regression
- no console errors
- reduced motion behavior
- background remaining behind foreground UI
