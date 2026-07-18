"""Persist canonical intake, authoring jobs and transactional outbox."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b43000000001"
down_revision: str | Sequence[str] | None = "b42000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "authoring_jobs",
        sa.Column("authoring_job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("package_id", sa.String(length=256), nullable=True),
        sa.Column("workflow_id", sa.String(length=255), nullable=False),
        sa.Column(
            "status", sa.String(length=32), server_default=sa.text("'CREATED'"), nullable=False
        ),
        sa.Column("current_revision", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("lock_version", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "workflow_started", sa.Boolean(), server_default=sa.text("false"), nullable=False
        ),
        sa.Column(
            "received_contracts",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'"),
            nullable=False,
        ),
        sa.Column(
            "canonical_input_ids",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'"),
            nullable=False,
        ),
        sa.Column(
            "artifact_fingerprints",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default=sa.text("'[]'"),
            nullable=False,
        ),
        sa.Column("last_accepted_event", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("char_length(btrim(workflow_id)) > 0", name="workflow_id_nonempty"),
        sa.CheckConstraint(
            "status IN ("
            "'CREATED', 'WAITING_FOR_INPUTS', 'INPUTS_AVAILABLE', "
            "'READY_FOR_AUTHORING', 'FAILED', 'CANCELLED')",
            name="status",
        ),
        sa.CheckConstraint("current_revision >= 0", name="current_revision_nonnegative"),
        sa.CheckConstraint("lock_version >= 0", name="lock_version_nonnegative"),
        sa.PrimaryKeyConstraint("authoring_job_id", name="pk_authoring_jobs"),
        sa.UniqueConstraint("workflow_id", name="uq_authoring_jobs_workflow_id"),
    )
    op.create_index("ix_authoring_jobs_status", "authoring_jobs", ["status"])
    op.create_index("ix_authoring_jobs_package_id", "authoring_jobs", ["package_id"])

    op.create_table(
        "canonical_input_records",
        sa.Column("canonical_input_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contract_name", sa.String(length=128), nullable=False),
        sa.Column("contract_version", sa.String(length=32), nullable=False),
        sa.Column("minimum_reader_version", sa.String(length=32), nullable=False),
        sa.Column("producer_version", sa.String(length=256), nullable=False),
        sa.Column("release_tag", sa.String(length=128), nullable=False),
        sa.Column("release_commit", sa.String(length=40), nullable=False),
        sa.Column("schema_hash", sa.String(length=64), nullable=False),
        sa.Column("artifact_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("raw_json_bytes", sa.LargeBinary(), nullable=False),
        sa.Column("parsed_canonical_json", sa.Text(), nullable=False),
        sa.Column("authoring_job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["authoring_job_id"], ["authoring_jobs.authoring_job_id"], name="fk_canonical_input_job"
        ),
        sa.PrimaryKeyConstraint("canonical_input_id", name="pk_canonical_input_records"),
    )
    op.create_index(
        "ix_canonical_input_records_fingerprint",
        "canonical_input_records",
        ["artifact_fingerprint"],
    )
    op.create_index(
        "ix_canonical_input_records_contract_version",
        "canonical_input_records",
        ["contract_name", "contract_version"],
    )
    op.create_index(
        "ix_canonical_input_records_job", "canonical_input_records", ["authoring_job_id"]
    )

    op.create_table(
        "canonical_intake_idempotency",
        sa.Column("idempotency_record_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("idempotency_key_hash", sa.LargeBinary(), nullable=False),
        sa.Column("operation", sa.String(length=64), nullable=False),
        sa.Column("request_hash", sa.String(length=64), nullable=False),
        sa.Column("canonical_input_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("authoring_job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("response_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "status", sa.String(length=32), server_default=sa.text("'COMPLETED'"), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["canonical_input_id"],
            ["canonical_input_records.canonical_input_id"],
            name="fk_canonical_idempotency_input",
        ),
        sa.ForeignKeyConstraint(
            ["authoring_job_id"],
            ["authoring_jobs.authoring_job_id"],
            name="fk_canonical_idempotency_job",
        ),
        sa.CheckConstraint("octet_length(idempotency_key_hash) = 32", name="key_hash_length"),
        sa.CheckConstraint("request_hash ~ '^[0-9a-f]{64}$'", name="request_hash"),
        sa.CheckConstraint("status IN ('COMPLETED', 'FAILED')", name="status"),
        sa.PrimaryKeyConstraint("idempotency_record_id", name="pk_canonical_intake_idempotency"),
    )
    op.create_index(
        "uq_canonical_intake_idempotency_key",
        "canonical_intake_idempotency",
        ["idempotency_key_hash"],
        unique=True,
    )

    op.create_table(
        "transactional_outbox_events",
        sa.Column("event_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("event_type", sa.String(length=128), nullable=False),
        sa.Column("aggregate_type", sa.String(length=64), nullable=False),
        sa.Column("aggregate_id", sa.String(length=255), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "status", sa.String(length=32), server_default=sa.text("'PENDING'"), nullable=False
        ),
        sa.Column("attempt_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "status IN ('PENDING', 'PROCESSING', 'PUBLISHED', 'RETRYABLE_FAILURE', 'DEAD_LETTER')",
            name="status",
        ),
        sa.CheckConstraint("attempt_count >= 0", name="attempt_count_nonnegative"),
        sa.PrimaryKeyConstraint("event_id", name="pk_transactional_outbox_events"),
    )
    op.create_index(
        "ix_transactional_outbox_dispatch",
        "transactional_outbox_events",
        ["status", "available_at"],
    )
    op.create_index(
        "ix_transactional_outbox_aggregate",
        "transactional_outbox_events",
        ["aggregate_type", "aggregate_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_transactional_outbox_aggregate", table_name="transactional_outbox_events")
    op.drop_index("ix_transactional_outbox_dispatch", table_name="transactional_outbox_events")
    op.drop_table("transactional_outbox_events")
    op.drop_index("uq_canonical_intake_idempotency_key", table_name="canonical_intake_idempotency")
    op.drop_table("canonical_intake_idempotency")
    op.drop_index("ix_canonical_input_records_job", table_name="canonical_input_records")
    op.drop_index(
        "ix_canonical_input_records_contract_version", table_name="canonical_input_records"
    )
    op.drop_index("ix_canonical_input_records_fingerprint", table_name="canonical_input_records")
    op.drop_table("canonical_input_records")
    op.drop_index("ix_authoring_jobs_package_id", table_name="authoring_jobs")
    op.drop_index("ix_authoring_jobs_status", table_name="authoring_jobs")
    op.drop_table("authoring_jobs")
