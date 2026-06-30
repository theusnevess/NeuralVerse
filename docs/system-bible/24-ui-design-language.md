# UI Design Language

## Overview

NeuralVerse follows a dark scientific aesthetic designed to evoke a premium AI research environment. The design emphasizes clarity, precision, and low visual noise.

## Design Principles

- Dark scientific interface
- Precise spacing and alignment
- Subtle cyan/blue accents
- Elegant cards with restrained borders
- Minimal animation, purposeful motion
- Low visual noise
- No generic AI clichés, mascots, or excessive gradients

## Color System

The color system is defined in `tokens.css` with three layers:

### Reference Tokens
- Neutral scale: 50 (lightest) through 950 (darkest)
- Primary blue/cyan scale
- Semantic colors: success (green), warning (amber), error (red), info (blue)
- Accent colors for specific use cases

### Semantic Tokens
- Surface colors (backgrounds, cards, overlays)
- Text colors (primary, secondary, tertiary, inverse)
- Accent colors (default, hover, active, muted)
- Border colors (default, hover, focus)
- Status colors (success, warning, error, info)

### Context Tokens
- Shell (header, nav rail, main surface)
- Workspace (content, sidebar, metadata)
- Reading (text, background, highlight)
- Overlay (dialog, tooltip, modal)

## Typography

- System font stack for optimal performance
- `Inter` as the primary UI font
- Monospace for code blocks (`ui-monospace`, `SF Mono`, etc.)
- Typographic scale defined through CSS custom properties
- Code font size slightly smaller than body text for readability

## Spacing

A consistent spacing scale is defined through CSS custom properties:
- `--nv-space-1` through `--nv-space-16`
- Based on 4px increments (4px, 8px, 12px, 16px, 24px, 32px, etc.)
- All components use these tokens for consistent vertical and horizontal rhythm

## Card Language

Cards follow a consistent structure:
- Subtle background (slightly lighter than the main surface)
- Optional top border indicating lifecycle status (green for Reviewed)
- Title, summary, metadata footer
- Type badge (color-coded by entity type)
- Hover state with subtle elevation change
- Consistent padding and border radius

## Color Coding

Entity types are color-coded in badges and indicators:

| Type | Color |
|------|-------|
| Learning Path | Cyan |
| Module | Blue |
| Lesson | Amber |
| Artifact | Green |
| Reviewed | Green (success) |
| Draft | Neutral |

## Graph Aesthetics

The knowledge graph and retrieval graph follow:
- Dark canvas background
- Nodes colored by entity type or cluster
- Edges with subtle opacity and curved paths
- Labels with controlled overlap
- Selection highlighting with accent glow
- Minimal decoration — focused on readability

## Interaction Philosophy

- All interactive elements have clear hover and focus states
- Transitions are short (150-300ms) and purposeful
- Click targets are adequately sized (minimum 44px for touch)
- Keyboard navigation is supported throughout
- State changes are visually communicated (aria-pressed, aria-expanded)

## Glassmorphism Usage

Glassmorphism (backdrop blur + semi-transparent backgrounds) is used selectively:
- Search modal dialog
- Agent panel
- Tooltips and hover previews
- Session bar
- Not used on primary content areas to maintain readability

## Responsive Principles

- CSS Grid for main layout
- Flexible cards that reflow from multi-column to single-column
- Navigation rail collapses to hamburger menu on mobile
- Reading view adjusts column proportions
- Tables become scrollable on narrow viewports
- Minimum target size maintained for interactive elements
- No horizontal overflow at any breakpoint

## Motion Philosophy

- `prefers-reduced-motion` is respected — all animations are disabled or replaced with instant transitions
- Route transitions use opacity and transform
- Cards lift slightly on hover
- Loading states use skeleton screens, not spinners
- Animations are not used decoratively

## Related Chapters

- [Accessibility](25-accessibility.md)
- [Frontend Architecture](03-frontend-architecture.md)
- [Workspace Architecture](07-workspace-architecture.md)
