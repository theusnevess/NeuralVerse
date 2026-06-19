# Home Hero Semantic Field — NV-600.9-R7

## Living Semantic Atmosphere

The Home hero background is a distributed SVG semantic field replacing the previous editorial illustration. The core principle is **less artwork, more atmosphere**.

## Philosophy

> The background should feel as if the user is looking through a window into a living semantic field. The UI remains the protagonist.

## Composition

- **Left side** (0-45%): Negative space for logo, title, description, and CTAs. Never invaded by artwork.
- **Right side** (45-100%): Distributed semantic field composed of many tiny independent structures.

## Micro-Structure Distribution

| Element | Count | Description |
|---------|-------|-------------|
| Micro nodes | 120-160 | 80% @ 1px, 18% @ 2px, 2% @ 3px |
| Small clusters | 14-22 | 3-7 nodes each with internal edges |
| Cluster edges | 80-120 | Short-range, thin, irregular connections |
| Inter-cluster edges | 20-40 | Sparse connections between clusters |
| Standalone edges | variable | Nearby micro-node connections |
| Isolated particles | 45-75 | Random 0.3-0.7px dots |
| Drafting elements | 12-20 | Calibration ticks, guide lines |

## Motion System

1. **Signal propagation**: One faint pulse along an edge every 8s (CSS keyframe)
2. **Node breathing**: ~15% of nodes oscillate opacity over 14-16s cycles
3. **Local activation**: ~20% of clusters subtly increase opacity (+6%) over 90s cycles
4. **Micro drift**: ~15% of clusters drift 1-2px over 45s cycles

All motion respects `prefers-reduced-motion: reduce`.

## Responsive Behavior

- **Desktop** (≥1024px): Full field at 0.48 opacity
- **Tablet** (768-1023px): 52% width at 0.34 opacity
- **Mobile** (<768px): Hidden

## Color Tokens

All colors use CSS custom properties:
- `--nv-semantic-node-color`: `#1e2c3e` (graphite-800)
- `--nv-semantic-edge-color`: `#0e7490` (cyan-500)
- `--nv-semantic-signal-color`: `#06b6d4` (cyan-300)

## Generation

The SVG is generated deterministically by `website/scripts/generate-semantic-field.js` using a seeded PRNG. Run:

```bash
node website/scripts/generate-semantic-field.js 2>stats.txt > output.svg
```

## Forbidden

- No large blob or radial glow
- No single dominating graph
- No giant anchor nodes
- No decorative SVG centerpiece
- No HUD overlay or sci-fi elements
