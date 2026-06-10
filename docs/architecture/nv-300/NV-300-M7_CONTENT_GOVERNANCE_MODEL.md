# Content Governance Model (NV-300-M7)

## 1. Executive Assessment
*   **Status:** `NV-300-M7 COMPLETE`
*   **Decision:** `APPROVE MINIMAL CANONICAL CONTENT GOVERNANCE MODEL`
*   **Purpose:** Establishes roles, rights, and policies governing who can modify, assign, or delete canonical content elements to prevent taxonomy corruption.

---

## 2. Governance Responsibility Matrix

| Role | Responsibility | Authority Boundaries |
| :--- | :--- | :--- |
| **Domain Lead** | Taxonomy & Integrity | Approves new subtopics, resolves domain boundaries |
| **Curriculum lead** | Pedagogical Paths | Arranges paths/modules, references existing content items |
| **Author** | Writing Content | Drafts markdown, calculates estimated reading time, assigns tags |

---

## 3. Governance Authority Matrix

| Action | Author | Curriculum Lead | Domain Lead |
| :--- | :--- | :--- | :--- |
| **Create ContentItem** | Yes | No | Yes |
| **Change Item Parent Domain**| No | No | Yes |
| **Create LearningPath** | No | Yes | No |
| **Assign Item to Module** | No | Yes | No |

---

## 4. Drift Prevention Model
To prevent ad-hoc changes from corrupting the repository:
1.  **Strict Linting:** Automated checks validation for frontmatter schema alignment.
2.  **Pull Request Approvals:** Modifying files in `/domains/` or `/taxonomy/` requires sign-off from a Domain Lead.
3.  **Namespace Protection:** Slugs are generated from title text and cannot be changed after publication.

---

## 5. Cross-Domain Governance Model
When multiple learning paths depend on a single shared concept (e.g. "Gradient Descent"), the content file falls under the sole governance authority of its parent domain (Mathematics). Curriculum leads from other paths can request changes via issues but cannot directly modify the text without Domain Lead approval.

---

## 6. Governance Minimalism Review
We reject complex bureaucratic structures (e.g., editorial committees). Governance is implemented entirely through simple directory ownership, file structure rules, and automated pull request validation scripts.

---

## 7. Architectural Risks
*   **Curriculum-Domain Conflict:** A curriculum lead requests alterations to a foundational concept that other paths consume. *Mitigation: Canonical definitions must stay objective and generic. Specialized context belongs in module-specific pages.*
*   **Orphaned Content:** Content items left untagged and unreferenced. *Mitigation: Require reference checks during compilation.*

---

## 8. Final Decision
> [!IMPORTANT]
> **Decision: APPROVE MINIMAL CANONICAL CONTENT GOVERNANCE MODEL**
>
> The Minimal Canonical Content Governance Model is approved, laying down the core permission matrix and PR validation rules.
