---
artifact_id: "artifact-ml-pipelines-and-orchestration-exercise"
artifact_title: "Designing an ML Pipeline"
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
authoritative_source: "Foundational MLOps literature on ML pipelines and workflow orchestration."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - ML pipelines
  - orchestration
  - pipeline design
  - failure handling
  - CI/CD
tags:
  - learning-artifact
  - mlops-lifecycle
  - ml-pipelines
prerequisite_notes: "Basic familiarity with ML model development lifecycle."
related_topics:
  - model-versioning-and-experiment-tracking
  - deployment-strategies-and-rollbacks
  - model-serving-and-inference
audience_notes: "Intended for ML engineers, MLOps practitioners, and DevOps engineers building ML infrastructure."---

# Designing an ML Pipeline

## Artifact Summary

Provides practice applying the concepts of Designing an ML Pipeline — guides the learner through reasoning steps that reinforce understanding of ML Pipelines and Orchestration through active problem-solving.

## Required Contract Fields

### objective

Design an ML pipeline for a given production context, selecting appropriate orchestration, failure handling, and CI/CD integration.

### learner task

Choose one of the following three contexts and design a complete ML pipeline. For your chosen context, define: (1) the pipeline stages in order, (2) which orchestration framework you would use and why, (3) your failure handling strategy for each stage, and (4) how CI/CD would integrate.

**Context A — Real-time fraud detection with hourly retraining.** Transactions arrive via Kafka. A model scores each transaction in under 100ms. Retraining runs every hour on the last 24 hours of labeled data. Freshness is critical; stale models cost money.

**Context B — Weekly content recommendation retraining.** User interaction logs are processed weekly to retrain a collaborative filtering model. The pipeline must join user events with content metadata, train a matrix factorization model, evaluate recall@k, and deploy if metrics do not regress by more than 2%.

**Context C — On-demand fine-tuning pipeline.** Researchers submit fine-tuning jobs for a base LLM. Each job specifies a dataset, hyperparameters, and a base model version. Jobs must be queued, run on GPU nodes, evaluated against a held-out set, and deployed to a staging endpoint for review.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Production ML requires reliable, automated pipelines — understanding orchestration, scheduling, and dependency management is essential for building systems that operate at scale without manual intervention.

## Dependency Notes

This artifact is part of the ML Pipelines and Orchestration content pack.

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
