# Background Profiles

## Purpose

Profiles vary background intensity while preserving the same NeuralVerse visual language.

Supported profiles:

- `default`
- `home`
- `learning`
- `modules`
- `workspace`
- `retrieval`
- `presentation`
- `settings`
- `landing`

## Default

Balanced and neutral. Used as the fallback for all surfaces.

## Home

Medium density. Establishes NeuralVerse identity without turning the workspace into a landing page.

## Learning

Slightly quieter and brighter for reading-oriented routes. Grid and signal layers are reduced.

## Modules

Low density. Matches Learning so module scanning remains content-first.

## Workspace

Instrument-focused. Grid and signal cues are slightly stronger while remaining subordinate to cards and controls.

## Retrieval

Knowledge constellation emphasis. Signals are a little more present to support graph and research workflows without competing with nodes or labels.

## Presentation

Cleaner and less textured. Intended for briefing and presentation surfaces where content should feel calm and direct.

## Settings

Static/off-like. Motion is effectively removed and the constellation remains barely present.

## Landing

Slightly richer identity for first impressions, still restrained enough for long-session readability.

## CSS Contract

Profiles control:

```css
--nv-background-profile-accent
--nv-background-profile-depth
--nv-background-profile-bloom
--nv-background-profile-grid
--nv-background-profile-signals
--nv-background-profile-noise
--nv-neural-constellation-opacity
--nv-neural-constellation-node-opacity
--nv-neural-constellation-connection-opacity
--nv-neural-constellation-pulse-opacity
```

Routes can inherit profiles through existing workspace state attributes. React surfaces can opt in through `data-background-profile` via `NvBackgroundProvider`, `NvBackgroundSurface`, or `NvBackgroundProfile`.

## Forbidden Variants

- Neon profiles
- Particle profiles
- Cursor-reactive profiles
- Scroll-reactive profiles
- High-saturation gradients
- Page-specific hardcoded color overrides
