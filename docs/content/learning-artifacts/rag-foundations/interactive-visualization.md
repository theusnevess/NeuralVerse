---
artifact_id: "artifact-rag-foundations-interactive-visualization"
artifact_title: "RAG Prompt Injection Interactive Spec"
artifact_family: "Instruction Artifacts"
artifact_type: "Interactive Visualization"
canonical_status: "Draft"
instructional_objectives:
  - Interactive
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "6-10 minutes"
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
authoritative_source: "Foundational RAG Foundations literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - RAG
  - Retrieval-Augmented Generation
  - LLM context
  - hallucination
  - prompt engineering
tags:
  - learning-artifact
  - rag
  - llm
  - retrieval
prerequisite_notes: "Comfortable with basic vector representations."
related_topics:
  - vector-spaces
  - distance-metrics
  - nearest-neighbor-search
  - vector-databases
  - rag-foundations
audience_notes: "Intended for AI engineers and computer science students."---

# RAG Prompt Injection Interactive Spec

## Artifact Summary

This artifact belongs to the RAG Foundations topic and serves as a Interactive Visualization.

## Required Contract Fields

### objective

Specify an interactive playground that shows how retrieved content changes LLM generation.

### explanation

This specification outlines a RAG debugger. The user types a query. The tool displays: 1. The Vector Search stage, showing which chunks were matched and their similarity scores. 2. The Prompt Composer, highlighting where the matched chunks are injected. 3. The LLM Generator, displaying the final output side-by-side with a 'closed-book' baseline, highlighting how the injected context prevents hallucinations.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the RAG Foundations content pack.

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
