from __future__ import annotations

import os
from collections.abc import Generator
from datetime import UTC, datetime
from decimal import Decimal
from typing import cast

import pytest
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session

from neuralverse_backend.fixtures import PreparedFixturePayload, prepare_fixture_payload
from neuralverse_backend.persistence.repositories import FixtureRecordRepository

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


def prepared(raw_payload: bytes) -> PreparedFixturePayload:
    return prepare_fixture_payload(
        raw_payload=raw_payload,
        schema_name="neuralverse.backend.fixture-envelope",
        schema_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="b42-test",
        payload_media_type="application/json",
        received_at=datetime.now(UTC),
    )


def test_valid_and_rejected_fixture_round_trips_without_other_writes(
    postgres_engine: Engine,
) -> None:
    repository = FixtureRecordRepository()
    valid = prepared(b'{"nested":{"unknown":true},"items":[2,1],"missing":null,"number":1.2300}')
    rejected = prepared(b'{"duplicate":1,"duplicate":2}')
    valid_record = valid.to_fixture_record()
    rejected_record = rejected.to_fixture_record()
    with postgres_engine.connect() as session:
        before_counts = session.execute(
            text(
                "SELECT (SELECT count(*) FROM idempotency_records), "
                "(SELECT count(*) FROM operational_audit_events)"
            )
        ).one()

    with Session(postgres_engine) as session:
        repository.add(session, valid_record)
        repository.add(session, rejected_record)
        session.commit()

    with Session(postgres_engine) as session:
        stored_valid = repository.get_by_id(session, valid_record.fixture_record_id)
        stored_rejected = repository.get_by_id(session, rejected_record.fixture_record_id)
        assert stored_valid is not None
        assert stored_rejected is not None
        assert stored_valid.raw_payload == valid_record.raw_payload
        assert stored_valid.raw_payload_sha256 == valid_record.raw_payload_sha256
        assert stored_valid.structural_payload == valid_record.structural_payload
        assert stored_valid.structural_payload_sha256 == valid_record.structural_payload_sha256
        assert stored_valid.validation_findings == valid_record.validation_findings
        assert stored_valid.fixture_schema_name == valid_record.fixture_schema_name
        assert stored_valid.fixture_classification == "TEST_FIXTURE"
        structural = cast(dict[str, object], stored_valid.structural_payload)
        assert structural["items"] == [2, 1]
        assert "unknown" in cast(dict[str, object], structural["nested"])
        assert "missing" in structural
        assert structural["number"] == Decimal("1.23")
        assert stored_rejected.raw_payload == rejected_record.raw_payload
        assert stored_rejected.raw_payload_sha256 == rejected_record.raw_payload_sha256
        assert stored_rejected.structural_payload is None
        assert stored_rejected.structural_payload_sha256 is None
        assert stored_rejected.validation_status == "STRUCTURALLY_REJECTED"
        counts = session.execute(
            text(
                "SELECT (SELECT count(*) FROM idempotency_records), "
                "(SELECT count(*) FROM operational_audit_events)"
            )
        ).one()
        assert counts == before_counts


def test_caller_rollback_removes_fixture(postgres_engine: Engine) -> None:
    repository = FixtureRecordRepository()
    record = prepared(b"{}").to_fixture_record()
    with Session(postgres_engine) as session:
        repository.add(session, record)
        session.rollback()

    with Session(postgres_engine) as session:
        assert repository.get_by_id(session, record.fixture_record_id) is None
