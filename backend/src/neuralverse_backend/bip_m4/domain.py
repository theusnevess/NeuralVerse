"""Pure, deterministic BIP-M4 operational contracts.

Nothing in this module performs I/O, reads the environment or imports a
workflow SDK.  Those boundaries are intentional: workflow replay must only
evaluate immutable inputs and explicit signals.
"""

from __future__ import annotations

import json
from collections.abc import Callable, Mapping
from dataclasses import dataclass, field
from enum import StrEnum
from hashlib import sha256
from typing import Any


def _canonical_json(value: Mapping[str, Any]) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


class FailureClass(StrEnum):
    RETRYABLE = "RETRYABLE"
    NON_RETRYABLE = "NON_RETRYABLE"
    CANCELLED = "CANCELLED"
    TIMEOUT = "TIMEOUT"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    REVISION_REQUIRED = "REVISION_REQUIRED"
    PUBLICATION_WAIT = "PUBLICATION_WAIT"
    UNKNOWN = "UNKNOWN"


class WorkflowStatus(StrEnum):
    ACCEPTED = "ACCEPTED"
    RUNNING = "RUNNING"
    WAITING_FOR_REVIEW = "WAITING_FOR_REVIEW"
    REVISION_REQUIRED = "REVISION_REQUIRED"
    WAITING_FOR_PUBLICATION = "WAITING_FOR_PUBLICATION"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


# Public name used by workflow integrations that treat the state enum as a
# persisted state machine rather than a Temporal implementation detail.
WorkflowState = WorkflowStatus


class IdempotencyConflict(ValueError):
    """A stable operation key was reused for a different immutable command."""


class CommandIdempotencyRegistry:
    """Deterministic command registry used by the application edge.

    Production replaces the backing dictionary with ``bip_m4_commands``;
    keeping this protocol-compatible registry makes conflict behavior testable
    without starting Temporal or PostgreSQL.
    """

    def __init__(self) -> None:
        self._records: dict[tuple[str, str], tuple[str, WorkflowCommand, WorkflowIdentity]] = {}

    def resolve_or_create(
        self,
        command: WorkflowCommand,
        *,
        namespace: str = "default",
        task_queue: str = "neuralverse-authoring",
        operation_type: str = "AUTHORING_START",
    ) -> tuple[WorkflowCommand, WorkflowIdentity, bool]:
        identity = WorkflowIdentity.create(command, namespace=namespace, task_queue=task_queue)
        key = (operation_type, command.idempotency_key)
        current = self._records.get(key)
        if current is not None:
            fingerprint, existing_command, existing_identity = current
            if fingerprint != command.fingerprint:
                raise IdempotencyConflict(
                    f"{operation_type}:{command.idempotency_key} was reused "
                    "with a different command"
                )
            return existing_command, existing_identity, False
        self._records[key] = (command.fingerprint, command, identity)
        return command, identity, True


@dataclass(frozen=True, slots=True)
class WorkflowCommand:
    command_id: str
    idempotency_key: str
    package_id: str
    target_content_identity: str
    requested_by: str
    request_id: str
    workflow_policy_version: str = "bip-m4-workflow:1.0.0"
    max_revisions: int = 2
    human_review_policy: str = "REQUIRED_WHEN_GATED"
    publication_policy: str = "WAIT_FOR_BIP_M3"
    correlation_id: str | None = None
    causation_id: str | None = None
    generation_job_id: str | None = None
    requested_at: str = ""

    def __post_init__(self) -> None:
        required = {
            "command_id": self.command_id,
            "idempotency_key": self.idempotency_key,
            "package_id": self.package_id,
            "target_content_identity": self.target_content_identity,
            "requested_by": self.requested_by,
            "request_id": self.request_id,
        }
        if any(not value.strip() for value in required.values()):
            raise ValueError("workflow command identity fields must be non-empty")
        if self.max_revisions < 0 or self.max_revisions > 10:
            raise ValueError("max_revisions must be between 0 and 10")

    @property
    def fingerprint(self) -> str:
        return sha256(_canonical_json(self.to_dict()).encode("utf-8")).hexdigest()

    def to_dict(self) -> dict[str, Any]:
        return {
            "command_id": self.command_id,
            "idempotency_key": self.idempotency_key,
            "package_id": self.package_id,
            "target_content_identity": self.target_content_identity,
            "requested_by": self.requested_by,
            "request_id": self.request_id,
            "workflow_policy_version": self.workflow_policy_version,
            "max_revisions": self.max_revisions,
            "human_review_policy": self.human_review_policy,
            "publication_policy": self.publication_policy,
            "correlation_id": self.correlation_id,
            "causation_id": self.causation_id,
            "generation_job_id": self.generation_job_id,
            "requested_at": self.requested_at,
        }


