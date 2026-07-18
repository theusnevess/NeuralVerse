from __future__ import annotations

import hashlib
import json
import os
from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import IntegrityError

from neuralverse_backend.canonical_input import readCanonicalInput
from neuralverse_backend.canonical_persistence import CanonicalPersistenceService
from neuralverse_backend.configuration.settings import Environment, LogFormat, Settings
from neuralverse_backend.main import create_app
from neuralverse_backend.persistence.runtime import create_persistence_runtime
from neuralverse_backend.persistence.sessions import create_session_factory
from neuralverse_backend.reference_package import (
    REFERENCE_CONTENT_VERSION_ID,
    REFERENCE_PACKAGE_ID,
    REFERENCE_RELEASE_ID,
    _domain_id,
    build_reference_release_plan,
    persist_reference_release,
)

pytestmark = [pytest.mark.integration, pytest.mark.postgres]

ARTIFACT_ROOT = Path(__file__).parents[3] / "reference-artifacts/stage7/svd-image-compression"
XFI_ROOT = Path(__file__).parents[3] / "vendor/neutral-contracts/nv-xfi-input-contracts-v1.0.0"


def _database_url() -> str:
    value = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not value:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for Stage 7 PostgreSQL validation")
    return value


@pytest.fixture(scope="module")
def postgres_engine() -> Generator[Engine, None, None]:
    engine = create_engine(_database_url(), hide_parameters=True, pool_pre_ping=True)
    yield engine
    engine.dispose()


def _artifact_paths() -> list[Path]:
    return [
        ARTIFACT_ROOT / "curriculum-contract.json",
        *sorted(ARTIFACT_ROOT.glob("agent-contribution-*.json")),
        ARTIFACT_ROOT / "learning-package-draft.json",
        ARTIFACT_ROOT / "publication-readiness.json",
    ]


def _persist_inputs(engine: Engine) -> tuple[dict[str, Any], dict[str, Any], int, bool]:
    factory = create_session_factory(engine)
    with engine.connect() as connection:
        initial_input_count = connection.execute(
            text("SELECT count(*) FROM canonical_input_records")
        ).scalar_one()
        already_released = connection.execute(
            text(
                "SELECT count(*) FROM publication_releases "
                "WHERE publication_release_id = :release_id"
            ),
            {"release_id": REFERENCE_RELEASE_ID},
        ).scalar_one() > 0
    if already_released:
        draft_path = ARTIFACT_ROOT / "learning-package-draft.json"
        readiness_path = ARTIFACT_ROOT / "publication-readiness.json"
        return (
            json.loads(draft_path.read_text(encoding="utf-8")),
            json.loads(readiness_path.read_text(encoding="utf-8")),
            int(initial_input_count),
            False,
        )
    job_id = None
    for path in _artifact_paths():
        raw = path.read_bytes()
        parsed = readCanonicalInput(raw, release_root=XFI_ROOT)
        assert parsed.accepted and parsed.intake is not None, (path.name, parsed.failure)
        result = CanonicalPersistenceService(factory).accept(
            parsed.intake,
            idempotency_key=f"stage7-integration-{path.name}",
            authoring_job_id=job_id,
        )
        assert result.accepted and result.response is not None, result.failure
        job_id = result.response.authoring_job_id

    draft_path = ARTIFACT_ROOT / "learning-package-draft.json"
    readiness_path = ARTIFACT_ROOT / "publication-readiness.json"
    draft = json.loads(draft_path.read_text(encoding="utf-8"))
    readiness = json.loads(readiness_path.read_text(encoding="utf-8"))
    plan = build_reference_release_plan(
        draft=draft,
        draft_bytes=draft_path.read_bytes(),
        readiness=readiness,
        readiness_bytes=readiness_path.read_bytes(),
        curriculum_node_id=str(_domain_id("curriculum-node:svd-image-compression")),
    )
    with factory() as session:
        persist_reference_release(session, plan=plan, draft=draft)
        session.commit()
    return draft, readiness, int(initial_input_count), True


