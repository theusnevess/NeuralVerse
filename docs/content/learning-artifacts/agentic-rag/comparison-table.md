---
artifact_id: "artifact-agentic-rag-comparison-table"
artifact_title: "Static RAG vs. Agentic RAG"
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
authoritative_source: "Foundational Agentic Retrieval Systems literature and scientific RAG/Information Retrieval papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - agentic rag
  - self-rag
  - corrective rag
  - active retrieval
  - tool calling RAG
tags:
  - learning-artifact
  - rag
  - agent
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

# Static RAG vs. Agentic RAG

## Artifact Summary

Compares key approaches, algorithms, or architectures within Agentic Retrieval Systems — organizes Static RAG vs. Agentic RAG into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast execution flows, retrieval decisions, and validation steps of static vs. agentic pipelines.

### explanation

| Aspect | Static RAG | Agentic RAG (Self-RAG/CRAG) |
|---|---|---|
| Execution Flow | Linear / Sequential (fixed steps) | Dynamic / Iterative (loop-based) |
| Retrieval Decisions | Hardcoded (every query retrieves $K$ chunks) | Conditional (decided by model/agent router) |
| Quality Verification | None (assumes retrieved context is correct) | Self-Critique / Relevance evaluation loops |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Agentic Retrieval Systems content pack.

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
