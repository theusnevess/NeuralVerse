---
artifact_id: "artifact-rag-evaluation-visual-intuition"
artifact_title: "The Fact-Checker and the Librarian"
artifact_family: "Instruction Artifacts"
artifact_type: "Visual Intuition"
canonical_status: "Draft"
instructional_objectives:
  - Visual
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "4-6 minutes"
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

# The Fact-Checker and the Librarian

## Artifact Summary

Uses analogy and mental models to build intuition about The Fact-Checker and the Librarian — maps familiar concepts to the technical mechanics of RAG Evaluation Frameworks, making abstract ideas concrete.

## Required Contract Fields

### objective

Provide an analogy for RAG evaluation using a fact-checker and a librarian.

### explanation

Imagine a newsroom preparing to publish a story. A **fact-checker** reviews the journalist's article against the original source documents. They ask: does every claim in the article appear in the sources? If the journalist wrote "the company earned $5M" but the source says "$3M," the fact-checker flags it. This is **faithfulness** in RAG evaluation — checking that the generated answer stays grounded in the retrieved context.

Meanwhile, a **librarian** evaluates the research process. They look at the stack of books the journalist pulled from the shelf and ask two questions: (1) Are all these books actually relevant to the topic? (books about finance when the story is about healthcare are useless) — this is **context precision**. (2) Did the journalist miss any essential books? (an empty shelf means the story will lack critical information) — this is **context recall**.

The editor then reads the final draft and asks: does this actually answer the question we set out to investigate? That is **answer relevance**.

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
