---
artifact_id: "artifact-tool-calling-comparison-table"
artifact_title: "Tool Execution Responsibilities"
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
authoritative_source: "Foundational Tool Calling and External Actions literature and scientific agentic computing papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - tool calling
  - function calling
  - api execution
  - arguments extraction
  - schema validation
tags:
  - learning-artifact
  - agents
  - tools
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

# Tool Execution Responsibilities

## Artifact Summary

This artifact belongs to the Tool Calling and External Actions topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Contrast model choices vs code runner executions.

### explanation

| Step in Tool Loop | Model Responsibility | Application Responsibility | Data Format Used |
|---|---|---|---|
| Tool Decision & Arguments | Selects tool and extracts parameters | None | Structured JSON |
| Execution & Feedback | None | Runs function, returns output | Plain text or JSON observation |
| Final Synthesis | Reads observation, outputs answer | None | Natural language text |

## Optional Enrichment Fields

### motivation

Understanding AI Agents and Tool Use is critical for building autonomous software assistants, function callers, memory-backed bots, and self-correcting coders.

## Dependency Notes

This artifact is part of the Tool Calling and External Actions content pack.

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
