"""Operations domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity

if TYPE_CHECKING:
    pass


class IncidentSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class OperationalIncident(Entity):
    """An operational incident."""

    def __init__(
        self,
        *,
        incident_id: str,
        severity: IncidentSeverity,
        description: str = "",
        resolved: bool = False,
    ) -> None:
        super().__init__(id=incident_id)
        self.severity = severity
        self.description = description
        self.resolved = resolved


class RetryDirective(Entity):
    """A directive to retry a failed operation."""

    def __init__(
        self,
        *,
        directive_id: str,
        target_operation: str,
        max_retries: int = 3,
        current_attempt: int = 0,
    ) -> None:
        super().__init__(id=directive_id)
        self.target_operation = target_operation
        self.max_retries = max_retries
        self.current_attempt = current_attempt


class DeadLetterReference(Entity):
    """Reference to a dead-lettered message."""

    def __init__(
        self,
        *,
        reference_id: str,
        original_event_type: str,
        original_payload_summary: str = "",
        failure_reason: str = "",
    ) -> None:
        super().__init__(id=reference_id)
        self.original_event_type = original_event_type
        self.original_payload_summary = original_payload_summary
        self.failure_reason = failure_reason


class MaintenanceState(Entity):
    """System maintenance state."""

    def __init__(self, *, component: str, is_maintaining: bool = False, message: str = "") -> None:
        super().__init__(id=component)
        self.is_maintaining = is_maintaining
        self.message = message