@dataclass(frozen=True, slots=True)
class WorkflowIdentity:
    workflow_execution_id: str
    temporal_workflow_id: str
    temporal_run_id: str | None
    workflow_type: str
    workflow_version: str
    task_queue: str
    namespace: str
    package_id: str
    generation_job_id: str
    command_id: str
    idempotency_key: str
    correlation_id: str | None
    request_id: str

    @classmethod
    def create(
        cls, command: WorkflowCommand, *, namespace: str, task_queue: str
    ) -> WorkflowIdentity:
        digest = sha256(command.idempotency_key.encode("utf-8")).hexdigest()[:32]
        job_id = command.generation_job_id or f"generation-job:{digest}"
        execution_id = f"workflow-execution:{digest}"
        return cls(
            workflow_execution_id=execution_id,
            temporal_workflow_id=f"nv-authoring:{digest}",
            temporal_run_id=None,
            workflow_type="DurableAuthoringWorkflow",
            workflow_version="bip-m4-workflow:1.0.0",
            task_queue=task_queue,
            namespace=namespace,
            package_id=command.package_id,
            generation_job_id=job_id,
            command_id=command.command_id,
            idempotency_key=command.idempotency_key,
            correlation_id=command.correlation_id,
            request_id=command.request_id,
        )


@dataclass(frozen=True, slots=True)
class GenerationJobIdentity:
    generation_job_id: str
    package_id: str
    workflow_execution_id: str
    command_id: str
    requested_by: str
    status: str = "CREATED"
    revision: int = 0
    max_revisions: int = 2
    publication_status: str = "NOT_REQUESTED"


@dataclass(frozen=True, slots=True)
class ActivityContract:
    activity_id: str
    activity_version: str
    idempotency_key: str
    retry_policy: RetryPolicy
    start_to_close_seconds: int
    schedule_to_close_seconds: int | None = None
    schedule_to_start_seconds: int | None = None
    heartbeat_seconds: int | None = None
    cancellation_type: str = "WAIT_CANCELLATION_COMPLETED"

    def __post_init__(self) -> None:
        if not self.activity_id.strip() or not self.idempotency_key.strip():
            raise ValueError("activity identity must be non-empty")
        if self.start_to_close_seconds < 1:
            raise ValueError("activity timeout must be positive")


@dataclass(frozen=True, slots=True)
class RetryPolicy:
    initial_interval_seconds: float = 1.0
    backoff_coefficient: float = 2.0
    maximum_interval_seconds: float = 60.0
    maximum_attempts: int = 3
    maximum_duration_seconds: int = 300
    non_retryable_classes: frozenset[FailureClass] = field(
        default_factory=lambda: frozenset(
            {
                FailureClass.NON_RETRYABLE,
                FailureClass.CANCELLED,
                FailureClass.MANUAL_REVIEW_REQUIRED,
                FailureClass.REVISION_REQUIRED,
                FailureClass.PUBLICATION_WAIT,
            }
        )
    )

    def __post_init__(self) -> None:
        if self.maximum_attempts < 1 or self.maximum_duration_seconds < 1:
            raise ValueError("retry policy bounds must be positive")
        if self.backoff_coefficient < 1 or self.initial_interval_seconds <= 0:
            raise ValueError("retry policy intervals are invalid")

    def accepts(self, classification: FailureClass, attempt: int) -> bool:
        return (
            classification not in self.non_retryable_classes
            and classification is FailureClass.RETRYABLE
            and 0 < attempt < self.maximum_attempts
        )


@dataclass(frozen=True, slots=True)
class ActivityFailure(Exception):
    classification: FailureClass
    code: str
    message: str
    generation_job_id: str | None = None
    workflow_execution_id: str | None = None
    activity_id: str | None = None
    details: Mapping[str, Any] = field(default_factory=dict)

    def __str__(self) -> str:
        return f"{self.code}: {self.message}"


@dataclass(frozen=True, slots=True)
class ActivityIdempotencyLedger:
    """Immutable in-memory ledger used by activities and unit tests."""

    values: Mapping[str, tuple[str, Any]] = field(default_factory=dict)

    def resolve_or_record(self, key: str, fingerprint: str, value: Any) -> Any:
        current = self.values.get(key)
        if current is not None:
            if current[0] != fingerprint:
                raise IdempotencyConflict(f"activity key {key!r} was reused with a new payload")
            return current[1]
        updated = dict(self.values)
        updated[key] = (fingerprint, value)
        object.__setattr__(self, "values", updated)
        return value

    def resolve_or_compute(
        self,
        key: str,
        fingerprint: str,
        factory: Callable[[], Any],
    ) -> Any:
        """Replay a prior result without rerunning an external side effect."""
        current = self.values.get(key)
        if current is not None:
            if current[0] != fingerprint:
                raise IdempotencyConflict(f"activity key {key!r} was reused with a new payload")
            return current[1]
        return self.resolve_or_record(key, fingerprint, factory())


@dataclass(frozen=True, slots=True)
class AuditEvent:
    sequence: int
    event_type: str
    workflow_execution_id: str
    generation_job_id: str
    command_id: str
    occurred_at: str
    details: Mapping[str, Any] = field(default_factory=dict)
