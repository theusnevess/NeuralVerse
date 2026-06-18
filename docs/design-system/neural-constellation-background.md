# Neural Constellation Background

## Purpose

NV-600.8 adds a subtle animated environmental layer to the global background system. NV-600.8-R1 corrects the rejected long-curve implementation and replaces it with a deterministic field of small local neural neighborhoods. The layer suggests neural activity, semantic relationships, and a living knowledge field while remaining subordinate to content.

## Technical Approach

The implementation is CSS + inline SVG:

- `website/styles/neural-constellation.css` owns presentation and motion.
- `website/index.html` hosts one decorative SVG layer.
- `website/styles/background.css` owns profile intensity variables.

Canvas, WebGL, shaders, particle libraries, and JavaScript animation loops are not used.

## Visual Model

The layer contains:

- many tiny low-opacity neural nodes;
- short local semantic connections only;
- deterministic local clusters of 3-8 nodes;
- rare low-contrast signal pulses along selected connections;
- very slow field drift controlled by Motion Foundation tokens.

It must never contain long viewport-spanning curves, sine-wave ribbons, decorative wires, visible cluster containers, starfields, screensaver motion, game-map particles, or neon effects.

## Local Cluster Field

The canonical field is authored as inline SVG clusters. Each cluster is a small semantic neighborhood with local edges capped well below the visual maximum of `160px`.

| Profile | Visible field | Intended feel |
|---|---:|---|
| `landing` | 14 clusters / 81 nodes / 70 local edges | identity-rich |
| `home` | 14 clusters / 81 nodes / 70 local edges | living research environment |
| `learning` / `modules` | 11 clusters / 63 nodes / 55 local edges | low reading noise |
| `workspace` | 8 clusters / 45 nodes / 40 local edges | instrument-like |
| `retrieval` | 5 clusters / 28 nodes / 25 local edges | nearly invisible |
| `presentation` | 8 clusters / 45 nodes / 40 local edges, no pulses | clean briefing surface |
| `settings` | 5 clusters / 28 nodes / 25 local edges, no pulses | static/off-like |

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
