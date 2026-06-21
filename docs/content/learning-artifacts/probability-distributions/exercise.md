---
artifact_id: "artifact-probability-distributions-exercise"
artifact_title: "Computing Softmax Class Probabilities"
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
authoritative_source: "Foundational Probability Distributions literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - probability distribution
  - Gaussian
  - Bernoulli
  - uniform
  - Normal distribution
  - softmax
tags:
  - learning-artifact
  - math
  - probability
  - distributions
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - random-variables
  - probability-distributions
  - expected-value-variance
  - bayes-theorem
  - sampling-bias
  - correlation-causation
audience_notes: "Intended for AI engineers and computer science students."---

# Computing Softmax Class Probabilities

## Artifact Summary

This artifact belongs to the Probability Distributions topic and serves as a Exercise.

## Required Contract Fields

### objective

Calculate class probabilities from raw logits using softmax.

### learner task

A classification model output layer produces logits [2.0, 1.0, 0.1]. Apply the Softmax function to convert these logits into a valid categorical probability distribution. Show your calculations.

### expected learner output

exp(2.0) = 7.389. exp(1.0) = 2.718. exp(0.1) = 1.105. Sum of exponentials = 7.389 + 2.718 + 1.105 = 11.212. Class 1 Prob = 7.389 / 11.212 = 0.659. Class 2 Prob = 2.718 / 11.212 = 0.242. Class 3 Prob = 1.105 / 11.212 = 0.099. Resulting categorical distribution = [0.659, 0.242, 0.099].

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Probability Distributions content pack.

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
