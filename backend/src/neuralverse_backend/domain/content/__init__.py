"""Content domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import AggregateRoot, Entity
from ..shared.errors import ImmutabilityViolation, InvariantViolation, LifecycleViolation
from ..shared.events import DomainEvent
from ..shared.identifiers import (
    AssetVersionId,
    ContentBlockId,
    ContentBlockRelationshipId,
    ContentPackageId,
    ContentVersionId,
    SourceId,
)
from ..shared.lifecycle import ContentLifecycleState
from ..shared.types import RevisionNumber, SequencePosition

if TYPE_CHECKING:
    pass


# --- Domain Events ---


class ContentVersionCreated(DomainEvent):
    def __init__(
        self, *, content_version_id: ContentVersionId, package_id: ContentPackageId, **kwargs
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.content_version_id = content_version_id
        self.package_id = package_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update(
            {
                "content_version_id": str(self.content_version_id),
                "package_id": str(self.package_id),
            }
        )
        return base


class ContentVersionPublished(DomainEvent):
    def __init__(
        self, *, content_version_id: ContentVersionId, package_id: ContentPackageId, **kwargs
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.content_version_id = content_version_id
        self.package_id = package_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update(
            {
                "content_version_id": str(self.content_version_id),
                "package_id": str(self.package_id),
            }
        )
        return base


class ContentCorrectionRequested(DomainEvent):
    def __init__(
        self,
        *,
        content_version_id: ContentVersionId,
        package_id: ContentPackageId,
        revision_directive_id: str,
        **kwargs,
    ) -> None:  # type: ignore[override]
        super().__init__(**kwargs)
        self.content_version_id = content_version_id
        self.package_id = package_id
        self.revision_directive_id = revision_directive_id

    def to_dict(self) -> dict:
        base = super().to_dict()
        base.update(
            {
                "content_version_id": str(self.content_version_id),
                "package_id": str(self.package_id),
                "revision_directive_id": self.revision_directive_id,
            }
        )
        return base


# --- Content Block ---


class ContentBlockType(Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    INTERACTIVE = "interactive"
    CODE = "code"
    DIAGRAM = "diagram"
    EQUATION = "equation"
    LABORATORY = "laboratory"
    ASSESSMENT = "assessment"


class BlockRelationshipType(Enum):
    PRECEDES = "precedes"
    SUPPORTS = "supports"
    DEPENDS_ON = "depends_on"
    REFERENCES = "references"
    ILLUSTRATES = "illustrates"
    ASSESSES = "assesses"
    USES_ASSET = "uses_asset"
    USES_LABORATORY = "uses_laboratory"


class ContentBlock(Entity):
    def __init__(
        self,
        *,
        block_id: ContentBlockId,
        block_type: ContentBlockType,
        payload: str | dict,
        position: SequencePosition,
    ) -> None:
        super().__init__(id=block_id)
        self.block_type = block_type
        self.payload = payload
        self.position = position


class ContentBlockRelationship(Entity):
    def __init__(
        self,
        *,
        relationship_id: ContentBlockRelationshipId,
        source_block_id: ContentBlockId,
        target_block_id: ContentBlockId,
        relationship_type: BlockRelationshipType,
    ) -> None:
        super().__init__(id=relationship_id)
        self.source_block_id = source_block_id
        self.target_block_id = target_block_id
        self.relationship_type = relationship_type


# --- Content Version ---


class ContentVersion(Entity):
    """A version of content belonging to exactly one package."""

    def __init__(
        self,
        *,
        version_id: ContentVersionId,
        package_id: ContentPackageId,
        revision: RevisionNumber,
        lifecycle: ContentLifecycleState = ContentLifecycleState.DRAFT,
        blocks: tuple[ContentBlock, ...] = (),
        source_references: tuple[SourceId, ...] = (),
        asset_version_references: tuple[AssetVersionId, ...] = (),
    ) -> None:
        super().__init__(id=version_id)
        self.package_id = package_id
        self.revision = revision
        self.lifecycle = lifecycle
        self._blocks = list(blocks)
        self.source_references = source_references
        self.asset_version_references = asset_version_references

    @property
    def blocks(self) -> tuple[ContentBlock, ...]:
        return tuple(self._blocks)

    @property
    def is_published(self) -> bool:
        return self.lifecycle == ContentLifecycleState.PUBLISHED

    def _ensure_not_published(self) -> None:
        if self.is_published:
            raise ImmutabilityViolation(
                f"Cannot modify published ContentVersion {self.id}",
                entity_type="ContentVersion",
                entity_id=str(self.id),
            )

    def publish(self) -> None:
        if self.lifecycle not in (ContentLifecycleState.REVIEWED, ContentLifecycleState.DRAFT):
            raise LifecycleViolation(
                f"Cannot publish ContentVersion in state {self.lifecycle.value}",
                current_state=self.lifecycle.value,
                target_state=ContentLifecycleState.PUBLISHED.value,
            )
        self.lifecycle = ContentLifecycleState.PUBLISHED

    def add_block(self, block: ContentBlock) -> None:
        self._ensure_not_published()
        self._blocks.append(block)

    def reorder_block(self, block_id: ContentBlockId, new_position: SequencePosition) -> None:
        self._ensure_not_published()
        for block in self._blocks:
            if block.id == block_id:
                block.position = new_position
                return
        raise InvariantViolation(f"Block {block_id} not found in version")

    def retire(self) -> None:
        self.lifecycle = ContentLifecycleState.RETIRED

    def request_correction(self) -> None:
        self.lifecycle = ContentLifecycleState.CORRECTION_REQUESTED


# --- Content Package ---


class ContentPackageState(Enum):
    ACTIVE = "active"
    RETIRED = "retired"
    ARCHIVED = "archived"


class ContentPackage(AggregateRoot):
    """Aggregate root for a content package with stable identity."""

    def __init__(
        self,
        *,
        id: ContentPackageId,
        state: ContentPackageState = ContentPackageState.ACTIVE,
    ) -> None:
        super().__init__(id=id)
        self.state = state
        self._versions: dict[ContentVersionId, ContentVersion] = {}

    @property
    def versions(self) -> tuple[ContentVersion, ...]:
        return tuple(self._versions.values())

    def create_draft_version(self, version_id: ContentVersionId) -> ContentVersion:
        """Create a new draft version for this package."""
        if self.state == ContentPackageState.RETIRED:
            raise LifecycleViolation(
                "Cannot create version for retired package",
                current_state=self.state.value,
                target_state="draft",
            )
        version = ContentVersion(
            version_id=version_id,
            package_id=self.id,
            revision=RevisionNumber(value=0),
        )
        self._versions[version_id] = version
        self._record_event(ContentVersionCreated(content_version_id=version_id, package_id=self.id))
        return version

    def register_version(self, version: ContentVersion) -> None:
        """Register an existing version to this package."""
        if version.package_id != self.id:
            raise InvariantViolation(
                f"Version {version.id} belongs to package {version.package_id}, not {self.id}",
                invariant="version_belongs_to_package",
            )
        if version.id in self._versions:
            raise InvariantViolation(
                f"Version {version.id} already registered",
                invariant="no_duplicate_versions",
            )
        self._versions[version.id] = version

    def publish_version(self, version_id: ContentVersionId) -> None:
        """Publish a specific version."""
        version = self._get_version_or_raise(version_id)
        version.publish()
        self._record_event(
            ContentVersionPublished(content_version_id=version_id, package_id=self.id)
        )

    def create_correction_version(
        self,
        original_version_id: ContentVersionId,
        new_version_id: ContentVersionId,
    ) -> ContentVersion:
        """Create a correction version. Original must be published."""
        original = self._get_version_or_raise(original_version_id)
        if not original.is_published:
            raise LifecycleViolation(
                f"Original version {original_version_id} is not published",
                current_state=original.lifecycle.value,
                target_state="correction",
            )
        original.request_correction()
        new_version = ContentVersion(
            version_id=new_version_id,
            package_id=self.id,
            revision=original.revision.next(),
            blocks=original.blocks,
            source_references=original.source_references,
            asset_version_references=original.asset_version_references,
        )
        self._versions[new_version_id] = new_version
        self._record_event(
            ContentVersionCreated(content_version_id=new_version_id, package_id=self.id)
        )
        return new_version

    def retire_package(self) -> None:
        self.state = ContentPackageState.RETIRED

    def _get_version_or_raise(self, version_id: ContentVersionId) -> ContentVersion:
        if version_id not in self._versions:
            raise InvariantViolation(f"Version {version_id} not found in package {self.id}")
        return self._versions[version_id]
