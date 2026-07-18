"""BIP-M3 publication gates and immutable publication value objects.

This module owns operational publication policy.  It never changes semantic
readiness or turns UNKNOWN findings into a passing result.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from enum import StrEnum
from typing import Final


class PublicationGateError(ValueError):
    """Raised when an operational publication gate is not satisfied."""

    def __init__(self, code: str, message: str) -> None:
        self.code = code
        super().__init__(message)


class PublicationLifecycle(StrEnum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    REVIEWED = "reviewed"
    PUBLISHED = "published"
    SUPERSEDED = "superseded"
    DEPRECATED = "deprecated"
    RETIRED = "retired"


class ReviewLifecycle(StrEnum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUIRED = "revision_required"


class ReleaseLifecycle(StrEnum):
    RELEASED = "released"
    SUPERSEDED = "superseded"
    DEPRECATED = "deprecated"
    RETIRED = "retired"


@dataclass(frozen=True, slots=True)
class ValidationFinding:
    severity: str
    rule_id: str
    message: str = ""


@dataclass(frozen=True, slots=True)
class SourceManifest:
    source_ids: tuple[str, ...]
    valid: bool = True

    def __post_init__(self) -> None:
        if len(set(self.source_ids)) != len(self.source_ids):
            raise PublicationGateError("SOURCE_MANIFEST_DUPLICATE", "source manifest is not unique")


@dataclass(frozen=True, slots=True)
class AssetManifest:
    asset_version_ids: tuple[str, ...]
    ready: bool = True

    def __post_init__(self) -> None:
        if len(set(self.asset_version_ids)) != len(self.asset_version_ids):
            raise PublicationGateError("ASSET_MANIFEST_DUPLICATE", "asset manifest is not unique")


@dataclass(frozen=True, slots=True)
class DeliveryManifest:
    release_id: str
    publication_manifest_id: str
    content_package_id: str
    content_version_id: str
    ordered_content_block_ids: tuple[str, ...]
    source_ids: tuple[str, ...]
    citation_ids: tuple[str, ...]
    asset_version_ids: tuple[str, ...]
    release_fingerprint: str

    def __post_init__(self) -> None:
        if len(set(self.ordered_content_block_ids)) != len(self.ordered_content_block_ids):
            raise PublicationGateError(
                "BLOCK_ORDER_DUPLICATE", "published block order is not unique"
            )


@dataclass(frozen=True, slots=True)
class PublicationGateInput:
    package_id: str
    content_version_id: str
    schema_name: str
    schema_version: str
    readiness_status: str
    findings: tuple[ValidationFinding, ...]
    governance_approved: bool
    manual_review_complete: bool
    source_manifest: SourceManifest
    asset_manifest: AssetManifest
    authorized_actor: str
    allowed_actors: frozenset[str]
    idempotency_key: str
    content_block_ids: tuple[str, ...]
    citation_ids: tuple[str, ...] = ()
    publication_manifest_id: str = ""
    governance_review_ids: tuple[str, ...] = ()
    supersedes_release_id: str | None = None


@dataclass(frozen=True, slots=True)
class PublicationGateResult:
    package_id: str
    content_version_id: str
    approved: bool
    evaluated_at: datetime


@dataclass(frozen=True, slots=True)
class PublicationCommand:
    idempotency_key: str
    request_fingerprint: str
    actor_id: str


@dataclass(frozen=True, slots=True)
class PublicationReleaseSnapshot:
    release_id: str
    package_id: str
    content_version_id: str
    release_number: int
    status: ReleaseLifecycle
    supersedes_release_id: str | None
    published_at: datetime


READY_FOR_PUBLICATION: Final[str] = "READY_FOR_PUBLICATION"
BLOCKING_SEVERITIES: Final[frozenset[str]] = frozenset({"P0", "P1", "UNKNOWN"})


def evaluate_publication_gates(
    request: PublicationGateInput, *, now: datetime | None = None
) -> PublicationGateResult:
    """Evaluate every BIP-M3 gate without changing semantic evidence."""

    if request.authorized_actor not in request.allowed_actors:
        raise PublicationGateError("UNAUTHORIZED_ACTOR", "actor is not authorized to publish")
    if not request.idempotency_key.strip():
        raise PublicationGateError(
            "IDEMPOTENCY_KEY_REQUIRED", "publication requires an idempotency key"
        )
    if not request.package_id or not request.content_version_id:
        raise PublicationGateError(
            "IDENTITY_REQUIRED", "package and version identities are required"
        )
    if not request.schema_name or not request.schema_version:
        raise PublicationGateError("SCHEMA_METADATA_REQUIRED", "schema metadata is required")
    if request.readiness_status != READY_FOR_PUBLICATION:
        raise PublicationGateError(
            "READINESS_NOT_APPROVED", "readiness recommendation does not permit publication"
        )
    if not request.governance_approved:
        raise PublicationGateError("GOVERNANCE_NOT_APPROVED", "governance approval is required")
    if not request.manual_review_complete:
        raise PublicationGateError("MANUAL_REVIEW_REQUIRED", "required manual review is incomplete")
    blocking = [finding for finding in request.findings if finding.severity in BLOCKING_SEVERITIES]
    if blocking:
        raise PublicationGateError(
            "BLOCKING_VALIDATION_FINDING", "P0, P1 or UNKNOWN blocks publication"
        )
    if not request.source_manifest.valid:
        raise PublicationGateError("SOURCE_NOT_VALID", "all publication sources must be valid")
    if not request.asset_manifest.ready:
        raise PublicationGateError("ASSET_NOT_READY", "all publication assets must be ready")
    if len(set(request.content_block_ids)) != len(request.content_block_ids):
        raise PublicationGateError(
            "BLOCK_ORDER_DUPLICATE", "content block order must be immutable and unique"
        )
    return PublicationGateResult(
        package_id=request.package_id,
        content_version_id=request.content_version_id,
        approved=True,
        evaluated_at=now or datetime.now(UTC),
    )
