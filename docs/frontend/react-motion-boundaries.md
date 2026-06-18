# React Motion Boundaries

## Components

The React Motion Foundation provides:

- `NvMotionProvider`
- `NvMotionConfig`
- `NvFadeIn`
- `NvFadeOut`
- `NvSlideReveal`
- `NvScaleIn`
- `NvCollapse`
- `NvStaggerGroup`
- `NvPresence`
- `NvSharedTransition`

## Boundary

React owns:

- rendering
- composition
- motion wrappers
- presentation state only

Existing JavaScript owns:

- Retrieval state
- selection state
- persistence
- routing
- graph logic
- evidence compilation
- search semantics

## Provider

`NvMotionProvider` reads `prefers-reduced-motion` and exposes shared timing/easing metadata to React motion primitives.

The provider does not expose domain state.

## Island Integration

The React entrypoint wraps mounted islands with `NvMotionProvider`:

- `NvHoverPreview`
- `NvContextMenu`
- `NvDiscoveryCard`
- `NvInspectorPanel`
- `NvMemoryLayer`
- `NvWorkspaceSnapshot`
- `NvCompareWorkspace`
- `NvResearchPresentation`

## Reduced Motion

Components must remain useful when animation is reduced to instant state changes.

No component may rely on animation as the only way to communicate state.

## Forbidden Responsibilities

Motion components must not:

- fetch data
- mutate state
- write persistence
- alter route state
- re-run graph layout
- compile evidence
- own retrieval logic
