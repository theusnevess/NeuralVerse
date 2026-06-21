---
artifact_id: "artifact-rag-evaluation-comparison-table"
artifact_title: "RAG Evaluation Dimensions"
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

# RAG Evaluation Dimensions

## Artifact Summary

This artifact belongs to the RAG Evaluation Frameworks topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare Faithfulness, Context Precision, Context Recall, and Answer Relevance across key criteria.

### explanation

| Dimension | What It Measures | Component Assessed | Typical Score Range | Key Challenge |
|---|---|---|---|---|
| Faithfulness | Whether the answer stays grounded in retrieved context | Generation | 0.0 – 1.0 | Hallucinated or unsupported claims |
| Context Precision | Whether all retrieved chunks are relevant to the query | Retrieval | 0.0 – 1.0 | Noise from irrelevant passages |
| Context Recall | Whether all needed chunks were retrieved | Retrieval | 0.0 – 1.0 | Missing critical information |
| Answer Relevance | Whether the answer addresses the user's query | Generation | 0.0 – 1.0 | Correct but off-target answers |

### comparative takeaways

Faithfulness and answer relevance both assess the generation component but catch different failure modes: a hallucinated fact (faithfulness) versus a correct but unhelpful response (relevance). Context precision and context recall both assess retrieval but capture opposite risks: retrieving too much noise (precision) versus retrieving too little coverage (recall). Together these four dimensions provide a full decomposition of RAG pipeline quality.

## Optional Enrichment Fields

### motivation

Understanding RAG evaluation frameworks is critical for diagnosing pipeline failures, benchmarking retrieval and generation components, and building trustworthy QA systems.

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
