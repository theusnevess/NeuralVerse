"""Verified bridges from immutable legacy migration states to the canonical head."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from datetime import UTC, datetime
from typing import Any

from alembic.autogenerate import produce_migrations
from alembic.migration import MigrationContext
from alembic.operations import Operations
from alembic.operations.ops import (
    AddColumnOp,
    CreateIndexOp,
    CreateTableOp,
    CreateUniqueConstraintOp,
    MigrateOperation,
    ModifyTableOps,
)
from sqlalchemy import CheckConstraint, Engine, UniqueConstraint, insert, inspect, text
from sqlalchemy.dialects import postgresql

from neuralverse_backend.persistence.metadata import metadata
from neuralverse_backend.persistence.migrations import (
    create_migration_engine,
    load_migration_settings,
)
from neuralverse_backend.persistence.models import MigrationReconciliationAuditRecord

CANONICAL_REVISION = "c00000000001"
TOOL_VERSION = "stage16-canonical-baseline-v1"
BRIDGE_LOCK_KEY = "neuralverse:stage16:canonical-bridge"
HISTORICAL_INDEX_NAMES = frozenset(
    {
        "ix_canonical_input_records_assembled_fingerprint",
        "ix_canonical_input_records_generation_job",
        "ix_canonical_input_records_workflow",
        "ix_cross_front_workflow_status",
        "ix_cross_front_workflow_updated_at",
        "ix_cross_front_workflow_queue_status_occurred",
    }
)
APPROVED_LEGACY_REVISIONS = frozenset(
    {
        "b58000000001",
        "b59000000001",
        "b60000000001",
        "b61000000001",
        "b62000000001",
        "b63000000001",
        "b64000000001",
        # Observed in the local database. This historical merge is accepted
        # only as an immutable reconciliation input; it is never executed or
        # used as the canonical graph.
        "b65000000001",
    }
)
_FORBIDDEN_OPERATION_NAMES = frozenset(
    {
        "AlterColumnOp",
        "DropColumnOp",
        "DropConstraintOp",
        "DropIndexOp",
        "DropTableOp",
        "ExecuteSQLOp",
        "RenameTableOp",
    }
)
_ALLOWED_OPERATION_NAMES = frozenset(
    {
        "AddColumnOp",
        "CreateCheckConstraintOp",
        "CreateForeignKeyOp",
        "CreateIndexOp",
        "CreatePrimaryKeyOp",
        "CreateTableOp",
        "CreateUniqueConstraintOp",
    }
)


class ReconciliationError(RuntimeError):
    """Raised when a legacy database is not an approved canonicalization input."""


@dataclass(frozen=True, slots=True)
class IndexSignature:
    """Complete semantic and safety signature for one PostgreSQL index."""

    schema: str
    table: str
    name: str
    oid: int
    method: str
    definition: str
    columns: tuple[str, ...]
    expressions: str | None
    predicate: str | None
    operator_classes: tuple[str, ...]
    collations: tuple[str, ...]
    descending: tuple[bool, ...]
    nulls_first: tuple[bool, ...]
    included_columns: tuple[str, ...]
    unique: bool
    primary: bool
    exclusion: bool
    valid: bool
    ready: bool
    live: bool
    constraint_names: tuple[str, ...]
    size_bytes: int
    index_scans: int

    def semantic_payload(self) -> dict[str, object]:
        """Return a clone-stable payload; OID/size/usage are forensic only."""
        return {
            "schema": self.schema,
            "table": self.table,
            "name": self.name,
            "method": self.method,
            "definition": self.definition,
            "columns": self.columns,
            "expressions": self.expressions,
            "predicate": self.predicate,
            "operator_classes": self.operator_classes,
            "collations": self.collations,
            "descending": self.descending,
            "nulls_first": self.nulls_first,
            "included_columns": self.included_columns,
            "unique": self.unique,
            "primary": self.primary,
            "exclusion": self.exclusion,
            "constraint_names": self.constraint_names,
        }


@dataclass(frozen=True, slots=True)
class IndexClassification:
    index_name: str
    classification: str
    historical_signature_sha256: str
    canonical_signature_sha256: str | None
    reason: str


@dataclass(frozen=True, slots=True)
class BridgePlan:
    bridge_plan_id: str
    source_revision: str
    source_schema_fingerprint: str
    target_revision: str
    target_schema_fingerprint: str
    operations: tuple[dict[str, object], ...]
    index_classifications: tuple[IndexClassification, ...]
    row_counts: tuple[tuple[str, int], ...]
    plan_sha256: str


@dataclass(frozen=True, slots=True)
class ReconciliationResult:
    source_revision: str
    previous_schema_fingerprint: str
    canonical_schema_fingerprint: str
    result_hash: str
    applied_operations: tuple[str, ...]
    bridge_plan_id: str = ""
    plan_sha256: str = ""
    result: str = "RECONCILED"
    changed: bool = True
    plan: BridgePlan | None = None


def _stable_json(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), default=str)


def _hash_json(value: object) -> str:
    return hashlib.sha256(_stable_json(value).encode("utf-8")).hexdigest()


def _sorted_dicts(values: Iterable[dict[str, object]]) -> list[dict[str, object]]:
    return sorted(values, key=_stable_json)


def _normalized_type(type_: Any) -> str:
    raw = str(type_).upper().replace("DOUBLE PRECISION", "FLOAT")
    if raw == "DATETIME":
        return "TIMESTAMP_TZ" if bool(getattr(type_, "timezone", False)) else "TIMESTAMP"
    if raw == "TIMESTAMP WITH TIME ZONE":
        return "TIMESTAMP_TZ"
    if raw in {"JSON", "JSONB"}:
        return "JSONB"
    return raw


def _normalized_default(value: object | None) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    normalized = re.sub(r"::[A-Z_ ]+(?:\[\])?$", "", normalized, flags=re.IGNORECASE)
    return normalized.strip("()")


def _column_signature(column: Any, *, dialect: Any | None = None) -> dict[str, object]:
    type_ = column.type.dialect_impl(dialect) if dialect is not None else column.type
    return {
        "name": column.name,
        "type": _normalized_type(type_),
        "nullable": bool(column.nullable),
        "default": _normalized_default(column.server_default.arg)
        if column.server_default is not None
        else None,
    }


def _index_comparison_payload(index: IndexSignature) -> dict[str, object]:
    return {
        "schema": index.schema,
        "table": index.table,
        "name": index.name,
        "method": index.method,
        "columns": index.columns,
        "expressions": index.expressions,
        "predicate": index.predicate,
        "included_columns": index.included_columns,
        "unique": index.unique,
        "primary": index.primary,
        "exclusion": index.exclusion,
        "descending": index.descending,
        "nulls_first": index.nulls_first,
    }


def _index_signature_hash(index: IndexSignature) -> str:
    return _hash_json(_index_comparison_payload(index))


def _canonical_index_signature(index: Any) -> IndexSignature:
    columns = tuple(column.name for column in index.columns)
    return IndexSignature(
        schema="public",
        table=index.table.name,
        name=index.name,
        oid=0,
        method="btree",
        definition=(
            f"CREATE INDEX {index.name} ON public.{index.table.name} "
            f"USING btree ({', '.join(columns)})"
        ),
        columns=columns,
        expressions=None,
        predicate=None,
        operator_classes=tuple(),
        collations=tuple(),
        descending=tuple(False for _ in columns),
        nulls_first=tuple(False for _ in columns),
        included_columns=tuple(),
        unique=bool(index.unique),
        primary=False,
        exclusion=False,
        valid=True,
        ready=True,
        live=True,
        constraint_names=tuple(),
        size_bytes=0,
        index_scans=0,
    )


def inspect_index_signatures(
    connection: Any, *, names: Iterable[str] | None = None
) -> tuple[IndexSignature, ...]:
    """Read complete PostgreSQL index signatures without changing state."""
    name_filter = tuple(sorted(names or ()))
    query = text(
        """
        SELECT n.nspname AS schema_name, t.relname AS table_name,
               i.relname AS index_name, i.oid::int AS index_oid,
               am.amname AS method, pg_get_indexdef(i.oid) AS definition,
               pg_get_expr(ix.indexprs, ix.indrelid) AS expressions,
               pg_get_expr(ix.indpred, ix.indrelid) AS predicate,
               ix.indnkeyatts, ix.indnatts, ix.indisunique, ix.indisprimary,
               ix.indisexclusion, ix.indisvalid, ix.indisready, ix.indislive,
               COALESCE(pg_relation_size(i.oid), 0)::bigint AS size_bytes,
               COALESCE(st.idx_scan, 0)::bigint AS index_scans,
               COALESCE(array_agg(DISTINCT c.conname) FILTER (WHERE c.conname IS NOT NULL), '{}')
                 AS constraint_names
        FROM pg_class i
        JOIN pg_index ix ON ix.indexrelid = i.oid
        JOIN pg_class t ON t.oid = ix.indrelid
        JOIN pg_namespace n ON n.oid = i.relnamespace
        JOIN pg_am am ON am.oid = i.relam
        LEFT JOIN pg_constraint c ON c.conindid = i.oid
        LEFT JOIN pg_stat_user_indexes st ON st.indexrelid = i.oid
        WHERE n.nspname = 'public'
          AND (:filter_count = 0 OR i.relname = ANY(:index_names))
        GROUP BY n.nspname, t.relname, i.relname, i.oid, am.amname,
                 ix.indexprs, ix.indrelid, ix.indpred, ix.indnkeyatts,
                 ix.indnatts, ix.indisunique, ix.indisprimary,
                 ix.indisexclusion, ix.indisvalid, ix.indisready,
                 ix.indislive, st.idx_scan, pg_relation_size(i.oid)
        ORDER BY n.nspname, t.relname, i.relname
        """
    )
    column_query = text(
        """
        SELECT k.ord, a.attname, pg_get_indexdef(ix.indexrelid, k.ord::int, true) AS item,
               COALESCE(coll.collname, '') AS collation,
               COALESCE(opc.opcname, '') AS opclass,
               (ix.indoption[k.ord - 1] & 1) <> 0 AS descending,
               (ix.indoption[k.ord - 1] & 2) <> 0 AS nulls_first
        FROM pg_index ix
        CROSS JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ord)
        LEFT JOIN pg_attribute a ON a.attrelid = ix.indrelid AND a.attnum = k.attnum
        LEFT JOIN pg_collation coll ON coll.oid = ix.indcollation[k.ord - 1]
        LEFT JOIN pg_opclass opc ON opc.oid = ix.indclass[k.ord - 1]
        WHERE ix.indexrelid = :index_oid
        ORDER BY k.ord
        """
    )
    rows = connection.execute(
        query,
        {"filter_count": len(name_filter), "index_names": list(name_filter)},
    ).mappings()
    signatures: list[IndexSignature] = []
    for row in rows:
        columns = connection.execute(
            column_query, {"index_oid": row["index_oid"]}
        ).mappings().all()
        key_columns = tuple(
            str(item["attname"] or item["item"])
            for item in columns
            if int(item["ord"]) <= int(row["indnkeyatts"])
        )
        signatures.append(
            IndexSignature(
                schema=str(row["schema_name"]),
                table=str(row["table_name"]),
                name=str(row["index_name"]),
                oid=int(row["index_oid"]),
                method=str(row["method"]),
                definition=str(row["definition"]),
                columns=key_columns,
                expressions=row["expressions"],
                predicate=row["predicate"],
                operator_classes=tuple(str(item["opclass"]) for item in columns),
                collations=tuple(str(item["collation"]) for item in columns),
                descending=tuple(bool(item["descending"]) for item in columns),
                nulls_first=tuple(bool(item["nulls_first"]) for item in columns),
                included_columns=tuple(
                    str(item["attname"] or item["item"])
                    for item in columns
                    if int(item["ord"]) > int(row["indnkeyatts"])
                ),
                unique=bool(row["indisunique"]),
                primary=bool(row["indisprimary"]),
                exclusion=bool(row["indisexclusion"]),
                valid=bool(row["indisvalid"]),
                ready=bool(row["indisready"]),
                live=bool(row["indislive"]),
                constraint_names=tuple(sorted(str(x) for x in (row["constraint_names"] or []))),
                size_bytes=int(row["size_bytes"]),
                index_scans=int(row["index_scans"]),
            )
        )
    return tuple(signatures)


def _metadata_signature() -> dict[str, object]:
    tables: list[dict[str, object]] = []
    for table in sorted(metadata.tables.values(), key=lambda value: value.name):
        tables.append(
            {
                "name": table.name,
                "columns": [
                    _column_signature(column, dialect=postgresql.dialect())  # type: ignore[no-untyped-call]
                    for column in table.columns
                ],
                "primary_key": sorted(column.name for column in table.primary_key.columns),
                "foreign_keys": _sorted_dicts(
                    [
                        {
                            "column": constraint.parent.name,
                            "target": f"{constraint.target_fullname}",
                        }
                        for constraint in table.foreign_keys
                    ]
                ),
                "unique_constraints": _sorted_dicts(
                    [
                        {
                            "name": constraint.name,
                            "columns": [column.name for column in constraint.columns],
                        }
                        for constraint in table.constraints
                        if isinstance(constraint, UniqueConstraint)
                    ]
                ),
                "checks": _sorted_dicts(
                    [
                        {"name": constraint.name, "sql": str(constraint.sqltext)}
                        for constraint in table.constraints
                        if isinstance(constraint, CheckConstraint)
                    ]
                ),
                "indexes": _sorted_dicts(
                    [
                        {
                            "name": index.name,
                            "unique": bool(index.unique),
                            "columns": [column.name for column in index.columns],
                        }
                        for index in table.indexes
                    ]
                ),
            }
        )
    return {"tables": tables}


def canonical_schema_fingerprint() -> str:
    """Return the deterministic fingerprint of the canonical ORM schema."""
    return _hash_json(_metadata_signature())


def schema_fingerprint(connection: Any) -> str:
    """Fingerprint the live PostgreSQL schema without including Alembic state."""
    # PostgreSQL's inspector renders equivalent expressions with dialect casts
    # and implementation-specific type names.  Once Alembic's semantic
    # comparison is empty, the canonical metadata fingerprint is the stable
    # representation; a non-equivalent schema keeps its raw inventory for
    # rejection/audit diagnostics.
    operations = _migration_operations(connection)
    if not operations:
        return canonical_schema_fingerprint()
    operation_names = tuple(
        type(operation).__name__ for operation in _flatten_operations(operations)
    )
    if all(name in _ALLOWED_OPERATION_NAMES for name in operation_names):
        return _hash_json(
            {
                "canonical_target": canonical_schema_fingerprint(),
                "pending_operations": tuple(
                    _operation_signature(operation) for operation in _flatten_operations(operations)
                ),
            }
        )
    inspector = inspect(connection)
    tables: list[dict[str, object]] = []
    for table_name in sorted(inspector.get_table_names()):
        if table_name == "alembic_version":
            continue
        tables.append(
            {
                "name": table_name,
                "columns": [
                    {
                        "name": column["name"],
                        "type": _normalized_type(column["type"]),
                        "nullable": bool(column["nullable"]),
                        "default": _normalized_default(column["default"]),
                    }
                    for column in inspector.get_columns(table_name)
                ],
                "primary_key": sorted(
                    inspector.get_pk_constraint(table_name).get("constrained_columns") or []
                ),
                "foreign_keys": _sorted_dicts(
                    [
                        {
                            "column": column,
                            "target": f"{foreign_key.get('referred_table')}.{referred_column}",
                        }
                        for foreign_key in inspector.get_foreign_keys(table_name)
                        for column, referred_column in zip(
                            foreign_key.get("constrained_columns") or [],
                            foreign_key.get("referred_columns") or [],
                            strict=False,
                        )
                    ]
                ),
                "unique_constraints": _sorted_dicts(
                    [
                        {
                            "name": constraint.get("name"),
                            "columns": constraint.get("column_names") or [],
                        }
                        for constraint in inspector.get_unique_constraints(table_name)
                    ]
                ),
                "checks": _sorted_dicts(
                    [
                        {
                            "name": constraint.get("name"),
                            "sql": constraint.get("sqltext"),
                        }
                        for constraint in inspector.get_check_constraints(table_name)
                    ]
                ),
                "indexes": _sorted_dicts(
                    [
                        {
                            "name": index.get("name"),
                            "unique": bool(index.get("unique")),
                            "columns": index.get("column_names") or [],
                        }
                        for index in inspector.get_indexes(table_name)
                    ]
                ),
            }
        )
    return _hash_json({"tables": tables})


def _migration_operations(connection: Any) -> tuple[MigrateOperation, ...]:
    context = MigrationContext.configure(
        connection,
        opts={
            "target_metadata": metadata,
            "compare_type": True,
            "compare_server_default": True,
            "include_schemas": False,
        },
    )
    script = produce_migrations(context, metadata)
    if script.upgrade_ops is None:
        return ()
    return tuple(script.upgrade_ops.ops)


def _operation_signature(operation: MigrateOperation) -> dict[str, object]:
    """Serialize an Alembic operation without process-specific repr values."""
    name = type(operation).__name__
    if isinstance(operation, AddColumnOp):
        return {
            "operation": name,
            "table": operation.table_name,
            "schema": operation.schema,
            "column": _column_signature(
                operation.column, dialect=postgresql.dialect()  # type: ignore[no-untyped-call]
            ),
        }
    if isinstance(operation, CreateIndexOp):
        return {
            "operation": name,
            "name": operation.index_name,
            "table": operation.table_name,
            "schema": operation.schema,
            "unique": bool(operation.unique),
            "columns": tuple(
                getattr(column, "name", str(column)) for column in (operation.columns or ())
            ),
        }
    if isinstance(operation, CreateTableOp):
        return {
            "operation": name,
            "table": operation.table_name,
            "schema": operation.schema,
            "columns": tuple(
                _column_signature(item, dialect=postgresql.dialect())  # type: ignore[no-untyped-call]
                for item in operation.columns
                if hasattr(item, "name") and hasattr(item, "type")
            ),
            "constraints": tuple(
                {
                    "kind": type(item).__name__,
                    "name": getattr(item, "name", None),
                }
                for item in operation.columns
                if not hasattr(item, "type")
            ),
        }
    if isinstance(operation, CreateUniqueConstraintOp):
        return {
            "operation": name,
            "name": operation.constraint_name,
            "table": operation.table_name,
            "schema": operation.schema,
            "columns": tuple(operation.columns),
        }
    return {"operation": name, "payload": str(operation.to_diff_tuple())}


def _flatten_operations(operations: Iterable[MigrateOperation]) -> Iterable[MigrateOperation]:
    for operation in operations:
        if isinstance(operation, ModifyTableOps):
            yield from _flatten_operations(operation.ops)
        else:
            yield operation


def _validate_operations(operations: Iterable[MigrateOperation]) -> tuple[str, ...]:
    names: list[str] = []
    for operation in _flatten_operations(operations):
        name = type(operation).__name__
        if name in _FORBIDDEN_OPERATION_NAMES or name not in _ALLOWED_OPERATION_NAMES:
            raise ReconciliationError(
                f"legacy schema requires unsafe or unknown operation: {name}"
            )
        names.append(name)
    return tuple(names)


def _apply_operations(connection: Any, operations: Iterable[MigrateOperation]) -> None:
    implementation = Operations(MigrationContext.configure(connection))
    for operation in operations:
        if isinstance(operation, ModifyTableOps):
            _apply_operations(connection, operation.ops)
        else:
            implementation.invoke(operation)


def _current_revisions(connection: Any) -> tuple[str, ...]:
    context = MigrationContext.configure(connection)
    return tuple(context.get_current_heads())


def _row_counts(connection: Any) -> tuple[tuple[str, int], ...]:
    """Capture exact table cardinalities for the bridge's data-preservation gate."""
    counts: list[tuple[str, int]] = []
    for table_name in sorted(inspect(connection).get_table_names()):
        if table_name == "alembic_version":
            continue
        quoted = '"' + table_name.replace('"', '""') + '"'
        count = connection.execute(text(f"SELECT count(*) FROM {quoted}")).scalar_one()
        counts.append((table_name, int(count)))
    return tuple(counts)


