# NV-700-M3 Revision — Graph Source, Snapshot & Projection Model

**Status:** REVISION  
**Date:** 2026-07-05  
**Author:** NeuralVerse Architecture Team  
**Revision Type:** Targeted Architectural Revision  
**Scope:** 4 revisions, no scope expansion  
**Preceding Documents:** NV-700-M1 (LOCKED), NV-700-M2 (LOCKED), NV-700-M3 (LOCKED)

---

## Executive Summary

This revision resolves four architectural concerns in NV-700-M3 before permanent lock. The computational architecture is approved; this revision strengthens conceptual separation.

**Revision Goals:**

1. **Separate Graph Source, Graph Snapshot, Graph Projection, and Visualization Payload** as independent architectural layers in a canonical graph pipeline
2. **Clarify Lazy Construction vs Immutable Snapshots** by distinguishing Compilation, Publication, and Consumption phases
3. **Remove Visualization Decisions from MVP** — no visualization mode may appear in M3; visualization belongs to NV-700-M4
4. **Strenthen Layer Boundaries** with explicit responsibilities for every architectural layer

**Outcome:** The document remains fully compatible with NV-700-M1 and NV-700-M2. The architecture remains implementation-independent and ready to support NV-700-M4 — Visual Architecture without future restructuring.

---

## Architectural Changes

### Change 1: Canonical Graph Pipeline

**Before:** Graph Source, Snapshot, Projection, and Visualization Payload were mentioned but not defined as independent architectural layers.

**After:** Four explicit layers with formal contracts:

```
Knowledge Source
      ↓
  Graph Source
      ↓
  Validation
      ↓
  Graph Snapshot
      ↓
  Semantic Projection
      ↓
  Visualization Payload
      ↓
   Renderer
```

### Change 2: Compilation vs Consumption

**Before:** Ambiguous wording simultaneously stated "The graph is lazily constructed" and "Published snapshots are immutable."

**After:** Clear separation of three architectural phases:
- **Compilation:** Graph Sources → immutable Snapshots
- **Publication:** Snapshots become available to consumers
- **Consumption:** Consumers load, stream, cache, project, filter

### Change 3: Visualization-Free MVP

**Before:** MVP included "Force Directed" and "Topology View" — partially invading Visual Architecture.

**After:** MVP contains only renderer-independent components. No visualization mode, layout algorithm, or rendering strategy appears in M3.

### Change 4: Layer Responsibility Matrix

**Before:** Layer boundaries implicit.

**After:** Explicit responsibility table for 11 architectural layers with "Must Never Do" constraints.

---

## Graph Source Model

### Purpose

Graph Source represents editable knowledge before compilation into a graph instance. It is the authoring and governance layer.

### Ownership

- Knowledge Authors
- Domain Experts
- Governance System

### Mutability

**Mutable.** Graph Sources are the only layer where knowledge can be created, edited, or deleted.

### Persistence

- Database-backed
- Version-controlled
- Audit-logged

### Lifecycle

```
draft → review → approved → published
  ↑       ↓         ↓
  └───────┴─────────┘
      (revision)
```

### Consumers

- Compiler (reads for snapshot creation)
- Governance System (reads for audit)
- Search Index (reads for indexing)

### Outputs

- Validated knowledge objects
- Relationship definitions
- Metadata records
- Governance records
- Definition versions

### Boundary

Graph Source is NOT a graph instance. It contains knowledge artifacts that may become part of a graph, but has no graph structure, no adjacency lists, no indices, and no traversal capabilities.

---

## Snapshot Model

### Purpose

Graph Snapshot is the validated, immutable, versioned, published representation of the canonical computational graph at one moment.

### Ownership

- Compiler (creates)
- Publication System (publishes)
- Version Control (versions)

### Mutability

**Immutable.** Snapshots never mutate after publication. Updates always create new snapshots. Old snapshots remain historical.

### Persistence

- Immutable storage
- Content-addressed
- Version-indexed

### Lifecycle

```
compiling → compiled → published → archived
                ↑           ↓
                └───────────┘
            (new snapshot)
```

### Consumers

