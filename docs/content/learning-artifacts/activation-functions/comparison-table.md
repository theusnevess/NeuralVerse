---
artifact_id: "artifact-activation-functions-comparison-table"
artifact_title: "Common Activations Comparison"
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
authoritative_source: "Foundational Activation Functions literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - activation functions
  - non-linearity
  - ReLU
  - sigmoid
  - tanh
  - softmax
  - vanishing gradient
tags:
  - learning-artifact
  - dl
  - activation-functions
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - artificial-neural-networks
  - forward-propagation
  - backpropagation
  - activation-functions
  - gradient-descent-optimization
  - epochs-batches-learning-rate
audience_notes: "Intended for AI engineers and computer science students."---

# Common Activations Comparison

## Artifact Summary

Compares key approaches, algorithms, or architectures within Activation Functions — organizes Common Activations Comparison into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare formulas, ranges, uses, and failure risks of standard activations.

### explanation

| Function | Formula | Range | Common Use Case | Vulnerability |
|---|---|---|---|---|
| Sigmoid | $\frac{1}{1 + e^{-z}}$ | $(0, 1)$ | Binary output layer | Vanishing gradient at extremes |
| ReLU | $\max(0, z)$ | $[0, \infty)$ | Hidden layers | Dead neurons if inputs stay negative |
| Softmax | $\frac{e^{z_i}}{\sum e^{z_j}}$ | $(0, 1)$ | Multi-class output layer | Computationally expensive for large vocabularies |

## Optional Enrichment Fields

### motivation

Deep learning builds on these core mechanisms — understanding them is essential for designing, debugging, and improving neural architectures.

## Dependency Notes

This artifact is part of the Activation Functions content pack.

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
