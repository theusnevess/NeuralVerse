from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock
from uuid import uuid4

from neuralverse_backend.fixtures import prepare_fixture_payload
from neuralverse_backend.persistence.repositories import FixtureRecordRepository


def test_repository_uses_caller_session_without_transaction_ownership() -> None:
    session = Mock()
    repository = FixtureRecordRepository()
    record = prepare_fixture_payload(
        raw_payload=b"{}",
        schema_name="neuralverse.backend.fixture-envelope",
        schema_version="1.0.0",
        minimum_reader_version="1.0.0",
        producer_version="test",
        payload_media_type="application/json",
        received_at=datetime.now(UTC),
    ).to_fixture_record()

    repository.add(session, record)

    session.execute.assert_called_once()
    session.commit.assert_not_called()
    session.rollback.assert_not_called()
    session.close.assert_not_called()


def test_repository_get_missing_id_returns_none() -> None:
    session = Mock()
    session.execute.return_value.mappings.return_value.one_or_none.return_value = None

    assert FixtureRecordRepository().get_by_id(session, uuid4()) is None
