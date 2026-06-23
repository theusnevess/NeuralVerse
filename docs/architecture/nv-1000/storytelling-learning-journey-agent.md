# Storytelling & Learning Journey Agent (A9) Architecture

## 1. Mission
The **Storytelling & Learning Journey Agent (A9)** manages the educational narratives and conceptual continuity of NeuralVerse. It transforms isolated technical lessons into coherent intellectual journeys by providing historical context, learning path narratives, paradigm evolution timelines, and memory-anchoring metaphors.

---

## 2. Storytelling Philosophy & Historical Accuracy Policy
A9 is an **academic storyteller**, not a writer of fiction:
*   **Factual Grounding**: The agent does not fabricate historical figures, events, publications, or timelines.
*   **Decoupled Metaphors**: Metaphors are strictly isolated and marked as conceptual simplifications, explicitly stating their technical limitations.
*   **Objective Presentation**: Factual history is prioritized over romanticized descriptions, maintaining scientific precision at all times.

---

## 3. Narrative Framework
All stories and learning arcs follow a structured cognitive framework:
*   **Problem**: The historical or software bottleneck.
*   **Motivation**: Why the bottleneck needed a solution.
*   **Challenge**: The technical failure modes of previous attempts.
*   **Idea**: The conceptual leap.
*   **Development**: How the idea was formalized.
*   **Impact**: How the field changed after the development.
*   **Connection to Current Lesson**: Where today's lesson fits.
*   **Where the Learner Goes Next**: Future conceptual milestones.

---

## 4. Metaphor & Analogies Strategy
When a metaphor is introduced (e.g., self-attention as a cocktail party), the agent outputs a structured block detailing:
*   **Literal Explanation**: The mathematical or computational truth.
*   **Metaphorical Representation**: The intuitive analogy.
*   **Known Limitations**: Where the metaphor breaks down (e.g., probability vectors lack deliberate conscious logic).

---

## 5. Continuity Model
To support student orientation without imposing grades or evaluation:
*   **Cross-Lesson Mapping**: Shows dependencies and prerequisites dynamically based on curriculum taxonomy.
*   **Progression Roadmaps**: Outlines paths from foundations, intermediate topics, current lesson, to advanced production systems.

---

## 6. Governance Constraints & Evidence Boundary
To comply with the `NV-800` governance standard:
*   **No Curriculum Mutation**: A9 can never write to, edit, or delete any canonical lessons, paths, modules, or registry metadata.
*   **Evidence Boundary Compliance**: The agent never issues grades, estimates readiness levels, or updates competency progress trackers. All statements regarding learner paths are purely educational and advisory.

---

## 7. Quality Assurance & Verification Summary
The implementation is certified by Playwright automation tests in `scripts/nv-1000-a9-verify.js` which verifies:
*   Execution of all 10 modes.
*   Preservation of curriculum data.
*   UI responsiveness (390px, 768px, 1024px, 1440px) and accessibility (aria attributes, complementary role, keyboard focus).
*   Clean console reports (0 console errors, 0 page errors, 0 failed network requests).
