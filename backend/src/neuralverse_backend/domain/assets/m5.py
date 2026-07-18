"""BIP-M5 asset storage, integrity and readiness value objects.

This module is deliberately provider neutral.  Object-storage clients and
database records belong to infrastructure adapters.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import StrEnum

from ..shared.errors import InvariantViolation

_SHA256 = re.compile(r"^[0-9a-f]{64}$")


class AssetAvailability(StrEnum):
    UPLOADING = "uploading"
    AVAILABLE = "available"
    MISSING = "missing"
    ORPHANED = "orphaned"
    QUARANTINED = "quarantined"
    FAILED = "failed"


class ReadinessState(StrEnum):
    PENDING = "pending"
    READY = "ready"
    BLOCKED = "blocked"
    REJECTED = "rejected"


class IndexState(StrEnum):
    PENDING = "pending"
    INDEXED = "indexed"
    STALE = "stale"
    FAILED = "failed"


@dataclass(frozen=True, slots=True)
class AssetStorageKey:
    """Immutable, governed object key; user filenames never form authority."""

    value: str

    def __post_init__(self) -> None:
        value = self.value
        if not value or len(value) > 1024 or value.startswith(("/", "\\")):
            raise ValueError("storage key must be a bounded relative path")
        if ".." in value or "\\" in value or any(ord(c) < 32 for c in value):
            raise ValueError("storage key contains unsafe path material")

    @classmethod
    def for_version(cls, asset_id: str, version_id: str, content_hash: str) -> AssetStorageKey:
        if not _SHA256.fullmatch(content_hash):
            raise ValueError("content hash must be a lowercase SHA-256 digest")
        return cls(f"assets/{asset_id}/{version_id}/{content_hash}")


@dataclass(frozen=True, slots=True)
class AssetIntegrity:
    content_hash: str
    byte_size: int
    media_type: str

    def __post_init__(self) -> None:
        if not _SHA256.fullmatch(self.content_hash):
            raise ValueError("content_hash must be a lowercase SHA-256 digest")
        if self.byte_size < 0:
            raise ValueError("byte_size cannot be negative")
        if not self.media_type.strip():
            raise ValueError("media_type cannot be empty")


@dataclass(frozen=True, slots=True)
class AssetReadiness:
    state: ReadinessState
    availability: AssetAvailability
    reasons: tuple[str, ...] = ()
    checks: tuple[str, ...] = ()

    @property
    def is_ready(self) -> bool:
        return (
            self.state is ReadinessState.READY and self.availability is AssetAvailability.AVAILABLE
        )


@dataclass(frozen=True, slots=True)
class AssetVersionMetadata:
    asset_id: str
    version_id: str
    storage_key: AssetStorageKey
    integrity: AssetIntegrity
    availability: AssetAvailability = AssetAvailability.UPLOADING
    provenance: str = ""
    original_filename: str | None = None
    license_status: str = "unknown"
    accessibility_status: str = "unknown"
    scientific_review_status: str = "unknown"
    tags: tuple[str, ...] = field(default_factory=tuple)

    def finalize(self, *, observed: AssetIntegrity) -> AssetVersionMetadata:
        if observed != self.integrity:
            raise InvariantViolation(
                "object metadata does not match declared asset integrity",
                invariant="asset_integrity_matches_object",
            )
        return AssetVersionMetadata(
            asset_id=self.asset_id,
            version_id=self.version_id,
            storage_key=self.storage_key,
            integrity=self.integrity,
            availability=AssetAvailability.AVAILABLE,
            provenance=self.provenance,
            original_filename=self.original_filename,
            license_status=self.license_status,
            accessibility_status=self.accessibility_status,
            scientific_review_status=self.scientific_review_status,
            tags=self.tags,
        )


def build_readiness(metadata: AssetVersionMetadata) -> AssetReadiness:
    """Evaluate readiness without conflating storage availability and approval."""
    reasons: list[str] = []
    if metadata.availability is not AssetAvailability.AVAILABLE:
        reasons.append("object_not_available")
    if metadata.license_status == "rejected":
        reasons.append("license_rejected")
    if metadata.accessibility_status == "rejected":
        reasons.append("accessibility_rejected")
    if metadata.scientific_review_status == "rejected":
        reasons.append("scientific_review_rejected")
    state = ReadinessState.READY if not reasons else ReadinessState.BLOCKED
    return AssetReadiness(state=state, availability=metadata.availability, reasons=tuple(reasons))
