# NV-700 Phase 5B — Symbol System & Cartographic Glyph Language Report

## Executive Summary

Phase 5B replaces the Atlas node language from colored circular marks with a canonical cartographic glyph system. The renderer now classifies every visible entity into a shape-first semantic family before drawing it, so hierarchy and role remain legible without labels or color.

The implementation is constrained to Canvas node rendering and related hover/selection indicators. It does not alter layout, clustering, camera behavior, navigation, topology, semantic data, or canvas architecture.

## Symbol Philosophy

Atlas symbols now communicate through geometry first:

- Importance is expressed through ring count, stroke weight, and calibration structure.
- Semantic role is expressed through shape: observatory marks, diamonds, segmented engineering markers, research orbits, and survey points.
- Color remains supportive, not primary.
- Glow is limited to importance and active targeting, not decoration.
- Hover reveals internal structure; selection uses precision brackets and measurement marks.

## Canonical Glyph Taxonomy

| Entity | Glyph | Meaning |
| --- | --- | --- |
| Capital Landmark | Concentric observatory with core, three rings, cardinal calibration ticks, and cross-axis | Major knowledge capital |
| Landmark | Smaller observatory with two rings and lighter calibration ticks | Secondary hub |
| Bridge | Directional diamond with connector axis | Connection and transition |
| Concept | Thin survey ring with small central core | Standard measurement point |
| Peripheral Concept | Low-opacity outline marker with tiny/no core | Supporting point |
| Story Node | Tiny narrative checkpoint diamond | Narrative/context waypoint |
| Research Node | Double ring with orbital chord | Evidence or research concept |
| Engineering Node | Segmented ring with square core | Structural/implementation concept |
| Cross-domain Hub | Compass-diamond with double ring and multi-axis marker | Concept connecting regions |
| Active Selection | Target brackets plus calibration ticks | Observation lock |
| Hover Target | Slight stroke lift and revealed internal ring/ticks | Inspection affordance |

## Before vs After Comparison

| Dimension | Before | After |
| --- | --- | --- |
| Shape language | Large/medium/small circles | Taxonomy of observatory, diamond, survey, orbit, segmented, and checkpoint glyphs |
| Hierarchy | Mostly radius and color | Ring count, stroke width, internal structure, and marker scale |
| Bridges | Circle variant | Directional diamond/connector |
| Concepts | Filled colored circles | Mostly outlined survey markers |
| Selection | Glow/radius emphasis | Precision targeting brackets and calibration marks |
| Hover | Brighter node | Revealed structure and stroke emphasis |
| Color dependence | High | Lower; grayscale remains distinguishable |

## Glyph Specifications

### Capital Landmark

- Geometry: filled core, primary ring, secondary ring, tertiary ring, eight radial calibration ticks, cross-axis.
- Stroke: 2.5px default, higher in active state.
- Fill: dark observatory core only.
- Halo: single low-alpha influence ring, only for important/active context.
- Usage: `isHub` with very high importance.

### Landmark

- Geometry: filled core, two rings, six calibration ticks.
- Stroke: 2px default.
- Fill: dark core, less mass than capital.
- Usage: hubs and high-importance non-bridge nodes.

### Bridge

- Geometry: directional diamond with horizontal connector axis.
- Stroke: 1.5px default.
- Fill: partial dark brass-toned center.
- Usage: `isBridge` nodes below cross-domain threshold.

### Concept

- Geometry: thin outer survey ring and small core.
- Stroke: 1px default.
- Fill: none.
- Usage: normal scientific concepts.

### Peripheral Concept

- Geometry: very small outline marker, minimal or no core.
- Stroke: 0.6px default.
- Fill: none.
- Usage: low-importance supporting concepts.

### Research Node

- Geometry: double ring plus orbital chord; hover/active adds calibration ticks.
- Stroke: 1.15px default.
- Fill: none except core.
- Usage: evidence family or research-domain nodes.

### Engineering Node

- Geometry: segmented ring with square core.
- Stroke: 1.15px default.
- Fill: square core only.
- Usage: engineering family nodes.

