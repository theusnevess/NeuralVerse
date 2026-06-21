---
artifact_id: "artifact-rag-evaluation-exercise"
artifact_title: "Diagnosing a RAG Pipeline"
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
authoritative_source: "Foundational RAG evaluation literature and scientific RAGAS framework papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - RAG evaluation
  - faithfulness
  - context precision
  - context recall
  - answer relevance
  - RAGAS
tags:
  - learning-artifact
  - llm-evaluation
  - rag
prerequisite_notes: "Basic understanding of RAG pipelines and LLM output evaluation."
related_topics:
  - hallucination-evaluation
  - agent-evaluation
  - automatic-evaluation-metrics
  - knowledge-grounding
  - retrieval-failure-mitigation
audience_notes: "Intended for AI engineers and evaluation practitioners."
---

# Diagnosing a RAG Pipeline

## Artifact Summary

Provides practice applying the concepts of Diagnosing a RAG Pipeline — guides the learner through reasoning steps that reinforce understanding of RAG Evaluation Frameworks through active problem-solving.

## Required Contract Fields

### objective

Diagnose RAG pipeline failures by identifying which evaluation dimension is failing.

### learner task

Review the three RAG output examples below. For each, identify which RAG evaluation dimension is failing (faithfulness, context precision, context recall, or answer relevance) and propose a specific fix.

**Example 1 — Hallucinated Answer**
- Query: "What is the capital of France?"
- Retrieved Chunks: [Chunk about French geography mentioning Paris]
- Generated Answer: "The capital of France is Lyon, a city known for its silk trade."
- Failure: Faithfulness (answer contradicts retrieved context).

**Example 2 — Missing Context**
- Query: "What are the symptoms and treatments for Lyme disease?"
- Retrieved Chunks: [Chunk about Lyme disease symptoms only]
- Generated Answer: "Symptoms include fever and rash."
- Failure: Context recall (treatment information was not retrieved).

**Example 3 — Irrelevant Chunks**
- Query: "How do I reset my router?"
- Retrieved Chunks: [Chunk about router security settings, Chunk about modem history, Chunk about Wi-Fi standards]
- Generated Answer: "Resetting a router involves pressing the reset button."
- Failure: Context precision (retrieved chunks are loosely relevant; security settings and history are noise).

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on evaluation to diagnose failures — mastering these frameworks is key to building trustworthy generation systems.

## Dependency Notes

This artifact is part of the RAG Evaluation Frameworks content pack.

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
