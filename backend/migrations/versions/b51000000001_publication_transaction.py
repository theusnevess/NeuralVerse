"""BIP-M3 immutable publication transaction; persist learner collection."""

# ruff: noqa: E501

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import context, op
from sqlalchemy.dialects import postgresql

revision: str = "b51000000001"
down_revision: str | Sequence[str] | None = "b50000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if context.is_offline_mode():
        columns: set[str] = set()
        constraints: set[str] = set()
    else:
        inspector = sa.inspect(bind)
        columns = {column["name"] for column in inspector.get_columns("publication_releases")}
        constraints = {
            item["name"]
            for item in inspector.get_check_constraints("publication_releases")
            if item.get("name")
        } | {
            item["name"]
            for item in inspector.get_unique_constraints("publication_releases")
            if item.get("name")
        }
    def has_constraint(name: str) -> bool:
        return any(item == name or item.endswith(f"_{name}") for item in constraints)
    if "release_number" not in columns:
        op.add_column(
            "publication_releases",
            sa.Column("release_number", sa.Integer(), nullable=True),
        )
        op.execute(
            sa.text(
                """
                WITH ranked AS (
                    SELECT publication_release_id,
                           row_number() OVER (
                               PARTITION BY content_package_id
                               ORDER BY created_at, publication_release_id
                           ) AS release_number
                    FROM publication_releases
                )
                UPDATE publication_releases AS releases
                SET release_number = ranked.release_number
                FROM ranked
                WHERE releases.publication_release_id = ranked.publication_release_id
                """
            )
        )
        op.alter_column(
            "publication_releases",
            "release_number",
            existing_type=sa.Integer(),
            nullable=False,
            server_default=sa.text("0"),
        )
    if "supersedes_release_id" not in columns:
        op.add_column(
            "publication_releases",
            sa.Column(
                "supersedes_release_id",
                postgresql.UUID(as_uuid=True),
                sa.ForeignKey("publication_releases.publication_release_id", ondelete="RESTRICT"),
                nullable=True,
            ),
        )
    if not has_constraint("release_number_nonnegative"):
        op.create_check_constraint(
            "release_number_nonnegative", "publication_releases", "release_number >= 0"
        )
    if not has_constraint("uq_publication_release_number"):
        op.create_unique_constraint(
            "uq_publication_release_number",
            "publication_releases",
            ["content_package_id", "release_number"],
        )
    if not has_constraint("uq_publication_release_version"):
        op.create_unique_constraint(
            "uq_publication_release_version", "publication_releases", ["content_version_id"]
        )
    old_status = next(
        (name for name in constraints if name == "status" or name.endswith("_status")),
        None,
    )
    if old_status is not None and not has_constraint("publication_release_status"):
        op.drop_constraint("status", "publication_releases", type_="check")
    if not has_constraint("publication_release_status"):
        op.create_check_constraint(
            "publication_release_status",
            "publication_releases",
            "status IN ('pending', 'released', 'withdrawn', 'superseded', 'deprecated', 'retired')",
        )

    op.create_table(
        "publication_commands",
        sa.Column("publication_command_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("request_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=32), server_default=sa.text("'COMPLETED'"), nullable=False),
        sa.Column("publication_release_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("response_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["publication_release_id"],
            ["publication_releases.publication_release_id"],
            ondelete="RESTRICT",
        ),
        sa.UniqueConstraint("idempotency_key", name="uq_publication_commands_idempotency_key"),
        sa.CheckConstraint("status IN ('COMPLETED', 'REJECTED')", name="status"),
        sa.CheckConstraint("char_length(btrim(idempotency_key)) > 0", name="idempotency_key_nonempty"),
        sa.CheckConstraint("request_fingerprint ~ '^[0-9a-f]{64}$'", name="request_fingerprint_hex"),
    )
    op.create_index(
        "ix_publication_commands_release", "publication_commands", ["publication_release_id"]
    )

    op.create_table(
        "publication_audit_records",
        sa.Column("publication_audit_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("publication_release_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("actor_id", sa.String(length=255), nullable=False),
        sa.Column("action", sa.String(length=64), nullable=False),
        sa.Column("gate_snapshot", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["publication_release_id"],
            ["publication_releases.publication_release_id"],
            ondelete="RESTRICT",
        ),
        sa.CheckConstraint("char_length(btrim(actor_id)) > 0", name="actor_id_nonempty"),
    )
    op.create_index(
        "ix_publication_audit_release", "publication_audit_records", ["publication_release_id"]
    )

    op.create_table(
        "delivery_manifests",
        sa.Column("delivery_manifest_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("publication_release_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("publication_manifest_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content_package_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("content_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("ordered_content_block_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("source_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("citation_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("asset_version_ids", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("release_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["publication_release_id"], ["publication_releases.publication_release_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["publication_manifest_id"], ["publication_manifests.publication_manifest_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["content_package_id"], ["content_packages.content_package_id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["content_version_id"], ["content_versions.content_version_id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("publication_release_id", name="uq_delivery_manifests_release"),
        sa.CheckConstraint("release_fingerprint ~ '^[0-9a-f]{64}$'", name="release_fingerprint_hex"),
    )
    op.create_index("ix_delivery_manifests_version", "delivery_manifests", ["content_version_id"])


def downgrade() -> None:
    op.drop_index("ix_delivery_manifests_version", table_name="delivery_manifests")
    op.drop_table("delivery_manifests")
    op.drop_index("ix_publication_audit_release", table_name="publication_audit_records")
    op.drop_table("publication_audit_records")
    op.drop_index("ix_publication_commands_release", table_name="publication_commands")
    op.drop_table("publication_commands")
    op.drop_constraint("uq_publication_release_version", "publication_releases", type_="unique")
    op.drop_constraint("uq_publication_release_number", "publication_releases", type_="unique")
    inspector = sa.inspect(op.get_bind())
    checks = {
        item["name"]
        for item in inspector.get_check_constraints("publication_releases")
        if item.get("name")
    }
    def has_check(name: str) -> bool:
        return any(item == name or item.endswith(f"_{name}") for item in checks)

    if has_check("release_number_nonnegative"):
        op.drop_constraint("release_number_nonnegative", "publication_releases", type_="check")
    if has_check("publication_release_status"):
        op.drop_constraint("publication_release_status", "publication_releases", type_="check")
    if not has_check("status"):
        op.create_check_constraint(
            "status",
            "publication_releases",
            "status IN ('pending', 'released', 'withdrawn')",
        )
    op.drop_column("publication_releases", "supersedes_release_id")
    op.drop_column("publication_releases", "release_number")
