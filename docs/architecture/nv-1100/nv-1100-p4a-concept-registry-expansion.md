# NV-1100-P4A — Concept Registry Expansion

## Purpose

Expand the Concept Layer from its current 41-concept seed registry into a semantically rich, pedagogically justified, connection-dense registry. The goal is not size for its own sake, but to establish a sufficiently complete concept graph to power the next generation of NeuralVerse capabilities: semantic recommendations, dependency-aware navigation, concept-level search, and agent reasoning.

## Approved Direction (with Strategic Adjustments)

The expansion was approved in principle with three strategic adjustments:

1. **Target band, not a fixed count** — the registry will be grown to a target band of **160 ± 10 concepts** (i.e. 150–170). The exact final number is a consequence of semantic completeness, not a quota.
2. **Deduplicate and disambiguate near-synonyms** — overlapping concepts across the LLM and Prompt Engineering regions of the taxonomy must be either unified under a single canonical concept with typed differentiation, or explicitly differentiated with clear pedagogical roles and non-overlapping relationships.
3. **Pedagogical justification + connection density are mandatory admission criteria** — no concept enters the registry solely to inflate the count. Every new concept must be justifiable by (a) at least one curriculum artifact that depends on it, and (b) at least one typed relationship to an existing or concurrent concept. Concepts without these connections are rejected at the validator level.

## Scope of Expansion

### From

- 41 concepts
- 13 valid categories
- 4 difficulty levels
- 9 relation types
- 10 shared knowledge domains
- ~600 curriculum artifacts

### To (Target)

- 150–170 concepts (target band 160 ± 10)
- 13–15 valid categories (potential new categories: `reasoning`, `prompt-engineering`, `evaluation`, `safety`)
- 4 difficulty levels (unchanged)
- 9 relation types (unchanged in P4A; expansion deferred to P4B if needed)
- 10–12 shared knowledge domains
- ~600 curriculum artifacts (unchanged in P4A; new concepts will attach to existing artifacts)

## Taxonomy of New Concept Clusters

The expansion is organized as a set of **clusters** — each cluster corresponds to a coherent region of the AI/ML concept space where the current registry is thin or missing. Every concept within a cluster is required to satisfy the admission criteria.

### Cluster A — Prompt Engineering & LLM Interaction

This is the most semantically dense and most prone to duplication. Special deduplication policy applies (see §Deduplication Policy).

| New concept | Role | Disambiguation notes |
|---|---|---|
| `zero-shot-prompting` | Inference without examples | Distinct from `in-context-learning` (which is the broader family) |
| `few-shot-prompting` | Inference with in-context examples | Unified treatment — see §Deduplication Policy |
| `chain-of-thought-prompting` | Step-by-step reasoning elicitation | Unified treatment — see §Deduplication Policy |
| `self-consistency` | Sampling multiple reasoning paths + vote | Distinct from CoT (CoT is a single path) |
| `tree-of-thought` | Branching search over reasoning steps | Extends CoT |
| `reactive-prompting` | Re-prompting based on intermediate output | Distinct from iterative refinement |
| `prompt-templates` | Reusable structured prompt scaffolds | |
| `system-prompts` | Persistent role/instruction framing | |
| `prompt-chaining` | Multi-step prompt composition | |
| `function-calling-schema` | Structured tool descriptions | |
| `context-window-management` | Allocation of context budget | |
| `prompt-injection` | Adversarial prompt manipulation | Security-adjacent |

### Cluster B — Reasoning & Inference-Time Compute

| New concept | Role |
|---|---|
| `reasoning-models` | Models specialized for inference-time reasoning |
| `test-time-compute` | The inference-compute paradigm |
| `process-reward-models` | Step-level reward modeling |
| `deliberation` | Explicit reasoning before answer emission |
| `search-based-reasoning` | MCTS / BFS / DFS over reasoning space |
| `inference-time-scaling` | Scaling laws at inference |
| `planning-task-decomposition` | Task splitting for reasoning |
| `reflection-self-correction` | Self-critique loops |

### Cluster C — Retrieval, Indexing & Search (deepen existing)

