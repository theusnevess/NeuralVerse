---
module_id: "module-advanced-retrieval-pipelines"
module_title: "Advanced Retrieval Pipelines"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-query-routing
  - lesson-context-fusion
  - lesson-hybrid-indexing

artifact_scope:
  - artifact-query-routing-explanatory-text
  - artifact-query-routing-visual-intuition
  - artifact-query-routing-interactive-visualization
  - artifact-query-routing-exercise
  - artifact-query-routing-comparison-table
  - artifact-context-fusion-explanatory-text
  - artifact-context-fusion-visual-intuition
  - artifact-context-fusion-interactive-visualization
  - artifact-context-fusion-exercise
  - artifact-context-fusion-comparison-table
  - artifact-hybrid-indexing-explanatory-text
  - artifact-hybrid-indexing-visual-intuition
  - artifact-hybrid-indexing-interactive-visualization
  - artifact-hybrid-indexing-exercise
  - artifact-hybrid-indexing-comparison-table
---

# Advanced Retrieval Pipelines — Module Composition

## 1. Purpose

This module organizes foundational lessons related to advanced query and context engineering within retrieval pipelines, focusing on query intent-based routing switches, Reciprocal Rank Fusion (RRF) rank-combining math, and multi-index hybrid search architectures.

It provides an organizational boundary for routing rules, rank integers, and index boundaries without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to advanced query and context engineering within retrieval pipelines, focusing on query intent-based routing switches, Reciprocal Rank Fusion (RRF) rank-combining math, and multi-index hybrid search architectures.

This module aims to connect intent categories to router paths, rank indices to fusion calculations, and query syntax to index scans, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Query Routing and Intent Detection

*   **Lesson ID:** `lesson-query-routing`
*   **Location:** `docs/content/lessons/query-routing/lesson-composition.md`
*   **Pedagogical Role:** Teaches intent classifiers, logical switches, and specialized database target routes.
*   **Relationship to Module Aim:** Fulfills the query routing requirement of the learning aim.

### 3.2 Context Fusion and Aggregation

*   **Lesson ID:** `lesson-context-fusion`
*   **Location:** `docs/content/lessons/context-fusion/lesson-composition.md`
*   **Pedagogical Role:** Details RRF formulas, re-ranking pipelines, and list aggregation structures.
*   **Relationship to Learning Path Aim:** Fulfills the rank fusion requirement of the learning aim.

### 3.3 Hybrid Indexing Strategies

*   **Lesson ID:** `lesson-hybrid-indexing`
*   **Location:** `docs/content/lessons/hybrid-indexing/lesson-composition.md`
*   **Pedagogical Role:** Focuses on BM25 lexical indexes, dense vector embedding search, and metadata filter mappings.
*   **Relationship to Learning Path Aim:** Fulfills the multi-index hybrid search requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Query Routing and Intent Detection** (`lesson-query-routing`)
2.  **Context Fusion and Aggregation** (`lesson-context-fusion`)
3.  **Hybrid Indexing Strategies** (`lesson-hybrid-indexing`)

### Future Expansion

Future lessons may extend this module with topics such as sub-query translation engines, graph database indices, or metadata caching layers.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-query-routing-explanatory-text` (Explanatory Text)
*   `artifact-query-routing-visual-intuition` (Visual Intuition)
*   `artifact-query-routing-interactive-visualization` (Interactive Visualization)
*   `artifact-query-routing-exercise` (Exercise)
*   `artifact-query-routing-comparison-table` (Comparison Table)
*   `artifact-context-fusion-explanatory-text` (Explanatory Text)
*   `artifact-context-fusion-visual-intuition` (Visual Intuition)
*   `artifact-context-fusion-interactive-visualization` (Interactive Visualization)
*   `artifact-context-fusion-exercise` (Exercise)
*   `artifact-context-fusion-comparison-table` (Comparison Table)
*   `artifact-hybrid-indexing-explanatory-text` (Explanatory Text)
*   `artifact-hybrid-indexing-visual-intuition` (Visual Intuition)
*   `artifact-hybrid-indexing-interactive-visualization` (Interactive Visualization)
*   `artifact-hybrid-indexing-exercise` (Exercise)
*   `artifact-hybrid-indexing-comparison-table` (Comparison Table)

The module references these artifacts solely through the lesson compositions. It does not directly own, modify, or duplicate these artifacts.

## 6. Reuse Notes

All composed lessons may be reused in other module compositions if pedagogically appropriate.
All underlying Learning Artifacts remain independently reusable across other lessons.
Participation in this module does not alter the lifecycle, metadata, reuse semantics, dependencies, or governance status of any referenced lesson or learning artifact.

## Evidence Boundary

This Module organizes Lessons.

It does not generate Competency Evidence.

It does not certify mastery.

Assessments remain governed by NV-800-M4.

Competency Evidence remains governed by NV-800-M3.

## 8. Architectural Alignment

Learning Paths organize Modules.

Modules organize Lessons.

Lessons orchestrate Learning Artifacts.

Learning Artifacts support learning.

Assessments produce Competency Evidence.

Competencies remain the canonical unit of mastery.

## 9. Quality Checklist

- [ ] Lesson references validated.
- [ ] Lesson content not duplicated.
- [ ] Artifact content not duplicated.
- [ ] Module aim aligned with included lessons.
- [ ] Evidence boundary preserved.
- [ ] No assessment logic introduced.
- [ ] No mastery claims introduced.
- [ ] Future expansion does not create undeclared lessons.
- [ ] Reuse implications documented.

## 10. Architectural Foundations

*   NV-800-M5 — Canonical Lesson Architecture
*   NV-800-M6 — Canonical Module & Learning Path Architecture
*   NV-800-M7 — Canonical Learning Artifact Architecture
*   NV-800-C1 — Seed Learning Artifacts
*   NV-800-C2 — First Canonical Lesson Composition
*   NV-800-C3 — Canonical Module Composition
*   NV-800-C4 — Canonical Learning Path Composition
*   NV-800-C5 — Canonical Foundation Content Pack (Wave 1)
*   NV-800-C6 — Canonical Content Review & Promotion (Wave 1)
*   NV-800-C7 — Canonical Foundation Content Pack (Wave 2)
*   NV-800-C8 — Canonical Foundation Content Pack (Wave 3: Mathematical Foundations)
*   NV-800-C9 — Canonical Foundation Content Pack (Wave 4: Statistics & Probability Foundations)
*   NV-800-C10 — Canonical Foundation Content Pack (Wave 5: Machine Learning Foundations)
*   NV-800-C11 — Canonical Foundation Content Pack (Wave 6: Deep Learning Foundations)
*   NV-800-C12 — Canonical Foundation Content Pack (Wave 7: Computer Vision Foundations)
*   NV-800-C13 — Canonical Foundation Content Pack (Wave 8: Convolutional Neural Networks)
*   NV-800-C14 — Canonical Foundation Content Pack (Wave 9: Object Detection Foundations)
*   NV-800-C15 — Canonical Foundation Content Pack (Wave 10: Semantic & Instance Segmentation Foundations)
*   NV-800-C16 — Canonical Foundation Content Pack (Wave 11: Transformer Foundations)
*   NV-800-C17 — Canonical Foundation Content Pack (Wave 12: Large Language Model Foundations)
*   NV-800-C18 — Canonical Foundation Content Pack (Wave 13: Fine-Tuning & Adaptation)
*   NV-800-C19 — Canonical Foundation Content Pack (Wave 14: AI Agents & Tool Use)
*   NV-800-C20 — Canonical Foundation Content Pack (Wave 15: Multimodal AI Foundations)
