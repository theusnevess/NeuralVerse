---
artifact_id: "artifact-rag-evaluation-interactive-visualization"
artifact_title: "RAG Quality Score Breakdown Spec"
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

# RAG Quality Score Breakdown Spec

## Artifact Summary

This artifact belongs to the RAG Evaluation Frameworks topic and serves as a Interactive Visualization.

## Required Contract Fields

### objective

Specify a dashboard that scores RAG pipeline components on faithfulness, context precision, context recall, and answer relevance.

### explanation

This specification outlines an interactive RAG quality score dashboard. The user enters a query and observes the retrieval and generation stages. The dashboard displays:

- **Query input box** where the user types or modifies a question.
- **Retrieved chunks panel** showing the top-K chunks returned by the retriever, each labeled as relevant or irrelevant.
- **Generated answer panel** showing the LLM's response.
- **Four score meters** (0-1 scale) for faithfulness, context precision, context recall, and answer relevance.

Users manipulate variables: changing the number of retrieved chunks (K slider), rewriting the query to be more specific, or toggling the retriever model. Each change propagates through a simulated RAG pipeline and the four scores update to reflect the impact.

### interpretation guidance

When context precision drops below 0.5, an orange highlight appears on the retrieved chunks panel, signaling noise. When faithfulness dips, the generated answer is annotated with underlinked claims. When context recall is low, a "missing chunks" indicator suggests the retriever missed relevant passages.

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
