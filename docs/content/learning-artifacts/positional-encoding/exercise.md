---
artifact_id: "artifact-positional-encoding-exercise"
artifact_title: "Scalar Index Limits"
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
authoritative_source: "Foundational Positional Encoding literature and scientific Transformer papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - positional encoding
  - absolute position
  - relative position
  - sinusoidal encoding
  - sequence order
tags:
  - learning-artifact
  - transformer
  - position
prerequisite_notes: "Basic mathematical and deep sequence models comfort."
related_topics:
  - transformer-overview
  - self-attention
  - multi-head-attention
  - positional-encoding
  - encoder-vs-decoder
  - tokenization-representations
audience_notes: "Intended for AI engineers and language developers."---

# Scalar Index Limits

## Artifact Summary

This artifact belongs to the Positional Encoding topic and serves as a Exercise.

## Required Contract Fields

### objective

Contrast scalar coordinates with cyclic bounded values.

### learner task

Explain why simply adding a scalar position index (e.g., 1, 2, 3, ...) directly to token embeddings causes scaling problems for long sequences, and how sinusoidal curves resolve this.

### expected learner output

Adding a scalar index causes the values to grow linearly, which dominates token semantic coordinates for long sequences. Sinusoidal encodings keep values bounded in the range [-1.0, 1.0] across all lengths, encoding relative distances as linear transformations that the model can learn easily.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Transformers is critical for building modern LLMs (GPT-4, Llama), semantic search retrievers, RAG interfaces, and Vision Transformers.

## Dependency Notes

This artifact is part of the Positional Encoding content pack.

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
