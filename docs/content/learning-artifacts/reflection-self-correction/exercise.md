---
artifact_id: "artifact-reflection-self-correction-exercise"
artifact_title: "Chaining Critique and Correct Prompts"
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
authoritative_source: "Foundational Reflection and Self-Correction literature and scientific agentic computing papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - reflection
  - self-correction
  - critique loop
  - error recovery
  - verification
tags:
  - learning-artifact
  - agents
  - reflection
prerequisite_notes: "Basic mathematical and LLM prompting comfort."
related_topics:
  - agentic-ai-fundamentals
  - planning-task-decomposition
  - tool-calling
  - agent-memory
  - reflection-self-correction
  - multi-agent-systems
audience_notes: "Intended for AI engineers and agent systems developers."
---

# Chaining Critique and Correct Prompts

## Artifact Summary

This artifact belongs to the Reflection and Self-Correction topic and serves as a Exercise.

## Required Contract Fields

### objective

Formulate prompts structuring review critiques.

### learner task

Write a prompt template that instructs a model to act as a critic, identifying three potential issues in a draft response, and explain how this template is chained into a correction prompt.

### expected learner output

Critique template: 'Review this draft answer: [draft]. Identify 3 flaws, typos, or inaccuracies. Format: 1. [flaw]'. The output is parsed. The correction prompt chains this: 'Original draft: [draft]. Flaws found: [critique_output]. Rewrite the draft to resolve these flaws.' This forces the model to attend to its own mistakes in the activation sequence.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding AI Agents and Tool Use is critical for building autonomous software assistants, function callers, memory-backed bots, and self-correcting coders.

## Dependency Notes

This artifact is part of the Reflection and Self-Correction content pack.

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
