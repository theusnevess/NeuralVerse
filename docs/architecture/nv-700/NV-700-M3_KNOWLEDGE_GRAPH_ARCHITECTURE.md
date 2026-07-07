# NV-700-M3 — Knowledge Graph Architecture

**Status:** LOCKED  
**Date:** 2026-07-05  
**Author:** NeuralVerse Architecture Team  
**Revision:** Graph Source, Snapshot & Projection Model

---

## 1. Purpose

This document translates the abstract Knowledge Topology (NV-700-M2) into computational form: node schemas, edge schemas, data contracts, indexing strategies, query patterns, semantic projection computation, metrics, validation rules, lifecycle management, serialization formats, caching strategies, scalability considerations, integration patterns, and governance rules.

This revision strengthens conceptual separation by formally defining the canonical graph pipeline: Graph Source → Validation → Graph Snapshot → Semantic Projection → Visualization Payload → Renderer.

## 2. Canonical Graph Pipeline

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

Each stage is an independent architectural layer with explicit responsibilities.

## 3. Graph Source Model

### 3.1 Purpose

Graph Source represents editable knowledge before compilation into a graph instance. It is the authoring and governance layer.

### 3.2 Ownership

- Knowledge Authors
- Domain Experts
- Governance System

### 3.3 Mutability

**Mutable.** Graph Source is the only layer where knowledge can be created, edited, or deleted.

### 3.4 Persistence

- Database-backed
- Version-controlled
- Audit-logged

### 3.5 Lifecycle

```
draft → review → approved → published
  ↑       ↓         ↓
  └───────┴─────────┘
      (revision)
```

### 3.6 Consumers

- Compiler (reads for snapshot creation)
- Governance System (reads for audit)
- Search Index (reads for indexing)

### 3.7 Outputs

- JSON knowledge objects
- Relationship definitions
- Metadata records
- Governance records
- Definition versions

### 3.8 Boundary

Graph Source is NOT a graph instance. It contains knowledge artifacts that may become part of a graph, but has no graph structure, no adjacency lists, no indices, and no traversal capabilities.

## 4. Node Schema

### 4.1 Base Node Interface

```typescript
interface KnowledgeNode {
  id: string;                    // Unique identifier
  type: EntityType;              // One of 22 entity types
  family: EntityFamily;          // One of 4 entity families
  name: string;                  // Human-readable name
  description: string;           // Detailed description
  metadata: NodeMetadata;        // Extensible metadata
  versions: Version[];           // Version history
  createdAt: ISO8601;           // Creation timestamp
  updatedAt: ISO8601;           // Last update timestamp
  status: EntityStatus;          // active | archived | deprecated
}
```

### 4.2 Entity Type Enum

```typescript
type EntityType = 
  // Scientific (7)
  | 'theory' | 'principle' | 'concept' | 'method' 
  | 'phenomenon' | 'law' | 'hypothesis'
  // Engineering (11)
  | 'technique' | 'pattern' | 'architecture' | 'algorithm' 
  | 'datastructure' | 'framework' | 'library' | 'api' 
  | 'protocol' | 'convention' | 'tool'
  // Evidence (13)
  | 'proof' | 'experiment' | 'observation' | 'casestudy' 
  | 'benchmark' | 'comparison' | 'analysis' | 'evaluation' 
  | 'validation' | 'verification' | 'audit' | 'review' | 'citation'
  // Context (5)
  | 'problem' | 'task' | 'constraint' | 'goal' | 'assumption';
```

### 4.3 Entity Family Enum

```typescript
type EntityFamily = 'scientific' | 'engineering' | 'evidence' | 'context';
```

### 4.4 Node Metadata

```typescript
interface NodeMetadata {
  domain?: string;              // Knowledge domain
  tags?: string[];              // User-defined tags
  difficulty?: DifficultyLevel; // beginner | intermediate | advanced | expert
  importance?: number;          // 0.0-1.0
  confidence?: number;          // 0.0-1.0
  evidenceCount?: number;       // Supporting evidence items
  lastValidated?: ISO8601;     // Last validation timestamp
  validatedBy?: string;        // Validator user ID
}
```

### 4.5 Version Interface

