---
artifact_id: "artifact-planning-task-decomposition-exercise"
artifact_title: "ReAct Thought-Action-Observation Loop"
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
authoritative_source: "Foundational Planning and Task Decomposition literature and scientific agentic computing papers."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - planning
  - task decomposition
  - react prompting
  - chain-of-thought
  - sub-goal generation
tags:
  - learning-artifact
  - agents
  - planning
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

# ReAct Thought-Action-Observation Loop

## Artifact Summary

This artifact belongs to the Planning and Task Decomposition topic and serves as a Exercise.

## Required Contract Fields

### objective

Draft a manual ReAct trace resolving a two-step goal.

### learner task

Given the task 'analyze the quarterly report PDF and upload a summary to the database', write a step-by-step ReAct loop (Thought, Action, Observation) that an agent would execute.

### expected learner output

Thought: I need to read the quarterly report PDF. Action: read_pdf(file='quarterly_report.pdf'). Observation: 'Summary of profit: $1M, costs: $800k.' Thought: Now I have the summary data. I must upload this to the database. Action: upload_db(profit=1000000, costs=800000). Observation: 'Upload successful.' Thought: The task is fully complete. Final Response: I have successfully analyzed the PDF and uploaded the summary data.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding AI Agents and Tool Use is critical for building autonomous software assistants, function callers, memory-backed bots, and self-correcting coders.

## Dependency Notes

This artifact is part of the Planning and Task Decomposition content pack.

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
