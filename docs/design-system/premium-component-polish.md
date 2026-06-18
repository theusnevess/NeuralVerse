# Premium Component Polish

## Purpose

NV-600.3 defines the shared visual polish layer for reusable NeuralVerse UI components. The goal is perceived quality through consistency, rhythm, and long-session readability.

This phase does not introduce product behavior. It refines presentation only.

## Core Principle

Visual refinement should improve comprehension before aesthetics.

## Component Families

The polish layer applies to:

- Cards
- Panels
- Buttons
- Badges
- Chips
- Metrics
- Microvisualizations
- Discovery Panels
- Memory Cards
- Inspector Sections
- Workspace Snapshot
- Hover Preview
- Context Menu
- Empty States
- Scientific Icon wrappers

## Shared Geometry

Cards and panels use:

- `--sys-premium-radius-card`
- `--sys-premium-radius-panel`
- `--sys-premium-inset-card`
- `--sys-premium-inset-card-compact`
- `--sys-premium-gap-card`

Heavy outlines and dramatic shadows are forbidden.

## Surfaces

Premium surfaces consume:

- `--sys-premium-surface`
- `--sys-premium-surface-quiet`
- `--sys-premium-surface-hover`
- `--sys-premium-border`
- `--sys-premium-border-strong`

No component should introduce a page-specific background hack.

## Motion

Motion must consume NV-600.1 tokens:

- `--motion-duration-hover`
- `--motion-duration-state`
- `--motion-easing-standard`

Allowed:

- subtle hover contrast
- restrained border transition
- small elevation transition

Forbidden:

- bounce
- elastic motion
- pulse loops
- tilt
- large scale effects

## Background Compatibility

Components must remain legible on NV-600.2 backgrounds without local corrective overlays. Premium component surfaces are translucent but still preserve text contrast.

## Accessibility

The polish layer preserves:

- semantic controls
- focus-visible rings
- keyboard navigation
- reduced motion
- text-supported metrics

No meaning may rely on color alone.
