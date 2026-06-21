---
artifact_id: "artifact-knowledge-grounding-comparison-table"
artifact_title: "Grounding Types Compared"
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

# Grounding Types Compared

## Artifact Summary

Compares key approaches, algorithms, or architectures within Knowledge Grounding and Attribution — organizes Grounding Types Compared into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast source origins, verifiabilities, and hallucination risks of parametric knowledge vs grounded outputs vs citations.

### explanation

| Metric / Feature | Parametric Knowledge | Grounded RAG Response | Attribution Citations |
|---|---|---|---|
| Source of Truth | Model's pre-trained weights | Provided context chunks | Explicit source chunk IDs |
| Verifiability | Low (hard to locate weights) | High (retrieved text match) | Absolute (sentence-to-file link) |
| Hallucination Risk | High | Low | None (for citations themselves) |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

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
