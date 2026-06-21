---
artifact_id: "artifact-activation-functions-exercise"
artifact_title: "ReLU and Sigmoid Mapping"
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

# ReLU and Sigmoid Mapping

## Artifact Summary

This artifact belongs to the Activation Functions topic and serves as a Exercise.

## Required Contract Fields

### objective

Map negative pre-activation values through Sigmoid and ReLU.

### learner task

Given a pre-activation scalar $z = -2.5$. Calculate the output activation using: 1. ReLU. 2. Sigmoid.

### expected learner output

1. ReLU: $a = \max(0, -2.5) = 0.0$. 2. Sigmoid: $a = 1 / (1 + e^{2.5}) = 1 / (1 + 12.1825) = 1 / 13.1825 = 0.0758$. The outputs are 0.0 (ReLU) and approximately 0.076 (Sigmoid).

This practice does not assign a score and does not certify mastery.

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
