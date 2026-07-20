"""Additive Stage 13 execution snapshots and assessment verification records.

This migration extends the canonical committed BIP-M7 head ``b550``.  It
stores operational snapshots and references; semantic laboratory and
assessment meaning remains owned by ACP and existing M7 specification tables.
Concurrent M9 migration candidates are intentionally not part of this graph.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "b57000000001"
down_revision: str | Sequence[str] | None = "b55000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())
_UUID = postgresql.UUID(as_uuid=True)


def upgrade() -> None:
    op.create_table(
        "stage13_laboratory_execution_snapshots",
        sa.Column("laboratory_run_id", _UUID, nullable=False),
        sa.Column("learner_id", sa.String(255), nullable=True),
        sa.Column("laboratory_spec_id", _UUID, nullable=False),
        sa.Column("laboratory_spec_version", sa.String(64), nullable=False),
        sa.Column("simulation_id", sa.String(255), nullable=False),
        sa.Column("simulation_version", sa.String(64), nullable=False),
        sa.Column("adapter_id", sa.String(128), nullable=False),
        sa.Column("adapter_version", sa.String(64), nullable=False),
        sa.Column("seed", sa.BigInteger(), nullable=False),
        sa.Column("input_payload_sha256", sa.String(64), nullable=False),
        sa.Column("state", sa.String(48), nullable=False),
        sa.Column("resource_policy_version", sa.String(64), nullable=False),
        sa.Column("environment_fingerprint", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["laboratory_run_id"],
            ["laboratory_runs.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_snapshot_run",
        ),
        sa.ForeignKeyConstraint(
            ["laboratory_spec_id", "laboratory_spec_version"],
            ["laboratory_specs.laboratory_spec_id", "laboratory_specs.version"],
            ondelete="RESTRICT",
            name="fk_stage13_snapshot_spec_version",
        ),
        sa.PrimaryKeyConstraint("laboratory_run_id", name="pk_stage13_execution_snapshot"),
        sa.CheckConstraint("char_length(input_payload_sha256) = 64", name="stage13_input_hash"),
        sa.CheckConstraint("seed >= 0", name="stage13_seed_nonnegative"),
        sa.UniqueConstraint(
            "laboratory_run_id", "simulation_version", name="uq_stage13_run_simulation"
        ),
    )
    op.create_index(
        "ix_stage13_snapshots_learner_state",
        "stage13_laboratory_execution_snapshots",
        ["learner_id", "state"],
    )

    op.create_table(
        "stage13_laboratory_observations",
        sa.Column("observation_id", _UUID, nullable=False),
        sa.Column("laboratory_run_id", _UUID, nullable=False),
        sa.Column("expected_observation_id", sa.String(255), nullable=True),
        sa.Column("metric", sa.String(255), nullable=False),
        sa.Column("value", _JSON, nullable=True),
        sa.Column("status", sa.String(48), nullable=False),
        sa.Column("tolerance_used", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["laboratory_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_observation_run",
        ),
        sa.PrimaryKeyConstraint("observation_id", name="pk_stage13_observation"),
        sa.CheckConstraint(
            "status IN ('MATCHED_EXPECTATION','DIVERGED_FROM_EXPECTATION','NOT_APPLICABLE','NOT_OBSERVED','UNKNOWN')",
            name="stage13_observation_status",
        ),
    )
    op.create_index("ix_stage13_observations_run", "stage13_laboratory_observations", ["laboratory_run_id"])

    op.create_table(
        "stage13_laboratory_replays",
        sa.Column("replay_id", _UUID, nullable=False),
        sa.Column("original_run_id", _UUID, nullable=False),
        sa.Column("replay_run_id", _UUID, nullable=False),
        sa.Column("reason", sa.String(255), nullable=False),
        sa.Column("comparison", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["original_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_replay_original",
        ),
        sa.ForeignKeyConstraint(
            ["replay_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_replay_run",
        ),
        sa.PrimaryKeyConstraint("replay_id", name="pk_stage13_replay"),
        sa.UniqueConstraint("replay_run_id", name="uq_stage13_replay_run"),
        sa.CheckConstraint("original_run_id <> replay_run_id", name="stage13_replay_distinct"),
    )

    op.create_table(
        "stage13_laboratory_portfolio_exports",
        sa.Column("portfolio_export_id", _UUID, nullable=False),
        sa.Column("laboratory_run_id", _UUID, nullable=False),
        sa.Column("learner_id", sa.String(255), nullable=False),
        sa.Column("schema_version", sa.String(64), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("storage_reference", sa.String(1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["laboratory_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_portfolio_run",
        ),
        sa.PrimaryKeyConstraint("portfolio_export_id", name="pk_stage13_portfolio_export"),
        sa.UniqueConstraint("laboratory_run_id", "content_hash", name="uq_stage13_portfolio_hash"),
        sa.CheckConstraint("char_length(content_hash) = 64", name="stage13_portfolio_hash"),
    )

    op.create_table(
        "stage13_assessment_verifier_snapshots",
        sa.Column("verifier_snapshot_id", _UUID, nullable=False),
        sa.Column("assessment_spec_id", _UUID, nullable=False),
        sa.Column("assessment_spec_version", sa.String(64), nullable=False),
        sa.Column("assessment_type", sa.String(128), nullable=False),
        sa.Column("response_schema_version", sa.String(64), nullable=False),
        sa.Column("verifier_id", sa.String(128), nullable=False),
        sa.Column("verifier_version", sa.String(64), nullable=False),
        sa.Column("policy_version", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["assessment_spec_id", "assessment_spec_version"],
            ["assessment_specs.assessment_spec_id", "assessment_specs.version"],
            ondelete="RESTRICT",
            name="fk_stage13_verifier_spec_version",
        ),
        sa.PrimaryKeyConstraint("verifier_snapshot_id", name="pk_stage13_verifier_snapshot"),
        sa.UniqueConstraint(
            "assessment_spec_id", "assessment_spec_version", "response_schema_version",
            name="uq_stage13_verifier_spec_schema",
        ),
    )

    for table_name, id_name, parent_name in (
        (
            "stage13_assessment_rule_outcomes",
            "rule_outcome_id",
            "verifier_snapshot_id",
        ),
        (
            "stage13_assessment_reasoning_outcomes",
            "reasoning_outcome_id",
            "verifier_snapshot_id",
        ),
        (
            "stage13_assessment_misconception_links",
            "misconception_link_id",
            "verifier_snapshot_id",
        ),
        (
            "stage13_assessment_reinforcement_links",
            "reinforcement_link_id",
            "verifier_snapshot_id",
        ),
    ):
        op.create_table(
            table_name,
            sa.Column(id_name, _UUID, nullable=False),
            sa.Column(parent_name, _UUID, nullable=False),
            sa.Column("assessment_attempt_id", _UUID, nullable=False),
            sa.Column("learner_id", sa.String(255), nullable=False),
            sa.Column("mapping_version", sa.String(64), nullable=False),
            sa.Column("value", sa.String(255), nullable=False),
            sa.Column("evidence", _JSON, nullable=False, server_default="{}"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.ForeignKeyConstraint(
                [parent_name],
                ["stage13_assessment_verifier_snapshots.verifier_snapshot_id"],
                ondelete="RESTRICT",
                name=f"fk_{table_name}_verifier",
            ),
            sa.ForeignKeyConstraint(
                ["assessment_attempt_id"],
                ["assessment_attempts.assessment_attempt_id"],
                ondelete="RESTRICT",
                name=f"fk_{table_name}_attempt",
            ),
            sa.PrimaryKeyConstraint(id_name, name=f"pk_{table_name}"),
        )


def downgrade() -> None:
    for table_name in (
        "stage13_assessment_reinforcement_links",
        "stage13_assessment_misconception_links",
        "stage13_assessment_reasoning_outcomes",
        "stage13_assessment_rule_outcomes",
        "stage13_assessment_verifier_snapshots",
        "stage13_laboratory_portfolio_exports",
        "stage13_laboratory_replays",
        "stage13_laboratory_observations",
        "stage13_laboratory_execution_snapshots",
    ):
        op.drop_table(table_name)
