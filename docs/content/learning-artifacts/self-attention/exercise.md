---
artifact_id: "artifact-self-attention-exercise"
artifact_title: "Scaled Dot Product Calculation"
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
authoritative_source: "Foundational Self-Attention Mechanism literature and scientific Transformer papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - self-attention
  - scaled dot-product
  - queries keys values
  - attention matrix
  - context vectors
tags:
  - learning-artifact
  - transformer
  - attention
prerequisite_notes: "Basic mathematical and deep sequence models comfort."
related_topics:
  - transformer-overview
  - self-attention
  - multi-head-attention
  - positional-encoding
  - encoder-vs-decoder
  - tokenization-representations
audience_notes: "Intended for AI engineers and language developers."---

# Scaled Dot Product Calculation

## Artifact Summary

This artifact belongs to the Self-Attention Mechanism topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate simple vector similarities and Softmax operations.

### learner task

Given Queries $Q = [1, 0]$ and Keys $K_1 = [1, 0], K_2 = [0, 1]$ (head dimension $d_k = 2$). Calculate the raw attention weights before and after Softmax scaling.

### expected learner output

Raw dot products: Q · K_1^T = [1,0]·[1,0]^T = 1. Q · K_2^T = [1,0]·[0,1]^T = 0. Scaling by sqrt(d_k) = sqrt(2) ≈ 1.414: Scaled logits = [1/1.414, 0/1.414] ≈ [0.707, 0]. Softmax(0.707, 0): denominator = e^0.707 + e^0 = 2.028 + 1 = 3.028. Probabilities: P1 = 2.028/3.028 ≈ 0.67. P2 = 1/3.028 ≈ 0.33. Attention weights are [0.67, 0.33].

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Transformers is critical for building modern LLMs (GPT-4, Llama), semantic search retrievers, RAG interfaces, and Vision Transformers.

## Dependency Notes

This artifact is part of the Self-Attention Mechanism content pack.

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
