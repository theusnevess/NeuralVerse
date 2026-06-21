---
artifact_id: "artifact-mixture-of-experts-architectures-interactive-visualization"
artifact_title: "MoE Routing Visualizer"
artifact_family: "Instruction Artifacts"
artifact_type: "Interactive Visualization"
canonical_status: "Draft"
instructional_objectives:
  - Interactive
learning_depths:
  - Level 2 — Foundations
  - Level 3 — Advanced
estimated_duration: "10-15 minutes"
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
  - routing visualizer
  - load balancing
  - expert utilization
  - capacity factor
  - top-k routing
tags:
  - learning-artifact
  - moe
  - interactive
  - visualization
prerequisite_notes: "Familiarity with MoE concepts such as top-k routing, expert capacity, and auxiliary loss."
related_topics:
  - mixture-of-experts-architectures
audience_notes: "Intended for AI engineers and researchers exploring efficient scaling and sparse computation."---

# MoE Routing Visualizer

## Artifact Summary

This artifact belongs to the Mixture of Experts (MoE) Architectures topic and serves as a Interactive Visualization.

## Required Contract Fields

### objective

Specify an interactive "MoE Routing Visualizer" tool that demonstrates token-to-expert routing, load balancing, and compute-quality trade-offs.

### explanation

#### 1. Overview

This specification describes a browser-based interactive visualization that allows learners to configure MoE parameters and observe their effects on routing behavior, expert utilization, and efficiency. The tool simulates a batch of tokens passing through an MoE layer and visualizes the routing decisions in real time.

#### 2. Configurable Parameters

The tool exposes the following controls:

| Parameter | Type | Range | Default | Description |
|---|---|---|---|---|
| Number of Experts (E) | Integer slider | 2 — 256 (log scale) | 8 | Total experts in the layer |
| Top-k | Integer slider | 1 — 8 | 2 | Experts selected per token |
| Capacity Factor (C) | Float slider | 0.5 — 4.0 (step 0.1) | 1.25 | Expert capacity multiplier |
| Auxiliary Loss Coefficient (α) | Float slider | 0.0 — 1.0 (log scale) | 0.01 | Weight of load-balancing loss |
| Batch Size | Integer slider | 16 — 1024 (log scale) | 128 | Tokens in the batch |
| Routing Strategy | Dropdown | Token Choice, Expert Choice | Token Choice | Which routing algorithm to use |
| Noise Level (σ) | Float slider | 0.0 — 1.0 | 0.1 | Standard deviation of routing noise |
| Token Distribution Bias | Dropdown | Uniform, Skewed, Adversarial | Uniform | How token types are distributed across the batch |

#### 3. Visual Panels

##### 3.1 Token-to-Expert Assignment Matrix

A heatmap grid of size E (experts) × batch size (tokens). Each cell shows the router weight (0.0 to 1.0) for that token-expert pair. Darker colors indicate higher routing probabilities. Active top-k selections are highlighted with a border.

- Hovering over a cell displays the exact routing weight.
- Clicking a token highlights all experts it was routed to.
- Clicking an expert highlights all tokens assigned to it.

##### 3.2 Expert Utilization Heatmap

A bar chart showing how many tokens each expert received. A dashed horizontal line indicates the expert capacity. Experts exceeding capacity flash red with a "dropped tokens" count. Experts below 50% utilization appear dimmed.

- Color gradient from red (overloaded) through green (balanced) to blue (underutilized).
- A summary statistic displays: max utilization, min utilization, and load balance entropy.

##### 3.3 Routing Distribution Plot

A histogram showing the distribution of expert assignment counts: how many experts receive 0 tokens, 1-5 tokens, 6-10 tokens, etc. This visualizes routing collapse — when many experts receive zero tokens, the histogram shows a spike at 0.

##### 3.4 Efficiency vs. Quality Trade-off

A scatter plot with two axes:
- **X-axis:** Total FLOPs per token (normalized to the dense equivalent).
- **Y-axis:** Estimated model quality proxy (inverse of auxiliary loss + routing entropy).

As the user adjusts parameters, a point moves on this plot. A Pareto frontier line shows the optimal configurations. Annotations explain: "Moving to top-1 reduces FLOPs by 2× but may increase load imbalance."

##### 3.5 Communication Cost Gauge

A gauge showing the estimated all-to-all communication overhead as a fraction of total inference time. This updates based on expert count and expert parallelism configuration.

#### 4. Interaction Modes

##### 4.1 Free Exploration Mode

The user adjusts any parameter and immediately sees all visualizations update. This mode is unbounded and self-directed.

##### 4.2 Guided Scenario Mode

The tool presents presets representing real-world trade-offs:

- **"Quality First":** Maximize model quality given a fixed inference budget. (E=64, k=2, C=1.5, α=0.01, Token Choice)
- **"Efficiency First":** Minimize compute per token. (E=16, k=1, C=1.0, α=0.1, Token Choice)
- **"Memory Constrained":** Fit a large model in limited memory. (E=256, k=1, C=1.0, α=0.05, Expert Choice)
- **"Stable Training":** Minimize routing collapse and gradient noise. (E=32, k=2, C=2.0, α=0.05, Noisy Top-k)

Each preset locks certain parameters and lets the user adjust others to a target specification.

#### 5. Metrics Display

A sidebar shows live metrics:

| Metric | Formula / Description |
|---|---|
| Activation Sparsity | $1 - \frac{k}{E}$ (fraction of inactive experts) |
| Expert Utilization Entropy | $H = -\sum_{i=1}^{E} p_i \log p_i$ where $p_i = \text{frac}_i$ |
| Token Drop Rate | Fraction of tokens that were dropped due to capacity overflow |
| Effective Expert Count | $\exp(H)$ — how many experts are meaningfully used |
| FLOPs per Token (relative) | $\frac{k}{1} \cdot \frac{1 + \text{padding overhead}}{1}$ normalized to dense |
| Communication Cost | Estimated fraction of total inference time spent on all-to-all |
| Auxiliary Loss | Current load-balancing loss value |

#### 6. Data Generation

The tool generates synthetic token embeddings with controlled similarity clusters to simulate realistic input distributions:

- **Uniform:** Tokens are uniformly distributed across embedding space.
- **Skewed:** 80% of tokens cluster in 20% of the embedding space, simulating natural language where certain token types dominate.
- **Adversarial:** Tokens are specifically designed to confuse the router (e.g., equidistant from all expert centroids).

The router is a small learned network (2-layer MLP) that is pre-trained on a synthetic task and re-initialized on each parameter change, with fast fine-tuning (10 gradient steps) to approximate the equilibrium behavior.

#### 7. Implementation Notes

- Frontend: Framework-agnostic; recommend React or Svelte for reactive updates.
- Backend: The router simulation runs in WebAssembly or WebGL for real-time updates at batch sizes up to 1024.
- Responsive layout: Left sidebar (controls), center (assignment matrix + distribution), right (metrics panel).
- Dark mode / light mode toggle.
- Export: Users can export the current configuration as a JSON file and share the visualization state via URL parameters.

## Dependency Notes

This artifact is part of the Mixture of Experts (MoE) Architectures content pack.

## Reuse Notes

No reuse mode is asserted. The artifact can participate independently in different instructional contexts.

## Accessibility Notes

All visualizations include text descriptions read by screen readers. Color is not the sole indicator of state (patterns and labels are also used). Keyboard navigation is supported for all controls.

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
