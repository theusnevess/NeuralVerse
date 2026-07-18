# BIP Domain Dependency Rules

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Allowed Direction

```
shared domain primitives
        ↑
bounded-context domain modules
        ↑
application services
        ↑
infrastructure and delivery
```

## Prohibited Dependencies

Domain must NOT depend on:
- FastAPI (HTTP framework)
- SQLAlchemy ORM (database)
- Alembic (migrations)
- Temporal SDK (workflow execution)
- Redis (caching/messaging)
- ACP (agent contribution protocol)
- Frontend types
- Another context's private implementation
- HTTP request objects
- Database sessions
- Filesystem paths
- Environment variables

## Cross-Context References

Cross-context references must use:
- Stable identifiers (UUID-based value objects)
- Published domain contracts (public exports)
- Explicit application coordination
- Domain events

## Enforcement

Automated architecture tests verify these rules:
- `test_domain_imports_no_fastapi` — per-module check
- `test_domain_imports_no_sqlalchemy` — import-statement check
- `test_domain_imports_no_alembic` — import-statement check
- `test_domain_imports_no_temporal` — import-statement check
- `test_domain_no_cyclic_context_dependencies` — cross-context import check

All tests pass as of 2026-07-18.
