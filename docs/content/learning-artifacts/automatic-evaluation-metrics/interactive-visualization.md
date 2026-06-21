---
artifact_id: "artifact-automatic-evaluation-metrics-interactive-visualization"
artifact_title: "Metric Score Comparison Spec"
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

# Metric Score Comparison Spec

## Artifact Summary

Specifies an interactive tool for exploring Metric Score Comparison Spec — describes the controls, visual feedback, and conceptual relationships a learner would manipulate to understand Automatic Evaluation Metrics.

## Required Contract Fields

### objective

Specify an interactive tool that shows how BLEU, ROUGE, METEOR, and BERTScore respond to changes in n-gram overlap, synonym use, and word order.

### explanation

This specification describes a side-by-side comparison tool. A reference text is displayed on the left and a candidate text on the right. Below them, three sliders control text properties:

1. **n-gram overlap slider** — adjusts the proportion of exact n-gram matches between candidate and reference.
2. **synonym substitution slider** — replaces words with synonyms in the candidate (e.g., "car" to "automobile") to test METEOR and BERTScore sensitivity.
3. **word order slider** — progressively shuffles word order in the candidate to observe the fragmentation penalty in METEOR and the order sensitivity of BLEU.

As each slider is adjusted, live score bars for BLEU, ROUGE-1, ROUGE-L, METEOR, and BERTScore update in real time. Color coding indicates high (green), medium (yellow), and low (red) score ranges. A tooltip on each score bar explains what contributed to the change.

### manipulable variable or observable state

The three sliders (n-gram overlap, synonym substitution, word order) are the manipulable variables. The observable state is the set of five live-updating metric score bars and the highlighted matching tokens in the text panels.

### interpretation guidance

Users should observe that BLEU drops sharply with word order changes and synonym substitution, while ROUGE remains high as long as content words are present. METEOR handles synonyms well but penalizes scrambled order. BERTScore stays relatively stable across synonym changes and moderate reordering, reflecting its semantic focus. This demonstrates why metric would selection depends on the evaluation goal.

## Optional Enrichment Fields

### motivation

Seeing metrics respond dynamically to text changes builds an intuitive understanding of their behavior and limitations.

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
