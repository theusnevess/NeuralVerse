# NV-700-M4 — Visual Architecture

**Status:** LOCKED  
**Date:** 2026-07-05  
**Author:** NeuralVerse Architecture Team  
**Scope:** Canonical Visual Language for Atlas

---

## Executive Summary

This document defines the immutable visual language of Atlas. It specifies how knowledge becomes visual without defining implementation. Every visual element encodes semantic meaning. Nothing is drawn because it looks beautiful; everything is drawn because it communicates knowledge.

Atlas receives a complete, implementation-independent visual language covering:
- Visual space, grammar, and primitives
- Node, edge, region, and cluster systems
- Projection and navigation architectures
- Level of detail scaling from 20 to 500,000 nodes
- Visual states, interaction feedback, and accessibility
- Rendering independence and governance

The architecture remains fully compatible with NV-700-M1, NV-700-M2, and NV-700-M3.

---

## 1. Visual Philosophy

### 1.1 Core Principle

```
Every visual element must encode semantic meaning.
Nothing is drawn because it looks beautiful.
Everything is drawn because it communicates knowledge.
```

### 1.2 What Atlas Feels Like

Atlas should feel like:

- Scientific
- Calm
- Precise
- Instrument-grade
- Research software
- Engineering observatory
- Knowledge cartography
- Professional visualization tool

### 1.3 What Atlas Must Never Resemble

Atlas must never resemble:

- Mind maps
- Marketing graphics
- Social networks
- Game skill trees
- Infographics
- PowerPoint diagrams
- Toy graph viewers

### 1.4 Canonical Mental Model

Atlas visualizes a living knowledge topology. Users should feel like they are navigating:

- Terrain
- Continents
- Regions
- Rivers
- Bridges
- Mountain ranges
- Cities
- Routes

These are metaphors only. Do not render literal geography. The graph remains abstract.

---

## 2. Visual Space

### 2.1 Coordinate System

Atlas uses an infinite two-dimensional Cartesian coordinate system:

- **Origin** — (0, 0) at initial graph center
- **Units** — Abstract; no pixel or meter equivalent
- **Positive X** — Rightward
- **Positive Y** — Downward (screen convention)

### 2.2 Infinite Canvas

The graph exists independently of the viewport:

- **Graph** — Static; does not move
- **Camera** — Moves to change visible region
- **Viewport** — Window into the infinite canvas
- **Off-screen** — Graph content outside viewport is not rendered but remains queryable

### 2.3 Camera Model

The camera defines what portion of the graph is visible:

```typescript
interface Camera {
  x: number;           // Camera center X
  y: number;           // Camera center Y
  zoom: number;        // Zoom level (1.0 = default)
  rotation: number;    // Optional rotation (radians)
}
```

### 2.4 Viewport

The viewport is the visible window:

```typescript
interface Viewport {
  width: number;       // Viewport width in screen units
  height: number;      // Viewport height in screen units
  camera: Camera;      // Current camera state
}
```

### 2.5 Pan

Pan moves the camera without changing zoom:

- **Horizontal pan** — Camera X changes
- **Vertical pan** — Camera Y changes
- **Constraint** — Pan respects graph bounds (if bounded)

### 2.6 Zoom

Zoom scales the visible region:

- **Zoom in** — Camera zoom increases; more detail visible
- **Zoom out** — Camera zoom decreases; less detail visible
- **Range** — 0.01x to 100x (configurable)
- **Pivot** — Zoom pivots around viewport center (default) or cursor position

### 2.7 Focus

Focus centers the camera on a specific node or region:

- **Node focus** — Camera centers on node position
- **Region focus** — Camera centers on region centroid
- **Smooth transition** — Camera animates to focus point

### 2.8 Visible Window

The visible window is the intersection of viewport and graph:

- **In-bounds** — Graph content within viewport
- **Out-of-bounds** — Graph content outside viewport
- **Margin** — Optional buffer zone for pre-loading

### 2.9 Off-Screen Behavior

Off-screen content is handled by:

- **Culling** — Off-screen elements not rendered
- **Pre-loading** — Adjacent regions pre-loaded for smooth panning
- **Indicators** — Directional indicators for off-screen focused nodes

---

## 3. Visual Grammar

### 3.1 Primitive Inventory

| Primitive | Purpose | Semantic Meaning |
|-----------|---------|------------------|
| Node | Entity representation | Knowledge entity exists |
| Edge | Relationship representation | Relationship exists |
| Region | Semantic neighborhood | Entities share domain |
| Label | Entity identification | Entity has name |
| Halo | Selection/focus indicator | Entity is selected/focused |
| Anchor | Navigation target | Entity is bookmarked |
| Path | Navigation trail | User traveled this route |
| Cluster boundary | Emergent structure | Entities form community |
| Focus ring | Active focus | Entity is current focus |
| Selection frame | Multi-select | Multiple entities selected |

### 3.2 Visual Hierarchy

Primitives are rendered in this order (back to front):

1. Region backgrounds
2. Cluster boundaries
3. Edges
4. Edge labels
5. Nodes
6. Node labels
7. Halos
8. Focus rings
9. Selection frames
10. Anchors
11. Paths

