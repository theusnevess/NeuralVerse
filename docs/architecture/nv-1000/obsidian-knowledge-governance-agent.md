# Obsidian & Knowledge Governance Agent (A8) Architecture

## 1. Mission
The **Obsidian & Knowledge Governance Agent (A8)** serves as the personal knowledge management, taxonomy, and semantic organization assistant of NeuralVerse. It assists the learner in transforming temporal, ephemeral study sessions into durable knowledge graphs, notes, and local structures while preserving curriculum integrity.

---

## 2. Local-First Philosophy & Data Safety
To respect privacy and protect the learner's intellectual capital, the A8 agent operates on a strict **local-first philosophy**:
*   No note contents or personal vault information are transmitted externally.
*   Data indexing and intent parsing execute in the client's browser engine.
*   The agent is strictly advisory: it never writes or mutates files automatically, acting solely as a structural counselor.

---

## 3. Note Taxonomy
A8 recommends a tiered notes classification standard suitable for Zettelkasten and evergreen note architectures:
*   **Evergreen Notes**: Atomic, concept-specific notes containing deep explanations, formulas, and connections in the learner's own words.
*   **Literature Notes**: Summaries and reflections capturing exact references to learning paths, lessons, or modules.
*   **Maps of Content (MOCs)**: Central indexes acting as directories linking multiple related evergreen and literature notes.

---

## 4. Backlink Methodology
Backlink suggestions build semantic links rather than superficial associations:
*   **Justification**: Every suggested link is returned with an explicit logical explanation (e.g. why "Sigmoid Activation" connects to "Gradient Vanishing").
*   **Precision**: Links target conceptual relationships and mathematical pipelines, avoiding speculative or loose word-matching connections.

---

## 5. Concept Mapping Strategy
Instead of altering the global atlas, the agent generates lightweight, readable, textual tree structures detailing:
*   **Hierarchical Paths**: Visualizing parent-child hierarchies of concepts.
*   **Related Nodes**: Identifying siblings and peer topics to clarify structural grouping.

---

## 6. Obsidian Integration Guidance
A8 supports modern knowledge management workflows including:
*   **PARA Method**: Projects, Areas, Resources, and Archives folder segregation.
*   **Zettelkasten Linking**: Linking terms directly using the `[[Note Title]]` syntax.
*   **Daily Notes Integration**: Incorporating daily logs to keep track of study progress.
*   **Trade-Off Presentation**: Explaining folder structures vs flat tag approaches.

---

## 7. Governance Constraints & Evidence Boundary
To comply with the `NV-800` governance standard:
*   **No Curriculum Mutation**: A8 can never modify canonical lessons, modules, learning paths, or registry entries.
*   **Evidence Boundary**: The agent has no access to grading, score metrics, or assessment logs, ensuring no competency evidence is generated.
*   All recommendations remain advisory.

---

## 8. Quality Assurance & Verification Summary
The implementation is certified by Playwright automation tests in `scripts/nv-1000-a8-verify.js` which verifies:
*   Execution of all 10 modes.
*   Non-mutation guarantees (curriculum and registry preservation).
*   UI responsiveness (390px, 768px, 1024px, 1440px) and accessibility (aria attributes, keyboard controls).
*   Clean console reports (0 console errors, 0 page errors, 0 failed network requests).