| New concept | Role |
|---|---|
| `sparse-retrieval` | BM25 / TF-IDF style lexical retrieval |
| `hybrid-retrieval` | Combination of sparse + dense |
| `approximate-nearest-neighbors` | ANN indexing (HNSW, IVF) |
| `query-expansion` | Reformulating/expanding queries |
| `query-understanding` | Intent + entity extraction from queries |
| `cross-encoder-scoring` | Joint query-document scoring |
| `bi-encoders` | Independent query/doc encoders |
| `document-embedding` | Document-level vector representation |
| `passage-embedding` | Passage-level vector representation |
| `metadata-filtering` | Pre-retrieval filtering |
| `index-rebuilding` | Index lifecycle |

### Cluster D — Evaluation, Benchmarking & Alignment

| New concept | Role |
|---|---|
| `evaluation-metrics` | Quantitative performance measures |
| `benchmarking` | Standardized evaluation suites |
| `human-evaluation` | Human-in-the-loop assessment |
| `task-specific-evaluation` | Domain-targeted evaluation |
| `llm-as-judge` | LLM-based automated evaluation |
| `alignment` | Aligning model behavior with intent |
| `rlhf` | Reinforcement learning from human feedback |
| `constitutional-ai` | Principle-based self-critique |
| `preference-learning` | Learning from ranked outputs |
| `reward-modeling` | Reward signal design |

### Cluster E — Safety, Robustness & Governance

| New concept | Role |
|---|---|
| `jailbreak-attacks` | Adversarial prompt attacks |
| `guardrails` | Runtime safety constraints |
| `output-validation` | Post-generation verification |
| `hallucination-mitigation` | Reducing factual errors |
| `red-teaming` | Adversarial testing |
| `privacy-in-ml` | Differential privacy, federated |
| `bias-fairness` | Demographic parity, equalized odds |
| `interpretability` | Model explanation techniques |
| `explainability` | Human-understandable rationales |

### Cluster F — Computer Vision (deepen)

| New concept | Role |
|---|---|
| `bounding-boxes` | Object localization geometry |
| `iou` | Intersection-over-Union metric |
| `anchor-based-detection` | Anchor-based detectors |
| `anchor-free-detection` | CenterNet / FCOS style |
| `one-stage-detectors` | YOLO, SSD family |
| `two-stage-detectors` | R-CNN family |
| `instance-segmentation` | Pixel + instance labels |
| `semantic-segmentation` | Pixel-level class labels |
| `panoptic-segmentation` | Unified instance + semantic |
| `transfer-learning-vision` | Pretrained vision backbones |
| `vision-transformers` | ViT family |
| `image-captioning` | Vision-to-text generation |
| `visual-question-answering` | Multimodal QA |

### Cluster G — Mathematics, Probability & Statistics (deepen)

| New concept | Role |
|---|---|
| `probability-distributions` | Discrete and continuous distributions |
| `bayes-theorem` | Posterior inference |
| `bias-variance-tradeoff` | Generalization decomposition |
| `sampling-bias` | Dataset bias types |
| `correlation-vs-causation` | Statistical vs causal inference |
| `gradient-flow` | Jacobian analysis of deep nets |
| `information-theory-basics` | Entropy, KL, mutual information |
| `matrix-decomposition` | SVD, eigendecomposition |
| `numerical-stability` | Floating-point pitfalls |

### Cluster H — Embeddings & Representation Learning

| New concept | Role |
|---|---|
| `embedding-models` | Models producing embeddings |
| `sentence-embeddings` | Sentence-level representations |
| `document-embeddings` | Document-level representations |
| `contrastive-learning` | SimCLR / InfoNCE style |
| `embedding-evaluation` | Intrinsic vs extrinsic eval |
| `dimensionality-reduction` | PCA, t-SNE, UMAP |
| `vector-quantization` | PQ, k-means quantization |

### Cluster I — Generative Models & Multimodal

| New concept | Role |
|---|---|
| `diffusion-models` | Score-based generative models |
| `vae` | Variational autoencoders |
| `gan` | Adversarial generative models |
| `autoregressive-generation` | Token-by-token generation |
| `multimodal-foundation-models` | Cross-modal pretraining |
| `world-models` | Latent dynamics models |
| `mixture-of-experts` | Sparse expert routing |

### Cluster J — MLOps & Production

| New concept | Role |
|---|---|
| `experiment-tracking` | Run / artifact logging |
| `model-versioning` | Model artifact management |
| `deployment-strategies` | Canary, blue/green, shadow |
| `feature-stores` | Online/offline feature serving |
| `pipeline-orchestration` | DAG-based ML pipelines |
| `cost-optimization-ml` | Inference cost engineering |

