---
title: Convolution in Computer Vision
id: nv-2800-convolution
canonical_status: experimental_test
---

# Convolution in Computer Vision

From Classical Image Kernels to Learned CNN Feature Maps

## What you will learn

This guide covers 2D discrete convolution, cross-correlation, and their role in computer vision.

## Core concepts

- **Kernel:** A small numerical operator applied to local image neighborhoods.
- **Convolution:** Weighted aggregation with kernel reversal.
- **Cross-correlation:** The unflipped sliding dot product used by most deep-learning libraries.
- **Feature map:** The spatial activation produced by a filter.
- **Translation equivariance:** Translating the input shifts the output (interior, ideal).

## Quick formulas

For input H by W, kernel kh by kw, padding p, stride s, dilation d:

```
Hout = floor((H + 2p - d(kh - 1) - 1) / s) + 1
```

## Example

For a 3x3 kernel on a 5x5 input with stride 1 and valid padding, output is 3x3.

## Where to continue

- Open **Kernel Observatory** for interactive experiments.
- Review `[[Convolution in Computer Vision]]` for the full lesson and assessment.
