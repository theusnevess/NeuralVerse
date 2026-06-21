---
artifact_id: "artifact-multi-head-attention-exercise"
artifact_title: "Attention Dimension Splits"
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
authoritative_source: "Foundational Multi-Head Attention literature and scientific Transformer papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - multi-head attention
  - attention heads
  - representation subspaces
  - concatenation
  - parameter projection
tags:
  - learning-artifact
  - transformer
  - multi-head
prerequisite_notes: "Basic mathematical and deep sequence models comfort."
related_topics:
  - transformer-overview
  - self-attention
  - multi-head-attention
  - positional-encoding
  - encoder-vs-decoder
  - tokenization-representations
audience_notes: "Intended for AI engineers and language developers."---

# Attention Dimension Splits

## Artifact Summary

This artifact belongs to the Multi-Head Attention topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate head projection sizes from model variables.

### learner task

If the input embedding dimension is $d_{model} = 512$ and we use $h = 8$ attention heads. Calculate the internal projection dimension $d_k$ for each head, explaining why this keeps total computation comparable to single-head attention.

### expected learner output

The internal dimension d_k is d_model / h = 512 / 8 = 64. By projecting vectors into 8 smaller spaces of size 64 before computing dot products, the combined cost of the 8 heads is mathematically equivalent to computing a single head of size 512, keeping computation loads comparable.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Transformers is critical for building modern LLMs (GPT-4, Llama), semantic search retrievers, RAG interfaces, and Vision Transformers.

## Dependency Notes

This artifact is part of the Multi-Head Attention content pack.

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