def _classify_indexes(connection: Any) -> tuple[IndexClassification, ...]:
    """Classify every historical index that can be implicated by a bridge diff."""
    observed = {item.name: item for item in inspect_index_signatures(connection)}
    metadata_indexes: dict[str, IndexSignature] = {
        str(index.name): _canonical_index_signature(index)
        for table in metadata.tables.values()
        for index in table.indexes
        if index.name is not None and index.name in HISTORICAL_INDEX_NAMES
    }
    classifications: list[IndexClassification] = []
    for name in sorted(HISTORICAL_INDEX_NAMES):
        historical = observed.get(name)
        if historical is None:
            continue
        if (
            historical.primary
            or historical.unique
            or historical.exclusion
            or historical.constraint_names
        ):
            raise ReconciliationError(
                f"historical index {name} is constraint-backed and cannot be reconciled"
            )
        canonical = metadata_indexes.get(name)
        if canonical is not None and _index_comparison_payload(
            historical
        ) == _index_comparison_payload(canonical):
            classification = "IDENTICAL_CANONICAL"
            reason = "retained historical index is semantically identical to canonical metadata"
            canonical_hash = _index_signature_hash(canonical)
        else:
            equivalent = next(
                (
                    item
                    for item in metadata_indexes.values()
                    if item.table == historical.table
                    and _index_comparison_payload(item) | {"name": historical.name}
                    == _index_comparison_payload(historical)
                ),
                None,
            )
            if equivalent is not None:
                classification = "RENAMED_EQUIVALENT"
                reason = (
                    "historical name differs but indexed table and key semantics are equivalent"
                )
                canonical_hash = _index_signature_hash(equivalent)
            else:
                classification = "REQUIRED_HISTORICAL_EXTENSION"
                reason = "historical index is retained as a required schema extension"
                canonical_hash = None
        classifications.append(
            IndexClassification(
                index_name=name,
                classification=classification,
                historical_signature_sha256=_index_signature_hash(historical),
                canonical_signature_sha256=canonical_hash,
                reason=reason,
            )
        )
    return tuple(classifications)


