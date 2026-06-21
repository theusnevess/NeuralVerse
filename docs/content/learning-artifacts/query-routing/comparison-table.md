---
artifact_id: "artifact-query-routing-comparison-table"
artifact_title: "Query Routing Architectures"
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
authoritative_source: "Foundational Query Routing and Intent Detection literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - query routing
  - intent detection
  - semantic routing
  - logical routers
  - multi-source retrieval
tags:
  - learning-artifact
  - rag
  - retrieval
  - routing
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

# Query Routing Architectures

## Artifact Summary

Compares key approaches, algorithms, or architectures within Query Routing and Intent Detection — organizes Query Routing Architectures into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast execution latencies, intent flexibilities, and resource costs of routing patterns.

### explanation

| Metric / Feature | Vector-Based Routing | LLM-Based Routing | Rule-Based Classifier |
|---|---|---|---|
| Execution Latency | Very Low (< 10ms) | High (dependent on token gen) | Low (< 5ms) |
| Intent Flexibility | Moderate (semantic thresholds) | Extremely High (natural language reasoning) | Low (hardcoded regex/rules) |
| Infrastructure Cost | Low (vector comparisons) | High (inference tokens) | Negligible |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Query Routing and Intent Detection content pack.

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
