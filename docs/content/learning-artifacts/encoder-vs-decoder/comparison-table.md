---
artifact_id: "artifact-encoder-vs-decoder-comparison-table"
artifact_title: "Encoder, Decoder, and Unified Systems"
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

# Encoder, Decoder, and Unified Systems

## Artifact Summary

Compares key approaches, algorithms, or architectures within Encoder vs Decoder Architectures — organizes Encoder, Decoder, and Unified Systems into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast attention setups, primary duties, and instance cases.

### explanation

| Paradigm | Attention Masking | Primary Task Types | Classic Architectures |
|---|---|---|---|
| Encoder-Only | None (bidirectional context) | Classification, embeddings, retrieval | BERT, RoBERTa |
| Decoder-Only | Causal (looks backward only) | Autoregressive generation, instruction | GPT-4, Llama, Mistral |
| Encoder-Decoder | Bidirectional (encoder) + Causal (decoder) | Translation, summarization, text-to-text | T5, BART |

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
