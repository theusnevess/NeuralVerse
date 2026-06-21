---
module_id: "module-rag-agent-evaluation"
module_title: "RAG & Agent Evaluation"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-rag-evaluation
  - lesson-hallucination-evaluation
  - lesson-agent-evaluation

artifact_scope:
  - artifact-rag-evaluation-explanatory-text
  - artifact-rag-evaluation-visual-intuition
  - artifact-rag-evaluation-interactive-visualization
  - artifact-rag-evaluation-exercise
  - artifact-rag-evaluation-comparison-table
  - artifact-hallucination-evaluation-explanatory-text
  - artifact-hallucination-evaluation-visual-intuition
  - artifact-hallucination-evaluation-interactive-visualization
  - artifact-hallucination-evaluation-exercise
  - artifact-hallucination-evaluation-comparison-table
  - artifact-agent-evaluation-explanatory-text
  - artifact-agent-evaluation-visual-intuition
  - artifact-agent-evaluation-interactive-visualization
  - artifact-agent-evaluation-exercise
  - artifact-agent-evaluation-comparison-table
---

# RAG & Agent Evaluation — Module Composition

## 1. Purpose

This module organizes lessons covering evaluation frameworks for Retrieval-Augmented Generation and AI agent systems, focusing on RAG evaluation dimensions (faithfulness, context precision, context recall, answer relevance), hallucination detection and analysis (intrinsic vs. extrinsic, grounding, verifiability), and agent evaluation methodologies (planning, tool use, multi-step execution, robustness).

It provides an organizational boundary for RAG quality metrics, hallucination taxonomies, and agent assessment frameworks without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to evaluation methodologies for RAG pipelines and AI agents, including RAG-specific quality metrics inspired by RAGAS, hallucination classification and detection approaches, and agent evaluation dimensions covering planning, tool use, and execution reliability.

This module aims to connect retrieval quality to generation faithfulness, output verifiability to hallucination risk, and agent actions to task completion metrics, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 RAG Evaluation Frameworks

*   **Lesson ID:** `lesson-rag-evaluation`
*   **Location:** `docs/content/lessons/rag-evaluation/lesson-composition.md`
*   **Pedagogical Role:** Teaches faithfulness, context precision, context recall, answer relevance metrics and their role in diagnosing RAG pipeline quality.
*   **Relationship to Module Aim:** Fulfills the RAG evaluation requirement of the learning aim.

### 3.2 Hallucination Detection and Analysis

*   **Lesson ID:** `lesson-hallucination-evaluation`
*   **Location:** `docs/content/lessons/hallucination-evaluation/lesson-composition.md`
*   **Pedagogical Role:** Details intrinsic and extrinsic hallucination types, NLI-based detection, grounding verification, and limitations of current methods.
*   **Relationship to Module Aim:** Fulfills the hallucination detection requirement of the learning aim.

### 3.3 Agent Evaluation Methodologies

*   **Lesson ID:** `lesson-agent-evaluation`
*   **Location:** `docs/content/lessons/agent-evaluation/lesson-composition.md`
*   **Pedagogical Role:** Focuses on planning quality, tool use accuracy, context retrieval, multi-step execution reliability, and robustness to edge cases.
*   **Relationship to Module Aim:** Fulfills the agent evaluation requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **RAG Evaluation Frameworks** (`lesson-rag-evaluation`)
2.  **Hallucination Detection and Analysis** (`lesson-hallucination-evaluation`)
3.  **Agent Evaluation Methodologies** (`lesson-agent-evaluation`)

### Future Expansion

Future lessons may extend this module with topics such as multi-modal RAG evaluation, long-context faithfulness assessment, or agentic workflow stress testing.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-rag-evaluation-explanatory-text` (Explanatory Text)
*   `artifact-rag-evaluation-visual-intuition` (Visual Intuition)
*   `artifact-rag-evaluation-interactive-visualization` (Interactive Visualization)
*   `artifact-rag-evaluation-exercise` (Exercise)
*   `artifact-rag-evaluation-comparison-table` (Comparison Table)
*   `artifact-hallucination-evaluation-explanatory-text` (Explanatory Text)
*   `artifact-hallucination-evaluation-visual-intuition` (Visual Intuition)
*   `artifact-hallucination-evaluation-interactive-visualization` (Interactive Visualization)
*   `artifact-hallucination-evaluation-exercise` (Exercise)
*   `artifact-hallucination-evaluation-comparison-table` (Comparison Table)
*   `artifact-agent-evaluation-explanatory-text` (Explanatory Text)
*   `artifact-agent-evaluation-visual-intuition` (Visual Intuition)
*   `artifact-agent-evaluation-interactive-visualization` (Interactive Visualization)
*   `artifact-agent-evaluation-exercise` (Exercise)
*   `artifact-agent-evaluation-comparison-table` (Comparison Table)

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
*   NV-800-C21 — Canonical Foundation Content Pack (Wave 16: Advanced RAG Foundations)
*   NV-800-C22 — Canonical Foundation Content Pack (Wave 17: LLM Evaluation & Benchmarking)
