---
artifact_id: "artifact-rag-foundations-explanatory-text"
artifact_title: "Retrieval-Augmented Generation (RAG) Architecture"
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

# Retrieval-Augmented Generation (RAG) Architecture

## Artifact Summary

This artifact belongs to the RAG Foundations topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain the RAG loop (Retrieve -> Augment -> Generate) and why it helps LLMs remain grounded.

### explanation

Large Language Models (LLMs) are powerful but suffer from static knowledge cutoffs and hallucinations (making up facts). Retrieval-Augmented Generation (RAG) solves this by fetching relevant, up-to-date context from an external data source (like a vector database) and feeding it to the LLM alongside the user's query. The RAG loop consists of three steps: 1. Retrieve: Take the user's question, turn it into a query vector, search the vector database, and fetch the top-k text blocks. 2. Augment: Paste those text blocks into a prompt template (e.g., 'Answer the question using only this context: [text]'). 3. Generate: Pass the augmented prompt to the LLM to get a grounded response.

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
