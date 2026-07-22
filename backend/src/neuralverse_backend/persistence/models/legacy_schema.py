"""Declarative preservation of durable Stage 13--15 and BIP-M9 tables.

These tables are intentionally represented as metadata-only schema contracts.
Their application behavior remains owned by the existing Stage 13--15 and
Obsidian modules; the canonical baseline must nevertheless preserve them.
"""

# Historical constraint expressions are kept verbatim for schema fingerprints.
# ruff: noqa: E501

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKeyConstraint,
    Index,
    Integer,
    PrimaryKeyConstraint,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID

from neuralverse_backend.persistence.metadata import metadata

_JSON = JSONB(astext_type=Text())
_UUID = UUID(as_uuid=True)


def _stage13_tables() -> None:
    Table(
        "stage13_laboratory_execution_snapshots",
        metadata,
        *[
            # Keep the historical column order stable for fingerprints.
            __import__("sqlalchemy").Column("laboratory_run_id", _UUID, nullable=False),
            __import__("sqlalchemy").Column("learner_id", String(255), nullable=True),
            __import__("sqlalchemy").Column("laboratory_spec_id", _UUID, nullable=False),
            __import__("sqlalchemy").Column("laboratory_spec_version", String(64), nullable=False),
            __import__("sqlalchemy").Column("simulation_id", String(255), nullable=False),
            __import__("sqlalchemy").Column("simulation_version", String(64), nullable=False),
            __import__("sqlalchemy").Column("adapter_id", String(128), nullable=False),
            __import__("sqlalchemy").Column("adapter_version", String(64), nullable=False),
            __import__("sqlalchemy").Column("seed", BigInteger(), nullable=False),
            __import__("sqlalchemy").Column("input_payload_sha256", String(64), nullable=False),
            __import__("sqlalchemy").Column("state", String(48), nullable=False),
            __import__("sqlalchemy").Column("resource_policy_version", String(64), nullable=False),
            __import__("sqlalchemy").Column("environment_fingerprint", String(64), nullable=False),
            __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
            ForeignKeyConstraint(
                ["laboratory_run_id"],
                ["laboratory_runs.laboratory_run_id"],
                ondelete="RESTRICT",
                name="fk_stage13_snapshot_run",
            ),
            ForeignKeyConstraint(
                ["laboratory_spec_id", "laboratory_spec_version"],
                ["laboratory_specs.laboratory_spec_id", "laboratory_specs.version"],
                ondelete="RESTRICT",
                name="fk_stage13_snapshot_spec_version",
            ),
            PrimaryKeyConstraint("laboratory_run_id", name="pk_stage13_execution_snapshot"),
            CheckConstraint("char_length(input_payload_sha256) = 64", name="stage13_input_hash"),
            CheckConstraint("seed >= 0", name="stage13_seed_nonnegative"),
            UniqueConstraint(
                "laboratory_run_id", "simulation_version", name="uq_stage13_run_simulation"
            ),
            Index("ix_stage13_snapshots_learner_state", "learner_id", "state"),
        ],
    )
    Table(
        "stage13_laboratory_observations",
        metadata,
        __import__("sqlalchemy").Column("observation_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("laboratory_run_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("expected_observation_id", String(255), nullable=True),
        __import__("sqlalchemy").Column("metric", String(255), nullable=False),
        __import__("sqlalchemy").Column("value", _JSON, nullable=True),
        __import__("sqlalchemy").Column("status", String(48), nullable=False),
        __import__("sqlalchemy").Column(
            "tolerance_used", Float(), nullable=False, server_default=text("0")
        ),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["laboratory_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_observation_run",
        ),
        PrimaryKeyConstraint("observation_id", name="pk_stage13_observation"),
        CheckConstraint(
            "status IN ('MATCHED_EXPECTATION','DIVERGED_FROM_EXPECTATION','NOT_APPLICABLE','NOT_OBSERVED','UNKNOWN')",
            name="stage13_observation_status",
        ),
        Index("ix_stage13_observations_run", "laboratory_run_id"),
    )
    Table(
        "stage13_laboratory_replays",
        metadata,
        __import__("sqlalchemy").Column("replay_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("original_run_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("replay_run_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("reason", String(255), nullable=False),
        __import__("sqlalchemy").Column("comparison", String(64), nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["original_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_replay_original",
        ),
        ForeignKeyConstraint(
            ["replay_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_replay_run",
        ),
        PrimaryKeyConstraint("replay_id", name="pk_stage13_replay"),
        UniqueConstraint("replay_run_id", name="uq_stage13_replay_run"),
        CheckConstraint("original_run_id <> replay_run_id", name="stage13_replay_distinct"),
    )
    Table(
        "stage13_laboratory_portfolio_exports",
        metadata,
        __import__("sqlalchemy").Column("portfolio_export_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("laboratory_run_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("learner_id", String(255), nullable=False),
        __import__("sqlalchemy").Column("schema_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("content_hash", String(64), nullable=False),
        __import__("sqlalchemy").Column("storage_reference", String(1024), nullable=True),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["laboratory_run_id"],
            ["stage13_laboratory_execution_snapshots.laboratory_run_id"],
            ondelete="RESTRICT",
            name="fk_stage13_portfolio_run",
        ),
        PrimaryKeyConstraint("portfolio_export_id", name="pk_stage13_portfolio_export"),
        UniqueConstraint("laboratory_run_id", "content_hash", name="uq_stage13_portfolio_hash"),
        CheckConstraint("char_length(content_hash) = 64", name="stage13_portfolio_hash"),
    )
    Table(
        "stage13_assessment_verifier_snapshots",
        metadata,
        __import__("sqlalchemy").Column("verifier_snapshot_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("assessment_spec_id", _UUID, nullable=False),
        __import__("sqlalchemy").Column("assessment_spec_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("assessment_type", String(128), nullable=False),
        __import__("sqlalchemy").Column("response_schema_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("verifier_id", String(128), nullable=False),
        __import__("sqlalchemy").Column("verifier_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("policy_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["assessment_spec_id", "assessment_spec_version"],
            ["assessment_specs.assessment_spec_id", "assessment_specs.version"],
            ondelete="RESTRICT",
            name="fk_stage13_verifier_spec_version",
        ),
        PrimaryKeyConstraint("verifier_snapshot_id", name="pk_stage13_verifier_snapshot"),
        UniqueConstraint(
            "assessment_spec_id",
            "assessment_spec_version",
            "response_schema_version",
            name="uq_stage13_verifier_spec_schema",
        ),
    )
    for table_name, id_name, parent_name in (
        ("stage13_assessment_rule_outcomes", "rule_outcome_id", "verifier_snapshot_id"),
        ("stage13_assessment_reasoning_outcomes", "reasoning_outcome_id", "verifier_snapshot_id"),
        ("stage13_assessment_misconception_links", "misconception_link_id", "verifier_snapshot_id"),
        ("stage13_assessment_reinforcement_links", "reinforcement_link_id", "verifier_snapshot_id"),
    ):
        Table(
            table_name,
            metadata,
            __import__("sqlalchemy").Column(id_name, _UUID, nullable=False),
            __import__("sqlalchemy").Column(parent_name, _UUID, nullable=False),
            __import__("sqlalchemy").Column("assessment_attempt_id", _UUID, nullable=False),
            __import__("sqlalchemy").Column("learner_id", String(255), nullable=False),
            __import__("sqlalchemy").Column("mapping_version", String(64), nullable=False),
            __import__("sqlalchemy").Column("value", String(255), nullable=False),
            __import__("sqlalchemy").Column(
                "evidence", _JSON, nullable=False, server_default=text("'{}'")
            ),
            __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
            ForeignKeyConstraint(
                [parent_name],
                ["stage13_assessment_verifier_snapshots.verifier_snapshot_id"],
                ondelete="RESTRICT",
                name=f"fk_{table_name}_verifier",
            ),
            ForeignKeyConstraint(
                ["assessment_attempt_id"],
                ["assessment_attempts.assessment_attempt_id"],
                ondelete="RESTRICT",
                name=f"fk_{table_name}_attempt",
            ),
            PrimaryKeyConstraint(id_name, name=f"pk_{table_name}"),
        )


def _obsidian_tables() -> None:
    Table(
        "obsidian_sync_plans",
        metadata,
        __import__("sqlalchemy").Column("plan_id", String(128), primary_key=True),
        __import__("sqlalchemy").Column("vault_id", String(128), nullable=False),
        __import__("sqlalchemy").Column("direction", String(64), nullable=False),
        __import__("sqlalchemy").Column("status", String(32), nullable=False),
        __import__("sqlalchemy").Column("plan_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("source_fingerprint", String(128), nullable=False),
        __import__("sqlalchemy").Column("vault_fingerprint", String(128), nullable=False),
        __import__("sqlalchemy").Column("scope_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column("policy_snapshot_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column("conflicts_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column("link_deltas_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("updated_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("approved_at", DateTime(timezone=True)),
        __import__("sqlalchemy").Column("approved_by", String(256)),
        CheckConstraint(
            "status IN ('dry_run','awaiting_approval','approved','rejected','in_progress','partially_applied','completed','rolled_back','failed')",
            name="ck_obsidian_sync_plan_status",
        ),
    )
    Table(
        "obsidian_sync_operations",
        metadata,
        __import__("sqlalchemy").Column("operation_id", String(128), primary_key=True),
        __import__("sqlalchemy").Column("plan_id", String(128), nullable=False),
        __import__("sqlalchemy").Column("identity_key", String(512), nullable=False),
        __import__("sqlalchemy").Column("operation_kind", String(32), nullable=False),
        __import__("sqlalchemy").Column("relative_path", String(1024), nullable=False),
        __import__("sqlalchemy").Column("target_path", String(1024)),
        __import__("sqlalchemy").Column("expected_hash", String(128)),
        __import__("sqlalchemy").Column("applied_hash", String(128)),
        __import__("sqlalchemy").Column("status", String(32), nullable=False),
        __import__("sqlalchemy").Column(
            "failure_summary", String(4096), nullable=False, server_default=text("''")
        ),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("updated_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(["plan_id"], ["obsidian_sync_plans.plan_id"], ondelete="CASCADE"),
        UniqueConstraint("plan_id", "identity_key", name="uq_obsidian_sync_operation_identity"),
        Index("ix_obsidian_sync_operations_plan", "plan_id"),
    )
    Table(
        "obsidian_sync_baselines",
        metadata,
        __import__("sqlalchemy").Column("identity_key", String(512), primary_key=True),
        __import__("sqlalchemy").Column("vault_id", String(128), nullable=False),
        __import__("sqlalchemy").Column("relative_path", String(1024), nullable=False),
        __import__("sqlalchemy").Column("source_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("frontmatter_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("managed_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("full_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("captured_at", DateTime(timezone=True), nullable=False),
        UniqueConstraint("vault_id", "relative_path", name="uq_obsidian_sync_baseline_vault_path"),
    )
    Table(
        "obsidian_editorial_proposals",
        metadata,
        __import__("sqlalchemy").Column("proposal_id", String(128), primary_key=True),
        __import__("sqlalchemy").Column("identity_key", String(512), nullable=False),
        __import__("sqlalchemy").Column("relative_path", String(1024), nullable=False),
        __import__("sqlalchemy").Column("base_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("vault_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column(
            "status", String(32), nullable=False, server_default=text("'pending_review'")
        ),
        __import__("sqlalchemy").Column("diff_text", Text, nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("reviewed_at", DateTime(timezone=True)),
        __import__("sqlalchemy").Column("reviewed_by", String(256)),
        UniqueConstraint(
            "identity_key", "vault_hash", name="uq_obsidian_editorial_proposal_revision"
        ),
    )
    Table(
        "obsidian_sync_audit_events",
        metadata,
        __import__("sqlalchemy").Column("event_id", String(128), primary_key=True),
        __import__("sqlalchemy").Column("plan_id", String(128), nullable=False),
        __import__("sqlalchemy").Column("event_type", String(64), nullable=False),
        __import__("sqlalchemy").Column("actor", String(256), nullable=False),
        __import__("sqlalchemy").Column("operation_id", String(128)),
        __import__("sqlalchemy").Column("payload_json", JSON, nullable=False),
        __import__("sqlalchemy").Column("occurred_at", DateTime(timezone=True), nullable=False),
        Index("ix_obsidian_sync_audit_plan", "plan_id", "occurred_at"),
    )


def _stage15_tables() -> None:
    Table(
        "stage15_review_bundles",
        metadata,
        __import__("sqlalchemy").Column("bundle_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("handoff_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("handoff_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("package_id", String(255), nullable=False),
        __import__("sqlalchemy").Column("draft_id", String(255), nullable=False),
        __import__("sqlalchemy").Column("draft_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("draft_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("readiness_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("readiness_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("source_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("asset_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("laboratory_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("assessment_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("policy_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("policy_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("candidate_fingerprint", String(128), nullable=False),
        __import__("sqlalchemy").Column("required_disciplines", _JSON, nullable=False),
        __import__("sqlalchemy").Column("status", String(40), nullable=False),
        __import__("sqlalchemy").Column(
            "revision_cycles", Integer, nullable=False, server_default=text("0")
        ),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("invalidated_at", DateTime(timezone=True)),
        __import__("sqlalchemy").Column("invalidation_reason", Text),
        UniqueConstraint("handoff_id", "candidate_fingerprint", name="uq_stage15_bundle_candidate"),
        CheckConstraint("revision_cycles >= 0", name="ck_stage15_bundle_revision_cycles"),
        Index("ix_stage15_bundle_package", "package_id"),
    )
    Table(
        "stage15_review_requirements",
        metadata,
        __import__("sqlalchemy").Column("requirement_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("bundle_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("discipline", String(64), nullable=False),
        __import__("sqlalchemy").Column("required_role", String(96), nullable=False),
        __import__("sqlalchemy").Column("scope_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column(
            "required", Boolean, nullable=False, server_default=text("true")
        ),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["bundle_id"], ["stage15_review_bundles.bundle_id"], ondelete="RESTRICT"
        ),
        UniqueConstraint("bundle_id", "discipline", name="uq_stage15_requirement_discipline"),
    )
    Table(
        "stage15_review_assignments",
        metadata,
        __import__("sqlalchemy").Column("assignment_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("bundle_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("discipline", String(64), nullable=False),
        __import__("sqlalchemy").Column("required_role", String(96), nullable=False),
        __import__("sqlalchemy").Column("reviewer", String(255), nullable=False),
        __import__("sqlalchemy").Column("assigned_by", String(255), nullable=False),
        __import__("sqlalchemy").Column("status", String(32), nullable=False),
        __import__("sqlalchemy").Column(
            "conflict_of_interest", Boolean, nullable=False, server_default=text("false")
        ),
        __import__("sqlalchemy").Column("assigned_at", DateTime(timezone=True), nullable=False),
        ForeignKeyConstraint(
            ["bundle_id"], ["stage15_review_bundles.bundle_id"], ondelete="RESTRICT"
        ),
        UniqueConstraint("bundle_id", "discipline", name="uq_stage15_assignment_discipline"),
        Index("ix_stage15_assignment_reviewer", "reviewer"),
    )
    Table(
        "stage15_review_records",
        metadata,
        __import__("sqlalchemy").Column("review_record_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("bundle_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("discipline", String(64), nullable=False),
        __import__("sqlalchemy").Column("reviewer", String(255), nullable=False),
        __import__("sqlalchemy").Column("reviewer_role", String(96), nullable=False),
        __import__("sqlalchemy").Column("candidate_fingerprint", String(128), nullable=False),
        __import__("sqlalchemy").Column("decision", String(48), nullable=False),
        __import__("sqlalchemy").Column("findings_json", _JSON, nullable=False),
        __import__("sqlalchemy").Column("rationale", Text, nullable=False),
        __import__("sqlalchemy").Column("checklist_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("source_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("asset_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("laboratory_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("assessment_snapshot_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("submitted_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("fresh_until", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("record_hash", String(128), nullable=False),
        ForeignKeyConstraint(
            ["bundle_id"], ["stage15_review_bundles.bundle_id"], ondelete="RESTRICT"
        ),
        UniqueConstraint(
            "bundle_id", "discipline", "record_hash", name="uq_stage15_review_record_revision"
        ),
        Index("ix_stage15_record_bundle", "bundle_id", "submitted_at"),
    )
    Table(
        "stage15_review_findings",
        metadata,
        __import__("sqlalchemy").Column("finding_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("review_record_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("discipline", String(64), nullable=False),
        __import__("sqlalchemy").Column("severity", String(16), nullable=False),
        __import__("sqlalchemy").Column("classification", String(96), nullable=False),
        __import__("sqlalchemy").Column("description", Text, nullable=False),
        __import__("sqlalchemy").Column("affected_ids", _JSON, nullable=False),
        __import__("sqlalchemy").Column("evidence_refs", _JSON, nullable=False),
        __import__("sqlalchemy").Column("required_action", Text, nullable=False),
        __import__("sqlalchemy").Column("status", String(48), nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("resolved_at", DateTime(timezone=True)),
        __import__("sqlalchemy").Column("resolution_evidence", Text),
        ForeignKeyConstraint(
            ["review_record_id"], ["stage15_review_records.review_record_id"], ondelete="RESTRICT"
        ),
        CheckConstraint(
            "severity IN ('P0','P1','P2','P3','UNKNOWN')", name="ck_stage15_finding_severity"
        ),
        Index("ix_stage15_finding_record", "review_record_id"),
    )
    Table(
        "stage15_final_publication_decisions",
        metadata,
        __import__("sqlalchemy").Column("decision_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("bundle_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("candidate_fingerprint", String(128), nullable=False),
        __import__("sqlalchemy").Column("readiness_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("readiness_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("handoff_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("handoff_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("review_ids", _JSON, nullable=False),
        __import__("sqlalchemy").Column("p0_count", Integer, nullable=False),
        __import__("sqlalchemy").Column("p1_count", Integer, nullable=False),
        __import__("sqlalchemy").Column("unknown_count", Integer, nullable=False),
        __import__("sqlalchemy").Column("decision", String(48), nullable=False),
        __import__("sqlalchemy").Column("rationale", Text, nullable=False),
        __import__("sqlalchemy").Column("actor", String(255), nullable=False),
        __import__("sqlalchemy").Column("actor_role", String(96), nullable=False),
        __import__("sqlalchemy").Column("policy_version", String(64), nullable=False),
        __import__("sqlalchemy").Column("created_at", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("fresh_until", DateTime(timezone=True), nullable=False),
        __import__("sqlalchemy").Column("decision_hash", String(128), nullable=False),
        ForeignKeyConstraint(
            ["bundle_id"], ["stage15_review_bundles.bundle_id"], ondelete="RESTRICT"
        ),
        UniqueConstraint(
            "bundle_id", "candidate_fingerprint", name="uq_stage15_final_decision_candidate"
        ),
        CheckConstraint(
            "p0_count >= 0 AND p1_count >= 0 AND unknown_count >= 0",
            name="ck_stage15_decision_counts",
        ),
        Index("ix_stage15_decision_bundle", "bundle_id"),
    )
    Table(
        "stage15_publication_acknowledgements",
        metadata,
        __import__("sqlalchemy").Column("acknowledgement_id", String(160), primary_key=True),
        __import__("sqlalchemy").Column("command_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("idempotency_key", String(255), nullable=False),
        __import__("sqlalchemy").Column("package_id", String(255), nullable=False),
        __import__("sqlalchemy").Column("content_version_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("release_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("release_number", Integer, nullable=False),
        __import__("sqlalchemy").Column("publication_audit_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("outbox_event_id", String(160), nullable=False),
        __import__("sqlalchemy").Column("published_by", String(255), nullable=False),
        __import__("sqlalchemy").Column("supersedes_release_id", String(160)),
        __import__("sqlalchemy").Column("result_hash", String(128), nullable=False),
        __import__("sqlalchemy").Column("published_at", DateTime(timezone=True), nullable=False),
        UniqueConstraint("idempotency_key", name="uq_stage15_ack_idempotency"),
        UniqueConstraint("package_id", "content_version_id", name="uq_stage15_ack_candidate"),
    )


_stage13_tables()
_obsidian_tables()
_stage15_tables()
