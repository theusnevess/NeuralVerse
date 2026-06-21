---
artifact_id: "artifact-distance-metrics-comparison-table"
artifact_title: "Distance Metrics Comparison Reference"
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
authoritative_source: "Foundational Distance Metrics literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - distance metrics
  - cosine similarity
  - euclidean distance
  - dot product
  - similarity metrics
tags:
  - learning-artifact
  - distance-metrics
  - vector-comparison
  - math
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - vector-spaces
  - distance-metrics
  - nearest-neighbor-search
  - vector-databases
  - rag-foundations
audience_notes: "Intended for AI engineers and computer science students."---

# Distance Metrics Comparison Reference

## Artifact Summary

Compares key approaches, algorithms, or architectures within Distance Metrics — organizes Distance Metrics Comparison Reference into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Provide a quick comparison reference for Cosine, Euclidean, and Dot Product metrics.

### explanation

| Metric | Measures | Range | Magnitude Sensitive? | Best Use Case |
|---|---|---|---|---|
| Cosine Similarity | Angle/Direction | [-1, 1] | No | Text search (ignoring document length) |
| Euclidean Distance | Straight-line length | [0, inf] | Yes | Spatial grouping, physical coordinates |
| Dot Product | Direction & Scale | [-inf, inf] | Yes | Normalized neural embeddings, speed-critical search |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Distance Metrics content pack.

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
