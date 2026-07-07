# NV-700-M5 — Interaction Architecture

**Status:** LOCKED  
**Date:** 2026-07-05  
**Author:** NeuralVerse Architecture Team  
**Scope:** Canonical Interaction Model for Atlas

---

## Executive Summary

This document defines the canonical interaction architecture for Atlas. It specifies how humans interact with the knowledge topology without defining implementation. Every interaction exists to reveal knowledge, never merely to manipulate graphics.

Atlas receives a complete, implementation-independent interaction architecture covering:
- Navigation, selection, focus, and inspection
- Exploration, search, filtering, and comparison
- History, bookmarks, context menus, and undo/redo
- Keyboard, pointer, and touch interactions
- Accessibility and interaction state machine

The architecture remains fully compatible with NV-700-M1, NV-700-M2, NV-700-M3, and NV-700-M4.

---

## 1. Interaction Philosophy

### 1.1 Core Principle

```
Every interaction must reveal knowledge.
No interaction exists merely to manipulate graphics.
```

### 1.2 What Atlas Interactions Feel Like

Atlas interactions must feel:

- Scientific
- Precise
- Predictable
- Continuous
- Calm
- Instrument-grade
- Low-friction

### 1.3 What Atlas Interactions Must Never Feel Like

Atlas interactions must never feel:

- Game-like
- Playful
- Chaotic
- Surprising
- Decorative
- Animated for entertainment

### 1.4 Interaction Purpose

Interaction exists to help users:

- Understand
- Explore
- Investigate
- Compare
- Discover
- Follow dependencies
- Build mental models
- Maintain orientation

Interaction must reduce cognitive effort. Never increase it.

---

## 2. Canonical Interaction Model

### 2.1 Interaction Categories

Atlas interaction divides into four distinct categories:

| Category | Purpose | Scope |
|----------|---------|-------|
| Navigation | Move through space | Camera, viewport |
| Exploration | Discover structure | Neighborhoods, clusters |
| Inspection | Understand entities | Details, relationships |
| Editing | Modify knowledge | Outside Atlas MVP |

### 2.2 Category Boundaries

| Boundary | Rule |
|----------|------|
| Navigation ≠ Exploration | Navigation moves camera; exploration reveals structure |
| Exploration ≠ Inspection | Exploration discovers; inspection details |
| Inspection ≠ Editing | Inspection reads; editing modifies |
| Navigation ≠ Selection | Navigation moves camera; selection chooses entities |

### 2.3 Interaction Flow

```
User Intent
    ↓
Input Device
    ↓
Gesture Recognition
    ↓
Command Resolution
    ↓
State Transition
    ↓
Visual Feedback
    ↓
Knowledge Revealed
```

---

## 3. Navigation Architecture

### 3.1 Spatial Navigation

Navigation is spatial movement through the infinite canvas:

| Action | Description | Camera Change |
|--------|-------------|---------------|
| Pan | Move horizontally or vertically | X, Y change |
| Zoom | Scale visible region | Zoom level changes |
| Home | Return to default view | Reset to defaults |
| Fit | Show entire graph | Calculate bounds |
| Center | Center on entity | Move to entity position |
| Reset Camera | Restore initial state | Reset all camera properties |
| Camera Anchors | Save/restore positions | Store/restore camera state |
| Saved Views | Named camera positions | Load named camera state |
| Camera History | Previous camera states | Navigate history stack |

### 3.2 Camera Independence

```
Camera moves.
Knowledge does not.
```

Camera state is independent from graph state:

- Camera position does not affect node positions
- Camera zoom does not affect node sizes
- Camera rotation does not affect graph structure
- Camera state is temporary; graph state is permanent

### 3.3 Semantic Navigation

Navigation through meaning:

| Navigation | Description | Trigger |
|------------|-------------|---------|
| Jump to dependency | Follow dependency edge | Edge click |
| Jump to parent | Move to parent node | Parent button |
| Jump to child | Move to child node | Child button |
| Jump to hub | Move to high-degree node | Hub button |
| Jump to bridge | Move to bridge node | Bridge button |
| Jump to bottleneck | Move to bottleneck node | Bottleneck button |
| Jump to application | Move to application node | Application button |
| Jump to domain | Move to domain region | Domain selector |
| Jump to source | Move to source entity | Source button |

### 3.4 Structural Navigation

Movement through graph hierarchy:

| Navigation | Description | Trigger |
|------------|-------------|---------|
| Expand | Reveal collapsed content | Expand button |
| Collapse | Hide expanded content | Collapse button |
| Drill-down | Enter cluster/region | Double-click |
| Ascend | Exit to parent level | Back button |
| Descend | Enter child level | Forward button |
| Sibling navigation | Move to adjacent siblings | Arrow keys |

