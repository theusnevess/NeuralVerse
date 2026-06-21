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

Provides practice applying the concepts of Calculating RRF Scores — guides the learner through reasoning steps that reinforce understanding of Context Fusion and Aggregation through active problem-solving.

## Required Contract Fields

### objective

Apply the reciprocal rank fusion formula to rank indices.

### learner task

Given a document $D$ ranked 3rd in List A and 5th in List B, calculate its Reciprocal Rank Fusion score using the standard formula $RRF(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$ with constant parameter $k = 60$.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

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
