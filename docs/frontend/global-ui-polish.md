# Global UI Polish

NV-700 streamlines the visible NeuralVerse interface so user-facing screens feel like a finished research platform instead of an implementation prototype.

## Removed From The Visible UI

- Route labels duplicated by page content.
- Development status text such as system connection and milestone names.
- Prototype copy that referenced MVP status or local state implementation.
- Internal retrieval architecture names in the research pipeline panel.

## Current Rules

- Page fragments may keep semantic headings as visually hidden text for accessibility, but route labels should not appear as decorative top-left text.
- User-facing copy should describe research and learning outcomes, not internal architecture.
- Secondary context belongs in compact panels or details disclosures, not in always-visible route headers.
- Debug labels, milestone identifiers, and runtime diagnostics must stay behind explicit debug mode.

## QA Expectations

- No route should show a redundant page label in the upper-left workspace area.
- Navigation remains keyboard accessible and keeps clear active state.
- The global background remains mounted after SPA navigation.
- Retrieval flows, context menus, and React islands remain functionally unchanged.