---

## 4. Selection Architecture

### 4.1 Selection Modes

| Mode | Purpose | Lifecycle | Persistence |
|------|---------|-----------|-------------|
| Single Selection | Choose one entity | Until next selection | Session |
| Multi Selection | Choose multiple entities | Until deselected | Session |
| Temporary Selection | Brief highlight | 300ms timeout | None |
| Persistent Selection | Long-term selection | Until deselected | Saved |
| Pinned Selection | Fixed selection | Until unpinned | Saved |
| Range Selection | Select range of entities | Until deselected | Session |
| Neighborhood Selection | Select connected entities | Until deselected | Session |
| Dependency Selection | Select dependency chain | Until deselected | Session |
| Path Selection | Select path between entities | Until deselected | Session |

### 4.2 Selection Rules

| Rule | Description |
|------|-------------|
| Additive | New selection adds to existing |
| Replace | Click replaces selection |
| Toggle | Shift+click toggles entity |
| Deselect | Escape clears selection |
| Range | Shift+drag selects range |
| All | Ctrl+A selects all visible |

### 4.3 Selection Ownership

Selection is owned by:

- **User Session** — Current selection state
- **Not Graph** — Selection does not affect graph
- **Not Knowledge** — Selection does not create knowledge

### 4.4 Selection Visual State

| State | Visual Change |
|-------|---------------|
| Selected | Bright border, halo |
| Unselected | Normal appearance |
| Multi-selected | Multiple halos |
| Range-selected | Range highlight |
| Dependency-selected | Dependency glow |

### 4.5 Selection Persistence

| Persistence | Duration | Use Case |
|-------------|----------|----------|
| None | 300ms | Temporary highlight |
| Session | Current session | Working selection |
| Saved | Until deselected | Persistent selection |
| Pinned | Until unpinned | Fixed reference |

---

## 5. Focus Architecture

### 5.1 Focus vs Selection

Selection and focus are different concepts:

| Concept | Purpose | Behavior |
|---------|---------|----------|
| Selection | Choose entities | Additive, multi-entity |
| Focus | Investigate entity | Singular, deep inspection |

```
Selection chooses.
Focus investigates.
```

### 5.2 Focus Types

| Type | Description | Priority |
|------|-------------|----------|
| Primary Focus | Current investigation target | Highest |
| Secondary Focus | Related investigation target | Medium |
| Multi-focus | Multiple investigation targets | Equal |
| Focus Stack | Previous focus targets | LIFO |
| Focus History | All focus targets | Chronological |
| Focus Recovery | Return to previous focus | Navigation |

### 5.3 Focus Rules

| Rule | Description |
|------|-------------|
| Singular | Only one primary focus at a time |
| Independent | Focus does not affect selection |
| Camera-linked | Focus centers camera |
| Inspector-linked | Focus updates inspector |
| Recoverable | Previous focus can be restored |

### 5.4 Focus Visual State

| State | Visual Change |
|-------|---------------|
| Focused | Strong glow, ring, dim others |
| Unfocused | Normal appearance |
| Secondary | Light glow, connected edges |
| Multi-focused | Multiple glows |

### 5.5 Focus Lifecycle

```
Idle → Focus Requested → Focus Active → Focus Released → Idle
                ↓
        Focus Stack Updated
                ↓
        Focus History Updated
```

---

## 6. Inspection Architecture

### 6.1 Inspector Purpose

The Inspector is Atlas's scientific instrument:

- **Read-only** — Never edits
- **Observational** — Only observes
- **Comprehensive** — Shows all available information
- **Contextual** — Adapts to focused entity

### 6.2 Inspector Contents

| Section | Content | Source |
|---------|---------|--------|
| Entity Summary | Name, type, family, description | Graph Snapshot |
| Ontology | Entity type, family, relationships | Graph Snapshot |
| Relationships | Connected entities, relationship types | Graph Snapshot |
| Metrics | Importance, centrality, degree | Metrics Engine |
| Dependencies | Required entities, dependents | Graph Snapshot |
| Neighbors | Connected entities | Graph Snapshot |
| Applications | Usage examples | Evidence Store |
| Sources | References, citations | Evidence Store |
| Evidence | Supporting evidence | Evidence Store |
| Curriculum Links | Learning paths, lessons | Curriculum Service |
| Engineering Links | Implementation references | Engineering Store |
| Related Concepts | Similar entities | Similarity Engine |

### 6.3 Inspector Behavior

| Behavior | Description |
|----------|-------------|
| Read-only | Never modifies graph state |
| Contextual | Adapts to focused entity |
| Comprehensive | Shows all available information |
| Searchable | Internal search function |
| Exportable | Copy/save inspector content |

