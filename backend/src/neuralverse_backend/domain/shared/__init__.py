"""Shared domain primitives for NeuralVerse bounded contexts."""

from .entity import AggregateRoot, Entity
from .errors import (
    DomainError,
    IdentityError,
    ImmutabilityViolation,
    InvariantViolation,
    LifecycleViolation,
)
from .events import DomainEvent
from .lifecycle import ContentLifecycleState, LifecycleState, PublicationStatus
from .types import (
    ContentHash,
    OpaqueMetadata,
    RevisionNumber,
    SequencePosition,
    UtcTimestamp,
    VersionNumber,
    utc_now,
)

__all__ = [
    "AggregateRoot",
    "ContentHash",
    "ContentLifecycleState",
    "DomainError",
    "DomainEvent",
    "Entity",
    "IdentityError",
    "ImmutabilityViolation",
    "InvariantViolation",
    "LifecycleState",
    "LifecycleViolation",
    "OpaqueMetadata",
    "PublicationStatus",
    "RevisionNumber",
    "SequencePosition",
    "UtcTimestamp",
    "VersionNumber",
    "utc_now",
]
