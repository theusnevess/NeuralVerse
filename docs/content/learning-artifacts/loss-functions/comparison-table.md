---
artifact_id: "artifact-loss-functions-comparison-table"
artifact_title: "Common Loss Functions Reference"
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
authoritative_source: "Foundational Loss Functions literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - loss function
  - cost function
  - MSE
  - cross-entropy
  - gradient descent
  - optimization
tags:
  - learning-artifact
  - ml
  - math
  - loss-functions
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - supervised-learning
  - unsupervised-learning
  - train-validation-test-split
  - loss-functions
  - overfitting-underfitting
  - bias-variance-tradeoff
audience_notes: "Intended for AI engineers and computer science students."---

# Common Loss Functions Reference

## Artifact Summary

Compares key approaches, algorithms, or architectures within Loss Functions — organizes Common Loss Functions Reference into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Compare MSE, MAE, and Cross-Entropy task types and properties.

### explanation

| Loss Function | Task Type | Key Properties | Mathematical Formulation |
|---|---|---|---|
| Mean Squared Error (MSE) | Regression | Penalizes outliers heavily | (1/n) * sum((y - y_hat)^2) |
| Mean Absolute Error (MAE) | Regression | Robust to outliers (linear penalty) | (1/n) * sum(|y - y_hat|) |
| Cross-Entropy | Classification | High penalty for confident incorrect predictions | -sum(y_i * log(y_hat_i)) |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

## Dependency Notes

This artifact is part of the Loss Functions content pack.

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
