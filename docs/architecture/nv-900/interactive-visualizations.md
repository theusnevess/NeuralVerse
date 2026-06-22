# NV-900-UI9 — Interactive Visualizations & Embedded Learning Components Architecture

This document specifies the design principles, registry model, lifecycle hooks, interface design, performance/memory strategy, and styling guidelines for the first-generation interactive educational visualizations in NeuralVerse.

---

## 1. Registry & Lifecycle Model

To maintain the absolute immutability of the NV-800 curriculum corpus, all interactive visualizations are implemented as decoupled client-side JavaScript components. They are mapped to their respective Learning Artifact IDs in a centralized registry.

### 1.1 Central Visualization Registry
The central registry maps `artifact_id` to a dynamic loader function. This allows:
- Separation of concerns: Markdown files describe the specs, while JS implements the runtime.
- Lazy-loading: Visualization components are only fetched/instantiated when their respective artifact page is visited.
- Fallback: Artifacts without visualization implementations continue to render as static specifications.

### 1.2 Component Lifecycle Interface
Every visualization class or module must implement the following standardized lifecycle:
- `initialize(container)`: Mounts the visualization DOM elements inside the parent container, caches DOM nodes, and registers event listeners.
- `render()`: Draws state changes to the screen (via canvas or DOM updates). Called once initially and subsequently on state updates.
- `reset()`: Returns all internal model parameters to their initial default values.
- `destroy()`: Dismantles DOM nodes, removes all window/document/element event listeners, stops active animation loops (e.g. `cancelAnimationFrame`), and nullifies references to prevent memory leaks.

---

## 2. Visualization Catalog

Ten interactive learning components have been implemented, covering all core categories:

| Category | Artifact ID | Description & Interactive Controls |
| :--- | :--- | :--- |
| **Mathematical Foundations** | `artifact-distance-metrics-interactive-visualization` | 2D vector coordinate explorer with draggable arrowheads. Displays live Euclidean distance, Cosine similarity, and Dot product calculations. |
| **Embeddings & Retrieval** | `artifact-nearest-neighbor-search-interactive-visualization` | Interactive 2D vector space with a draggable query point. Computes and highlights the K-nearest neighbors under Cosine vs. Euclidean distance. |
| **RAG & Search** | `artifact-rag-foundations-interactive-visualization` | Pipeline step explorer with interactive animation phases: Retrieve (select queries), Augment (assemble context prompts), and Generate (trigger LLM simulation). |
| **Transformers** | `artifact-self-attention-interactive-visualization` | Self-attention matrix explorer. Displays a visual heatmap of attention weights between tokens (e.g., "The", "bank", "of", "the", "river"). Weights update live on token selection. |
| **CNN & Computer Vision** | `artifact-convolution-intuition-interactive-visualization` | 2D pixel grid convolving with customizable kernels (Sharpen, Blur, Edge Detection) using adjustable Stride and Padding sliders. Animation highlights current receptive fields. |
| **Object Detection** | `artifact-object-detection-fundamentals-interactive-visualization` | Bounding box spatial editor. Allows dragging/resizing predictions and targets to dynamically calculate and visualize the Intersection over Union (IoU) metric. |
| **Segmentation** | `artifact-encoder-decoder-segmentation-interactive-visualization` | Semantic segmentation mask overlays. Features class-level visibility toggles and opacity sliders to demonstrate how the model parses pixel classes. |
| **Probability & Statistics** | `artifact-bayes-theorem-interactive-visualization` | Probability space visualizer. Updates prior, likelihood, and marginal likelihood sliders to show how posterior probability updates dynamically in Venn diagrams. |
| **Machine Learning** | `artifact-overfitting-underfitting-interactive-visualization` | Polynomial curve-fitting interactive regression. Add/drag data points and adjust model degree/complexity to visualize overfitting, underfitting, and train/test splits. |
| **Deep Learning** | `artifact-forward-propagation-interactive-visualization` | Multi-layer perceptron flow. Click inputs to trigger step-by-step forward propagation animations, visualizing activation function outputs (ReLU, Sigmoid, Tanh) at hidden nodes. |

---

## 3. Keyboard & Screen Reader Accessibility

- **Focus Management**: All interactive controls (buttons, inputs, sliders, draggable elements) use native HTML inputs where possible, or are given `tabindex="0"`, `role="slider"`, and `aria-label` attributes to ensure keyboard accessibility.
- **Keyboard Controls**: Draggable coordinates and bounding boxes can be manipulated using arrow keys (`ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`).
- **Focus Outlines**: Focused elements receive high-contrast visual outlines to maintain standard focus indicators.
- **Aria Updates**: Live calculations and stages expose `aria-live="polite"` where appropriate, informing assistive technologies of dynamic updates.

---

## 4. Performance & Memory Management

- **Animation Loops**: No animation loops are left running. Animations use `requestAnimationFrame` and keep track of handles, which are canceled inside the `destroy()` hook.
- **Event Listeners**: All event listeners registered on `window`, `document`, or parent elements are tracked and removed in `destroy()`.
- **Memory Footprint**: Elements are locally scoped within the visualization instance container. Navigating away triggers garbage collection by tearing down references.
- **Motion Reduction**: Visualizations detect the browser preference via `window.matchMedia('(prefers-reduced-motion: reduce)')`. When active, animations are skipped or run instantly.

---

## 5. Preservation & Evidence Boundaries

- **Presentation Layer Only**: Visualizations only augment the user interface during active reading. No persistent masteries, scores, or competency credits are recorded.
- **Corpus Integrity**: The JSON index and Markdown content files remain 100% unaltered.