```typescript
interface Version {
  id: string;                   // Version identifier
  version: number;              // Semantic version number
  changes: Change[];            // List of changes
  author: string;               // Author user ID
  timestamp: ISO8601;          // Version creation time
  reason: string;               // Why this version was created
  snapshot: Partial<KnowledgeNode>; // What changed
}
```

### 4.6 Entity Status Enum

```typescript
type EntityStatus = 'active' | 'archived' | 'deprecated';
```

## 5. Edge Schema

### 5.1 Base Edge Interface

```typescript
interface KnowledgeEdge {
  id: string;                   // Unique identifier
  source: string;               // Source node ID
  target: string;               // Target node ID
  type: RelationshipType;       // One of 28 relationship types
  category: RelationshipCategory; // One of 7 categories
  metadata: EdgeMetadata;       // Edge metadata
  createdAt: ISO8601;          // Creation timestamp
  updatedAt: ISO8601;          // Last update timestamp
  status: EdgeStatus;           // active | archived | deprecated
}
```

### 5.2 Relationship Type Enum

```typescript
type RelationshipType = 
  // Epistemic (10)
  | 'requires' | 'enables' | 'contradicts' | 'refines' 
  | 'generalizes' | 'specializes' | 'composes' | 'decomposes' 
  | 'depends_on' | 'influences'
  // Structural (4)
  | 'implements' | 'realizes' | 'constrains' | 'extends'
  // Pedagogical (4)
  | 'teaches' | 'demonstrates' | 'assesses' | 'builds_on'
  // Engineering (6)
  | 'uses' | 'configures' | 'deploys' | 'monitors' 
  | 'optimizes' | 'replaces'
  // Evidentiary (4)
  | 'supports' | 'refutes' | 'measures' | 'benchmarks'
  // Temporal (4)
  | 'precedes' | 'follows' | 'evolves_to' | 'supersedes'
  // Inferential (5)
  | 'implies' | 'suggests' | 'contradicts_evidence' 
  | 'supports_evidence' | 'questions';
```

### 5.3 Relationship Category Enum

```typescript
type RelationshipCategory = 
  | 'epistemic' | 'structural' | 'pedagogical' 
  | 'engineering' | 'evidentiary' | 'temporal' | 'inferential';
```

### 5.4 Edge Metadata

```typescript
interface EdgeMetadata {
  weight: number;               // 0.0-1.0 strength
  confidence: number;           // 0.0-1.0 certainty
  evidenceCount: number;        // Supporting evidence items
  canonicalStatus: CanonicalStatus; // lifecycle status
  temporal: TemporalMetadata;   // Time-related metadata
  sourceEvidence: string[];     // IDs of supporting evidence
}
```

### 5.5 Temporal Metadata

```typescript
interface TemporalMetadata {
  createdAt: ISO8601;          // When relationship was created
  updatedAt: ISO8601;          // When relationship was last updated
  expiresAt?: ISO8601;         // When relationship expires (optional)
}
```

### 5.6 Canonical Status Enum

```typescript
type CanonicalStatus = 'canonical' | 'draft' | 'deprecated';
```

### 5.7 Edge Status Enum

```typescript
type EdgeStatus = 'active' | 'archived' | 'deprecated';
```

## 6. Compiler

### 6.1 Purpose

The Compiler transforms Graph Source into an immutable Graph Snapshot. It is a stateless process that validates, indexes, and serializes knowledge.

### 6.2 Ownership

- System (automated process)

### 6.3 Mutability

**Immutable output.** The Compiler creates new Snapshots; it never modifies existing ones.

### 6.4 Compilation Process

1. **Validation** — Structural, metadata, and semantic validation
2. **Index Creation** — Primary, relationship, and structural indices
3. **Metric Computation** — Node, edge, and graph metrics
4. **Projection Generation** — Pre-computed projection-ready data
5. **Serialization** — JSON or binary format creation

### 6.5 Boundary

The Compiler reads Graph Source and produces Graph Snapshot. It never modifies Graph Source. It never produces anything other than Graph Snapshot.

## 7. Validator

### 7.1 Purpose

The Validator enforces structural, metadata, and semantic rules on Graph Source and Graph Snapshot.

### 7.2 Ownership

- System (automated process)

### 7.3 Mutability

**Read-only.** The Validator never modifies data; it only produces validation results.

### 7.4 Validation Rules

#### Structural Validation

