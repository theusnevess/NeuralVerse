---
artifact_id: "artifact-reflection-self-correction-comparison-table"
artifact_title: "Self-Correction Workflow Phases"
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

# Self-Correction Workflow Phases

## Artifact Summary

This artifact belongs to the Reflection and Self-Correction topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast generator, critic, and refiner stages.

### explanation

| Workflow Step | Input Target | Output Target | Primary Evaluation Mechanism |
|---|---|---|---|
| Draft Generation | Initial user prompt | Raw initial response | Next-token probability |
| Critique / Reflection | Raw response + Constraints | List of flaws/errors | Constraint verification / compiler execution |
| Corrected Synthesis | Raw response + Critique list | Refined, final response | Target optimization |

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