### 6.4 Inspector Boundaries

```
Inspector never edits.
Inspector never owns graph state.
Inspector observes.
```

- Inspector reads from Graph Snapshot
- Inspector does not write to Graph Snapshot
- Inspector does not affect navigation
- Inspector does not affect selection
- Inspector does not affect focus

---

## 7. Exploration Model

### 7.1 Exploration Actions

| Action | Purpose | Input | Output | State Change | Persistence |
|--------|---------|-------|--------|--------------|-------------|
| Peek | Brief overview | Hover | Tooltip | Temporary | None |
| Inspect | Full details | Click | Inspector | Focus change | Session |
| Expand | Reveal content | Click | Expanded view | Cluster state | Session |
| Collapse | Hide content | Click | Collapsed view | Cluster state | Session |
| Traverse | Follow edge | Click | Target entity | Navigation | History |
| Trace | Follow chain | Click | Chain path | Navigation | History |
| Compare | Side-by-side | Multi-select | Comparison view | Selection | Session |
| Overlay | Layer information | Toggle | Overlay view | Visual state | Session |
| Highlight | Emphasize | Toggle | Highlight view | Visual state | Session |
| Reveal Neighborhood | Show connections | Click | Neighborhood view | Visual state | Session |
| Follow Dependency Chain | Trace dependencies | Click | Chain view | Navigation | History |
| Reveal Semantic Cluster | Show cluster | Click | Cluster view | Visual state | Session |

### 7.2 Exploration Rules

| Rule | Description |
|------|-------------|
| Reversible | All exploration can be undone |
| Non-destructive | Exploration never modifies graph |
| Cumulative | Exploration builds understanding |
| Orienting | Exploration maintains context |

### 7.3 Exploration State

```
Idle → Exploration Requested → Exploration Active → Exploration Complete → Idle
                ↓
        State Snapshot Created
                ↓
        Undo Point Established
```

---

## 8. Search Interaction

### 8.1 Search vs Retrieval

Search is Atlas-local investigation:

| Concept | Scope | Purpose |
|---------|-------|---------|
| Search | Atlas-local | Find entities in topology |
| Retrieval | Global | Find knowledge across system |

### 8.2 Search Features

| Feature | Description | Trigger |
|---------|-------------|---------|
| Search | Full-text search | Search input |
| Autocomplete | Suggest completions | Typing |
| Incremental Search | Search as you type | Typing |
| Highlight | Highlight matches | Search active |
| Focus Result | Focus on first match | Enter |
| Jump | Navigate to match | Enter |
| Temporary Overlay | Show results overlay | Search active |
| Search History | Previous searches | History button |
| Recent Searches | Recent search terms | History button |

### 8.3 Search Interaction

| State | Behavior |
|-------|----------|
| Search inactive | Normal interaction |
| Search active | Search input focused |
| Results displayed | Results overlay shown |
| Result selected | Entity focused, camera moved |
| Search cleared | Overlay removed, normal interaction |

### 8.4 Search Boundaries

| Boundary | Rule |
|----------|------|
| Search ≠ Selection | Search highlights; selection chooses |
| Search ≠ Focus | Search highlights; focus investigates |
| Search ≠ Projection | Search filters visual; projection filters graph |
| Search ≠ Knowledge | Search finds; does not create |

---

## 9. Projection Switching

### 9.1 Projection Interaction

NV-700-M4 defined visual projections. This section defines interaction.

### 9.2 Required Projections

| Projection | Visual Emphasis | Navigation Behavior |
|------------|-----------------|---------------------|
| Topology | Complete view | Free navigation |
| Dependency | Prerequisite chains | Follow dependencies |
| Learning | Learning paths | Follow curriculum |
| Engineering | Implementation | Follow implementation |
| Historical | Time evolution | Follow time |
| Research | Research landscape | Explore research |
| Application | Evidence relationships | Follow evidence |

### 9.3 Switch Behavior

| Behavior | Description |
|----------|-------------|
| Camera preservation | Camera position maintained |
| Focus preservation | Focus maintained |
| Selection preservation | Selection maintained |
| Animation philosophy | Smooth transition, not entertainment |
| History behavior | Projection change recorded |

### 9.4 Switch Rules

| Rule | Description |
|------|-------------|
| Non-destructive | Projection never modifies graph |
| Reversible | Can return to previous projection |
| Preserving | Camera, focus, selection preserved |
| Transitional | Smooth animation between states |

### 9.5 Projection Boundaries

```
Changing projection must never:
- modify graph
- change knowledge
- create entities
```

