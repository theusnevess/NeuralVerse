# Agent A3: Visual & Interactive Media

## Purpose

Provides guidance on visualizations, diagrams, interactive media, and graphical representations of concepts. Helps users understand which visual tools are available and how to interpret them.

## Educational Role

Visual learning assistant. A3 directs users to appropriate visualizations, explains visual concepts, and provides intuition through media.

## Supported Modes

10 intents:

| Mode | Trigger Keywords | Behavior |
|------|-----------------|----------|
| `visual_intuition` | "visualize", "intuition", "see" | Visual intuition explanation |
| `diagram` | "diagram", "chart", "plot" | Diagram description and interpretation |
| `interactive_spec` | "interactive", "play", "explore" | Interactive visualization specification |
| `comparison` | "compare visually", "visual diff" | Visual comparison guidance |
| `animation` | "animation", "animate", "process" | Process animation description |
| `timeline` | "timeline", "history", "evolution" | Historical timeline of concept |
| `mathematical` | "formula", "equation", "plot" | Mathematical visualization guidance |
| `illustration` | "illustrate", "draw", "sketch" | Conceptual illustration description |
| `atlas` | "atlas", "graph", "map" | Atlas graph navigation guidance |
| `media_selection` | (default) | Best visualization medium recommendation |

## Intent Routing

Pattern matching against visualization-related keywords in the user query. Falls back to `media_selection` for ambiguous requests.

## Response Structure

Responses include:
- Visualization descriptions and step-by-step interpretation guides
- Interactive specification notices (clarifying that actual visualizations are in the curriculum)
- Comparison guidance with visual elements described textually
- Timeline representations

## Safety Constraints

- Forbidden actions: modify-curriculum, alter-lifecycle-status, create-mastery-claims, generate-scores, invoke-external-llms
- Cannot create new visualizations or modify existing ones
- Visual descriptions are textual; actual interactive visualizations must be accessed through the curriculum

## Integration Points

- **Visualization Registry**: References registered visualizations for the current artifact
- **Curriculum Service**: Reads artifact content for visualization context
- **Curriculum Controller**: Shares visualization ID space

## UI Behavior

When A3 is selected:
- Quick actions show 10 visualization-related prompts
- Responses may include visual-card section types
- References artifact-specific visualizations when available

## Examples of Use

- "What does attention look like?" → Visual intuition with diagram description
- "Is there an interactive visualization for backpropagation?" → Interactive spec notice
- "Show me the evolution of object detection" → Timeline mode

## Limitations

- Cannot render or create actual visualizations
- Interactive visualization artifacts require registry entry; otherwise shows specification only
- All descriptions are textual

## Related Chapters

- [Didactic Agent Runtime](11-didactic-agent-runtime.md)
- [Atlas System](10-atlas-system.md)
- [Learning Experience](06-learning-experience.md)
