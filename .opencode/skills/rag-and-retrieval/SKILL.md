---
name: rag-and-retrieval
description: Work on retrieval systems, embeddings, knowledge graphs, semantic search, and RAG UX.
---

# RAG and Retrieval

## Purpose

Keep retrieval, search, semantic navigation, memory, embeddings, and knowledge graph experiences explainable and reliable.

## When To Use

Use for NeuralVerse retrieval systems, search, ranking, embeddings, knowledge graphs, semantic navigation, and RAG UX.

## Core Rules

- Keep retrieval UX understandable.
- Separate data model, ranking logic, UI rendering, and interaction state.
- Avoid fake intelligence or misleading claims.
- Prefer explainable ranking and visible evidence.
- Preserve graph clarity and interaction stability.
- Avoid overloading the UI with redundant metadata.

## Workflow

1. Locate the relevant data, ranking, rendering, and interaction boundaries.
2. Inspect current retrieval states before editing.
3. Apply the smallest behavior-preserving change.
4. Validate search, empty, and error states when affected.

## Validation

- Verify search behavior is predictable.
- Verify results expose enough context and evidence.
- Verify graph layout remains readable when graph UI is affected.
- Verify empty and error states are useful when affected.

## Report

- Retrieval or graph behavior changed.
- Files changed.
- States validated.
- Evidence or ranking assumptions.
- Remaining retrieval risks.

## Forbidden

- Do not imply real AI intelligence when behavior is deterministic or static.
- Do not blend ranking logic, data shape, and UI state without justification.
