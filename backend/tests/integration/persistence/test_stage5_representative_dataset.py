from __future__ import annotations

import os
import uuid
from collections.abc import Generator
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import Engine, create_engine, text

# SQL fixture statements are intentionally kept close to their table shape.
# ruff: noqa: E501
pytestmark = [pytest.mark.integration, pytest.mark.postgres]


@pytest.fixture(scope="module")
def postgres_engine() -> Generator[Engine, None, None]:
    url = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not url:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for PostgreSQL integration")
    engine = create_engine(url, hide_parameters=True, pool_pre_ping=True)
    try:
        yield engine
    finally:
        engine.dispose()


def test_representative_dataset_covers_every_stage5_context(postgres_engine: Engine) -> None:
    now = datetime.now(UTC)
    ids = {name: uuid.uuid4() for name in (
        "package", "version", "block", "block2", "node", "node2", "edge", "source",
        "citation", "link", "asset", "asset_version", "visualization", "job", "run",
        "contribution", "validation", "review", "directive", "release", "manifest",
        "learner", "note", "bookmark", "collection", "highlight", "session", "lab",
        "lab_run", "lab_evidence", "assessment", "attempt", "assessment_evidence",
        "sync", "audit", "outbox", "idempotency",
    )}
    with postgres_engine.begin() as connection:
        def execute(statement: str, **values: object) -> None:
            connection.execute(text(statement), values)

        execute(
            "INSERT INTO content_packages VALUES (:package, 'active', 0, :now, :now)",
            package=ids["package"], now=now,
        )
        execute(
            "INSERT INTO content_versions "
            "(content_version_id, content_package_id, revision, lifecycle_state, created_at, published_at) "
            "VALUES (:version, :package, 0, 'draft', :now, NULL)",
            version=ids["version"], package=ids["package"], now=now,
        )
        for block in ("block", "block2"):
            execute(
                "INSERT INTO content_blocks "
                "(content_block_id, content_version_id, block_type, position, payload, created_at) "
                "VALUES (:id, :version, 'text', :position, 'representative', :now)",
                id=ids[block], version=ids["version"], position=0 if block == "block" else 1, now=now,
            )
        execute(
            "INSERT INTO content_block_relationships "
            "(relationship_id, source_block_id, target_block_id, relationship_type, created_at) "
            "VALUES (:id, :source, :target, 'supports', :now)",
            id=uuid.uuid4(), source=ids["block"], target=ids["block2"], now=now,
        )
        execute(
            "UPDATE content_versions SET lifecycle_state = 'published', published_at = :now "
            "WHERE content_version_id = :version",
            version=ids["version"], now=now,
        )
        execute(
            "INSERT INTO curriculum_nodes "
            "(curriculum_node_id, node_type, display_title, description, created_at, updated_at) "
            "VALUES (:id, 'topic', 'Representative', '', :now, :now)",
            id=ids["node"], now=now,
        )
        execute(
            "INSERT INTO curriculum_nodes "
            "(curriculum_node_id, node_type, display_title, description, created_at, updated_at) "
            "VALUES (:id, 'lesson', 'Representative lesson', '', :now, :now)",
            id=ids["node2"], now=now,
        )
        execute(
            "INSERT INTO curriculum_edges "
            "(curriculum_edge_id, source_node_id, target_node_id, edge_type, required_depth, created_at) "
            "VALUES (:id, :source, :target, 'precedes', 0, :now)",
            id=ids["edge"], source=ids["node"], target=ids["node2"], now=now,
        )
        execute(
            "INSERT INTO sources (source_id, source_type, title, created_at) "
            "VALUES (:id, 'book', 'Representative source', :now)", id=ids["source"], now=now,
        )
        execute(
            "INSERT INTO citations "
            "(citation_id, source_id, target_content_id, purpose, created_at) "
            "VALUES (:id, :source, :target, 'evidence', :now)",
            id=ids["citation"], source=ids["source"], target=str(ids["block"]), now=now,
        )
        execute(
            "INSERT INTO source_claim_links "
            "(link_id, source_id, citation_id, claim_target, evidence_role, created_at) "
            "VALUES (:id, :source, :citation, :target, 'primary', :now)",
            id=ids["link"], source=ids["source"], citation=ids["citation"],
            target=str(ids["block"]), now=now,
        )
        execute(
            "INSERT INTO assets (asset_id, asset_type, display_name, created_at) "
            "VALUES (:id, 'image', 'Representative asset', :now)", id=ids["asset"], now=now,
        )
        execute(
            "INSERT INTO asset_versions "
            "(asset_version_id, asset_id, media_type, content_hash, lifecycle, created_at) "
            "VALUES (:id, :asset, 'image/png', :hash, 'draft', :now)",
            id=ids["asset_version"], asset=ids["asset"], hash="a" * 64, now=now,
        )
        execute(
            "INSERT INTO visualization_specs "
            "(visualization_spec_id, visualization_type, requirements, created_at) "
            "VALUES (:id, 'diagram', '{}'::jsonb, :now)", id=ids["visualization"], now=now,
        )
        execute(
            "INSERT INTO generation_jobs "
            "(generation_job_id, target_content_package_id, status, revision, requested_operation, "
            "lock_version, created_at, updated_at) VALUES (:id, :package, 'created', 0, 'generate', 0, :now, :now)",
            id=ids["job"], package=ids["package"], now=now,
        )
        execute(
            "INSERT INTO agent_runs "
            "(agent_run_id, generation_job_id, agent_identity, status, created_at) "
            "VALUES (:id, :job, 'representative-agent', 'created', :now)", id=ids["run"], job=ids["job"], now=now,
        )
        execute(
            "INSERT INTO agent_contributions "
            "(agent_contribution_id, generation_job_id, agent_run_id, content_package_id, status, created_at) "
            "VALUES (:id, :job, :run, :package, 'proposed', :now)",
            id=ids["contribution"], job=ids["job"], run=ids["run"], package=ids["package"], now=now,
        )
        execute(
            "INSERT INTO domain_validation_results "
            "(validation_result_id, generation_job_id, agent_contribution_id, validator_id, result, severity, created_at) "
            "VALUES (:id, :job, :contribution, 'representative-validator', 'valid', 'info', :now)",
            id=ids["validation"], job=ids["job"], contribution=ids["contribution"], now=now,
        )
        execute(
            "INSERT INTO governance_reviews "
            "(governance_review_id, target_version_id, review_authority, decision, created_at) "
            "VALUES (:id, :version, 'representative-authority', 'approved', :now)",
            id=ids["review"], version=ids["version"], now=now,
        )
        execute(
            "INSERT INTO revision_directives "
            "(revision_directive_id, governance_review_id, source_content_version_id, "
            "target_content_package_id, reason, status, created_at) "
            "VALUES (:id, :review, :version, :package, 'representative', 'pending', :now)",
            id=ids["directive"], review=ids["review"], version=ids["version"], package=ids["package"], now=now,
        )
        execute(
            "INSERT INTO publication_releases "
            "(publication_release_id, content_package_id, content_version_id, status, created_at, released_at) "
            "VALUES (:id, :package, :version, 'released', :now, :now)",
            id=ids["release"], package=ids["package"], version=ids["version"], now=now,
        )
        execute(
            "INSERT INTO publication_release_governance_reviews VALUES (:release, :review, 0)",
            release=ids["release"], review=ids["review"],
        )
        execute(
            "INSERT INTO publication_manifests "
            "(publication_manifest_id, release_id, version_id, created_at) VALUES (:id, :release, :version, :now)",
            id=ids["manifest"], release=ids["release"], version=ids["version"], now=now,
        )
        execute("INSERT INTO publication_manifest_blocks VALUES (:manifest, :block, 0)", manifest=ids["manifest"], block=ids["block"])
        execute("INSERT INTO publication_manifest_asset_versions VALUES (:manifest, :asset, 0)", manifest=ids["manifest"], asset=ids["asset_version"])
        execute("INSERT INTO publication_manifest_sources VALUES (:manifest, :source, 0)", manifest=ids["manifest"], source=ids["source"])
        execute("INSERT INTO publication_manifest_citations VALUES (:manifest, :citation, 0)", manifest=ids["manifest"], citation=ids["citation"])
        execute(
            "INSERT INTO learner_profiles (learner_id, display_name, created_at, updated_at) VALUES (:id, 'Representative learner', :now, :now)",
            id=ids["learner"], now=now,
        )
        execute("INSERT INTO learner_progress VALUES (:learner, :version, 50, :now)", learner=ids["learner"], version=ids["version"], now=now)
        execute("INSERT INTO learner_notes (note_id, learner_id, version_id, text, created_at) VALUES (:id, :learner, :version, 'note', :now)", id=ids["note"], learner=ids["learner"], version=ids["version"], now=now)
        execute("INSERT INTO learner_bookmarks (bookmark_id, learner_id, version_id, label, created_at) VALUES (:id, :learner, :version, 'bookmark', :now)", id=ids["bookmark"], learner=ids["learner"], version=ids["version"], now=now)
        execute("INSERT INTO learner_collections (collection_id, learner_id, name, created_at, updated_at) VALUES (:id, :learner, 'collection', :now, :now)", id=ids["collection"], learner=ids["learner"], now=now)
        execute("INSERT INTO learner_collection_versions VALUES (:collection, :version, 0)", collection=ids["collection"], version=ids["version"])
        execute("INSERT INTO learner_highlights (highlight_id, learner_id, version_id, selected_text, note, created_at) VALUES (:id, :learner, :version, 'text', 'note', :now)", id=ids["highlight"], learner=ids["learner"], version=ids["version"], now=now)
        execute("INSERT INTO learner_sessions (session_id, learner_id, version_id, created_at) VALUES (:id, :learner, :version, :now)", id=ids["session"], learner=ids["learner"], version=ids["version"], now=now)
        execute("INSERT INTO laboratory_specs (laboratory_spec_id, version, title, created_at) VALUES (:id, '1.0.0', 'Lab', :now)", id=ids["lab"], now=now)
        execute("INSERT INTO laboratory_runs (laboratory_run_id, laboratory_spec_id, laboratory_spec_version, status, created_at) VALUES (:id, :spec, '1.0.0', 'completed', :now)", id=ids["lab_run"], spec=ids["lab"], now=now)
        execute("INSERT INTO laboratory_evidence (laboratory_evidence_id, laboratory_run_id, evidence_type, created_at) VALUES (:id, :run, 'output', :now)", id=ids["lab_evidence"], run=ids["lab_run"], now=now)
        execute("INSERT INTO assessment_specs (assessment_spec_id, version, title, created_at) VALUES (:id, '1.0.0', 'Assessment', :now)", id=ids["assessment"], now=now)
        execute("INSERT INTO assessment_attempts (assessment_attempt_id, assessment_spec_id, assessment_spec_version, status, created_at) VALUES (:id, :spec, '1.0.0', 'submitted', :now)", id=ids["attempt"], spec=ids["assessment"], now=now)
        execute("INSERT INTO assessment_evidence (assessment_evidence_id, assessment_attempt_id, evidence_type, created_at) VALUES (:id, :attempt, 'response', :now)", id=ids["assessment_evidence"], attempt=ids["attempt"], now=now)
        execute("INSERT INTO synchronization_records (synchronization_record_id, source_system, target_system, domain_object_id, domain_object_version, direction, status, attempt_count, created_at, updated_at) VALUES (:id, 'source', 'target', :object, '1.0.0', 'push', 'completed', 1, :now, :now)", id=ids["sync"], object=str(ids["version"]), now=now)
        execute("INSERT INTO domain_audit_events (domain_audit_event_id, actor_identity, aggregate_type, aggregate_id, operation, occurred_at, recorded_at) VALUES (:id, 'certifier', 'ContentVersion', :aggregate, 'representative', :now, :now)", id=ids["audit"], aggregate=str(ids["version"]), now=now)
        execute("INSERT INTO transactional_outbox_events (event_id, event_type, aggregate_type, aggregate_id, payload, status, attempt_count, available_at, created_at) VALUES (:id, 'representative.created', 'ContentVersion', :aggregate, '{}'::jsonb, 'PENDING', 0, :now, :now)", id=ids["outbox"], aggregate=str(ids["version"]), now=now)
        execute("INSERT INTO idempotency_records (idempotency_record_id, scope, idempotency_key_hash, key_hash_key_version, request_fingerprint, operation_name, status, created_at, locked_at, expires_at, attempt_count) VALUES (:id, 'representative', :key_hash, 'v1', :request_hash, 'representative', 'IN_PROGRESS', :now, :now, :expires, 1)", id=ids["idempotency"], key_hash=uuid.uuid4().bytes + uuid.uuid4().bytes, request_hash="a" * 64, now=now, expires=now + timedelta(days=1))

    with postgres_engine.connect() as connection:
        required = (
            "curriculum_nodes", "curriculum_edges", "content_packages", "content_versions",
            "content_blocks", "content_block_relationships", "sources", "citations",
            "source_claim_links", "assets", "asset_versions", "visualization_specs",
            "generation_jobs", "agent_runs", "agent_contributions", "domain_validation_results",
            "governance_reviews", "revision_directives", "publication_releases", "publication_manifests",
            "learner_profiles", "learner_progress", "learner_notes", "learner_bookmarks",
            "learner_collections", "learner_highlights", "learner_sessions", "laboratory_specs",
            "laboratory_runs", "laboratory_evidence", "assessment_specs", "assessment_attempts",
            "assessment_evidence", "synchronization_records", "transactional_outbox_events",
            "idempotency_records", "domain_audit_events",
        )
        counts = {
            table: connection.execute(text(f"SELECT count(*) FROM {table}")).scalar_one()
            for table in required
        }
    assert all(counts.values()), counts
