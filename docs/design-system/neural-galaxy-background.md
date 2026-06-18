# Neural Galaxy Background

## Purpose

NV-600.8-R4 replaces the rejected CSS/SVG neural constellation with a Canvas 2D neural galaxy field. The layer is a global, decorative environment: it suggests a living AI research substrate while staying behind NeuralVerse content.

## Files

- `website/styles/neural-galaxy.css`
- `website/scripts/background/neural-galaxy.js`
- `website/index.html`

The legacy `website/scripts/neural-field.js` implementation is removed from the runtime. The previous SVG/CSS constellation stylesheet is not loaded by `index.html`.

## Technical Model

The implementation uses Canvas 2D only. It does not use WebGL, Three.js, particle libraries, external animation frameworks, or React Bits as a dependency.

The field contains:

- viewport-scaled node counts;
- three depth layers: far, mid, near;
- independent velocity-based drift per node;
- sinusoidal micro-drift per node;
- dynamic short-range local connections;
- rare signal pulses along existing short edges;
- deterministic generation based on profile and viewport bucket.

## Profile Intensities

| Profile | Density | Opacity | Motion |
|---|---:|---:|---:|
| landing | 1.15 | 1.00 | 1.00 |
| home | 1.00 | 0.90 | 0.90 |
| learning | 0.85 | 0.80 | 0.80 |
| modules | 0.80 | 0.75 | 0.75 |
| content | 0.80 | 0.75 | 0.75 |
| workspace | 0.55 | 0.55 | 0.50 |
| retrieval | 0.35 | 0.40 | 0.35 |
| presentation | 0.25 | 0.30 | 0.20 |
| settings | 0.15 | 0.20 | 0.00 |

## Motion

The frame loop is capped at 24 FPS. Animation pauses when the tab is hidden. Resize rebuilds are debounced. The canvas performs no DOM queries per frame.

## Reduced Motion

When `prefers-reduced-motion: reduce` is active, the renderer draws a static frame. It does not animate node drift, update connection dynamics, or emit pulses.

## Debugging

Set either:

```js
window.NV_DEBUG_NEURAL_GALAXY = true
```

or add the body class:

```text
nv-debug-neural-galaxy
```

The renderer logs profile, viewport, node count, edge count, FPS cap, DPR, and reduced-motion status. Runtime state is also available through:

```js
window.NeuralVerseBackground.neuralGalaxy.getState()
window.NeuralVerseBackground.neuralGalaxy.rebuild()
```

## Accessibility

The canvas host is marked `aria-hidden="true"`, has `pointer-events: none`, does not receive focus, and does not encode task-critical information.
