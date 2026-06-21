---
artifact_id: "artifact-agentic-rag-explanatory-text"
artifact_title: "Iterative Retrieval Loops and Critique-Based Corrective RAG"
artifact_family: "Instruction Artifacts"
artifact_type: "Explanatory Text"
canonical_status: "Draft"
instructional_objectives:
  - Explanatory
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

# Iterative Retrieval Loops and Critique-Based Corrective RAG

## Artifact Summary

Covers Iterative Retrieval Loops and Critique-Based Corrective RAG within the broader topic of Agentic Retrieval Systems — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain retrieval tool calls, active generation loops, evaluation states, Self-RAG frameworks, and Corrective RAG (CRAG).

### explanation

Agentic RAG represents a shift from static retrieval pipelines (retrieve once, then generate) to active, loop-based retrieval systems. An agentic RAG architecture treats search as a tool that can be invoked dynamically. The agent analyzes its initial query, decides if retrieval is necessary, evaluates the relevance of retrieved documents, generates a draft, critiques its own output, and performs supplementary retrieval if gaps or ambiguities remain. This includes frameworks like Self-RAG and Corrective RAG (CRAG).

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
