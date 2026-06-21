---
artifact_id: "artifact-hybrid-search-explanatory-text"
artifact_title: "Lexical and Semantic Hybrid Search"
artifact_family: "Instruction Artifacts"
artifact_type: "Explanatory Text"
canonical_status: "Draft"
instructional_objectives:
  - Explanatory
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

# Lexical and Semantic Hybrid Search

## Artifact Summary

This artifact belongs to the Hybrid Search topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain hybrid search pipelines and Reciprocal Rank Fusion (RRF) rank-merging.

### explanation

No single retrieval method is perfect. Lexical search (BM25) is fast and excellent at exact terms, codes, and names, but fails on synonyms and conceptual matches. Dense vector search is excellent at semantics but poor at exact codes. Hybrid search combines both. To merge the two list results, we use Reciprocal Rank Fusion (RRF). RRF scores each document based on its rank in both lists: RRF(d) = sum_{m in M} 1 / (k + r_m(d)), where r_m(d) is the rank of document d in retrieval method m, and k is a constant (typically 60) that smoothes the ranks.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

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
- [ ] Maintainability reviewed.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
