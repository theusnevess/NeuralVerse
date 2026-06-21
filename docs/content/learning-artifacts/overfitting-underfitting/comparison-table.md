---
artifact_id: "artifact-overfitting-underfitting-comparison-table"
artifact_title: "Model Performance States"
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
authoritative_source: "Foundational Overfitting and Underfitting literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - overfitting
  - underfitting
  - generalization
  - complexity
  - regularization
  - early stopping
tags:
  - learning-artifact
  - ml
  - evaluation
  - generalization
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - supervised-learning
  - unsupervised-learning
  - train-validation-test-split
  - loss-functions
  - overfitting-underfitting
  - bias-variance-tradeoff
audience_notes: "Intended for AI engineers and computer science students."---

# Model Performance States

## Artifact Summary

This artifact belongs to the Overfitting and Underfitting topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare metrics, complexity, and mitigations of underfitting, optimal fit, and overfitting.

### explanation

| Metric State | Underfitting | Optimal Fit | Overfitting |
|---|---|---|---|
| Training Loss | High | Low | Extremely Low |
| Validation Loss | High | Low | High |
| Model Complexity | Too Low | Balanced | Too High |
| Mitigation | Increase complexity, add features | N/A (Stable) | Regularization, early stopping, more data |

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Overfitting and Underfitting content pack.

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
