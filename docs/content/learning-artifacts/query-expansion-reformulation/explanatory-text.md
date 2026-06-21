---
artifact_id: "artifact-query-expansion-reformulation-explanatory-text"
artifact_title: "Query Processing and Expansion Techniques"
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
authoritative_source: "Foundational Query Expansion and Reformulation literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - query expansion
  - query reformulation
  - query translation
  - HyDE
  - sub-queries
tags:
  - learning-artifact
  - query-processing
  - retrieval
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

# Query Processing and Expansion Techniques

## Artifact Summary

This artifact belongs to the Query Expansion and Reformulation topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain query expansion, reformulation, and Hypothetical Document Embeddings (HyDE).

### explanation

Users often write brief, ambiguous, or poorly phrased queries. Query processing techniques translate or expand the query before searching: 1. Query Expansion: Generate synonyms or related terms to broaden the search scope. 2. Query Reformulation: Rewrite the query to be grammatically clear and self-contained (especially in conversational chatbots). 3. Hypothetical Document Embeddings (HyDE): Use an LLM to generate a hypothetical answer to the query, and use that fake answer's embedding to search the database. This works because answer-to-document similarity is often closer than question-to-document similarity.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Query Expansion and Reformulation content pack.

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
