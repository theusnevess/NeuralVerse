---
artifact_id: "artifact-reranking-comparison-table"
artifact_title: "Bi-Encoder vs. Cross-Encoder Reference"
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
authoritative_source: "Foundational Reranking literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - reranking
  - cross-encoder
  - bi-encoder
  - search relevance
  - two-stage retrieval
tags:
  - learning-artifact
  - reranking
  - search-optimization
  - cross-encoder
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Bi-Encoder vs. Cross-Encoder Reference

## Artifact Summary

This artifact belongs to the Reranking topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare inputs, latency, and scalability of Bi-Encoders and Cross-Encoders.

### explanation

| Model Type | Input Processing | Latency per Item | Scalability (10M docs) | Relevance Accuracy |
|---|---|---|---|---|
| Bi-Encoder | Query & Docs processed separately | Extremely Low (Index lookup) | Excellent (Sub-ms) | Moderate-High |
| Cross-Encoder | Query & Docs processed jointly | High (Requires neural forward pass) | Impossible for direct search | Very High |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Reranking content pack.

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