### 3.3 Ownership

| Primitive | Owned By | Lifecycle |
|-----------|----------|-----------|
| Node | Graph Snapshot | Permanent |
| Edge | Graph Snapshot | Permanent |
| Region | Projection Engine | Ephemeral per projection |
| Label | Renderer | Computed per frame |
| Halo | Interaction System | Ephemeral per selection |
| Anchor | User Session | Persistent per user |
| Path | Navigation System | Ephemeral per session |
| Cluster boundary | Metrics Engine | Ephemeral per projection |
| Focus ring | Interaction System | Ephemeral per focus |
| Selection frame | Interaction System | Ephemeral per selection |

---

## 4. Node Architecture

### 4.1 Shape Philosophy

Node shape encodes entity family:

| Family | Shape | Rationale |
|--------|-------|-----------|
| Scientific | Circle | Fundamental, atomic, universal |
| Engineering | Square | Structured, built, constructed |
| Evidence | Diamond | Precise, measured, verified |
| Context | Rounded rectangle | Flexible, adaptive, framing |

Shape is never decorative. Shape always communicates family.

### 4.2 Relative Sizing

Node size encodes importance:

```typescript
interface NodeSize {
  base: number;        // Minimum size (all nodes)
  importance: number;  // 0.0-1.0 from metrics
  computed: number;    // base + (importance * scale)
}
```

- **Base size** — All nodes start at minimum size
- **Importance scaling** — Higher importance = larger size
- **Scale factor** — Configurable; default 2x base
- **Maximum size** — Capped at 3x base to prevent dominance

### 4.3 Importance Scaling

Importance is computed from metrics:

| Metric | Weight | Description |
|--------|--------|-------------|
| Degree centrality | 30% | Connection count |
| Betweenness centrality | 25% | Bridge importance |
| PageRank | 25% | Network importance |
| Evidence count | 20% | Supporting evidence |

### 4.4 Visual Priority

When nodes overlap or cluster:

- **Higher importance** — Rendered on top
- **Same importance** — Rendered by ID order
- **Focused node** — Always on top
- **Selected nodes** — Always above unselected

### 4.5 Label Strategy

Labels follow this hierarchy:

1. **Focused node** — Always visible, full name
2. **Selected nodes** — Always visible, full name
3. **High importance** — Visible at medium zoom
4. **Medium importance** — Visible at high zoom
5. **Low importance** — Visible at very high zoom
6. **Aggregated** — Summary label at cluster level

### 4.6 Aggregation Behavior

When nodes aggregate:

- **Cluster** — Multiple nodes become single visual
- **Summary** — Cluster shows count and dominant family
- **Drill-down** — Click expands to individual nodes
- **Transition** — Smooth animation from aggregate to individual

### 4.7 Visibility Thresholds

Nodes are visible when:

- **Within viewport** — Position is visible
- **Above LOD threshold** — Zoom level permits detail
- **Not filtered** — Passes current projection filter
- **Not hidden** — User has not hidden node

### 4.8 Semantic Emphasis

Emphasis communicates special status:

| Emphasis | Visual Change | Meaning |
|----------|---------------|---------|
| Critical | Glowing border | High-weight edge hub |
| Deprecated | Dotted border | Being phased out |
| New | Pulsing border | Recently added |
| Validated | Checkmark badge | Verified by expert |

---

## 5. Edge Architecture

### 5.1 Line Philosophy

Edge line style encodes relationship category:

| Category | Line Style | Rationale |
|----------|------------|-----------|
| Epistemic | Solid | Fundamental, required |
| Structural | Thick solid | Strong, architectural |
| Pedagogical | Dashed | Optional, learning path |
| Engineering | Double | Implementation, concrete |
| Evidentiary | Dotted | Supporting, validating |
| Temporal | Arrow-only | Directional, sequential |
| Inferential | Wavy | Suggested, uncertain |

### 5.2 Arrow Philosophy

Arrow style encodes direction:

- **Directed edges** — Arrow at target end
- **Bidirectional edges** — Arrows at both ends
- **Undirected edges** — No arrows (default for some categories)

### 5.3 Bundling

When many edges connect similar regions:

- **Bundling** — Parallel edges grouped visually
- **Threshold** — Bundle when >5 edges between same regions
- **Expansion** — Click to expand bundled edges
- **Count indicator** — Show edge count in bundle

### 5.4 Simplification

At low zoom levels:

- **Edge removal** — Low-weight edges hidden
- **Category filtering** — Less important categories hidden
- **Clustering** — Edges between clusters simplified
- **Progressive** — Edges appear as zoom increases

### 5.5 Aggregation

When nodes aggregate:

- **Inter-cluster edges** — Become single edge between clusters
- **Edge count** — Shown as label on aggregated edge
- **Weight sum** — Aggregated weight = sum of component weights
- **Category preservation** — Most common category shown

### 5.6 Edge Labels

Labels on edges communicate:

