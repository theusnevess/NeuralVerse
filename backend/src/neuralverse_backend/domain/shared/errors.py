"""Domain error primitives."""

from __future__ import annotations


class DomainError(Exception):
    """Base class for all domain errors."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, DomainError):
            return NotImplemented
        return self.code == other.code and self.message == other.message

    def __hash__(self) -> int:
        return hash((self.code, self.message))


class InvariantViolation(DomainError):
    """Raised when a domain invariant is violated."""

    def __init__(self, message: str, *, invariant: str | None = None) -> None:
        super().__init__(code="INVARIANT_VIOLATION", message=message)
        self.invariant = invariant


class LifecycleViolation(DomainError):
    """Raised when an invalid lifecycle transition is attempted."""

    def __init__(self, message: str, *, current_state: str, target_state: str) -> None:
        super().__init__(code="LIFECYCLE_VIOLATION", message=message)
        self.current_state = current_state
        self.target_state = target_state


class IdentityError(DomainError):
    """Raised when an identity constraint is violated."""

    def __init__(self, message: str, *, identity_type: str | None = None) -> None:
        super().__init__(code="IDENTITY_ERROR", message=message)
        self.identity_type = identity_type


class ImmutabilityViolation(DomainError):
    """Raised when attempting to mutate a published/immutable entity."""

    def __init__(self, message: str, *, entity_type: str, entity_id: str) -> None:
        super().__init__(code="IMMUTABILITY_VIOLATION", message=message)
        self.entity_type = entity_type
        self.entity_id = entity_id
