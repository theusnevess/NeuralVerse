---
artifact_id: "artifact-nearest-neighbor-search-comparison-table"
artifact_title: "Vector Index Types Comparison"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Draft"
instructional_objectives:
  - Comparison
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "3-5 minutes"
supported_learning_levels:
  - Beginner
reuse_mode: ""
source_artifact: ""
dependencies:
  prerequisite:
  recommended_before:
  recommended_after:
  complementary:
  alternative:
authoritative_source: "Foundational Nearest Neighbor Search literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - nearest neighbors
  - k-NN
  - Approximate Nearest Neighbor
  - HNSW
  - search algorithms
tags:
  - learning-artifact
  - nearest-neighbors
  - search
  - algorithms
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - vector-spaces
  - distance-metrics
  - nearest-neighbor-search
  - vector-databases
  - rag-foundations
audience_notes: "Intended for AI engineers and computer science students."---

# Vector Index Types Comparison

## Artifact Summary

This artifact belongs to the Nearest Neighbor Search topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Summarize the speed, memory, and recall trade-offs of major index types.

### explanation

| Index Type | Search Speed | Memory Footprint | Recall (Accuracy) | Build Time |
|---|---|---|---|---|
| Flat (Exact) | Slow (Linear) | Minimal | 100% | Instant |
| IVF | Fast | Low | High (Adjustable) | Medium |
| LSH | Very Fast | Low | Moderate | Short |
| HNSW | Extremely Fast | High | Very High | Long |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Nearest Neighbor Search content pack.

## Reuse Notes

No reuse mode is asserted. The artifact can participate independently in different instructional contexts.

## Accessibility Notes

Text descriptions are provided for all conceptual spaces.

## Evidence Boundary

This Learning Artifact supports learning.

It does not generate Competency Evidence.

It does not certify mastery.

If this artifact is used in an assessment context, that usage must be governed separately by NV-800-M4 and NV-800-M3.

## Quality Review Checklist

- [ ] Technical accuracy checked.
- [ ] Pedagogical clarity checked.
- [ ] Required contract fields complete.
- [ ] Instructional objectives supported.
- [ ] Internal terminology consistent.
- [ ] Reuse suitability considered.
- [ ] Accessibility considerations documented where relevant.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