- **Relationship type** — Shown at medium zoom
- **Weight** — Shown at high zoom
- **Confidence** — Shown at very high zoom
- **Evidence count** — Shown on hover

### 5.7 Crossings

When edges cross:

- **No special rendering** — Crossings are natural
- **Priority** — Higher-weight edges render on top
- **Bundling** — Reduces crossings in dense regions

### 5.8 Highlighting

When edges are highlighted:

- **Selected node** — Connected edges glow
- **Hovered edge** — Edge thickens and glows
- **Filtered** — Non-matching edges dim

---

## 6. Region Architecture

### 6.1 Region Definition

A region represents emergent semantic organization. Regions are NOT nodes; they are visual groupings based on graph semantics.

### 6.2 Canonical Regions

| Region | Contains | Visual Boundary |
|--------|----------|-----------------|
| Machine Learning | ML concepts, algorithms | Soft boundary |
| Optimization | Optimization techniques | Soft boundary |
| Computer Vision | Vision concepts, models | Soft boundary |
| NLP | Language concepts, models | Soft boundary |
| RAG | Retrieval concepts | Soft boundary |
| Agents | Agent concepts | Soft boundary |
| MLOps | Operations concepts | Soft boundary |
| Foundations | Math, statistics, programming | Soft boundary |

### 6.3 Region Lifecycle

Regions are computed, not stored:

- **Computation** — Derived from node metadata and clustering
- **Ephemeral** — Exist only in current projection
- **Dynamic** — Boundaries shift with graph changes
- **User override** — Users can pin/unpin regions

### 6.4 Membership

Node membership in regions:

- **Primary region** — Based on domain metadata
- **Secondary regions** — Based on cross-domain edges
- **Overlap** — Nodes can belong to multiple regions
- **Fuzzy membership** — Membership has confidence score

### 6.5 Visual Boundary

Region boundaries are visual, not structural:

- **Soft boundary** — Transparent fill with subtle border
- **Opacity** — 0.05-0.15 (configurable)
- **Color** — Derived from dominant family in region
- **Label** — Region name at centroid

### 6.6 Nesting

Regions can nest:

- **Machine Learning** contains **Deep Learning**, **Classical ML**
- **Deep Learning** contains **CNNs**, **RNNs**, **Transformers**
- **Nesting depth** — Maximum 3 levels
- **Visual distinction** — Nested regions have darker borders

### 6.7 Intersection

Regions can intersect:

- **Shared nodes** — Nodes in multiple regions
- **Intersection visual** — Overlapping boundaries blend
- **Priority** — Higher-importance region renders on top

### 6.8 Projection Behavior

Regions change with projection:

- **Topology view** — All regions visible
- **Dependency view** — Only dependency-relevant regions
- **Historical view** — Time-based region grouping
- **Engineering view** — Implementation-focused regions

---

## 7. Cluster Visualization

### 7.1 Emergent Structures

Using NV-700-M2 emergent structures, define visualization for:

| Structure | Visual Encoding | Description |
|-----------|-----------------|-------------|
| Hub | Large node, many edges | High-degree central node |
| Bridge | Node between clusters | Connects separate communities |
| Cluster | Dense node group | Community of related nodes |
| Bottleneck | Single node in path | Critical connection point |
| Corridor | Chain of nodes | Linear pathway |
| Frontier | Nodes at edge | Boundary of domain |
| Gateway | Entry point node | Access to subgraph |
| Isolated Island | Disconnected node | No connections |
| Dense Core | Central cluster | Highly connected center |
| Sparse Region | Edge area | Few connections |
| Cross-Domain Connector | Multi-family node | Bridges different domains |
| Knowledge Basin | Accumulation area | Many related concepts |

### 7.2 Visual Encoding Principles

For each structure:

- **Size** — Importance encoded in node size
- **Position** — Centrality encoded in position
- **Color** — Family encoded in color
- **Border** — Status encoded in border style
- **Edges** — Relationship strength encoded in edge weight
- **Label** — Name shown based on zoom level

### 7.3 Cluster Boundaries

When nodes form clusters:

- **Boundary** — Soft visual boundary around cluster
- **Label** — Cluster name (derived from dominant family)
- **Count** — Number of nodes in cluster
- **Collapse** — Click to collapse cluster into single node
- **Expand** — Click to expand cluster to individual nodes

---

## 8. Projection Visualization

### 8.1 Projection System

NV-700-M3 introduced projections. This section defines how projections affect visualization.

### 8.2 Required Projections

| Projection | Visible Entities | Visible Relationships | Visual Emphasis |
|------------|------------------|----------------------|-----------------|
| Topology | All | All | Complete view |
| Dependency | All | requires, depends_on, implements | Prerequisite chains |
| Learning | Content, Concepts | teaches, demonstrates, assesses | Learning paths |
| Engineering | Engineering, Scientific | uses, configures, extends | Implementation |
| Historical | All | precedes, follows, evolves_to | Time evolution |
| Research | All except Context | All except pedagogical | Research landscape |
| Application | All | supports, refutes, measures | Evidence relationships |

### 8.3 Projection Behavior

When projection changes:

