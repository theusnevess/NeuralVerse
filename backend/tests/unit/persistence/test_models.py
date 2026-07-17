from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import cast

from sqlalchemy import CheckConstraint, ForeignKeyConstraint, LargeBinary, String, Table, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import dialect as postgresql_dialect

from neuralverse_backend.persistence import metadata
from neuralverse_backend.persistence.models import (
    FixtureRecord,
    IdempotencyRecord,
    OperationalAuditEvent,
)


def test_shared_metadata_contains_stage2_workflow_model() -> None:
    assert set(metadata.tables) == {
        "fixture_records",
        "idempotency_records",
        "operational_audit_events",
        "cross_front_workflow_executions",
        "cross_front_workflow_queue",
    }
    assert all(table.metadata is metadata for table in metadata.tables.values())


def test_fixture_model_has_frozen_operational_shape() -> None:
    table = cast(Table, FixtureRecord.__table__)
    assert isinstance(table.c.fixture_record_id.type, Uuid)
    assert isinstance(table.c.raw_payload.type, LargeBinary)
    assert isinstance(
        table.c.structural_payload.type.dialect_impl(postgresql_dialect()), JSONB
    )
    assert "semantic_identifier_index" not in table.c
    assert "fixture_classification" in table.c
    assert "raw_payload_sha256" in table.c
    assert "structural_payload_sha256" in table.c
    assert any(isinstance(constraint, ForeignKeyConstraint) for constraint in table.constraints)
    assert any(isinstance(constraint, CheckConstraint) for constraint in table.constraints)
    assert {index.name for index in table.indexes} == {
        "ix_fixture_records_schema_version",
        "ix_fixture_records_validation_status",
        "ix_fixture_records_raw_payload_sha256",
        "ix_fixture_records_supersedes_fixture_record_id",
        "ix_fixture_records_received_at",
    }


def test_idempotency_model_has_no_raw_key_and_explicit_state_constraints() -> None:
    table = cast(Table, IdempotencyRecord.__table__)
    assert "idempotency_key" not in table.c
    assert isinstance(table.c.idempotency_key_hash.type, LargeBinary)
    assert cast(String, table.c.request_fingerprint.type).length == 64
    assert {index.name for index in table.indexes} == {
        "ix_idempotency_records_expiration_status",
        "ix_idempotency_records_operation_status",
    }
    assert any(isinstance(constraint, CheckConstraint) for constraint in table.constraints)


def test_audit_model_has_bounded_operational_metadata_only() -> None:
    table = cast(Table, OperationalAuditEvent.__table__)
    assert isinstance(table.c.metadata.type.dialect_impl(postgresql_dialect()), JSONB)
    assert "raw_payload" not in table.c
    assert "semantic_provenance" not in table.c
    assert {index.name for index in table.indexes} == {
        "ix_operational_audit_events_subject",
        "ix_operational_audit_events_correlation_id",
        "ix_operational_audit_events_recorded_at",
    }


def test_model_construction_has_no_persistence_behavior() -> None:
    fixture = FixtureRecord(
        fixture_record_id=uuid.uuid4(),
        fixture_schema_name="neuralverse.backend.fixture-envelope",
        fixture_schema_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="test",
        fixture_classification="TEST_FIXTURE",
        canonicality="NON_CANONICAL",
        agent_generated=False,
        shared_contract_status="NOT_A_FINAL_SHARED_CONTRACT",
        payload_media_type="application/json",
        raw_payload=b"{}",
        raw_payload_sha256="0" * 64,
        structural_payload={},
        structural_payload_sha256="0" * 64,
        validation_status="STRUCTURALLY_VALID",
        validation_findings=[],
        received_at=datetime.now(UTC),
    )
    assert fixture.raw_payload == b"{}"
    assert "{}" not in repr(fixture)
