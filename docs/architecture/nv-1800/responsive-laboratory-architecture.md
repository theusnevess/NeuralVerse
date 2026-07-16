# NV-1800 Responsive Laboratory Architecture

The Laboratory is one semantic document with fluid spatial compositions. The canonical responsive authority is `laboratory-workspace-v4.css`: wide and standard composition progressively reflows at `1180px`, `900px`, and `700px`; these are content profiles rather than device rules.

The document owns vertical scroll. Scientific Log and Findings History are the only bounded deep-content scroll regions. The Stage remains the spatial priority: side-by-side Stage and Rail composition is used only above compact widths; the Rail moves into normal flow below the compact profile.

Every renderer stays inside its Stage owner with intrinsic SVG or canvas sizing. Parameter controls, execution controls, Inspector, Research Mode, Completion and continuations use normal document flow and stack on mobile. Completion uses a responsive measurement grid that becomes one column below 700px; continuation cards never require horizontal scrolling.

Responsive transitions are CSS-owned and do not rebuild the Laboratory. Current route, normalized parameter values, lifecycle, disclosure state, Research Session, evidence, and completed results remain in the same DOM ownership during resize. Keyboard, touch, pointer and reduced-motion behavior retain the established canonical controls.

Validation covers all ten Laboratories at Wide (1440x900), Standard (1280x800), Compact (1024x768), Portrait Compact (768x1024), Mobile (390x844), Narrow Mobile (360x740), Short (1366x650), and Landscape Mobile (844x390). Required invariants are page containment, Stage containment, control reachability, canonical region order, normal document scroll and resize state continuity.
