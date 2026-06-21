---
lesson_id: "lesson-jailbreak-techniques"
lesson_title: "Jailbreak Techniques"
canonical_status: "Draft"
topic: "Jailbreak Techniques"
artifact_ids:
  - artifact-jailbreak-techniques-explanatory-text
  - artifact-jailbreak-techniques-visual-intuition
  - artifact-jailbreak-techniques-interactive-visualization
  - artifact-jailbreak-techniques-exercise
  - artifact-jailbreak-techniques-comparison-table
---

# Jailbreak Techniques — Lesson Composition

## 1. Purpose

This lesson orchestrates reusable Learning Artifacts into a coherent learning experience about Jailbreak Techniques.

The lesson is not a monolithic instructional document. It references independent artifacts, assigns each artifact a pedagogical role, and defines a recommended learning flow.

## 2. Learning Goal

After completing this lesson flow, the learner should understand the categories of jailbreak techniques, how they bypass model alignment, and the defense strategies used to mitigate them.

## 3. Covered Concepts

*   Categories of jailbreak techniques (role-playing, encoding bypass, hypothetical framing, multi-turn manipulation, refusal suppression);
*   Common patterns such as DAN, character roleplay, and token manipulation;
*   Defense strategies including refusal training, input normalization, consistency checks, and stacked defense layers.

## 4. Artifact Composition

### 4.1 Explanatory Text

Artifact: `artifact-jailbreak-techniques-explanatory-text`
Role: Introduces the core terminology and establishes the landscape of jailbreak categories and defense strategies.

### 4.2 Visual Intuition

Artifact: `artifact-jailbreak-techniques-visual-intuition`
Role: Provides the lockpicker analogy to build a mental model of how different techniques bypass different defenses.

### 4.3 Interactive Visualization

Artifact: `artifact-jailbreak-techniques-interactive-visualization`
Role: Outlines an interactive classifier spec where learners can craft prompts and observe defense layer responses.

### 4.4 Exercise

Artifact: `artifact-jailbreak-techniques-exercise`
Role: Practice classifying real jailbreak patterns and proposing defense strategies.

### 4.5 Comparison Table

Artifact: `artifact-jailbreak-techniques-comparison-table`
Role: Consolidates the lesson with a structural comparative reference across all jailbreak categories.

## 5. Composition Rationale

### 5.1 Recommended Learning Flow Map

```text
Recommended Learning Flow

Explanatory Text
        ↓
Visual Intuition
        ↓
Interactive Visualization
        ↓
Exercise
        ↓
Comparison Table
```

### 5.2 Rationale Details

The sequence begins with explanation to establish vocabulary and define jailbreak categories. Visual intuition follows to create a concrete mental model. The interactive classifier spec provides exploration space, preparing the learner for the classification exercise. The comparison table consolidates all categories as a reference.

## 6. Dependency Notes

This lesson follows the dependency recommendations encoded in the referenced artifacts:
* explanatory text first;
* visual intuition second;
* interactive visualization third;
* exercise fourth;
* comparison table for consolidation.

## 7. Reuse Notes

All referenced Learning Artifacts remain independently reusable.
Participation in this lesson does not alter the lifecycle, metadata, reuse semantics, or governance status of any referenced artifact.
Lesson compositions are not required to include every artifact. Artifacts may classify and regress independently in different instructional contexts.

## Evidence Boundary

This Lesson orchestrates Learning Artifacts.
It does not generate Competency Evidence.
It does not certify mastery.
Assessments remain governed by NV-800-M4.
Competency Evidence remains governed by NV-800-M3.

## 9. Architectural Alignment

Learning Paths organize Modules.
Modules organize Lessons.
Lessons orchestrate Learning Artifacts.
Learning Artifacts support learning.
Assessments produce Competency Evidence.
Competencies remain the canonical unit of mastery.

## 10. Quality Checklist

- [ ] Artifact references validated.
- [ ] Composition order reviewed.
- [ ] No duplicated instructional content.
- [ ] Evidence boundary preserved.
- [ ] No assessment logic introduced.
- [ ] No mastery claims introduced.
- [ ] Reuse opportunities documented.
- [ ] Dependency recommendations respected.

## 11. Architectural Foundations

*   NV-800-M5 — Canonical Lesson Architecture
*   NV-800-M6 — Canonical Module & Learning Path Architecture
*   NV-800-M7 — Canonical Learning Artifact Architecture
*   NV-800-M8 — Canonical Artifact Registry Architecture
*   NV-800-C1 — Seed Learning Artifacts
*   NV-800-C2 — First Canonical Lesson Composition
*   NV-800-C23 — AI Safety, Alignment & Guardrails
