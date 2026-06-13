# SVG Primitive Asset Library

This document outlines the allowed geometric and structural primitive shapes for NeuralVerse icons and illustrations.

## 1. Geometry

### Node
* **Semantic purpose**: Represents a knowledge item, reference, module, concept, or graph point.
* **Allowed usage**: Knowledge graph node, reference marker, evidence source marker, discovery target.
* **Forbidden usage**: Decorative background dot with no semantic meaning, random particle effect.
* **Typical SVG construction**: `<circle r="4" stroke="currentColor" stroke-width="1.75"/>`.
* **Recommended sizes**: 24px, 48px.

### Edge
* **Semantic purpose**: Represents a semantic relationship, connection, or flow between nodes.
* **Allowed usage**: Graph link, correlation indicator, lineage path.
* **Forbidden usage**: Frame border, underline styling.
* **Typical SVG construction**: `<line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" stroke-width="1.75" />`.
* **Recommended sizes**: 24px, 48px, 96px.

### Orbit
* **Semantic purpose**: Represents a relationship boundary, cycle, or context loop.
* **Allowed usage**: Visual groupings, dynamic states, background range of focus.
* **Forbidden usage**: Simple circle icon.
* **Typical SVG construction**: `<circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 4" fill="none"/>`.
* **Recommended sizes**: 48px, 96px, 192px.

### Arc
* **Semantic purpose**: Connective curvature or directional flow.
* **Allowed usage**: Non-linear relationships, transition arcs.
* **Forbidden usage**: Decorative curves.
* **Typical SVG construction**: `<path d="M 10 80 Q 52.5 10 95 80" stroke="currentColor" stroke-width="1.75" fill="none"/>`.
* **Recommended sizes**: 48px, 96px.

### Grid
* **Semantic purpose**: Analytical context, coordinate systems, precision.
* **Allowed usage**: Inspector backing patterns, empty state alignment contexts.
* **Forbidden usage**: Decorative grid with high opacity.
* **Typical SVG construction**: `<path d="..." stroke="currentColor" stroke-width="0.5" stroke-opacity="0.15"/>`.
* **Recommended sizes**: 96px, 192px.

### Intersection
* **Semantic purpose**: Synthesis of multiple ideas, overlap, shared state.
* **Allowed usage**: Evidence compilation icons, validation checks.
* **Forbidden usage**: Visual clutter.
* **Typical SVG construction**: `<circle .../><circle .../>` intersecting.
* **Recommended sizes**: 24px, 48px.

### Ring
* **Semantic purpose**: Focused target, nested layers, stability levels.
* **Allowed usage**: Selected node indicators, confidence badges.
* **Forbidden usage**: Orbit without dashed/light structure.
* **Typical SVG construction**: `<circle r="8" stroke="currentColor" stroke-width="2"/>`.
* **Recommended sizes**: 24px, 48px.

### Axis
* **Semantic purpose**: Linear scale, dimensional mapping.
* **Allowed usage**: Timeline nodes, progress sequences, metadata parameters.
* **Forbidden usage**: Standalone horizontal dividers (use Divider instead).
* **Typical SVG construction**: `<line ... stroke-width="1.75" />`.
* **Recommended sizes**: 48px, 96px.

---

## 2. Signal

### Pulse / Beacon
* **Semantic purpose**: New suggestions, active beacon, focus target.
* **Allowed usage**: Discovery suggested routes, active searching state.
* **Forbidden usage**: Looping animation effects (must remain static or play once).
* **Typical SVG construction**: Concentric rings with diminishing opacity.
* **Recommended sizes**: 48px, 96px.

### Wave / Ripple
* **Semantic purpose**: Propagation of concept relations, active lookup.
* **Allowed usage**: Search progress, system status sync.
* **Typical SVG construction**: Parallel arc curves.
* **Recommended sizes**: 24px, 48px.

---

## 3. Research

### Document / Folder / Archive
* **Semantic purpose**: Physical files, saved memory, persistence.
* **Allowed usage**: Memory lists, reference cards, repository references.
* **Forbidden usage**: Decorative page icons.
* **Typical SVG construction**: Folded-corner rectangle, cabinet drawer boxes.
* **Recommended sizes**: 24px, 48px.

---

## 4. Structural

### Bracket / Divider / Anchor
* **Semantic purpose**: Boundary layout, separation of metadata, key anchoring.
* **Allowed usage**: Context blocks, summary highlights.
* **Forbidden usage**: Unrelated borders.
* **Typical SVG construction**: `[` and `]` styled paths.
* **Recommended sizes**: 24px, 48px.
