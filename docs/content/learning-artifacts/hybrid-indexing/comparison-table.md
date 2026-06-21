---
artifact_id: "artifact-hybrid-indexing-comparison-table"
artifact_title: "Search Index Types Compared"
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
authoritative_source: "Foundational Hybrid Indexing Strategies literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - hybrid indexing
  - lexical search
  - dense vector search
  - sparse vector search
  - metadata filtering
tags:
  - learning-artifact
  - rag
  - indexing
prerequisite_notes: "Basic mathematical and LLM prompt comfort."
related_topics:
  - query-routing
  - context-fusion
  - hybrid-indexing
  - agentic-rag
  - knowledge-grounding
  - retrieval-failure-mitigation
audience_notes: "Intended for AI engineers and retrieval search developers."
---

# Search Index Types Compared

## Artifact Summary

Compares key approaches, algorithms, or architectures within Hybrid Indexing Strategies — organizes Search Index Types Compared into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast search mechanisms, ideal targets, and weaknesses of lexical, dense, and metadata indexes.

### explanation

| Index Type | Search Mechanism | Best Suited For | Key Weakness |
|---|---|---|---|
| Lexical (BM25) | Keyword matching / TF-IDF | Serial numbers, exact names, acronyms | Synonyms, conceptual queries |
| Dense Vector | Cosine similarity on embeddings | Concepts, general questions, topics | Exact keyword/part number matching |
| Metadata Filters | Relational database schema checks | Dates, regions, categorizations | Requires structured schema up-front |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Hybrid Indexing Strategies content pack.

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
- [ ] Summary matched with objectives.
- [ ] Internal terminology consistent.
- [ ] Reuse suitability considered.
- [ ] Accessibility considerations documented.
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
