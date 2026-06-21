---
artifact_id: "artifact-gradient-descent-optimization-comparison-table"
artifact_title: "Optimization Algorithms Reference"
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

# Optimization Algorithms Reference

## Artifact Summary

This artifact belongs to the Gradient Descent and Optimization topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare SGD, Momentum, and Adam step rules, advantages, and drawbacks.

### explanation

| Optimizer | Step Update Rule | Key Advantage | Disadvantage |
|---|---|---|---|
| SGD | $\theta - \alpha g$ | Low computational cost per step | High variance updates (jittery) |
| Momentum | Incorporates past velocity | Dampens oscillations in ravines | Harder to tune additional velocity term |
| Adam | Adaptive moments | Highly robust, fast convergence | High memory cost (stores momentum vectors) |

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
