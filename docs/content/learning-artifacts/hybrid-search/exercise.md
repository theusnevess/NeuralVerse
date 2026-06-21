---
artifact_id: "artifact-hybrid-search-exercise"
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

# Calculating RRF Scores

## Artifact Summary

This artifact belongs to the Hybrid Search topic and serves as a Exercise.

## Required Contract Fields

### objective

Manually compute RRF scores for simple search results and rank the output.

### learner task

Given a Lexical list [Doc A, Doc B, Doc C] and a Dense list [Doc B, Doc D, Doc A], calculate the RRF scores for Doc A and Doc B using k=60. Determine which document is ranked first in the hybrid output.

### expected learner output

For Doc A: Lexical rank=1, Dense rank=3. RRF(A) = 1/(60+1) + 1/(60+3) = 1/61 + 1/63 = 0.01639 + 0.01587 = 0.03226. For Doc B: Lexical rank=2, Dense rank=1. RRF(B) = 1/(60+2) + 1/(60+1) = 1/62 + 1/61 = 0.01613 + 0.01639 = 0.03252. Therefore, Doc B is ranked first in the hybrid output (0.03252 > 0.03226).

This practice does not assign a score and does not certify mastery.

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
