---
artifact_id: "artifact-domain-adaptation-exercise"
artifact_title: "Daily Interest Rate Chatbot Architecture"
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
authoritative_source: "Foundational Domain Adaptation and Specialization literature and scientific adaptation papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - domain adaptation
  - specialization
  - medical financial legal
  - vocabulary adaptation
  - rag vs fine-tuning
tags:
  - learning-artifact
  - adaptation
  - specialization
prerequisite_notes: "Basic mathematical and LLM pre-training comfort."
related_topics:
  - fine-tuning-fundamentals
  - instruction-tuning
  - peft
  - supervised-fine-tuning
  - rlhf-concepts
  - domain-adaptation
audience_notes: "Intended for AI engineers and model adaptation developers."---

# Daily Interest Rate Chatbot Architecture

## Artifact Summary

This artifact belongs to the Domain Adaptation and Specialization topic and serves as a Exercise.

## Required Contract Fields

### objective

Reason about real-time updates and stylistic vocabulary needs.

### learner task

A bank wants to build a customer assistant that answers questions about interest rates (which change daily) using the bank's internal policy documents. Discuss whether they should use fine-tuning, RAG, or both.

### expected learner output

The bank must use RAG because interest rates change daily and fine-tuning cannot integrate real-time, dynamic facts reliably without constant, expensive retraining. However, they may also use lightweight fine-tuning (e.g., LoRA) on a small set of bank conversations to teach the model the bank's stylistic tone and specific jargon, combining SFT for style and RAG for factual accuracy.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Fine-Tuning and Adaptation is critical for specializing models for custom tasks, aligning generation safety, deploying LoRA adapters in production, and selecting RAG combinations.

## Dependency Notes

This artifact is part of the Domain Adaptation and Specialization content pack.

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
