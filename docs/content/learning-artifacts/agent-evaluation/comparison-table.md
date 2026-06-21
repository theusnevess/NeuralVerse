---
artifact_id: "artifact-agent-evaluation-comparison-table"
artifact_title: "Agent Evaluation Dimensions"
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

# Agent Evaluation Dimensions

## Artifact Summary

This artifact belongs to the Agent Evaluation Methodologies topic and serves as a Comparison Table.

## Required Contract Fields

### objective

Compare five agent evaluation dimensions across what they measure, evaluation methods, common metrics, and key challenges.

### comparison subjects

Planning Quality, Tool Use Accuracy, Context Retrieval, Multi-Step Execution, Robustness

### comparison criteria

What it measures, Evaluation method, Common metrics, Key challenge

### comparative takeaways

| Dimension | What it measures | Evaluation method | Common metrics | Key challenge |
|---|---|---|---|---|
| Planning Quality | Correctness, completeness, and efficiency of action sequences | Compare agent action plan to ground-truth optimal plan | Plan accuracy, plan completeness, steps-to-optimal ratio | Defining the optimal plan for open-ended tasks |
| Tool Use Accuracy | Correct tool selection and parameter formatting | Validate tool call signatures and parameter values against expected schema | Tool selection accuracy, parameter error rate, API call success rate | Handling tools with complex or nested parameters |
| Context Retrieval | Whether the agent gathers necessary information before acting | Check that required context is present in agent history at decision points | Context recall, information sufficiency rate | Defining what context is necessary for each decision |
| Multi-Step Execution | Reliability of completing long-horizon tasks | Measure task completion rate across repeated runs with varied conditions | Task completion rate, average steps to completion, error recovery rate | Accumulating errors across long chains of actions |
| Robustness | Performance under adversarial, ambiguous, or edge-case inputs | Inject perturbations (typos, missing info, contradictory instructions) and measure degradation | Success rate under perturbation, performance drop vs. baseline | Defining realistic and diverse stress scenarios |

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
