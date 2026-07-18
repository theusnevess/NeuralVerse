"""Protect published exact-version reference rows from direct SQL mutation."""

from collections.abc import Sequence

from alembic import op

revision: str = "b49000000001"
down_revision: str | Sequence[str] | None = "b48000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return
    op.execute(
        """
        CREATE OR REPLACE FUNCTION reject_published_reference_mutation()
        RETURNS trigger LANGUAGE plpgsql AS $$
        DECLARE version_state text;
        DECLARE manifest_state text;
        DECLARE reference_id uuid;
        BEGIN
            IF TG_TABLE_NAME IN (
                'content_version_sources',
                'content_version_citations',
                'content_version_asset_versions'
            ) THEN
                IF TG_OP = 'INSERT' THEN
                    reference_id := NEW.content_version_id;
                ELSE
                    reference_id := OLD.content_version_id;
                END IF;
                SELECT lifecycle_state INTO version_state
                FROM content_versions
                WHERE content_version_id = reference_id;
                IF version_state = 'published' THEN
                    RAISE EXCEPTION 'PUBLISHED_CONTENT_VERSION_IMMUTABLE'
                        USING ERRCODE = 'check_violation';
                END IF;
            ELSE
                IF TG_OP = 'INSERT' THEN
                    reference_id := NEW.manifest_id;
                ELSE
                    reference_id := OLD.manifest_id;
                END IF;
                SELECT pr.status INTO manifest_state
                FROM publication_manifests pm
                JOIN publication_releases pr ON pr.publication_release_id = pm.release_id
                WHERE pm.publication_manifest_id = reference_id;
                IF manifest_state = 'released' AND TG_OP <> 'INSERT' THEN
                    RAISE EXCEPTION 'PUBLISHED_CONTENT_VERSION_IMMUTABLE'
                        USING ERRCODE = 'check_violation';
                END IF;
            END IF;
            RETURN COALESCE(NEW, OLD);
        END
        $$;
        """
    )
    for table in (
        "content_version_sources",
        "content_version_citations",
        "content_version_asset_versions",
    ):
        op.execute(
            f"CREATE TRIGGER {table}_published_immutable "
            f"BEFORE INSERT OR UPDATE OR DELETE ON {table} "
            "FOR EACH ROW EXECUTE FUNCTION reject_published_reference_mutation()"
        )
    for table in (
        "publication_manifest_blocks",
        "publication_manifest_asset_versions",
        "publication_manifest_laboratory_specs",
        "publication_manifest_assessment_specs",
        "publication_manifest_sources",
        "publication_manifest_citations",
    ):
        op.execute(
            f"CREATE TRIGGER {table}_released_immutable "
            f"BEFORE UPDATE OR DELETE ON {table} "
            "FOR EACH ROW EXECUTE FUNCTION reject_published_reference_mutation()"
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != "postgresql":
        return
    for table in (
        "publication_manifest_citations",
        "publication_manifest_sources",
        "publication_manifest_assessment_specs",
        "publication_manifest_laboratory_specs",
        "publication_manifest_asset_versions",
        "publication_manifest_blocks",
        "content_version_asset_versions",
        "content_version_citations",
        "content_version_sources",
    ):
        op.execute(f"DROP TRIGGER IF EXISTS {table}_published_immutable ON {table}")
        op.execute(f"DROP TRIGGER IF EXISTS {table}_released_immutable ON {table}")
    op.execute("DROP FUNCTION IF EXISTS reject_published_reference_mutation()")
