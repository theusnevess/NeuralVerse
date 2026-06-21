---
artifact_id: "artifact-gradient-descent-optimization-exercise"
artifact_title: "Single Step Parameter Update"
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
authoritative_source: "Foundational Gradient Descent and Optimization literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - gradient descent
  - stochastic gradient descent
  - SGD
  - Adam
  - moments
  - local minima
tags:
  - learning-artifact
  - dl
  - optimization
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - artificial-neural-networks
  - forward-propagation
  - backpropagation
  - activation-functions
  - gradient-descent-optimization
  - epochs-batches-learning-rate
audience_notes: "Intended for AI engineers and computer science students."---

# Single Step Parameter Update

## Artifact Summary

This artifact belongs to the Gradient Descent and Optimization topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate parameter values after gradient descent steps.

### learner task

A parameter $\theta$ currently equals $1.5$. The gradient of the loss at this point is $\nabla L(\theta) = 4.0$. If the learning rate is $\alpha = 0.1$, calculate the updated value of $\theta$ using standard gradient descent.

### expected learner output

$\theta_{new} = \theta_{old} - \alpha * \nabla L(\theta) = 1.5 - (0.1 * 4.0) = 1.5 - 0.4 = 1.1$. The updated value is 1.1.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale deep networks and search spaces.

## Dependency Notes

This artifact is part of the Gradient Descent and Optimization content pack.

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
