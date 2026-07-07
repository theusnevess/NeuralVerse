# NV-700-M2 — Canonical Knowledge Topology Model

**Status:** LOCKED  
**Date:** 2026-07-05  
**Author:** NeuralVerse Architecture Team

---

## 1. Purpose

This document defines the canonical ontology for the Knowledge Topology: what entities exist, how they relate, and what emergent structures arise from those relationships. It is the abstract model that NV-700-M3 will translate into computational form.

## 2. Entity Families

The Knowledge Topology contains 4 entity families with 22 total entity types.

### 2.1 Scientific Family (7 Knowledge Object subtypes)

| Subtype | Description |
|---------|-------------|
| Theory | Formal mathematical or logical frameworks |
| Principle | Fundamental truths that govern system behavior |
| Concept | Abstract ideas that compose larger understanding |
| Method | Procedures for accomplishing specific tasks |
| Phenomenon | Observable patterns in system behavior |
| Law | Universal rules that cannot be violated |
| Hypothesis | Proposed explanations pending validation |

### 2.2 Engineering Family (5 subtypes + 6 Software subtypes)

**Core Engineering Subtypes:**

| Subtype | Description |
|---------|-------------|
| Technique | Practical approaches to solving problems |
| Pattern | Reusable solutions to common problems |
| Architecture | Structural organization of systems |
| Algorithm | Step-by-step procedures for computation |
| DataStructure | Organized formats for storing information |

**Software Engineering Subtypes:**

| Subtype | Description |
|---------|-------------|
| Framework | Comprehensive development environments |
| Library | Reusable code collections |
| API | Interface contracts between systems |
| Protocol | Communication standards |
| Convention | Agreed-upon coding practices |
| Tool | Development utilities and helpers |

### 2.3 Evidence Family (13 subtypes)

| Subtype | Description |
|---------|-------------|
| Proof | Mathematical or logical demonstration |
| Experiment | Controlled tests of hypotheses |
| Observation | Recorded measurements from systems |
| CaseStudy | Detailed analysis of specific instances |
| Benchmark | Standardized performance measurements |
| Comparison | Side-by-side evaluations |
| Analysis | Systematic examination of components |
| Evaluation | Assessment against criteria |
| Validation | Confirmation of correctness |
| Verification | Confirmation of implementation |
| Audit | Systematic review of compliance |
| Review | Expert assessment of quality |
| Citation | Reference to authoritative sources |

### 2.4 Context Family (5 subtypes)

| Subtype | Description |
|---------|-------------|
| Problem | Challenges that motivate solutions |
| Task | Work packages that execute solutions |
| Constraint | Limitations that bound possible solutions |
| Goal | Desired outcomes that guide behavior |
| Assumption | Beliefs accepted without proof |

**Note:** Problem `has_task` Task (composition relationship), not inheritance.

## 3. Relationship Categories

The Knowledge Topology contains 7 relationship categories with 28 total relationship types.

### 3.1 Epistemic Relationships (10)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| requires | Concept → Concept | Target is prerequisite for source |
| enables | Concept → Concept | Source makes target possible |
| contradicts | Concept → Concept | Source and target are mutually exclusive |
| refines | Concept → Concept | Source is a more precise version of target |
| generalizes | Concept → Concept | Source is a broader version of target |
| specializes | Concept → Concept | Source is a specific version of target |
| composes | Concept → Concept | Source is part of target |
| decomposes | Concept → Concept | Source contains target |
| depends_on | Concept → Concept | Source cannot exist without target |
| influences | Concept → Concept | Source affects target's behavior |

### 3.2 Structural Relationships (4)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| implements | Engineering → Scientific | Engineering implements Scientific |
| realizes | Engineering → Scientific | Engineering realizes Scientific |
| constrains | Engineering → Engineering | Source limits target's options |
| extends | Engineering → Engineering | Source builds upon target |

### 3.3 Pedagogical Relationships (4)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| teaches | Content → Concept | Content explains concept |
| demonstrates | Content → Concept | Content shows concept in action |
| assesses | Content → Concept | Content tests understanding of concept |
| builds_on | Content → Concept | Content requires prior understanding |

### 3.4 Engineering Relationships (6)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| uses | Engineering → Engineering | Source employs target |
| configures | Engineering → Engineering | Source customizes target |
| deploys | Engineering → Engineering | Source releases target |
| monitors | Engineering → Engineering | Source observes target |
| optimizes | Engineering → Engineering | Source improves target |
| replaces | Engineering → Engineering | Source substitutes target |

