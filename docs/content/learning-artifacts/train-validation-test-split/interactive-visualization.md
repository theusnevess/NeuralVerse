---
artifact_id: "artifact-train-validation-test-split-interactive-visualization"
artifact_title: "Dataset Split Simulator Spec"
artifact_family: "Instruction Artifacts"
artifact_type: "Interactive Visualization"
canonical_status: "Draft"
instructional_objectives:
  - Interactive
learning_depths:
  - Level 1 — Intuition
  - Level 2 — Foundations
estimated_duration: "6-10 minutes"
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

# Dataset Split Simulator Spec

## Artifact Summary

Specifies an interactive tool for exploring Dataset Split Simulator Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand Train / Validation / Test Split.

## Required Contract Fields

### objective

Specify an interactive split timeline showcasing leak vulnerabilities.

### explanation

This specification describes a data split simulator. The user adjusts sliders for train/val/test ratios on a timeline. The tool simulates training, showing how validation loss changes, and highlights the risk of data leakage when features are pre-scaled on the whole dataset.

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

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
