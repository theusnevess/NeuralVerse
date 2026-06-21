---
artifact_id: "artifact-embeddings-comparison-table"
artifact_title: "Exact Matching, Embeddings, and Semantic Similarity"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Draft"

instructional_objectives:
  - Reference
  - Explain
learning_depths:
  - Level 2 — Foundations
estimated_duration: "4-7 minutes"
supported_learning_levels:
  - Beginner
  - Intermediate

reuse_mode: ""
source_artifact: ""

dependencies:
  prerequisite: []
  recommended_before: []
  recommended_after:
    - artifact-embeddings-explanatory-text
  complementary:
    - artifact-embeddings-exercise
  alternative: []

authoritative_source: "Introductory retrieval, embedding, and semantic search concepts."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use simple table labels and keep each comparison cell concise."
keywords:
  - exact matching
  - embeddings
  - semantic similarity
  - semantic search
tags:
  - learning-artifact
  - embeddings
  - reference
prerequisite_notes: "Can be used before or after the explanatory artifact as a quick reference."
related_topics:
  - keyword search
  - vector search
  - retrieval augmented generation
audience_notes: "Designed as a compact reference for early-stage learners."
---

# Exact Matching, Embeddings, and Semantic Similarity

## Artifact Summary

This reference artifact compares exact keyword matching, embeddings, and semantic similarity so learners can distinguish surface matching from meaning-oriented comparison.

## Required Contract Fields

### objective

Clarify the differences between exact matching, embeddings, and semantic similarity in retrieval-oriented AI systems.

### comparison subjects

* Exact keyword matching
* Embeddings
* Semantic similarity

### comparison criteria

| Criterion | Exact keyword matching | Embeddings | Semantic similarity |
|---|---|---|---|
| Basic idea | Compare literal tokens or strings. | Represent items as vectors. | Estimate relatedness using vector relationships or learned meaning signals. |
| Strength | Precise when the exact words matter. | Makes many item types mathematically comparable. | Finds related ideas even when wording differs. |
| Limitation | Misses paraphrases and related concepts with different words. | Quality depends on model, data, and task fit. | Can retrieve plausible but irrelevant or biased matches. |
| Typical use | Filters, identifiers, exact search terms, structured lookup. | Vector search, clustering, recommendations, retrieval pipelines. | Meaning-oriented search, related document discovery, LLM context retrieval. |
| Failure mode | Too brittle when language varies. | Vectors may encode noise or unwanted patterns. | Similarity may be mistaken for correctness or truth. |

### comparative takeaways

Exact matching is useful when literal terms matter. Embeddings are the vector representations that make comparison possible. Semantic similarity is the interpretation of relationships between those vectors.

In practice, strong retrieval systems often combine exact signals and embedding-based signals because each captures a different kind of relevance.

## Optional Enrichment Fields

Optional — use only when it improves clarity, accessibility, or instructional value.

### recommended use cases

Use exact matching for IDs, names, filters, and precise terms. Use embeddings and semantic similarity when users may express the same idea in different words.

### limitations

Semantic similarity is not a guarantee of factual correctness, fairness, usefulness, or task success.

### references

Use source-grounded references when this artifact is promoted beyond draft status.

### decision cues

If the task requires exact compliance with a term, use exact matching. If the task requires finding related meaning across varied language, consider embeddings and semantic similarity.

## Dependency Notes

This artifact can be read independently as a quick reference, but it is most useful when paired with the explanatory text or exercise.

## Reuse Notes

No reuse mode is asserted. Future lessons may reuse the comparison structure for search, retrieval, recommendation, and LLM context pipelines.

## Accessibility Notes

Tables should remain readable in narrow layouts. If converted to another format, preserve row and column headers so screen readers can interpret the comparison.

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
