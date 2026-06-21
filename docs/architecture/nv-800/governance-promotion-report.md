# NV-800-QA5 — Draft → Reviewed Governance Pass

## 1. Promotion Criteria

A resource is promoted only if all criteria are true:

| # | Criterion | Verification Method |
|---|-----------|-------------------|
| 1 | Unique, topic-specific summary | QA4A pass — 600/600 rewritten |
| 2 | Grammatically correct | QA4A pass — 0 a/an errors remaining |
| 3 | Technically accurate | Spot-check verified for promoted topics |
| 4 | Evidence Boundary preserved | ✅ 602/602 files |
| 5 | No assessment logic introduced | ✅ All files checked |
| 6 | No mastery claims introduced | ✅ All files checked |
| 7 | Dependencies remain valid | ✅ Empty/valid throughout |
| 8 | Registry entry exists and matches | ✅ QA2 confirmed 600:600 alignment |
| 9 | References are valid | ✅ QA3 confirmed 0 broken links |
| 10 | Instructional objectives align with content | Spot-check verified for promoted topics |
| 11 | Interactive viz indicates specification status | QA4A pass — 120/120 clarified |
| 12 | Exercises do not reveal solutions | QA4A pass — 120/120 fixed |

## 2. Promoted Resources

### Learning Artifacts: 65 promoted (535 retained as Draft)

| Topic | Wave | Reason for Promotion |
|-------|------|---------------------|
| neurosymbolic-ai | C25 | Deepest content in corpus (218 body lines); verified technical accuracy |
| scaling-laws-and-emergent-behavior | C25 | Strong explanatory content with citations; verified accuracy |
| ai-for-scientific-discovery | C25 | Rich 4×6 comparison table; custom summary; verified accuracy |
| mixture-of-experts-architectures | C25 | Deep content across all 5 types (avg 158 body lines) |
| world-models-and-latent-simulation | C25 | Substantive emerging-topic coverage; verified accuracy |
| reasoning-models-and-test-time-compute | C25 | Strong CoT, PRM/ORM, test-time compute explanations |
| data-drift-and-concept-drift | C24 | Excellent river delta analogy; verified technical accuracy |
| model-versioning-and-experiment-tracking | C24 | Deep content; strong production ML focus |
| model-monitoring-observability | C24 | Thorough coverage of observability concepts |
| model-serving-and-inference | C24 | Verified express-toll-road analogy; accurate technical content |
| deployment-strategies-and-rollbacks | C24 | Substantial content; verified MLOps accuracy |
| ml-pipelines-and-orchestration | C24 | Strong pipeline orchestration content; verified |
| constitutional-ai | C15 | Best comparison table in corpus; QA4 rated Good |

### Lesson Compositions: 13 promoted (107 retained as Draft)

All lessons corresponding to the 13 promoted topics above. Each lesson references exactly 5 artifacts, all of which are promoted. Lesson compositions meet all criteria (evidence boundary, no assessment, valid references).

### Module Compositions: 4 promoted (36 retained as Draft)

| Module | Contained Lessons | Rationale |
|--------|------------------|-----------|
| frontier-ai-paradigms | world-models, neurosymbolic-ai, ai-for-scientific-discovery | All 3 promoted |
| frontier-model-scaling | scaling-laws, reasoning-models, mixture-of-experts | All 3 promoted |
| production-ai-systems | model-serving, model-monitoring, data-drift | All 3 promoted |
| mlops-lifecycle | ml-pipelines, model-versioning, deployment | All 3 promoted |

### Learning Paths: 2 promoted (17 retained as Draft)

| Learning Path | Contained Modules | Rationale |
|---------------|------------------|-----------|
| ai-research-frontier-topics | frontier-model-scaling, frontier-ai-paradigms | All modules promoted |
| production-ai-systems-mlops | production-ai-systems, mlops-lifecycle | All modules promoted |

## 3. Resources Retained as Draft

### Why 535 artifacts remain Draft

The QA4 editorial quality assessment identified that ~50% of artifacts (particularly from waves C01–C15) have sparse educational content — single-paragraph analogies, minimal comparison tables, and thin explanatory text. While QA4A fixed template issues (boilerplate, grammar), the substantive content depth has not been improved. Per governance principle: *when uncertain, retain Draft.*

Key reasons for retaining Draft:

| Reason | Approximate Count |
|--------|------------------|
| Sparse content — visual intuition is single analogy without technical follow-through | ~120 visual-intuition files |
| Minimal comparison tables (<5 rows) | ~30 comparison-table files |
| Template-identical lesson compositions (no topic-specific pedagogical design) | ~107 lessons |
| Mixed-module governance — modules with both Draft and Reviewed lessons | 36 modules (all non-promoted) |
| Learning paths referencing modules with Draft constituents | 17 LPs |

### Draft retention by type

| Type | Draft | Reviewed | Total |
|------|-------|----------|-------|
| Learning Artifacts | 535 | 65 | 600 |
| Lesson Compositions | 107 | 13 | 120 |
| Module Compositions | 36 | 4 | 40 |
| Learning Paths | 17 | 2 | 19 |
| **Total** | **695** | **84** | **779** |

## 4. Registry Alignment

| Check | Result |
|-------|--------|
| Registry entries for promoted artifacts updated to Reviewed | ✅ 65 entries |
| Registry entries for non-promoted artifacts remain Draft | ✅ 535 entries |
| Total registry entries | ✅ 600 (1:1 with artifacts) |

## 5. Evidence Boundary Validation

All 602 promoted + non-promoted artifact files contain the Evidence Boundary section. No assessment logic or mastery claims were introduced during the promotion pass.

## 6. Architectural Semantics

The following were **not modified**:
- artifact IDs, lesson IDs, module IDs, LP IDs
- dependency relationships
- metadata semantics
- lifecycle semantics
- registry architecture
- canonical taxonomy
- Phase 2 contracts
- Evidence Boundary language

## 7. Validation

| Check | Result |
|-------|--------|
| Promotion criteria applied consistently | ✅ |
| Only qualified resources promoted | ✅ |
| Remaining Draft resources documented | ✅ |
| Registry alignment preserved (600:1) | ✅ |
| Evidence Boundary preserved | ✅ |
| No assessment logic introduced | ✅ |
| No mastery claims introduced | ✅ |
| `git diff --check` | ✅ |

---

**NV-800-QA5 — Draft → Reviewed Governance Pass**
**Status: READY**

**Report generated:** 2026-06-21
**Auditor:** Automated governance pass (NV-800-QA5)
