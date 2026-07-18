# BIP-M5 Test Evidence

Unit persistence tests cover metadata registration, canonical intake
idempotency, model constraints, and repository construction. PostgreSQL 16
migrations, downgrade/re-upgrade, catalog checks, canonical raw-byte and
content round trips, published immutability, and integration tests passed in
the isolated `neuralverse_stage5` database through migration head
`b50000000001`. The database was reset from base, upgraded to head, verified
empty, and then used for the final full suite. Dedicated concurrency tests
cover package creation, revision allocation, block positions, idempotency,
outbox claims, optimistic locking, and publication identity. Dedicated
repository round trips cover content, learner, publication release and
manifest, outbox, idempotency, and domain audit records. The final suite
passed 333 tests; scoped Ruff, scoped mypy, `git diff --check`, and build also
passed.

Stage 5 is certified with conditions as
`BIP_CANONICAL_DOMAIN_PERSISTENCE_CERTIFIED_WITH_CONDITIONS`.

The repository-wide strict mypy command still reports pre-existing domain
typing debt outside the persistence boundary. This is the sole recorded
condition and does not block the certified persistence boundary.
