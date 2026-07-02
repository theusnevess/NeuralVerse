# NV-1100-P3A — Shared Knowledge Governance Report

**Generated**: 2026-06-30T17:27:58.879Z
**Schema Version**: 2.0
**Decision**: ✅ READY

## Summary

| Metric | Value |
|--------|-------|
| Domains checked | 10 |
| Domains passed | 10 |
| Errors | 0 |
| Warnings | 0 |
| Info | 8 |

## Information

- Cross-domain concept "regularization" (allowed overlap): machine-learning, optimization
- Cross-domain concept "backpropagation" (allowed overlap): deep-learning, optimization
- Cross-domain concept "batch normalization" (allowed overlap): deep-learning, optimization
- Cross-domain concept "dropout" (allowed overlap): deep-learning, optimization
- Cross-domain concept "convolution" (allowed overlap): deep-learning, computer-vision
- Cross-domain concept "causal masking" (allowed overlap): llms, transformers
- Cross-domain concept "dense retrieval" (allowed overlap): rag, embeddings
- Found 7 cross-domain concept duplication(s) total

## Domain Details

### machine-learning
- **Title**: Machine Learning Foundations
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 3
- **Concepts**: 9

### deep-learning
- **Title**: Deep Learning Fundamentals
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 4
- **Concepts**: 9

### computer-vision
- **Title**: Computer Vision
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 3
- **Concepts**: 9

### llms
- **Title**: Large Language Models
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 3
- **Concepts**: 10

### rag
- **Title**: Retrieval-Augmented Generation
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 3
- **Concepts**: 8

### agents
- **Title**: AI Agents & Agentic Systems
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 1
- **Typed Relations**: 3
- **Concepts**: 8

### mlops
- **Title**: MLOps & ML Systems Engineering
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 2
- **Concepts**: 10

### transformers
- **Title**: Transformers & Attention Mechanisms
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 4
- **Concepts**: 8

### embeddings
- **Title**: Embeddings & Vector Representations
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 2
- **Typed Relations**: 2
- **Concepts**: 7

### optimization
- **Title**: Optimization & Training
- **Version**: 1.0.0
- **Reviewed By**: NV-1100-P3 Implementation
- **Status**: Reviewed
- **Source References**: 1
- **Typed Relations**: 3
- **Concepts**: 10

## Schema Governance

### Required Fields
- `id`
- `title`
- `summary`
- `concepts`
- `keywords`
- `historicalContext`

### Governance Fields
- `version`
- `reviewedBy`
- `sourceReferences`
- `relatedConcepts`
- `lastReviewed`
- `canonicalStatus`

### Valid Relation Types
- `depends_on`
- `extends`
- `contrasts`
- `uses`
- `implements`
- `supports`
- `generalizes`
- `specializes`
- `related_to`

### Valid Statuses
- `Draft`
- `Reviewed`
