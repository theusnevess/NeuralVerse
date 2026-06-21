---
artifact_id: "artifact-agent-memory-comparison-table"
artifact_title: "Short-Term vs. Long-Term Memory Systems"
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

# Short-Term vs. Long-Term Memory Systems

## Artifact Summary

Compares key approaches, algorithms, or architectures within Memory Systems for Agents — organizes Short-Term vs. Long-Term Memory Systems into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast locations, query routines, and billing weights.

### explanation

| Memory Type | Storage Media | Access Method | Token Cost Impact |
|---|---|---|---|
| Memory Type | Storage Media | Access Method | Token Cost Impact |
| Short-Term | Context Window (RAM) | Direct model attention | High (every token in window is billed) |
| Long-Term | Vector DB / Disk | Semantic search retrieval | Low (only retrieved facts are appended) |

## Optional Enrichment Fields

### motivation

Agentic systems extend language models beyond passive generation — these concepts enable autonomous reasoning, tool use, and multi-step execution.

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
