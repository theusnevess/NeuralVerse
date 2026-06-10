# Research Workspace Architecture (NV-400-M7)

## 1. Executive Assessment
*   **Milestone:** `NV-400-M7`
*   **Status:** `COMPLETE`
*   **Result:** `Research Workspace Architecture Defined`
*   **Decision:** `APPROVE` (Hybrid Workspace model)

---

## 2. Workspace Candidate Comparison Matrix
We evaluated four workspace models to determine the optimal structure for representing research hierarchy and continuity without infringing on existing authorities:

| Workspace Model | Strengths | Weaknesses | Architectural Fit |
| :--- | :--- | :--- | :--- |
| **Project-Centric** | Excellent clarity at small scale. Direct link to governance unit. | Poor discoverability across research areas. Fragmentation at scale. | Moderate |
| **Area-Centric** | Clean layout grouping broad academic blocks. | Fails to show cross-area collaborations or specific project focus. | Poor |
| **Topic-Centric** | High domain-specific granularity. | High navigation complexity; taxonomy drift risk. | Poor |
| **Hybrid Workspace (Approved)** | Combined Area/Topic classification sidebar navigation + centralized Project execution views. | Requires clear routing index mapping definitions. | **Excellent** |

---

## 3. Workspace Navigation Model
The Hybrid Workspace model leverages a three-tier navigation system:
1.  **Sidebar Area Explorer:** Users navigate at the highest levels of classification (`ResearchArea` -> `ResearchTopic`).
2.  **Central Project Dashboard:** Selection of a topic displays active, pending, and completed `ResearchProjects`.
3.  **Project Workspace (Operational View):** Displays the selected project's metadata, focus, themes, and outputs.

---

## 4. Workspace Continuity Model
To support continuity without evolving into a complex graph or CMS, the workspace surfaces project outputs referentially:
*   **Research Findings:** Raw research outputs associated with the active `ResearchProject`.
*   **Research Synthesis:** Aggregated analysis or status overviews of the project.
*   **Knowledge Candidates:** Documented concepts developed during research that are flagged for eventual ingestion by a `KnowledgeDomain` (Content Expansion system).
*   **Related ResearchProjects:** Linear cross-references based on shared `ResearchThemes` or `Tags`.

---

## 5. Workspace Scalability Analysis
We analyzed the workspace performance and sustainability at three scale points:

*   **10 Projects:** Highly performant; simple list-based renders.
*   **100 Projects:** Managed by the sidebar's `ResearchArea` categorization grid.
*   **1000+ Projects:** Scaled safely without navigation degradation by rendering a filtered search/browse view per topic and paginating project results.

---

## 6. Workspace Drift Analysis

### Risks:
*   **Workspace Authority Leakage:** The workspace attempting to dictate research approval states. *Mitigation: Keep the workspace strictly read-only regarding project states. Authority remains inside the `ResearchProject` file definition.*
*   **Governance Leakage:** The UI permitting arbitrary creation of domains or paths. *Mitigation: Restrict workspace modifications to runtime state mapping only.*

---

## 7. Canonical Research Workspace Architecture
The approved operational environment model is defined as:

```text
ResearchArea (Scope boundary)
    ↓
ResearchTopic (Sub-specialty boundary)
    ↓
ResearchProject (Central execution unit & governance authority)
        ├─ ResearchTheme (Cross-cutting concept tags)
        ├─ Research Findings (Markdown logs / raw outputs)
        └─ Knowledge Candidates (Taxonomy ingestion queue)
```

---

## 8. Final Decision
> [!IMPORTANT]
> **Decision: APPROVE HYBRID WORKSPACE MODEL**
>
> The Hybrid Workspace model is approved, defining the official operational mapping for Research projects without introducing unauthorized backend code, AI recommenders, or database models.

---

## 9. Next Milestone
### NV-400-M8
*   **Title:** `Research Governance Model`
*   **Purpose:** Determine how research architecture is preserved over time without altering approved authorities, classifications, metadata, or workspace architecture.
