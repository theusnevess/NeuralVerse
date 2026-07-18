"""Opt-in BIP-M5 infrastructure certification tests.

These tests intentionally skip without explicit PostgreSQL16/pgvector and
S3-compatible endpoints; skipped means unexecuted, never certified.
"""

from __future__ import annotations

import os

import pytest

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
    assert _require_database()
    pytest.fail("Infrastructure certification harness must be run explicitly")


def test_s3_storage_certification_requires_real_service() -> None:
    assert _require_s3()
    pytest.fail("Infrastructure certification harness must be run explicitly")


def test_hybrid_retrieval_certification_requires_real_service() -> None:
    assert _require_database()
    pytest.fail("Infrastructure certification harness must be run explicitly")
