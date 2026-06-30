# Search System

## Overview

The curriculum search system (`curriculum-search.js`) provides a global search interface implemented as a modal dialog. It indexes all curriculum entities (paths, modules, lessons, artifacts) and provides client-side full-text search with weighted scoring, keyboard navigation, and personalization filters.

## Indexing

When the search controller initializes, it calls `buildFlatIndex()` which creates a single flat array of all searchable entities. Each entry contains:

```
{
  id, type, badgeLabel, title, summary,
  href (canonical route), breadcrumbs (hierarchy),
  searchableText (concatenated id + title + summary + type)
}
```

The flat index is rebuilt when the curriculum index loads. At current counts, this produces ~779 searchable items (19 paths + 40 modules + 120 lessons + 600 artifacts).

## Aliases

The search system maintains `SEARCH_QUERY_ALIASES`, a map that redirects common terms to more searchable equivalents:

- "linear regression" → "regression"
- "python" → "code"
- "pytorch" → "code"
- "tensorflow" → "code"
- "numpy" → "code"
- Various topic abbreviations and synonyms

## Matching Algorithm

The `performSearch()` function processes queries through:

1. **Normalization**: Lowercasing, NFD unicode normalization (accent removal), punctuation stripping
2. **Alias expansion**: Query terms are checked against alias map
3. **Field-level matching**: Each entity is scored against the searchable text
4. **Weighted scoring**:
   - Exact title match: 1000 points
   - Title includes query: 500 points
   - Summary match: 300 points
   - ID match: 200 points
   - Metadata match: 100 points
   - Bookmarked items: +150 boost
5. **Sorting**: Results sorted by score descending, capped at 100 results

## Filters

The search modal provides optional personalization filters:

- **Bookmarked** — Show only bookmarked items
- **Has notes** — Show only items with personal notes
- **Recently visited** — Show only recently visited items
- **In collection** — Show only items in a study collection

These filters interact with `window.NeuralVerse.PersonalizationService` to restrict results.

## Result Rendering

Each search result is rendered as an `<a role="option">` element containing:

- **Title** with `<mark>` highlighting around matching terms
- **Type badge** (color-coded: path=cyan, module=blue, lesson=amber, artifact=green)
- **Breadcrumb** lineage (e.g., "Path > Module > Lesson")
- **Summary** with highlighting
- **Match info badges** indicating which fields matched (title / summary / id / metadata)
- **"View in Graph" button** linking to `#/knowledge-graph?mode=...&focus=...`

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Ctrl+K` or `Cmd+K` | Open search modal |
| `Escape` | Close search modal |
| `Arrow Up/Down` | Navigate results |
| `Home/End` | Jump to first/last result |
| `Enter` | Open selected result |
| `Ctrl+Enter` | Open selected result in new tab |

## Modal Behavior

The search modal is a `<dialog>` element. Opening it:

- Sets focus to the search input
- Pre-fetches the curriculum index if not already loaded
- Shows an empty state with suggestion chips (common topics like "transformer", "convolution", "attention", "backpropagation", "reinforcement learning", "GAN", "BERT")

Typing debounces at 250ms before executing the search. Results appear below the input. Clicking the backdrop or pressing Escape closes the modal. On close, focus returns to the trigger button.

## Integration with Curriculum

The search system reads from the same `window.NeuralVerse.curriculumIndex` as the curriculum controller. It shares the `curriculum-service.js` data layer. Search results navigate to the same canonical hash routes used by the curriculum system.

## Related Chapters

- [Curriculum Architecture](05-curriculum-architecture.md)
- [Learning Experience](06-learning-experience.md)
- [Accessibility](25-accessibility.md)
