# Active Task Package

NV-BIP-M5: CERTIFIED WITH CONDITIONS - BIP_CANONICAL_DOMAIN_PERSISTENCE_CERTIFIED_WITH_CONDITIONS.

BIP-M2 canonical persistence is implemented and certified with conditions.
Durable workflow execution, publication execution, frontend integration, and
Obsidian synchronization execution are not implemented and remain outside
Stage 5 certification.

NV-BIP-M6-IMPLEMENT is certified with conditions and the XFO release is
tagged. The BIP owner commit is the remaining finalization operation.

## Stage 4 — BIP-M0 Mission, Boundaries and Baseline

BIP-M0 is `IMPLEMENTED` and is documented in
`backend-integration-platform-m0-mission-boundaries-baseline.md`. Its
technology, bounded-context, source-of-truth, lifecycle, workflow, database,
Frontend migration and deferred-decision records are
`APPROVED`. No BIP-M1 through BIP-M9 implementation is
authorized by this documentation phase. This section records owner approval
without changing the concurrent Stage 5/6 task statements above.

## Stage 5 — BIP-M1 Shared Contract Intake and Domain Model

BIP-M1 here denotes the canonical shared-contract intake/domain phase and is
distinct from earlier fixture or persistence evidence retained above.

BIP-M1 is `IMPLEMENTED`. The intake boundary consumes
the released NV-XFI contract snapshot with lossless raw-byte preservation,
compatibility checks, backend wrapper metadata and explicit stable errors.
The persistence-neutral domain model, aggregate projections, invariants,
repository ports and unit-of-work protocol are implemented and covered by
the dedicated BIP-M1 fixture tests. Concrete persistence, migrations,
workflow execution, APIs, publication, delivery, Frontend, ACP and runtime
integration remain `NOT_IMPLEMENTED` and require separate authorization.
This Stage 5 state supersedes the earlier Stage 4 pre-authorization wording
for BIP-M1 only; BIP-M2 through BIP-M9 remain separately unauthorized.
