# Workflow Resilience

Each ACP operation is independently retryable and identified by a durable
activity key. Start requests use a transactional outbox and deterministic
workflow identity. Progress writes are separate idempotent activities, so a
projection failure does not rerun ACP semantics.

The earlier pending restart statement is historical and superseded. Stage 17
approved worker, API and PostgreSQL restart/recovery evidence, deterministic
replay, concurrency and idempotency, backup/restore and observability.
# Persisted-Reference Resilience

Reference loading is activity-owned and validates lineage before ACP input
assembly. Revision invalidation preserves only dependency-safe references.
Retry, restart/recovery, replay, concurrency and transaction-failure behavior
are covered by the later operational certification evidence. Workflow
resilience is approved for Stage 9; production-scale validation remains a
condition where already defined.