- **Graph mutation** — NEVER; graph remains unchanged
- **Visual mutation** — Only visualization changes
- **Smooth transition** — Animation between projection states
- **Filter applied** — Non-matching elements fade out
- **Emphasis applied** — Matching elements glow

### 8.4 Suppressed Information

Each projection suppresses:

| Projection | Suppressed |
|------------|------------|
| Topology | None |
| Dependency | Non-dependency edges |
| Learning | Non-pedagogical relationships |
| Engineering | Non-implementation relationships |
| Historical | Non-temporal relationships |
| Research | Context family entities |
| Application | Non-evidentiary relationships |

### 8.5 Navigation Behavior

Navigation within projections:

- **Topology** — Free navigation, all nodes accessible
- **Dependency** — Follow prerequisite chains
- **Learning** — Follow curriculum paths
- **Engineering** — Follow implementation paths
- **Historical** — Follow time arrows
- **Research** — Explore research connections
- **Application** — Follow evidence chains

---

## 9. Navigation Architecture

### 9.1 Spatial Navigation

Atlas navigation must feel spatial:

| Action | Description | Visual Feedback |
|--------|-------------|-----------------|
| Pan | Move camera | Smooth translation |
| Zoom | Scale viewport | Smooth scaling |
| Fit | Show entire graph | Camera resets to bounds |
| Center | Center on node | Camera moves to node |
| Home | Return to default | Camera resets to default |
| Breadcrumbs | Navigation history | Path trail visible |
| History | Previous positions | Breadcrumb navigation |
| Focus | Single node focus | Node highlighted, others dimmed |
| Multi-focus | Multiple nodes focused | Multiple nodes highlighted |
| Bookmarks | Saved positions | Anchor points visible |

### 9.2 Semantic Navigation

Navigation by meaning:

| Navigation | Description | Trigger |
|------------|-------------|---------|
| Domain | Jump to domain region | Domain selector |
| Family | Jump to family cluster | Family selector |
| Relationship | Follow relationship type | Edge click |
| Importance | Navigate by importance | Importance slider |
| Evidence | Navigate by evidence count | Evidence filter |

### 9.3 Structural Navigation

Navigation by graph structure:

| Navigation | Description | Trigger |
|------------|-------------|---------|
| Neighbor | Visit connected nodes | Node click |
| Path | Follow shortest path | Two-node selection |
| Cluster | Enter/exit cluster | Cluster click |
| Hierarchy | Navigate up/down | Hierarchy controls |
| Community | Navigate within community | Community boundary click |

### 9.4 Navigation State

Navigation state is maintained:

```typescript
interface NavigationState {
  camera: Camera;
  focus: string | null;        // Focused node ID
  multiFocus: string[];        // Multi-focused node IDs
  breadcrumbs: string[];       // Navigation history
  bookmarks: Bookmark[];       // Saved positions
  projection: ProjectionType;  // Current projection
}
```

---

## 10. Level of Detail (LOD) Architecture

### 10.1 LOD Philosophy

Atlas must scale from 20 to 500,000 nodes without becoming unreadable. LOD preserves understanding by reducing detail at distance.

### 10.2 LOD Levels

| Level | Node Count | Detail | Labels | Edges | Clusters |
|-------|------------|--------|--------|-------|----------|
| L0 | < 50 | Full | All | All | None |
| L1 | 50-200 | High | Importance > 0.5 | High weight | Small clusters |
| L2 | 200-1K | Medium | Importance > 0.7 | Medium weight | Medium clusters |
| L3 | 1K-5K | Low | Importance > 0.9 | High weight only | Large clusters |
| L4 | 5K-50K | Minimal | Critical only | Critical only | Region view |
| L5 | 50K-500K | Summary | Domain names | Domain edges | Domain view |

### 10.3 Aggregation Strategy

As node count increases:

- **L0-L1** — Individual nodes visible
- **L2** — Small clusters form
- **L3** — Clusters merge into regions
- **L4** — Regions become primary visual
- **L5** — Only domains visible

### 10.4 Label Disappearance

Labels disappear in this order:

1. Low-importance nodes (L1)
2. Medium-importance nodes (L2)
3. High-importance nodes (L3)
4. Critical nodes (L4)
5. Domain labels only (L5)

### 10.5 Cluster Collapse

Clusters collapse when:

- **Zoom level** — Below threshold
- **Node density** — Above threshold
- **User action** — Manual collapse
- **Automatic** — Performance optimization

### 10.6 Edge Simplification

Edges simplify when:

- **Low weight** — Hidden first
- **Low confidence** — Hidden second
- **Non-critical** — Hidden third
- **Bundled** — Parallel edges grouped

### 10.7 Semantic Summaries

At high LOD:

- **Cluster summary** — Count, dominant family, importance
- **Region summary** — Domain, node count, edge count
- **Graph summary** — Total nodes, edges, density

### 10.8 Region Abstraction

At highest LOD:

- **Domain view** — Only domain-level visualization
- **Domain edges** — Connections between domains
- **Domain size** — Proportional to node count
- **Domain color** — Dominant family color

