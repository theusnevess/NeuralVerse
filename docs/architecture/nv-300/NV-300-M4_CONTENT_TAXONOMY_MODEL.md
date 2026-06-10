# Content Taxonomy Model (NV-300-M4)

## 1. Executive Assessment
*   **Status:** `NV-300-M4 COMPLETE`
*   **Decision:** `APPROVE HYBRID TAXONOMY`
*   **Purpose:** Establishes the canonical organizational structure for knowledge content to prevent structural classification chaos when content scales.

---

## 2. Candidate Comparison
Three candidate approaches were evaluated for NeuralVerse taxonomy:

1.  **Strict Hierarchical (Tree):** Flat nested directories (`Domain -> Topic -> Subtopic`). High structural discipline, but fails to accommodate interdisciplinary topics.
2.  **Flat Tagged Network (Graph):** No folder structure, only tag-based relations. Highly flexible, but leads to taxonomy drift, namespace collisions, and unmanaged complexity.
3.  **Hybrid Taxonomy (Approved):** Strict hierarchical containment for canonical ownership, coupled with non-hierarchical tagging for cross-domain association.

---

## 3. Approved Hybrid Taxonomy & Canonical Model
The approved taxonomy combines hierarchy for ownership and tag lists for flexible relationships:

```text
KnowledgeDomain
    ↓
Topic
    ↓
Subtopic
    ↓
ContentItem
        ↓
Tags (Multi-domain linkage)
```

### Details:
*   **KnowledgeDomain:** Broad canonical classification (e.g. Mathematics, Programming).
*   **Topic:** Group of related conceptual fields (e.g. Linear Algebra, Algorithms).
*   **Subtopic:** Specific theoretical or practical focus area (e.g. Matrix Operations, Sorting).
*   **ContentItem:** The individual knowledge unit (Markdown content file).
*   **Tags:** Non-hierarchical metadata labels permitting cross-domain referencing (e.g. `#optimization`, `#research`).

---

## 4. Taxonomy Drift Analysis
Without strict hierarchical parent-child definitions, taxonomy decays due to ad-hoc subtopic creation. By anchoring each `ContentItem` to a single parent `Subtopic` and parent `Topic`, we establish a locked taxonomy root. Any tagging of items remains dynamic and poses no threat to namespace stability.

---

## 5. Scalability Analysis
The hybrid model is structured to scale cleanly:
*   **100 items:** Small enough to fit in simple topics.
*   **1000 items:** Handled seamlessly by the subtopic layer.
*   **10000+ items:** Scaled without modifying the structural architecture, using tags and cross-references.

---

## 6. Cross-Domain Analysis
Cross-domain reuse is facilitated by the non-hierarchical tags. A `ContentItem` belongs canonically to `Mathematics/Linear Algebra`, but can carry tags like `#machine-learning` or `#computer-vision`, allowing other domains to query or reference the item without duplicating file storage.

---

## 7. Architectural Risks
*   **Tag Over-Proliferation:** Users creating hundreds of redundant tags. *Mitigation: Restrict tags to validated lists.*
*   **Deep Nesting Drift:** Attempting to extend subtopics to sub-subtopics. *Mitigation: Lock the taxonomy hierarchy depth strictly at: Domain -> Topic -> Subtopic -> ContentItem.*

---

## 8. Final Decision
> [!IMPORTANT]
> **Decision: APPROVE HYBRID TAXONOMY**
>
> The Hybrid Taxonomy Model is officially approved, establishing the single canonical root containment model while maintaining tags for flexible cross-domain linkages.
