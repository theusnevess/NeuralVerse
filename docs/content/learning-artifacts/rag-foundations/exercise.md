---
artifact_id: "artifact-rag-foundations-exercise"
artifact_title: "Debugging RAG Responses"
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

# Debugging RAG Responses

## Artifact Summary

This artifact belongs to the RAG Foundations topic and serves as a Exercise.

## Required Contract Fields

### objective

Analyze RAG failure modes (retrieval errors vs. generation errors) and suggest fixes.

### learner task

A RAG system returns a wrong answer. Inspecting the logs, you find that: Case A: The correct document was not in the top-3 retrieved context blocks. Case B: The correct document WAS in the prompt context, but the LLM ignored it. What fixes do you propose?

### expected learner output

The learner should explain that Case A is a retrieval failure (fix by improving search index, tuning embed model, or increasing k) and Case B is a generation failure (fix by refining prompt instructions, using a more advanced model, or ordering retrieved content differently).

This practice does not assign a score and does not certify mastery.

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
- [ ] Does not introduce assessment logic.
- [ ] Does not claim Competency Evidence.
- [ ] Does not imply learner mastery.