def test_stage7_raw_intake_projection_and_immutability(postgres_engine: Engine) -> None:
    draft, readiness, initial_input_count, created = _persist_inputs(postgres_engine)
    with postgres_engine.connect() as connection:
        raw_rows = connection.execute(
            text("SELECT raw_json_bytes, raw_json_sha256 FROM canonical_input_records")
        ).all()
        assert len(raw_rows) == initial_input_count + (13 if created else 0)
        assert all(
            hashlib.sha256(bytes(row.raw_json_bytes)).hexdigest() == row.raw_json_sha256
            for row in raw_rows
        )
        counts = connection.execute(
            text(
                "SELECT "
                "(SELECT count(*) FROM content_blocks WHERE content_version_id = :version_id), "
                "(SELECT count(*) FROM content_version_sources "
                "WHERE content_version_id = :version_id), "
                "(SELECT count(*) FROM content_version_citations "
                "WHERE content_version_id = :version_id), "
                "(SELECT count(*) FROM content_version_asset_versions "
                "WHERE content_version_id = :version_id), "
                "(SELECT count(*) FROM governance_reviews WHERE target_version_id = :version_id), "
                "(SELECT count(*) FROM publication_manifests WHERE release_id = :release_id), "
                "(SELECT count(*) FROM publication_releases "
                "WHERE publication_release_id = :release_id), "
                "(SELECT count(*) FROM publication_manifest_blocks "
                "WHERE manifest_id = (SELECT publication_manifest_id FROM publication_manifests "
                "WHERE release_id = :release_id)), "
                "(SELECT count(*) FROM publication_manifest_sources "
                "WHERE manifest_id = (SELECT publication_manifest_id FROM publication_manifests "
                "WHERE release_id = :release_id)), "
                "(SELECT count(*) FROM publication_manifest_citations "
                "WHERE manifest_id = (SELECT publication_manifest_id FROM publication_manifests "
                "WHERE release_id = :release_id)), "
                "(SELECT count(*) FROM publication_release_governance_reviews "
                "WHERE release_id = :release_id), "
                "(SELECT count(*) FROM delivery_manifests "
                "WHERE publication_release_id = :release_id)"
            )
            , {
                "version_id": REFERENCE_CONTENT_VERSION_ID,
                "release_id": REFERENCE_RELEASE_ID,
            }
        ).one()
        assert tuple(counts) == (23, 6, 6, 6, 1, 1, 1, 23, 6, 6, 1, 1)

    with pytest.raises(IntegrityError):
        with postgres_engine.begin() as connection:
            connection.execute(
                text(
                    "UPDATE content_versions SET opaque_metadata = CAST(:value AS jsonb) "
                    "WHERE content_version_id = :id"
                ),
                {"value": json.dumps({"mutated": True}), "id": REFERENCE_CONTENT_VERSION_ID},
            )

    assert draft["title"]
    assert readiness["recommendation"] == "READY_FOR_PUBLICATION"


def test_stage7_all_delivery_endpoints_and_http_guarantees() -> None:
    url = _database_url()
    engine = create_engine(url, hide_parameters=True, pool_pre_ping=True)
    _persist_inputs(engine)
    engine.dispose()
    settings = Settings(
        environment=Environment.TEST,
        log_format=LogFormat.JSON,
        database_enabled=True,
        database_url=SecretStr(url),
    )
    runtime = create_persistence_runtime(settings)
    app = create_app(settings, runtime)
    node_id = str(_domain_id("curriculum-node:svd-image-compression"))
    laboratory_id = str(_domain_id("laboratory:svd-image-compression"))
    assessment_id = str(_domain_id("assessment:svd-reference"))
    paths = [
        f"/delivery/v1/curriculum/lessons/{node_id}",
        f"/delivery/v1/learning-packages/{REFERENCE_PACKAGE_ID}",
        f"/delivery/v1/learning-packages/{REFERENCE_PACKAGE_ID}/versions/{REFERENCE_CONTENT_VERSION_ID}",
        f"/delivery/v1/publication-releases/{REFERENCE_RELEASE_ID}",
        f"/delivery/v1/publication-releases/{REFERENCE_RELEASE_ID}/assets",
        f"/delivery/v1/publication-releases/{REFERENCE_RELEASE_ID}/laboratories/{laboratory_id}/versions/1.0.0",
        f"/delivery/v1/publication-releases/{REFERENCE_RELEASE_ID}/assessments/{assessment_id}/versions/1.0.0",
    ]
    try:
        with TestClient(app) as client:
            responses = [
                client.get(
                    path,
                    headers={
                        "Accept-Encoding": "identity",
                        "X-Request-ID": f"stage7-{index}",
                    },
                )
                for index, path in enumerate(paths)
            ]
            assert [response.status_code for response in responses] == [200] * 7
            assert all(
                response.headers["X-Request-ID"] == f"stage7-{index}"
                for index, response in enumerate(responses)
            )
            package_payload = responses[2].json()
            release_payload = responses[3].json()
            manifest_payload = release_payload["delivery_manifest"]
            assert package_payload["contract_name"] == "PublishedLearningPackage"
            assert package_payload["contract_version"] == "1.0.0"
            assert package_payload["content_version_id"] == REFERENCE_CONTENT_VERSION_ID
            assert release_payload["contract_name"] == "PublicationRelease"
            assert release_payload["publication_release_id"] == REFERENCE_RELEASE_ID
            assert manifest_payload["contract_name"] == "DeliveryManifest"
            assert manifest_payload["content_version_id"] == REFERENCE_CONTENT_VERSION_ID
            assert manifest_payload["publication_release_id"] == REFERENCE_RELEASE_ID
            first = client.get(paths[2], headers={"Accept-Encoding": "identity"})
            conditional = client.get(
                paths[2],
                headers={
                    "If-None-Match": first.headers["ETag"],
                    "Accept-Encoding": "identity",
                },
            )
            assert conditional.status_code == 304
            compressed = client.get(paths[2], headers={"Accept-Encoding": "gzip"})
            assert compressed.status_code == 200
            assert compressed.headers["Content-Encoding"] == "gzip"
            assert compressed.headers["Vary"] == "Accept-Encoding"
    finally:
        runtime.dispose()
