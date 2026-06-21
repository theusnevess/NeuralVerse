---
artifact_id: "artifact-vector-databases-exercise"
artifact_title: "Designing Query Filters"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Draft"
instructional_objectives:
  - Exercise
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "5-8 minutes"
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
authoritative_source: "Foundational Vector Databases literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - vector database
  - metadata filtering
  - indexing
  - Pinecone
  - Milvus
  - Qdrant
tags:
  - learning-artifact
  - vector-databases
  - storage
  - infrastructure
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - vector-spaces
  - distance-metrics
  - nearest-neighbor-search
  - vector-databases
  - rag-foundations
audience_notes: "Intended for AI engineers and computer science students."---

# Designing Query Filters

## Artifact Summary

This artifact belongs to the Vector Databases topic and serves as a Exercise.

## Required Contract Fields

### objective

Design and explain query filter strategies for realistic user search queries.

### learner task

A user searches for 'Italian restaurants' in a vector database containing millions of reviews, but only wants restaurants in 'New York' with rating '> 4'. Draft the pseudocode/structure of a query with metadata filters. Explain why pre-filtering or single-stage filtering is required here rather than post-filtering.

### expected learner output

The learner should design a query structure with location and rating filters. They must explain that since 'New York' drastically reduces the candidate set, post-filtering would fail because the global top-k nearest neighbors may contain no New York restaurants, while pre-filtering or single-stage filtering guarantees correct results.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Vector Databases content pack.

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
- [ ] Maintainability reviewed.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
