---
artifact_id: "artifact-hybrid-indexing-exercise"
artifact_title: "Resolving Hybrid Search Strengths"
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

# Resolving Hybrid Search Strengths

## Artifact Summary

This artifact belongs to the Hybrid Indexing Strategies topic and serves as a Exercise.

## Required Contract Fields

### objective

Evaluate lexical vs. semantic retrieval query scenarios.

### learner task

Describe a scenario where BM25 keyword search succeeds but dense vector search fails, and vice versa. Explain how a hybrid search architecture mitigates both failure modes.

### expected learner output

BM25 succeeds but dense vector fails: Searching for a serial number 'XZ-901-B'. Embeddings compress exact letter sequences into broad semantic vectors, missing the exact document. Dense vector succeeds but BM25 fails: Searching for 'financial hardship options' when the document only contains 'debt relief programs'. Hybrid search queries both indexes, ensuring matches for both conditions are fetched.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Advanced Retrieval & RAG Systems is critical for building production-grade QA engines, hallucination guardrails, hybrid index tools, and agentic routers.

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
