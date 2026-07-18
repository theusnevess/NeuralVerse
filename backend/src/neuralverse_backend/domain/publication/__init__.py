"""Publication domain context."""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import LifecycleViolation
from ..shared.events import DomainEvent
from ..shared.identifiers import (
    ContentPackageId,
    ContentVersionId,
    GovernanceReviewId,
    PublicationManifestId,
    PublicationReleaseId,
)
from ..shared.types import UtcTimestamp

if TYPE_CHECKING:
    pass


class PublicationReleaseStatus(Enum):
    PENDING = "pending"
    RELEASED = "released"
    WITHDRAWN = "withdrawn"
    SUPERSEDED = "superseded"
    DEPRECATED = "deprecated"
    RETIRED = "retired"


class PublicationRelease(Entity):
    """A publication release of a specific content version."""

    def __init__(
        self,
        *,
        release_id: PublicationReleaseId,
        package_id: ContentPackageId,
        version_id: ContentVersionId,
        status: PublicationReleaseStatus = PublicationReleaseStatus.PENDING,
        governance_review_ids: tuple[GovernanceReviewId, ...] = (),
        release_number: int = 0,
        supersedes_release_id: PublicationReleaseId | None = None,
        created_at: UtcTimestamp | None = None,
        released_at: UtcTimestamp | None = None,
    ) -> None:
        super().__init__(id=release_id)
        self.package_id = package_id
        self.version_id = version_id
        self.status = status
        self.governance_review_ids = governance_review_ids
        self.release_number = release_number
        self.supersedes_release_id = supersedes_release_id
        self.created_at = created_at
        self.released_at = released_at

    def release(self) -> None:
        if self.status != PublicationReleaseStatus.PENDING:
            raise LifecycleViolation(
                f"Cannot release publication in status {self.status.value}",
                current_state=self.status.value,
                target_state=PublicationReleaseStatus.RELEASED.value,
            )
        self.status = PublicationReleaseStatus.RELEASED
        self.released_at = UtcTimestamp(value=datetime.now(UTC))

    def withdraw(self) -> None:
        if self.status != PublicationReleaseStatus.RELEASED:
            raise LifecycleViolation(
                f"Cannot withdraw publication in status {self.status.value}",
                current_state=self.status.value,
                target_state=PublicationReleaseStatus.WITHDRAWN.value,
            )
        self.status = PublicationReleaseStatus.WITHDRAWN

    def supersede(self) -> None:
        if self.status != PublicationReleaseStatus.RELEASED:
            raise LifecycleViolation(
                f"Cannot supersede publication in status {self.status.value}",
                current_state=self.status.value,
                target_state=PublicationReleaseStatus.SUPERSEDED.value,
            )
        self.status = PublicationReleaseStatus.SUPERSEDED

    def deprecate(self) -> None:
        if self.status not in {
            PublicationReleaseStatus.RELEASED,
            PublicationReleaseStatus.SUPERSEDED,
        }:
            raise LifecycleViolation(
                f"Cannot deprecate publication in status {self.status.value}",
                current_state=self.status.value,
                target_state=PublicationReleaseStatus.DEPRECATED.value,
            )
        self.status = PublicationReleaseStatus.DEPRECATED

    def retire(self) -> None:
        if self.status not in {
            PublicationReleaseStatus.RELEASED,
            PublicationReleaseStatus.SUPERSEDED,
            PublicationReleaseStatus.DEPRECATED,
            PublicationReleaseStatus.WITHDRAWN,
        }:
            raise LifecycleViolation(
                f"Cannot retire publication in status {self.status.value}",
                current_state=self.status.value,
                target_state=PublicationReleaseStatus.RETIRED.value,
            )
        self.status = PublicationReleaseStatus.RETIRED


class PublicationReleaseCreated(DomainEvent):
    def __init__(
        self, *, release_id: PublicationReleaseId, version_id: ContentVersionId, **kwargs
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.release_id = release_id
        self.version_id = version_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({"release_id": str(self.release_id), "version_id": str(self.version_id)})
        return base


class PublicationReleased(DomainEvent):
    def __init__(
        self, *, release_id: PublicationReleaseId, version_id: ContentVersionId, **kwargs
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.release_id = release_id
        self.version_id = version_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update({"release_id": str(self.release_id), "version_id": str(self.version_id)})
        return base


class PublicationManifest(Entity):
    """Reference to exact immutable versions for publication."""

    def __init__(
        self,
        *,
        manifest_id: PublicationManifestId,
        release_id: PublicationReleaseId,
        version_id: ContentVersionId,
        block_ids: tuple[str, ...] = (),
        asset_version_ids: tuple[str, ...] = (),
        laboratory_spec_ids: tuple[str, ...] = (),
        assessment_spec_ids: tuple[str, ...] = (),
        source_ids: tuple[str, ...] = (),
        citation_ids: tuple[str, ...] = (),
    ) -> None:
        super().__init__(id=manifest_id)
        self.release_id = release_id
        self.version_id = version_id
        self.block_ids = block_ids
        self.asset_version_ids = asset_version_ids
        self.laboratory_spec_ids = laboratory_spec_ids
        self.assessment_spec_ids = assessment_spec_ids
        self.source_ids = source_ids
        self.citation_ids = citation_ids
