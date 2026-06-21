---
artifact_id: "artifact-prompting-fundamentals-comparison-table"
artifact_title: "Prompting Methods Compared"
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
authoritative_source: "Foundational Prompting Fundamentals literature and scientific LLM papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - prompting
  - instruction tuning
  - few-shot prompting
  - zero-shot prompting
  - chain-of-thought
tags:
  - learning-artifact
  - llm
  - prompting
prerequisite_notes: "Basic mathematical and Transformer architecture comfort."
related_topics:
  - llm-overview
  - autoregressive-generation
  - prompting-fundamentals
  - context-windows-long
  - in-context-learning
  - hallucinations-reliability
audience_notes: "Intended for AI engineers and language model developers."---

# Prompting Methods Compared

## Artifact Summary

Compares key approaches, algorithms, or architectures within Prompting Fundamentals — organizes Prompting Methods Compared into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast context token count, primary pros, and main drawbacks.

### explanation

| Prompting Method | Context Complexity | Primary Benefit | Main Cost |
|---|---|---|---|
| Zero-Shot | Low (instruction only) | Compact, saves input tokens | High variance in output format |
| Few-Shot | Medium (instruction + examples) | Controls output format and style | Consumes context window tokens |
| Chain-of-Thought | High (adds reasoning triggers) | Unlocks complex multi-step reasoning | Increases output latency and cost |

## Optional Enrichment Fields

### motivation

Modern language models rely on these mechanisms for generation, reasoning, and alignment — understanding them is essential for building reliable LLM applications.

## Dependency Notes

This artifact is part of the Prompting Fundamentals content pack.

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