| Rule | Description | Severity |
|------|-------------|----------|
| No self-loops | Node cannot connect to itself | ERROR |
| No duplicate edges | Same source-target-type allowed once | ERROR |
| Valid node references | Edge endpoints must exist | ERROR |
| Valid type combinations | Some relationships only apply between certain types | WARNING |
| No orphans | Every node should have at least one edge | WARNING |

#### Metadata Validation

| Rule | Description | Severity |
|------|-------------|----------|
| Weight range | 0.0 ≤ weight ≤ 1.0 | ERROR |
| Confidence range | 0.0 ≤ confidence ≤ 1.0 | ERROR |
| Evidence count | evidenceCount ≥ 0 | ERROR |
| Timestamp format | ISO 8601 compliant | ERROR |
| ID format | UUID v4 compliant | ERROR |

#### Semantic Validation

| Rule | Description | Severity |
|------|-------------|----------|
| Consistency | Contradicting edges should have low confidence | WARNING |
| Evidence support | High-weight edges should have evidence | WARNING |
| Version integrity | Every change should have a version | WARNING |
| Domain coherence | Related nodes should share domain or adjacent domains | INFO |

### 7.5 Boundary

The Validator reads data and produces validation results. It never modifies data. It never makes data decisions.

## 8. Graph Snapshot Model

### 8.1 Purpose

Graph Snapshot is the validated, immutable, versioned, published representation of the canonical computational graph at one moment.

### 8.2 Ownership

- Compiler (creates)
- Publication System (publishes)
- Version Control (versions)

### 8.3 Mutability

**Immutable.** Snapshots never mutate after publication. Updates always create new Snapshots. Old Snapshots remain historical.

### 8.4 Persistence

- Immutable storage
- Content-addressed
- Version-indexed

### 8.5 Lifecycle

```
compiling → compiled → published → archived
                ↑           ↓
                └───────────┘
            (new snapshot)
```

### 8.6 Consumers

- Projection Engine (reads for projection creation)
- Query Engine (reads for query execution)
- Metrics Engine (reads for metric computation)
- Cache System (reads for caching)

### 8.7 Outputs

- Immutable graph structure
- Pre-computed indices
- Pre-computed metrics
- Projection-ready data

### 8.8 Boundary

Snapshot is the only publishable graph artifact. It is never modified after publication. It does not contain visual information, layout coordinates, or rendering hints.

## 9. Graph Data Contract

### 9.1 Graph Interface

```typescript
interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeEdge>;
  metadata: GraphMetadata;
  index: GraphIndex;
}
```

### 9.2 Graph Metadata

```typescript
interface GraphMetadata {
  version: string;              // Graph version
  lastUpdated: ISO8601;        // Last update timestamp
  nodeCount: number;           // Total nodes
  edgeCount: number;           // Total edges
  domainDistribution: Record<string, number>; // Nodes per domain
  familyDistribution: Record<EntityFamily, number>; // Nodes per family
  relationshipDistribution: Record<RelationshipCategory, number>; // Edges per category
}
```

### 9.3 Graph Index

```typescript
interface GraphIndex {
  nodesByType: Map<EntityType, Set<string>>;
  nodesByFamily: Map<EntityFamily, Set<string>>;
  nodesByDomain: Map<string, Set<string>>;
  edgesByType: Map<RelationshipType, Set<string>>;
  edgesByCategory: Map<RelationshipCategory, Set<string>>;
  edgesBySource: Map<string, Set<string>>;
  edgesByTarget: Map<string, Set<string>>;
  adjacencyList: Map<string, Set<string>>;
  reverseAdjacencyList: Map<string, Set<string>>;
}
```

## 10. Indexing Strategy

### 10.1 Primary Indices

| Index | Type | Purpose |
|-------|------|---------|
| nodesById | Hash | O(1) node lookup |
| edgesById | Hash | O(1) edge lookup |
| nodesByType | Inverted | Filter by entity type |
| nodesByFamily | Inverted | Filter by entity family |
| nodesByDomain | Inverted | Filter by knowledge domain |

### 10.2 Relationship Indices

| Index | Type | Purpose |
|-------|------|---------|
| edgesByType | Inverted | Filter by relationship type |
| edgesByCategory | Inverted | Filter by relationship category |
| edgesBySource | Inverted | Outgoing edges lookup |
| edgesByTarget | Inverted | Incoming edges lookup |

