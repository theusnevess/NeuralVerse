# NeuralVerse Backend Cross-Front Decision Registry

Canonical identifier: `NV-BIP-M0-P6-CROSS-FRONT`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner with semantic owners listed per decision<br>
Authority: BIP-M0 Phase 6 and approved NeuralVerse semantic authorities<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-implementation-sequence.md`<br>
Supersession: None; unresolved entries remain open until their semantic owner decides<br>
Last review date: `2026-07-16`

## Phase 6.5 and Phase 7 Evidence Baseline

The detailed repository evidence is recorded in `backend-platform-shared-contract-inventory.md`; canonical reconciliation is recorded in `backend-platform-canonical-reconciliation.md`. The external `NV-BIP-000` and `NV-ACP-000` sources are verified and remain `PROPOSED` / `PRE-NV-3000 ARCHITECTURE SOURCE`. CF-001 through CF-015 are no longer uniformly open: their semantic and minimum-field portions are narrowed by canonical sources, while representation and future Cross-Front Integration Contract portions remain open.

Committed agent contracts are evidence of front-local implementation, not shared authority. A previous environmental observation found uncommitted generated files `website/dist/atlas-browser.js` and `website/dist/react-islands.js` in the agent worktree; this is `PREVIOUS ENVIRONMENTAL OBSERVATION`, remains outside the certified ACP baseline, and is excluded from contract authority.

The highest-risk findings are ContentBlock/evidence shape and ordering divergence, lossy evidence export, missing package/content-version/release identity, overlapping provenance models, mixed laboratory specification/execution boundaries, mixed assessment specification/attempt boundaries, and inconsistent unknown-field policies.

## Reconciled Status Rules

- `BACKEND_OPERATIONAL_DECISION`: backend may freeze implementation details without changing meaning.
- `AGENT_SEMANTIC_DECISION`: agent/content authority owns meaning; backend only preserves and transports it.
- `SHARED_DECISION`: both fronts must approve before a durable contract is frozen.
- `IMPLEMENTED`: evidence exists in the repository and is safe to consume as-is.
- `PARTIAL`: some evidence exists, but compatibility or ownership is incomplete.
- `MISSING`: no repository contract was found.
- `CROSS_FRONT_DECISION_REQUIRED`: implementation must not invent the missing semantic decision.

Canonical-definition statuses are independent from implementation statuses: `CANONICALLY_DEFINED`, `CANONICALLY_PARTIAL`, `CANONICALLY_REFERENCED_ONLY`, `NOT_DEFINED_IN_AVAILABLE_CANONICAL_SOURCES`, and `CROSS_FRONT_SCHEMA_REQUIRED`; implementation statuses are `IMPLEMENTED_RUNTIME_VALIDATED`, `IMPLEMENTED_COMPILE_TIME_ONLY`, `IMPLEMENTED_PARTIAL`, `IMPLEMENTED_DIVERGENT`, `DOCUMENTED_TARGET_ONLY`, `MISSING`, and `DUPLICATED_AUTHORITY`.

## Registry

| ID | Semantic owner | Operational owner | Evidence | Blocked area | Compatible options | Status |
|---|---|---|---|---|---|---|
| CF-001 | Curriculum/content authority | Backend content module | Canonical stable package/version/release/entity ID families | Exact namespaces and legacy aliases | Stable opaque semantic IDs; DB keys separate | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-002 | Content/agent authority | Backend JSONB boundary | Canonical block taxonomy, required metadata, semantic order, no frontend styling | Exact union/envelope/extension encoding | Ordered lossless semantic payload | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-003 | Content/governance authority | Backend provenance tables | Provenance, citations, source metadata, claim relationships, manifests | Exact source/citation/link aggregate | Separate source/citation/claim structures | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-004 | Asset/content authority | Backend assets module | Stable asset/version, hash, MIME, provenance, license, accessibility | Exact shared encoding and storage projection | Managed immutable asset reference | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-005 | Laboratory/agent authority | Backend laboratory adapter | Canonical lab specification fields and exact run version bindings | Exact spec/config/run/evidence envelopes | Separate specification and execution records | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-006 | Assessment/agent authority | Backend assessments module | Assessment requirements and exact attempt/content-version binding | Exact attempt/evidence/feedback encoding | Separate specification and immutable attempt evidence | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-007 | Governance authority | Backend publication module | Exact recommendation enum, coverage, findings, review, backlog, rationale | Exact review linkage and transport shape | Recommendation is not publication authority | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-008 | Shared contract authority | Backend transport layer | Required version metadata and major/minor/patch compatibility rules | Language-neutral enforcement | Reject unknown major; preserve compatible unknown fields | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-009 | Shared contract authority | Backend persistence adapter | Silent discard forbidden; compatible optional fields preserved | Raw/typed preservation implementation | Lossless semantic payload boundary | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-010 | Shared contract authority | Backend transport/tooling | Canonical semantics and version principles | Exact language-neutral representation | JSON Schema/OpenAPI/manual option analysis | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` |
| CF-011 | Project owner/semantic owners | Backend platform | Ownership split and no table-shape coupling | Shared contract repository/package placement | Explicit governed contract location | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` |
| CF-012 | Project owner/frontend authority | Backend platform | Frontend consumes typed published-package delivery | Client generation and adapter ownership | Typed/validated client after schema decision | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` |
| CF-013 | Curriculum authority | Backend curriculum projection | ACP curriculum authority; backend projection; incremental migration | Cutover and parity gate | Static authority until validated projection | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-014 | Content/publication authority | Backend publication module | Exact package/content/lab/assessment/release references required | Encoding and historical migration | Require exact version/release for new durable records | `RESOLVED_BY_CANONICAL_SOURCE` |
| CF-015 | Retrieval/semantic authority | Backend search module | Backend retrieval/storage boundary; agent tooling/model decisions deferred | Embedding/chunking owner and index contract | PostgreSQL persistence without unilateral model choice | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |

## Cross-Front Decisions Required Before Real Semantic Data

The first vertical slice may use a clearly marked test fixture because it does not invent canonical semantics. Real curriculum, agent-generated, laboratory, assessment, asset, or embedding payloads require the applicable registry entries above to move from `CROSS_FRONT_DECISION_REQUIRED` to an approved status.

The backend may preserve opaque JSONB payloads and exact identifiers while these decisions remain open. It may not reinterpret content blocks, choose publication meaning, infer assessment semantics, or declare an embedding model authoritative.

## Backend-Owned Decisions

The backend may independently freeze:

- database primary keys and foreign-key indexes;
- persistence timestamps and UTC handling;
- SQLAlchemy session lifecycle;
- transaction boundaries;
- idempotency storage and request fingerprinting;
- audit and outbox table shape;
- correlation IDs and HTTP error mapping;
- health-check implementation;
- typed configuration loading and validation;
- secret loading and redaction;
- database connection pooling;
- Alembic revision execution policy;
- deployment process shape;
- operational retry and timeout defaults.

These decisions must preserve semantic identifiers, schema versions, source provenance, and unknown compatible fields. They must not rename or reinterpret shared concepts without a registry decision.

## Contract Compatibility Rules

- Every durable semantic snapshot carries an explicit contract/schema version once the shared authority defines it.
- Compatible unknown fields are preserved at the JSONB boundary where possible.
- Incompatible versions are rejected with `UNSUPPORTED_SCHEMA_VERSION` rather than silently downgraded.
- Backend transport schemas may be stricter than stored JSONB, but lossless storage must remain available for approved future fields.
- Publication releases reference immutable content versions; learner interactions reference exact content versions and releases.
- Backend-generated operational IDs do not replace semantic IDs from the owning front.
