"""Durable-workflow boundary for Stage 13 execution commands.

The implementation is intentionally storage-agnostic.  Temporal activities
can call these methods with stable identifiers; no API request owns execution
state and repeated commands are idempotent within the supplied store.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from .runtime import (
    FINAL_STATES,
    ExecutionRequest,
    ExecutionState,
    LaboratoryExecutor,
    LaboratoryResult,
)


class LaboratoryRunStore(Protocol):
    def get(self, run_id: str) -> LaboratoryResult | None: ...

    def put(self, result: LaboratoryResult) -> None: ...


@dataclass(slots=True)
class InMemoryLaboratoryRunStore:
    """Test-only store with the same idempotency semantics as a durable store."""

    values: dict[str, LaboratoryResult] = field(default_factory=dict)

    def get(self, run_id: str) -> LaboratoryResult | None:
        return self.values.get(run_id)

    def put(self, result: LaboratoryResult) -> None:
        self.values.setdefault(result.request.run_id, result)


@dataclass(frozen=True, slots=True)
class WorkflowProgress:
    run_id: str
    state: ExecutionState
    sequence: int
    message: str


class ExecuteLaboratoryRunWorkflow:
    """Small orchestration facade intended to be called by durable activities."""

    workflow_id = "stage13.execute-laboratory-run"
    workflow_version = "1.0.0"

    def __init__(self, executor: LaboratoryExecutor, store: LaboratoryRunStore) -> None:
        self.executor = executor
        self.store = store
        self.progress: dict[str, list[WorkflowProgress]] = {}

    def run(self, request: ExecutionRequest) -> LaboratoryResult:
        existing = self.store.get(request.run_id)
        if existing is not None:
            return existing
        self._emit(request.run_id, ExecutionState.REQUESTED, "run accepted")
        self._emit(request.run_id, ExecutionState.VALIDATING, "request validated")
        result = self.executor.execute(request)
        self.store.put(result)
        self._emit(request.run_id, result.state, "run finalized")
        return result

    def cancel(self, run_id: str) -> None:
        existing = self.store.get(run_id)
        if existing is not None and existing.state in FINAL_STATES:
            return
        self.executor.request_cancellation(run_id)
        self._emit(run_id, ExecutionState.CANCELLATION_REQUESTED, "cancellation requested")

    def replay(self, original_run_id: str, replay_run_id: str, reason: str) -> LaboratoryResult:
        if self.store.get(replay_run_id) is not None:
            existing = self.store.get(replay_run_id)
            assert existing is not None
            return existing
        self._emit(replay_run_id, ExecutionState.REQUESTED, f"replay: {reason}")
        result = self.executor.replay(original_run_id, replay_run_id, reason=reason)
        self.store.put(result)
        self._emit(replay_run_id, result.state, "replay finalized")
        return result

    def _emit(self, run_id: str, state: ExecutionState, message: str) -> None:
        events = self.progress.setdefault(run_id, [])
        events.append(WorkflowProgress(run_id, state, len(events) + 1, message))
