# Persistence Invariants

Foreign keys use RESTRICT for historical records. Package/version ownership,
revision uniqueness, block position uniqueness, exact asset and specification
references, learner content-version references, and outbox event identity are
relational constraints. Published content versions are protected by repository
checks and PostgreSQL triggers and fail with
`PUBLISHED_CONTENT_VERSION_IMMUTABLE`.
