---
artifact_id: "artifact-retrieval-failure-mitigation-comparison-table"
artifact_title: "Retrieval Failures and Mitigations"
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
authoritative_source: "Foundational Retrieval Failure Modes and Mitigation literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - retrieval failures
  - mitigation
  - lost in the middle
  - chunking strategies
  - empty retrieval
tags:
  - learning-artifact
  - rag
  - troubleshooting
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

# Retrieval Failures and Mitigations

## Artifact Summary

Compares key approaches, algorithms, or architectures within Retrieval Failure Modes and Mitigation — organizes Retrieval Failures and Mitigations into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast failure modes, root causes, and specific engineering resolutions.

### explanation

| RAG Failure Mode | Root Cause | Engineering Mitigation |
|---|---|---|
| Omission | Poor embedding alignment / no keyword match | Hybrid search + semantic query expansion |
| Noise (Distraction) | Excessively large retrieval limit ($K$) | Cross-encoder re-ranking + context pruning |
| Lost in the Middle | Attention decay in middle of long prompts | Sort chunks by relevance to borders / reduce context size |
| Hallucination fallback | Model generates answer from pre-training | Add strict negative system prompt constraint |


## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Retrieval Failure Modes and Mitigation content pack.

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