- Projection changes visualization only
- Projection does not affect graph structure
- Projection does not affect knowledge
- Projection does not affect data

---

## 10. Filtering Architecture

### 10.1 Filter Types

| Filter | Description | Scope |
|--------|-------------|-------|
| Entity Family | Filter by family | Nodes |
| Entity Type | Filter by type | Nodes |
| Relationship Category | Filter by category | Edges |
| Domain | Filter by domain | Nodes, edges |
| Application | Filter by application | Evidence |
| Complexity | Filter by complexity | Nodes |
| Importance | Filter by importance | Nodes |
| Learning Stage | Filter by stage | Curriculum |
| Visibility | Filter by visibility | All |
| Projection | Filter by projection | All |

### 10.2 Filter Behavior

| Behavior | Description |
|----------|-------------|
| Reversible | All filters can be removed |
| Non-destructive | Filters never modify graph |
| Cumulative | Multiple filters combine |
| Progressive | Filters narrow results |

### 10.3 Filter State

```
No filter → Filter applied → Filtered view → Filter removed → No filter
                ↓
        State Snapshot Created
                ↓
        Undo Point Established
```

### 10.4 Filter Boundaries

| Boundary | Rule |
|----------|------|
| Filter ≠ Edit | Filter hides; does not delete |
| Filter ≠ Projection | Filter is local; projection is global |
| Filter ≠ Search | Filter hides; search highlights |
| Filter ≠ Knowledge | Filter does not create knowledge |

---

## 11. Comparison Model

### 11.1 Comparison Types

| Type | Description | Visual |
|------|-------------|--------|
| Compare Concepts | Compare two entities | Side-by-side |
| Compare Architectures | Compare structural patterns | Overlay |
| Compare Algorithms | Compare algorithmic approaches | Side-by-side |
| Compare Frameworks | Compare implementation approaches | Side-by-side |
| Compare Domains | Compare domain characteristics | Overlay |

### 11.2 Comparison Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| Side-by-side | Two inspectors | Detailed comparison |
| Overlay | Visual overlay | Pattern comparison |
| Shared neighborhood | Common neighbors | Relationship comparison |
| Difference highlighting | Highlight differences | Quick comparison |

### 11.3 Comparison State

```
No comparison → Comparison requested → Comparison active → Comparison closed → No comparison
                        ↓
                Selection Used
                        ↓
                Comparison View Opened
```

### 11.4 Comparison Rules

| Rule | Description |
|------|-------------|
| Non-destructive | Comparison never modifies graph |
| Reversible | Comparison can be closed |
| Independent | Comparison does not affect navigation |
| Read-only | Comparison is observational |

---

## 12. History Architecture

### 12.1 History Types

| Type | Content | Persistence |
|------|---------|-------------|
| Camera History | Previous camera states | Session |
| Navigation History | Navigation path | Session |
| Selection History | Selection changes | Session |
| Focus History | Focus changes | Session |
| Projection History | Projection changes | Session |
| Search History | Search queries | Persistent |

### 12.2 Undo/Redo

| Action | Description | Scope |
|--------|-------------|-------|
| Undo | Reverse last action | Current session |
| Redo | Re-apply undone action | Current session |
| Restore Session | Restore previous session | Persistent |
| Restore Camera | Restore camera state | Session |

### 12.3 History State

```
Action → History Updated → Undo Point Established
                ↓
        Redo Stack Cleared
```

### 12.4 History Rules

| Rule | Description |
|------|-------------|
| Complete | All actions recorded |
| Ordered | Actions in chronological order |
| Reversible | Actions can be undone |
| Persistent | History survives session restart |

---

## 13. Bookmarks

### 13.1 Bookmark Types

| Type | Content | Persistence |
|------|---------|-------------|
| Node Bookmark | Entity reference | Persistent |
| Region Bookmark | Region reference | Persistent |
| View Bookmark | Camera position | Persistent |
| Session Bookmark | Exploration state | Persistent |
| Query Bookmark | Saved query | Persistent |

### 13.2 Bookmark Properties

```typescript
interface Bookmark {
  id: string;
  name: string;
  type: BookmarkType;
  target: string | CameraState | QueryState;
  createdAt: ISO8601;
  updatedAt: ISO8601;
  tags: string[];
}
```

### 13.3 Bookmark Rules

| Rule | Description |
|------|-------------|
| Non-duplicating | Bookmarks never duplicate graph data |
| Reference-based | Bookmarks reference, not copy |
| Persistent | Bookmarks survive session restart |
| Organizable | Bookmarks can be tagged, grouped |

### 13.4 Bookmark Boundaries

