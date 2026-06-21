---
artifact_id: "artifact-mixture-of-experts-architectures-exercise"
artifact_title: "Designing an MoE Configuration"
artifact_family: "Practice Artifacts"
artifact_type: "Exercise"
canonical_status: "Draft"
instructional_objectives:
  - Exercise
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "15-20 minutes"
supported_learning_levels:
  - Intermediate
  - Advanced
reuse_mode: ""
source_artifact: ""
dependencies:
  prerequisite:
  recommended_before:
  recommended_after:
  complementary:
  alternative:
authoritative_source: "Foundational Mixture of Experts literature — including Switch Transformer, Expert Choice routing, Soft MoE, and sparsely-gated MoE research."
review_cycle: "Initial editorial review required"
localization_ready: false
accessibility_notes: "Use clear text and logical structure."
keywords:
  - mixture of experts
  - configuration design
  - routing strategy
  - capacity factor
  - expert count
  - trade-off analysis
tags:
  - learning-artifact
  - moe
  - exercise
  - configuration
prerequisite_notes: "Familiarity with MoE fundamentals including routing, load balancing, and expert capacity."
related_topics:
  - mixture-of-experts-architectures
audience_notes: "Intended for AI engineers and researchers exploring efficient scaling and sparse computation."---

# Designing an MoE Configuration

## Artifact Summary

Provides practice applying the concepts of Designing an MoE Configuration — guides the learner through reasoning steps that reinforce understanding of Mixture of Experts (MoE) Architectures through active problem-solving.

## Required Contract Fields

### objective

Practice reasoning about MoE configuration trade-offs across quality, efficiency, and memory constraints.

### learner task

For each of the three deployment contexts below, propose a complete MoE configuration and justify each design decision. Reference the principles from the MoE explanatory text to support your reasoning.

#### Context A — Maximizing Quality Under Fixed Inference Budget

**Scenario:** You are building a large language model for a research lab. The inference infrastructure has a fixed compute budget of 500 teraFLOPs per token. You may use any number of total parameters, but the per-token compute may not exceed the budget.

**Constraints:**
- Inference FLOPs budget: 500 TFLOPs/token (fixed)
- GPU memory per device: 80 GB
- Number of devices: 8 (expert-parallel across devices)
- Target: maximize downstream task quality (reasoning, coding, translation)
- No latency requirement (offline batch processing)

**Design decisions to make:**
1. Number of experts (E)
2. Top-k value
3. Capacity factor (C)
4. Routing strategy (Token Choice, Expert Choice, Soft MoE)
5. Auxiliary loss coefficient (α)
6. Whether to use noisy routing

**Justify each decision**, including:
- How your choices maximize quality within the FLOPs budget.
- How you mitigate routing collapse and expert collapse.
- How you handle expert parallelism communication overhead across 8 devices.

#### Context B — Balanced Quality/Efficiency for a Deployed System

**Scenario:** You are deploying a conversational AI assistant that must run on consumer GPU hardware with strict latency requirements.

**Constraints:**
- Inference latency: < 100ms per response (batch size 1)
- GPU memory: 24 GB (single consumer GPU)
- Total parameters: ideally > 50B for quality
- Per-token compute: minimize to achieve latency target
- Must support streaming generation (token-by-token)

**Design decisions to make:**
1. Number of experts (E)
2. Top-k value
3. Capacity factor (C)
4. Routing strategy
5. Whether to use expert caching
6. How to handle the memory overhead of loading all experts on a single 24 GB GPU

**Justify each decision**, including:
- The latency-memory trade-off for a batch size of 1.
- How capacity factor affects token dropping vs. compute overhead at low batch sizes.
- Any modifications to the standard MoE architecture for real-time streaming.

#### Context C — Extremely Memory-Constrained Deployment

**Scenario:** You need to deploy an MoE model on edge devices (e.g., mobile phone or embedded system) with severe memory constraints but flexible latency.

**Constraints:**
- Total device memory: 4 GB (shared between model and runtime)
- Model must have high knowledge capacity (> 10B effective parameters)
- Latency is flexible (offline inference, multi-second acceptable)
- No GPU — CPU inference only
- Power consumption is a secondary concern

**Design decisions to make:**
1. Number of experts (E)
2. Top-k value
3. Capacity factor (C)
4. Routing strategy
5. How to manage memory (expert swapping, quantization, pruning)
6. How CPU inference affects routing and expert computation

**Justify each decision**, including:
- The extreme sparsity needed to fit 10B+ parameters in 4 GB.
- The trade-off between expert count and per-expert size.
- How expert swapping or offloading strategies would work on CPU.
- Whether Soft MoE or hard routing is better suited for this scenario.

### expected learner output

The learner should reason through the problem step by step, showing their work for each part. The expected output illustrates the reasoning format but not the complete solution.

This practice does not assign a score and does not certify mastery.

## Optional Enrichment Fields

### motivation

MoE configuration involves navigating competing objectives. These scenarios mirror real deployment decisions faced by practitioners scaling sparse models.

## Dependency Notes

This artifact is part of the Mixture of Experts (MoE) Architectures content pack.

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
