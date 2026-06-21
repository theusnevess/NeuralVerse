---
artifact_id: "artifact-tool-calling-exercise"
artifact_title: "Designing a Weather Tool Schema"
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

# Designing a Weather Tool Schema

## Artifact Summary

This artifact belongs to the Tool Calling and External Actions topic and serves as a Exercise.

## Required Contract Fields

### objective

Write function definition specs and matching model parameters.

### learner task

A model is given a tool definition `get_weather(location: str, unit: str)`. Write the JSON schema that defines this tool, and write the model's target JSON output when asked 'What is the temperature in Paris in Celsius?'

### expected learner output

Schema:
{
  'name': 'get_weather',
  'parameters': {
    'type': 'object',
    'properties': {
      'location': {'type': 'string'},
      'unit': {'type': 'string', 'enum': ['Celsius', 'Fahrenheit']}
    },
    'required': ['location', 'unit']
  }
}
Model Output:
{
  'name': 'get_weather',
  'arguments': {'location': 'Paris', 'unit': 'Celsius'}
}

This practice does not assign a score and does not certify mastery.

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
