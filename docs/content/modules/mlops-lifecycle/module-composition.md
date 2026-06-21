---
module_id: "module-mlops-lifecycle"
module_title: "MLOps Lifecycle"
canonical_status: "Reviewed"
module_type: "Core Module"

lesson_ids:
  - lesson-ml-pipelines-and-orchestration
  - lesson-model-versioning-and-experiment-tracking
  - lesson-deployment-strategies-and-rollbacks

artifact_scope:
  - artifact-ml-pipelines-and-orchestration-explanatory-text
  - artifact-ml-pipelines-and-orchestration-visual-intuition
  - artifact-ml-pipelines-and-orchestration-interactive-visualization
  - artifact-ml-pipelines-and-orchestration-exercise
  - artifact-ml-pipelines-and-orchestration-comparison-table
  - artifact-model-versioning-and-experiment-tracking-explanatory-text
  - artifact-model-versioning-and-experiment-tracking-visual-intuition
  - artifact-model-versioning-and-experiment-tracking-interactive-visualization
  - artifact-model-versioning-and-experiment-tracking-exercise
  - artifact-model-versioning-and-experiment-tracking-comparison-table
  - artifact-deployment-strategies-and-rollbacks-explanatory-text
  - artifact-deployment-strategies-and-rollbacks-visual-intuition
  - artifact-deployment-strategies-and-rollbacks-interactive-visualization
  - artifact-deployment-strategies-and-rollbacks-exercise
  - artifact-deployment-strategies-and-rollbacks-comparison-table
---

# MLOps Lifecycle — Module Composition

## 1. Purpose

This module organizes lessons covering the MLOps lifecycle, focusing on ML pipelines and workflow orchestration, model versioning and experiment tracking for reproducibility, and deployment strategies with rollback mechanisms for safe production releases.

It provides an organizational boundary for pipeline design, experiment management, and deployment strategy concepts without duplicating any instructional content.

## 2. Module Learning Aim

Introduce learners to the MLOps lifecycle, including ML pipeline design and workflow orchestration, model versioning and experiment tracking for reproducibility, and deployment strategies with rollback mechanisms for safe production releases.

## 3. Included Lessons

### 3.1 ML Pipelines and Orchestration

*   **Lesson ID:** `lesson-ml-pipelines-and-orchestration`
*   **Location:** `docs/content/lessons/ml-pipelines-and-orchestration/lesson-composition.md`
*   **Pedagogical Role:** Teaches pipeline design principles, workflow orchestration frameworks, CI/CD integration for ML, failure handling and retry strategies.
*   **Relationship to Module Aim:** Fulfills the pipeline and orchestration requirement of the learning aim.

### 3.2 Model Versioning and Experiment Tracking

*   **Lesson ID:** `lesson-model-versioning-and-experiment-tracking`
*   **Location:** `docs/content/lessons/model-versioning-and-experiment-tracking/lesson-composition.md`
*   **Pedagogical Role:** Details versioning strategies for models and datasets, experiment tracking tools and metadata logging, model registry concepts, and lineage tracking.
*   **Relationship to Module Aim:** Fulfills the versioning and experiment tracking requirement of the learning aim.

### 3.3 Deployment Strategies and Rollbacks

*   **Lesson ID:** `lesson-deployment-strategies-and-rollbacks`
*   **Location:** `docs/content/lessons/deployment-strategies-and-rollbacks/lesson-composition.md`
*   **Pedagogical Role:** Focuses on blue-green deployments, canary releases, shadow deployment, progressive delivery, and rollback mechanisms for safe production releases.
*   **Relationship to Module Aim:** Fulfills the deployment strategies and rollbacks requirement of the learning aim.

This module composition does not duplicate any of the instructional content or text from the lesson compositions themselves.

## 4. Module Composition Flow

The module structures lessons in the following sequence:

1.  **ML Pipelines and Orchestration** (`lesson-ml-pipelines-and-orchestration`)
2.  **Model Versioning and Experiment Tracking** (`lesson-model-versioning-and-experiment-tracking`)
3.  **Deployment Strategies and Rollbacks** (`lesson-deployment-strategies-and-rollbacks`)

### Future Expansion

Future lessons may extend this module with topics such as MLOps compliance automation, multi-cloud model deployment, or model cost governance.

*Note: These future lessons are not created or defined in this phase.*

## 5. Lesson-to-Artifact Trace

The module indirectly includes the following Learning Artifacts through its lessons:

*   `artifact-ml-pipelines-and-orchestration-explanatory-text` (Explanatory Text)
*   `artifact-ml-pipelines-and-orchestration-visual-intuition` (Visual Intuition)
*   `artifact-ml-pipelines-and-orchestration-interactive-visualization` (Interactive Visualization)
*   `artifact-ml-pipelines-and-orchestration-exercise` (Exercise)
*   `artifact-ml-pipelines-and-orchestration-comparison-table` (Comparison Table)
*   `artifact-model-versioning-and-experiment-tracking-explanatory-text` (Explanatory Text)
*   `artifact-model-versioning-and-experiment-tracking-visual-intuition` (Visual Intuition)
*   `artifact-model-versioning-and-experiment-tracking-interactive-visualization` (Interactive Visualization)
*   `artifact-model-versioning-and-experiment-tracking-exercise` (Exercise)
*   `artifact-model-versioning-and-experiment-tracking-comparison-table` (Comparison Table)
*   `artifact-deployment-strategies-and-rollbacks-explanatory-text` (Explanatory Text)
*   `artifact-deployment-strategies-and-rollbacks-visual-intuition` (Visual Intuition)
*   `artifact-deployment-strategies-and-rollbacks-interactive-visualization` (Interactive Visualization)
*   `artifact-deployment-strategies-and-rollbacks-exercise` (Exercise)
*   `artifact-deployment-strategies-and-rollbacks-comparison-table` (Comparison Table)

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
*   NV-800-C23 — Canonical Foundation Content Pack (Wave 18: AI Safety, Alignment & Guardrails)
*   NV-800-C24 — Canonical Foundation Content Pack (Wave 19: Production AI Systems & MLOps)