### 10.3 Structural Indices

| Index | Type | Purpose |
|-------|------|---------|
| adjacencyList | Adjacency | Forward traversal |
| reverseAdjacencyList | Adjacency | Reverse traversal |
| shortestPathCache | Cache | Path query optimization |
| communityIndex | Partition | Community detection results |

## 11. Query Engine

### 11.1 Purpose

The Query Engine executes queries against Graph Snapshot and Projection without modifying source data.

### 11.2 Ownership

- System (runtime)

### 11.3 Mutability

**Read-only.** The Query Engine never modifies data; it only produces query results.

### 11.4 Query Patterns

#### Basic Queries

```typescript
getNode(id: string): KnowledgeNode | null
getEdge(id: string): KnowledgeEdge | null
getNodesByType(type: EntityType): KnowledgeNode[]
getEdgesByType(type: RelationshipType): KnowledgeEdge[]
```

#### Traversal Queries

```typescript
getNeighbors(nodeId: string, direction: 'in' | 'out' | 'both'): KnowledgeNode[]
getShortestPath(source: string, target: string): KnowledgeNode[]
getNodesWithinHops(nodeId: string, hops: number): KnowledgeNode[]
```

#### Filter Queries

```typescript
getNodesByDomain(domain: string): KnowledgeNode[]
getNodesByFamily(family: EntityFamily): KnowledgeNode[]
getEdgesByCategory(category: RelationshipCategory): KnowledgeEdge[]
getCentralNodes(metric: CentralityMetric, threshold: number): KnowledgeNode[]
```

#### Aggregation Queries

```typescript
getNodeDegree(nodeId: string): number
getGraphDensity(): number
getAveragePathLength(): number
getClusteringCoefficient(nodeId: string): number
```

### 11.5 Boundary

The Query Engine reads data and produces query results. It never modifies data. It never creates knowledge.

## 12. Metrics Engine

### 12.1 Purpose

The Metrics Engine computes node, edge, and graph metrics from Snapshot and Projection without modifying source data.

### 12.2 Ownership

- System (runtime)

### 12.3 Mutability

**Read-only.** The Metrics Engine never modifies data; it only produces metric results.

### 12.4 Node Metrics

| Metric | Formula | Range | Purpose |
|--------|---------|-------|---------|
| Degree | count(neighbors) | 0+ | Connectivity |
| InDegree | count(incoming) | 0+ | Popularity |
| OutDegree | count(outgoing) | 0+ | Influence |
| Betweenness | Σ(σ_st(v)/σ_st) | 0-1 | Bridge importance |
| Closeness | 1/Σd(v,u) | 0-1 | Centrality |
| Eigenvector | Σ(A_ij * x_j) | 0-1 | Network importance |
| PageRank | Σ(PR(j)/L(j)) | 0-1 | Link importance |

### 12.5 Edge Metrics

| Metric | Formula | Range | Purpose |
|--------|---------|-------|---------|
| Weight | Direct | 0-1 | Relationship strength |
| Confidence | Direct | 0-1 | Certainty |
| EvidenceCount | Direct | 0+ | Thoroughness |
| Reciprocity | 1 if bidirectional | 0-1 | Mutual support |

### 12.6 Graph Metrics

| Metric | Formula | Range | Purpose |
|--------|---------|-------|---------|
| Density | 2|E|/(|V|(|V|-1)) | 0-1 | Connectivity |
| Diameter | max(shortest paths) | 1+ | Size |
| AveragePathLength | Σd(u,v)/(|V|(|V|-1)) | 1+ | Efficiency |
| ClusteringCoefficient | triangles/possible | 0-1 | Local cohesion |
| SmallWorldCoefficient | (C/C_rand)/(L/L_rand) | 0+ | Small-world property |

### 12.7 Boundary

The Metrics Engine reads data and produces metric results. It never modifies data. It never creates knowledge.

## 13. Semantic Projection Model

### 13.1 Purpose

Semantic Projection is a filtered computational view of one Graph Snapshot. It selects which relationships to display based on user intent without modifying the source Snapshot.

### 13.2 Ownership

- Projection Engine (creates)
- User Session (requests)

### 13.3 Mutability

