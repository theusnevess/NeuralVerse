---
title: "Convolution Practice: Kernels, Parameters, and Edge Cases"
id: artifact-convolution-computer-vision-exercise
family: Practice Artifacts
type: Exercise
canonicalStatus: experimental_test
instructionalObjectives: ["Compute convolution outputs by hand", "Predict shape changes from parameters", "Diagnose unexpected results"]
estimatedDuration: "8-10 minutes"
---

# Convolution Practice Exercises

## Exercise 1: Hand computation

Given input:
```
X = [[1, 2, 0],
     [0, 1, 3],
     [2, 2, 1]]
```

And kernel:
```
K = [[1, 0],
     [-1, 1]]
```

Compute the valid cross-correlation output. Show each multiplication and sum.

<details>
<summary>Answer</summary>

At (0,0): 1×1 + 2×0 + 0×(−1) + 1×1 = 2
At (0,1): 2×1 + 0×0 + 1×(−1) + 3×1 = 4
At (1,0): 0×1 + 1×0 + 2×(−1) + 2×1 = 0
At (1,1): 1×1 + 3×0 + 2×(−1) + 1×1 = 0

Output: [[2, 4], [0, 0]]
</details>

## Exercise 2: Shape prediction

Input: 7×7, kernel: 3×3, stride: 2, padding: 0 (valid)
What is the output shape?

<details>
<summary>Answer</summary>

H_out = floor((7 − 3) / 2) + 1 = floor(2) + 1 = 3
Output: 3×3
</details>

## Exercise 3: Dilation support

A 3×3 kernel with dilation=2 has what effective width?

<details>
<summary>Answer</summary>

k_eff = d(k−1) + 1 = 2(3−1) + 1 = 5
Effective width: 5×5
</details>

## Exercise 4: Parameter comparison

You have two configurations:
- A: 3×3 kernel, stride 1, no padding
- B: 3×3 kernel, stride 2, padding 1

On a 10×10 input, which produces more output pixels? By how many?

<details>
<summary>Answer</summary>

A: (10−3)/1 + 1 = 8 → 8×8 = 64
B: (10+2−3)/2 + 1 = floor(4.5)+1 = 5 → 5×5 = 25
A produces 39 more pixels.
</details>

## Exercise 5: Edge response diagnosis

You apply Sobel X to an image and get weak response everywhere. List three possible causes.

<details>
<summary>Answer</summary>

1. The image has no vertical edges (only horizontal or uniform)
2. The image is too small for the kernel to have valid positions
3. The output normalization maps all values to a narrow range
</details>

## Exercise 6: Design a controlled experiment

Design a one-factor experiment to test whether padding affects border output values. Specify: fixed parameters, variable, measurement, expected observation.

<details>
<summary>Answer</summary>

Fixed: identity kernel, 5×5 gradient image, stride 1
Variable: valid vs same-zero padding
Measurement: output value at corner cell (0,0)
Expected: valid padding gives 0 (no valid window); zero padding gives the padded result
</details>
