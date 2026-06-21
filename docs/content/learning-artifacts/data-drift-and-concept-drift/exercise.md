---
artifact_id: "artifact-data-drift-and-concept-drift-exercise"
artifact_title: "Diagnosing Drift in Production"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Reviewed"
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
authoritative_source: "Foundational MLOps literature on data drift, concept drift, and production model monitoring."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - data drift
  - concept drift
  - covariate shift
  - population stability index
  - maximum mean discrepancy
  - KS test
  - retraining triggers
  - drift detection
tags:
  - learning-artifact
  - production-ai-systems
  - drift-detection
prerequisite_notes: "Basic familiarity with ML model lifecycle, feature engineering, and statistical hypothesis testing."
related_topics:
  - model-monitoring-observability
  - model-serving-and-inference
  - ml-pipelines-and-orchestration
audience_notes: "Intended for ML engineers, data scientists, and MLOps practitioners maintaining production ML systems."---

# Diagnosing Drift in Production

## Artifact Summary

Provides practice applying the concepts of Diagnosing Drift in Production — guides the learner through reasoning steps that reinforce understanding of Data Drift and Concept Drift through active problem-solving.

## Required Contract Fields

### objective

Identify drift type, select an appropriate detection method, and design a retraining trigger for three distinct production scenarios.

### learner task

Read each scenario below. For each scenario, answer:
1. What type of drift is occurring (data drift — covariate shift or prior probability shift — or concept drift — sudden, gradual, incremental, or recurring)?
2. Which detection method (or combination) would you use and why?
3. What retraining trigger strategy would you design?

**Context A — Fraud Detection Model Performance Drop:**
A credit card fraud detection model has been running in production for six months with AUC consistently above 0.95. Over the past week, AUC dropped to 0.82. Investigation reveals that the average transaction amount distribution has shifted upward (more high-value transactions), but the fraud-to-legitimate ratio within each transaction amount bucket has not changed. The fraud rate (overall positive class prevalence) has also held steady.

**Context B — Recommendation System New Behavior:**
A content recommendation system trained on user click data from 2022-2023 sees a gradual shift in user behavior over three months starting January 2024. Users begin clicking on a new category (short-form video) that barely existed in the training data. The click-through rate for recommended articles has dropped 12%. The users' demographic distribution has not changed.

**Context C — NLP Sentiment Model on New Products:**
An NLP sentiment analysis model trained on product reviews for electronics now must also analyze reviews for a newly launched home appliance line. The language patterns in home appliance reviews differ (shorter sentences, more functional keywords like "installation" and "warranty"). The model's sentiment prediction accuracy drops from 91% to 76% on the new product category.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding drift detection and adaptive retraining is fundamental to maintaining production ML reliability, preventing silent model decay, and building incident response workflows.

## Dependency Notes

This artifact is part of the Data Drift and Concept Drift content pack.

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
