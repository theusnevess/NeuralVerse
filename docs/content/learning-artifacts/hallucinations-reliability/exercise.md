---
artifact_id: "artifact-hallucinations-reliability-exercise"
artifact_title: "Open vs. Closed Domain Hallucinations"
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
authoritative_source: "Foundational Hallucinations and Reliability literature and scientific LLM papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - hallucinations
  - calibration
  - grounding
  - factual accuracy
  - mitigation strategies
tags:
  - learning-artifact
  - llm
  - reliability
prerequisite_notes: "Basic mathematical and Transformer architecture comfort."
related_topics:
  - llm-overview
  - autoregressive-generation
  - prompting-fundamentals
  - context-windows-long
  - in-context-learning
  - hallucinations-reliability
audience_notes: "Intended for AI engineers and language model developers."---

# Open vs. Closed Domain Hallucinations

## Artifact Summary

This artifact belongs to the Hallucinations and Reliability topic and serves as a Exercise.

## Required Contract Fields

### objective

Contrast parameter memory leaks with context target violations.

### learner task

Explain the distinction between 'closed-domain hallucination' (violating a provided reference document) and 'open-domain hallucination' (violating general factual knowledge).

### expected learner output

Closed-domain hallucinations occur when a model contradicts or invents facts outside of a provided context document (e.g., in summarization or RAG). Open-domain hallucinations occur when a model generates facts that contradict general real-world truths stored in its parameter weights (without any reference document).

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding LLM foundations is critical for building generative chatbots, few-shot classifiers, long-context search retrievers, and aligned AI systems.

## Dependency Notes

This artifact is part of the Hallucinations and Reliability content pack.

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
