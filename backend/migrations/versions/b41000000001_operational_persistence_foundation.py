"""Add the B.4.1 operational persistence foundation.

Revision ID: b41000000001
Revises: b30000000001
Create Date: 2026-07-16
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b41000000001"
down_revision: str | Sequence[str] | None = "b30000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create only the three operational B.4.1 tables."""
    op.create_table(
        "fixture_records",
        sa.Column("fixture_record_id", sa.Uuid(), nullable=False),
        sa.Column("fixture_schema_name", sa.String(length=128), nullable=False),
        sa.Column("fixture_schema_version", sa.String(length=32), nullable=False),
        sa.Column("minimum_reader_version", sa.String(length=32), nullable=False),
        sa.Column("producer_version", sa.String(length=64), nullable=False),
        sa.Column(
            "fixture_classification",
            sa.String(length=32),
            server_default=sa.text("'TEST_FIXTURE'"),
            nullable=False,
        ),
        sa.Column(
            "canonicality",
            sa.String(length=32),
            server_default=sa.text("'NON_CANONICAL'"),
            nullable=False,
        ),
        sa.Column("agent_generated", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column(
            "shared_contract_status",
            sa.String(length=48),
            server_default=sa.text("'NOT_A_FINAL_SHARED_CONTRACT'"),
            nullable=False,
        ),
        sa.Column("payload_media_type", sa.String(length=128), nullable=False),
        sa.Column("raw_payload", sa.LargeBinary(), nullable=False),
        sa.Column("raw_payload_sha256", sa.String(length=64), nullable=False),
        sa.Column("structural_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("structural_payload_sha256", sa.String(length=64), nullable=True),
        sa.Column("validation_status", sa.String(length=32), nullable=False),
        sa.Column(
            "validation_findings",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'::jsonb"),
            nullable=False,
        ),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("supersedes_fixture_record_id", sa.Uuid(), nullable=True),
        sa.CheckConstraint(
            "char_length(btrim(fixture_schema_name)) > 0",
            name="schema_name_nonempty",
        ),
        sa.CheckConstraint(
            "char_length(btrim(fixture_schema_version)) > 0",
            name="schema_version_nonempty",
        ),
        sa.CheckConstraint(
            "char_length(btrim(minimum_reader_version)) > 0",
            name="reader_version_nonempty",
        ),
        sa.CheckConstraint(
            "char_length(btrim(producer_version)) > 0",
            name="producer_version_nonempty",
        ),
        sa.CheckConstraint(
            "fixture_classification = 'TEST_FIXTURE'",
            name="classification",
        ),
        sa.CheckConstraint(
            "canonicality = 'NON_CANONICAL'",
            name="canonicality",
        ),
        sa.CheckConstraint(
            "agent_generated IS FALSE",
            name="not_agent_generated",
        ),
        sa.CheckConstraint(
            "shared_contract_status = 'NOT_A_FINAL_SHARED_CONTRACT'",
            name="shared_contract_status",
        ),
        sa.CheckConstraint(
            "payload_media_type = 'application/json'",
            name="media_type",
        ),
        sa.CheckConstraint(
            "octet_length(raw_payload) <= 1048576",
            name="payload_size",
        ),
        sa.CheckConstraint(
            "raw_payload_sha256 ~ '^[0-9a-f]{64}$'",
            name="raw_hash",
        ),
        sa.CheckConstraint(
            "validation_status IN ('STRUCTURALLY_VALID', 'STRUCTURALLY_REJECTED')",
            name="validation_status",
        ),
        sa.CheckConstraint(
            "(structural_payload IS NULL) = (structural_payload_sha256 IS NULL)",
            name="structural_pair",
        ),
        sa.CheckConstraint(
            "structural_payload_sha256 IS NULL OR structural_payload_sha256 ~ '^[0-9a-f]{64}$'",
            name="structural_hash",
        ),
        sa.CheckConstraint(
            "(validation_status = 'STRUCTURALLY_VALID') = (structural_payload IS NOT NULL)",
            name="valid_payload",
        ),
        sa.CheckConstraint(
            "supersedes_fixture_record_id IS NULL OR "
            "fixture_record_id <> supersedes_fixture_record_id",
            name="no_self_supersession",
        ),
        sa.CheckConstraint(
            "received_at <= recorded_at",
            name="timestamp_order",
        ),
        sa.ForeignKeyConstraint(
            ["supersedes_fixture_record_id"],
            ["fixture_records.fixture_record_id"],
            name="fk_fixture_records_supersedes_fixture_record_id_fixture_records",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("fixture_record_id", name="pk_fixture_records"),
    )
    op.create_index(
        "ix_fixture_records_schema_version",
        "fixture_records",
        ["fixture_schema_name", "fixture_schema_version"],
    )
    op.create_index(
        "ix_fixture_records_validation_status",
        "fixture_records",
        ["validation_status"],
    )
    op.create_index(
        "ix_fixture_records_raw_payload_sha256",
        "fixture_records",
        ["raw_payload_sha256"],
    )
    op.create_index(
        "ix_fixture_records_supersedes_fixture_record_id",
        "fixture_records",
        ["supersedes_fixture_record_id"],
    )
    op.create_index("ix_fixture_records_received_at", "fixture_records", ["received_at"])

    op.create_table(
        "idempotency_records",
        sa.Column("idempotency_record_id", sa.Uuid(), nullable=False),
        sa.Column("scope", sa.String(length=128), nullable=False),
        sa.Column("idempotency_key_hash", sa.LargeBinary(), nullable=False),
        sa.Column("key_hash_key_version", sa.String(length=32), nullable=False),
        sa.Column("request_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("operation_name", sa.String(length=64), nullable=False),
        sa.Column(
            "status",
            sa.String(length=32),
            server_default=sa.text("'IN_PROGRESS'"),
            nullable=False,
        ),
        sa.Column("response_reference_type", sa.String(length=32), nullable=True),
        sa.Column("response_reference_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("locked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempt_count", sa.Integer(), server_default=sa.text("1"), nullable=False),
        sa.Column("last_error_code", sa.String(length=64), nullable=True),
        sa.CheckConstraint(
            "char_length(btrim(scope)) > 0",
            name="scope_nonempty",
        ),
        sa.CheckConstraint(
            "octet_length(idempotency_key_hash) = 32",
            name="key_hash_length",
        ),
        sa.CheckConstraint(
            "request_fingerprint ~ '^[0-9a-f]{64}$'",
            name="fingerprint",
        ),
        sa.CheckConstraint(
            "char_length(btrim(key_hash_key_version)) > 0",
            name="key_version_nonempty",
        ),
        sa.CheckConstraint(
            "char_length(btrim(operation_name)) > 0",
            name="operation_nonempty",
        ),
        sa.CheckConstraint(
            "status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED_RETRYABLE', 'FAILED_TERMINAL')",
            name="status",
        ),
        sa.CheckConstraint(
            "response_reference_type IS NULL OR response_reference_type = 'FIXTURE_RECORD'",
            name="response_type",
        ),
        sa.CheckConstraint(
            "attempt_count BETWEEN 1 AND 100",
            name="attempt_count",
        ),
        sa.CheckConstraint(
            "expires_at > created_at",
            name="expiration",
        ),
        sa.CheckConstraint(
            "(status = 'IN_PROGRESS' AND locked_at IS NOT NULL "
            "AND completed_at IS NULL AND failed_at IS NULL "
            "AND response_reference_id IS NULL AND last_error_code IS NULL) OR "
            "(status = 'COMPLETED' AND completed_at IS NOT NULL "
            "AND failed_at IS NULL AND response_reference_type = 'FIXTURE_RECORD' "
            "AND response_reference_id IS NOT NULL AND last_error_code IS NULL) OR "
            "(status IN ('FAILED_RETRYABLE', 'FAILED_TERMINAL') "
            "AND failed_at IS NOT NULL AND completed_at IS NULL "
            "AND response_reference_id IS NULL AND last_error_code IS NOT NULL)",
            name="state_fields",
        ),
        sa.CheckConstraint(
            "locked_at IS NULL OR locked_at >= created_at",
            name="locked_timestamp",
        ),
        sa.CheckConstraint(
            "completed_at IS NULL OR completed_at >= created_at",
            name="completed_timestamp",
        ),
        sa.CheckConstraint(
            "failed_at IS NULL OR failed_at >= created_at",
            name="failed_timestamp",
        ),
        sa.PrimaryKeyConstraint("idempotency_record_id", name="pk_idempotency_records"),
        sa.UniqueConstraint(
            "scope",
            "idempotency_key_hash",
            name="uq_idempotency_records_scope_key_hash",
        ),
    )
    op.create_index(
        "ix_idempotency_records_expiration_status",
        "idempotency_records",
        ["expires_at", "status"],
        postgresql_where=sa.text("status IN ('IN_PROGRESS', 'FAILED_RETRYABLE')"),
    )
    op.create_index(
        "ix_idempotency_records_operation_status",
        "idempotency_records",
        ["operation_name", "status"],
    )

    op.create_table(
        "operational_audit_events",
        sa.Column("audit_event_id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(length=48), nullable=False),
        sa.Column("actor_type", sa.String(length=32), nullable=False),
        sa.Column("actor_id", sa.String(length=128), nullable=True),
        sa.Column("subject_type", sa.String(length=32), nullable=False),
        sa.Column("subject_id", sa.Uuid(), nullable=False),
        sa.Column("operation", sa.String(length=64), nullable=False),
        sa.Column("outcome", sa.String(length=32), nullable=False),
        sa.Column("correlation_id", sa.String(length=128), nullable=True),
        sa.Column("request_id", sa.String(length=128), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "recorded_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.CheckConstraint(
            "event_type IN ("
            "'FIXTURE_INGESTION_ACCEPTED', 'FIXTURE_INGESTION_REJECTED', "
            "'IDEMPOTENCY_REPLAYED', 'IDEMPOTENCY_CONFLICT', "
            "'FIXTURE_SUPERSEDED')",
            name="event_type",
        ),
        sa.CheckConstraint(
            "actor_type IN ('SYSTEM_FIXTURE_ADAPTER', 'SYSTEM_IDEMPOTENCY')",
            name="actor_type",
        ),
        sa.CheckConstraint(
            "subject_type IN ('FIXTURE_RECORD', 'IDEMPOTENCY_RECORD')",
            name="subject_type",
        ),
        sa.CheckConstraint(
            "outcome IN ('ACCEPTED', 'REJECTED', 'REPLAYED', 'CONFLICT', 'SUPERSEDED')",
            name="outcome",
        ),
        sa.CheckConstraint(
            "char_length(btrim(operation)) > 0",
            name="operation_nonempty",
        ),
        sa.CheckConstraint(
            "jsonb_typeof(metadata) = 'object' AND octet_length(metadata::text) <= 16384",
            name="metadata_bounds",
        ),
        sa.CheckConstraint(
            "occurred_at <= recorded_at",
            name="timestamp_order",
        ),
        sa.PrimaryKeyConstraint("audit_event_id", name="pk_operational_audit_events"),
    )
    op.create_index(
        "ix_operational_audit_events_subject",
        "operational_audit_events",
        ["subject_type", "subject_id"],
    )
    op.create_index(
        "ix_operational_audit_events_correlation_id",
        "operational_audit_events",
        ["correlation_id"],
    )
    op.create_index(
        "ix_operational_audit_events_recorded_at",
        "operational_audit_events",
        ["recorded_at"],
    )


def downgrade() -> None:
    """Drop the evidence-bearing tables only in an empty development database."""
    op.drop_index("ix_operational_audit_events_recorded_at", table_name="operational_audit_events")
    op.drop_index(
        "ix_operational_audit_events_correlation_id", table_name="operational_audit_events"
    )
    op.drop_index("ix_operational_audit_events_subject", table_name="operational_audit_events")
    op.drop_table("operational_audit_events")

    op.drop_index("ix_idempotency_records_operation_status", table_name="idempotency_records")
    op.drop_index("ix_idempotency_records_expiration_status", table_name="idempotency_records")
    op.drop_table("idempotency_records")

    op.drop_index("ix_fixture_records_received_at", table_name="fixture_records")
    op.drop_index("ix_fixture_records_supersedes_fixture_record_id", table_name="fixture_records")
    op.drop_index("ix_fixture_records_raw_payload_sha256", table_name="fixture_records")
    op.drop_index("ix_fixture_records_validation_status", table_name="fixture_records")
    op.drop_index("ix_fixture_records_schema_version", table_name="fixture_records")
    op.drop_table("fixture_records")