---

## 11. Visual States

### 11.1 State Definitions

| State | Meaning | Priority |
|-------|---------|----------|
| Default | Normal display | 0 |
| Hover | Cursor over node/edge | 1 |
| Focus | Current navigation target | 2 |
| Selected | User selected | 3 |
| Related | Connected to selected | 4 |
| Ancestor | Predecessor in dependency | 5 |
| Descendant | Successor in dependency | 6 |
| Dependency | Required for focused | 7 |
| Filtered | Matches current filter | 8 |
| Hidden | User hidden | 9 |
| Collapsed | Cluster collapsed | 10 |
| Aggregated | Part of aggregate | 11 |
| Disabled | Non-interactive | 12 |

### 11.2 State Visual Encoding

| State | Visual Change |
|-------|---------------|
| Default | Normal appearance |
| Hover | Slight glow, cursor change |
| Focus | Strong glow, ring |
| Selected | Bright border, halo |
| Related | Dimmed, connected edges glow |
| Ancestor | Slightly dimmed, arrow highlight |
| Descendant | Slightly dimmed, arrow highlight |
| Dependency | Dimmed, dependency edges glow |
| Filtered | Full opacity |
| Hidden | Not visible |
| Collapsed | Single node representation |
| Aggregated | Cluster representation |
| Disabled | Grayed out |

### 11.3 State Inheritance

States inherit from parents:

- **Selected** inherits **Focus** properties
- **Focus** inherits **Hover** properties
- **Related** inherits **Default** properties

### 11.4 Combination Rules

When states combine:

- **Higher priority** wins
- **Focus + Selected** = Focus appearance (priority 2 > 3)
- **Hover + Related** = Hover appearance (priority 1 > 4)
- **Disabled** overrides all other states

---

## 12. Interaction Feedback

### 12.1 Feedback Philosophy

Atlas interaction must communicate cognition, not animation. Animations must explain, never entertain.

### 12.2 Selection Feedback

When node/edge selected:

- **Visual** — Glow, ring, highlight
- **Auditory** — Optional click sound
- **Haptic** — Optional vibration (mobile)
- **Temporal** — Instant feedback (< 100ms)

### 12.3 Navigation Feedback

When navigating:

- **Pan** — Smooth camera movement
- **Zoom** — Smooth scaling
- **Focus** — Camera centers on target
- **Trail** — Breadcrumb path visible

### 12.4 Projection Change Feedback

When projection changes:

- **Transition** — Smooth animation (300-500ms)
- **Fade** — Suppressed elements fade out
- **Glow** — Emphasized elements glow
- **Label** — Projection name displayed

### 12.5 Expansion Feedback

When cluster expands:

- **Animation** — Smooth expansion (300-500ms)
- **Labels** — Node labels appear
- **Edges** — Internal edges appear
- **Boundary** — Cluster boundary fades

### 12.6 Collapse Feedback

When cluster collapses:

- **Animation** — Smooth contraction (300-500ms)
- **Labels** — Node labels disappear
- **Edges** — Internal edges disappear
- **Boundary** — Cluster boundary appears

### 12.7 Search Feedback

When searching:

- **Highlight** — Matching nodes glow
- **Dim** — Non-matching nodes dim
- **Focus** — Camera centers on first match
- **List** — Results listed in sidebar

### 12.8 Focus Feedback

When focusing:

- **Ring** — Focus ring appears
- **Dim** — Other nodes dim
- **Edges** — Connected edges glow
- **Label** — Full label shown

### 12.9 History Feedback

When navigating history:

- **Trail** — Path trail visible
- **Breadcrumbs** — Navigation history shown
- **Preview** — Hover to preview position

### 12.10 Drill-Down Feedback

When drilling down:

- **Animation** — Smooth zoom into cluster
- **Context** — Parent cluster boundary remains
- **Back** — Back button appears
- **Breadcrumbs** — Drill-down path shown

---

## 13. Labels & Typography

### 13.1 Label Appearance Rules

| Condition | Label Visible |
|-----------|---------------|
| Focused node | Always |
| Selected node | Always |
| Hovered node | Always |
| Importance > 0.9 | At zoom > 0.5 |
| Importance > 0.7 | At zoom > 1.0 |
| Importance > 0.5 | At zoom > 2.0 |
| Importance > 0.3 | At zoom > 5.0 |
| Importance ≤ 0.3 | Never (aggregate only) |

### 13.2 Label Disappearance Rules

Labels disappear when:

- **Zoom level** — Below threshold
- **Node density** — Too many labels overlap
- **User action** — Labels toggled off
- **LOD level** — Higher LOD = fewer labels

### 13.3 Label Priority

When labels compete for space:

1. Focused node
2. Selected nodes
3. High-importance nodes
4. Cluster labels
5. Region labels

### 13.4 Collision Avoidance

Labels avoid collisions:

- **Offset** — Labels offset from node center
- **Leader lines** — Lines connect label to node when offset
- **Hiding** — Overlapping labels hidden
- **Prioritization** — Higher-priority labels shown first

### 13.5 Importance Encoding

