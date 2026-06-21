---
artifact_id: "artifact-expected-value-variance-exercise"
artifact_title: "Calculating RAG Latency Expectations"
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
authoritative_source: "Foundational Expected Value and Variance literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - expected value
  - variance
  - standard deviation
  - mean
  - bias-variance trade-off
tags:
  - learning-artifact
  - math
  - statistics
  - moments
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - random-variables
  - probability-distributions
  - expected-value-variance
  - bayes-theorem
  - sampling-bias
  - correlation-causation
audience_notes: "Intended for AI engineers and computer science students."---

# Calculating RAG Latency Expectations

## Artifact Summary

This artifact belongs to the Expected Value and Variance topic and serves as a Exercise.

## Required Contract Fields

### objective

Compute expectation and variance values from a discrete probability table.

### learner task

You run a RAG retrieval system. The latency of searches has the following probability distribution: 100ms with probability 0.7, and 500ms with probability 0.3. Calculate the expected latency and the variance of the search latency.

### expected learner output

E[L] = (100 * 0.7) + (500 * 0.3) = 70 + 150 = 220ms. Var(L) = E[L^2] - (E[L])^2. E[L^2] = (100^2 * 0.7) + (500^2 * 0.3) = (10000 * 0.7) + (250000 * 0.3) = 7000 + 75000 = 82000. Var(L) = 82000 - 220^2 = 82000 - 48400 = 33600 ms^2. Standard Deviation = sqrt(33600) = 183.3ms.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Expected Value and Variance content pack.

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
