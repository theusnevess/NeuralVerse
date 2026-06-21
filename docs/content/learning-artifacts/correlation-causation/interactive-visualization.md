---
artifact_id: "artifact-correlation-causation-interactive-visualization"
artifact_title: "Causal Graph Editor Spec"
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

# Causal Graph Editor Spec

## Artifact Summary

Specifies an interactive tool for exploring Causal Graph Editor Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand Correlation vs. Causation.

## Required Contract Fields

### objective

Specify a causal node graph editor showing link breaks after randomized assignments.

### explanation

This specification outlines a causal graph editor. The user creates nodes (X, Y, Confounder Z) and draws arrows. The tool simulates data samples, showing how correlation values change when Z is present, and demonstrates how randomized assignment cuts the causal link from Z to X, proving causation.

## Optional Enrichment Fields

### motivation

Retrieval-augmented workflows depend on these components working together — mastering them is key to building grounded, trustworthy generation systems.

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
