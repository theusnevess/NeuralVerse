"""Explicit persistence repositories authorized by BIP-M1."""

from neuralverse_backend.persistence.repositories.fixture_records import FixtureRecordRepository
from neuralverse_backend.persistence.repositories.idempotency_records import (
    IdempotencyRecordRepository,
)
from neuralverse_backend.persistence.repositories.operational_audit_events import (
    OperationalAuditEventRepository,
)
from neuralverse_backend.persistence.repositories.workflow_executions import (
    WorkflowExecutionRepository,
)
from neuralverse_backend.persistence.repositories.workflow_queue import WorkflowQueueRepository

__all__ = [
    "FixtureRecordRepository",
    "IdempotencyRecordRepository",
    "OperationalAuditEventRepository",
    "WorkflowExecutionRepository",
    "WorkflowQueueRepository",
]
