---
artifact_id: "artifact-rag-evaluation-explanatory-text"
artifact_title: "RAG Evaluation Frameworks and Metrics"
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

# RAG Evaluation Frameworks and Metrics

## Artifact Summary

Covers RAG Evaluation Frameworks and Metrics within the broader topic of RAG Evaluation Frameworks — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain RAG evaluation dimensions inspired by RAGAS: faithfulness, context precision, context recall, and answer relevance.

### explanation

RAG evaluation decomposes pipeline quality into four core dimensions inspired by the RAGAS framework:

**Faithfulness** measures whether the generated answer stays grounded in the retrieved context. A faithful answer does not introduce claims absent from or contradictory to the source chunks. This dimension targets the generation component and guards against hallucination.

**Context Precision** evaluates whether every retrieved chunk is relevant to the query. High precision means the retriever returned few irrelevant or distracting passages. This dimension targets the retrieval component and reflects signal-to-noise ratio.

**Context Recall** assesses whether all necessary chunks needed to answer the query were retrieved. High recall means the retriever captured the full range of relevant information. This dimension also targets the retrieval component and reflects coverage.

**Answer Relevance** measures how directly the generated answer addresses the user's query. An answer that is factually correct but misses the question scores low on relevance. This dimension targets the generation component and reflects response alignment.

These four dimensions decompose RAG quality into two components: retrieval quality (context precision and context recall) and generation quality (faithfulness and answer relevance).

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
