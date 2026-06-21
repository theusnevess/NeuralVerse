---
artifact_id: "artifact-correlation-causation-exercise"
artifact_title: "Identifying Recommender Confounders"
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
authoritative_source: "Foundational Correlation vs. Causation literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - correlation
  - causation
  - confounding variable
  - spurious correlation
  - A/B testing
tags:
  - learning-artifact
  - math
  - statistics
  - causal-inference
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - random-variables
  - probability-distributions
  - expected-value-variance
  - bayes-theorem
  - sampling-bias
  - correlation-causation
audience_notes: "Intended for AI engineers and computer science students."---

# Identifying Recommender Confounders

## Artifact Summary

This artifact belongs to the Correlation vs. Causation topic and serves as a Exercise.

## Required Contract Fields

### objective

Evaluate observational metrics and identify confounding variables.

### learner task

A developer notices that users who click a new recommender button spend 20% more time on the app. They claim the button causes higher engagement. Explain why this might be a correlation rather than causation, identifying a potential confounder.

### expected learner output

This is observational correlation, not proven causation. A confounding variable could be 'user intent' or 'power users': highly motivated users are more likely to explore and click new buttons (X) and also spend more time on the app (Y) regardless of the button. An A/B test is required to prove causation.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Correlation vs. Causation content pack.

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
