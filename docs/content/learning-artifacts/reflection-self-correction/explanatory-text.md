---
artifact_id: "artifact-reflection-self-correction-explanatory-text"
artifact_title: "Self-Correction Critique Loops and Compiler Error Parsing"
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

# Self-Correction Critique Loops and Compiler Error Parsing

## Artifact Summary

This artifact belongs to the Reflection and Self-Correction topic and serves as a Explanatory Text.

## Required Contract Fields

### objective

Explain critique-generator architectures, self-verifiers, tool exception recoveries, and output refinement paths.

### explanation

Even advanced LLMs make mistakes, hallucinate facts, or generate buggy code. Reflection (or self-correction) is an agentic pattern where the model critiques its own output before finalizing it. In a critique loop, a generation model outputs a draft response, a critique step evaluates the draft against constraints or compiler outputs, and a correction step updates the draft to fix identified issues. This self-correction cycle allows the agent to recover from runtime tool errors, syntax bugs, or logical inconsistencies without human intervention.

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
