# Visual Composition Rules

This document outlines the strict guidelines governing the creation, styling, and layering of visual elements across NeuralVerse interfaces.

## 1. Frozen Styling Parameters

| Property       | Rule                               |
| -------------- | ---------------------------------- |
| Stroke         | Default 1.75px                     |
| Corner radius  | 4px or 8px only                    |
| Grid           | Multiples of 4px                   |
| Fill           | Maximum 10% opacity                |
| Glow           | Active element only                |
| Motion         | Entry, hover, or state change only |
| Colors         | Design tokens exclusively          |
| Official sizes | 24px, 48px, 96px, 192px            |

## 2. Core Composition Principles
* **Maximum one dominant motif**: Each icon or empty state should only focus on representing a single conceptual motif (e.g. either Search Lens or Discovery Beacon, never both).
* **Maximum three primitive types in 24px**: Keep micro-icons extremely focused.
* **Negative Space**: Ensure at least 40% negative space on complex graphics.
* **No Cyberpunk glow**: Avoid saturated drop shadows or neon blurs.
* **Motion**: Limited to state changes and entrance transitions. Continuous looping rotations/pulses are prohibited to respect cognitive comfort and battery life.

## 3. Visual Complexity Scale

* **V0 — Primitive only**: Single raw lines, circles, or ticks.
* **V1 — Interface icon**: standard UI actions (`24px`).
* **V2 — Empty-state illustration**: Detailed motif representations used to guide empty containers (`48px` or `96px`).
* **V3 — Hero/contextual illustration**: Fully composite diagrams for workspace intros (`192px`).
* **V4 — Editorial/marketing composition**: High-density layouts (forbidden inside the workspace).

*The Retrieval Workspace should primarily use V1 and V2 assets.*
