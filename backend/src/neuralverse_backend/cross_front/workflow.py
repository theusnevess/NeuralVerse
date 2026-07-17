"""Durable-workflow boundary for NV-XFI-000 intake.

The service deliberately separates ACP execution semantics from Backend
storage.  ``WorkflowStore`` is the persistence seam: production injects a
transactional repository, while the JSON-file store makes checkpoint,
idempotency, cancellation and replay behavior testable without a database.
"""

from __future__ import annotations

import json
import os
import tempfile
from dataclasses import asdict, dataclass, replace
from datetime import UTC, datetime
from enum import StrEnum
from hashlib import sha256
from pathlib import Path
from typing import Any, Protocol, cast
from uuid import uuid4

from neuralverse_backend.cross_front.envelope import CrossFrontEnvelope, to_fixture_command
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.persistence.models import WorkflowExecutionRecord
from neuralverse_backend.persistence.repositories import WorkflowExecutionRepository


class WorkflowStatus(StrEnum):
    ACCEPTED = "ACCEPTED"
    RETRYABLE = "RETRYABLE"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    SUPERSEDED = "SUPERSEDED"


@dataclass(frozen=True, slots=True)
class WorkflowCheckpoint:
    execution_id: str
    command_id: str
    sequence: int
    status: WorkflowStatus
    envelope_hash: str
    payload_hash: str
    attempt: int
    warnings: tuple[str, ...]
    lineage: tuple[str, ...]
    created_at: str


@dataclass(frozen=True, slots=True)
class WorkflowExecution:
    execution_id: str
    command_id: str
    status: WorkflowStatus
    envelope: dict[str, Any]
    checkpoint: WorkflowCheckpoint
    attempts: int
    result: dict[str, Any]
    created_at: str
    updated_at: str


class WorkflowStore(Protocol):
    def get_by_command(self, command_id: str) -> WorkflowExecution | None: ...
    def get(self, execution_id: str) -> WorkflowExecution | None: ...
    def put(self, execution: WorkflowExecution) -> None: ...


class FixtureIngestor(Protocol):
    def execute(self, command: object) -> IngestFixtureResult: ...


class WorkflowIdempotencyConflict(ValueError):
    """The command identity was reused for a different semantic envelope."""


class JsonFileWorkflowStore:
    """Small atomic file-backed store for local workers and integration tests."""

    def __init__(self, path: str | Path) -> None:
        self._path = Path(path)

    def _read(self) -> dict[str, Any]:
        if not self._path.exists():
            return {}
        return cast(dict[str, Any], json.loads(self._path.read_text(encoding="utf-8")))

    def _write(self, data: dict[str, Any]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary = tempfile.mkstemp(prefix="nv-workflow-", dir=self._path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(data, handle, sort_keys=True, separators=(",", ":"))
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, self._path)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)

    @staticmethod
    def _decode(value: dict[str, Any]) -> WorkflowExecution:
        checkpoint = WorkflowCheckpoint(**value["checkpoint"])
        return WorkflowExecution(
            checkpoint=checkpoint,
            **{key: item for key, item in value.items() if key != "checkpoint"},
        )

    def get_by_command(self, command_id: str) -> WorkflowExecution | None:
        value = self._read().get(command_id)
        return self._decode(value) if value is not None else None

    def get(self, execution_id: str) -> WorkflowExecution | None:
        for value in self._read().values():
            if value.get("execution_id") == execution_id:
                return self._decode(value)
        return None

    def put(self, execution: WorkflowExecution) -> None:
        data = self._read()
        data[execution.command_id] = asdict(execution)
        self._write(data)


class InMemoryWorkflowStore(JsonFileWorkflowStore):
    """Deterministic test store with the same API as the durable seam."""

    def __init__(self) -> None:
        self._records: dict[str, WorkflowExecution] = {}

    def get_by_command(self, command_id: str) -> WorkflowExecution | None:
        return self._records.get(command_id)

    def get(self, execution_id: str) -> WorkflowExecution | None:
        return next(
            (item for item in self._records.values() if item.execution_id == execution_id), None
        )

    def put(self, execution: WorkflowExecution) -> None:
        self._records[execution.command_id] = execution


