# Retrieval Metadata Architecture (NV-500-M7)

## 1. Metadata Model Evaluation & Decision
We evaluated whether a single metadata model is sufficient to describe all retrieval assets.

*   **Hypothesis NV500-H7:** *A single canonical metadata model is sufficient for all retrieval assets.*
*   **Result:** **ACCEPTED**
*   **Decision:** `Canonical Retrieval Metadata Model APPROVED`

---

## 2. Approved Canonical Metadata Model
The model is divided into four metadata categories corresponding to the classification layers:

### 1. Retrieval Identity Metadata
*   `reference_id`: Unique global reference slug.
*   `reference_type`: Kind of resource (e.g. publication, dataset, repo).
*   `canonical_source`: Original URL or file path.
*   `reference_status`: Identity configuration state.

### 2. Retrieval Access Metadata
*   `discoverability_state`: Visibility flag (public, index-only, private).
*   `access_scope`: Bounding paths allowed to query the reference.
*   `access_priority`: Order priority for search result listing.
*   `retrieval_eligibility`: Boolean indicating search status.

### 3. Retrieval Relationship Metadata
*   `relationship_type`: Semantic link label (e.g. cites, refutes, implements).
*   `relationship_direction`: Directional mapping indicator.
*   `relationship_strength`: Numeric linkage strength value.
*   `relationship_context`: Specific research topic context.

### 4. Retrieval Synthesis Metadata
*   `evidence_set`: Array of source reference IDs.
*   `aggregation_context`: Context for evidence pooling.
*   `evidence_confidence`: Reliability value.
*   `synthesis_scope`: Scope of synthesis output.

---

## 3. Scope Gate Boundary
> [!IMPORTANT]
> **Metadata describes retrieval parameters only.**
>
> It does **NOT** define lifecycle state models, database schemas, search indexing algorithms, query parsers, or implementation logic.
