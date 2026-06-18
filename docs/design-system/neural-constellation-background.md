# Neural Constellation Background

## Purpose

NV-600.8 adds a subtle animated environmental layer to the global background system. The layer suggests neural activity, semantic relationships, and a living knowledge field while remaining subordinate to content.

## Technical Approach

The implementation is CSS + inline SVG:

- `website/styles/neural-constellation.css` owns presentation and motion.
- `website/index.html` hosts one decorative SVG layer.
- `website/styles/background.css` owns profile intensity variables.

Canvas, WebGL, shaders, particle libraries, and JavaScript animation loops are not used.

## Visual Model

The layer contains:

- small low-opacity neural nodes;
- thin semantic connection curves;
- rare low-contrast signal pulses along selected connections;
- very slow field drift controlled by Motion Foundation tokens.

It must never look like a starfield, screensaver, game map, or neon particle effect.

## Profile Intensity

The constellation consumes profile variables from the Global Background System:

- `landing`: medium-high
- `home`: medium
- `learning`: low
- `modules`: low
- `workspace`: very low
- `retrieval`: nearly invisible
- `presentation`: minimal
- `settings`: static/off-like
- `default`: low

## Reduced Motion

When `prefers-reduced-motion: reduce` is active, drift and signal pulses stop. The layer remains static and decorative.

## Accessibility

The layer is `aria-hidden="true"` and `pointer-events: none`. It does not encode information needed to complete any task.

## Performance

The layer uses CSS transforms and opacity transitions only. There are no timers, observers, requestAnimationFrame loops, or graph/retrieval coupling.