class SqlAlchemyWorkflowStore:
    """Transactional Backend store for workflow checkpoints and idempotency."""

    def __init__(
        self,
        session_factory: Any,
        *,
        repository: WorkflowExecutionRepository | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._repository = repository or WorkflowExecutionRepository()

    @staticmethod
    def _from_record(record: WorkflowExecutionRecord) -> WorkflowExecution:
        checkpoint_data = cast(dict[str, Any], record.checkpoint)
        checkpoint_data["status"] = WorkflowStatus(checkpoint_data["status"])
        checkpoint = WorkflowCheckpoint(**checkpoint_data)
        return WorkflowExecution(
            execution_id=record.execution_id,
            command_id=record.command_id,
            status=WorkflowStatus(record.status),
            envelope=cast(dict[str, Any], record.envelope),
            checkpoint=checkpoint,
            attempts=record.attempts,
            result=cast(dict[str, Any], record.result),
            created_at=record.created_at.isoformat().replace("+00:00", "Z"),
            updated_at=record.updated_at.isoformat().replace("+00:00", "Z"),
        )

    def get_by_command(self, command_id: str) -> WorkflowExecution | None:
        with self._session_factory() as session:
            record = self._repository.get_by_command(session, command_id)
            return self._from_record(record) if record is not None else None

    def get(self, execution_id: str) -> WorkflowExecution | None:
        with self._session_factory() as session:
            record = self._repository.get(session, execution_id)
            return self._from_record(record) if record is not None else None

    def put(self, execution: WorkflowExecution) -> None:
        from datetime import datetime

        created = datetime.fromisoformat(execution.created_at.replace("Z", "+00:00"))
        updated = datetime.fromisoformat(execution.updated_at.replace("Z", "+00:00"))
        checkpoint = asdict(execution.checkpoint)
        checkpoint["status"] = execution.checkpoint.status.value
        with self._session_factory() as session:
            record = self._repository.get_by_command(session, execution.command_id)
            if record is None:
                record = WorkflowExecutionRecord(
                    execution_id=execution.execution_id,
                    command_id=execution.command_id,
                    status=execution.status.value,
                    envelope=execution.envelope,
                    checkpoint=checkpoint,
                    attempts=execution.attempts,
                    result=execution.result,
                    created_at=created,
                    updated_at=updated,
                )
                self._repository.add(session, record)
            else:
                record.status = execution.status.value
                record.envelope = execution.envelope
                record.checkpoint = checkpoint
                record.attempts = execution.attempts
                record.result = execution.result
                record.updated_at = updated
            session.commit()


class CrossFrontWorkflowService:
    """Validates an NV-XFI envelope and runs idempotent fixture intake."""

    def __init__(
        self, ingestor: FixtureIngestor, store: WorkflowStore, *, max_attempts: int = 2
    ) -> None:
        if max_attempts < 1:
            raise ValueError("max_attempts must be positive")
        self._ingestor = ingestor
        self._store = store
        self._max_attempts = max_attempts

    def submit(
        self, envelope: CrossFrontEnvelope, *, command_id: str, occurred_at: datetime
    ) -> WorkflowExecution:
        raw = json.dumps(
            {"metadata": envelope.metadata, "payload": envelope.payload},
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
        envelope_hash = sha256(raw).hexdigest()
        existing = self._store.get_by_command(command_id)
        if existing is not None:
            if existing.checkpoint.envelope_hash != envelope_hash:
                raise WorkflowIdempotencyConflict(
                    f"Command {command_id!r} was already used for a different envelope."
                )
            return existing
        payload_hash = sha256(
            json.dumps(envelope.payload, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        attempts = 0
        result: IngestFixtureResult | None = None
        while attempts < self._max_attempts:
            attempts += 1
            result = self._ingestor.execute(
                to_fixture_command(envelope, idempotency_key=command_id, occurred_at=occurred_at)
            )
            if not result.retryable:
                break
        assert result is not None
        status = self._status_for(result.outcome)
        now = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        execution_id = str(envelope.metadata.get("message_id") or uuid4())
        checkpoint = WorkflowCheckpoint(
            execution_id=execution_id,
            command_id=command_id,
            sequence=1,
            status=status,
            envelope_hash=envelope_hash,
            payload_hash=payload_hash,
            attempt=attempts,
            warnings=tuple(result.finding_codes),
            lineage=(f"nv-xfi:{envelope.metadata.get('schema_version')}", f"command:{command_id}"),
            created_at=now,
        )
        execution = WorkflowExecution(
            execution_id=execution_id,
            command_id=command_id,
            status=status,
            envelope={"metadata": envelope.metadata, "payload": envelope.payload},
            checkpoint=checkpoint,
            attempts=attempts,
            result={
                "outcome": result.outcome.value,
                "fixture_record_id": str(result.fixture_record_id)
                if result.fixture_record_id
                else None,
                "error_code": result.error_code,
                "retryable": result.retryable,
                "replayed": result.replayed,
            },
            created_at=now,
            updated_at=now,
        )
        self._store.put(execution)
        return execution

    def resume(self, execution_id: str) -> WorkflowExecution | None:
        return self._store.get(execution_id)

    def replay(self, execution_id: str) -> WorkflowExecution | None:
        return self._store.get(execution_id)

    def cancel(self, execution_id: str, *, reason: str) -> WorkflowExecution | None:
        current = self._store.get(execution_id)
        if current is None:
            return None
        now = datetime.now(UTC).isoformat().replace("+00:00", "Z")
        cancelled = replace(
            current,
            status=WorkflowStatus.CANCELLED,
            checkpoint=replace(
                current.checkpoint,
                status=WorkflowStatus.CANCELLED,
                warnings=(*current.checkpoint.warnings, reason),
                created_at=now,
            ),
            updated_at=now,
        )
        self._store.put(cancelled)
        return cancelled

    @staticmethod
    def _status_for(outcome: IngestOutcome) -> WorkflowStatus:
        if outcome in (IngestOutcome.CREATED, IngestOutcome.REPLAYED):
            return WorkflowStatus.COMPLETED
        if outcome in (IngestOutcome.RETRYABLE_OPERATION_FAILURE, IngestOutcome.IN_PROGRESS):
            return WorkflowStatus.RETRYABLE
        if outcome is IngestOutcome.STRUCTURALLY_REJECTED:
            return WorkflowStatus.REJECTED
        return WorkflowStatus.REJECTED
