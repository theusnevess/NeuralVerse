---
artifact_id: "artifact-encoder-vs-decoder-explanatory-text"
artifact_title: "Bi-directional Context vs. Causal Generation"
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
authoritative_source: "Foundational Encoder vs Decoder Architectures literature and scientific Transformer papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - encoder decoder
  - masked self-attention
  - cross-attention
  - autoregressive generation
  - causal masking
tags:
  - learning-artifact
  - transformer
  - architectures
prerequisite_notes: "Basic mathematical and deep sequence models comfort."
related_topics:
  - transformer-overview
  - self-attention
  - multi-head-attention
  - positional-encoding
  - encoder-vs-decoder
  - tokenization-representations
audience_notes: "Intended for AI engineers and language developers."---

# Bi-directional Context vs. Causal Generation

## Artifact Summary

Covers Bi-directional Context vs. Causal Generation within the broader topic of Encoder vs Decoder Architectures — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain unmasked encoders, causal masked decoders, and cross-attention blocks.

### explanation

Transformer configurations are tailored to specific tasks: 1. Encoder-Only (e.g., BERT): Uses bidirectional self-attention, allowing each token to attend to all past and future tokens. Ideal for representation extraction, classification, and retrieval. 2. Decoder-Only (e.g., GPT-family): Uses causal masked self-attention, preventing tokens from attending to future tokens. Ideal for autoregressive text generation. 3. Encoder-Decoder (e.g., T5, BART): Combines both; the encoder processes the input sequence, and the decoder generates the output using cross-attention over the encoder's hidden states. Ideal for translation and summarization.

## Optional Enrichment Fields

### motivation

Transformers form the backbone of modern LLMs — understanding their attention mechanisms, scaling properties, and architectural variants is essential for working with models like GPT-4, Llama, and their successors.

## Dependency Notes

This artifact is part of the Encoder vs Decoder Architectures content pack.

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
