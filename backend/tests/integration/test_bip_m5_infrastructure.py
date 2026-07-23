"""BIP-M5 infrastructure certification tests against disposable services."""

from __future__ import annotations

import os

import pytest
from sqlalchemy import create_engine, text

pytestmark = pytest.mark.integration


def _require_database() -> str:
    value = os.getenv("NEURALVERSE_TEST_DATABASE_URL")
    if not value:
        pytest.skip("BIP-M5 PostgreSQL16/pgvector endpoint not configured")
    return value


def _require_s3() -> str:
    value = os.getenv("NEURALVERSE_TEST_S3_ENDPOINT")
    if not value:
        pytest.skip("BIP-M5 S3-compatible endpoint not configured")
    return value


def test_postgres_fts_and_pgvector_certification_requires_real_service() -> None:
    engine = create_engine(_require_database(), hide_parameters=True)
    try:
        with engine.connect() as connection:
            extensions = set(
                connection.execute(text("SELECT extname FROM pg_extension")).scalars()
            )
            assert "vector" in extensions
            assert connection.execute(
                text(
                    "SELECT to_tsvector('english', 'singular value decomposition') "
                    "@@ plainto_tsquery('english', 'decomposition')"
                )
            ).scalar_one()
            assert connection.execute(
                text("SELECT '[1,2,3]'::vector <=> '[1,2,3]'::vector")
            ).scalar_one() == pytest.approx(0.0)
    finally:
        engine.dispose()


def test_s3_storage_certification_requires_real_service() -> None:
    endpoint = _require_s3().rstrip("/")
    import urllib.request

    with urllib.request.urlopen(f"{endpoint}/minio/health/live", timeout=5) as response:
        assert response.status == 200


def test_hybrid_retrieval_certification_requires_real_service() -> None:
    engine = create_engine(_require_database(), hide_parameters=True)
    try:
        with engine.connect() as connection:
            assert connection.execute(
                text("SELECT '[1,0]'::vector <=> '[1,0]'::vector")
            ).scalar_one() == pytest.approx(0.0)
            assert connection.execute(
                text(
                    "SELECT to_tsvector('english', 'neural compression') "
                    "@@ plainto_tsquery('english', 'compression')"
                )
            ).scalar_one()
    finally:
        engine.dispose()
