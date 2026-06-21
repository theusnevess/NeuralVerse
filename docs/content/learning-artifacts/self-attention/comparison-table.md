---
artifact_id: "artifact-self-attention-comparison-table"
artifact_title: "Query, Key, and Value Vectors"
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

# Query, Key, and Value Vectors

## Artifact Summary

This artifact belongs to the Self-Attention Mechanism topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast projecting roles, variable definitions, and outcomes in dot products.

### explanation

| Operator | Input Vector Projection | Mathematical Calculation | Role in Attention Output |
|---|---|---|---|
| Query ($Q$) | Projects search target | $X W_Q$ | Compares active token state with Keys |
| Key ($K$) | Projects target identity | $X W_K$ | Serves as index database values |
| Value ($V$) | Projects content vector | $X W_V$ | Provides the actual semantic payload |

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
