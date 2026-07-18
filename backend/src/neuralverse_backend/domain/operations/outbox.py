"""OutboxEvent domain entity."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.identifiers import OutboxEventId
from ..shared.types import UtcTimestamp

if TYPE_CHECKING:
    pass


class OutboxEventStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    PUBLISHED = "published"
    RETRYABLE_FAILURE = "retryable_failure"
    DEAD_LETTER = "dead_letter"


class OutboxEvent(Entity):
    """Domain representation of an outbox event."""

    def __init__(
        self,
        *,
        event_id: OutboxEventId,
        event_type: str,
        aggregate_type: str,
        aggregate_id: str,
        payload: dict | None = None,
        status: OutboxEventStatus = OutboxEventStatus.PENDING,
        attempt_count: int = 0,
        available_at: UtcTimestamp | None = None,
        published_at: UtcTimestamp | None = None,
        last_error: str = "",
    ) -> None:
        super().__init__(id=event_id)
        self.event_type = event_type
        self.aggregate_type = aggregate_type
        self.aggregate_id = aggregate_id
        self.payload = payload or {}
        self.status = status
        self.attempt_count = attempt_count
        self.available_at = available_at
        self.published_at = published_at
        self.last_error = last_error

    def mark_processing(self) -> None:
        self.status = OutboxEventStatus.PROCESSING
        self.attempt_count += 1

    def mark_published(self) -> None:
        self.status = OutboxEventStatus.PUBLISHED
        self.published_at = UtcTimestamp(value=datetime.now(UTC))

    def mark_retryable_failure(self, error: str) -> None:
        self.status = OutboxEventStatus.RETRYABLE_FAILURE
        self.last_error = error

    def mark_dead_letter(self, error: str) -> None:
        self.status = OutboxEventStatus.DEAD_LETTER
        self.last_error = error
