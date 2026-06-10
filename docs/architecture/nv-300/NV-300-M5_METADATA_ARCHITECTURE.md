# Metadata Architecture (NV-300-M5)

## 1. Executive Assessment
*   **Status:** `NV-300-M5 COMPLETE`
*   **Decision:** `APPROVE CANONICAL MINIMAL METADATA ARCHITECTURE`
*   **Purpose:** Standardizes the configuration schemas for all learning entities in frontmatter and indices while strictly preventing metadata creep.

---

## 2. Metadata Requirements by Entity

### 1. KnowledgeDomain
*   `id`: Unique slug.
*   `title`: Descriptive title.
*   `description`: Scope statement.

### 2. LearningPath
*   `id`: Unique path slug.
*   `title`: Path title.
*   `description`: Objective.
*   `modules`: Ordered array of module IDs.

### 3. Module
*   `id`: Unique module slug.
*   `pathId`: Parent path ID.
*   `title`: Module title.
*   `order`: Linear sequence number.

### 4. ContentItem
*   `id`: Unique content slug.
*   `moduleId`: Parent module ID.
*   `title`: Concept name.
*   `estimatedReadingTime`: Integer minutes.
*   `order`: Linear sequence number inside module.
*   `domain`: Canonical parent domain.
*   `tags`: Array of string keywords.

---

## 3. Metadata Classification Matrix

| Attribute | Category | Source of Truth |
| :--- | :--- | :--- |
| **System Slugs** | Identity | Hardcoded configuration |
| **Ordering Index** | Sequence | Module / Content configuration |
| **Estimated Reading Time** | Metric | Content item frontmatter |
| **Tags** | Taxonomy | Content item frontmatter |

---

## 4. Metadata Responsibility Matrix

| Entity | Responsible for Defining | Responsible for Consuming |
| :--- | :--- | :--- |
| **KnowledgeDomain** | Domain boundary | Discoverability indexing |
| **LearningPath** | Pedagogical structure | Dashboard / Route rendering |
| **Module** | Sequencing index | Progress aggregation |
| **ContentItem** | Frontmatter metrics | Content viewer & progress logs |

---

## 5. Metadata Minimalism Review
To prevent maintenance overhead, metadata is strictly limited to fields that directly support **navigation, progress tracking, and orientation**. No runtime calculation keys, difficulty assessments, or telemetry markers are permitted in the file metadata.

---

## 6. Metadata Drift Analysis
Metadata schemas can easily drift when content creators introduce ad-hoc variables (e.g., `author`, `difficulty-level`, `publish-date`). Schema validity is preserved by restricting frontmatter parsing to the canonical metadata layout. Unrecognized keys are ignored.

---

## 7. Forbidden Metadata
The following fields are strictly **FORBIDDEN** within NeuralVerse metadata structures:
*   User-level logs (e.g., `completedBy`, `lastReadBy`) -> *belongs to `ProgressRecord` database.*
*   AI telemetry (e.g., `relevanceScore`, `aiClassification`) -> *violates core architectural boundary.*
*   Media asset details (e.g., `heroImage`, `bannerColor`) -> *styling details must stay in CSS.*
*   Content difficulty ratings (e.g., `difficulty: hard`) -> *subjective variables violate metadata integrity.*

---

## 8. Final Decision
> [!IMPORTANT]
> **Decision: APPROVE CANONICAL MINIMAL METADATA ARCHITECTURE**
>
> The Canonical Minimal Metadata Architecture is approved, locking the strict attribute schemas and enforcing schema validation bounds.
