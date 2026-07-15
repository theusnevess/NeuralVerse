---
title: "Classical vs Learned Filters: A Comparison"
id: artifact-convolution-computer-vision-comparison-table
family: Reference Artifacts
type: Comparison Table
canonicalStatus: experimental_test
instructionalObjectives: ["Contrast fixed and learned convolution filters", "Identify when each approach is appropriate"]
estimatedDuration: "3-4 minutes"
---

# Classical vs Learned Filters

| Aspect | Classical Fixed Filter | Learned CNN Filter |
|--------|----------------------|-------------------|
| **Coefficients** | Hand-designed, fixed | Optimized by gradient descent |
| **Objective** | Encode a known property (edge, smooth) | Minimize a task-specific loss |
| **Interpretability** | Directly interpretable kernel | Often not human-interpretable |
| **Adaptability** | Same kernel for all inputs | Adapts to training data distribution |
| **Typical use** | Preprocessing, baselines, edge detection | Feature extraction in deep networks |
| **Number of filters** | Usually one or few per task | Many (64, 128, 256...) per layer |
| **Training required** | No | Yes, with labeled data |
| **Receptive field** | Single layer (kernel size) | Grows through stacked layers |
| **Equivariance** | Exact (ideal interior) | Approximate (stride, padding break it) |
| **When to use** | Known structure, low data, fast deployment | Complex patterns, large data, task-specific |

## Key insight

The local operation is identical: slide, multiply, sum. The difference is **who chooses the coefficients** and **what objective guides that choice**. Classical filters encode human knowledge; learned filters encode data-driven statistics.

## Bridge

Many successful CNN first-layer filters resemble classical filters (edge detectors, color blob detectors). The network discovers that these patterns are useful — the same patterns engineers designed decades ago.
