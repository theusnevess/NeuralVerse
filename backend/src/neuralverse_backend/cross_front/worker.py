"""Bounded queue/worker seam for NV-XFI workflow execution."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol, cast

from neuralverse_backend.cross_front.envelope import CrossFrontEnvelope
from neuralverse_backend.cross_front.workflow import CrossFrontWorkflowService, WorkflowExecution
from neuralverse_backend.persistence.models import WorkflowQueueRecord
from neuralverse_backend.persistence.repositories import WorkflowQueueRepository


@dataclass(frozen=True, slots=True)
class WorkflowCommand:
    command_id: str
    envelope: CrossFrontEnvelope
    occurred_at: datetime


class WorkflowQueue(Protocol):
    def enqueue(self, command: WorkflowCommand) -> bool: ...
    def dequeue(self) -> WorkflowCommand | None: ...
    def requeue(self, command_id: str) -> bool: ...
    def acknowledge(self, command_id: str) -> bool: ...


class InMemoryWorkflowQueue:
    """Deterministic queue double; production workers inject a durable queue."""

    def __init__(self) -> None:
        self._items: deque[WorkflowCommand] = deque()
        self._known: set[str] = set()
        self._claimed: dict[str, WorkflowCommand] = {}

    def enqueue(self, command: WorkflowCommand) -> bool:
        if command.command_id in self._known:
            return False
        self._known.add(command.command_id)
        self._items.append(command)
        return True

    def dequeue(self) -> WorkflowCommand | None:
        if not self._items:
            return None
        command = self._items.popleft()
        self._claimed[command.command_id] = command
        return command

    def requeue(self, command_id: str) -> bool:
        command = self._claimed.pop(command_id, None)
        if command is None:
            return False
        self._items.appendleft(command)
        return True

    def acknowledge(self, command_id: str) -> bool:
        return self._claimed.pop(command_id, None) is not None


class SqlAlchemyWorkflowQueue:
    """Transactional queue implementation for Backend workers."""

    def __init__(
        self,
        session_factory: Any,
        *,
        repository: WorkflowQueueRepository | None = None,
        lease_seconds: int = 300,
    ) -> None:
        if lease_seconds < 1:
            raise ValueError("lease_seconds must be positive")
        self._session_factory = session_factory
        self._repository = repository or WorkflowQueueRepository()
        self._lease_seconds = lease_seconds

    def enqueue(self, command: WorkflowCommand) -> bool:
        with self._session_factory() as session:
            if self._repository.get(session, command.command_id) is not None:
                return False
            session.add(
                WorkflowQueueRecord(
                    command_id=command.command_id,
                    envelope={
                        "metadata": command.envelope.metadata,
                        "payload": command.envelope.payload,
                    },
                    occurred_at=command.occurred_at,
                    status="QUEUED",
                    attempts=0,
                )
            )
            try:
                session.commit()
            except Exception:
                session.rollback()
                return False
        return True

    def dequeue(self) -> WorkflowCommand | None:
        with self._session_factory() as session:
            self._repository.recover_expired_claims(
                session,
                cutoff=datetime.now(UTC) - timedelta(seconds=self._lease_seconds),
            )
            record = self._repository.next_queued(session)
            if record is None:
                return None
            record.status = "CLAIMED"
            record.claimed_at = datetime.now(UTC)
            record.attempts += 1
            session.commit()
            envelope = cast(dict[str, Any], record.envelope)
            occurred_at = record.occurred_at
            if occurred_at.tzinfo is None:
                occurred_at = occurred_at.replace(tzinfo=UTC)
            else:
                occurred_at = occurred_at.astimezone(UTC)
            return WorkflowCommand(
                command_id=record.command_id,
                envelope=CrossFrontEnvelope(
                    metadata=cast(dict[str, Any], envelope["metadata"]), payload=envelope["payload"]
                ),
                occurred_at=occurred_at,
            )

    def requeue(self, command_id: str) -> bool:
        with self._session_factory() as session:
            record = self._repository.get(session, command_id)
            if record is None or record.status != "CLAIMED":
                return False
            record.status = "QUEUED"
            record.claimed_at = None
            session.commit()
            return True

    def acknowledge(self, command_id: str) -> bool:
        with self._session_factory() as session:
            if self._repository.acknowledge(session, command_id) is None:
                return False
            session.commit()
            return True


class WorkflowWorker:
    def __init__(self, queue: WorkflowQueue, service: CrossFrontWorkflowService) -> None:
        self._queue = queue
        self._service = service

    def run_once(self) -> WorkflowExecution | None:
        command = self._queue.dequeue()
        if command is None:
            return None
        try:
            execution = self._service.submit(
                command.envelope,
                command_id=command.command_id,
                occurred_at=command.occurred_at,
            )
            self._queue.acknowledge(command.command_id)
            return execution
        except Exception:
            self._queue.requeue(command.command_id)
            raise