def _build_bridge_plan(connection: Any, source_revision: str) -> BridgePlan:
    operations = tuple(_flatten_operations(_migration_operations(connection)))
    source_fingerprint = schema_fingerprint(connection)
    target_fingerprint = canonical_schema_fingerprint()
    row_counts = _row_counts(connection)
    index_classifications = _classify_indexes(connection)
    operation_signatures = tuple(_operation_signature(operation) for operation in operations)
    payload = {
        "source_revision": source_revision,
        "source_schema_fingerprint": source_fingerprint,
        "target_revision": CANONICAL_REVISION,
        "target_schema_fingerprint": target_fingerprint,
        "operations": operation_signatures,
        "index_classifications": tuple(asdict(item) for item in index_classifications),
        "row_counts": row_counts,
    }
    plan_sha256 = _hash_json(payload)
    return BridgePlan(
        bridge_plan_id=f"stage16-b650-to-c000-{plan_sha256[:16]}",
        source_revision=source_revision,
        source_schema_fingerprint=source_fingerprint,
        target_revision=CANONICAL_REVISION,
        target_schema_fingerprint=target_fingerprint,
        operations=operation_signatures,
        index_classifications=index_classifications,
        row_counts=row_counts,
        plan_sha256=plan_sha256,
    )


def reconcile_legacy_database(
    engine: Engine,
    *,
    operator_identity: str,
    environment: str = "local",
    allow_hosted: bool = False,
    plan_only: bool = False,
    expected_source_fingerprint: str | None = None,
    expected_plan_sha256: str | None = None,
) -> ReconciliationResult:
    """Validate, repair and transition one approved legacy database.

    The version row is changed only after schema equivalence and all additive
    operations have succeeded in the same transaction. Unknown or destructive
    differences fail closed.
    """
    if not operator_identity.strip():
        raise ReconciliationError("operator_identity is required")
    if environment == "hosted" and not allow_hosted:
        raise ReconciliationError("hosted reconciliation requires explicit authorization")

    with engine.begin() as connection:
        connection.execute(
            text("SELECT pg_advisory_xact_lock(hashtext(:lock_key))"),
            {"lock_key": BRIDGE_LOCK_KEY},
        )
        revisions = _current_revisions(connection)
        if len(revisions) != 1 or (
            revisions[0] not in APPROVED_LEGACY_REVISIONS and revisions[0] != CANONICAL_REVISION
        ):
            raise ReconciliationError(
                "database must have exactly one approved legacy Alembic revision; "
                f"observed={revisions!r}"
            )
        source_revision = revisions[0]
        if source_revision == CANONICAL_REVISION:
            operations = _migration_operations(connection)
            if operations:
                raise ReconciliationError(
                    "canonical revision has schema drift: "
                    f"{tuple(type(item).__name__ for item in _flatten_operations(operations))!r}"
                )
            fingerprint = canonical_schema_fingerprint()
            return ReconciliationResult(
                source_revision=source_revision,
                previous_schema_fingerprint=fingerprint,
                canonical_schema_fingerprint=fingerprint,
                result_hash=_hash_json({"result": "NOOP", "revision": source_revision}),
                applied_operations=(),
                result="NOOP",
                changed=False,
            )
        plan = _build_bridge_plan(connection, source_revision)
        before_fingerprint = plan.source_schema_fingerprint
        if (
            expected_source_fingerprint is not None
            and before_fingerprint != expected_source_fingerprint
        ):
            raise ReconciliationError(
                "source schema fingerprint does not match approved bridge plan"
            )
        if expected_plan_sha256 is not None and plan.plan_sha256 != expected_plan_sha256:
            raise ReconciliationError("bridge plan hash does not match approved bridge plan")
        operation_names = _validate_operations(_migration_operations(connection))
        if plan_only:
            return ReconciliationResult(
                source_revision=source_revision,
                previous_schema_fingerprint=before_fingerprint,
                canonical_schema_fingerprint=plan.target_schema_fingerprint,
                result_hash=plan.plan_sha256,
                applied_operations=operation_names,
                bridge_plan_id=plan.bridge_plan_id,
                plan_sha256=plan.plan_sha256,
                result="PLAN_ONLY",
                changed=False,
                plan=plan,
            )
        before_counts = plan.row_counts
        operations = _migration_operations(connection)
        _apply_operations(connection, operations)
        remaining = _migration_operations(connection)
        if remaining:
            remaining_names = tuple(
                type(operation).__name__ for operation in _flatten_operations(remaining)
            )
            raise ReconciliationError(
                "schema is not equivalent after additive reconciliation: " f"{remaining_names!r}"
            )
        after_fingerprint = schema_fingerprint(connection)
        canonical_fingerprint = canonical_schema_fingerprint()
        after_counts = _row_counts(connection)
        after_existing_counts = tuple(
            (table_name, dict(after_counts).get(table_name, -1))
            for table_name, _ in before_counts
        )
        if after_existing_counts != before_counts:
            raise ReconciliationError("row counts changed during canonical bridge")
        if after_fingerprint != canonical_fingerprint:
            raise ReconciliationError(
                "canonical bridge did not produce the canonical schema fingerprint"
            )
        details = {
            "source_revision": source_revision,
            "previous_schema_fingerprint": before_fingerprint,
            "canonical_schema_fingerprint": canonical_fingerprint,
            "result_schema_fingerprint": after_fingerprint,
            "operations": operation_names,
            "bridge_plan_id": plan.bridge_plan_id,
            "plan_sha256": plan.plan_sha256,
            "index_classifications": [asdict(item) for item in plan.index_classifications],
            "row_counts_before": before_counts,
            "row_counts_after": after_counts,
            "environment": environment,
        }
        result_hash = _hash_json(details)
        connection.execute(
            insert(MigrationReconciliationAuditRecord).values(
                source_revision=source_revision,
                source_schema_fingerprint=before_fingerprint,
                canonical_schema_fingerprint=canonical_fingerprint,
                bridge_plan_id=plan.bridge_plan_id,
                plan_sha256=plan.plan_sha256,
                result_hash=result_hash,
                operator_identity=operator_identity,
                tool_version=TOOL_VERSION,
                status="RECONCILED",
                details=details,
                created_at=datetime.now(UTC),
            )
        )
        connection.execute(text("DELETE FROM alembic_version"))
        connection.execute(
            text("INSERT INTO alembic_version (version_num) VALUES (:revision)"),
            {"revision": CANONICAL_REVISION},
        )
        return ReconciliationResult(
            source_revision=source_revision,
            previous_schema_fingerprint=before_fingerprint,
            canonical_schema_fingerprint=canonical_fingerprint,
            result_hash=result_hash,
            applied_operations=operation_names,
            bridge_plan_id=plan.bridge_plan_id,
            plan_sha256=plan.plan_sha256,
            plan=plan,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--operator", required=True)
    parser.add_argument("--allow-hosted", action="store_true")
    parser.add_argument("--plan-only", action="store_true")
    parser.add_argument("--expected-source-fingerprint")
    parser.add_argument("--expected-plan-sha256")
    args = parser.parse_args()
    settings = load_migration_settings()
    engine = create_migration_engine(settings)
    try:
        result = reconcile_legacy_database(
            engine,
            operator_identity=args.operator,
            environment=settings.environment.value,
            allow_hosted=args.allow_hosted,
            plan_only=args.plan_only,
            expected_source_fingerprint=args.expected_source_fingerprint,
            expected_plan_sha256=args.expected_plan_sha256,
        )
    finally:
        engine.dispose()
    print(_stable_json(asdict(result)))


if __name__ == "__main__":
    main()