### Cluster K — Agentic Systems (deepen)

| New concept | Role |
|---|---|
| `agent-memory` | Short/long-term agent state |
| `agent-orchestration` | Multi-agent coordination |
| `goal-directed-agents` | Plan-and-execute patterns |
| `tool-routing` | Selecting among available tools |
| `agent-evaluation` | End-to-end task success |
| `human-in-the-loop-agents` | Confirmation and oversight patterns |

## Deduplication Policy (Adjustment #2)

The LLM and Prompt Engineering regions of the taxonomy historically have many near-synonyms that risk producing duplicate concepts. The following explicit policy applies:

### Unified concepts (one canonical entry per concept)

- `few-shot-prompting` is the **canonical** concept for "providing examples in a prompt at inference time." All aliases that would refer to `few-shot-learning` (in the LLM sense) point to this concept. `few-shot-learning` is reserved, if at all, for the classical few-shot classification sense and is **not** introduced in P4A to avoid duplication.
- `chain-of-thought-prompting` is the **canonical** concept for "eliciting step-by-step reasoning via prompt structure." All aliases that would refer to `chain-of-thought` (as a prompting technique) point to this concept. `chain-of-thought` is treated as an alias, not a separate entry.
- `in-context-learning` remains the **family-level** concept that subsumes zero-shot, few-shot, and CoT prompting. New prompting concepts use `specializes` edges to `in-context-learning`.

### Explicitly differentiated concepts (different pedagogical roles)

The following pairs look similar but have distinct pedagogical roles and remain as separate concepts with explicit typed relationships between them:

- `dense-retrieval` vs `sparse-retrieval` — different retrieval mechanisms (neural vs lexical)
- `reranking` vs `cross-encoder-scoring` — reranking is the *stage*; cross-encoder scoring is one *mechanism* for that stage. `cross-encoder-scoring` has a `used_by` edge to `reranking`.
- `reasoning-models` vs `chain-of-thought-prompting` — reasoning models are an *artifact class*; CoT prompting is a *technique* applicable to many models. `chain-of-thought-prompting` has an `implements` edge to `reasoning` capability.
- `self-consistency` vs `chain-of-thought-prompting` — self-consistency is a *sampling+aggregation* strategy; CoT is a *prompt structure*. `self-consistency` has an `extends` edge to `chain-of-thought-prompting`.
- `planning-task-decomposition` vs `planning-loops` — decomposition is the *task structure*; loops are the *control flow*. Typed `uses` relationship.
- `reflection-self-correction` vs `react-pattern` — reflection is the *cognitive primitive*; ReAct is the *pattern that combines reasoning+acting*. `react-pattern` has a `uses` edge to `reflection-self-correction`.

### Validator enforcement

- **Unique alias rule** is extended: aliases must be unique across the entire registry (already enforced) AND must not match the ID of another concept.
- A new check rejects concept IDs that are *synonyms* of an existing concept ID, using a small denylist maintained in the validator (e.g. `few-shot-learning` is blocked if `few-shot-prompting` exists; `chain-of-thought` is blocked if `chain-of-thought-prompting` exists).
- Disambiguation comments are required in the `definition` field for any concept with 3+ aliases that include near-synonyms.

## Quality Criteria (Adjustment #3)

Every concept admitted to the registry must satisfy all of the following:

