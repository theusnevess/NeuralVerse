---
artifact_id: "artifact-chunking-strategies-explanatory-text"
artifact_title: "Text Chunking Strategies and Trade-offs"
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

# Text Chunking Strategies and Trade-offs

## Artifact Summary

This artifact belongs to the Chunking Strategies topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain why text chunking is necessary and compare fixed-size, recursive, and semantic splitters.

### explanation

To process long documents for LLM applications, we must divide them into smaller blocks called chunks. Chunking is necessary because LLMs have context window limits and embedding models have input length limits. The main strategies are: 1. Fixed-size chunking: Split text by a set number of characters or tokens, with an overlap to prevent loss of semantic context at boundaries. 2. Recursive character chunking: Split text using a hierarchy of separators (e.g., double newlines, single newlines, spaces) to keep paragraphs and sentences together. 3. Semantic chunking: Use embedding similarities between adjacent sentences to detect topic shifts and split only when meaning changes.

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
- [ ] Maintainability reviewed.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
