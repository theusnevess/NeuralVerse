# Scientific Icon Semantics Registry

Every official NeuralVerse scientific icon maps to one approved research concept. Do not create ad hoc variants for the same meaning.

```yaml
icon: research-lens
display_name: Research Lens
family: Search & Discovery
primary: Search
secondary:
  - Reference lookup
primitives:
  - Lens
  - Node
  - Signal Ray
observatory_signals:
  - Focused Observation
official_file: website/assets/icons/scientific/search-discovery/research-lens.svg
allowed_usage:
  - Search input
  - Search empty state
  - Retrieval entry point
forbidden_usage:
  - Generic zoom control
  - Decorative background element
---
icon: search-constellation
display_name: Search Constellation
family: Search & Discovery
primary: Semantic Search
secondary:
  - Ranked retrieval
primitives:
  - Node
  - Edge
  - Constellation Mesh
observatory_signals:
  - Constellation Mesh
official_file: website/assets/icons/scientific/search-discovery/search-constellation.svg
allowed_usage:
  - Semantic search result group
  - Search discovery state
  - Related result surface
forbidden_usage:
  - Generic network status
  - Decorative star field
---
icon: discovery-beacon
display_name: Discovery Beacon
family: Search & Discovery
primary: Discovery
secondary:
  - Recommendation
primitives:
  - Beacon
  - Ring
  - Signal Ray
observatory_signals:
  - Radial Beacon
official_file: website/assets/icons/scientific/search-discovery/discovery-beacon.svg
allowed_usage:
  - Discovery panel
  - Recommendation empty state
  - Suggested next reference
forbidden_usage:
  - Error state
  - Generic notification
---
icon: expanding-network
display_name: Expanding Network
family: Search & Discovery
primary: Exploration
secondary:
  - Relationship expansion
primitives:
  - Node
  - Edge
  - Orbit
observatory_signals:
  - Expanding Neighborhood
official_file: website/assets/icons/scientific/search-discovery/expanding-network.svg
allowed_usage:
  - Explore more action
  - Relationship expansion state
  - Full graph discovery
forbidden_usage:
  - Loading spinner
  - Decorative motion cue
---
icon: query-signal
display_name: Query Signal
family: Search & Discovery
primary: Active Query
secondary:
  - Search state
primitives:
  - Signal Ray
  - Node
  - Axis
observatory_signals:
  - Directed Signal
official_file: website/assets/icons/scientific/search-discovery/query-signal.svg
allowed_usage:
  - Active query indicator
  - Query chip
  - Saved query preview
forbidden_usage:
  - Generic filter icon
  - Broadcast decoration
---
icon: knowledge-cluster
display_name: Knowledge Cluster
family: Knowledge Graph
primary: Knowledge grouping
secondary:
  - Cluster context
primitives:
  - Node
  - Edge
  - Ring
observatory_signals:
  - Local Orbit
official_file: website/assets/icons/scientific/knowledge-graph/knowledge-cluster.svg
allowed_usage:
  - Graph cluster label
  - Cluster empty state
  - Topic grouping badge
forbidden_usage:
  - Generic folder
  - Decorative background element
---
icon: connected-nodes
display_name: Connected Nodes
family: Knowledge Graph
primary: Network
secondary:
  - Graph
primitives:
  - Node
  - Edge
observatory_signals:
  - Constellation Mesh
official_file: website/assets/icons/scientific/knowledge-graph/connected-nodes.svg
allowed_usage:
  - Graph controls
  - Network status
  - Relationship overview
forbidden_usage:
  - Generic share icon
  - External link action
---
icon: citation-bridge
display_name: Citation Bridge
family: Knowledge Graph
primary: Relationship
secondary:
  - Citation
primitives:
  - Connector
  - Node
  - Bridge
observatory_signals:
  - Relationship Bridge
official_file: website/assets/icons/scientific/knowledge-graph/citation-bridge.svg
allowed_usage:
  - Relationship inspector
  - Citation edge
  - Follow relationship action
forbidden_usage:
  - Generic hyperlink
  - Navigation breadcrumb
---
icon: active-neighborhood
display_name: Active Neighborhood
family: Knowledge Graph
primary: Local graph context
secondary:
  - Focused graph
primitives:
  - Node
  - Ring
  - Edge
observatory_signals:
  - Focused Neighborhood
official_file: website/assets/icons/scientific/knowledge-graph/active-neighborhood.svg
allowed_usage:
  - Graph depth control
  - Active node context
  - Neighborhood summary
forbidden_usage:
  - User presence
  - Generic selected state
---
icon: semantic-path
display_name: Semantic Path
family: Knowledge Graph
primary: Exploration path
secondary:
  - Research trajectory
primitives:
  - Node
  - Path
  - Axis
observatory_signals:
  - Directed Trajectory
official_file: website/assets/icons/scientific/knowledge-graph/semantic-path.svg
allowed_usage:
  - Path exploration
  - Knowledge trail relation
  - Graph route preview
forbidden_usage:
  - Physical route map
  - Generic progress stepper
---
icon: evidence-convergence
display_name: Evidence Convergence
family: Evidence
primary: Evidence
secondary:
  - Compilation
primitives:
  - Signal Ray
  - Node
  - Ring
observatory_signals:
  - Convergence Point
official_file: website/assets/icons/scientific/evidence/evidence-convergence.svg
allowed_usage:
  - Evidence Inspector
  - Empty Evidence State
  - Compilation Complete State
  - Evidence microvisualization
forbidden_usage:
  - Generic success state
  - Decorative background element
---
icon: synthesis-core
display_name: Synthesis Core
family: Evidence
primary: Compilation
secondary:
  - Synthesis
primitives:
  - Node
  - Signal Ray
  - Connector
observatory_signals:
  - Synthesis Core
official_file: website/assets/icons/scientific/evidence/synthesis-core.svg
allowed_usage:
  - Compile evidence action
  - Synthesis result
  - Evidence summary
forbidden_usage:
  - Generic processor
  - Loading indicator
---
icon: confidence-rings
display_name: Confidence Rings
family: Evidence
primary: Confidence
secondary:
  - Evidence quality
primitives:
  - Ring
  - Node
observatory_signals:
  - Stable Concentric Rings
official_file: website/assets/icons/scientific/evidence/confidence-rings.svg
allowed_usage:
  - Confidence label
  - Evidence quality marker
  - Validation summary
forbidden_usage:
  - Target decoration
  - Achievement badge
---
icon: verified-evidence
display_name: Verified Evidence
family: Evidence
primary: Validation
secondary:
  - Verified evidence
primitives:
  - Document
  - Node
  - Check Path
observatory_signals:
  - Verified Reference
official_file: website/assets/icons/scientific/evidence/verified-evidence.svg
allowed_usage:
  - Verified evidence state
  - Evidence validation
  - Supported claim marker
forbidden_usage:
  - Generic success toast
  - Account verification
---
icon: supporting-sources
display_name: Supporting Sources
family: Evidence
primary: Evidence support
secondary:
  - Source set
primitives:
  - Document
  - Connector
  - Node
observatory_signals:
  - Source Alignment
official_file: website/assets/icons/scientific/evidence/supporting-sources.svg
allowed_usage:
  - Supporting references
  - Source list
  - Evidence lineage
forbidden_usage:
  - File upload
  - Generic documents
---
icon: research-archive
display_name: Research Archive
family: Memory & Session
primary: Memory
secondary:
  - Research archive
primitives:
  - Archive
  - Document
  - Frame
observatory_signals:
  - Research Archive
official_file: website/assets/icons/scientific/memory-session/research-archive.svg
allowed_usage:
  - Research Memory Layer
  - Archived references
  - Memory empty state
forbidden_usage:
  - Generic storage
  - Settings category
---
icon: session-timeline
display_name: Session Timeline
family: Memory & Session
primary: Session
secondary:
  - Timeline
primitives:
  - Axis
  - Node
  - Tick
observatory_signals:
  - Session Timeline
official_file: website/assets/icons/scientific/memory-session/session-timeline.svg
allowed_usage:
  - Session history
  - Research timeline
  - Memory chronology
forbidden_usage:
  - Generic calendar
  - Deadline marker
---
icon: workspace-snapshot
display_name: Workspace Snapshot
family: Memory & Session
primary: Saved workspace state
secondary:
  - Snapshot
primitives:
  - Frame
  - Node
  - Grid
observatory_signals:
  - Captured Workspace
official_file: website/assets/icons/scientific/memory-session/workspace-snapshot.svg
allowed_usage:
  - Workspace saved state
  - Session restore
  - Snapshot action
forbidden_usage:
  - Screenshot tool
  - Generic image placeholder
---
icon: recent-activity
display_name: Recent Activity
family: Memory & Session
primary: History
secondary:
  - Recent references
primitives:
  - Ring
  - Node
  - Axis
observatory_signals:
  - Recent Orbit
official_file: website/assets/icons/scientific/memory-session/recent-activity.svg
allowed_usage:
  - Recently viewed
  - Activity list
  - Session recap
forbidden_usage:
  - Live status
  - Notification badge
---
icon: knowledge-trail
display_name: Knowledge Trail
family: Memory & Session
primary: Research path
secondary:
  - Trail history
primitives:
  - Node
  - Path
  - Anchor
observatory_signals:
  - Directed Trajectory
official_file: website/assets/icons/scientific/memory-session/knowledge-trail.svg
allowed_usage:
  - Knowledge Trail
  - Research path history
  - Trail empty state
forbidden_usage:
  - Generic route map
  - Progress indicator
---
icon: pinned-references
display_name: Pinned References
family: Collections
primary: Pinned anchors
secondary:
  - Saved reference
primitives:
  - Anchor
  - Node
  - Document
observatory_signals:
  - Pinned Anchor
official_file: website/assets/icons/scientific/collections/pinned-references.svg
allowed_usage:
  - Pinned references
  - Pin action
  - Memory anchors
forbidden_usage:
  - Generic location pin
  - Map marker
---
icon: saved-queries
display_name: Saved Queries
family: Collections
primary: Saved search logic
secondary:
  - Query collection
primitives:
  - Document
  - Signal Ray
  - Node
observatory_signals:
  - Stored Query Signal
official_file: website/assets/icons/scientific/collections/saved-queries.svg
allowed_usage:
  - Saved queries
  - Reopen query action
  - Query collection
forbidden_usage:
  - Generic bookmark
  - Search button replacement
---
icon: reading-queue
display_name: Reading Queue
family: Collections
primary: Deferred reading
secondary:
  - Reading list
primitives:
  - Document
  - Stack
  - Axis
observatory_signals:
  - Deferred Stack
official_file: website/assets/icons/scientific/collections/reading-queue.svg
allowed_usage:
  - Reading queue
  - Deferred reference list
  - Continue reading state
forbidden_usage:
  - Generic file stack
  - Archive
---
icon: collection-folder
display_name: Collection Folder
family: Collections
primary: Organized collection
secondary:
  - Reference group
primitives:
  - Frame
  - Document
  - Node
observatory_signals:
  - Organized Collection
official_file: website/assets/icons/scientific/collections/collection-folder.svg
allowed_usage:
  - Reference collection
  - Organized group
  - Collection empty state
forbidden_usage:
  - Filesystem folder
  - Generic storage
---
icon: metadata-panel
display_name: Metadata Panel
family: Inspector
primary: Metadata
secondary:
  - Reference attributes
primitives:
  - Frame
  - Grid
  - Axis
observatory_signals:
  - Structured Metadata
official_file: website/assets/icons/scientific/inspector/metadata-panel.svg
allowed_usage:
  - Metadata section
  - Inspector metadata
  - Reference attributes
forbidden_usage:
  - Generic table
  - Settings form
---
icon: document-review
display_name: Document Review
family: Inspector
primary: Document analysis
secondary:
  - Review state
primitives:
  - Document
  - Lens
  - Signal Ray
observatory_signals:
  - Focused Review
official_file: website/assets/icons/scientific/inspector/document-review.svg
allowed_usage:
  - Document review
  - Inspector analysis
  - Reference inspection state
forbidden_usage:
  - Generic search
  - Document upload
---
icon: annotation
display_name: Annotation
family: Inspector
primary: Note/annotation
secondary:
  - Research note
primitives:
  - Document
  - Anchor
  - Path
observatory_signals:
  - Annotated Reference
official_file: website/assets/icons/scientific/inspector/annotation.svg
allowed_usage:
  - Annotation
  - Research note
  - Inspector note section
forbidden_usage:
  - Chat message
  - Generic edit action
---
icon: reference-details
display_name: Reference Details
family: Inspector
primary: Reference inspection
secondary:
  - Reference details
primitives:
  - Document
  - Frame
  - Node
observatory_signals:
  - Reference Frame
official_file: website/assets/icons/scientific/inspector/reference-details.svg
allowed_usage:
  - Reference Inspector
  - Detail panel
  - Active reference summary
forbidden_usage:
  - Generic profile
  - Navigation item
```
