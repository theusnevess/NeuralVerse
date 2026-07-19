from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient
from pydantic import SecretStr

from neuralverse_backend.configuration.settings import Environment, LogFormat, Settings
from neuralverse_backend.main import create_app
from neuralverse_backend.persistence.runtime import create_persistence_runtime
from neuralverse_backend.reference_package import REFERENCE_RELEASE_ID

pytestmark = [pytest.mark.integration, pytest.mark.postgres]
SUPPORTED_ACCEPT = "application/vnd.neuralverse.published-learning-package+json;version=1"


def _database_url() -> str:
    value = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not value:
        pytest.skip("NEURALVERSE_TEST_DATABASE_URL is required for BIP-M6 delivery validation")
    return value


def test_bip_m6_canonical_release_delivery_round_trip() -> None:
    url = _database_url()
    settings = Settings(
        environment=Environment.TEST,
        log_format=LogFormat.JSON,
        database_enabled=True,
        database_url=SecretStr(url),
    )
    runtime = create_persistence_runtime(settings)
    app = create_app(settings, runtime)
    path = f"/api/v1/publication/releases/{REFERENCE_RELEASE_ID}"
    try:
        with TestClient(app) as client:
            response = client.get(
                path,
                headers={
                    "Accept": SUPPORTED_ACCEPT,
                    "Accept-Encoding": "identity",
                    "X-Request-ID": "bip-m6-integration-1",
                },
            )
            assert response.status_code == 200
            assert response.headers["Cache-Control"] == "public, max-age=31536000, immutable"
            assert response.headers["Vary"] == "Accept, Accept-Encoding"
            assert response.headers["X-Request-ID"] == "bip-m6-integration-1"
            payload = response.json()
            assert payload["contract_name"] == "PublishedLearningPackage"
            assert payload["release_id"] == str(REFERENCE_RELEASE_ID)
            assert payload["publication_release_id"] == str(REFERENCE_RELEASE_ID)
            assert payload["blocks"]
            assert payload["sources"]
            assert payload["citations"]

            not_modified = client.get(
                path,
                headers={"If-None-Match": response.headers["ETag"], "Accept-Encoding": "identity"},
            )
            assert not_modified.status_code == 304
            assert not_modified.content == b""

            compressed = client.get(path, headers={"Accept-Encoding": "gzip"})
            assert compressed.status_code == 200
            assert compressed.headers["Content-Encoding"] == "gzip"
            assert compressed.headers["Vary"] == "Accept, Accept-Encoding"

            unsupported = client.get(
                path,
                headers={
                    "Accept": (
                        "application/vnd.neuralverse.published-learning-package+json;version=9"
                    )
                },
            )
            assert unsupported.status_code == 406
            assert unsupported.json()["code"] == "SCHEMA_VERSION_UNSUPPORTED"

            missing = client.get(
                "/api/v1/publication/releases/00000000-0000-0000-0000-000000000000"
            )
            assert missing.status_code == 404
            assert missing.json()["code"] == "PUBLICATION_RELEASE_NOT_FOUND"
    finally:
        runtime.dispose()
