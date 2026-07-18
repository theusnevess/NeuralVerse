"""Synchronization domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.identifiers import SynchronizationRecordId

if TYPE_CHECKING:
    pass


class SyncDirection(Enum):
    PUSH = "push"
    PULL = "pull"


class SyncStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class SynchronizationRecord(Entity):
    """Domain representation of a synchronization record."""

    def __init__(
        self,
        *,
        record_id: SynchronizationRecordId,
        source_system: str,
        target_system: str,
        domain_object_id: str,
        domain_object_version: str,
        direction: SyncDirection,
        status: SyncStatus = SyncStatus.PENDING,
        content_fingerprint: str = "",
        failure_summary: str = "",
    ) -> None:
        super().__init__(id=record_id)
        self.source_system = source_system
        self.target_system = target_system
        self.domain_object_id = domain_object_id
        self.domain_object_version = domain_object_version
        self.direction = direction
        self.status = status
        self.content_fingerprint = content_fingerprint
        self.failure_summary = failure_summary
