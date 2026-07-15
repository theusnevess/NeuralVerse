---
title: "Convolution in Computer Vision: From Classical Kernels to Learned CNN Filters"
id: artifact-convolution-computer-vision-explanatory-text
family: Instruction Artifacts
type: Explanatory Text
canonicalStatus: experimental_test
instructionalObjectives: ["Explain 2D discrete convolution and cross-correlation", "Describe how kernels transform local image regions", "Relate classical filters to CNN learned filters"]
estimatedDuration: "12-15 minutes"
---

# Convolution in Computer Vision

## Why local operations matter

A camera captures millions of pixels, but meaningful image structure — edges, textures, shapes — lives in **local neighborhoods**. A single pixel alone carries little information. Its relationship with nearby pixels defines whether it belongs to an edge, a flat region, or a textured surface.

## What is convolution?

Convolution is a **local weighted aggregation**. A small numerical matrix called a **kernel** (or filter) slides over the image. At each position, the kernel overlaps a local patch of the image. The operation:

1. Multiply each kernel value by the corresponding image pixel
2. Sum all the products
3. Place the result at the output location corresponding to the kernel center

### Mathematical definition

For a 2D input image X and kernel K:

**Cross-correlation** (what libraries usually implement):

```
(Y ⋆ X)[i,j] = Σ_u Σ_v X[i+u, j+v] · K[u,v]
```

**Convolution** (mathematically, with kernel reversal):

```
(Y ∗ X)[i,j] = Σ_u Σ_v X[i−u, j−v] · K[u,v]
```

The difference: convolution flips the kernel 180° before the sliding dot product. For symmetric kernels (like Gaussian), both operations produce the same result.

### Output size formula

For input size H × W, kernel size kh × kw, padding p, stride s, dilation d:

```
H_out = floor((H + 2p − d(kh − 1) − 1) / s) + 1
```

## Parameters that shape the output

| Parameter | What it does | Effect on output |
|-----------|-------------|-----------------|
| **Kernel size** | How large a neighborhood each output pixel sees | Larger → more context, higher cost |
| **Stride** | Steps between kernel positions | s>1 → smaller output, faster, less detail |
| **Padding** | Values added around borders | Changes border behavior and output size |
| **Dilation** | Gaps between kernel taps | Expands receptive field without more weights |

## Classical fixed filters

| Filter | Kernel | Purpose |
|--------|--------|---------|
| Box blur | (1/9) × ones(3,3) | Uniform smoothing |
| Gaussian blur | Weighted 3x3 | Center-weighted smoothing |
| Sobel X | [-1,0,1; -2,0,2; -1,0,1] | Vertical edge detection |
| Sobel Y | [-1,-2,-1; 0,0,0; 1,2,1] | Horizontal edge detection |
| Laplacian | [0,1,0; 1,-4,1; 0,1,0] | Rapid intensity change |

## From fixed to learned filters

A **classical filter** encodes a hand-chosen property (edges, smoothing). A **learned filter** starts as random parameters and is optimized by gradient descent on a task objective. The local operation is the same; only the coefficients change.

### Multi-channel convolution

A CNN filter operates across all input channels simultaneously:

```
Y[o, i, j] = b[o] + Σ_c Σ_u Σ_v X[c, i+u, j+v] · K[o, c, u, v]
```

Each output channel is one feature map — a spatial map of where a particular detector responds.

## Translation equivariance

A CNN layer is approximately **translation equivariant**: shifting the input shifts the corresponding output. This holds for interior positions with consistent padding. It does **not** mean the network is translation invariant — pooling, stride, and boundaries break exact equivariance.

## Key limitations

- Convolution is local: it cannot directly model long-range dependencies
- Padding creates artificial border values
- Stride can alias fine detail
- Learned filters are not always human-interpretable
- Feature maps are intermediate activations, not predictions
