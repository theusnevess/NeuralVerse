---
artifact_id: "artifact-context-fusion-exercise"
artifact_title: "Calculating RRF Scores"
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
authoritative_source: "Foundational Context Fusion and Aggregation literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - context fusion
  - reciprocal rank fusion
  - rrf
  - re-ranking
  - cross-encoder
tags:
  - learning-artifact
  - rag
  - retrieval
  - fusion
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

# Calculating RRF Scores

## Artifact Summary

This artifact belongs to the Context Fusion and Aggregation topic and serves as a Exercise.

## Required Contract Fields

### objective

Apply the reciprocal rank fusion formula to rank indices.

### learner task

Given a document $D$ ranked 3rd in List A and 5th in List B, calculate its Reciprocal Rank Fusion score using the standard formula $RRF(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$ with constant parameter $k = 60$.

### expected learner output

Calculation:
$RRF(D) = \frac{1}{60 + 3} + \frac{1}{60 + 5} = \frac{1}{63} + \frac{1}{65} \approx 0.01587 + 0.01538 = 0.03125$
This score is used to rank document $D$ in the aggregated list relative to other documents.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Advanced Retrieval & RAG Systems is critical for building production-grade QA engines, hallucination guardrails, hybrid index tools, and agentic routers.

## Dependency Notes

This artifact is part of the Context Fusion and Aggregation content pack.

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