| Boundary | Rule |
|----------|------|
| Bookmark ≠ Knowledge | Bookmark references; does not create |
| Bookmark ≠ Selection | Bookmark is persistent; selection is temporary |
| Bookmark ≠ Focus | Bookmark is stored; focus is active |
| Bookmark ≠ Navigation | Bookmark is reference; navigation is action |

---

## 14. Context Menus

### 14.1 Context Menu Items

| Action | Description | Availability |
|--------|-------------|--------------|
| Inspect | Open inspector | All entities |
| Focus | Focus on entity | All entities |
| Highlight | Highlight entity | All entities |
| Compare | Compare entities | Multiple selected |
| Bookmark | Bookmark entity | All entities |
| Reveal Neighbors | Show connected entities | All entities |
| Copy Reference | Copy entity reference | All entities |
| Copy Citation | Copy citation format | All entities |
| Open Source | Open source document | Entities with sources |
| Open Learning | Open learning path | Curriculum entities |
| Open Content | Open content page | Content entities |

### 14.2 Context Menu Rules

| Rule | Description |
|------|-------------|
| Contextual | Items adapt to entity type |
| Non-destructive | Actions never modify graph |
| Reversible | Actions can be undone |
| Discoverable | Available actions discoverable |

---

## 15. Keyboard Architecture

### 15.1 Keyboard Categories

| Category | Actions |
|----------|---------|
| Directional Navigation | Arrow keys, WASD |
| Selection | Enter, Shift+Enter, Ctrl+A |
| Focus | F key, Tab, Shift+Tab |
| Expand/Collapse | Space, Enter |
| Search | Ctrl+F, Escape |
| Projection | 1-7 number keys |
| History | Ctrl+Z, Ctrl+Y, Ctrl+H |
| Bookmarks | Ctrl+D, Ctrl+B |
| Inspector | I key, Escape |
| Camera | Home, End, PgUp, PgDn |

### 15.2 Keyboard Principles

| Principle | Description |
|-----------|-------------|
| Keyboard-first | All actions keyboard accessible |
| Discoverable | Key bindings discoverable |
| Customizable | Key bindings customizable |
| Consistent | Similar actions similar keys |

### 15.3 Keyboard Boundaries

| Boundary | Rule |
|----------|------|
| Keyboard ≠ Mouse | Keyboard is primary; mouse is supplementary |
| Keyboard ≠ Touch | Keyboard is primary; touch is supplementary |
| Keyboard ≠ Accessibility | Keyboard is accessibility foundation |

---

## 16. Pointer Architecture

### 16.1 Pointer Actions

| Action | Description | Behavior |
|--------|-------------|----------|
| Hover | Cursor over entity | Tooltip, highlight |
| Primary Click | Select entity | Selection change |
| Secondary Click | Context menu | Menu opens |
| Double Click | Inspect entity | Focus, inspector |
| Drag | Pan camera | Camera moves |
| Drag Selection | Select range | Range selection |
| Wheel | Zoom | Camera zooms |
| Precision Selection | Alt+click | Precision mode |

### 16.2 Pointer Rules

| Rule | Description |
|------|-------------|
| Hover communicates | Hover reveals information |
| Click selects | Click changes selection |
| Drag navigates | Drag moves camera |
| Wheel scales | Wheel changes zoom |

### 16.3 Pointer Boundaries

| Boundary | Rule |
|----------|------|
| Pointer ≠ Knowledge | Pointer interacts; does not create |
| Pointer ≠ Edit | Pointer selects; does not modify |
| Pointer ≠ Focus | Pointer selects; focus investigates |

---

## 17. Touch Architecture

### 17.1 Touch Device Support

| Device | Support Level |
|--------|---------------|
| Desktop | Full support |
| Tablet | Full support |
| Large Touch Displays | Full support |

### 17.2 Touch Actions

| Action | Description | Behavior |
|--------|-------------|----------|
| Pan | One-finger drag | Camera moves |
| Pinch | Two-finger pinch | Camera zooms |
| Tap | Single tap | Selection change |
| Long Press | Long tap | Context menu |
| Two-finger navigation | Two-finger drag | Camera moves |
| Selection | Tap entity | Selection change |
| Inspection | Double-tap | Focus, inspector |

### 17.3 Touch Rules

| Rule | Description |
|------|-------------|
| Responsive | Touch actions responsive |
| Predictable | Touch actions predictable |
| Accessible | Touch actions accessible |

### 17.4 Touch Boundaries

| Boundary | Rule |
|----------|------|
| Touch ≠ Mouse | Touch is primary on touch devices |
| Touch ≠ Keyboard | Touch is primary on touch devices |
| Touch ≠ Accessibility | Touch must be accessible |

---

## 18. Interaction Feedback

### 18.1 Feedback Types