**Immutable per request.** Projections are computed on demand and do not persist. They never modify the source Snapshot.

### 13.4 Persistence

- Ephemeral (computed per request)
- Cacheable (same Snapshot + same view = same projection)

### 13.5 Lifecycle

```
requested → computed → consumed → discarded
```

### 13.6 Consumers

- Visualization Payload (reads for payload creation)
- Query Engine (reads for filtered queries)

### 13.7 Outputs

- Filtered node set
- Filtered edge set
- Projection metadata
- View-specific metrics

### 13.8 Boundary

A projection:
- Never modifies the Snapshot
- Never owns data
- Never duplicates entities
- Never creates knowledge
- Never contains visual information

### 13.9 Canonical Views

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

### 13.10 Projection Computation

```typescript
function computeSemanticProjection(
  snapshot: GraphSnapshot,
  view: SemanticView
): Projection {
  const filteredEdges = snapshot.edges.filter(edge => 
    view.includes(edge.category) || view.includes(edge.type)
  );
  
  const relevantNodes = new Set<string>();
  filteredEdges.forEach(edge => {
    relevantNodes.add(edge.source);
    relevantNodes.add(edge.target);
  });
  
  return {
    nodes: Array.from(relevantNodes).map(id => snapshot.nodes.get(id)!),
    edges: filteredEdges,
    metadata: computeProjectionMetadata(filteredEdges)
  };
}
```

### 13.11 Projection Metadata

```typescript
interface ProjectionMetadata {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averagePathLength: number;
  clusteringCoefficient: number;
  communities: Community[];
  centralNodes: RankedNode[];
}
```

## 14. Visualization Payload Model

### 14.1 Purpose

Visualization Payload is the renderer contract. It contains semantic data required for rendering without any visual decisions.

### 14.2 Ownership

- Payload Builder (creates)
- Renderer (consumes)

### 14.3 Mutability

**Immutable per request.** Payloads are computed from Projections and do not persist.

### 14.4 Persistence

- Ephemeral (computed per request)
- Not cacheable (renderer-specific)

### 14.5 Lifecycle

```
projected → payloaded → rendered → discarded
```

### 14.6 Consumers

- Renderer (reads for visual rendering)
- Interaction System (reads for event handling)

### 14.7 Payload Interface

```typescript
interface VisualizationPayload {
  nodes: PayloadNode[];
  edges: PayloadEdge[];
  metrics: ProjectionMetrics;
  aggregation: AggregationData;
  hints: LayoutHints;
  projection: ProjectionMetadata;
}
```

### 14.8 Payload Node

```typescript
interface PayloadNode {
  id: string;
  type: EntityType;
  family: EntityFamily;
  name: string;
  metadata: NodeMetadata;
  importance: number;
  centrality: number;
}
```

### 14.9 Payload Edge

```typescript
interface PayloadEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  category: RelationshipCategory;
  weight: number;
  confidence: number;
}
```

### 14.10 Layout Hints

```typescript
interface LayoutHints {
  semanticGrouping: string[];
  hierarchicalLayers: string[];
  temporalOrdering: string[];
  clusterAssignments: Map<string, string>;
}
```

### 14.11 Contains

- Visible nodes (filtered, projected)
- Visible edges (filtered, projected)
- Computed metrics (projection-specific)
- Aggregation data (cluster summaries)
- Layout hints (semantic, not visual)
- Projection metadata (view type, filter criteria)

### 14.12 Explicitly Does NOT Contain

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

### 14.13 Boundary

The renderer owns visual decisions. The payload owns only semantic data. This boundary prevents visual concerns from contaminating the graph architecture.

## 15. Compilation vs Consumption Model

### 15.1 Construction Phase (Compilation)

Graph Sources are compiled into immutable Snapshots. Compilation includes:

1. **Validation** — Structural, metadata, and semantic validation
2. **Index Creation** — Primary, relationship, and structural indices
3. **Metric Computation** — Node, edge, and graph metrics
4. **Projection Generation** — Pre-computed projection-ready data
5. **Serialization** — JSON or binary format creation

### 15.2 Publication Phase

Compiled Snapshots become available to consumers:

1. **Version Assignment** — Semantic version number
2. **Content Addressing** — Hash-based addressing
3. **Index Update** — Version index updated
4. **Cache Invalidation** — Previous version caches invalidated
5. **Notification** — Consumers notified of new version

