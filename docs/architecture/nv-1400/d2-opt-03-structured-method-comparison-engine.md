# D2-OPT-03 — Structured Method Comparison Engine

## Purpose

The Structured Method Comparison Engine introduces deterministic comparison metadata between governed scientific methods. It exposes structured, evidence-backed comparison metadata that downstream agents may consume.

This engine does NOT determine which method is better, rank literature, or recommend methods. It only organizes governed scientific comparison metadata.

## Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `ResearchAgentContract.ts` | Extended with comparison types |
| `ComparisonEngine.ts` | Comparison orchestration functions |
| `ComparisonValidation.ts` | Deterministic validation |
| `index.ts` | Public API exports |

### Canonical Principle

Comparisons describe governed scientific characteristics. Comparisons never produce conclusions, infer superiority, or recommend methods. The Research Agent only exposes structured comparison metadata.

## Canonical Comparison Dimensions

### Supported Dimensions

| Dimension | Description |
|-----------|-------------|
| `problem_scope` | Scope of problems the method addresses |
| `core_assumption` | Fundamental assumptions of the method |
| `algorithmic_family` | Algorithmic family or class |
| `computational_complexity` | Time complexity characteristics |
| `memory_complexity` | Space complexity characteristics |
| `training_requirements` | Requirements for training |
| `data_requirements` | Data requirements |
| `interpretability` | Level of interpretability |
| `robustness` | Robustness characteristics |
| `generalization` | Generalization capabilities |
| `limitations` | Known limitations |
| `strengths` | Known strengths |
| `typical_use_cases` | Typical use cases |
| `research_maturity` | Research maturity level |

### Dimension Rules

- All dimensions are explicit, never inferred
- Unknown dimensions fail validation
- Dimensions require evidence backing
- Dimensions are consistently applied across methods

## Matrix Structure

The comparison matrix is a deterministic structure.

### Matrix Components

- **Methods**: List of compared methods
- **Dimensions**: List of comparison dimensions
- **Entries**: Comparison entries for each method

### Matrix Rules

- Deterministic ordering of methods and dimensions
- Identical dimensions across all entries
- No duplicated methods or dimensions
- Traceable cells with governed metadata only

## Provenance Requirements

Every comparison entry must expose provenance:

```typescript
interface ResearchComparisonProvenance {
  methodReferenceId: string;
  evidenceReferenceId: string;
  lineageReferenceId: string;
  comparisonDimension: ResearchComparisonDimension;
  source: string;
  governanceStatus: ResearchGovernanceStatus;
  rationale: string;
}
```

Comparisons without provenance must fail validation.

## Validation Strategy

### Validation Codes

| Code | Description |
|------|-------------|
| `COMPARISON_UNKNOWN_DIMENSION` | Unknown comparison dimension |
| `COMPARISON_DUPLICATE_METHOD` | Duplicate method detected |
| `COMPARISON_DUPLICATE_DIMENSION` | Duplicate dimension detected |
| `COMPARISON_UNSUPPORTED_METHOD` | Unsupported method reference |
| `COMPARISON_MISSING_EVIDENCE` | Missing evidence reference |
| `COMPARISON_MISSING_PROVENANCE` | Missing provenance |
| `COMPARISON_INVALID_ATTRIBUTE` | Invalid comparison attribute |
| `COMPARISON_INVALID_STATUS` | Invalid governance status |
| `COMPARISON_EMPTY_MATRIX` | Empty comparison matrix |
| `COMPARISON_INCONSISTENT_DIMENSIONS` | Inconsistent dimensions across entries |

### Matrix Integrity Rules

1. **Deterministic ordering**: Methods and dimensions have consistent order
2. **Identical dimensions**: All entries must have the same dimensions
3. **No duplicated methods**: Each method is unique
4. **No duplicated dimensions**: Each dimension is unique
5. **Traceable cells**: Every cell has provenance
6. **Governed metadata only**: No generated content

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical outputs
2. **No random**: `Math.random` not used anywhere
3. **No time**: `Date.now` not used for ordering or ID generation
4. **No mutation**: Input objects are never modified
5. **No fabrication**: Missing data produces validation errors
6. **Traceable**: Every artifact includes deterministic trace metadata

## Integration with Evidence Kernel

The Comparison Engine integrates with the D2-OPT-01 Evidence Kernel:

- Every comparison entry references canonical evidence
- Evidence references must be valid
- Comparison metadata is backed by governed evidence

## Integration with Lineage

The Comparison Engine integrates with the D2-OPT-02 Lineage Orchestration:

- Every comparison entry references canonical lineage
- Lineage references must be valid
- Comparison metadata is traceable through lineage

## Out-of-Scope Items

This phase does NOT implement:

- Paper retrieval
- Benchmark execution
- Benchmark ranking
- Timeline
- Dataset mapping
- Reading paths
- Educational summaries
- Recommendation systems
- Laboratory execution
- AI-generated comparisons
- Statistical inference
- Citation counting

## Runtime Limitations

- No network access
- No filesystem access
- No external libraries
- No browser APIs
- No LLM calls
- No paper parsing
- No web search
- No API calls

## Expected Deliverables

### Files Created

| File | Purpose |
|------|---------|
| `ComparisonEngine.ts` | Comparison orchestration functions |
| `ComparisonValidation.ts` | Deterministic validation |
| `ComparisonEngine.test.ts` | Test suite |
| `d2-opt-03-structured-method-comparison-engine.md` | This documentation |

### Files Modified

| File | Purpose |
|------|---------|
| `ResearchAgentContract.ts` | Extended with comparison types |
| `index.ts` | Extended with comparison exports |

### Contract Extensions

- `ResearchComparisonDimension` — canonical dimension enum
- `ResearchComparisonAttribute` — comparison attribute structure
- `ResearchComparisonValue` — comparison value structure
- `ResearchComparisonEntry` — comparison entry structure
- `ResearchComparisonMatrix` — comparison matrix structure
- `ResearchComparisonDecision` — comparison decision structure
- `ResearchComparisonTrace` — comparison trace structure
- `ResearchComparisonInput` — input data structure
- `ResearchArtifactWithComparison` — artifact with comparison structure
- `ResearchComparisonValidationResult` — validation result structure
- `ResearchComparisonProvenance` — provenance structure

### Matrix Validation

- `validateComparisonEntry()` — validates a single entry
- `validateComparisonMatrix()` — validates a complete matrix
- `validateResearchArtifactWithComparison()` — validates artifact
- `validateComparisonInput()` — validates input data

### Provenance Validation

Every comparison entry must expose provenance:

- `methodReferenceId` — method reference ID
- `evidenceReferenceId` — evidence reference ID
- `lineageReferenceId` — lineage reference ID
- `comparisonDimension` — comparison dimension
- `source` — source of comparison
- `governanceStatus` — governance status
- `rationale` — rationale for comparison

Comparisons without provenance must fail validation.

### Tests Created

- Valid comparison matrix
- Valid comparison entry
- Duplicate method
- Duplicate dimension
- Unsupported dimension
- Unsupported method
- Missing evidence
- Missing provenance
- Empty matrix
- Inconsistent dimensions
- Deterministic output
- Immutable input
- No generated content
- No inferred recommendation
- No ranking
- Identical output for identical input

## Phase Status

**APPROVED_FOR_HUB_REVIEW** — All code-level audits pass. Runtime tests blocked by environment only.
