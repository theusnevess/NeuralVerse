# Visual Semantics Registry

This registry defines the visual mapping of each workspace component. Any future visual component must declare its Visual Semantics Registry mapping here before implementation.

---

## Registry Entries

```yaml
component: Retrieval Workspace
semantics:
  primary: Knowledge
  secondary: Exploration
visual_grammar:
  primary_motif: Constellation + mesh
primitives:
  - Node
  - Edge
  - Grid
  - Divider
observatory_signals:
  - Constellation Mesh
  - Scientific Grid
motion_profile:
  enter: fade
  focus: none
  update: none
complexity_level: V3

---

component: Reference Card
semantics:
  primary: Memory
  secondary: Context
visual_grammar:
  primary_motif: Archive + stacked documents
primitives:
  - Document
  - Frame
observatory_signals:
  - Local Orbit
motion_profile:
  enter: slide-in
  focus: highlight-border
  update: cross-fade
complexity_level: V1

---

component: Reference Inspector
semantics:
  primary: Context
  secondary: Memory
visual_grammar:
  primary_motif: Framing brackets
primitives:
  - Bracket
  - Grid
observatory_signals:
  - Scientific Grid
motion_profile:
  enter: slide-in-right
  focus: none
  update: fade
complexity_level: V2

---

component: Evidence Inspector
semantics:
  primary: Evidence
  secondary:
    - Relationship
    - Confidence
visual_grammar:
  primary_motif: Multiple lines → synthesis core
  secondary_motifs:
    - Convergence Point
    - Stable concentric rings
primitives:
  - Node
  - Edge
  - Signal Ray
  - Ring
  - Document
observatory_signals:
  - Convergence Point
  - Scientific Grid
motion_profile:
  enter: fade
  focus: subtle emphasis
  update: cross-fade
  continuous: forbidden
complexity_level: V2

---

component: Relationship Inspector
semantics:
  primary: Relationship
visual_grammar:
  primary_motif: Bridges + connective arcs
primitives:
  - Arc
  - Connector
observatory_signals:
  - Local Orbit
motion_profile:
  enter: slide-in-right
  update: fade
complexity_level: V2

---

component: Discovery Panel
semantics:
  primary: Discovery
visual_grammar:
  primary_motif: Beacon + expanding orbit
primitives:
  - Beacon
  - Orbit
observatory_signals:
  - Radial Beacon
motion_profile:
  enter: fade
  update: slide-left
complexity_level: V2

---

component: Research Memory Layer
semantics:
  primary: Memory
visual_grammar:
  primary_motif: Archive + stacked documents
primitives:
  - Archive
  - Document
observatory_signals:
  - Scientific Grid
motion_profile:
  enter: fade
complexity_level: V2

---

component: Knowledge Trail
semantics:
  primary: Exploration
visual_grammar:
  primary_motif: Branching paths
primitives:
  - Axis
  - Anchor
observatory_signals:
  - Directed Trajectory
motion_profile:
  enter: slide-in
complexity_level: V1

---

component: Graph Node
semantics:
  primary: Knowledge
visual_grammar:
  primary_motif: Constellation + mesh
primitives:
  - Node
  - Ring
observatory_signals:
  - Local Orbit
motion_profile:
  enter: grow
  focus: scale-and-glow
complexity_level: V0

---

component: Graph Edge
semantics:
  primary: Relationship
visual_grammar:
  primary_motif: Connective arcs
primitives:
  - Edge
observatory_signals:
  - Orbital Arc
motion_profile:
  enter: draw-path
complexity_level: V0

---

component: Search Empty State
semantics:
  primary: Search
visual_grammar:
  primary_motif: Lens + converging rays
primitives:
  - Lens
  - Signal Ray
observatory_signals:
  - Signal Beam
complexity_level: V2

---

component: Graph Empty State
semantics:
  primary: Knowledge
visual_grammar:
  primary_motif: Constellation + mesh
primitives:
  - Grid
  - Node
  - Orbit
observatory_signals:
  - Constellation Mesh
complexity_level: V2

---

component: Evidence Empty State
semantics:
  primary: Evidence
visual_grammar:
  primary_motif: Multiple lines → synthesis core
primitives:
  - Document
  - Node
  - Signal Ray
observatory_signals:
  - Convergence Point
complexity_level: V2

---

component: Memory Empty State
semantics:
  primary: Memory
visual_grammar:
  primary_motif: Archive + stacked documents
primitives:
  - Archive
  - Document
observatory_signals:
  - Scientific Grid
complexity_level: V2

---

component: No Results State
semantics:
  primary: Failure
visual_grammar:
  primary_motif: Interrupted connection
primitives:
  - Node
  - Edge
observatory_signals:
  - Scientific Grid
complexity_level: V2

---

component: Resume Session Banner
semantics:
  primary: Session
visual_grammar:
  primary_motif: Timeline + anchored node
primitives:
  - Axis
  - Node
observatory_signals:
  - Directed Trajectory
complexity_level: V1

---

component: Compilation Complete State
semantics:
  primary: Validation
visual_grammar:
  primary_motif: Checkpoint + ring
primitives:
  - Ring
  - Anchor
observatory_signals:
  - Convergence Point
complexity_level: V2
```