- Projection Engine (reads for projection creation)
- Query Engine (reads for query execution)
- Metrics Engine (reads for metric computation)
- Cache System (reads for caching)

### Outputs

- Immutable graph structure
- Pre-computed indices
- Pre-computed metrics
- Projection-ready data

### Boundary

Snapshot is the only publishable graph artifact. It is never modified after publication. It does not contain visual information, layout coordinates, or rendering hints.

---

## Projection Model

### Purpose

Graph Projection is a filtered computational view of one Graph Snapshot. It selects which relationships to display based on user intent without modifying the source snapshot.

### Ownership

- Projection Engine (creates)
- User Session (requests)

### Mutability

**Immutable per request.** Projections are computed on demand and do not persist. They never modify the source snapshot.

### Persistence

- Ephemeral (computed per request)
- Cacheable (same snapshot + same view = same projection)

### Lifecycle

```
requested → computed → consumed → discarded
```

### Consumers

- Visualization Payload (reads for payload creation)
- Query Engine (reads for filtered queries)

### Outputs

- Filtered node set
- Filtered edge set
- Projection metadata
- View-specific metrics

### Boundary

A projection:
- Never modifies the snapshot
- Never owns data
- Never duplicates entities
- Never creates knowledge
- Never contains visual information

### Canonical Views

| View | Relationships Included | Purpose |
|------|----------------------|---------|
| Topology | All | Complete view |
| Dependency | requires, depends_on, implements | Understanding prerequisites |
| Historical | precedes, follows, evolves_to, supersedes | Understanding evolution |
| Engineering | uses, configures, deploys, extends | Understanding implementation |
| Mathematical | implies, suggests, contradicts | Understanding logic |
| Curriculum | teaches, demonstrates, assesses, builds_on | Understanding learning path |
| Application | supports, refutes, measures, benchmarks | Understanding evidence |
| Research | All except pedagogical | Understanding research landscape |

---

## Visualization Payload Model

### Purpose

Visualization Payload is the renderer contract. It contains semantic data required for rendering without any visual decisions.

### Ownership

- Payload Builder (creates)
- Renderer (consumes)

### Mutability

**Immutable per request.** Payloads are computed from projections and do not persist.

### Persistence

- Ephemeral (computed per request)
- Not cacheable (renderer-specific)

### Lifecycle

```
projected → payloaded → rendered → discarded
```

### Consumers

- Renderer (reads for visual rendering)
- Interaction System (reads for event handling)

### Outputs

**Contains:**
- Visible nodes (filtered, projected)
- Visible edges (filtered, projected)
- Computed metrics (projection-specific)
- Aggregation data (cluster summaries)
- Layout hints (semantic, not visual)
- Projection metadata (view type, filter criteria)

**Explicitly Does NOT Contain:**
- CSS
- Colors
- Coordinates
- Animation
- DOM
- SVG
- Canvas
- WebGL
- React state
- Any visual decision

### Boundary

The renderer owns visual decisions. The payload owns only semantic data. This boundary prevents visual concerns from contaminating the graph architecture.

---

## Compilation vs Consumption Model

### Construction Phase (Compilation)

Graph Sources are compiled into immutable snapshots. Compilation includes:

1. **Validation** — Structural, metadata, and semantic validation
2. **Index Creation** — Primary, relationship, and structural indices
3. **Metric Computation** — Node, edge, and graph metrics
4. **Projection Generation** — Pre-computed projection-ready data
5. **Serialization** — JSON or binary format creation

### Publication Phase

Compiled snapshots become available to consumers:

1. **Version Assignment** — Semantic version number
2. **Content Addressing** — Hash-based addressing
3. **Index Update** — Version index updated
4. **Cache Invalidation** — Previous version caches invalidated
5. **Notification** — Consumers notified of new version

### Runtime Phase (Consumption)

Consumers never mutate snapshots. Instead they:

1. **Load** — Fetch snapshot from storage
2. **Stream** — Progressive loading for large snapshots
3. **Cache** — Local caching for performance
4. **Project** — Create filtered views
5. **Filter** — Apply user-specific filters

### Key Distinction