| Criterion | Requirement | Validated by |
|---|---|---|
| **C1 — Pedagogical justification** | A 1–3 sentence `summary` plus a `definition` field explaining why this concept deserves to be learned | Manual review at admission; no placeholder content |
| **C2 — Artifact linkage** | At least one entry in `artifactReferences` referring to an artifact that already exists in `curriculum-index.json` | Validator checks the artifact ID exists in the curriculum index |
| **C3 — Relationship linkage** | At least one entry in `relatedConcepts` (any type) or one entry in `prerequisiteConcepts` | Validator counts edges |
| **C4 — Connection density** | A concept with `difficulty: beginner` must have ≥2 outgoing edges; `intermediate`/`advanced`/`expert` must have ≥1 | Validator counts outgoing edges |
| **C5 — Source grounding** | At least one entry in `sourceReferences` for `intermediate`/`advanced`/`expert` concepts; `beginner` concepts may omit but should where possible | Validator checks field presence |
| **C6 — Disambiguation** | Concepts in the LLM/Prompt Engineering region must include a `disambiguation` field in the JSON if they have ≥3 aliases or potential near-synonyms | Validator checks field |
| **C7 — Alias uniqueness** | Aliases are unique across the entire registry and do not collide with another concept's ID | Validator uniqueness check (already present) |
| **C8 — Category validity** | Concept `category` is in `validCategories` (extended list in P4A) | Validator (already present) |
| **C9 — No placeholder metadata** | `reviewedBy` is not a placeholder (TBD/unknown/TODO) | Validator (already present) |
| **C10 — Reusability threshold** (optional, recommended) | A concept must be referenced by at least one curriculum artifact **and** at least one additional platform subsystem (Shared Knowledge, Search, Agent logic, Knowledge Graph, or Recommendation). Otherwise it is rejected or merged. | Validator counts distinct subsystem references in `platformSubsystemReferences` plus `sharedKnowledgeDomains` |

A concept that fails any criterion is rejected and reported in the validator output with the specific criterion ID.

### C10 — Reusability Threshold (detailed)

C10 protects the registry from concepts that exist only as metadata. A concept with no functional impact on the platform is, by definition, a candidate for rejection or for being merged into a more general concept.

**Reference sources counted toward C10:**

1. **Curriculum artifacts** — entries in `artifactReferences` (already enforced by C2).
2. **Shared Knowledge** — entries in `sharedKnowledgeDomains` (already a schema field; counts as one subsystem reference).
3. **Search** — concept appears in `searchConcepts` results with non-trivial match density, or is explicitly tagged in a new `platformSubsystemReferences` entry of type `search`.
4. **Knowledge Graph** — concept appears as a node in `getConceptGraph()` output (effectively all concepts with prerequisites or relations qualify, but the explicit tag is the source of truth).
5. **Agent logic** — concept is registered in the agent registry as queryable, or explicitly tagged in `platformSubsystemReferences` of type `agent`.
6. **Recommendation engine** — concept is referenced by the recommendation engine (forward-looking; tag in `platformSubsystemReferences` of type `recommendation`).

**Mechanism — new schema field:**

A new optional field `platformSubsystemReferences` is added to the concept schema:

```json
"platformSubsystemReferences": [
  { "subsystem": "shared-knowledge", "reference": "llms" },
  { "subsystem": "search", "reference": "concept-search-index" },
  { "subsystem": "knowledge-graph", "reference": "default" },
  { "subsystem": "agent", "reference": "concept-lookup-tool" },
  { "subsystem": "recommendation", "reference": "related-concept-suggester" }
]
```

Valid `subsystem` values (added to `validSubsystems` in `index.json`): `shared-knowledge`, `search`, `knowledge-graph`, `agent`, `recommendation`.

**Validation rule:**

- C10 is satisfied if a concept has ≥1 entry in `artifactReferences` AND ≥1 distinct subsystem appears in the union of `sharedKnowledgeDomains` (counted as `shared-knowledge`) and `platformSubsystemReferences`.
- If C10 fails: the validator emits a `REJECT-C10` warning listing which subsystem references are missing, and the concept is either rejected or merged into a related concept during manual review.
- Concepts inherited from the original 41 (existing set) are grandfathered: they pass C10 by default if they have `sharedKnowledgeDomains` populated. New concepts must satisfy C10 strictly.

**Optional but recommended:** although C10 is marked optional in P4A (to avoid blocking the expansion on a forward-looking engine), all newly admitted concepts in P4A are expected to satisfy it. Hard-enforcement of C10 is deferred to P4B once the Recommendation engine schema exists.

## Phased Execution

P4A is executed in small, validator-gated phases. Each phase ends with a clean validator run.

### Phase 1 — Schema and validator extensions (P4A.1)

- Extend `index.json` `validCategories` to include `reasoning`, `prompt-engineering`, `evaluation`, `safety`.
- Add `validSubsystems` to `index.json` with values `shared-knowledge`, `search`, `knowledge-graph`, `agent`, `recommendation`.
- Extend `concept-layer-validator.js` with C4, C5, C6, C10, and synonym-denylist enforcement.
- Add the `disambiguation` optional field to concept schema (not required for backward compatibility, but validated when present).
- Add the `platformSubsystemReferences` optional field to concept schema, validated against `validSubsystems`.
- Update `concept-layer-report.md` schema to expose new metrics (admission criteria pass rate, denylist hits, C10 subsystem coverage).
- Exit criteria: validator reports 41/41 existing concepts still pass; new criteria C4/C5/C6/C10 produce 0 regressions on the existing set (existing concepts are grandfathered for C10 if they have `sharedKnowledgeDomains` populated).

