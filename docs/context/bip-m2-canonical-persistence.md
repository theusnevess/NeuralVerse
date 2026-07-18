# BIP-M2 Canonical Persistence

Status: IMPLEMENTED.

The Stage 5 candidate persists the certified domain through SQLAlchemy models,
repository adapters, PostgreSQL constraints, and an explicit unit-of-work
boundary. Durable workflow execution, publication delivery, frontend
integration, and synchronization execution remain future work.

Fixture tables are test infrastructure only and are not read by canonical
repositories.

The SQLAlchemy mappings, Alembic graph and PostgreSQL certification are
implemented and validated against a disposable PostgreSQL 16.14 database.
The database was upgraded from an empty state to `b50000000001`, downgraded
to base and upgraded again. Integration tests covered constraints, foreign
keys, uniqueness, JSONB round-trips, rollback, locks and concurrency.
