# NeuralVerse Backend Cross-Front Decision Registry

Canonical identifier: `NV-BIP-M0-P6-CROSS-FRONT`<br>
Version: `1.0`<br>
Status: `DECIDED WITH CONDITIONS`<br>
Owner: NeuralVerse project owner with semantic owners listed per decision<br>
Authority: BIP-M0 Phase 6 and approved NeuralVerse semantic authorities<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-implementation-sequence.md`<br>
Supersession: CF-010, CF-011, and CF-012 are superseded by `NV-XFI-000`; later implementation statuses remain separate<br>
Last review date: `2026-07-17`

## BIP-M2-P0 Decision Package

`BIP-M2-P0` is `IMPLEMENTED` as the documentation and readiness package for `BIP-M2 — Canonical Handoff Intake and Content Versioning Foundation`. `NV-XFI-000` closes CF-010, CF-011, and CF-012 as governance decisions. The detailed package is `backend-platform-bip-m2-cross-front-readiness.md`; the implementation plan remains blocked on artifact foundation certification.

The certified backend Level 2 fixture remains non-canonical. The certified ACP evidence is limited to commit `b397035a9cfc3d376afc31633583f2b9ecd76548`; later ACP worktree changes are not consumed as authority.

The current option matrix is:

| Decision | Prepared recommendation | Required authority | Status |
|---|---|---|---|
| CF-010 representation | JSON Schema 2020-12 plus normative semantic documentation; generated projections; OpenAPI transport-only | NeuralVerse Hub, ACP, BIP, frontend authority | `ACCEPTED` |
| CF-011 placement | Hub-governed neutral shared-contract source at the approved contracts front | NeuralVerse Hub and semantic owners | `ACCEPTED` |
| CF-012 clients | Approved semantic artifacts plus BIP-owned transport adapter; generated API clients only from approved transport contracts | NeuralVerse Hub, frontend authority, BIP | `ACCEPTED` |

These decisions are approved by `NV-XFI-000`. No implementation artifact is created by this adoption change; only `NV-XFI-M1` is authorized next.

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
| CF-010 | Shared contract authority | Backend transport/tooling | Canonical semantics and version principles | JSON Schema 2020-12 plus normative semantic document | Neutral machine-readable source | `ACCEPTED` |
| CF-011 | Project owner/semantic owners | Backend platform | Ownership split and no table-shape coupling | Approved neutral contracts front | Explicit governed contract location | `ACCEPTED` |
| CF-012 | Project owner/frontend authority | Backend platform | Frontend consumes typed published-package delivery | BIP-owned transport adapter over approved outputs | Typed/validated client boundary | `ACCEPTED` |
| CF-013 | Curriculum authority | Backend curriculum projection | ACP curriculum authority; backend projection; incremental migration | Cutover and parity gate | Static authority until validated projection | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |
| CF-014 | Content/publication authority | Backend publication module | Exact package/content/lab/assessment/release references required | Encoding and historical migration | Require exact version/release for new durable records | `RESOLVED_BY_CANONICAL_SOURCE` |
| CF-015 | Retrieval/semantic authority | Backend search module | Backend retrieval/storage boundary; agent tooling/model decisions deferred | Embedding/chunking owner and index contract | PostgreSQL persistence without unilateral model choice | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` |

## Cross-Front Decisions Required Before Real Semantic Data

The first vertical slice may use a clearly marked test fixture because it does not invent canonical semantics. Real curriculum, agent-generated, laboratory, assessment, asset, or embedding payloads require the applicable approved contract artifacts and implementation gates above; approval of CF-010/011/012 does not constitute implementation.

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
