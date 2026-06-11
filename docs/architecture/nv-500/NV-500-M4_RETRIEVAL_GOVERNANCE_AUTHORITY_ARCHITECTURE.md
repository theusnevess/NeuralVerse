# Retrieval Governance Authority Architecture (NV-500-M4)

## 1. Governance Authority definition
*   **Authority Name:** `Retrieval Governance Authority`
*   **Purpose:** The sole authority responsible for validating reference identities, maintaining index records, mapping cross-project linkages, and preserving global retrieval consistency.

---

## 2. Scope of Responsibilities

### What the Authority OWNS:
*   **Reference Discoverability:** Naming indexes and lookup keys for research inputs.
*   **Evidence Retrieval:** Rules for aggregating synthesized logs from multiple projects.
*   **Cross-Project Navigation:** Mapping relationships and directional links across research boundaries.
*   **Reference Reuse Discovery:** Tracking shared resources (e.g. source publications, datasets).
*   **Retrieval Continuity:** Preserving navigation memory for search queries.
*   **Retrieval Relationship Management:** Verifying connection types and weights between references.

### What the Authority DOES NOT OWN:
*   `Knowledge Governance` (Owned by `KnowledgeDomain`)
*   `Research Governance` (Owned by `ResearchProject`)
*   `Learning Governance` (Owned by `LearningPath`)
*   `Content Governance` (Owned by `ContentItem` layout)
*   `Workspace Governance` (Owned by `Workspace` system state)

---

## 3. Combined Authority Model
The relationships between existing authorities are mapped cleanly:

```text
KnowledgeDomain ➔ Owns canonical knowledge
ResearchProject ➔ Owns local investigations
LearningPath    ➔ Owns learning progression
ContentItem     ➔ Owns content identity
Workspace       ➔ Owns operational environment state
Retrieval Governance Authority ➔ Owns retrieval responsibilities
```

---

## 4. Scope Gate Boundary
> [!IMPORTANT]
> **M4 defines authority boundaries only.**
>
> It does **NOT** define retrieval structures (Registry, Graph, Index), metadata schemas, lifecycle progression, or database storage mechanisms.
