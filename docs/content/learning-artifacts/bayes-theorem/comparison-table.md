---
artifact_id: "artifact-bayes-theorem-comparison-table"
artifact_title: "Bayesian Terms Reference Table"
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

# Bayesian Terms Reference Table

## Artifact Summary

Compares key approaches, algorithms, or architectures within Bayes' Theorem — organizes Bayesian Terms Reference Table into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Summarize prior, likelihood, and posterior terms with spam filter examples.

### explanation

| Component | Mathematical Term | Conceptual Meaning | Example in Spam Filter |
|---|---|---|---|
| Prior | P(Hypothesis) | Initial probability | Probability that any incoming email is spam (2%) |
| Likelihood | P(Evidence | Hypothesis) | Probability of evidence given hypothesis | Probability that a spam email contains the word 'free' |
| Posterior | P(Hypothesis | Evidence) | Updated probability | Probability that an email with 'free' is actually spam |

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

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
