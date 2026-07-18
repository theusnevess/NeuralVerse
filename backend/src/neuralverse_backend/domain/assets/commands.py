"""Idempotent asset commands, readiness evidence and stable failures."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class AssetFailureCode(StrEnum):
    NOT_FOUND = "ASSET_NOT_FOUND"
    VERSION_NOT_FOUND = "ASSET_VERSION_NOT_FOUND"
    OBJECT_MISSING = "ASSET_OBJECT_MISSING"
    OBJECT_INACCESSIBLE = "ASSET_OBJECT_INACCESSIBLE"
    STORAGE_UNAVAILABLE = "ASSET_STORAGE_UNAVAILABLE"
    INTEGRITY_MISMATCH = "ASSET_INTEGRITY_MISMATCH"
    SIZE_MISMATCH = "ASSET_SIZE_MISMATCH"
    MIME_MISMATCH = "ASSET_MIME_MISMATCH"
    LICENSE_BLOCKED = "ASSET_LICENSE_BLOCKED"
    REVIEW_BLOCKED = "ASSET_REVIEW_BLOCKED"
    ACCESSIBILITY_BLOCKED = "ASSET_ACCESSIBILITY_BLOCKED"
    PROVENANCE_MISSING = "ASSET_PROVENANCE_MISSING"
    NOT_READY = "ASSET_NOT_READY"
    READINESS_UNKNOWN = "ASSET_READINESS_UNKNOWN"
    IDEMPOTENCY_CONFLICT = "ASSET_IDEMPOTENCY_CONFLICT"
    IMMUTABILITY_VIOLATION = "ASSET_IMMUTABILITY_VIOLATION"


@dataclass(frozen=True, slots=True)
class AssetCommand:
    command_id: str
    idempotency_key: str
    asset_id: str
    asset_version_id: str
    expected_content_hash: str
    expected_size: int
    expected_mime_type: str
    actor: str
    requested_at: datetime
    correlation_id: str
    causation_id: str | None = None
    safe_metadata: tuple[tuple[str, str], ...] = ()


class ReadinessResult(StrEnum):
    READY = "READY"
    READY_WITH_NON_BLOCKING_WARNINGS = "READY_WITH_NON_BLOCKING_WARNINGS"
    NOT_READY = "NOT_READY"
    UNKNOWN = "UNKNOWN"


@dataclass(frozen=True, slots=True)
class ReadinessAcknowledgement:
    acknowledgement_id: str
    asset_id: str
    asset_version_id: str
    result: ReadinessResult
    storage_exists: bool | None
    integrity_verified: bool | None
    license_status: str
    scientific_review_status: str
    accessibility_status: str
    provenance_status: str
    mime_status: str
    size_status: str
    actor: str
    actor_authority: str
    created_at: datetime
    command_id: str
    correlation_id: str
    blocking_reasons: tuple[str, ...] = ()
    warning_reasons: tuple[str, ...] = ()


def readiness_from_gates(
    *,
    storage_exists: bool | None,
    integrity_verified: bool | None,
    license_status: str,
    scientific_review_status: str,
    accessibility_status: str,
    provenance_status: str,
) -> ReadinessResult:
    values = (storage_exists, integrity_verified)
    if any(value is None for value in values) or "unknown" in {
        license_status,
        scientific_review_status,
        accessibility_status,
        provenance_status,
    }:
        return ReadinessResult.UNKNOWN
    if not all(values) or "rejected" in {
        license_status,
        scientific_review_status,
        accessibility_status,
    }:
        return ReadinessResult.NOT_READY
    if "review_required" in {license_status, scientific_review_status, accessibility_status}:
        return ReadinessResult.READY_WITH_NON_BLOCKING_WARNINGS
    return ReadinessResult.READY