| Concern | Compilation | Consumption |
|---------|-------------|-------------|
| **Who** | Compiler | Consumer |
| **When** | Before publication | After publication |
| **Mutability** | Creates immutable output | Never mutates input |
| **Scope** | Full graph | Requested subset |
| **Performance** | Batch processing | Real-time response |
| **Persistence** | Permanent snapshot | Ephemeral projection |

Lazy loading applies only to runtime consumption. Never to published snapshots.

---

## Updated Minimum Viable Graph Architecture

### MVP Components

| Component | Description | Status |
|-----------|-------------|--------|
| Canonical graph | The fundamental graph data structure | Required |
| Canonical node schema | Node interface and types | Required |
| Canonical edge schema | Edge interface and types | Required |
| Validation | Structural, metadata, semantic validation | Required |
| Core indexes | Primary, relationship, structural indices | Required |
| Projection engine | Creates filtered views from snapshots | Required |
| Projection contract | Interface for projection outputs | Required |
| Serialization | JSON and optional binary formats | Required |
| Query engine | Basic graph traversal and filter queries | Required |

### Removed from MVP

| Component | Reason | Moved To |
|-----------|--------|----------|
| Force Directed layout | Visual decision | NV-700-M4 |
| Topology View rendering | Visual decision | NV-700-M4 |
| Mode × View matrix | Visual decision | NV-700-M4 |
| Layout algorithms | Visual decision | NV-700-M4 |
| Render strategies | Visual decision | NV-700-M4 |
| Interaction strategies | Visual decision | NV-700-M4 |
| Optimization strategies | Visual decision | NV-700-M4 |

### MVP Boundary

The M3 MVP is renderer-independent. It provides semantic data that any renderer can consume. No visualization mode, layout algorithm, or rendering strategy appears in M3.

---

## Graph Layer Responsibilities

### Responsibility Matrix

| Layer | Owns | May Modify | May Read | Produces | Must Never Do |
|-------|------|------------|----------|----------|---------------|
| **Knowledge Source** | Raw knowledge artifacts | Knowledge artifacts | External inputs | Graph Source inputs | Create graph structure |
| **Graph Source** | Editable knowledge repository | Knowledge objects, relationships, metadata | Knowledge Source inputs | Validated knowledge | Create graph instance |
| **Compiler** | Compilation process | Nothing (creates new) | Graph Source | Graph Snapshot | Modify published snapshot |
| **Validator** | Validation rules | Nothing | Graph Source, Snapshot | Validation results | Make data decisions |
| **Snapshot** | Immutable graph instance | Nothing | Nothing | Published graph | Accept modifications |
| **Projection Engine** | View computation | Nothing | Snapshot | Projection | Modify source snapshot |
| **Query Engine** | Query execution | Nothing | Snapshot, Projection | Query results | Modify source data |
| **Metrics Engine** | Metric computation | Nothing | Snapshot, Projection | Metric results | Modify source data |
| **Visualization Payload** | Renderer contract | Nothing | Projection | Renderable data | Contain visual decisions |
| **Renderer** | Visual rendering | Visual state | Visualization Payload | Visual output | Modify graph data |
| **UI** | User interaction | UI state | Renderer | User actions | Modify graph data |

### Violation Detection

 architectural violations become immediately obvious when checking this table:

- If a Renderer modifies graph data → violation (Must Never Do)
- If a Projection creates knowledge → violation (Must Never Do)
- If a Snapshot accepts modifications → violation (Must Never Do)
- If a Visualization Payload contains CSS → violation (Must Never Do)
- If UI state contaminates graph state → violation (Must Never Do)

---

## Updated Immutable Principles

### Original Principles (1-55)

All 55 principles from NV-700-M2 are preserved unchanged.

### New Graph Pipeline Principles (56-65)

#### Layer Separation Principles

56. **Graph Sources are editable.** Only Graph Source may create, modify, or delete knowledge artifacts.

57. **Snapshots are immutable.** Once published, a Snapshot never changes. Updates create new Snapshots.

58. **Projections never own data.** Projections are filtered views that reference Snapshot data without duplicating or owning it.

