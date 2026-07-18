"""BIP-M5 immutable assets, governed readiness and PostgreSQL retrieval indexes."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from neuralverse_backend.persistence.pgvector import Vector

revision: str = "b53000000001"
down_revision: str | Sequence[str] | None = "b52000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_JSON = postgresql.JSONB(astext_type=sa.Text())


def upgrade() -> None:
    # The extension is additive and remains managed by the deployment owner.
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.create_table(
        "asset_version_integrity",
        sa.Column("asset_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("storage_key", sa.String(1024), nullable=False),
        sa.Column("byte_size", sa.Integer(), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False),
        sa.Column("media_type", sa.String(128), nullable=False),
        sa.Column(
            "availability", sa.String(32), server_default=sa.text("'uploading'"), nullable=False
        ),
        sa.Column("observed_etag", sa.String(256), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["asset_version_id"], ["asset_versions.asset_version_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("asset_version_id", name="pk_asset_version_integrity"),
        sa.UniqueConstraint("storage_key", name="uq_asset_integrity_storage_key"),
        sa.CheckConstraint("byte_size >= 0", name="asset_integrity_byte_size_nonnegative"),
        sa.CheckConstraint("char_length(content_hash) = 64", name="asset_integrity_hash_length"),
        sa.CheckConstraint(
            "availability IN ('uploading','available','missing','orphaned','quarantined','failed')",
            name="asset_integrity_availability",
        ),
    )
    op.create_table(
        "asset_readiness",
        sa.Column("asset_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("state", sa.String(32), server_default=sa.text("'pending'"), nullable=False),
        sa.Column("reasons", _JSON, server_default=sa.text("'[]'"), nullable=False),
        sa.Column(
            "license_status", sa.String(32), server_default=sa.text("'unknown'"), nullable=False
        ),
        sa.Column(
            "accessibility_status",
            sa.String(32),
            server_default=sa.text("'unknown'"),
            nullable=False,
        ),
        sa.Column(
            "scientific_review_status",
            sa.String(32),
            server_default=sa.text("'unknown'"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["asset_version_id"], ["asset_versions.asset_version_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("asset_version_id", name="pk_asset_readiness"),
        sa.CheckConstraint(
            "state IN ('pending','ready','blocked','rejected')", name="asset_readiness_state"
        ),
    )
    op.create_table(
        "search_resources",
        sa.Column("search_resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("resource_id", sa.String(255), nullable=False),
        sa.Column("resource_type", sa.String(64), nullable=False),
        sa.Column("resource_version", sa.String(128), nullable=False),
        sa.Column("source_hash", sa.String(64), nullable=False),
        sa.Column("lifecycle", sa.String(32), nullable=False),
        sa.Column("access_scope", sa.String(32), nullable=False),
        sa.Column("language", sa.String(32), server_default=sa.text("'und'"), nullable=False),
        sa.Column("title", sa.Text(), server_default=sa.text("''"), nullable=False),
        sa.Column("content", sa.Text(), server_default=sa.text("''"), nullable=False),
        sa.Column("alt_text", sa.Text(), server_default=sa.text("''"), nullable=False),
        sa.Column("package_id", sa.String(255), nullable=True),
        sa.Column("content_version_id", sa.String(255), nullable=True),
        sa.Column("release_id", sa.String(255), nullable=True),
        sa.Column("block_id", sa.String(255), nullable=True),
        sa.Column("source_id", sa.String(255), nullable=True),
        sa.Column("citation_id", sa.String(255), nullable=True),
        sa.Column("fragment_id", sa.String(255), server_default=sa.text("'root'"), nullable=False),
        sa.Column("fragment_position", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "search_schema_version",
            sa.String(64),
            server_default=sa.text("'search-resource:1.0.0'"),
            nullable=False,
        ),
        sa.Column("lexical_document", postgresql.TSVECTOR(), nullable=True),
        sa.Column("indexed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("search_resource_id", name="pk_search_resource"),
        sa.UniqueConstraint("resource_id", "resource_version", name="uq_search_resource_identity"),
    )
    op.create_table(
        "asset_readiness_acknowledgements",
        sa.Column("acknowledgement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("asset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("asset_version_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("result", sa.String(48), nullable=False),
        sa.Column("gate_snapshot", _JSON, nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("actor_authority", sa.String(128), nullable=False),
        sa.Column("command_id", sa.String(255), nullable=False),
        sa.Column("correlation_id", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["asset_version_id"], ["asset_versions.asset_version_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("acknowledgement_id", name="pk_asset_readiness_ack"),
        sa.CheckConstraint(
            "result IN ('READY','READY_WITH_NON_BLOCKING_WARNINGS','NOT_READY','UNKNOWN')",
            name="asset_readiness_ack_result",
        ),
    )
    op.create_index(
        "ix_asset_readiness_ack_version",
        "asset_readiness_acknowledgements",
        ["asset_version_id", "created_at"],
    )
    op.create_index(
        "ix_search_resource_lifecycle", "search_resources", ["lifecycle", "access_scope"]
    )
    op.create_index(
        "ix_search_resource_lexical",
        "search_resources",
        ["lexical_document"],
        postgresql_using="gin",
    )
    op.create_table(
        "search_embeddings",
        sa.Column("search_resource_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("model_id", sa.String(128), nullable=False),
        sa.Column("model_version", sa.String(128), nullable=False),
        sa.Column("dimensions", sa.Integer(), nullable=False),
        sa.Column("source_hash", sa.String(64), nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["search_resource_id"], ["search_resources.search_resource_id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("search_resource_id", name="pk_search_embedding"),
        sa.CheckConstraint("dimensions > 0", name="search_embedding_dimensions_positive"),
    )
    op.create_index(
        "ix_search_embeddings_model", "search_embeddings", ["model_id", "model_version"]
    )
    op.create_index(
        "ix_search_embeddings_hnsw",
        "search_embeddings",
        ["embedding"],
        postgresql_using="hnsw",
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )
    op.create_table(
        "search_index_runs",
        sa.Column("index_run_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("index_name", sa.String(128), nullable=False),
        sa.Column("status", sa.String(32), server_default=sa.text("'pending'"), nullable=False),
        sa.Column("source_watermark", sa.String(128), nullable=False),
        sa.Column("indexed_count", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("error_summary", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("index_run_id", name="pk_search_index_run"),
        sa.CheckConstraint(
            "status IN ('pending','running','completed','stale','failed')",
            name="search_index_run_status",
        ),
    )
    op.create_table(
        "search_index_freshness",
        sa.Column("index_name", sa.String(128), nullable=False),
        sa.Column("source_watermark", sa.String(128), nullable=False),
        sa.Column("index_watermark", sa.String(128), nullable=True),
        sa.Column("is_stale", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("index_name", name="pk_search_index_freshness"),
    )


def downgrade() -> None:
    op.drop_table("search_index_freshness")
    op.drop_table("search_index_runs")
    op.drop_index("ix_search_embeddings_model", table_name="search_embeddings")
    op.drop_index("ix_search_embeddings_hnsw", table_name="search_embeddings")
    op.drop_table("search_embeddings")
    op.drop_index("ix_search_resource_lexical", table_name="search_resources")
    op.drop_index("ix_search_resource_lifecycle", table_name="search_resources")
    op.drop_table("search_resources")
    op.drop_index("ix_asset_readiness_ack_version", table_name="asset_readiness_acknowledgements")
    op.drop_table("asset_readiness_acknowledgements")
    op.drop_table("asset_readiness")
    op.drop_table("asset_version_integrity")