| Feedback | Description | Timing |
|----------|-------------|--------|
| Selection | Visual change on selection | Instant |
| Focus | Visual change on focus | Instant |
| Navigation | Camera movement feedback | Smooth |
| Projection | Projection change feedback | Smooth |
| Search | Search result feedback | Instant |
| Expansion | Cluster expansion feedback | Smooth |
| Collapse | Cluster collapse feedback | Smooth |
| Errors | Error notification | Instant |
| Unavailable Actions | Action unavailable notification | Instant |

### 18.2 Feedback Principles

| Principle | Description |
|-----------|-------------|
| Communicates cognition | Feedback explains, not decorates |
| Instant | Feedback < 100ms |
| Smooth | Transitions smooth, not jarring |
| Non-blocking | Feedback does not block interaction |

### 18.3 Feedback Boundaries

| Boundary | Rule |
|----------|------|
| Feedback ≠ Animation | Feedback communicates; animation entertains |
| Feedback ≠ Decoration | Feedback reveals; decoration adorns |
| Feedback ≠ Knowledge | Feedback observes; does not create |

---

## 19. Accessibility

### 19.1 Keyboard Accessibility

| Feature | Description |
|---------|-------------|
| Keyboard-first navigation | All actions keyboard accessible |
| Focus indicators | Clear focus visibility |
| Key bindings | Discoverable, customizable |
| Skip navigation | Skip to content |

### 19.2 Screen Reader Accessibility

| Feature | Description |
|---------|-------------|
| ARIA labels | All interactive elements labeled |
| Live regions | Status updates announced |
| Landmarks | Navigation landmarks provided |
| Headings | Proper heading hierarchy |

### 19.3 Motor Accessibility

| Feature | Description |
|---------|-------------|
| Large click targets | Minimum 44x44px |
| Sticky keys | Support for sticky keys |
| Timeout extensions | Extend timeouts |
| Alternative inputs | Voice, switch access |

### 19.4 Visual Accessibility

| Feature | Description |
|---------|-------------|
| High contrast | High contrast mode |
| Color blindness | Patterns supplement colors |
| Text scaling | Text scales with zoom |
| Reduced motion | Respect motion preferences |

### 19.5 Accessibility Principles

| Principle | Description |
|-----------|-------------|
| Mandatory | Accessibility is not optional |
| Foundational | Accessibility is foundation |
| Comprehensive | Accessibility covers all interactions |

---

## 20. Interaction State Machine

### 20.1 Canonical States

| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| Idle | No interaction active | All |
| Navigating | Camera movement active | Idle, Searching |
| Searching | Search active | Idle, Navigating |
| Inspecting | Inspector open | Idle, Navigating, Searching |
| Comparing | Comparison active | Idle, Navigating |
| Filtering | Filter active | Idle, Navigating, Searching |
| Transitioning | State transition active | Next state |
| Recovering | Undo/redo active | Idle |
| Loading | Content loading | Idle, Error |
| Unavailable | Action unavailable | Idle |

### 20.2 State Rules

| Rule | Description |
|------|-------------|
| Exclusive | Only one primary state at a time |
| Transitional | States transition smoothly |
| Recoverable | All states recoverable |
| Observable | State changes observable |

### 20.3 Forbidden Transitions

| From | To | Reason |
|------|----|--------|
| Loading | Unavailable | Loading resolves |
| Unavailable | Loading | Unavailable is terminal |
| Transitioning | Transitioning | No nested transitions |

### 20.4 Recovery Paths

| State | Recovery |
|-------|----------|
| Error | Return to Idle |
| Unavailable | Return to Idle |
| Loading | Timeout → Error → Idle |

---

## 21. Rendering Independence

### 21.1 Renderer Agnostic

This architecture does not depend on:

- SVG
- Canvas
- WebGL
- React
- Pixi
- D3
- Cytoscape
- Three.js
- Any specific library

### 21.2 Contract Requirements

A compliant renderer must:

- Handle all input devices
- Process all gestures
- Execute all commands
- Provide all feedback
- Maintain all states
- Support all accessibility features

### 21.3 Renderer Selection

Renderer selection is implementation decision:

- **Performance** — Choose based on interaction complexity
- **Platform** — Choose based on target platform
- **Team** — Choose based on team expertise
- **Features** — Choose based on required features

---

## 22. Governance

### 22.1 Interaction Evolution

Interaction evolves through:

- **Proposal** — New interaction proposed
- **Review** — Architecture team reviews
- **Approval** — Changes approved
- **Implementation** — Changes implemented
- **Documentation** — Changes documented

### 22.2 Backward Compatibility

Interaction changes maintain compatibility:

- **Existing interactions** — New interactions don't break existing
- **Existing gestures** — New gestures don't break existing
- **Existing commands** — New commands don't break existing
- **Migration** — Smooth transition for users

### 22.3 Future Interaction Modes

New interaction modes can be added:

- **Voice interaction** — Voice commands
- **Gesture interaction** — Spatial gestures
- **Eye tracking** — Gaze-based interaction
- **Brain-computer** — Neural interfaces

### 22.4 Gesture Extensions

New gestures can be added:

- **Definition** — Gesture defined
- **Purpose** — Semantic meaning specified
- **Integration** — Integrated into gesture system
- **Documentation** — Documented in architecture

### 22.5 New Navigation Paradigms

New navigation paradigms can be added:

- **Definition** — Paradigm defined
- **Purpose** — Semantic meaning specified
- **Integration** — Integrated into navigation system
- **Documentation** — Documented in architecture

---

## 23. Immutable Principles

These 100 principles govern all Atlas interaction:

### 23.1 Core Principles (10)

1. Every interaction must reveal knowledge
2. No interaction exists merely to manipulate graphics
3. Interaction never creates knowledge
4. Interaction reduces cognitive effort
5. Interaction never increases cognitive effort
6. Interaction is scientific, not playful
7. Interaction is precise, not chaotic
8. Interaction is predictable, not surprising
9. Interaction is calm, not animated
10. Interaction is instrument-grade, not decorative

### 23.2 Navigation Principles (10)

11. Navigation is spatial
12. Camera moves; knowledge does not
13. Navigation is reversible
14. Navigation is predictable
15. Navigation maintains orientation
16. Navigation reveals structure
17. Navigation never modifies graph
18. Navigation preserves context
19. Navigation is continuous
20. Navigation is low-friction

### 23.3 Selection Principles (10)

21. Selection chooses entities
22. Selection never edits entities
23. Selection is additive
24. Selection is reversible
25. Selection is temporary or persistent
26. Selection never modifies graph
27. Selection reveals relationships
28. Selection maintains context
29. Selection is independent from focus
30. Selection is independent from navigation

### 23.4 Focus Principles (10)

31. Focus investigates entities
32. Focus is singular
33. Focus is independent from selection
34. Focus is independent from navigation
35. Focus reveals details
36. Focus maintains context
37. Focus is recoverable
38. Focus never modifies graph
39. Focus centers camera
40. Focus updates inspector

### 23.5 Inspection Principles (10)

41. Inspector observes
42. Inspector never edits
43. Inspector is read-only
44. Inspector is comprehensive
45. Inspector is contextual
46. Inspector is searchable
47. Inspector is exportable
48. Inspector never owns graph state
49. Inspector reveals knowledge
50. Inspector maintains context

### 23.6 Exploration Principles (10)

51. Exploration discovers structure
52. Exploration is reversible
53. Exploration is non-destructive
54. Exploration is cumulative
55. Exploration is orienting
56. Exploration never modifies graph
57. Exploration reveals patterns
58. Exploration maintains context
59. Exploration builds understanding
60. Exploration is investigative

### 23.7 Search Principles (10)

61. Search is Atlas-local
62. Search is investigative
63. Search highlights, not replaces
64. Search is incremental
65. Search is reversible
66. Search never modifies graph
67. Search reveals matches
68. Search maintains context
69. Search is temporary
70. Search is combinable with other interactions

### 23.8 Projection Principles (10)

71. Projection switching preserves graph integrity
72. Projection switching never modifies graph
73. Projection switching is reversible
74. Projection switching preserves camera
75. Projection switching preserves focus
76. Projection switching preserves selection
77. Projection switching is smooth
78. Projection switching is predictable
79. Projection switching reveals meaning
80. Projection switching maintains context

### 23.9 Filter Principles (10)

81. Filtering is reversible
82. Filtering never mutates graph
83. Filtering is cumulative
84. Filtering is progressive
85. Filtering reveals subsets
86. Filtering maintains context
87. Filtering is combinable
88. Filtering is predictable
89. Filtering is non-destructive
90. Filtering reveals patterns

### 23.10 Accessibility Principles (10)

91. Accessibility is mandatory
92. Accessibility is foundational
93. Accessibility covers all interactions
94. Keyboard navigation is complete
95. Screen readers are supported
96. Reduced motion is respected
97. High contrast is available
98. Motor accessibility is supported
99. Touch accessibility is supported
100. Accessibility is not optional

---

## 24. Compatibility Analysis

### 24.1 NV-700-M1 Compatibility

