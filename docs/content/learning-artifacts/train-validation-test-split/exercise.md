---
artifact_id: "artifact-train-validation-test-split-exercise"
artifact_title: "Analyzing Pre-Scaling Leakage"
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
authoritative_source: "Foundational Train / Validation / Test Split literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - data split
  - training set
  - validation set
  - test set
  - generalization
  - data leakage
tags:
  - learning-artifact
  - ml
  - evaluation
  - data-split
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - supervised-learning
  - unsupervised-learning
  - train-validation-test-split
  - loss-functions
  - overfitting-underfitting
  - bias-variance-tradeoff
audience_notes: "Intended for AI engineers and computer science students."---

# Analyzing Pre-Scaling Leakage

## Artifact Summary

This artifact belongs to the Train / Validation / Test Split topic and serves as a Exercise.

## Required Contract Fields

### objective

Evaluate preprocessing steps to identify and fix data leakage.

### learner task

You scale your dataset's features using the mean and standard deviation calculated across the entire dataset (train + test combined) before splitting. Explain why this constitutes data leakage and how it affects model evaluation.

### expected learner output

This constitutes data leakage because statistics (mean and standard deviation) from the test set are used to scale the training set. The model indirectly receives information about the distribution of the unseen test set, resulting in artificially high test performance that will not generalize to actual production data. Features should only be scaled using parameters computed from the training partition.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Train / Validation / Test Split content pack.

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