### 3.5 Evidentiary Relationships (4)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| supports | Evidence → Concept | Evidence validates concept |
| refutes | Evidence → Concept | Evidence contradicts evidence |
| measures | Evidence → Engineering | Evidence quantifies engineering |
| benchmarks | Evidence → Engineering | Evidence compares engineering |

### 3.6 Temporal Relationships (4)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| precedes | Any → Any | Source occurs before target |
| follows | Any → Any | Source occurs after target |
| evolves_to | Any → Any | Source develops into target |
| supersedes | Any → Any | Source replaces target |

### 3.7 Inferential Relationships (5)

| Relationship | Source → Target | Description |
|--------------|-----------------|-------------|
| implies | Concept → Concept | Source logically entails target |
| suggests | Concept → Concept | Source hints at target |
| contradicts_evidence | Evidence → Evidence | Evidence contradicts evidence |
| supports_evidence | Evidence → Evidence | Evidence corroborates evidence |
| questions | Concept → Concept | Source raises doubts about target |

## 4. Edge Metadata Schema

Every relationship (edge) in the Knowledge Topology carries metadata:

```json
{
  "weight": "number (0.0-1.0)",
  "confidence": "number (0.0-1.0)",
  "evidenceCount": "integer (>= 0)",
  "canonicalStatus": "canonical | draft | deprecated",
  "temporal": {
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601",
    "expiresAt": "ISO 8601 | null"
  },
  "sourceEvidence": ["array of evidence IDs"]
}
```

### 4.1 Metadata Fields

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| weight | float | 0.0-1.0 | Strength of relationship |
| confidence | float | 0.0-1.0 | Certainty of relationship |
| evidenceCount | int | 0+ | Number of supporting evidence items |
| canonicalStatus | enum | 3 values | Lifecycle status |
| temporal | object | — | Time-related metadata |
| sourceEvidence | array | — | IDs of supporting evidence |

## 5. Emergent Structures

The Knowledge Topology gives rise to 18 computable emergent structures.

### 5.1 Centrality Structures (5)

| Structure | Definition | Metric |
|-----------|------------|--------|
| DegreeCentrality | Number of direct connections | count |
| BetweennessCentrality | Frequency of appearing on shortest paths | fraction |
| ClosenessCentrality | Average distance to all other nodes | inverse |
| EigenvectorCentrality | Connection to well-connected nodes | score |
| PageRank | Importance based on incoming connections | score |

### 5.2 Community Structures (4)

| Structure | Definition | Algorithm |
|-----------|------------|-----------|
| Community | Densely connected subgroup | Louvain |
| Cluster | Local grouping around a central node | DBSCAN |
| Hierarchy | Nested containment structure | Dendrogram |
| Core | Highly connected central region | k-core |

### 5.3 Path Structures (4)

| Structure | Definition | Algorithm |
|-----------|------------|-----------|
| ShortestPath | Minimum-hop connection | Dijkstra |
| CriticalPath | Longest dependency chain | Topological sort |
| Bridge | Connection whose removal disconnects graph | Tarjan |
| Shortcut | Long-range connection reducing path length | BFS |

### 5.4 Global Structures (5)

| Structure | Definition | Metric |
|-----------|------------|--------|
| Diameter | Longest shortest path | hops |
| AveragePathLength | Mean distance between all pairs | hops |
| ClusteringCoefficient | Tendency to form triangles | fraction |
| SmallWorldCoefficient | High clustering + short paths | ratio |
| Density | Fraction of possible edges present | fraction |

## 6. Immutable Principles

These 55 principles govern all Knowledge Topology operations:

### 6.1 Core Principles (10)

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

### 6.2 Structural Principles (10)

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

### 6.3 Behavioral Principles (10)

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

### 6.4 Emergent Principles (10)

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

### 6.5 Governance Principles (10)

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

### 6.6 Meta Principles (5)

51. The model is a map, not the territory
52. The implementation is a model, not the model
53. The visualization is an implementation, not the implementation
54. The user's understanding is the goal, not the system's complexity
55. Simplicity is a feature, not a limitation

## 7. Lock Criteria

This document is LOCKED because:

- [x] Entity families are complete (4 families, 22 types)
- [x] Relationship categories are complete (7 categories, 28 types)
- [x] Edge metadata schema is defined
- [x] Emergent structures are enumerated (18 structures)
- [x] Immutable principles are established (55 principles)
- [x] Problem-Task relationship is clarified

## 8. Next Steps

- NV-700-M3: Knowledge Graph Architecture (computational translation)
- NV-700-M4: Visual Architecture (rendering, interaction, animation)

---

**Document Status:** LOCKED — Do not modify without explicit approval.