| M1 Concept | M5 Treatment | Compatible |
|------------|--------------|------------|
| Atlas = Knowledge Topology | Interaction explores topology | ✓ |
| Topology captures connectivity | Navigation follows connectivity | ✓ |
| Topology captures proximity | Selection reveals proximity | ✓ |
| Topology captures hierarchy | Focus reveals hierarchy | ✓ |
| Topology captures flow | Exploration follows flow | ✓ |
| Atlas is not a graph | Interaction is abstract, not literal | ✓ |
| Atlas is not a map | Navigation is spatial, not geographic | ✓ |
| Atlas is not an observatory | Interaction is active, not passive | ✓ |

### 24.2 NV-700-M2 Compatibility

| M2 Concept | M5 Treatment | Compatible |
|------------|--------------|------------|
| 4 entity families | Selection respects families | ✓ |
| 22 entity types | Inspection reveals types | ✓ |
| 7 relationship categories | Navigation follows categories | ✓ |
| 28 relationship types | Exploration reveals types | ✓ |
| Edge metadata | Inspection reveals metadata | ✓ |
| 18 emergent structures | Exploration reveals structures | ✓ |
| 55 immutable principles | Extended to 100 principles | ✓ |

### 24.3 NV-700-M3 Compatibility

| M3 Concept | M5 Treatment | Compatible |
|------------|--------------|------------|
| Graph Source | Not interacted (editable layer) | ✓ |
| Graph Snapshot | Interacted as graph | ✓ |
| Semantic Projection | Projections switched | ✓ |
| Visualization Payload | Payload consumed by renderer | ✓ |
| Renderer | Architecture is renderer-independent | ✓ |
| Query Engine | Queries drive search | ✓ |
| Metrics Engine | Metrics drive focus | ✓ |

### 24.4 NV-700-M4 Compatibility

| M4 Concept | M5 Treatment | Compatible |
|------------|--------------|------------|
| Visual Space | Navigation uses visual space | ✓ |
| Visual Grammar | Interaction uses visual grammar | ✓ |
| Node Architecture | Interaction uses node architecture | ✓ |
| Edge Architecture | Interaction uses edge architecture | ✓ |
| Region Architecture | Navigation uses region architecture | ✓ |
| Cluster Visualization | Exploration uses cluster visualization | ✓ |
| Projection Visualization | Projections use projection visualization | ✓ |
| Navigation Architecture | Interaction uses navigation architecture | ✓ |
| LOD Architecture | Interaction respects LOD | ✓ |
| Visual States | Interaction uses visual states | ✓ |
| Interaction Feedback | Interaction provides feedback | ✓ |
| Accessibility | Interaction is accessible | ✓ |

### 24.5 No Breaking Changes

The architecture introduces no breaking changes to M1, M2, M3, or M4. It only defines interaction behavior for visual artifacts.

---

## 25. Migration Impact

### 25.1 For Existing Implementations

No migration required. The architecture is conceptual, not structural. Existing code that implements interaction continues to work.

### 25.2 For Future Implementations

The architecture provides clearer guidance:

- Implement navigation with correct behavior
- Implement selection with correct rules
- Implement focus with correct independence
- Implement inspection with correct boundaries
- Implement exploration with correct reversibility
- Implement search with correct scope
- Implement projections with correct preservation
- Implement filters with correct reversion
- Implement history with correct persistence
- Implement bookmarks with correct references
- Implement keyboard with correct accessibility
- Implement pointer with correct behavior
- Implement touch with correct responsiveness
- Implement feedback with correct timing
- Implement accessibility with correct features

### 25.3 For NV-700-M6+

Later phases receive clean interaction contracts:

- Interaction architecture defines behavior
- Implementation can choose any framework
- Interaction language remains consistent
- Accessibility is guaranteed

---

## 26. Final Verdict

### 26.1 Success Criteria Met

| Criterion | Status |
|-----------|--------|
| Atlas receives a complete, implementation-independent interaction architecture | ✓ |
| Navigation, exploration, inspection, and selection are treated as distinct concepts | ✓ |
| Focus, selection, and camera are independent state models | ✓ |
| Every interaction exists to reveal knowledge rather than manipulate graphics | ✓ |
| Keyboard, pointer, and touch interactions are architecturally defined | ✓ |
| The interaction model remains renderer-agnostic | ✓ |
| The document is fully compatible with NV-700-M1, NV-700-M2, NV-700-M3, and NV-700-M4 | ✓ |
| It provides a stable foundation for later implementation without requiring future architectural restructuring | ✓ |

### 26.2 Recommendation

**Approve document. Lock NV-700-M5.**

The interaction architecture is complete, implementation-independent, and compatible with all preceding documents. The architecture provides a stable foundation for later implementation.

---

**Document Status:** LOCKED — Do not modify without explicit approval.
