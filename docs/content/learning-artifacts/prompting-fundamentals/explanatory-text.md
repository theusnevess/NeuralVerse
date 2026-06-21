---
artifact_id: "artifact-prompting-fundamentals-explanatory-text"
artifact_title: "Formatting Inputs and Context Windows"
artifact_family: "Instruction Artifacts"
artifact_type: "Explanatory Text"
canonical_status: "Draft"
instructional_objectives:
  - Explanatory
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

# Formatting Inputs and Context Windows

## Artifact Summary

Covers Formatting Inputs and Context Windows within the broader topic of Prompting Fundamentals — explains the core ideas, their role in AI systems, and what makes them important for practitioners to understand.

## Required Contract Fields

### objective

Explain zero-shot/few-shot prompts, task guidance patterns, and chain-of-thought reasoning.

### explanation

Since LLMs are trained to complete text, we control their behavior by formatting input text—a process called prompting. Prompts shape the context window to guide the model's next-token predictions toward a desired output. Zero-shot prompting provides an instruction without examples. Few-shot prompting includes input-output examples to demonstrate the target format and style. Chain-of-Thought (CoT) prompting instructs the model to generate intermediate reasoning steps ('let's think step by step') before outputting the final answer, which improves performance on complex reasoning, math, and logic tasks.

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
