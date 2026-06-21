---
artifact_id: "artifact-transformer-overview-comparison-table"
artifact_title: "RNNs vs. Transformers"
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
authoritative_source: "Foundational Transformer Architecture Overview literature and scientific Transformer papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - transformer overview
  - attention architecture
  - parallel processing
  - recurrence bottleneck
  - sequence to sequence
tags:
  - learning-artifact
  - transformer
  - fundamentals
prerequisite_notes: "Basic mathematical and deep sequence models comfort."
related_topics:
  - transformer-overview
  - self-attention
  - multi-head-attention
  - positional-encoding
  - encoder-vs-decoder
  - tokenization-representations
audience_notes: "Intended for AI engineers and language developers."---

# RNNs vs. Transformers

## Artifact Summary

This artifact belongs to the Transformer Architecture Overview topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast dependencies, long-range path steps, and parallelization potentials.

### explanation

| Metric / Property | Recurrent Neural Networks (RNNs) | Transformer Architecture |
|---|---|---|
| Sequential Dependency | $O(N)$ sequential operations | $O(1)$ sequential operations (parallelized) |
| Long-Range Path Length | $O(N)$ steps to propagate | $O(1)$ attention steps between any two tokens |
| Training Parallelizability | No (depends on state $h_{t-1}$) | Yes (all tokens processed simultaneously) |

## Optional Enrichment Fields

### motivation

Understanding Transformers is critical for building modern LLMs (GPT-4, Llama), semantic search retrievers, RAG interfaces, and Vision Transformers.

## Dependency Notes

This artifact is part of the Transformer Architecture Overview content pack.

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
