"""Create the BIP-M2 canonical domain persistence baseline.

The preceding operational and intake revisions own their tables.  This
revision creates only the Stage 5 domain tables and leaves fixture tables
non-canonical by design.
"""

from collections.abc import Sequence

from alembic import op

from neuralverse_backend.persistence.metadata import metadata

revision: str = "b44000000001"
down_revision: str | Sequence[str] | None = "b43000000001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

_OWNED_TABLES = {
    "content_packages",
    "content_versions",
    "content_blocks",
    "content_block_relationships",
    "content_version_sources",
    "content_version_citations",
    "content_version_asset_versions",
    "curriculum_nodes",
    "curriculum_edges",
    "sources",
    "citations",
    "source_claim_links",
    "assets",
    "asset_versions",
    "visualization_specs",
    "generation_jobs",
    "agent_runs",
    "agent_contributions",
    "domain_validation_results",
    "governance_reviews",
    "revision_directives",
    "publication_releases",
    "publication_manifests",
    "learner_profiles",
    "learner_progress",
    "learner_notes",
    "learner_bookmarks",
    "learner_collections",
    "learner_highlights",
    "learner_sessions",
    "laboratory_specs",
    "laboratory_runs",
    "laboratory_evidence",
    "assessment_specs",
    "assessment_attempts",
    "assessment_evidence",
    "synchronization_records",
    "domain_audit_events",
    "publication_manifest_blocks",
    "publication_manifest_asset_versions",
    "publication_manifest_laboratory_specs",
    "publication_manifest_assessment_specs",
    "publication_manifest_sources",
    "publication_manifest_citations",
    "learner_collection_versions",
    "publication_release_governance_reviews",
}


def upgrade() -> None:
    bind = op.get_bind()
    for table in metadata.sorted_tables:
        if table.name in _OWNED_TABLES:
            table.create(bind=bind, checkfirst=True)

    if bind.dialect.name == "postgresql":
        op.execute(
            """
            CREATE OR REPLACE FUNCTION reject_published_content_version_mutation()
            RETURNS trigger LANGUAGE plpgsql AS $$
            BEGIN
                IF OLD.lifecycle_state = 'published' AND (
                    NEW.content_package_id IS DISTINCT FROM OLD.content_package_id OR
                    NEW.revision IS DISTINCT FROM OLD.revision OR
                    NEW.lifecycle_state IS DISTINCT FROM OLD.lifecycle_state OR
                    NEW.structural_semantic_payload IS DISTINCT FROM
                        OLD.structural_semantic_payload OR
                    NEW.opaque_metadata IS DISTINCT FROM OLD.opaque_metadata
                ) THEN
                    RAISE EXCEPTION 'PUBLISHED_CONTENT_VERSION_IMMUTABLE'
                        USING ERRCODE = 'check_violation';
                END IF;
                RETURN NEW;
            END
            $$;
            """
        )
        op.execute(
            """
            CREATE OR REPLACE FUNCTION reject_published_content_child_mutation()
            RETURNS trigger LANGUAGE plpgsql AS $$
            DECLARE version_state text;
            BEGIN
                IF TG_TABLE_NAME = 'content_block_relationships' THEN
                    SELECT cv.lifecycle_state INTO version_state
                    FROM content_versions cv
                    JOIN content_blocks cb ON cb.content_version_id = cv.content_version_id
                    WHERE cb.content_block_id = COALESCE(OLD.source_block_id, NEW.source_block_id);
                ELSE
                    SELECT lifecycle_state INTO version_state
                    FROM content_versions
                    WHERE content_version_id = COALESCE(
                        OLD.content_version_id, NEW.content_version_id
                    );
                END IF;
                IF version_state = 'published' THEN
                    RAISE EXCEPTION 'PUBLISHED_CONTENT_VERSION_IMMUTABLE'
                        USING ERRCODE = 'check_violation';
                END IF;
                RETURN COALESCE(NEW, OLD);
            END
            $$;
            """
        )
        op.execute(
            """
            CREATE TRIGGER content_versions_immutable
            BEFORE UPDATE ON content_versions
            FOR EACH ROW EXECUTE FUNCTION reject_published_content_version_mutation();
            """
        )
        op.execute(
            """
            CREATE TRIGGER content_blocks_published_immutable
            BEFORE INSERT OR UPDATE OR DELETE ON content_blocks
            FOR EACH ROW EXECUTE FUNCTION reject_published_content_child_mutation();
            """
        )
        op.execute(
            """
            CREATE TRIGGER content_block_relationships_published_immutable
            BEFORE INSERT OR UPDATE OR DELETE ON content_block_relationships
            FOR EACH ROW EXECUTE FUNCTION reject_published_content_child_mutation();
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute(
            "DROP TRIGGER IF EXISTS content_block_relationships_published_immutable "
            "ON content_block_relationships"
        )
        op.execute("DROP TRIGGER IF EXISTS content_blocks_published_immutable ON content_blocks")
        op.execute("DROP TRIGGER IF EXISTS content_versions_immutable ON content_versions")
        op.execute("DROP FUNCTION IF EXISTS reject_published_content_child_mutation()")
        op.execute("DROP FUNCTION IF EXISTS reject_published_content_version_mutation()")
    for table in reversed(metadata.sorted_tables):
        if table.name in _OWNED_TABLES:
            table.drop(bind=bind, checkfirst=True)
