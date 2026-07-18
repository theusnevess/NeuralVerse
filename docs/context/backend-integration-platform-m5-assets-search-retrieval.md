# BIP-M5 — Assets, Search and Retrieval Platform

## Status

`IMPLEMENTED_WITH_INFRASTRUCTURE_CERTIFICATION_BLOCKED_ENVIRONMENT`

The BIP-M5 deterministic domain, application boundaries, PostgreSQL
migration and unit/reference implementations are present. Full
certification remains conditional on a non-production PostgreSQL 16
database with `pgvector` and an S3-compatible service.

## Scope and authority

BIP-M5 owns immutable asset-version metadata, object-storage consistency,
asset integrity/readiness, lexical search, approved vector retrieval,
hybrid ranking and governed index freshness. It does not add public API
routes, learner state, ACP agent semantics, a separate vector database,
Frontend behavior or BIP-M6+ functionality.

Semantic authority remains in the canonical ACP/BIP contracts. Storage and
search adapters expose provider-neutral ports; S3 and PostgreSQL-specific
types are confined to infrastructure/persistence.

## Implemented boundaries

- `AssetStorageKey` is immutable and generated from asset/version identity
  and a lowercase SHA-256 content hash. Traversal, absolute paths, control
  characters and mutable `latest` references are rejected.
- `AssetUploadService` records the explicit uploading → object HEAD
  verification → available protocol. PostgreSQL and S3 are not treated as
  one atomic transaction; failure remains visible for reconciliation.
- Integrity, availability, license, accessibility and scientific-review
  evidence are modeled separately from asset identity.
- `AssetCommand` carries command/idempotency, expected bytes/MIME/hash,
  actor and correlation/causation lineage. Stable failure codes and an
  immutable exact-version `ReadinessAcknowledgement` prevent retries from
  fabricating a new object or approval; unknown required gates remain
  `UNKNOWN`.
- `SearchRequest` has bounded query/candidate limits and explicit published,
  approved and historical access scopes. Access filtering precedes ranking.
- Lexical ranking is deterministic with stable resource/version tie-breaking.
  Production PostgreSQL uses parameterized `websearch_to_tsquery` and a GIN
  index; query text is data, never SQL.
- `Vector` is a dependency-free SQLAlchemy type for the approved pgvector
  extension. Embedding identity includes model, version, dimensions and
  source hash; incompatible vectors are rejected.
- Index runs and freshness watermarks make stale projections explicit.
- Deterministic fixed-window fragments are versioned and content-hash based;
  `EmbeddingGenerator` is a provider-neutral boundary; Reciprocal Rank
  Fusion combines lexical/vector candidates while preserving both ranks and
  stable identity tie-breaking. Access policy defaults to deny for non-
  approved/published resources.
- The approved vector baseline is cosine distance with an HNSW
  `vector_cosine_ops` index and a fixed 1,536-dimensional model contract;
  semantic quality is not inferred from deterministic test vectors.

## Migration

Additive migration `b53000000001` follows finalized BIP-M4 head
`b52000000001`. It creates integrity/readiness, search-resource,
embedding, index-run and freshness tables, enables pgvector when available,
and adds GIN/identity constraints. It performs no destructive data changes.

## Certification matrix

| Area | Status |
|---|---|
| Domain and unit behavior | PASS |
| Offline Alembic generation/head | PASS when migration dependencies are installed |
| PostgreSQL 16 constraints/transactions | BLOCKED — no PostgreSQL service in environment |
| pgvector extension/index/query plan | BLOCKED — extension/service unavailable |
| S3-compatible put/head/read/delete | BLOCKED — no configured test endpoint |
| FTS integration and hybrid retrieval | BLOCKED — PostgreSQL service unavailable |
| Security and bounds | PASS by unit/reference tests |

Required later environment variables are read only by the certification
harness and must never be printed: `NEURALVERSE_TEST_DATABASE_URL`,
`NEURALVERSE_TEST_S3_ENDPOINT`, `NEURALVERSE_TEST_S3_REGION`,
`NEURALVERSE_TEST_S3_BUCKET`, `NEURALVERSE_TEST_S3_ACCESS_KEY`,
`NEURALVERSE_TEST_S3_SECRET_KEY` and `NEURALVERSE_TEST_S3_FORCE_PATH_STYLE`.

## Explicit deferrals

No provider credentials, model calls, Frontend changes, public routes,
external search engine, separate vector database, BIP-M6 work or commit
are authorized by this phase. Owner review and an isolated commit remain
required after infrastructure certification.
