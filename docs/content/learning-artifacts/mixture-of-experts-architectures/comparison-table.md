---
artifact_id: "artifact-mixture-of-experts-architectures-comparison-table"
artifact_title: "MoE Architecture Variants Comparison"
artifact_family: "Reference Artifacts"
artifact_type: "Comparison Table"
canonical_status: "Reviewed"
instructional_objectives:
  - Comparison
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "5-8 minutes"
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
  - dense transformer
  - switch transformer
  - expert choice routing
  - soft moe
  - architecture comparison
tags:
  - learning-artifact
  - moe
  - comparison
  - reference
prerequisite_notes: "Familiarity with MoE concepts and Transformer architecture."
related_topics:
  - mixture-of-experts-architectures
  - transformer-overview
audience_notes: "Intended for AI engineers and researchers exploring efficient scaling and sparse computation."---

# MoE Architecture Variants Comparison

## Artifact Summary

Compares key approaches, algorithms, or architectures within Mixture of Experts (MoE) Architectures — organizes MoE Architecture Variants Comparison into a structured reference for selecting between alternatives.

## Required Contract Fields

### objective

Contrast Dense Transformer, Top-k MoE (Switch-style), Expert Choice Routing, and Soft MoE across architectural and practical dimensions.

### explanation

| Property | Dense Transformer | Top-k MoE (Switch-style) | Expert Choice Routing | Soft MoE |
|---|---|---|---|---|
| **Architecture** | Single FFN per layer; all parameters active for every token | Multiple parallel FFN experts; top-k activated per token via router | Multiple parallel FFN experts; each expert selects its own tokens | Multiple experts; each processes a learned mixture of all tokens |
| **Routing Method** | None (no routing needed) | Token selects top-k experts via softmax router (k ≥ 1) | Expert selects top-k tokens via softmax over token dimension | Soft assignment: tokens are linearly combined into "slots" per expert, outputs are mixed back |
| **Parameter Count** | N (single FFN) | E × N (E experts, each of size comparable to dense FFN) | E × N (same as Top-k MoE at same expert count) | E × N + slot mixing parameters (slightly more due to slot transformations) |
| **Inference FLOPs** | O(N) per token | O(k/E × N) per token (only k experts computed) | O(k/E × N) per token + O(E × batch × d_model) for token selection | O(N) per token (less sparse; all experts process mixtures) |
| **Memory Overhead** | Low (1× parameters) | High (E× parameters must reside in memory) | High (E× parameters must reside in memory) | High (E× parameters + slot mixing weights in memory) |
| **Load Balancing Need** | None | Critical: auxiliary loss required to prevent collapse; capacity factor limits overflow | Built-in: guaranteed perfect load balance by construction | Minimal: soft mixing inherently distributes load; no discrete capacity constraints |
| **Training Stability** | Stable (standard backprop, no discrete choices) | Moderate: routing collapse, expert collapse, gradient estimation noise | Good: guaranteed balance reduces collapse risk; but token-expert permutation adds graph complexity | Best: fully differentiable; no discrete routing decisions; no gradient estimation needed |
| **Best Use Case** | Compute-unconstrained, quality-focused, or small-scale models | Large-scale models where compute budget is the bottleneck; batch processing | Scenarios requiring guaranteed expert utilization; training stability prioritized over simplicity | Research settings exploring differentiable MoE; avoiding routing collapse entirely |
| **Token Dropping Risk** | None (all tokens processed) | Present: tokens dropped when expert exceeds capacity | None (each expert selects exactly C × tokens) | None (all tokens contribute via soft mixture) |
| **Communication Overhead** | None (single device or tensor parallelism) | High: all-to-all communication for token-expert reassignment | High: all-to-all for assembling selected tokens per expert | Medium: slot mixing requires gathering/scattering across devices |
| **Routing Interpretability** | N/A | High: each token clearly assigned to specific experts | Medium: assignments are visible but less intuitive (experts choose tokens) | Low: no discrete assignments; tokens distributed across experts via linear mixing |
| **Sparsity Level** | None (dense) | High (only k/E experts active per token) | High (only k/E experts active per token) | Low (all experts process all tokens via mixed slots) |
| **Gradient Estimation** | Standard backprop | Requires gradient approximation through discrete top-k (e.g., straight-through) | Requires permutation-based gradient handling | None (fully differentiable) |
| **Batch Size Sensitivity** | Low (works at any batch size) | High (small batches cause high routing variance and wasted capacity) | Moderate (guaranteed balance helps, but token selection overhead is batch-dependent) | Low (soft mixing smooths across batch sizes) |

## Optional Enrichment Fields

### motivation

Choosing the right MoE variant depends on the specific constraints of the deployment and training environment. This table provides a structured comparison to guide architectural decisions.

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