### 15.3 Runtime Phase (Consumption)

Consumers never mutate Snapshots. Instead they:

1. **Load** — Fetch Snapshot from storage
2. **Stream** — Progressive loading for large Snapshots
3. **Cache** — Local caching for performance
4. **Project** — Create filtered views
5. **Filter** — Apply user-specific filters

### 15.4 Key Distinction

| Concern | Compilation | Consumption |
|---------|-------------|-------------|
| **Who** | Compiler | Consumer |
| **When** | Before publication | After publication |
| **Mutability** | Creates immutable output | Never mutates input |
| **Scope** | Full graph | Requested subset |
| **Performance** | Batch processing | Real-time response |
| **Persistence** | Permanent Snapshot | Ephemeral Projection |

### 15.5 Critical Rule

Lazy loading applies only to runtime consumption. Never to published Snapshots.

## 16. Serialization

### 16.1 JSON Format

```json
{
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2026-07-05T00:00:00Z",
    "nodeCount": 100,
    "edgeCount": 250
  },
  "nodes": [
    {
      "id": "uuid",
      "type": "concept",
      "family": "scientific",
      "name": "Neural Network",
      "description": "...",
      "metadata": {},
      "versions": [],
      "createdAt": "2026-07-05T00:00:00Z",
      "updatedAt": "2026-07-05T00:00:00Z",
      "status": "active"
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "uuid1",
      "target": "uuid2",
      "type": "requires",
      "category": "epistemic",
      "metadata": {
        "weight": 0.8,
        "confidence": 0.9,
        "evidenceCount": 5,
        "canonicalStatus": "canonical",
        "temporal": {
          "createdAt": "2026-07-05T00:00:00Z",
          "updatedAt": "2026-07-05T00:00:00Z"
        },
        "sourceEvidence": ["uuid-e1", "uuid-e2"]
      },
      "createdAt": "2026-07-05T00:00:00Z",
      "updatedAt": "2026-07-05T00:00:00Z",
      "status": "active"
    }
  ]
}
```

### 16.2 Binary Format (Optional)

For performance-critical applications, a binary format may be used:

```
[Header][NodeTable][EdgeTable][IndexTable]
```

## 17. Caching Strategy

### 17.1 Cache Layers

| Layer | Scope | TTL | Purpose |
|-------|-------|-----|---------|
| L1 | In-memory | Session | Hot data |
| L2 | Local storage | 1 hour | Warm data |
| L3 | CDN | 24 hours | Static data |

### 17.2 Cache Invalidation

| Trigger | Action |
|---------|--------|
| Node update | Invalidate L1, L2 for node and neighbors |
| Edge update | Invalidate L1, L2 for source and target nodes |
| Snapshot version bump | Invalidate all caches |

### 17.3 Cache Metrics

| Metric | Description |
|--------|-------------|
| Hit rate | Cache hits / total requests |
| Miss rate | Cache misses / total requests |
| Eviction rate | Evictions / total entries |
| Size | Current cache size |

## 18. Scalability

### 18.1 Size Thresholds

| Scale | Nodes | Edges | Strategy |
|-------|-------|-------|----------|
| Small | < 1K | < 10K | In-memory only |
| Medium | 1K-100K | 10K-1M | Indexed in-memory |
| Large | 100K-1M | 1M-10M | Database-backed |
| Huge | > 1M | > 10M | Distributed |

### 18.2 Optimization Strategies

| Strategy | Applicable Scale | Description |
|----------|-----------------|-------------|
| Level-of-detail | Medium+ | Reduce detail at distance |
| Viewport culling | Medium+ | Only render visible nodes |
| Edge bundling | Large+ | Group parallel edges |
| Hierarchical clustering | Large+ | Collapse clusters |
| Progressive loading | Large+ | Load on demand |
| Sharding | Huge | Distribute across machines |

## 19. Integration

### 19.1 Data Sources

| Source | Integration Method | Update Frequency |
|--------|-------------------|------------------|
| Concept Registry | Event subscription | Real-time |
| Domain Knowledge | Batch import | Daily |
| Evidence Store | Event subscription | Real-time |
| User Annotations | API call | Real-time |

### 19.2 Consumers

