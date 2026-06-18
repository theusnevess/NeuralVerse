# Global Background System

## Purpose

NV-600.2 defines the shared NeuralVerse background infrastructure. The system creates a restrained Research Observatory atmosphere across the application without becoming a focal element.

The background defines atmosphere. Content defines attention.

## Layer Architecture

The global background is implemented in `website/styles/background.css` and is shared by every route.

1. **Base Gradient**  
   A near-black foundation with a desaturated scientific navy influence.

2. **Instrument Grid**  
   A low-opacity micro grid and dot field that provides subconscious spatial structure.

3. **Observatory Signals**  
   Sparse arcs, convergence points, and alignment hints rendered through CSS gradients.

4. **Ambient Bloom**  
   Very soft static illumination that prevents flatness without creating a spotlight.

5. **Procedural Noise**  
   A nearly invisible static texture that breaks perfectly flat color regions.

## Implementation Rules

- Use Design Tokens only.
- Do not introduce WebGL, shaders, videos, particles, or JavaScript animation loops.
- Do not make the background react to cursor movement, scrolling, graph state, search state, or evidence compilation.
- Keep all layers behind content, panels, menus, previews, and overlays.
- Background layers must use `pointer-events: none`.

## Accessibility

The background is decorative and must never encode task-critical information. It must preserve contrast for headings, text, captions, controls, cards, inspector panels, discovery panels, memory cards, and presentation surfaces.

Reduced motion disables ambient drift while preserving static layers.

## Performance

The system is CSS-first. It uses fixed pseudo-elements and CSS gradients with no `requestAnimationFrame`, timers, observers, or runtime rendering engines.

## Extension Rules

Future backgrounds must extend the shared profile variables or React background helpers. Do not add page-specific background hacks.
