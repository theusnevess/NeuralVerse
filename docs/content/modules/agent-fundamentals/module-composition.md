---
module_id: "module-agent-fundamentals"
module_title: "Agent Fundamentals"
canonical_status: "Draft"
module_type: "Core Module"

lesson_ids:
  - lesson-agentic-ai-fundamentals
  - lesson-planning-task-decomposition
  - lesson-tool-calling

artifact_scope:
  - artifact-agentic-ai-fundamentals-explanatory-text
  - artifact-agentic-ai-fundamentals-visual-intuition
  - artifact-agentic-ai-fundamentals-interactive-visualization
  - artifact-agentic-ai-fundamentals-exercise
  - artifact-agentic-ai-fundamentals-comparison-table
  - artifact-planning-task-decomposition-explanatory-text
  - artifact-planning-task-decomposition-visual-intuition
  - artifact-planning-task-decomposition-interactive-visualization
  - artifact-planning-task-decomposition-exercise
  - artifact-planning-task-decomposition-comparison-table
  - artifact-tool-calling-explanatory-text
  - artifact-tool-calling-visual-intuition
  - artifact-tool-calling-interactive-visualization
  - artifact-tool-calling-exercise
  - artifact-tool-calling-comparison-table
---

# Agent Fundamentals — Module Composition

## 1. Purpose

This module organizes foundational lessons related to perception-action loops, goal-directed planning, task decomposition frameworks (like ReAct), and the structured schemas and execution logic of tool calling and API interaction.

It provides an organizational boundary for state machines, reasoning tokens, and structured parameters without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the architectural core of AI agents, focusing on perception-action loops, goal-directed planning, task decomposition frameworks (like ReAct), and the structured schemas and execution logic of tool calling and API interaction.

This module aims to connect observations to next steps, complex prompts to structured lists of sub-goals, and tool schemas to argument extractions, without claiming or certifying competency mastery.

## 3. Included Lessons

### 3.1 Agentic AI Fundamentals

*   **Lesson ID:** `lesson-agentic-ai-fundamentals`
*   **Location:** `docs/content/lessons/agentic-ai-fundamentals/lesson-composition.md`
*   **Pedagogical Role:** Teaches the difference between text-continuation and continuous execution loop states.
*   **Relationship to Module Aim:** Fulfills the foundational agentic concepts requirement of the learning aim.

### 3.2 Planning and Task Decomposition

*   **Lesson ID:** `lesson-planning-task-decomposition`
*   **Location:** `docs/content/lessons/planning-task-decomposition/lesson-composition.md`
*   **Pedagogical Role:** Details ReAct alternating sequences, planning verification steps, and recursive sub-task divisions.
*   **Relationship to Learning Path Aim:** Fulfills the agentic planning strategies requirement of the learning aim.

### 3.3 Tool Calling and External Actions

*   **Lesson ID:** `lesson-tool-calling`
*   **Location:** `docs/content/lessons/tool-calling/lesson-composition.md`
*   **Pedagogical Role:** Focuses on tool registrations, JSON schemas, argument parsed payloads, and loop executor returns.
*   **Relationship to Learning Path Aim:** Fulfills the external integrations requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **Agentic AI Fundamentals** (`lesson-agentic-ai-fundamentals`)
2.  **Planning and Task Decomposition** (`lesson-planning-task-decomposition`)
3.  **Tool Calling and External Actions** (`lesson-tool-calling`)

### Future Expansion

Future lessons may extend this module with topics such as agentic loop token budget constraints, plan repair heuristics, or specialized function registry designs.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-agentic-ai-fundamentals-explanatory-text` (Explanatory Text)
*   `artifact-agentic-ai-fundamentals-visual-intuition` (Visual Intuition)
*   `artifact-agentic-ai-fundamentals-interactive-visualization` (Interactive Visualization)
*   `artifact-agentic-ai-fundamentals-exercise` (Exercise)
*   `artifact-agentic-ai-fundamentals-comparison-table` (Comparison Table)
*   `artifact-planning-task-decomposition-explanatory-text` (Explanatory Text)
*   `artifact-planning-task-decomposition-visual-intuition` (Visual Intuition)
*   `artifact-planning-task-decomposition-interactive-visualization` (Interactive Visualization)
*   `artifact-planning-task-decomposition-exercise` (Exercise)
*   `artifact-planning-task-decomposition-comparison-table` (Comparison Table)
*   `artifact-tool-calling-explanatory-text` (Explanatory Text)
*   `artifact-tool-calling-visual-intuition` (Visual Intuition)
*   `artifact-tool-calling-interactive-visualization` (Interactive Visualization)
*   `artifact-tool-calling-exercise` (Exercise)
*   `artifact-tool-calling-comparison-table` (Comparison Table)

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