| Consumer | Integration Method | Purpose |
|----------|-------------------|---------|
| Atlas UI | WebSocket | Real-time updates |
| Learning System | API query | Curriculum dependencies |
| Workspace | API query | Experiment relationships |
| Retrieval | API query | Search indexing |

## 20. Governance

### 20.1 Access Control

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Admin | ✓ | ✓ | ✓ | ✓ |
| Editor | ✓ | ✓ | ✓ | — |
| Viewer | — | ✓ | — | — |
| Anonymous | — | ✓ | — | — |

### 20.2 Change Control

| Change Type | Approval Required | Review Required |
|-------------|-------------------|-----------------|
| New entity | No | No |
| New relationship | No | No |
| Entity deletion | Yes | Yes |
| Relationship deletion | No | Yes |
| Metadata update | No | No |
| Schema change | Yes | Yes |

### 20.3 Audit Trail

All changes are logged with:
- User ID
- Timestamp
- Change type
- Before/after values
- Reason (optional)

## 21. Graph Layer Responsibilities

### 21.1 Responsibility Matrix

| Layer | Owns | May Modify | May Read | Produces | Must Never Do |
|-------|------|------------|----------|----------|---------------|
| **Knowledge Source** | Raw knowledge artifacts | Knowledge artifacts | External inputs | Graph Source inputs | Create graph structure |
| **Graph Source** | Editable knowledge repository | Knowledge objects, relationships, metadata | Knowledge Source inputs | Validated knowledge | Create graph instance |
| **Compiler** | Compilation process | Nothing (creates new) | Graph Source | Graph Snapshot | Modify published Snapshot |
| **Validator** | Validation rules | Nothing | Graph Source, Snapshot | Validation results | Make data decisions |
| **Graph Snapshot** | Immutable graph instance | Nothing | Nothing | Published graph | Accept modifications |
| **Projection Engine** | View computation | Nothing | Graph Snapshot | Projection | Modify source Snapshot |
| **Query Engine** | Query execution | Nothing | Snapshot, Projection | Query results | Modify source data |
| **Metrics Engine** | Metric computation | Nothing | Snapshot, Projection | Metric results | Modify source data |
| **Visualization Payload** | Renderer contract | Nothing | Projection | Renderable data | Contain visual decisions |
| **Renderer** | Visual rendering | Visual state | Visualization Payload | Visual output | Modify graph data |
| **UI** | User interaction | UI state | Renderer | User actions | Modify graph data |

### 21.2 Violation Detection

Architectural violations become immediately obvious when checking this table:

- If a Renderer modifies graph data → violation (Must Never Do)
- If a Projection creates knowledge → violation (Must Never Do)
- If a Snapshot accepts modifications → violation (Must Never Do)
- If a Visualization Payload contains CSS → violation (Must Never Do)
- If UI state contaminates graph state → violation (Must Never Do)

## 22. Immutable Principles

These 65 principles govern all Knowledge Graph operations:

### 22.1 Core Principles (10)

1. Every knowledge entity is unique
2. Every relationship is directed
3. Every relationship has metadata
4. No relationship is permanent
5. Every change is traceable
6. No entity exists in isolation
7. Every claim requires evidence
8. Every version is accessible
9. No relationship is absolute
10. Every view is a projection

### 22.2 Structural Principles (10)

11. Hierarchy is optional
12. Cycles are allowed
13. Weight reflects strength, not truth
14. Confidence reflects certainty, not importance
15. Evidence count reflects thoroughness, not correctness
16. Canonical status reflects lifecycle, not quality
17. Temporal metadata reflects history, not validity
18. Source evidence reflects provenance, not authority
19. Every node can be a root
20. Every edge can be reversed

### 22.3 Behavioral Principles (10)

21. Updates propagate through relationships
22. Deletions cascade through dependencies
23. Merges preserve history
24. Splits create new entities
25. Moves update relationships
26. Copies diverge from originals
27. Archives preserve but deactivate
28. Restores recreate but mark as restored
29. Validates before committing
30. Logs all operations

### 22.4 Emergent Principles (10)

31. Communities emerge from clustering
32. Hierarchies emerge from generalization
33. Paths emerge from dependencies
34. Centrality emerges from connectivity
35. Density emerges from relatedness
36. Small-world properties emerge from shortcuts
37. Scale-free properties emerge from preferential attachment
38. Robustness emerges from redundancy
39. Fragility emerges from bottlenecks
40. Evolution emerges from mutation and selection

