from __future__ import annotations

import os
from collections.abc import Generator
from datetime import UTC, datetime
from uuid import uuid4

import pytest
from sqlalchemy import Engine, create_engine, delete

from neuralverse_backend.cross_front.envelope import CrossFrontEnvelope
from neuralverse_backend.cross_front.worker import (
    SqlAlchemyWorkflowQueue,
    WorkflowCommand,
)
from neuralverse_backend.cross_front.workflow import (
    CrossFrontWorkflowService,
    SqlAlchemyWorkflowStore,
)
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.persistence.models import WorkflowExecutionRecord, WorkflowQueueRecord
from neuralverse_backend.persistence.sessions import create_session_factory

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


class FakeIngestor:
    def execute(self, command: object) -> IngestFixtureResult:
        return IngestFixtureResult(outcome=IngestOutcome.CREATED)


def envelope(message_id: str) -> CrossFrontEnvelope:
    return CrossFrontEnvelope(
        metadata={
            "schema_name": "NV-XFI-000",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "acp-stage2",
            "created_at": "2026-07-17T10:00:00Z",
            "message_id": message_id,
        },
        payload={"kind": "authoring-execution-result", "state": "COMPLETED"},
    )


def test_postgres_workflow_store_and_queue_round_trip(postgres_engine: Engine) -> None:
    factory = create_session_factory(postgres_engine)
    command_id = f"integration:workflow:{uuid4()}"
    message_id = f"execution:workflow:{uuid4()}"
    command = WorkflowCommand(command_id, envelope(message_id), datetime.now(UTC))
    try:
        service = CrossFrontWorkflowService(FakeIngestor(), SqlAlchemyWorkflowStore(factory))
        execution = service.submit(
            command.envelope,
            command_id=command_id,
            occurred_at=command.occurred_at,
        )
        assert execution.status.value == "COMPLETED"
        replayed = service.replay(execution.execution_id)
        assert replayed is not None
        assert replayed.execution_id == execution.execution_id

        queue = SqlAlchemyWorkflowQueue(factory, lease_seconds=30)
        assert queue.enqueue(command) is True
        claimed = queue.dequeue()
        assert claimed == command
        assert queue.acknowledge(command_id) is True
        assert queue.dequeue() is None
    finally:
        with postgres_engine.begin() as connection:
            connection.execute(
                delete(WorkflowQueueRecord.__table__).where(
                    WorkflowQueueRecord.command_id == command_id
                )
            )
            connection.execute(
                delete(WorkflowExecutionRecord.__table__).where(
                    WorkflowExecutionRecord.command_id == command_id
                )
            )
