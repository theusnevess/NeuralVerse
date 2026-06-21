---
artifact_id: "artifact-positional-encoding-comparison-table"
artifact_title: "Positional Encoding Methods"
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

# Positional Encoding Methods

## Artifact Summary

Compares key approaches, algorithms, or architectures within Positional Encoding — organizes Positional Encoding Methods into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare sinusoidal waves and learned vectors across features and limits.

### explanation

| Positional Method | Mathematical Representation | Main Benefit | Primary Architectural Constraint |
|---|---|---|---|
| Sinusoidal Encodings | Static wave functions (Sine/Cosine) | Extrapolates to unseen sequence lengths | Hard-coded patterns (non-trainable) |
| Learned Embeddings | Trainable parameter matrix ($PE$) | Optimizes directly for training data | Cannot scale beyond maximum sequence limit |

## Optional Enrichment Fields

### motivation

Transformers form the backbone of modern LLMs — understanding their attention mechanisms, scaling properties, and architectural variants is essential for working with models like GPT-4, Llama, and their successors.

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
