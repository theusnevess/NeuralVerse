# NV-1300-D2 — Research Architecture Agent Evolution

> **Status:** READY
> **Scope:** Research Architecture Agent evolution layer D2
> **Builds on:** Didactic Agent D1, Concept Layer, Shared Knowledge, Semantic Learning, Memory, Laboratories, Visualizations
> **Preserves:** All prior layers unchanged

---

## 1. Mission

Transform the Research Architecture Agent from a conventional research assistant into a deterministic scientific reasoning engine.

The Research Agent investigates — it does not teach.

Its responsibility is to construct reproducible research workflows.

---

## 2. Core Principle

```
Research is an evidence composition problem.

The Research Agent never guesses.

It plans, collects, ranks, compares, validates, synthesizes and documents.
```

---

## 3. Final Architecture

```
Research Question
        |
        v
Research Planner
        |
        v
Question Decomposer
        |
        v
Research Strategy Builder
        |
        v
Evidence Collector
        |
        v
Evidence Ranker
        |
        v
Claim Extractor
        |
        v
Conflict Detector
        |
        v
Consensus Analyzer
        |
        v
Knowledge Synthesizer
        |
        v
Research Report Composer
        |
        v
Evidence Traceability
        |
        v
Optional Local LLM Augmentation
        |
        v
Final Research Report
```

---

## 4. New Runtime Modules

| Module | Responsibility |
|--------|----------------|
| `research-planner.js` | Classify intent, determine scope, build research plan |
| `question-decomposer.js` | Split questions into deterministic investigation units |
| `research-strategy-builder.js` | Produce deterministic research strategies |
| `evidence-collector.js` | Collect from canonical, shared knowledge, concepts, labs, viz, external |
| `evidence-ranker.js` | Rule-based ranking by source quality, relevance, citations |
| `claim-extractor.js` | Extract structured claims with confidence and limitations |
| `conflict-detector.js` | Detect contradictory claims and benchmark inconsistencies |
| `consensus-analyzer.js` | Determine consensus level (strong/moderate/limited/conflicting/insufficient) |
| `knowledge-synthesizer.js` | Merge validated claims into deterministic synthesis |
| `research-report-composer.js` | Compose final report sections |
| `citation-validator.js` | Verify duplicates, malformed citations, unsupported claims |
| `source-quality-engine.js` | Assign deterministic quality labels |
| `research-memory-bridge.js` | Read explicit bookmarks, saved papers, pinned research |
| `research-semantic-bridge.js` | Use concept graph and semantic engine for context |
| `research-generative-augmenter.js` | Optional P11 augmentation (always NonCanonical) |

---

## 5. Planner Architecture

The Research Planner classifies intent into:

- comparative
- survey
- historical
- implementation
- benchmark
- algorithmic
- state_of_the_art
- failure
- design_pattern

Depth presets:

- overview
- standard
- deep_review
- systematic
- research_notes

---

## 6. Decomposition Model

Each intent has a deterministic decomposition template:

| Intent | Units |
|--------|-------|
| comparative | concepts, architectures, benchmarks, advantages, limitations, applications |
| survey | overview, key_areas, methods, results, open_questions |
| historical | origins, key_milestones, evolution, current_state |
| implementation | requirements, architecture, code_structure, best_practices, pitfalls |
| benchmark | datasets, metrics, results, comparisons, limitations |
| algorithmic | problem_formulation, approach, complexity, proofs, extensions |
| state_of_the_art | recent_advances, leading_methods, benchmarks, open_problems |
| failure | failure_modes, root_causes, mitigations, alternatives |
| design_pattern | problem, solution, tradeoffs, examples, anti_patterns |

---

## 7. Evidence Ranking

Rule-based ranking criteria:

- Source quality (canonical: 10, peer_reviewed: 9, conference: 8, preprint: 6, etc.)
- Canonical relevance
- Concept relevance
- Benchmark relevance
- Citation frequency (when available)
- Publication recency (when applicable)

No machine learning. Deterministic sort by score.

---

## 8. Claim Extraction

Each claim includes:

- claim text
- source
- confidence (0-1)
- evidence references
- limitations
- supporting references

No paraphrased hallucinations. Only explicit content from evidence.

---

## 9. Conflict Model

Conflicts are detected for:

- Confidence mismatches (>0.3 difference)
- Contradictory claims
- Inconsistent benchmark results
- Terminology conflicts
- Methodological conflicts

Each conflict report includes:

- Claim A
- Claim B
- Reason
- Affected domain
- Recommended interpretation

---

## 10. Consensus Model

Consensus levels:

- strong_consensus (avg confidence >= 0.8)
- moderate_consensus (avg confidence >= 0.6)
- limited_evidence (few claims, low confidence)
- conflicting_evidence (conflict ratio > 0.3)
- insufficient_evidence (< 3 claims)

---

## 11. Synthesis Pipeline

The Knowledge Synthesizer merges validated claims into a structured synthesis that:

- Lists all claim IDs
- Identifies key findings (confidence >= 0.7)
- Reports conflict types
- Preserves consensus level
- Never invents relationships
- Never omits conflict information

