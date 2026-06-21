---
artifact_id: "artifact-data-drift-and-concept-drift-comparison-table"
artifact_title: "Drift Types and Detection Methods"
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

# Drift Types and Detection Methods

## Artifact Summary

This artifact belongs to the Data Drift and Concept Drift topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast data drift and concept drift subtypes, and compare detection methods across six operational dimensions.

### explanation

**Drift Types Comparison:**

| Dimension | Data Drift (Covariate Shift) | Data Drift (Prior Probability Shift) | Concept Drift (Sudden) | Concept Drift (Gradual) | Concept Drift (Incremental) | Concept Drift (Recurring) |
|---|---|---|---|---|---|---|
| What changes | P(X) — input features | P(Y) — target prevalence | P(Y\|X) instantaneously | P(Y\|X) slowly transitions | P(Y\|X) via small steps | P(Y\|X) repeats periodically |
| P(Y\|X) stability | Stable | Stable | Changes abruptly | Changes over window | Changes incrementally | Changes, then reverts |
| Example | Holiday spending patterns | Fraud rate spike during breach | New regulation redefines fraud | Seasonal fashion trend | Product UI updates shift sentiment | Holiday behavior each December |
| Detection difficulty | Moderate | Low | Low (easy to catch) | Moderate | High (hard to distinguish from noise) | Moderate (requires history) |
| Retraining need | Retrain on new data | Resample or reweight | Replace model or rebuild | Gradual adaptation | Continuous learning | Maintain seasonal model versions |

**Detection Methods Comparison:**

| Dimension | Population Stability Index (PSI) | Kolmogorov-Smirnov (KS) Test | Maximum Mean Discrepancy (MMD) | Chi-Square Test | Statistical Process Control (SPC) |
|---|---|---|---|---|---|
| What it detects | Distribution shift in binned scores or features | Distribution shift in continuous features | Distribution shift in high-dimensional spaces | Distribution shift in categorical features | Metric degradation over time |
| Statistical basis | Divergence measure (based on KL divergence) | Empirical CDF distance in supremum norm | RKHS embedding distance | Chi-squared statistic for contingency tables | Control limits from historical mean and variance |
| Sensitivity | Moderate (depends on binning) | Moderate (focuses on max gap, not tails) | High (captures any distribution change) | Low-moderate (needs category counts) | Moderate (detects sustained shifts) |
| Sample size needs | Large (thousands) | Moderate (hundreds) | Moderate-high (depends on dimensionality) | Large (per category) | Moderate (for stable control limits) |
| Implementation complexity | Low (binned computation) | Low (sort and compute) | High (kernel selection, hyperparameters) | Low (contingency table) | Low (mean, std, control limits) |
| Interpretability | High (industry standard in finance) | High (visual CDF comparison) | Low (abstract distance metric) | High (per-category breakdown) | High (visual control chart) |

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
