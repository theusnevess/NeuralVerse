---
artifact_id: "artifact-data-drift-and-concept-drift-exercise"
artifact_title: "Diagnosing Drift in Production"
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

This artifact belongs to the Data Drift and Concept Drift topic and serves as a Exercise.

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

**Context A — Fraud Detection:**
1. **Drift Type:** Data drift — covariate shift. The transaction amount distribution P(X) has shifted, but P(Y|X) (fraud given transaction amount) and P(Y) (overall fraud rate) remain unchanged.
2. **Detection Method:** PSI or KS test on the transaction amount feature. Both can compare the reference distribution (pre-drift) to the current distribution. KS is simpler and interpretable for a continuous feature like transaction amount.
3. **Retraining Trigger:** Drift-based trigger on the transaction amount feature. Once PSI or KS flags drift, retrain the model on recent data that includes the new transaction amount distribution. Additionally, a performance-based fallback (AUC < 0.90) as backup.

**Context B — Recommendation System:**
1. **Drift Type:** Concept drift — gradual drift. The relationship P(Y|X) between user features and click behavior is slowly changing as short-form video emerges. The same user demographics (X) produce different click patterns (Y) than before.
2. **Detection Method:** MMD on the joint distribution of (user features, click labels) or SPC on the click-through rate metric. MMD can detect subtle shifts in high-dimensional embedding spaces. SPC provides a clear control chart with actionable upper/lower limits.
3. **Retraining Trigger:** Performance-based trigger (CTR drop below threshold) combined with drift-based trigger on the embedding space. Since drift is gradual, periodic retraining (time-based, e.g., bi-weekly) complements the reactive triggers.

**Context C — NLP Sentiment Model:**
1. **Drift Type:** Concept drift — sudden drift (or more precisely, domain shift). The new product category introduces a new data distribution that the model was never trained on. P(Y|X) effectively changes for this subset of data because the linguistic features that signal sentiment in electronics reviews do not map identically to home appliance reviews.
2. **Detection Method:** PSI on the feature embedding distributions (e.g., sentence embeddings from the model's penultimate layer) comparing electronics vs. appliance reviews. A chi-square test on categorical feature frequencies can also flag the vocabulary shift.
3. **Retraining Trigger:** Drift-based trigger that alerts when the proportion of appliance reviews exceeds a threshold, combined with a scheduled retraining cycle that includes the new domain data. If appliance reviews become a permanent category, incorporate domain adaptation (fine-tuning on the new domain) triggered by the drift alert.

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
