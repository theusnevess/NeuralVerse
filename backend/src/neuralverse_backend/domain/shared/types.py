"""Shared domain types: timestamps, version numbers, content hashes, metadata."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return the current UTC time."""
    return datetime.now(UTC)


@dataclass(frozen=True)
class UtcTimestamp:
    """A timezone-aware UTC timestamp value object."""

    value: datetime

    def __post_init__(self) -> None:
        if self.value.tzinfo is None:
            raise ValueError("UtcTimestamp requires a timezone-aware datetime")

    def __str__(self) -> str:
        return self.value.isoformat()

    def __lt__(self, other: UtcTimestamp) -> bool:
        return self.value < other.value

    def __le__(self, other: UtcTimestamp) -> bool:
        return self.value <= other.value

    def __gt__(self, other: UtcTimestamp) -> bool:
        return self.value > other.value

    def __ge__(self, other: UtcTimestamp) -> bool:
        return self.value >= other.value


@dataclass(frozen=True)
class VersionNumber:
    """A semantic version number value object."""

    major: int
    minor: int = 0
    patch: int = 0

    def __post_init__(self) -> None:
        if self.major < 0:
            raise ValueError("VersionNumber major must be non-negative")
        if self.minor < 0:
            raise ValueError("VersionNumber minor must be non-negative")
        if self.patch < 0:
            raise ValueError("VersionNumber patch must be non-negative")

    def __str__(self) -> str:
        return f"{self.major}.{self.minor}.{self.patch}"

    def bump_major(self) -> VersionNumber:
        return VersionNumber(major=self.major + 1)

    def bump_minor(self) -> VersionNumber:
        return VersionNumber(major=self.major, minor=self.minor + 1)

    def bump_patch(self) -> VersionNumber:
        return VersionNumber(major=self.major, minor=self.minor, patch=self.patch + 1)

    @classmethod
    def parse(cls, value: str) -> VersionNumber:
        parts = value.strip().split(".")
        if len(parts) != 3:
            raise ValueError(f"Invalid version format: {value}")
        return cls(major=int(parts[0]), minor=int(parts[1]), patch=int(parts[2]))


@dataclass(frozen=True)
class RevisionNumber:
    """A revision number for tracking content corrections."""

    value: int

    def __post_init__(self) -> None:
        if self.value < 0:
            raise ValueError("RevisionNumber must be non-negative")

    def next(self) -> RevisionNumber:
        return RevisionNumber(value=self.value + 1)

    def __str__(self) -> str:
        return str(self.value)


@dataclass(frozen=True)
class SequencePosition:
    """An explicit ordering position for blocks and ordered collections."""

    value: int

    def __post_init__(self) -> None:
        if self.value < 0:
            raise ValueError("SequencePosition must be non-negative")

    def __str__(self) -> str:
        return str(self.value)

    def next(self) -> SequencePosition:
        return SequencePosition(value=self.value + 1)


@dataclass(frozen=True)
class ContentHash:
    """A content hash value object for immutability verification."""

    algorithm: str
    hex_digest: str

    def __post_init__(self) -> None:
        if not self.algorithm:
            raise ValueError("algorithm must not be empty")
        if not self.hex_digest:
            raise ValueError("hex_digest must not be empty")

    def __str__(self) -> str:
        return f"{self.algorithm}:{self.hex_digest}"

    @classmethod
    def sha256(cls, data: bytes) -> ContentHash:
        digest = hashlib.sha256(data).hexdigest()
        return cls(algorithm="sha256", hex_digest=digest)


@dataclass(frozen=True)
class OpaqueMetadata:
    """Arbitrary opaque metadata attached to domain entities."""

    data: dict[str, str] = field(default_factory=dict)

    def __post_init__(self) -> None:
        for key in self.data:
            if not isinstance(key, str):
                raise TypeError("All metadata keys must be strings")
        for value in self.data.values():
            if not isinstance(value, str):
                raise TypeError("All metadata values must be strings")

    def get(self, key: str) -> str | None:
        return self.data.get(key)

    def __len__(self) -> int:
        return len(self.data)
