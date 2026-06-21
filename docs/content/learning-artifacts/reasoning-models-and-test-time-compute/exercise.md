---
artifact_id: "artifact-reasoning-models-and-test-time-compute-exercise"
artifact_title: "Designing a Reasoning Strategy"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Reviewed"
instructional_objectives:
  - Exercise
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "15-20 minutes"
supported_learning_levels:
  - Intermediate
reuse_mode: ""
source_artifact: ""
dependencies:
  prerequisite:
  recommended_before:
  recommended_after:
  complementary:
  alternative:
authoritative_source: "Foundational literature on chain-of-thought reasoning and test-time compute."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - reasoning strategy
  - test-time compute
  - verification
  - chain-of-thought
  - tree-of-thoughts
  - MCTS
  - compute budget
tags:
  - learning-artifact
  - reasoning
  - exercise
prerequisite_notes: "Completion of the explanatory text for Reasoning Models and Test-Time Compute."
related_topics:
  - reasoning-models-and-test-time-compute
  - planning-task-decomposition
  - reflection-self-correction
  - agent-evaluation
audience_notes: "Intended for AI researchers and engineers interested in advanced reasoning techniques."
---

# Designing a Reasoning Strategy

## Artifact Summary

Provides practice applying the concepts of Designing a Reasoning Strategy — guides the learner through reasoning steps that reinforce understanding of Reasoning Models and Test-Time Compute through active problem-solving.

## Required Contract Fields

### objective

Design a reasoning strategy for three distinct problem-solving contexts, selecting the appropriate reasoning approach, allocating test-time compute, and defining a verification strategy.

### learner task

For each of the three contexts described below, provide:

1. **Reasoning approach** — Which technique(s) would you use: linear CoT, self-consistency, tree-of-thoughts, MCTS-based search, or a deliberation architecture? Justify your choice.
2. **Test-time compute allocation** — How much compute would you allocate (low / medium / high), and how would you make it dynamic (e.g., adaptive to problem difficulty)?
3. **Verification strategy** — How would you verify correctness? Would you use an outcome reward model, a process reward model, a verifier module, or some combination?

#### Context A: Math Problem Solving (Guaranteed Correctness)

You are building a system that solves competition-level math problems (e.g., from the International Mathematical Olympiad). The system must produce provably correct answers. There is no strict time limit; the user is willing to wait minutes if necessary. Incorrect answers are unacceptable.

#### Context B: Creative Synthesis (Multiple Valid Answers)

You are building a system that generates product design concepts for a new consumer device. There are many valid solutions. The goal is to produce diverse, innovative, and internally coherent proposals. Latency is moderate: the user expects results within a few seconds per request.

#### Context C: Time-Sensitive Question Answering (Low Latency)

You are building a customer support chatbot that must answer factual questions about a product catalog. Answers must be accurate, but the primary constraint is latency: the user expects a response within 500 milliseconds. The questions are typically straightforward (e.g., "What is the return policy?" or "Does this model support Bluetooth?").

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

Understanding how reasoning can be improved through structured inference-time computation is critical for building AI systems that can solve complex problems reliably, allocate compute efficiently, and generalize beyond their training distributions.

## Dependency Notes

This artifact is part of the Reasoning Models and Test-Time Compute content pack.

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
