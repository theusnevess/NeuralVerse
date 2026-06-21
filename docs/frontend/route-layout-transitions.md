# NV-600.6 — Route & Layout Transitions

## Purpose

Route and layout transitions preserve orientation when the NeuralVerse hash route changes or contextual page regions update.

Transitions must remain short, subtle, and non-blocking. They communicate that content changed without delaying navigation or drawing attention away from the interface.

## Motion Pattern

The canonical route transition uses:

```text
opacity: 0 -> 1
translateY: 4px -> 0
duration: motion-duration-enter
easing: motion-easing-decelerate
```

Breadcrumbs use the existing `NvMotion` slide reveal pattern with a small horizontal offset.

Context panel updates use a short opacity and vertical offset reveal on context values only.

## Implementation Boundary

This phase does not modify:

* router architecture;
* route definitions;
* hash behavior;
* Retrieval services;
* graph rendering;
* Evidence Compiler;
* persistence;
* React Island ownership;
* domain state.

The router still renders immediately. The transition is applied after the new content is already in the DOM.

## Integrated Surfaces

* main route content body;
* workspace content container;
* breadcrumb list updates;
* context panel value updates;
* layout section reveal utility.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active:

* route transitions are instant;
* transforms are disabled;
* context update animation is disabled;
* breadcrumb and layout reveal animations are disabled.

Navigation remains functional and no route render is delayed.

## Accessibility

Transitions are not the only signal of navigation. Route content, breadcrumbs, active navigation state, and screen-reader live updates continue to communicate state.

Existing focus behavior is preserved. The app continues to focus the main workspace after hash changes without adding aggressive focus movement.

## Performance

Transitions use only:

* opacity;
* transform.

No requestAnimationFrame loops, permanent timers, width or height animation, artificial loading screens, or duplicate route containers are introduced.
