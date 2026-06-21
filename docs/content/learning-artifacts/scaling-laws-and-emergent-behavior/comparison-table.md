---
artifact_id: "artifact-scaling-laws-and-emergent-behavior-comparison-table"
artifact_title: "Scaling Law Paradigms"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Draft"
instructional_objectives:
  - Comparison
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "4-6 minutes"
supported_learning_levels:
  - Intermediate
reuse_mode: ""
source_artifact: ""
dependencies:
  prerequisite:
  recommended_before:
  recommended_after:
  complementary:
  alternative:
authoritative_source: "Foundational research literature on neural scaling laws (Kaplan et al. 2020, Hoffmann et al. 2022) and inference-time compute scaling."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - Kaplan scaling
  - Chinchilla scaling
  - inference-time scaling
  - compute-optimal
  - scaling regimes
  - power-law
tags:
  - learning-artifact
  - scaling-laws
  - comparison-table
  - emergent-behavior
prerequisite_notes: "Familiarity with neural network training dynamics, loss functions, and basic language model concepts."
related_topics:
  - autoregressive-generation
  - in-context-learning
  - llm-overview
  - transformer-overview
  - reasoning-models-and-test-time-compute
audience_notes: "Intended for AI researchers, advanced ML engineers, and technical leaders evaluating model scaling strategies."
---

# Scaling Law Paradigms

## Artifact Summary

Compares key approaches, algorithms, or architectures within AI Research & Frontier Topics — organizes Scaling Law Paradigms into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast Kaplan Scaling (parameters-focused), Chinchilla Scaling (data-focused), and Inference-Time Scaling (compute-at-test-time) across focus, key finding, implication, limitation, and research status.

### explanation

| Dimension | Kaplan Scaling (2020) | Chinchilla Scaling (2022) | Inference-Time Scaling |
|---|---|---|---|
| **Focus** | How model performance scales with parameter count, dataset size, and compute during training | How to allocate compute optimally between parameters and training tokens | How additional compute at inference time (test-time) affects output quality and reasoning capability |
| **Key finding** | Performance depends most strongly on parameter count; for fixed compute, train larger models with fewer tokens | Model parameters and training tokens should be scaled proportionally; Kaplan's finding was an artifact of undertrained models | Increasing inference-time compute (e.g., chain-of-thought, self-consistency, tree search) yields systematic quality improvements, often following a power law |
| **Implication** | "Bigger models are more important than more data" — led to overparameterized, undertrained models | "Scale parameters and data equally" — led to a wave of compute-optimal models trained on more tokens per parameter | "Compute at inference can be traded for capability" — enables improved reasoning without retraining; shifts focus from pre-training to inference efficiency |
| **Limitation** | Derived from experiments with relatively small models (up to 8.5B params) using early curriculum; does not account for data quality; no longer considered the optimal allocation | Requires high-quality data at scale; data quality may degrade at the trillion-token level; does not address inference-time behavior | Diminishing returns apply; optimal inference strategy is task-dependent; may dramatically increase per-request cost; not all tasks benefit equally |
| **Research status** | Superseded for training allocation; remains influential as the first systematic scaling law study and for its methodology | Widely adopted as the standard for compute-optimal training; ongoing research into data quality scaling and multi-modal extensions | Active research direction; frontier models increasingly incorporate inference-time compute; the full scaling relationship is not yet characterized as precisely as pre-training scaling |

### comparative takeaways

The evolution from Kaplan to Chinchilla represents a refinement in understanding how to allocate pre-training compute. Inference-time scaling is a distinct but complementary paradigm: it operates at deployment rather than training time and can be combined with either Kaplan or Chinchilla-optimal pre-training. The three paradigms are not mutually exclusive — a modern strategy might use Chinchilla-optimal pre-training, followed by inference-time compute scaling during deployment, with the optimal balance between them varying by task and cost constraints. The field has not yet reached consensus on the exact scaling exponents for inference-time compute, and characterizing this relationship is an active research frontier.

## Optional Enrichment Fields

### motivation

Understanding scaling laws and emergent behavior is essential for making informed decisions about model development strategy, resource allocation, and research direction.

## Dependency Notes

This artifact is part of the AI Research & Frontier Topics content pack.

## Reuse Notes

No reuse mode is asserted. The artifact can participate independently in different instructional contexts.

## Accessibility Notes

Text descriptions are provided for all conceptual spaces. Tabular data is comprehensible in linear reading order.

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