### Story Node

- Geometry: tiny checkpoint diamond.
- Stroke: 0.6px default.
- Fill: none.
- Usage: context family or very low-importance nodes.

### Cross-domain Hub

- Geometry: double-ring compass diamond with orthogonal and diagonal axes.
- Stroke: 1.8px default.
- Fill: none except core.
- Usage: high-importance bridge nodes or hub+bridge nodes.

## Hierarchy Improvements

The hierarchy is now readable by structure:

```text
Capital      3 rings + ticks + cross-axis + largest footprint
Landmark     2 rings + ticks + large footprint
Cross-domain compass diamond + double ring
Bridge       diamond + connector axis
Research     double ring + orbital chord
Engineering  segmented ring + square core
Concept      thin survey ring + small core
Peripheral   tiny outline
Story        tiny checkpoint
```

## Grayscale Recognition Analysis

The new glyphs remain separable when converted to grayscale because they differ by silhouette, internal geometry, stroke weight, and ring count. Color no longer carries the primary semantic load.

Expected recognition without labels:

- Capitals: high, due to three-ring observatory structure.
- Landmarks: high, due to two-ring observatory family resemblance.
- Bridges: high, due to non-circular diamond silhouette.
- Concepts: medium-high, due to survey-ring minimalism.
- Research vs Engineering: medium, distinguishable by orbital chord vs segmented square core.

## Visual Density Improvements

- Standard concepts no longer use filled circular mass.
- Peripheral concepts draw with lower opacity and smaller radii.
- Halos are limited to capitals, landmarks, and cross-domain hubs.
- Active state uses bracket geometry instead of broad glow.
- Average filled area per ordinary node is reduced because concept, peripheral, story, research, and cross-domain glyphs are primarily stroked.

## Accessibility Validation

The implementation preserves color independence by encoding meaning in shape and stroke. Selection remains visible through targeting brackets, not hue alone. Keyboard and screen-reader behavior were not changed.

## Performance Validation

The change stays inside the existing Canvas2D renderer and uses deterministic immediate-mode drawing. It adds no dependencies, no graph allocations, no semantic preprocessing, and no layout work. Small per-glyph helper calls replace the old circle-specific drawing path.

Performance risk is bounded to extra Canvas stroke calls for high-importance glyphs. Ordinary concepts remain lightweight.

## Playwright Validation

Requested viewport validation:

- Desktop: 1440, 1280, 1024
- Tablet: 768
- Mobile: 430, 390, 360

Status: blocked in this environment because `node`, `npm`, `npx`, and Playwright runners are unavailable on PATH. The validation scripts and route checks should be run in a Node-enabled environment.

Recommended commands:

```bash
npm run typecheck
npm test -- --test-name-pattern=CanvasRenderer
npm --prefix react-build run build:atlas
npx playwright test tests/atlas-targeted.spec.ts
node scripts/run-phase-12-validation.cjs
```

## Quantitative Evaluation

| Metric | Expected Direction |
| --- | --- |
| Average filled area per node | Lower |
| Average outline ratio | Higher |
| Halo coverage | Lower |
| Symbol recognition score | Higher |
| Hierarchy clarity | Higher |
| Grayscale distinguishability | Higher |
| Visual complexity | Higher for capitals, lower for concepts |
| Node overlap perception | Lower |
| Signal-to-noise ratio | Higher |

## Remaining Risks

- Browser validation must be rerun once Node/Playwright are available.
- Visual density should be inspected against real screenshots at all requested viewports.
- Research vs engineering glyph recognition may need tuning after grayscale review.
- Existing untracked Atlas source state limits normal `git diff` review.

## Final Product Assessment

The Atlas now reads less like a graph renderer and more like a scientific cartographic instrument. Important nodes are observatory-like landmarks, bridges are directional connectors, ordinary concepts are survey points, and selection resembles an observation lock instead of a neon highlight.

## Final Verdict

Phase 5B implementation is code-complete within the allowed scope, with executable validation pending a Node-enabled environment.
