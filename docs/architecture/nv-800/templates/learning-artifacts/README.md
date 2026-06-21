# Learning Artifact Authoring Templates

## Purpose

These templates translate the canonical NV-800-M7 Learning Artifact Architecture into reusable Markdown scaffolds for Obsidian-oriented authorship.

They help authors create consistent Learning Artifacts without creating curriculum content, assessments, UI, backend logic, database schemas, validation engines, or Competency Evidence records.

## Directory Structure

```text
learning-artifacts/
├── README.md
├── instruction/
├── interactive/
├── practice/
└── reference/
```

Each subdirectory maps to one canonical artifact family from NV-800-M7 Phase 1.

## Phase Mapping

* Phase 1 defines the artifact taxonomy.
* Phase 2 defines the required and optional contract fields used by each template.
* Phase 3 supplies the canonical lifecycle status values.
* Phase 4 supplies the reuse mode placeholders.
* Phase 5 supplies instructional objectives, learning depths, and metadata expectations.
* Phase 6 supplies dependency relationship categories.
* Phase 7 supplies quality governance expectations.

## Allowed Frontmatter Values

### canonical_status

```text
Draft
Reviewed
Canonical
Deprecated
Archived
```

Default: `Draft`.

### reuse_mode

```text
Exact Reuse
Parameterized Reuse
Contextual Reuse
Derived Variant
```

Default: empty.

### instructional_objectives

```text
Introduce
Explain
Visualize
Demonstrate
Practice
Explore
Reflect
Transfer
Reference
```

### learning_depths

```text
Level 1 — Intuition
Level 2 — Foundations
Level 3 — Mathematics
Level 4 — Engineering
Level 5 — Optimization
Level 6 — Production
Level 7 — Research
```

### supported_learning_levels

```text
Beginner
Intermediate
Advanced
Professional
Research
```

### dependency categories

```text
prerequisite
recommended_before
recommended_after
complementary
alternative
```

## How Authors Should Use Templates

1. Copy the template that matches the intended canonical artifact type.
2. Fill only the fields and sections needed for that artifact instance.
3. Complete every field listed under `Required Contract Fields`.
4. Use optional enrichment fields only when they improve clarity, accessibility, or instructional value.
5. Keep `canonical_status` as `Draft` until the artifact has passed the appropriate governance process.
6. Leave `reuse_mode` empty unless reuse is intentionally governed.
7. Complete the quality checklist before requesting review.

## What Authors Must Not Do

Authors must not use these templates to create:

* assessments;
* quizzes;
* scoring rules;
* grading rules;
* Competency Evidence records;
* mastery certification;
* lifecycle automation;
* reuse engines;
* dependency graph engines;
* UI components;
* backend logic;
* database schemas;
* validation engines.

## Evidence Boundary

Learning Artifacts support learning.

Assessments generate Competency Evidence.

Competency Evidence determines Mastery.

A Learning Artifact template must never claim that it generates Competency Evidence or certifies mastery. If an artifact is used in an assessment context, that usage must be governed separately by NV-800-M4 and NV-800-M3.

## Lifecycle Default

Every template defaults to:

```yaml
canonical_status: "Draft"
```

This default is intentional. Authored artifacts become reviewed or canonical only through the appropriate governance process.

## Quality Review Expectation

Every template includes the same quality review checklist. The checklist protects technical accuracy, pedagogical clarity, terminology consistency, accessibility, maintainability, and the evidence boundary.
