---
module_id: "module-agentic-retrieval-systems"
module_title: "Agentic Retrieval Systems"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-agentic-rag
  - lesson-knowledge-grounding
  - lesson-retrieval-failure-mitigation

artifact_scope:
  - artifact-agentic-rag-explanatory-text
  - artifact-agentic-rag-visual-intuition
  - artifact-agentic-rag-interactive-visualization
  - artifact-agentic-rag-exercise
  - artifact-agentic-rag-comparison-table
  - artifact-knowledge-grounding-explanatory-text
  - artifact-knowledge-grounding-visual-intuition
  - artifact-knowledge-grounding-interactive-visualization
  - artifact-knowledge-grounding-exercise
  - artifact-knowledge-grounding-comparison-table
  - artifact-retrieval-failure-mitigation-explanatory-text
  - artifact-retrieval-failure-mitigation-visual-intuition
  - artifact-retrieval-failure-mitigation-interactive-visualization
  - artifact-retrieval-failure-mitigation-exercise
  - artifact-retrieval-failure-mitigation-comparison-table
---

# Agentic Retrieval Systems — Module Composition

## 1. Purpose

This module organizes lessons related to loop-based agentic retrieval architectures, focusing on Self-RAG and Corrective RAG (CRAG) iteration patterns, knowledge grounding and factual citation attribution, and the taxonomy of retrieval failure modes with their corresponding engineering mitigations.

It provides an organizational boundary for loop state transitions, citation schemas, and failure type classifications without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to loop-based agentic retrieval architectures, focusing on Self-RAG and Corrective RAG (CRAG) iteration patterns, knowledge grounding and factual citation attribution, and the taxonomy of retrieval failure modes with their corresponding engineering mitigations.

This module aims to connect static RAG flows to dynamic critique loops, source chunks to citation IDs, and failure symptoms to mitigation patterns, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Agentic Retrieval Systems

*   **Lesson ID:** `lesson-agentic-rag`
*   **Location:** `docs/content/lessons/agentic-rag/lesson-composition.md`
*   **Pedagogical Role:** Teaches retrieval tool calls, active generation loops, evaluation states, Self-RAG frameworks, and CRAG transitions.
*   **Relationship to Module Aim:** Fulfills the agentic RAG loop requirement of the learning aim.

### 3.2 Knowledge Grounding and Attribution

*   **Lesson ID:** `lesson-knowledge-grounding`
*   **Location:** `docs/content/lessons/knowledge-grounding/lesson-composition.md`
*   **Pedagogical Role:** Details grounding boundaries, NLI factual classifiers, citation injection formats, and source mapping schemas.
*   **Relationship to Learning Path Aim:** Fulfills the knowledge grounding requirement of the learning aim.

### 3.3 Retrieval Failure Modes and Mitigation

*   **Lesson ID:** `lesson-retrieval-failure-mitigation`
*   **Location:** `docs/content/lessons/retrieval-failure-mitigation/lesson-composition.md`
*   **Pedagogical Role:** Focuses on omission, noise, lost-in-the-middle, and empty retrieval failure patterns and their countermeasures.
*   **Relationship to Learning Path Aim:** Fulfills the failure mitigation requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Agentic Retrieval Systems** (`lesson-agentic-rag`)
2.  **Knowledge Grounding and Attribution** (`lesson-knowledge-grounding`)
3.  **Retrieval Failure Modes and Mitigation** (`lesson-retrieval-failure-mitigation`)

### Future Expansion

Future lessons may extend this module with topics such as multi-step plan verification, memory-augmented agentic RAG, or graph-based grounding systems.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-agentic-rag-explanatory-text` (Explanatory Text)
*   `artifact-agentic-rag-visual-intuition` (Visual Intuition)
*   `artifact-agentic-rag-interactive-visualization` (Interactive Visualization)
*   `artifact-agentic-rag-exercise` (Exercise)
*   `artifact-agentic-rag-comparison-table` (Comparison Table)
*   `artifact-knowledge-grounding-explanatory-text` (Explanatory Text)
*   `artifact-knowledge-grounding-visual-intuition` (Visual Intuition)
*   `artifact-knowledge-grounding-interactive-visualization` (Interactive Visualization)
*   `artifact-knowledge-grounding-exercise` (Exercise)
*   `artifact-knowledge-grounding-comparison-table` (Comparison Table)
*   `artifact-retrieval-failure-mitigation-explanatory-text` (Explanatory Text)
*   `artifact-retrieval-failure-mitigation-visual-intuition` (Visual Intuition)
*   `artifact-retrieval-failure-mitigation-interactive-visualization` (Interactive Visualization)
*   `artifact-retrieval-failure-mitigation-exercise` (Exercise)
*   `artifact-retrieval-failure-mitigation-comparison-table` (Comparison Table)

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
