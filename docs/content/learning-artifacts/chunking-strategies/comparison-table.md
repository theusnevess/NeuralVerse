---
artifact_id: "artifact-chunking-strategies-comparison-table"
artifact_title: "Chunking Splitter Comparison Reference"
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
authoritative_source: "Foundational Chunking Strategies literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - chunking
  - text splitting
  - overlap
  - character splitter
  - semantic chunking
tags:
  - learning-artifact
  - chunking
  - data-ingestion
  - rag
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Chunking Splitter Comparison Reference

## Artifact Summary

This artifact belongs to the Chunking Strategies topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare different text splitting strategies across compute cost and semantic quality.

### explanation

| Strategy | Boundary Logic | Computational Cost | Context Preservation | Best Use Case |
|---|---|---|---|---|
| Fixed-Size | Strict length | Very Low | Poor (splits sentences) | Simple key-value text |
| Recursive | Separator hierarchy | Low | Good | Standard books/articles |
| Semantic | Sentence embedding distance | High | Excellent | Complex, multi-topic documents |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Chunking Strategies content pack.

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
