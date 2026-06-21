---
module_id: "module-vector-retrieval-architectures"
module_title: "Vector Retrieval Architectures"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-vector-databases
  - lesson-rag-foundations

artifact_scope:
  - artifact-vector-databases-explanatory-text
  - artifact-vector-databases-visual-intuition
  - artifact-vector-databases-interactive-visualization
  - artifact-vector-databases-exercise
  - artifact-vector-databases-comparison-table
  - artifact-rag-foundations-explanatory-text
  - artifact-rag-foundations-visual-intuition
  - artifact-rag-foundations-interactive-visualization
  - artifact-rag-foundations-exercise
  - artifact-rag-foundations-comparison-table
---

# Vector Retrieval Architectures — Module Composition

## 1. Purpose

This module organizes multiple lessons related to vector storage systems and downstream retrieval augmentation workflows into a single coherent learning unit.

It provides an organizational boundary for advanced topics in vector databases and RAG pipelines without duplicating the instructional text of the underlying lessons.

## 2. Module Learning Aim

Introduce learners to vector storage engines, indexing strategies, metadata filtering, and Retrieval-Augmented Generation (RAG) loops as modern AI retrieval systems.

This module aims to connect vector search technology with LLM prompt integration, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Vector Databases

*   **Lesson ID:** `lesson-vector-databases`
*   **Location:** `docs/content/lessons/vector-databases/lesson-composition.md`
*   **Pedagogical Role:** Explains specialized vector databases, metadata filtering patterns, and query coordination.
*   **Relationship to Module Aim:** Fulfills the storage and metadata filtering requirements of the learning aim.

### 3.2 RAG Foundations

*   **Lesson ID:** `lesson-rag-foundations`
*   **Location:** `docs/content/lessons/rag-foundations/lesson-composition.md`
*   **Pedagogical Role:** Guides the learner through prompt augmentations, the context lookup cycle, and hallucination reduction.
*   **Relationship to Module Aim:** Fulfills the LLM generation connection requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Vector Databases** (`lesson-vector-databases`)
2.  **RAG Foundations** (`lesson-rag-foundations`)

### Future Expansion

Future lessons may extend this module with topics such as hybrid search, dense-sparse retrieval, multi-modal embeddings, agentic RAG, or query translation and routing.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-vector-databases-explanatory-text` (Explanatory Text)
*   `artifact-vector-databases-visual-intuition` (Visual Intuition)
*   `artifact-vector-databases-interactive-visualization` (Interactive Visualization)
*   `artifact-vector-databases-exercise` (Exercise)
*   `artifact-vector-databases-comparison-table` (Comparison Table)
*   `artifact-rag-foundations-explanatory-text` (Explanatory Text)
*   `artifact-rag-foundations-visual-intuition` (Visual Intuition)
*   `artifact-rag-foundations-interactive-visualization` (Interactive Visualization)
*   `artifact-rag-foundations-exercise` (Exercise)
*   `artifact-rag-foundations-comparison-table` (Comparison Table)

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
