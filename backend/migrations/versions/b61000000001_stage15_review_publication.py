"""Persist Stage 15 review authorization and publication acknowledgements.

Revision ID: b61000000001
Revises: b60000000001
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "b61000000001"
down_revision = "b60000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())
_UUID = postgresql.UUID(as_uuid=True)


def upgrade() -> None:
    op.create_table(
        "stage15_review_bundles",
        sa.Column("bundle_id", sa.String(160), primary_key=True),
        sa.Column("handoff_id", sa.String(160), nullable=False),
        sa.Column("handoff_hash", sa.String(128), nullable=False),
        sa.Column("package_id", sa.String(255), nullable=False),
        sa.Column("draft_id", sa.String(255), nullable=False),
        sa.Column("draft_version", sa.String(64), nullable=False),
        sa.Column("draft_hash", sa.String(128), nullable=False),
        sa.Column("readiness_id", sa.String(160), nullable=False),
        sa.Column("readiness_hash", sa.String(128), nullable=False),
        sa.Column("source_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("asset_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("laboratory_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("assessment_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("policy_id", sa.String(160), nullable=False),
        sa.Column("policy_version", sa.String(64), nullable=False),
        sa.Column("candidate_fingerprint", sa.String(128), nullable=False),
        sa.Column("required_disciplines", _JSON, nullable=False),
        sa.Column("status", sa.String(40), nullable=False),
        sa.Column("revision_cycles", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("invalidated_at", sa.DateTime(timezone=True)),
        sa.Column("invalidation_reason", sa.Text()),
        sa.UniqueConstraint(
            "handoff_id", "candidate_fingerprint", name="uq_stage15_bundle_candidate"
        ),
        sa.CheckConstraint("revision_cycles >= 0", name="ck_stage15_bundle_revision_cycles"),
    )
    op.create_table(
        "stage15_review_requirements",
        sa.Column("requirement_id", sa.String(160), primary_key=True),
        sa.Column(
            "bundle_id",
            sa.String(160),
            sa.ForeignKey("stage15_review_bundles.bundle_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("discipline", sa.String(64), nullable=False),
        sa.Column("required_role", sa.String(96), nullable=False),
        sa.Column("scope_json", _JSON, nullable=False),
        sa.Column("required", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("bundle_id", "discipline", name="uq_stage15_requirement_discipline"),
    )
    op.create_table(
        "stage15_review_assignments",
        sa.Column("assignment_id", sa.String(160), primary_key=True),
        sa.Column(
            "bundle_id",
            sa.String(160),
            sa.ForeignKey("stage15_review_bundles.bundle_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("discipline", sa.String(64), nullable=False),
        sa.Column("required_role", sa.String(96), nullable=False),
        sa.Column("reviewer", sa.String(255), nullable=False),
        sa.Column("assigned_by", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("conflict_of_interest", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("bundle_id", "discipline", name="uq_stage15_assignment_discipline"),
    )
    op.create_table(
        "stage15_review_records",
        sa.Column("review_record_id", sa.String(160), primary_key=True),
        sa.Column(
            "bundle_id",
            sa.String(160),
            sa.ForeignKey("stage15_review_bundles.bundle_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("discipline", sa.String(64), nullable=False),
        sa.Column("reviewer", sa.String(255), nullable=False),
        sa.Column("reviewer_role", sa.String(96), nullable=False),
        sa.Column("candidate_fingerprint", sa.String(128), nullable=False),
        sa.Column("decision", sa.String(48), nullable=False),
        sa.Column("findings_json", _JSON, nullable=False),
        sa.Column("rationale", sa.Text, nullable=False),
        sa.Column("checklist_version", sa.String(64), nullable=False),
        sa.Column("source_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("asset_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("laboratory_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("assessment_snapshot_hash", sa.String(128), nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fresh_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("record_hash", sa.String(128), nullable=False),
        sa.UniqueConstraint(
            "bundle_id", "discipline", "record_hash", name="uq_stage15_review_record_revision"
        ),
    )
    op.create_table(
        "stage15_review_findings",
        sa.Column("finding_id", sa.String(160), primary_key=True),
        sa.Column(
            "review_record_id",
            sa.String(160),
            sa.ForeignKey("stage15_review_records.review_record_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("discipline", sa.String(64), nullable=False),
        sa.Column("severity", sa.String(16), nullable=False),
        sa.Column("classification", sa.String(96), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("affected_ids", _JSON, nullable=False),
        sa.Column("evidence_refs", _JSON, nullable=False),
        sa.Column("required_action", sa.Text, nullable=False),
        sa.Column("status", sa.String(48), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
        sa.Column("resolution_evidence", sa.Text),
        sa.CheckConstraint(
            "severity IN ('P0','P1','P2','P3','UNKNOWN')", name="ck_stage15_finding_severity"
        ),
    )
    op.create_table(
        "stage15_final_publication_decisions",
        sa.Column("decision_id", sa.String(160), primary_key=True),
        sa.Column(
            "bundle_id",
            sa.String(160),
            sa.ForeignKey("stage15_review_bundles.bundle_id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("candidate_fingerprint", sa.String(128), nullable=False),
        sa.Column("readiness_id", sa.String(160), nullable=False),
        sa.Column("readiness_hash", sa.String(128), nullable=False),
        sa.Column("handoff_id", sa.String(160), nullable=False),
        sa.Column("handoff_hash", sa.String(128), nullable=False),
        sa.Column("review_ids", _JSON, nullable=False),
        sa.Column("p0_count", sa.Integer, nullable=False),
        sa.Column("p1_count", sa.Integer, nullable=False),
        sa.Column("unknown_count", sa.Integer, nullable=False),
        sa.Column("decision", sa.String(48), nullable=False),
        sa.Column("rationale", sa.Text, nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("actor_role", sa.String(96), nullable=False),
        sa.Column("policy_version", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fresh_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("decision_hash", sa.String(128), nullable=False),
        sa.UniqueConstraint(
            "bundle_id", "candidate_fingerprint", name="uq_stage15_final_decision_candidate"
        ),
        sa.CheckConstraint(
            "p0_count >= 0 AND p1_count >= 0 AND unknown_count >= 0",
            name="ck_stage15_decision_counts",
        ),
    )
    op.create_table(
        "stage15_publication_acknowledgements",
        sa.Column("acknowledgement_id", sa.String(160), primary_key=True),
        sa.Column("command_id", sa.String(160), nullable=False),
        sa.Column("idempotency_key", sa.String(255), nullable=False),
        sa.Column("package_id", sa.String(255), nullable=False),
        sa.Column("content_version_id", sa.String(160), nullable=False),
        sa.Column("release_id", sa.String(160), nullable=False),
        sa.Column("release_number", sa.Integer, nullable=False),
        sa.Column("publication_audit_id", sa.String(160), nullable=False),
        sa.Column("outbox_event_id", sa.String(160), nullable=False),
        sa.Column("published_by", sa.String(255), nullable=False),
        sa.Column("supersedes_release_id", sa.String(160)),
        sa.Column("result_hash", sa.String(128), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("idempotency_key", name="uq_stage15_ack_idempotency"),
        sa.UniqueConstraint("package_id", "content_version_id", name="uq_stage15_ack_candidate"),
    )
    for name, table, columns in (
        ("ix_stage15_bundle_package", "stage15_review_bundles", ["package_id"]),
        ("ix_stage15_assignment_reviewer", "stage15_review_assignments", ["reviewer"]),
        ("ix_stage15_record_bundle", "stage15_review_records", ["bundle_id", "submitted_at"]),
        ("ix_stage15_finding_record", "stage15_review_findings", ["review_record_id"]),
        ("ix_stage15_decision_bundle", "stage15_final_publication_decisions", ["bundle_id"]),
    ):
        op.create_index(name, table, columns)


def downgrade() -> None:
    for name, table in (
        ("ix_stage15_decision_bundle", "stage15_final_publication_decisions"),
        ("ix_stage15_finding_record", "stage15_review_findings"),
        ("ix_stage15_record_bundle", "stage15_review_records"),
        ("ix_stage15_assignment_reviewer", "stage15_review_assignments"),
        ("ix_stage15_bundle_package", "stage15_review_bundles"),
    ):
        op.drop_index(name, table_name=table)
    for table in (
        "stage15_publication_acknowledgements",
        "stage15_final_publication_decisions",
        "stage15_review_findings",
        "stage15_review_records",
        "stage15_review_assignments",
        "stage15_review_requirements",
        "stage15_review_bundles",
    ):
        op.drop_table(table)
