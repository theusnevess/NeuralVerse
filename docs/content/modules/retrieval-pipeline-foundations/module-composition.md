---
module_id: "module-retrieval-pipeline-foundations"
module_title: "Retrieval Pipeline Foundations"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-chunking-strategies
  - lesson-embedding-models
  - lesson-query-expansion-reformulation

artifact_scope:
  - artifact-chunking-strategies-explanatory-text
  - artifact-chunking-strategies-visual-intuition
  - artifact-chunking-strategies-interactive-visualization
  - artifact-chunking-strategies-exercise
  - artifact-chunking-strategies-comparison-table
  - artifact-embedding-models-explanatory-text
  - artifact-embedding-models-visual-intuition
  - artifact-embedding-models-interactive-visualization
  - artifact-embedding-models-exercise
  - artifact-embedding-models-comparison-table
  - artifact-query-expansion-reformulation-explanatory-text
  - artifact-query-expansion-reformulation-visual-intuition
  - artifact-query-expansion-reformulation-interactive-visualization
  - artifact-query-expansion-reformulation-exercise
  - artifact-query-expansion-reformulation-comparison-table
---

# Retrieval Pipeline Foundations — Module Composition

## 1. Purpose

This module organizes multiple lessons related to initial data ingestion, representation, and query pre-processing stages of modern retrieval pipelines.

It provides an organizational boundary for chunking, embeddings, and query translation/expansion without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the first stages of modern retrieval pipelines: splitting unstructured documents, selecting suitable embedding models, and preprocessing raw user queries.

This module aims to connect vector ingestion, representation, and query translation workflows, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Chunking Strategies

*   **Lesson ID:** `lesson-chunking-strategies`
*   **Location:** `docs/content/lessons/chunking-strategies/lesson-composition.md`
*   **Pedagogical Role:** Explains how to partition raw unstructured text into tokens/chars, balancing boundaries, overlap, and topic segments.
*   **Relationship to Module Aim:** Fulfills the document splitting and data preparation requirement of the learning aim.

### 3.2 Embedding Models

*   **Lesson ID:** `lesson-embedding-models`
*   **Location:** `docs/content/lessons/embedding-models/lesson-composition.md`
*   **Pedagogical Role:** Compares dense, sparse, and late-interaction vector encoder models, details dimensionality impacts, and guides model selection.
*   **Relationship to Module Aim:** Fulfills the embedding representation and model selection requirement of the learning aim.

### 3.3 Query Expansion and Reformulation

*   **Lesson ID:** `lesson-query-expansion-reformulation`
*   **Location:** `docs/content/lessons/query-expansion-reformulation/lesson-composition.md`
*   **Pedagogical Role:** Teaches synonym-based search expansion, conversational pronoun reformulation, and HyDE search techniques.
*   **Relationship to Module Aim:** Fulfills the query pre-processing and translation requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Chunking Strategies** (`lesson-chunking-strategies`)
2.  **Embedding Models** (`lesson-embedding-models`)
3.  **Query Expansion and Reformulation** (`lesson-query-expansion-reformulation`)

### Future Expansion

Future lessons may extend this module with topics such as advanced parser systems, metadata schema extraction, dynamic sliding window chunking, or fine-tuning local embedding models.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-chunking-strategies-explanatory-text` (Explanatory Text)
*   `artifact-chunking-strategies-visual-intuition` (Visual Intuition)
*   `artifact-chunking-strategies-interactive-visualization` (Interactive Visualization)
*   `artifact-chunking-strategies-exercise` (Exercise)
*   `artifact-chunking-strategies-comparison-table` (Comparison Table)
*   `artifact-embedding-models-explanatory-text` (Explanatory Text)
*   `artifact-embedding-models-visual-intuition` (Visual Intuition)
*   `artifact-embedding-models-interactive-visualization` (Interactive Visualization)
*   `artifact-embedding-models-exercise` (Exercise)
*   `artifact-embedding-models-comparison-table` (Comparison Table)
*   `artifact-query-expansion-reformulation-explanatory-text` (Explanatory Text)
*   `artifact-query-expansion-reformulation-visual-intuition` (Visual Intuition)
*   `artifact-query-expansion-reformulation-interactive-visualization` (Interactive Visualization)
*   `artifact-query-expansion-reformulation-exercise` (Exercise)
*   `artifact-query-expansion-reformulation-comparison-table` (Comparison Table)

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