59. **Visualization Payload is renderer-independent.** Payloads contain semantic data only; visual decisions belong to the Renderer.

60. **Compilation and consumption are separate concerns.** Compilation creates immutable Snapshots; Consumption reads and filters them.

#### Boundary Principles

61. **Rendering never modifies the graph.** The Renderer reads Visualization Payloads and produces visual output without touching graph data.

62. **Semantic projections never create knowledge.** Projections filter existing knowledge; they never invent, infer, or fabricate new knowledge.

63. **Renderer decisions never leak into graph contracts.** CSS, colors, coordinates, animation, and DOM never appear in Snapshot or Projection interfaces.

64. **Snapshots are the only publishable graph artifact.** Only Snapshots represent the canonical computational graph at a moment in time.

65. **UI state never contaminates graph state.** User interface selections, zoom levels, and interaction states do not affect graph data.

### Total Principles: 65

---

## Compatibility Analysis

### NV-700-M1 Compatibility

| M1 Concept | M3 Treatment | Compatible |
|------------|--------------|------------|
| Atlas = Knowledge Topology | M3 provides computational topology | ✓ |
| Topology captures connectivity | M3 models connectivity in Graph Source | ✓ |
| Topology captures proximity | M3 models proximity in edge weights | ✓ |
| Topology captures hierarchy | M3 models hierarchy in relationships | ✓ |
| Topology captures flow | M3 models flow in directed edges | ✓ |
| Atlas is not a graph | M3 Graph is implementation, not identity | ✓ |
| Atlas is not a map | M3 does not impose geographic metaphor | ✓ |
| Atlas is not an observatory | M3 enables active exploration | ✓ |

### NV-700-M2 Compatibility

| M2 Concept | M3 Treatment | Compatible |
|------------|--------------|------------|
| 4 entity families | M3 node schema supports all families | ✓ |
| 22 entity types | M3 EntityType enum includes all types | ✓ |
| 7 relationship categories | M3 RelationshipCategory enum includes all | ✓ |
| 28 relationship types | M3 RelationshipType enum includes all | ✓ |
| Edge metadata schema | M3 EdgeMetadata matches M2 definition | ✓ |
| 18 emergent structures | M3 Metrics Engine computes all structures | ✓ |
| 55 immutable principles | M3 preserves all 55, adds 10 more | ✓ |
| Problem has_task Task | M3 allows any relationship type | ✓ |

### No Breaking Changes

The revision introduces no breaking changes to M1 or M2. It only strengthens conceptual separation within M3.

---

## Migration Impact

### For Existing Implementations

No migration required. The revision is conceptual, not structural. Existing code that implements the current M3 architecture continues to work.

### For Future Implementations

The revision provides clearer guidance:
- Implement Graph Source as editable knowledge repository
- Implement Compiler as snapshot creation process
- Implement Snapshot as immutable published artifact
- Implement Projection Engine as view computation
- Implement Visualization Payload as renderer contract
- Never mix compilation and consumption concerns

### For NV-700-M4

The revision ensures M4 receives clean semantic data:
- Visualization Payload provides renderer-independent data
- No visual decisions have been made in M3
- M4 has full freedom to choose visualization modes, layouts, and rendering strategies

---

## Final Verdict

### Revision Success Criteria Met

| Criterion | Status |
|-----------|--------|
| Graph Source, Snapshot, Projection, and Visualization Payload are four explicit architectural layers | ✓ |
| Contradiction between lazy construction and immutable snapshots is fully resolved | ✓ |
| No visualization or renderer decisions remain inside NV-700-M3 | ✓ |
| Graph compilation and runtime consumption are clearly separated | ✓ |
| Layer responsibilities are explicit and mutually exclusive | ✓ |
| Document remains fully compatible with NV-700-M1 and NV-700-M2 | ✓ |
| Architecture remains implementation-independent and ready for NV-700-M4 | ✓ |

### Recommendation

**Approve revision. Lock NV-700-M3 with revisions applied.**

The strengthened conceptual separation eliminates ambiguity without altering the approved computational architecture. The document is ready for permanent lock.

---

**Document Status:** REVISION — Pending approval for lock with revisions applied.