Label importance encoded by:

- **Font size** — Higher importance = larger font
- **Font weight** — Higher importance = bolder
- **Opacity** — Higher importance = more opaque
- **Position** — Higher importance = closer to node

### 13.6 Abbreviation

Long names are abbreviated:

- **Truncation** — Names truncated with ellipsis
- **Acronyms** — Well-known acronyms used
- **Tooltip** — Full name on hover

### 13.7 Hierarchical Typography

Typography follows hierarchy:

- **Graph title** — Largest, boldest
- **Region labels** — Large, medium weight
- **Cluster labels** — Medium, normal weight
- **Node labels** — Small, normal weight
- **Edge labels** — Smallest, light weight

### 13.8 Density Adaptation

Typography adapts to density:

- **Low density** — Full labels
- **Medium density** — Abbreviated labels
- **High density** — Labels hidden
- **Very high density** — Only region labels

---

## 14. Color Philosophy

### 14.1 Color Semantics

Color communicates meaning, never decoration:

| Color Use | Semantic Meaning |
|-----------|------------------|
| Family differentiation | Entity family identity |
| Relationship differentiation | Relationship category identity |
| Projection differentiation | Active projection identity |
| State differentiation | Visual state identity |
| Accessibility | High contrast, color blindness |
| Contrast | Readability, hierarchy |
| Meaning preservation | Consistent semantic mapping |

### 14.2 Family Color Mapping

Entity families have distinct color ranges:

| Family | Color Range | Rationale |
|--------|-------------|-----------|
| Scientific | Blues | Fundamental, theoretical |
| Engineering | Greens | Practical, constructive |
| Evidence | Oranges | Measured, verified |
| Context | Purples | Framing, adaptive |

### 14.3 Relationship Color Mapping

Relationship categories have distinct visual treatments:

| Category | Visual Treatment |
|----------|------------------|
| Epistemic | Solid lines |
| Structural | Thick lines |
| Pedagogical | Dashed lines |
| Engineering | Double lines |
| Evidentiary | Dotted lines |
| Temporal | Arrow-only |
| Inferential | Wavy lines |

### 14.4 Projection Color Mapping

Projections have distinct color accents:

| Projection | Accent Color |
|------------|--------------|
| Topology | Default |
| Dependency | Blue accent |
| Learning | Green accent |
| Engineering | Orange accent |
| Historical | Purple accent |
| Research | Teal accent |
| Application | Red accent |

### 14.5 State Color Mapping

Visual states have distinct color treatments:

| State | Color Treatment |
|-------|-----------------|
| Default | Normal colors |
| Hover | Slightly brighter |
| Focus | Bright, glowing |
| Selected | Bright border, halo |
| Related | Dimmed |
| Filtered | Full opacity |
| Hidden | Not visible |
| Disabled | Grayed out |

### 14.6 Accessibility Colors

Colors meet accessibility requirements:

- **Contrast ratio** — Minimum 4.5:1 for text
- **Color blindness** — Patterns supplement color
- **High contrast mode** — Alternative color scheme
- **Dark mode** — Optimized for low light

### 14.7 Contrast Requirements

Contrast follows WCAG guidelines:

- **Normal text** — 4.5:1 minimum
- **Large text** — 3:1 minimum
- **Graphical objects** — 3:1 minimum
- **Focus indicators** — 3:1 minimum

### 14.8 Meaning Preservation

Color meaning is preserved:

- **Consistency** — Same color = same meaning
- **Context** — Color meaning doesn't change
- **Documentation** — Color meanings documented
- **Training** — Users learn color meanings

---

## 15. Accessibility

### 15.1 Keyboard Navigation

Atlas supports full keyboard navigation:

| Key | Action |
|-----|--------|
| Arrow keys | Pan camera |
| +/- | Zoom in/out |
| Tab | Move focus to next node |
| Shift+Tab | Move focus to previous node |
| Enter | Select focused node |
| Escape | Deselect all |
| Space | Toggle cluster expansion |
| Home | Fit graph in viewport |
| F | Focus on selected node |
| B | Bookmark current position |

### 15.2 Screen Reader Support

Atlas provides screen reader support:

- **ARIA labels** — All interactive elements labeled
- **Live regions** — Status updates announced
- **Landmarks** — Navigation landmarks provided
- **Headings** — Proper heading hierarchy
- **Alt text** — Graph description provided

### 15.3 Reduced Motion

Atlas respects reduced motion preferences:

- **Animation** — Disabled when preference set
- **Transitions** — Instant instead of animated
- **Motion** — No parallax or floating effects
- **Alternative** — Static indicators instead

### 15.4 High Contrast

Atlas supports high contrast mode:

- **Borders** — Thicker, more visible
- **Colors** — Higher contrast palette
- **Labels** — Bolder, more visible
- **Focus** — More prominent focus indicators

### 15.5 Color Blindness

Atlas supports color blindness:

- **Patterns** — Shapes supplement colors
- **Labels** — Text labels supplement colors
- **Legend** — Color meanings documented
- **Customization** — Users can customize colors

