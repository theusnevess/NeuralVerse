---
title: "Kernel Observatory: Interactive Convolution Laboratory"
id: artifact-convolution-computer-vision-interactive-visualization
family: Instruction Artifacts
type: Interactive Visualization
canonicalStatus: experimental_test
instructionalObjectives: ["Manipulate kernel parameters and observe output changes", "Inspect pixel-level calculations", "Compare kernels on the same input"]
estimatedDuration: "15-20 minutes"
---

# Kernel Observatory

## Objective

Observe convolution directly by manipulating kernels, inputs, and parameters in a deterministic environment.

## How to use

1. **Select an image preset** — geometric shapes, edges, checkerboard, gradient, or noisy image
2. **Choose a kernel** — identity, blur, sharpen, Sobel, Laplacian, or custom
3. **Adjust parameters** — stride, padding, normalization
4. **Run or step** — observe the output update
5. **Inspect** — click any output cell to see the exact products, sum, and provenance

## Experiments to try

### Experiment 1: Detect a vertical edge
- Image: vertical step edge
- Kernel: Sobel X
- Expected: strong response at the edge location
- Question: What happens if you switch to Sobel Y?

### Experiment 2: Smooth Gaussian noise
- Image: noisy synthetic image
- Kernel: Gaussian blur
- Expected: response energy decreases, noise smooths
- Question: Does box blur produce the same result?

### Experiment 3: Measure stride information loss
- Image: diagonal edge
- Kernel: Sobel X
- Compare stride 1 vs stride 2
- Question: How many output pixels are lost?

### Experiment 4: Compare padding strategies
- Image: vertical edge
- Kernel: identity
- Compare valid vs same-zero padding
- Question: How do border values change?

### Experiment 5: Correlation vs convolution
- Image: asymmetric pattern
- Kernel: non-symmetric custom kernel
- Toggle correlation/convolution mode
- Question: When do they produce different outputs?

## What you will learn

- How each parameter affects output geometry
- Why classical filters respond differently to different edge orientations
- How to predict output behavior before running
- The difference between observation and interpretation
