---
artifact_id: "artifact-activation-functions-explanatory-text"
artifact_title: "Non-Linear Activation Mappings"
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

# Non-Linear Activation Mappings

## Artifact Summary

This artifact belongs to the Activation Functions topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain Sigmoid, Tanh, ReLU, Softmax, and vanishing gradient behaviors.

### explanation

Activation functions introduce non-linearity into neural networks, allowing them to learn complex non-linear decision boundaries. Without activation functions, any multi-layer network collapses into a simple linear model. Common functions include: 1. Sigmoid: Maps values to $(0, 1)$, useful for binary classification. 2. Tanh: Maps values to $(-1, 1)$. 3. ReLU (Rectified Linear Unit): $f(x) = \max(0, x)$, highly popular due to sparsity and computational efficiency. 4. Softmax: Normalizes a vector of logits into a probability distribution. The vanishing gradient problem occurs when activation functions (like sigmoid) saturate, yielding derivatives close to zero and stalling training.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale deep networks and search spaces.

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