### 15.6 Zoom Support

Atlas supports zoom for low vision:

- **Browser zoom** — Works with browser zoom
- **App zoom** — Independent zoom control
- **Text scaling** — Labels scale with zoom
- **Responsive** — Layout adapts to zoom level

### 15.7 Focus Visibility

Focus indicators are always visible:

- **Ring** — Focus ring around focused element
- **Contrast** — High contrast focus indicator
- **Size** — Large enough to see
- **Persistence** — Focus indicator persists

### 15.8 Semantic Announcements

Atlas announces semantic changes:

- **Selection** — "Selected [node name]"
- **Focus** — "Focused on [node name]"
- **Projection** — "Switched to [projection name]"
- **Navigation** — "Navigated to [region name]"

---

## 16. Rendering Independence

### 16.1 Renderer Agnostic

This architecture does NOT assume:

- SVG
- Canvas
- WebGL
- React
- Pixi
- D3
- Cytoscape
- Three.js
- Any specific library

### 16.2 Compliant Renderers

Any renderer capable of honoring the contracts is compliant:

- **Vector renderer** — SVG, PDF
- **Raster renderer** — Canvas, WebGL
- **Hybrid renderer** — Mixed approaches
- **3D renderer** — Three.js, Babylon.js
- **Server renderer** — Node-canvas, Puppeteer

### 16.3 Contract Requirements

A compliant renderer must:

- Render nodes with correct shapes
- Render edges with correct styles
- Render regions with correct boundaries
- Support pan, zoom, focus
- Handle LOD transitions
- Respect accessibility requirements
- Maintain visual state consistency

### 16.4 Renderer Selection

Renderer selection is implementation decision:

- **Performance** — Choose based on node count
- **Features** — Choose based on required features
- **Platform** — Choose based on target platform
- **Team** — Choose based on team expertise

---

## 17. Governance

### 17.1 Visual Evolution

Visual language evolves through:

- **Proposal** — New visual element proposed
- **Review** — Architecture team reviews
- **Approval** — Changes approved
- **Implementation** — Changes implemented
- **Documentation** — Changes documented

### 17.2 Backward Compatibility

Visual changes maintain compatibility:

- **Existing states** — New states don't break existing
- **Existing projections** — New projections don't break existing
- **Existing interactions** — New interactions don't break existing
- **Migration** — Smooth transition for users

### 17.3 Projection Extensions

New projections can be added:

- **Definition** — New projection defined
- **Visual encoding** — Visual behavior specified
- **Integration** — Integrated into projection system
- **Documentation** — Documented in architecture

### 17.4 New Node Types

New node types can be added:

- **Ontology update** — NV-700-M2 updated
- **Visual encoding** — Shape/color defined
- **Integration** — Integrated into node system
- **Documentation** — Documented in architecture

### 17.5 New Relationship Types

New relationship types can be added:

- **Ontology update** — NV-700-M2 updated
- **Visual encoding** — Line style defined
- **Integration** — Integrated into edge system
- **Documentation** — Documented in architecture

### 17.6 New Visual Primitives

New visual primitives can be added:

- **Definition** — Primitive defined
- **Purpose** — Semantic meaning specified
- **Hierarchy** — Visual hierarchy assigned
- **Integration** — Integrated into grammar
- **Documentation** — Documented in architecture

---

## 18. Immutable Principles

These 85 principles govern all Atlas visualization:

### 18.1 Core Principles (10)

1. Every visual element must encode semantic meaning
2. Nothing is drawn because it looks beautiful
3. Everything is drawn because it communicates knowledge
4. Visualization never creates knowledge
5. Visualization never modifies the graph
6. Camera moves; knowledge does not
7. Projection changes visualization only
8. Labels are adaptive
9. Color communicates semantics
10. Animation communicates cognition

### 18.2 Spatial Principles (10)

11. Graph exists independently of viewport
12. Camera moves; graph does not
13. Off-screen content is not rendered
14. Pan translates camera
15. Zoom scales viewport
16. Focus centers camera
17. Navigation is spatial exploration
18. Breadcrumbs record navigation history
19. Bookmarks save positions
20. Home returns to default view

### 20.3 Node Principles (10)

21. Node shape encodes entity family
22. Node size encodes importance
23. Node color encodes family
24. Node border encodes status
25. Node label encodes identity
26. Node opacity encodes state
27. Node position encodes structure
28. Node aggregation preserves meaning
29. Node visibility respects LOD
30. Node selection is additive

### 20.4 Edge Principles (10)

31. Edge style encodes relationship category
32. Edge weight encodes strength
33. Edge color encodes category
34. Edge opacity encodes confidence
35. Edge direction encodes flow
36. Edge bundling reduces clutter
37. Edge simplification preserves meaning
38. Edge aggregation preserves weight
39. Edge visibility respects LOD
40. Edge highlighting follows selection

### 20.5 Region Principles (10)

41. Regions emerge from graph semantics
42. Regions are visual, not structural
43. Region boundaries are soft
44. Region membership is fuzzy
45. Regions can overlap
46. Regions can nest
47. Regions change with projection
48. Region labels show domain
49. Region opacity is low
50. Region color derives from content

