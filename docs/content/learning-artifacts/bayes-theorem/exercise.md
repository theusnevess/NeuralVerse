---
artifact_id: "artifact-bayes-theorem-exercise"
artifact_title: "Spam Filter Bayes Calculation"
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
authoritative_source: "Foundational Bayes' Theorem literature and scientific documentation."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - Bayes theorem
  - conditional probability
  - prior
  - posterior
  - likelihood
  - Naive Bayes
tags:
  - learning-artifact
  - math
  - probability
  - bayesian
prerequisite_notes: "Basic mathematical comfort."
related_topics:
  - random-variables
  - probability-distributions
  - expected-value-variance
  - bayes-theorem
  - sampling-bias
  - correlation-causation
audience_notes: "Intended for AI engineers and computer science students."---

# Spam Filter Bayes Calculation

## Artifact Summary

This artifact belongs to the Bayes' Theorem topic and serves as a Exercise.

## Required Contract Fields

### objective

Apply Bayes' Theorem to calculate spam classification probabilities.

### learner task

Suppose 2% of emails are spam. A spam filter detects 95% of spam emails, but has a 1% false positive rate (marking clean emails as spam). If an email is flagged as spam, what is the probability that it actually is spam? Apply Bayes' Theorem.

### expected learner output

Let S = Spam, F = Flagged. P(S) = 0.02, P(Clean) = 0.98. P(F|S) = 0.95 (Likelihood). P(F|Clean) = 0.01 (False Positive). P(F) = P(F|S)P(S) + P(F|Clean)P(Clean) = (0.95 * 0.02) + (0.01 * 0.98) = 0.019 + 0.0098 = 0.0288. P(S|F) = P(F|S)P(S) / P(F) = 0.019 / 0.0288 = 0.6597. Therefore, there is a 66.0% chance the flagged email is actually spam.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding this topic is critical for building stable, industrial-scale retrieval and search systems.

## Dependency Notes

This artifact is part of the Bayes' Theorem content pack.

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
