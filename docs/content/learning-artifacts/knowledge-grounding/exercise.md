---
artifact_id: "artifact-knowledge-grounding-exercise"
artifact_title: "Detecting Hallucinations via Citations"
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
authoritative_source: "Foundational Knowledge Grounding and Attribution literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - knowledge grounding
  - attribution
  - source verification
  - citation citation
  - factual consistency
tags:
  - learning-artifact
  - rag
  - attribution
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

# Detecting Hallucinations via Citations

## Artifact Summary

This artifact belongs to the Knowledge Grounding and Attribution topic and serves as a Exercise.

## Required Contract Fields

### objective

Analyze factual consistency mismatches.

### learner task

Given a source document containing the statement 'Company X reported a revenue of $5M in Q3' and an LLM output 'Company X made $5M last year', identify the grounding error and explain how citation mapping flags this discrepancy.

### expected learner output

The grounding error is temporal extrapolation (claiming $5M was made 'last year' instead of 'in Q3'). Citation mapping flags this because when auditing the sentence 'Company X made $5M last year' against the cited Q3 source chunk, the semantic verification model flags a contradiction/unsupported claim due to the time window mismatch.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Advanced Retrieval & RAG Systems is critical for building production-grade QA engines, hallucination guardrails, hybrid index tools, and agentic routers.

## Dependency Notes

This artifact is part of the Knowledge Grounding and Attribution content pack.

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
