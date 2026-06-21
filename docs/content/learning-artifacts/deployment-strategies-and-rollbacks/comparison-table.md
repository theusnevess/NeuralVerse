---
artifact_id: "artifact-deployment-strategies-and-rollbacks-comparison-table"
artifact_title: "Deployment Strategies"
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
authoritative_source: "Foundational MLOps and production AI literature on deployment strategies, progressive delivery, and rollback mechanisms."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - blue-green deployment
  - canary deployment
  - shadow deployment
  - A/B testing
  - progressive delivery
  - rollback
  - traffic splitting
  - model validation gates
  - health checks
  - incident response
tags:
  - learning-artifact
  - mlops-lifecycle
  - deployment-strategies
prerequisite_notes: "Basic familiarity with model serving, CI/CD concepts, and production infrastructure."
related_topics:
  - ml-pipelines-and-orchestration
  - model-versioning-and-experiment-tracking
  - model-serving-and-inference
audience_notes: "Intended for ML engineers, MLOps practitioners, and platform engineers deploying ML models in production."---

# Deployment Strategies

## Artifact Summary

This artifact belongs to the Deployment Strategies and Rollbacks topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare blue-green, canary, shadow/reflection, and A/B testing deployment strategies across key operational dimensions.

### explanation

| Strategy Type | Traffic Percentage | Rollback Speed | Risk Profile | Infrastructure Cost | Validation Approach | Best When |
|---|---|---|---|---|---|---|
| Blue-Green | 100% instant switch | Instant (switch back) | Low | High (dual environments) | Pre-switch validation, smoke tests | Zero-downtime required, critical production services |
| Canary | Gradual (5% → 25% → 50% → 100%) | Fast (redirect remaining traffic) | Medium | Moderate (shared + extra capacity) | Progressive metric monitoring at each stage | Confidence-building before full rollout, high-traffic services |
| Shadow/Reflection | 0% user-facing, 100% mirrored | N/A (never serves users) | Very Low | High (dual inference cost) | Offline output comparison | Safety-critical systems, regulatory validation |
| A/B Testing | Controlled segments (e.g., 50/50) | Slow (experiment-driven) | Medium | Moderate (routing infrastructure) | Statistical significance testing | Feature experimentation, user experience research |

## Optional Enrichment Fields

### motivation

Understanding deployment strategies is critical for building reliable, industrial-scale ML systems that can evolve without downtime.

## Dependency Notes

This artifact is part of the Deployment Strategies and Rollbacks content pack.

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
