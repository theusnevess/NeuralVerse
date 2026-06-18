# React Empty State Components

## Components

The reusable React empty-state primitives live in `react-build/src/components.jsx`:

- `NvEmptyState`
- `NvEmptyIllustration`
- `NvEmptyTitle`
- `NvEmptyDescription`
- `NvEmptyActions`

They render presentation only. Existing JavaScript still owns state, callbacks, persistence, routing, retrieval behavior, and graph behavior.

## Data Contract

`NvEmptyState` accepts serializable presentation data:

```jsx
<NvEmptyState
  icon="search"
  iconPath="assets/icons/scientific/search-discovery/search-constellation.svg"
  title="Start a new investigation"
  subtitle="Search references, models, papers, or research notes to begin exploration."
  actions={<NvButton>Focus search input</NvButton>}
/>
```

Use either `icon` for a registered semantic key or `iconPath` for an official SVG path. Do not pass domain objects into React.

## CTA Boundary

Actions call callbacks supplied by the existing JavaScript owner. React does not decide whether a search, pin, evidence compilation, or restore action is valid.

## Accessibility

The component uses a status region and decorative illustration by default. CTAs must be semantic buttons or links with visible focus states.

## Styling

Empty states use the shared `.nv-empty-state` family and Motion Foundation classes. Component styling must remain token-driven and compatible with the Global Background System.
