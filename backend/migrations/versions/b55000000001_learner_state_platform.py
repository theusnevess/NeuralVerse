"""Additive BIP-M7 learner-state portability and privacy structures.

This revision branches from the finalized BIP-M6/BIP-M5 head ``b530``.  It
only adds learner-owned state; canonical content and later-stage projection
migrations are intentionally untouched.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b55000000001"
down_revision: str | Sequence[str] | None = "b53000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())
_UUID = postgresql.UUID(as_uuid=True)


def _learner_fk() -> sa.ForeignKeyConstraint:
    return sa.ForeignKeyConstraint(
        ["learner_id"], ["learner_profiles.learner_id"], ondelete="RESTRICT"
    )


def upgrade() -> None:
    # Existing learner tables predate BIP-M7 and receive only additive state
    # metadata needed for optimistic concurrency and restart restoration.
    op.add_column(
        "learner_progress",
        sa.Column("revision", sa.Integer(), server_default="0", nullable=False),
        if_not_exists=True,
    )
    op.add_column(
        "learner_notes", sa.Column("revision", sa.Integer(), server_default="1", nullable=False),
        if_not_exists=True,
    )
    op.add_column(
        "learner_sessions", sa.Column("revision", sa.Integer(), server_default="1", nullable=False),
        if_not_exists=True,
    )
    op.add_column(
        "learner_sessions",
        sa.Column("status", sa.String(32), server_default="active", nullable=False),
        if_not_exists=True,
    )
    op.add_column(
        "learner_sessions",
        sa.Column("active_release_id", sa.String(255), nullable=True),
        if_not_exists=True,
    )
    op.add_column(
        "learner_sessions",
        sa.Column("active_block_id", sa.String(255), nullable=True),
        if_not_exists=True,
    )
    op.add_column(
        "learner_sessions",
        sa.Column("continuity_metadata", _JSON, nullable=True),
        if_not_exists=True,
    )
    op.create_check_constraint(
        "learner_progress_revision_nonnegative", "learner_progress", "revision >= 0"
    )
    op.create_check_constraint("learner_note_revision_positive", "learner_notes", "revision > 0")
    op.create_check_constraint(
        "learner_session_revision_positive", "learner_sessions", "revision > 0"
    )
    op.create_check_constraint(
        "learner_session_status_valid",
        "learner_sessions",
        "status IN ('active','paused','completed','cancelled')",
    )

    op.create_table(
        "learner_preferences",
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("preference_key", sa.String(128), nullable=False),
        sa.Column("schema_version", sa.String(64), nullable=False),
        sa.Column("value", _JSON, nullable=False),
        sa.Column("revision", sa.Integer(), server_default="0", nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint("learner_id", "preference_key", name="pk_learner_preferences"),
        sa.CheckConstraint("revision >= 0", name="learner_preferences_revision_nonnegative"),
    )
    op.create_index("ix_learner_preferences_learner", "learner_preferences", ["learner_id"])

    op.create_table(
        "learner_note_revisions",
        sa.Column("note_revision_id", _UUID, nullable=False),
        sa.Column("note_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["learner_notes.note_id"], ondelete="RESTRICT"),
        _learner_fk(),
        sa.PrimaryKeyConstraint("note_revision_id", name="pk_learner_note_revisions"),
        sa.UniqueConstraint("note_id", "revision", name="uq_learner_note_revision"),
        sa.CheckConstraint("revision > 0", name="learner_note_revision_positive"),
    )
    op.create_index(
        "ix_learner_note_revisions_note",
        "learner_note_revisions",
        ["learner_id", "note_id", "revision"],
    )

    op.create_table(
        "learner_note_conflicts",
        sa.Column("conflict_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("note_id", _UUID, nullable=False),
        sa.Column("client_revision", sa.Integer(), nullable=False),
        sa.Column("server_revision", sa.Integer(), nullable=False),
        sa.Column("client_text", sa.Text(), nullable=False),
        sa.Column("status", sa.String(32), server_default="open", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["learner_notes.note_id"], ondelete="RESTRICT"),
        _learner_fk(),
        sa.PrimaryKeyConstraint("conflict_id", name="pk_learner_note_conflicts"),
        sa.CheckConstraint(
            "status IN ('open','resolved','dismissed')", name="learner_note_conflict_status"
        ),
    )
    op.create_index(
        "ix_learner_note_conflicts_status", "learner_note_conflicts", ["learner_id", "status"]
    )

    op.create_table(
        "learner_feedback",
        sa.Column("feedback_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("resource_id", sa.String(255), nullable=False),
        sa.Column("feedback_type", sa.String(64), nullable=False),
        sa.Column("payload", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint("feedback_id", name="pk_learner_feedback"),
    )
    op.create_index(
        "ix_learner_feedback_resource", "learner_feedback", ["learner_id", "resource_id"]
    )

    op.create_table(
        "learner_state_conflicts",
        sa.Column("conflict_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("state_type", sa.String(64), nullable=False),
        sa.Column("resource_id", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), server_default="open", nullable=False),
        sa.Column("details", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint("conflict_id", name="pk_learner_state_conflicts"),
    )
    op.create_index(
        "ix_learner_state_conflicts",
        "learner_state_conflicts",
        ["learner_id", "status", "created_at"],
    )

    op.create_table(
        "learner_state_exports",
        sa.Column("export_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("schema_version", sa.String(64), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("payload", _JSON, nullable=False),
        sa.Column("status", sa.String(32), server_default="completed", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        _learner_fk(),
        sa.PrimaryKeyConstraint("export_id", name="pk_learner_state_exports"),
        sa.CheckConstraint("char_length(checksum) = 64", name="learner_export_checksum_length"),
    )
    op.create_index(
        "ix_learner_state_exports_learner", "learner_state_exports", ["learner_id", "created_at"]
    )

    op.create_table(
        "learner_state_imports",
        sa.Column("import_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("schema_version", sa.String(64), nullable=False),
        sa.Column("checksum", sa.String(64), nullable=False),
        sa.Column("status", sa.String(32), server_default="completed", nullable=False),
        sa.Column("counts", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint("import_id", name="pk_learner_state_imports"),
        sa.CheckConstraint("char_length(checksum) = 64", name="learner_import_checksum_length"),
    )
    op.create_index(
        "ix_learner_state_imports_learner", "learner_state_imports", ["learner_id", "created_at"]
    )

    op.create_table(
        "learner_deletion_jobs",
        sa.Column("deletion_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("status", sa.String(32), server_default="requested", nullable=False),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("safe_counts", _JSON, nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint("deletion_id", name="pk_learner_deletion_jobs"),
        sa.UniqueConstraint("idempotency_key", name="uq_learner_deletion_idempotency"),
        sa.CheckConstraint(
            "status IN ('requested','in_progress','completed','failed')",
            name="learner_deletion_status",
        ),
    )
    op.create_index(
        "ix_learner_deletion_jobs_status", "learner_deletion_jobs", ["learner_id", "status"]
    )

    op.create_table(
        "learner_deletion_audit",
        sa.Column("audit_id", _UUID, nullable=False),
        sa.Column("deletion_id", _UUID, nullable=False),
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("action", sa.String(64), nullable=False),
        sa.Column("actor_authority", sa.String(128), nullable=False),
        sa.Column("correlation_id", sa.String(255), nullable=False),
        sa.Column("safe_counts", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["deletion_id"], ["learner_deletion_jobs.deletion_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("audit_id", name="pk_learner_deletion_audit"),
    )
    op.create_index(
        "ix_learner_deletion_audit_learner", "learner_deletion_audit", ["learner_id", "created_at"]
    )

    op.create_table(
        "learner_command_idempotency",
        sa.Column("learner_id", _UUID, nullable=False),
        sa.Column("command_scope", sa.String(64), nullable=False),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("request_hash", sa.String(64), nullable=False),
        sa.Column("response", _JSON, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        _learner_fk(),
        sa.PrimaryKeyConstraint(
            "learner_id", "command_scope", "idempotency_key", name="pk_learner_command_idempotency"
        ),
    )
    op.create_index(
        "ix_learner_command_idempotency",
        "learner_command_idempotency",
        ["learner_id", "command_scope"],
    )


def downgrade() -> None:
    op.drop_index("ix_learner_command_idempotency", table_name="learner_command_idempotency")
    op.drop_table("learner_command_idempotency")
    op.drop_index("ix_learner_deletion_audit_learner", table_name="learner_deletion_audit")
    op.drop_table("learner_deletion_audit")
    op.drop_index("ix_learner_deletion_jobs_status", table_name="learner_deletion_jobs")
    op.drop_table("learner_deletion_jobs")
    op.drop_index("ix_learner_state_imports_learner", table_name="learner_state_imports")
    op.drop_table("learner_state_imports")
    op.drop_index("ix_learner_state_exports_learner", table_name="learner_state_exports")
    op.drop_table("learner_state_exports")
    op.drop_index("ix_learner_state_conflicts", table_name="learner_state_conflicts")
    op.drop_table("learner_state_conflicts")
    op.drop_index("ix_learner_feedback_resource", table_name="learner_feedback")
    op.drop_table("learner_feedback")
    op.drop_index("ix_learner_note_conflicts_status", table_name="learner_note_conflicts")
    op.drop_table("learner_note_conflicts")
    op.drop_index("ix_learner_note_revisions_note", table_name="learner_note_revisions")
    op.drop_table("learner_note_revisions")
    op.drop_index("ix_learner_preferences_learner", table_name="learner_preferences")
    op.drop_table("learner_preferences")
    op.drop_constraint("learner_session_status_valid", "learner_sessions", type_="check")
    op.drop_constraint("learner_session_revision_positive", "learner_sessions", type_="check")
    op.drop_constraint("learner_note_revision_positive", "learner_notes", type_="check")
    op.drop_constraint("learner_progress_revision_nonnegative", "learner_progress", type_="check")
    for table, column in (
        ("learner_sessions", "continuity_metadata"),
        ("learner_sessions", "active_block_id"),
        ("learner_sessions", "active_release_id"),
        ("learner_sessions", "status"),
        ("learner_sessions", "revision"),
        ("learner_notes", "revision"),
        ("learner_progress", "revision"),
    ):
        op.drop_column(table, column)
