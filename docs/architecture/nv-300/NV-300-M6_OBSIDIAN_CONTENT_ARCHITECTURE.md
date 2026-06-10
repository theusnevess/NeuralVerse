# Obsidian Content Architecture (NV-300-M6)

## 1. Executive Assessment
*   **Status:** `NV-300-M6 COMPLETE`
*   **Decision:** `APPROVE HYBRID OBSIDIAN ARCHITECTURE`
*   **Purpose:** Outlines the directory structure and referencing system used to organize and author content using markdown editors like Obsidian while preserving strict ownership rules.

---

## 2. Candidate Comparison Matrix

| Criteria | Flat Structure | Nested Domain Structure | Hybrid Obsidian Structure (Approved) |
| :--- | :--- | :--- | :--- |
| **Ownership Isolation** | Poor (all files in one bucket) | Excellent | **Excellent** |
| **Refactoring Safety** | Easy (simple slugs) | Hard (paths change) | **Excellent** (slug-based referencing) |
| **Authoring Usability** | Good | Moderate (deep nesting navigation) | **Excellent** (scoped workspaces) |

---

## 3. Canonical Obsidian Directory Structure
The approved folder layout inside the repository is structured as follows:

```text
neuralverse/
    domains/      # Domain configuration files (YAML/JSON)
    paths/        # Pedagogical route definition maps
    modules/      # Learning module definitions and layouts
    content/      # Canonical Markdown content files organized by domain
    taxonomy/     # Approved vocabulary terms and tags
    governance/   # Documentation and governance checklists
    templates/    # Standardized frontmatter and content templates
```

---

## 4. Ownership Preservation Analysis
ContentItems are stored in folder subtrees matching their canonical `KnowledgeDomain` inside `/content/` (e.g. `/content/mathematics/linear-algebra-basics.md`). Changing a `LearningPath` module order does not relocate files in the `/content/` subtree. This guarantees absolute physical ownership stability.

---

## 5. Cross-Domain Reuse Analysis
Obsidian's internal wikilink format (`[[content-slug]]`) or relative file path references are leveraged during authoring. A content file can be linked from any other file or module configuration without moving the target out of its parent domain folder.

---

## 6. Content Location Strategy
All content items must reside under `/content/<domain-slug>/<topic-slug>/<filename>.md`. Standardized templates under `/templates/` enforce correct metadata frontmatter before files are indexed into the application.

---

## 7. Authoring Workflow Analysis
1.  **Select Template:** Author copies a template from `/templates/content_item.md`.
2.  **Define Location:** File is saved under the appropriate `/content/<domain>/` directory.
3.  **Assign frontmatter metadata:** Slugs, parent IDs, and keyword tags are defined.
4.  **Reference in Module:** The content ID is added to `/modules/<module-slug>.json`.

---

## 8. Final Decision
> [!IMPORTANT]
> **Decision: APPROVE HYBRID OBSIDIAN ARCHITECTURE**
>
> The Hybrid Obsidian Architecture is approved, establishing the physical folder constraints and template standards for markdown-based knowledge authoring.
