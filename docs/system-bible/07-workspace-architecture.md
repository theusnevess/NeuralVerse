# Workspace Architecture

## Reading Shell

The workspace is the primary reading and study environment. It is rendered by `curriculum-controller.js` when a user navigates to an artifact, lesson, or the workspace dashboard (`#/workspace`).

## Three-Column Layout

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│   Left Column   │     Center Column        │  Right Column   │
│   (Outline)     │     (Content)            │  (Metadata)     │
│                 │                          │                 │
│ • Lesson TOC    │ • Artifact Markdown      │ • Type badge    │
│ • Artifact list │   rendered as HTML       │ • Status badge  │
│   with check    │ • Cross-link cards       │ • Duration      │
│   marks         │ • Dependency sections    │ • Objectives    │
│ • Progress      │ • Prev/Next nav          │ • Notes         │
│   indicators    │                          │ • Tags          │
│                 │                          │ • Collections   │
│                 │                          │ • Highlights    │
│                 │                          │ • Bookmark btn  │
└─────────────────┴──────────────────────────┴─────────────────┘
```

## Outline (Left Column)

The outline shows the lesson structure:
- Lesson overview link
- All artifacts in the lesson in order
- Current artifact is highlighted
- Progress indicators (Not Started / In Progress / Completed)
- Collapsible accordion behavior on mobile

## Metadata Sidebar (Right Column)

The metadata panel displays:
- Artifact type with color-coded badge
- Lifecycle status with governance tooltip
- Estimated reading duration
- Instructional objectives
- Personalization controls: notes textarea, tags input, collections checkboxes, bookmark toggle, highlight tools
- Reading progress dropdown

## Personalization Integration

The workspace integrates deeply with the personalization system:

- **Notes**: Textarea with Markdown preview, auto-saved per artifact
- **Tags**: Badge-based tag input with remove buttons
- **Collections**: Checkbox list to add/remove from study collections
- **Favorites**: Star toggle
- **Highlights**: Paragraph-level color picker on hover
- **Reading progress**: Dropdown to mark status
- **Reading bookmarks**: Position-based bookmarks within long artifacts

## Continue Reading

When a user navigates away from an artifact and returns, the "Continue Reading" feature restores their scroll position. The workspace dashboard (`#/workspace`) shows a "Continue Reading" banner with a "Resume" link, displaying time since last viewed.

## Sticky Layout

The reading view uses a sticky header that remains fixed at the top:
- Artifact title
- Type badge and status badge
- "Back to Lesson" link
- Reading progress bar

The header ensures the learner always knows their position and can navigate back to the lesson context.

## Markdown Rendering

Markdown is converted to HTML via `curriculum-controller.js:markdownToHtml()`:
- Headings H2-H4
- Unordered and ordered lists
- Code blocks (with copy button)
- Tables (wrapped in scrollable containers)
- Blockquotes
- Inline formatting: bold, italic, code, links
- Exercise sections: "Learner Task", "Expected Learner Output", "Reasoning Guidance" are wrapped in structured containers

## Previous/Next Navigation

At the bottom of every artifact page:
- "Previous" and "Next" buttons navigating to adjacent artifacts in the lesson
- Artifact position indicator: "Artifact X of Y"
- The Curriculum Dependency Agent (A2) also provides "show next" and "show previous" guidance

## Study Tools

The workspace provides:
- Bookmark button (star icon)
- Reading progress dropdown
- Highlight tools (per-paragraph color picker)
- Notes panel with auto-save
- Tags collection
- Study queue integration

## Related Chapters

- [Learning Experience](06-learning-experience.md)
- [Personalization System](22-personalization-system.md)
- [Study Sessions](23-study-sessions.md)
- [UI Design Language](24-ui-design-language.md)
