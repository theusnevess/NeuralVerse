"""Assets domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.identifiers import AssetId, AssetVersionId, VisualizationSpecId
from ..shared.lifecycle import LifecycleState

if TYPE_CHECKING:
    pass


class AssetType(Enum):
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    ARCHIVE = "archive"
    DATA = "data"
    OTHER = "other"


class Asset(Entity):
    """Represents a digital asset with stable identity."""

    def __init__(
        self,
        *,
        asset_id: AssetId,
        asset_type: AssetType,
        display_name: str = "",
    ) -> None:
        super().__init__(id=asset_id)
        self.asset_type = asset_type
        self.display_name = display_name
        self._versions: list[AssetVersion] = []

    @property
    def versions(self) -> tuple[AssetVersion, ...]:
        return tuple(self._versions)

    def add_version(self, version: AssetVersion) -> None:
        if version.asset_id != self.id:
            raise InvariantViolation(
                f"AssetVersion {version.id} references asset {version.asset_id}, not {self.id}",
                invariant="version_references_correct_asset",
            )
        self._versions.append(version)


class AssetVersion(Entity):
    """A specific immutable version of an asset."""

    def __init__(
        self,
        *,
        version_id: AssetVersionId,
        asset_id: AssetId,
        media_type: str,
        content_hash: str,
        provenance: str = "",
        lifecycle: LifecycleState = LifecycleState.DRAFT,
        semantic_purpose: str = "",
    ) -> None:
        super().__init__(id=version_id)
        self.asset_id = asset_id
        self.media_type = media_type
        self.content_hash = content_hash
        self.provenance = provenance
        self.lifecycle = lifecycle
        self.semantic_purpose = semantic_purpose


class VisualizationSpec(Entity):
    """Semantic visualization requirements."""

    def __init__(
        self,
        *,
        spec_id: VisualizationSpecId,
        visualization_type: str,
        requirements: dict[str, str] | None = None,
    ) -> None:
        super().__init__(id=spec_id)
        self.visualization_type = visualization_type
        self.requirements = requirements or {}
