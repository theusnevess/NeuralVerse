---
artifact_id: "artifact-hybrid-search-comparison-table"
artifact_title: "Search Methodology Comparison Reference"
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
authoritative_source: "Foundational Hybrid Search literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - hybrid search
  - reciprocal rank fusion
  - RRF
  - lexical search
  - dense retrieval
tags:
  - learning-artifact
  - hybrid-search
  - retrieval
  - algorithms
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Search Methodology Comparison Reference

## Artifact Summary

Compares key approaches, algorithms, or architectures within Hybrid Search — organizes Search Methodology Comparison Reference into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare Lexical, Dense, and Hybrid search attributes and costs.

### explanation

| Search Type | Query Mode | Pros | Cons |
|---|---|---|---|
| Lexical | Exact word matches | Fast, handles codes and rare words | Fails on synonyms and context |
| Dense | Concept proximity | Handles synonyms, multilingual | High compute, misses exact codes |
| Hybrid | Merged ranks (RRF) | Best of both worlds, high recall | Double index storage, complex pipeline |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Hybrid Search content pack.

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
