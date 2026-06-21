---
artifact_id: "artifact-automatic-evaluation-metrics-exercise"
artifact_title: "Selecting the Right Metric"
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
authoritative_source: "Academic NLP evaluation literature and established benchmarking frameworks."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - BLEU
  - ROUGE
  - METEOR
  - BERTScore
  - n-gram overlap
tags:
  - learning-artifact
  - llm-evaluation
  - nlp-metrics
prerequisite_notes: "Basic familiarity with NLP tasks and LLM outputs."
related_topics:
  - human-evaluation
  - task-specific-benchmarking
  - hallucination-evaluation
audience_notes: "Intended for ML engineers, NLP practitioners, and AI evaluators."
---

# Selecting the Right Metric

## Artifact Summary

Provides practice applying the concepts of Selecting the Right Metric — guides the learner through reasoning steps that reinforce understanding of Automatic Evaluation Metrics through active problem-solving.

## Required Contract Fields

### objective

Apply knowledge of automatic evaluation metrics to choose the most appropriate metric for different evaluation scenarios.

### learner task

For each scenario below, select the most appropriate metric (BLEU, ROUGE, METEOR, or BERTScore) and explain your reasoning.

**Scenario A: Machine Translation Quality Assessment**
Your team has built a new English-to-Japanese translation model. You need to evaluate how closely its outputs match professional human translations. The output must preserve both the meaning and the phrasing of the source.

**Scenario B: News Article Summarization**
Your model generates one-paragraph summaries of long news articles. The summaries must cover all key information from the original article, but phrasing flexibility is acceptable.

**Scenario C: Open-Domain Question Answering**
Your QA model answers factual questions. The reference answer and the model's answer may use completely different wording while conveying the same fact. You need a metric that captures semantic equivalence.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Practicing metric selection grounds the theoretical understanding of each metric in practical decision-making.

## Dependency Notes

This artifact is part of the Automatic Evaluation Metrics content pack.

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