### 20.6 Cluster Principles (10)

51. Clusters are discovered, not designed
52. Cluster boundaries emerge from density
53. Cluster labels summarize content
54. Cluster expansion reveals detail
55. Cluster contraction preserves meaning
56. Cluster edges aggregate weight
57. Cluster nodes preserve importance
58. Cluster navigation is drill-down
59. Cluster LOD respects zoom
60. Cluster visual preserves hierarchy

### 20.7 Projection Principles (10)

61. Projections never mutate graph
62. Projections filter visualization only
63. Projections emphasize meaning
64. Projections suppress noise
65. Projections transition smoothly
66. Projections are composable
67. Projections have visual identity
68. Projections respect LOD
69. Projections preserve accessibility
70. Projections are renderer-independent

### 20.8 Interaction Principles (10)

71. Interaction communicates cognition
72. Feedback is instant (< 100ms)
73. Animations explain, never entertain
74. Selection is additive
75. Focus is singular
76. Navigation is reversible
77. History is preserved
78. Bookmarks are persistent
79. Search highlights, not replaces
80. Drill-down preserves context

### 20.9 Accessibility Principles (5)

81. Keyboard navigation is complete
82. Screen readers are supported
83. Reduced motion is respected
84. High contrast is available
85. Color blindness is accommodated

---

## 19. Compatibility Analysis

### 19.1 NV-700-M1 Compatibility

| M1 Concept | M4 Treatment | Compatible |
|------------|--------------|------------|
| Atlas = Knowledge Topology | Visual language represents topology | ✓ |
| Topology captures connectivity | Nodes and edges visualize connectivity | ✓ |
| Topology captures proximity | Spatial layout encodes proximity | ✓ |
| Topology captures hierarchy | Nested regions encode hierarchy | ✓ |
| Topology captures flow | Directed edges encode flow | ✓ |
| Atlas is not a graph | Visual language is abstract, not literal | ✓ |
| Atlas is not a map | No geographic metaphor enforced | ✓ |
| Atlas is not an observatory | Active navigation, not passive viewing | ✓ |

### 19.2 NV-700-M2 Compatibility

| M2 Concept | M4 Treatment | Compatible |
|------------|--------------|------------|
| 4 entity families | 4 node shapes | ✓ |
| 22 entity types | Entity types visible in detail | ✓ |
| 7 relationship categories | 7 edge styles | ✓ |
| 28 relationship types | Relationship types visible in detail | ✓ |
| Edge metadata | Edge weight/confidence visible | ✓ |
| 18 emergent structures | Cluster visualization defined | ✓ |
| 55 immutable principles | Extended to 85 principles | ✓ |

### 19.3 NV-700-M3 Compatibility

| M3 Concept | M4 Treatment | Compatible |
|------------|--------------|------------|
| Graph Source | Not visualized (editable layer) | ✓ |
| Graph Snapshot | Visualized as graph | ✓ |
| Semantic Projection | Projections defined | ✓ |
| Visualization Payload | Payload consumed by renderer | ✓ |
| Renderer | Architecture is renderer-independent | ✓ |
| Query Engine | Queries drive visual state | ✓ |
| Metrics Engine | Metrics drive importance scaling | ✓ |

### 19.4 No Breaking Changes

The architecture introduces no breaking changes to M1, M2, or M3. It only defines visual behavior for computational artifacts.

---

## 20. Migration Impact

### 20.1 For Existing Implementations

No migration required. The architecture is conceptual, not structural. Existing code that implements visualization continues to work.

### 20.2 For Future Implementations

The architecture provides clearer guidance:

- Implement nodes with correct shapes
- Implement edges with correct styles
- Implement regions with correct boundaries
- Implement LOD with correct thresholds
- Implement accessibility with correct features

### 20.3 For NV-700-M5+

Later phases receive clean visual contracts:

- Visualization Payload provides semantic data
- Visual architecture defines visual behavior
- Implementation can choose any renderer
- Visual language remains consistent

---

## 21. Final Verdict

### 21.1 Success Criteria Met

| Criterion | Status |
|-----------|--------|
| Atlas receives a complete, implementation-independent visual language | ✓ |
| Every visual primitive has semantic meaning | ✓ |
| The visualization scales from dozens to hundreds of thousands of nodes through a canonical LOD strategy | ✓ |
| Projection behavior is visually defined without altering the graph | ✓ |
| Navigation is treated as spatial exploration rather than page navigation | ✓ |
| Color, motion, typography, and layout are semantic rather than decorative | ✓ |
| The architecture remains fully compatible with NV-700-M1, NV-700-M2, and NV-700-M3 | ✓ |
| The document provides a stable foundation for later implementation, regardless of rendering technology | ✓ |

### 21.2 Recommendation

**Approve document. Lock NV-700-M4.**

The visual language is complete, implementation-independent, and compatible with all preceding documents. The architecture provides a stable foundation for later implementation.

---

**Document Status:** LOCKED — Do not modify without explicit approval.
