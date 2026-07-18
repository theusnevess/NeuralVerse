# BIP-M2 Canonical Persistence

Status: IMPLEMENTED - CERTIFICATION REQUIRED.

The Stage 5 candidate persists the certified domain through SQLAlchemy models,
repository adapters, PostgreSQL constraints, and an explicit unit-of-work
boundary. Durable workflow execution, publication delivery, frontend
integration, and synchronization execution remain future work.

Fixture tables are test infrastructure only and are not read by canonical
repositories.
