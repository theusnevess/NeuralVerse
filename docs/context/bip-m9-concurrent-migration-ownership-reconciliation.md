---
canonical_id: BIP_M9_CONCURRENT_MIGRATION_OWNERSHIP_RECONCILIATION
version: 1.2.0
status: RECONCILED_BY_CANONICAL_BRIDGE
---

# BIP-M9 concurrent migration ownership reconciliation

## Decision

The BIP-M9 migration files are not rewritten. The reachable PostgreSQL
database was observed at `b65000000001`, and its schema proved that the
lineage columns, request bootstrap, Obsidian records and command payload were
already materialized. Those operations are therefore treated as applied
historical state, regardless of whether the corresponding dirty file is
committed. The canonical solution is the protected `b650 → c000` bridge, not a
new merge-only revision.

The certified Stage 16 persistence commit `358f6fcb` and committed migration
`b63000000001` remain unchanged. No Alembic merge-only revision is sufficient:
the duplicate DDL executes before a terminal merge can be reached.

## Ownership matrix

| Revision / operation | Current ownership finding | Current Git state | Applied evidence | Safe to rewrite? |
| --- | --- | --- | --- | --- |
| `b58000000001` lineage columns on `canonical_input_records` | Duplicates all nine lineage columns owned by Stage 16 `b630`; no BIP-M9-only requirement | Untracked | Columns/indexes present in observed `b650`; identity was not independently applied | No; applied schema evidence makes rewrite unsafe |
| `b59000000001` `bip_m4_generation_requests` | Genuine BIP-M9 request-bootstrap extension; not owned by `b630` | Untracked | Table and index present in observed `b650` | No |
| `b60000000001` Obsidian synchronization tables | Genuine BIP-M9/Obsidian extension; not owned by `b630` | Committed at `36ec8ce` | Tables present in observed `b650` | No |
| `b62000000001` `bip_m4_commands.command_payload` | Genuine BIP-M9 durable command-payload extension; not owned by `b630` | Untracked | Column present in observed `b650` | No |
| `b54000000001` progress projection and event schema | Supporting BIP-M9 ancestor; overlaps the dirty Stage 16 progress projection path | Untracked | Implied by the observed descendant database; verify from database history before any future action | No rewrite may be assumed |
| `b56000000001` merge of the M9 and learner lines | Graph composition only; its ancestry is part of the observed BIP-M9 line | Untracked | Implied by the observed `b650` descendant database | No rewrite may be assumed |
| `b63000000001` canonical-input lineage | Canonical Stage 16 owner | Committed at `358f6fcb`; dirty copy preserved untouched | Applied source schema and certified commit | No |

The local PostgreSQL service is reachable on port `55432` and reports
PostgreSQL `16.14`; the API health endpoints also respond. The database was
reconciled only after two disposable clones produced the same plan and hash.

## Required cross-milestone compatibility design

1. Freeze the historical BIP-M9 IDs and their exact applied DDL. Do not change
   `down_revision`, rename a revision, or delete the files until the owner of
   the observed `b62000000001` database confirms the migration inventory.
2. Keep `b63000000001` as the sole owner of the canonical-input lineage
   columns. Future migrations may inspect and validate those columns, but may
   not add them again.
3. Keep `command_payload` as a BIP-M9-only extension. It must be represented
   by a new forward-compatible revision only after the historical `b620` state
   is mapped; it must not be duplicated in Stage 16.
4. Define two explicit upgrade inputs before choosing a release graph:
   a fresh database at the common baseline, and a database stamped/applied at
   `b62000000001`. The compatibility migration must be proven against both
   states and must not replay historical DDL into the already-applied state.
5. The approved architecture is a versioned legacy/canonical Alembic script
   location with an explicit forward-only stamp bridge: fresh databases use
   `c00000000001`, while observed legacy states enter through the protected
   reconciliation function. No historical branch is replayed or rewritten.
6. The bridge certification covers one head, zero duplicate DDL, fresh
   PostgreSQL 16 upgrade, representative pre-`b630` upgrade, ORM/schema drift
   zero, and explicit validation of every BIP-M9-only table and column.

## Observed bridge certification

The fail-closed bridge was first run in read-only analysis mode and found:

- Alembic version: `b65000000001`.
- Database tables: `107` including `alembic_version`; canonical ORM metadata
  tables: `107` excluding `alembic_version`.
- Missing canonical audit table: `migration_reconciliation_audits`.
- The canonical metadata explicitly preserves all five `obsidian_*` tables and
  the Stage 13 and Stage 15 durable tables.
- After ORM retention fixes, the exact residual plan was three additive
  operations: the audit table and its two indexes. All six previously
  reported `DropIndexOp` objects were classified `IDENTICAL_CANONICAL`; none
  was dropped.

Two disposable PostgreSQL 16.14 clones produced the identical bridge plan
`stage16-b650-to-c000-c2d5ce5e16f4669b`, hash
`c2d5ce5e16f4669bcfaf6b5c22d114f96c915ab07f559d6ab945746e73cc49e6`, and 909
source rows. Wrong-plan rejection and injected-failure rollback left the
clones at `b650`; each clone then reconciled and returned `NOOP` on replay.
Both clones were removed after verification.

The local database was then bridged transactionally with advisory locking.
Audit result hash: `86d267ce11959c97ad314ff7e9a826f15ecc668cc184737365ea591233e22a46`.
The pre-bridge logical backup manifest hash was
`456bc6170554d7e2c47ea4d63ef6cb2324962b836f589c7aa4f496b5a63c19a1`.
The bridge changed the revision to `c00000000001`; a second invocation was
`NOOP` and changed no rows.

The clean canonical origin is independently valid: a disposable PostgreSQL
16.14 database upgraded to `c00000000001`, produced one Alembic head, 107
ORM tables (108 public tables including `alembic_version`), and
`compare_metadata` drift `0`. A representative pre-`b630` database upgraded
to `b610` and then passed the same canonical bridge to `c00000000001` with
zero data loss. The dirty copy of `b630` remains unmodified; the committed
migration remains untouched.

The pre-`b630` policy is explicitly `GOVERNED`: committed legacy history is
preserved for audit, the canonical script location is the sole release graph,
and approved legacy states enter through the forward-only bridge. No
`UNKNOWN` origin is accepted.

## Current verdict

```text
VERDICT: RECONCILED
CLASSIFICATION: CANONICAL_BRIDGE_CERTIFIED
PRE_B630_POLICY: GOVERNED
BLOCKER: FULL_STAGE_16_CNN_CERTIFICATION_REMAINS_OPEN
MIGRATIONS_REWRITTEN: NO
STAGE_16_COMMIT_REVERTED: NO
PUSH_TAG_MERGE_RELEASE: NOT_PERFORMED
```