---

## 12. Governance

Forbidden:

- learner modelling
- mastery estimation
- competency inference
- fake citations
- fabricated benchmarks
- hidden retrieval
- canonical mutation
- cloud dependency in deterministic path

---

## 13. Deterministic Guarantees

- No Math.random
- No Date.now ordering
- No random ranking
- No LLM-only synthesis
- Same inputs always produce same report

---

## 14. Performance Targets

| Component | Budget |
|-----------|--------|
| Planner | <20 ms |
| Ranking | <20 ms |
| Claim extraction | <20 ms |
| Conflict detection | <20 ms |
| Report composition | <20 ms |
| Total deterministic pipeline | <120 ms |

---

## 15. Validation Results

| Command | Result |
|---------|--------|
| `node scripts/nv-1300-d2-validator.js` | 743/743 PASS |
| `node scripts/nv-1300-d2-verify.js` | 12/12 PASS |

---

## 16. Files Added

| File | Purpose |
|------|---------|
| `website/scripts/agents/research-planner.js` | Intent classification and plan building |
| `website/scripts/agents/question-decomposer.js` | Question decomposition |
| `website/scripts/agents/research-strategy-builder.js` | Strategy generation |
| `website/scripts/agents/evidence-collector.js` | Evidence collection |
| `website/scripts/agents/evidence-ranker.js` | Evidence ranking |
| `website/scripts/agents/claim-extractor.js` | Claim extraction |
| `website/scripts/agents/conflict-detector.js` | Conflict detection |
| `website/scripts/agents/consensus-analyzer.js` | Consensus analysis |
| `website/scripts/agents/knowledge-synthesizer.js` | Knowledge synthesis |
| `website/scripts/agents/research-report-composer.js` | Report composition |
| `website/scripts/agents/citation-validator.js` | Citation validation |
| `website/scripts/agents/source-quality-engine.js` | Source quality labeling |
| `website/scripts/agents/research-memory-bridge.js` | Memory bridge |
| `website/scripts/agents/research-semantic-bridge.js` | Semantic bridge |
| `website/scripts/agents/research-generative-augmenter.js` | Optional P11 augmentation |
| `scripts/nv-1300-d2-validator.js` | Structural + governance validator |
| `scripts/nv-1300-d2-verify.js` | Deterministic verification |

---

## 17. Preservation Requirements

Must preserve:
- Didactic Agent D1 (D1A through D1E)
- Concept Layer
- Shared Knowledge
- Semantic Learning
- Memory
- Laboratories
- Visualizations
- Scalability (NV-1100-P10)
- Local Generative Layer (P11)

No backward incompatibilities.

---

## 18. Final Decision

```
NV-1300-D2 — Research Architecture Agent Evolution

Research planner implemented
Question decomposition implemented
Research strategy builder implemented
Evidence collection implemented
Evidence ranking implemented
Claim extraction implemented
Conflict detection implemented
Consensus analysis implemented
Knowledge synthesis implemented
Research report composition implemented
Citation validation implemented
Source quality engine implemented
Memory bridge implemented
Semantic bridge implemented
Optional local generative augmentation implemented
Evidence traceability certified
Governance preserved
Regression-free

READY
```

---

## 19. Architecture Metrics

```
Runtime modules audited:       15
Factories verified:            15
Public APIs verified:          62

Strategies implemented:        10
Evidence sources supported:     6
Quality labels:                 7
Consensus levels:               5

Deterministic executions:
  • Planner:                  1000
  • Full research pipeline:   1000
  • Topics tested:               5

Regression validators:     19/19 PASS
```

---

## 20. Canonical Pipeline

```text
Canonical Pipeline

Planner
↓
Evidence
↓
Claims
↓
Consensus
↓
Report
↓
Evidence Traceability
↓
END

Optional Local Generation
↓
Alternative explanations only
↓
Always NonCanonical
```

The Research Agent never invents canonical knowledge. It collects, ranks, extracts, detects conflicts, analyzes consensus, and composes reports — all from explicit evidence. Optional P11 generation is isolated and always tagged NonCanonical.

---

## 21. Preservation

```
Preservation

✓ Didactic Agent D1 unchanged
✓ Concept Layer unchanged
✓ Shared Knowledge unchanged
✓ Semantic Learning unchanged
✓ Memory unchanged
✓ Laboratories unchanged
✓ Visualizations unchanged
✓ Scalability unchanged
✓ Optional Generative Layer unchanged
```

No backward incompatibilities. D2 is purely additive.

---

## 22. Architectural Closure

```
Research Architecture Agent v1

Status: Architecturally Complete

The Research Agent now performs deterministic scientific investigation
through evidence planning, decomposition, structured synthesis,
conflict analysis, consensus evaluation, and traceable report composition.

Future iterations should focus on incremental improvements:
  • Additional ranking heuristics
  • Richer claim extraction
  • Domain-specific research templates
  • Expanded evidence sources

Structural redesign is not required.
```
