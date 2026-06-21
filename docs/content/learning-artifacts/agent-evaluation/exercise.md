---
artifact_id: "artifact-agent-evaluation-exercise"
artifact_title: "Evaluating an Agent Workflow"
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
authoritative_source: "Foundational LLM agent evaluation literature and benchmarking methodologies."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - agent evaluation
  - planning quality
  - tool use accuracy
  - multi-step execution
  - robustness
  - task completion
tags:
  - learning-artifact
  - llm-evaluation
  - agents
prerequisite_notes: "Basic understanding of LLM agents and tool calling."
related_topics:
  - hallucination-evaluation
  - rag-evaluation
  - automatic-evaluation-metrics
audience_notes: "Intended for AI engineers and evaluation practitioners."
---

# Evaluating an Agent Workflow

## Artifact Summary

Provides practice applying the concepts of Evaluating an Agent Workflow — guides the learner through reasoning steps that reinforce understanding of Agent Evaluation Methodologies through active problem-solving.

## Required Contract Fields

### objective

Assess three agent execution traces for a multi-step task on planning quality, tool use accuracy, completion rate, and robustness.

### learner task

Below are three execution traces for an agent tasked with booking a round-trip flight: search for available flights departing on date X and returning on date Y, filter by price under $400, and confirm the booking.

**Trace A:**
1. `search_flights(departure="2026-08-15", return="2026-08-22")` → returns 12 results
2. `filter_by_price(max_price=400)` → returns 3 results
3. `book_flight(flight_id="UA123", seat="economy")` → confirms booking
4. Task completes successfully. Steps: 3. Optimal steps: 3.

**Trace B:**
1. `search_flights(departure="2026-08-15", return="2026-08-22")` → returns 12 results
2. `book_flight(flight_id="UA123")` → error: missing price filter
3. `search_flights(departure="2026-08-15", return="2026-08-22")` → returns 12 results
4. `filter_by_price(max_price=400)` → returns 3 results
5. `book_flight(flight_id="UA123", seat="economy")` → confirms booking
6. Task completes but took extra steps. Steps: 5. Optimal steps: 3.

**Trace C:**
1. `search_hotels(location="New York")` → returns hotel results (wrong tool)
2. `search_flights(departure="2026-08-15", return="2026-08-22")` → returns 12 results
3. `filter_by_price(max_price=400)` → returns 3 results
4. `book_flight(flight_id="UA123", seat="economy")` → confirms booking
5. Task completes but initial tool call was incorrect. Steps: 4. Optimal steps: 3.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding Agent Evaluation Methodologies is critical for building reliable production agents, debugging agent failures, and comparing agent architectures.

## Dependency Notes

This artifact is part of the LLM Evaluation & Benchmarking content pack.

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
