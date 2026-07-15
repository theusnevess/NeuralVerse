---
id: nv-2800-convolution
title: Convolution in Computer Vision: From Classical Image Kernels to Learned CNN Feature Maps
canonical_status: experimental_test
publication_status: internal_validation
authority: non_canonical
---
# Convolution in Computer Vision
## 1. Orientation
**Module position:** Module 1 spatial-domain filtering, bridging to Module 2 CNN fundamentals. **Depth:** 3.5 hours. **Prerequisites:** matrices, summation, image tensors, array indexing, local neighborhoods, linear transformations. You will trace a kernel, calculate outputs, predict shapes, implement three paths, and collect reproducible Laboratory evidence. Available: Kernel Observatory, inline checks, Visual Convolution Explorer.
## 2. Motivation
A camera on a production line records millions of pixels, but a scratch is a local change in intensity and orientation. A whole-image average loses its location. Reusing one local operation at every location gives a measurable response map while preserving spatial structure.
## 3. Intuition
For each small patch, align the kernel, multiply corresponding values, and add. The output number belongs to the kernel center's location. **Visual analogy:** a transparent stencil. **Engineering analogy:** a reusable local quality-control gauge. **Not an analogy:** no physical object travels over pixels; this is indexed arithmetic, and the exact result depends on boundary policy and whether the kernel is flipped.
## 4. Formal definition
For a signal x and kernel k, `(x*k)[n]=sum_m x[m]k[n-m]`. For images, `(X*K)[i,j]=sum_u sum_v X[i-u,j-v]K[u,v]`. Cross-correlation is `(X star K)[i,j]=sum_u sum_v X[i+u,j+v]K[u,v]`; it does not flip K. With input H by W, kernel kh by kw, padding p, stride s, and dilation d, `Hout=floor((H+2p-d(kh-1)-1)/s)+1` and likewise for W. Multi-channel correlation is `Y[o,i,j]=b[o]+sum_c sum_u sum_v X[c,i+u,j+v]K[o,c,u,v]`. Dilated offsets are `d*u,d*v`. Here i,j are output coordinates; u,v are kernel coordinates; c and o index input and output channels; b is bias.
## 5. Visual demonstration
Use VIS-01 through VIS-12 in `visuals/asset-manifest.json`: each has vector composition, labels, alt text, long description, reduced-motion alternative, and responsive specification.
## 6. Worked example
For `X=[[1,2,0],[0,1,3],[2,2,1]]` and `K=[[1,0],[-1,1]]`, valid cross-correlation gives: at (0,0), `1*1+2*0+0*(-1)+1*1=2`; (0,1), `2*1+0*0+1*(-1)+3*1=4`; (1,0), `0*1+1*0+2*(-1)+2*1=0`; (1,1), `1*1+3*0+2*(-1)+1*1=0`. Output is `[[2,4],[0,0]]`. Valid mode omits incomplete border windows; zero padding would retain border centers using zeros.
## 7. Parameters
Kernel size changes local support, cost, and receptive field; larger is not automatically better. Stride changes sample spacing, output size, cost, and aliasing risk. Padding changes boundary assumptions and output geometry, not image information. Dilation expands support without new coefficients but can grid. Input channels are summed per filter; output channels count feature maps; bias shifts an output channel. Use the matching Kernel Observatory one-factor experiment before accepting a parameter claim.
## 8. Classical filters
Box blur `(1/9)ones(3,3)` smooths but blurs edges. Gaussian blur `(1/16)[[1,2,1],[2,4,2],[1,2,1]]` is weighted smoothing. Sharpen `[[0,-1,0],[-1,5,-1],[0,-1,0]]` emphasizes local contrast and noise. Sobel X and Y detect vertical and horizontal intensity changes respectively. Laplacian `[[0,1,0],[1,-4,1],[0,1,0]]` emphasizes rapid change. Emboss is a visual-only directional relief demonstration, not a semantic detector.
## 9. From fixed to learned
A hand-designed filter encodes a chosen property. A learned filter begins as parameters and is adjusted by loss gradients. Many output channels form many feature maps; stacked layers produce increasingly broad receptive fields. This is translation equivariance in an ideal interior setting, not a guarantee of translation invariance after stride, padding, pooling, and finite boundaries.
## 10. Implementation
Run the NumPy, OpenCV, and PyTorch examples in `implementations/`. OpenCV `filter2D` and PyTorch `Conv2d` use cross-correlation conventions; the latter learns weights when optimized.
## 11. Laboratory
Open **Kernel Observatory**. Predict first, run deterministic fixtures, inspect a selected output coordinate, capture the raw sum and configuration, then record observation separately from interpretation.
## 12. Applications
Industrial inspection uses local texture and edge evidence under latency and camera-drift constraints. Medical-imaging pipelines require controlled validation and human review; no clinical performance claim follows from a filter example. Autonomous perception balances multi-channel camera features, lighting variation, and edge-compute budgets.
## 13. Misconceptions
Convolution and correlation differ unless a symmetric kernel makes them coincide. Larger kernels, padding, stride, extra feature maps, and apparent filter patterns each have trade-offs. A feature map is an intermediate activation, not a prediction.
## 14. Assessment
Complete diagnostics before formalism, inline checks after each parameter, six Laboratory tasks, and the final synthesis. Feedback is mapped to explicit error categories; it does not estimate hidden mastery.
## 15. Synthesis
Convolution is local weighted aggregation. Its mathematical model is indexed sums, its visual model is a sliding neighborhood, and its implementation model is shape-checked tensor operations. Next: pooling, stacked receptive fields, CNN training, and feature visualization.
