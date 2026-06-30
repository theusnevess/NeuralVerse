# Learning Experience

## Discovery Flow

The learning experience begins at the Learning Paths index (`#/learning`), which displays all 19 Learning Paths as cards in a 2-column grid. Each card shows:

- Title and summary
- Lifecycle status badge (Draft/Reviewed)
- Module count
- Duration estimate
- Top border color indicating lifecycle status

A filter bar allows toggling between All, Reviewed, and Draft paths. Cards are sorted with Reviewed paths first.

## Overview Pages

### Learning Path Detail (`#/learning/<pathId>`)

Shows the path's modules as a filterable collection. An optional hero section displays the path's full description. The stat grid shows Reviewed vs Draft module counts.

### Module Detail (`#/learning/<pathId>/module/<moduleId>`)

Shows the module's lessons as a filterable collection with lesson-level metadata.

### Modules Index (`#/modules`)

Displays all 40 modules from across all paths as a flat filterable collection.

## Lesson Navigation

### Lesson Detail (`#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>`)

Shows the lesson's artifacts in a flow visualization — a 5-step canonical learning flow:

1. Introduction
2. Reading
3. Visualization (if applicable)
4. Exercise (if applicable)
5. Summary

Each step is marked active based on the current artifact type. Artifacts are listed with their type badges, status badges, and estimated duration.

## Artifact Reading

### Artifact Detail (`#/learning/<pathId>/module/<moduleId>/lesson/<lessonId>/artifact/<artifactId>`)

The reading view uses a 3-column workspace layout:

```
┌──────────┬─────────────────────────────┬────────────────┐
│ Outline  │      Main Content           │   Metadata     │
│ (Lesson  │     (Markdown HTML)         │   (Type,       │
│  TOC +   │                             │    Status,     │
│  Artifact│                             │    Duration,   │
│  list)   │                             │    Objectives) │
└──────────┴─────────────────────────────┴────────────────┘
```

Below the content:
- **Parent lineage** — "Part of: Path > Module > Lesson"
- **Sibling artifacts** — Other artifacts in the same lesson
- **Dependencies** — Prerequisites, complementary resources, recommended before/after, alternatives
- **Cross-link cards** — Cards linking to related content with route and description
- **Previous/Next navigation** — Footer with artifact position counter

## Reading Continuity

The reading experience includes:
- **Sticky header** — Shows artifact title, type badge, status badge, and "Back to Lesson" link
- **Progress bar** — Thin bar under the header that fills as the learner scrolls
- **Table of Contents** — Extracted from H2/H3/H4 headings; desktop sidebar and mobile accordion
- **Section quick navigation** — Prev section, next section, top buttons
- **Copy code buttons** — On code blocks with "Copy" / "Copied!" feedback
- **Focus mode** — Hides sidebar and metadata column for distraction-free reading

## Study Workflow

Learners can integrate artifacts into a study workflow:
1. **Bookmark** — Mark artifacts for later review
2. **Add to queue** — Add to study queue from artifact pages
3. **Take notes** — Per-artifact Markdown notes with preview
4. **Track progress** — Mark as Not Started / In Progress / Completed
5. **Study sessions** — Start a timed session that tracks visited resources, notes, and completed items
6. **Highlight** — Paragraph-level highlights in yellow or green

## Related Chapters

- [Curriculum Architecture](05-curriculum-architecture.md)
- [Workspace Architecture](07-workspace-architecture.md)
- [Personalization System](22-personalization-system.md)
- [Study Sessions](23-study-sessions.md)
