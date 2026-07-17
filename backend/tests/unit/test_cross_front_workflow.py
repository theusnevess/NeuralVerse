from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from neuralverse_backend.cross_front.envelope import CrossFrontEnvelope
from neuralverse_backend.cross_front.worker import (
    InMemoryWorkflowQueue,
    SqlAlchemyWorkflowQueue,
    WorkflowCommand,
    WorkflowWorker,
)
from neuralverse_backend.cross_front.workflow import (
    CrossFrontWorkflowService,
    InMemoryWorkflowStore,
    JsonFileWorkflowStore,
    SqlAlchemyWorkflowStore,
    WorkflowIdempotencyConflict,
    WorkflowStatus,
)
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.persistence.models.workflow_execution import WorkflowExecutionRecord
from neuralverse_backend.persistence.models.workflow_queue import WorkflowQueueRecord


class FakeIngestor:
    def __init__(self, result: IngestFixtureResult) -> None:
        self.result = result
        self.calls = 0

    def execute(self, command: object) -> IngestFixtureResult:
        self.calls += 1
        return self.result


def envelope() -> CrossFrontEnvelope:
    return CrossFrontEnvelope(
        metadata={
            "schema_name": "NV-XFI-000",
            "schema_version": "1.0.0",
            "minimum_reader_version": "1.0.0",
            "producer_version": "acp-stage2",
            "created_at": "2026-07-17T10:00:00Z",
            "message_id": "execution:stage2",
        },
        payload={"kind": "authoring-result", "lineage": ["stage:publication-handoff"]},
    )


def test_workflow_is_idempotent_and_records_checkpoint() -> None:
    ingestor = FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED))
    service = CrossFrontWorkflowService(ingestor, InMemoryWorkflowStore())
    first = service.submit(envelope(), command_id="command:stage2", occurred_at=datetime.now(UTC))
    second = service.submit(envelope(), command_id="command:stage2", occurred_at=datetime.now(UTC))
    assert first.status is WorkflowStatus.COMPLETED
    assert second.execution_id == first.execution_id
    assert ingestor.calls == 1
    assert service.resume(first.execution_id) == first
    assert service.replay(first.execution_id) == first


def test_workflow_rejects_command_identity_reuse_for_different_envelope() -> None:
    ingestor = FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED))
    service = CrossFrontWorkflowService(ingestor, InMemoryWorkflowStore())
    service.submit(envelope(), command_id="command:conflict", occurred_at=datetime.now(UTC))
    changed = CrossFrontEnvelope(metadata=envelope().metadata, payload={"different": True})
    try:
        service.submit(changed, command_id="command:conflict", occurred_at=datetime.now(UTC))
    except WorkflowIdempotencyConflict:
        pass
    else:
        raise AssertionError("command identity reuse must be rejected")
    assert ingestor.calls == 1


def test_workflow_retries_bounded_failures() -> None:
    ingestor = FakeIngestor(
        IngestFixtureResult(
            outcome=IngestOutcome.RETRYABLE_OPERATION_FAILURE,
            retryable=True,
            error_code="TRANSIENT",
        )
    )
    service = CrossFrontWorkflowService(ingestor, InMemoryWorkflowStore(), max_attempts=2)
    execution = service.submit(
        envelope(), command_id="command:retry", occurred_at=datetime.now(UTC)
    )
    assert execution.status is WorkflowStatus.RETRYABLE
    assert execution.attempts == 2
    assert ingestor.calls == 2


def test_file_store_survives_store_recreation(tmp_path: Path) -> None:
    path = tmp_path / "workflow.json"
    ingestor = FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED))
    service = CrossFrontWorkflowService(ingestor, JsonFileWorkflowStore(path))
    first = service.submit(envelope(), command_id="command:file", occurred_at=datetime.now(UTC))
    recreated = CrossFrontWorkflowService(
        FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED)),
        JsonFileWorkflowStore(path),
    )
    second = recreated.submit(envelope(), command_id="command:file", occurred_at=datetime.now(UTC))
    assert second.execution_id == first.execution_id


def test_queue_deduplicates_commands_and_worker_executes_once() -> None:
    ingestor = FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED))
    store = InMemoryWorkflowStore()
    service = CrossFrontWorkflowService(ingestor, store)
    queue = InMemoryWorkflowQueue()
    command = WorkflowCommand("command:queue", envelope(), datetime.now(UTC))
    assert queue.enqueue(command) is True
    assert queue.enqueue(command) is False
    worker = WorkflowWorker(queue, service)
    execution = worker.run_once()
    assert execution is not None
    assert execution.status is WorkflowStatus.COMPLETED
    assert worker.run_once() is None
    assert ingestor.calls == 1


def test_worker_requeues_claimed_command_when_workflow_raises() -> None:
    class ExplodingService:
        def submit(self, *args: object, **kwargs: object) -> object:
            raise RuntimeError("transient worker failure")

    queue = InMemoryWorkflowQueue()
    command = WorkflowCommand("command:requeue", envelope(), datetime.now(UTC))
    assert queue.enqueue(command) is True
    worker = WorkflowWorker(queue, ExplodingService())  # type: ignore[arg-type]
    try:
        worker.run_once()
    except RuntimeError:
        pass
    else:
        raise AssertionError("worker failure must be propagated")
    assert queue.dequeue() == command


def test_sqlalchemy_store_persists_and_replays_workflow_record() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    table: Any = WorkflowExecutionRecord.__table__
    table.create(engine)
    factory = sessionmaker(engine)
    ingestor = FakeIngestor(IngestFixtureResult(outcome=IngestOutcome.CREATED))
    service = CrossFrontWorkflowService(ingestor, SqlAlchemyWorkflowStore(factory))
    first = service.submit(envelope(), command_id="command:sql", occurred_at=datetime.now(UTC))
    second = service.submit(envelope(), command_id="command:sql", occurred_at=datetime.now(UTC))
    assert second.execution_id == first.execution_id
    assert ingestor.calls == 1


def test_sqlalchemy_queue_deduplicates_and_claims_commands() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    table: Any = WorkflowQueueRecord.__table__
    table.create(engine)
    factory = sessionmaker(engine)
    queue = SqlAlchemyWorkflowQueue(factory)
    command = WorkflowCommand("command:sql-queue", envelope(), datetime.now(UTC))
    assert queue.enqueue(command) is True
    assert queue.enqueue(command) is False
    claimed = queue.dequeue()
    assert claimed is not None
    assert claimed.command_id == command.command_id
    assert queue.acknowledge(command.command_id) is True
    assert queue.dequeue() is None


def test_sqlalchemy_queue_recovers_expired_claims() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    table: Any = WorkflowQueueRecord.__table__
    table.create(engine)
    factory = sessionmaker(engine)
    queue = SqlAlchemyWorkflowQueue(factory, lease_seconds=1)
    command = WorkflowCommand("command:sql-recovery", envelope(), datetime.now(UTC))
    assert queue.enqueue(command) is True
    claimed = queue.dequeue()
    assert claimed is not None
    with factory() as session:
        record = session.get(WorkflowQueueRecord, command.command_id)
        assert record is not None
        from datetime import timedelta

        record.claimed_at = datetime.now(UTC) - timedelta(seconds=10)
        session.commit()
    recovered = queue.dequeue()
    assert recovered == command
