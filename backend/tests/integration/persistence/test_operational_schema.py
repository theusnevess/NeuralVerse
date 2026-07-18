from __future__ import annotations

import os
import uuid
from collections.abc import Generator
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import Engine, create_engine, insert, inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.dml import Insert

from neuralverse_backend.persistence import metadata

pytestmark = [pytest.mark.integration, pytest.mark.postgres, pytest.mark.migration]


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


def fixture_values(**overrides: object) -> dict[str, object]:
    values: dict[str, object] = {
        "fixture_record_id": uuid.uuid4(),
        "fixture_schema_name": "neuralverse.backend.fixture-envelope",
        "fixture_schema_version": "1.0.0",
        "minimum_reader_version": "1.0.0",
        "producer_version": "test",
        "fixture_classification": "TEST_FIXTURE",
        "canonicality": "NON_CANONICAL",
        "agent_generated": False,
        "shared_contract_status": "NOT_A_FINAL_SHARED_CONTRACT",
        "payload_media_type": "application/json",
        "raw_payload": b"{}",
        "raw_payload_sha256": "0" * 64,
        "structural_payload": {},
        "structural_payload_sha256": "1" * 64,
        "validation_status": "STRUCTURALLY_VALID",
        "validation_findings": [],
        "received_at": datetime.now(UTC),
    }
    values.update(overrides)
    return values


def idempotency_values(**overrides: object) -> dict[str, object]:
    now = datetime.now(UTC)
    values: dict[str, object] = {
        "idempotency_record_id": uuid.uuid4(),
        "scope": "fixture_ingest",
        "idempotency_key_hash": b"k" * 32,
        "key_hash_key_version": "v1",
        "request_fingerprint": "f" * 64,
        "operation_name": "IngestFixture",
        "status": "IN_PROGRESS",
        "created_at": now,
        "locked_at": now,
        "expires_at": now + timedelta(hours=1),
        "attempt_count": 1,
    }
    values.update(overrides)
    return values


def audit_values(**overrides: object) -> dict[str, object]:
    values: dict[str, object] = {
        "audit_event_id": uuid.uuid4(),
        "event_type": "FIXTURE_INGESTION_ACCEPTED",
        "actor_type": "SYSTEM_FIXTURE_ADAPTER",
        "subject_type": "FIXTURE_RECORD",
        "subject_id": uuid.uuid4(),
        "operation": "IngestFixture",
        "outcome": "ACCEPTED",
        "occurred_at": datetime.now(UTC),
        "metadata": {},
    }
    values.update(overrides)
    return values


def assert_rejected(engine: Engine, statement: Insert) -> None:
    with pytest.raises(IntegrityError):
        with engine.begin() as connection:
            connection.execute(statement)


def test_catalog_contains_operational_and_cross_front_tables(postgres_engine: Engine) -> None:
    tables = set(inspect(postgres_engine).get_table_names(schema="public"))
    assert {
        "alembic_version",
        "cross_front_workflow_executions",
        "cross_front_workflow_queue",
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
        "content_packages",
        "content_versions",
        "content_blocks",
        "curriculum_nodes",
        "sources",
        "assets",
        "generation_jobs",
        "governance_reviews",
        "publication_releases",
        "learner_profiles",
        "laboratory_runs",
        "assessment_attempts",
        "synchronization_records",
    } <= tables


def test_catalog_columns_constraints_and_indexes_match_metadata(postgres_engine: Engine) -> None:
    inspector = inspect(postgres_engine)
    expected = {
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
    }
    for table_name in expected:
        assert {column["name"] for column in inspector.get_columns(table_name)} == {
            column.name for column in metadata.tables[table_name].columns
        }
        model_indexes = {index.name for index in metadata.tables[table_name].indexes}
        database_indexes = {
            index["name"]
            for index in inspector.get_indexes(table_name)
            if not index.get("unique", False)
        }
        assert database_indexes == model_indexes
        model_checks = {
            constraint.name
            for constraint in metadata.tables[table_name].constraints
            if constraint.name and constraint.__class__.__name__ == "CheckConstraint"
        }
        database_checks = {
            constraint["name"] for constraint in inspector.get_check_constraints(table_name)
        }
        assert database_checks == model_checks


def test_fixture_constraints_reject_invalid_values(postgres_engine: Engine) -> None:
    table = metadata.tables["fixture_records"]
    assert_rejected(
        postgres_engine,
        insert(table).values(fixture_values(fixture_classification="CANONICAL")),
    )
    assert_rejected(
        postgres_engine,
        insert(table).values(fixture_values(raw_payload_sha256="bad")),
    )
    fixture_id = uuid.uuid4()
    assert_rejected(
        postgres_engine,
        insert(table).values(
            fixture_values(fixture_record_id=fixture_id, supersedes_fixture_record_id=fixture_id)
        ),
    )


def test_idempotency_constraints_reject_invalid_and_duplicate_values(
    postgres_engine: Engine,
) -> None:
    table = metadata.tables["idempotency_records"]
    assert_rejected(
        postgres_engine,
        insert(table).values(idempotency_values(status="UNKNOWN")),
    )
    assert_rejected(
        postgres_engine,
        insert(table).values(idempotency_values(status="IN_PROGRESS", locked_at=None)),
    )
    with postgres_engine.connect() as connection:
        transaction = connection.begin()
        connection.execute(insert(table).values(idempotency_values()))
        savepoint = connection.begin_nested()
        with pytest.raises(IntegrityError):
            connection.execute(insert(table).values(idempotency_values()))
        savepoint.rollback()
        transaction.rollback()


def test_audit_constraints_reject_invalid_event_and_metadata(postgres_engine: Engine) -> None:
    table = metadata.tables["operational_audit_events"]
    assert_rejected(
        postgres_engine,
        insert(table).values(audit_values(event_type="UNKNOWN")),
    )
    assert_rejected(
        postgres_engine,
        insert(table).values(audit_values(metadata=[])),
    )