### Phase 2 — Concept admission in cluster batches (P4A.2)

- Each cluster is admitted as a batch: write all concept files in the cluster, run validator, fix any rejection, commit.
- Cluster order: C (retrieval), F (CV), H (embeddings), G (math/stats), I (generative), D (evaluation), E (safety), J (MLOps), B (reasoning), A (prompt engineering — last because of deduplication risk), K (agents).
- Target growth: roughly 10–15 concepts per cluster.
- Each batch is reviewed manually before committing, with focus on C1 (pedagogical justification) and C6 (disambiguation).

### Phase 3 — Relationship densification (P4A.3)

- After all concepts exist, audit `relatedConcepts` and `prerequisiteConcepts` for connection density.
- Ensure no concept is isolated (C3) and that the average outgoing-edge count meets the target band (e.g. ≥2.5 for non-beginner concepts).
- Update existing 41 concepts to point to new related concepts where pedagogically appropriate.

### Phase 4 — Cross-domain and validator hardening (P4A.4)

- Run extreme audit (`scripts/nv-1100-p3a-extreme-audit.js`) with new concept count.
- Re-validate `sharedKnowledgeDomains` references — if new shared knowledge domains emerge from the expansion, add them to that registry as well.
- Re-run Playwright UI verification (`scripts/nv-1100-p4-verify.js`) to ensure the knowledge graph and concept routes still render with the larger registry.

### Phase 5 — Governance sign-off (P4A.5)

- Update `docs/architecture/nv-1100/concept-layer.md` to reflect new stats.
- Update `docs/architecture/nv-1100/concept-layer-report.md` final summary.
- Produce `nv-1100-p4a-concept-registry-expansion-report.md` documenting:
  - Final concept count
  - Per-cluster count
  - Validator pass rate by criterion
  - Disambiguation decisions
  - Any rejected candidates and rationale

## Acceptance Criteria

P4A is considered complete when all of the following hold:

- Total concept count is within the 150–170 band (160 ± 10).
- 0 errors, 0 warnings on `concept-layer-validator.js`.
- All C1–C9 criteria pass for every concept.
- All newly admitted concepts in P4A satisfy C10 (Reusability Threshold). Existing 41 concepts are grandfathered on C10.
- Disambiguation denylist has no hits (i.e. no near-duplicate concept pairs slipped through).
- Existing 41 concepts still pass all criteria, including the new ones (no regressions).
- `getConceptGraph()` continues to render in the Knowledge Graph route (Playwright verification).
- `docs/architecture/nv-1100/concept-layer.md` and the JSON/MD reports reflect the new state.

## Out of Scope for P4A

- New relation types beyond the existing 9 (deferred to P4B if any cluster needs them).
- Backward-incompatible schema changes (e.g. removing fields) — only additive changes.
- Changes to the Shared Knowledge Service, curriculum content, or UI routes other than confirming the knowledge graph still renders.
- A separate `nlp` cluster — the current 41 already cover the essential NLP primitives; new NLP-adjacent concepts are added under `nlp` only when pedagogically distinct from existing entries.
- New curriculum artifacts — P4A attaches new concepts to existing artifacts.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Concept count creeps above 170 because clusters grow organically | C1–C9 admission gate; if a cluster needs >target concepts, another cluster is trimmed to stay in band |
| Near-duplicates slip through the denylist (e.g. `in-context-learning` vs `few-shot-prompting`) | Validator + manual cluster-by-cluster review; in-context-learning is the family, the prompting techniques specialize it |
| Existing 41 concepts regress under new criteria | Phase 1 first verifies no regression before any new concepts are admitted; Phase 3 retroactively updates existing concepts |
| Graph becomes too dense to render | Connection density cap is not enforced as a hard rule in P4A, but the Playwright verification will detect rendering issues |
| Aliases collide with concept IDs | Validator enforces alias-vs-ID non-collision (extended check) |
