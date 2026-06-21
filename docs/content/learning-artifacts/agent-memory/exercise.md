---
artifact_id: "artifact-agent-memory-exercise"
artifact_title: "Short-Term vs. Long-Term Constraints"
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
authoritative_source: "Foundational Memory Systems for Agents literature and scientific agentic computing papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - agent memory
  - short-term memory
  - long-term memory
  - vector stores
  - conversation state
tags:
  - learning-artifact
  - agents
  - memory
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

# Short-Term vs. Long-Term Constraints

## Artifact Summary

This artifact belongs to the Memory Systems for Agents topic and serves as a Exercise.

## Required Contract Fields

### objective

Evaluate memory bounds across token overheads and storage media.

### learner task

Contrast short-term memory and long-term memory in agents across storage media, access latencies, and token costs.

### expected learner output

Short-term memory lives in the GPU/RAM context window, has zero search latency, but scales prompt token cost linearly. Long-term memory lives in an external database, has search/retrieval latency, but reduces token costs by only loading semantic slices relevant to the current turn.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding AI Agents and Tool Use is critical for building autonomous software assistants, function callers, memory-backed bots, and self-correcting coders.

## Dependency Notes

This artifact is part of the Memory Systems for Agents content pack.

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
