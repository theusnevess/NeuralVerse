---
artifact_id: "artifact-context-window-management-comparison-table"
artifact_title: "Context Strategies Comparison Reference"
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
authoritative_source: "Foundational Context Window Management literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - context window
  - lost in the middle
  - prompt compression
  - context stuffing
  - token limits
tags:
  - learning-artifact
  - context-management
  - prompt-engineering
  - llm
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - chunking-strategies
  - embedding-models
  - query-expansion-reformulation
  - hybrid-search
  - reranking
  - context-window-management
audience_notes: "Intended for AI engineers and computer science students."---

# Context Strategies Comparison Reference

## Artifact Summary

This artifact belongs to the Context Window Management topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare stuffing, sorting, and prompt compression strategies.

### explanation

| Strategy | Description | Cost Impact | Risk | Best Use Case |
|---|---|---|---|---|
| Stuffing | Pack all retrieved chunks into context | High | Lost-in-the-middle, hallucination | Large context models, low-doc count |
| Relevance Reordering | Put highest-scored chunks at top/bottom | Medium | None | Standard RAG pipelines |
| Prompt Compression | Filter non-essential tokens | Low | Loss of nuance | High-latency, mobile, or API cost limits |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Context Window Management content pack.

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
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
