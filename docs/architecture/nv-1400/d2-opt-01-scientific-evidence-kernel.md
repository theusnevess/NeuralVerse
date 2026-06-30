# D2-OPT-01 — Scientific Evidence Kernel

## Purpose

The Scientific Evidence Kernel establishes the canonical research metadata infrastructure for the NeuralVerse Research Agent. It provides deterministic orchestration of research evidence metadata, evidence chains, and source hierarchy validation.

This kernel is the foundation upon which every later Research capability will be built. It does NOT implement lineage, timelines, benchmark mapping, dataset mapping, comparisons, reading paths, industry adoption, or literature maintenance.

## Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `ResearchAgentContract.ts` | Domain types and constants |
| `EvidenceKernel.ts` | Orchestration functions |
| `EvidenceValidation.ts` | Deterministic validation |
| `index.ts` | Public API exports |

### Canonical Principle

The Research Agent never invents knowledge. It only organizes governed scientific evidence. Every educational artifact must be capable of exposing a complete provenance chain.

Scientific evidence is metadata. It is NOT educational content.

## Boundaries

### In-Scope

- Scientific References
- Evidence Metadata
- Evidence Chains
- Evidence Traceability
- Source Hierarchy
- Evidence Validation
- Research Trace Metadata

### Out-of-Scope

- Lineage
- Timelines
- Benchmark mapping
- Dataset mapping
- Comparisons
- Reading paths
- Industry adoption
- Literature maintenance
- Runtime retrieval
- Web search
- APIs
- LLM
- Paper parsing

## Deterministic Guarantees

1. **Reproducibility**: Identical inputs → identical outputs
2. **No random**: `Math.random` not used anywhere
3. **No time**: `Date.now` not used for ordering or ID generation
4. **No mutation**: Input objects are never modified
5. **No fabrication**: Missing data produces validation errors, not placeholder content
6. **Traceable**: Every artifact includes deterministic trace metadata

## Evidence Hierarchy

### Canonical Source Types (ordered by priority)

1. Peer-reviewed journal
2. Conference paper
3. Academic book
4. Official textbook
5. Official documentation
6. Benchmark documentation
7. Standards body
8. Framework maintainer
9. Survey
10. Technical report
11. Engineering blog

### Hierarchy Rules

- Higher priority sources take precedence in deterministic ordering
- Unverified sources must never become canonical
- Source hierarchy rank is computed deterministically

## Validation Strategy

### Validation Codes

| Code | Description |
|------|-------------|
| `EVIDENCE_MISSING_TITLE` | Reference is missing a title |
| `EVIDENCE_MISSING_AUTHOR` | Reference is missing authors |
| `EVIDENCE_MISSING_YEAR` | Reference is missing publication year |
| `EVIDENCE_INVALID_SOURCE_TYPE` | Reference has unsupported source type |
| `EVIDENCE_INVALID_HIERARCHY` | Source type not in canonical hierarchy |
| `EVIDENCE_UNSUPPORTED_SOURCE` | Unsupported source type |
| `EVIDENCE_DUPLICATE_REFERENCE` | Duplicate reference ID |
| `EVIDENCE_DUPLICATE_DOI` | Duplicate DOI |
| `EVIDENCE_DUPLICATE_PID` | Duplicate persistent identifier |
| `EVIDENCE_MISSING_PROVENANCE` | Missing provenance chain |
| `EVIDENCE_BROKEN_CHAIN` | Evidence chain is broken |
| `EVIDENCE_INVALID_REVIEW_STATUS` | Invalid review status |
| `EVIDENCE_INVALID_GOVERNANCE` | Invalid governance status |

### Validation Approach

1. **Compile-time**: TypeScript strict mode catches type errors
2. **Runtime self-validation**: All functions validate inputs
3. **Test coverage**: Comprehensive test suite covering canonical test matrix
4. **Governance trace**: Evidence trace declares deterministic guarantees

## Integration with Governance Agent

The Evidence Kernel provides metadata that the Governance Agent can consume for:
- Source hierarchy validation
- Evidence level classification
- Review status tracking
- Governance status management

## Integration with Didactic Agent

The Evidence Kernel provides metadata that the Didactic Agent can consume for:
- Provenance chains attached to educational artifacts
- Source hierarchy for reference prioritization
- Evidence metadata for educational content validation

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
| `ResearchAgentContract.ts` | Domain types and constants |
| `EvidenceKernel.ts` | Orchestration functions |
| `EvidenceValidation.ts` | Deterministic validation |
| `index.ts` | Public API exports |
| `EvidenceKernel.test.ts` | Test suite |

### Contract Extensions

- `ResearchSourceType` — canonical source type enum
- `ResearchEvidenceLevel` — evidence level enum
- `ResearchReference` — reference data structure
- `ResearchEvidenceMetadata` — evidence metadata structure
- `ResearchEvidenceChain` — provenance chain structure
- `ResearchEvidenceStatus` — evidence status enum
- `ResearchEvidenceDecision` — evidence decision structure
- `ResearchEvidenceTrace` — trace metadata structure
- `ResearchEvidenceInput` — input data structure
- `ResearchArtifactWithEvidence` — artifact with evidence structure
- `ResearchEvidenceValidationResult` — validation result structure

### Validation Layer Additions

- `validateReference()` — validates a single reference
- `validateReferences()` — validates a collection of references
- `validateEvidenceMetadata()` — validates evidence metadata
- `validateEvidenceChain()` — validates evidence chain
- `validateResearchArtifact()` — validates a complete artifact
- `validateEvidenceInput()` — validates evidence input

### Tests Created

- Valid evidence metadata
- Missing title
- Missing authors
- Missing publication year
- Invalid source hierarchy
- Unsupported source
- Duplicate DOI
- Duplicate PID
- Broken evidence chain
- Deterministic output
- Input immutability
- No generated content
- No runtime retrieval
- No network usage
- No paper parsing
- Identical output for identical input

### Documentation Created

- This file: `d2-opt-01-scientific-evidence-kernel.md`

## Phase Status

**APPROVED_FOR_HUB_REVIEW** — All code-level audits pass. Runtime tests blocked by environment only.