### 22.5 Governance Principles (10)

41. No entity is owned by a single user
42. No relationship is secret
43. No change is anonymous
44. No deletion is permanent
45. No version is inaccessible
46. No view is privileged
47. No metric is absolute
48. No principle is inviolable
49. Every rule can be amended
50. Every amendment is documented

### 22.6 Meta Principles (5)

51. The model is a map, not the territory
52. The implementation is a model, not the model
53. The visualization is an implementation, not the implementation
54. The user's understanding is the goal, not the system's complexity
55. Simplicity is a feature, not a limitation

### 22.7 Graph Pipeline Principles (10)

56. **Graph Sources are editable.** Only Graph Source may create, modify, or delete knowledge artifacts.

57. **Snapshots are immutable.** Once published, a Snapshot never changes. Updates create new Snapshots.

58. **Projections never own data.** Projections are filtered views that reference Snapshot data without duplicating or owning it.

59. **Visualization Payload is renderer-independent.** Payloads contain semantic data only; visual decisions belong to the Renderer.

60. **Compilation and consumption are separate concerns.** Compilation creates immutable Snapshots; Consumption reads and filters them.

61. **Rendering never modifies the graph.** The Renderer reads Visualization Payloads and produces visual output without touching graph data.

62. **Semantic projections never create knowledge.** Projections filter existing knowledge; they never invent, infer, or fabricate new knowledge.

63. **Renderer decisions never leak into graph contracts.** CSS, colors, coordinates, animation, and DOM never appear in Snapshot or Projection interfaces.

64. **Snapshots are the only publishable graph artifact.** Only Snapshots represent the canonical computational graph at a moment in time.

65. **UI state never contaminates graph state.** User interface selections, zoom levels, and interaction states do not affect graph data.

## 23. Minimum Viable Graph Architecture

### 23.1 MVP Components

| Component | Description | Status |
|-----------|-------------|--------|
| Canonical graph | The fundamental graph data structure | Required |
| Canonical node schema | Node interface and types | Required |
| Canonical edge schema | Edge interface and types | Required |
| Validation | Structural, metadata, semantic validation | Required |
| Core indexes | Primary, relationship, structural indices | Required |
| Projection engine | Creates filtered views from Snapshots | Required |
| Projection contract | Interface for Projection outputs | Required |
| Serialization | JSON and optional binary formats | Required |
| Query engine | Basic graph traversal and filter queries | Required |

### 23.2 Removed from MVP

| Component | Reason | Moved To |
|-----------|--------|----------|
| Force Directed layout | Visual decision | NV-700-M4 |
| Topology View rendering | Visual decision | NV-700-M4 |
| Mode × View matrix | Visual decision | NV-700-M4 |
| Layout algorithms | Visual decision | NV-700-M4 |
| Render strategies | Visual decision | NV-700-M4 |
| Interaction strategies | Visual decision | NV-700-M4 |
| Optimization strategies | Visual decision | NV-700-M4 |

### 23.3 MVP Boundary

The M3 MVP is renderer-independent. It provides semantic data that any renderer can consume. No visualization mode, layout algorithm, or rendering strategy appears in M3.

## 24. Lock Criteria

This document is LOCKED because:

- [x] Graph Source model is defined
- [x] Snapshot model is defined
- [x] Projection model is defined
- [x] Visualization Payload model is defined
- [x] Compilation vs Consumption model is defined
- [x] Graph Layer Responsibilities are defined
- [x] Immutable Principles are updated (65 total)
- [x] MVP is visualization-free
- [x] Node schema is complete
- [x] Edge schema is complete
- [x] Indexing strategy is specified
- [x] Query patterns are documented
- [x] Metrics are enumerated
- [x] Validation rules are complete
- [x] Lifecycle management is specified
- [x] Serialization format is defined
- [x] Caching strategy is documented
- [x] Scalability thresholds are established
- [x] Integration patterns are specified
- [x] Governance rules are defined
- [x] Compatible with NV-700-M1
- [x] Compatible with NV-700-M2
- [x] Ready for NV-700-M4

---

**Document Status:** LOCKED — Do not modify without explicit approval.
