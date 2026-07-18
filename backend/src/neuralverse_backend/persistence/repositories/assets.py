"""SQLAlchemy-backed asset repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.assets import (
    Asset,
    AssetId,
    AssetType,
    AssetVersion,
    AssetVersionId,
    VisualizationSpec,
    VisualizationSpecId,
)
from neuralverse_backend.domain.shared.lifecycle import LifecycleState
from neuralverse_backend.persistence.models.assets import (
    AssetRecord,
    AssetVersionRecord,
    VisualizationSpecRecord,
)


class SqlAlchemyAssetRepository:
    """Implements AssetRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, asset_id: AssetId) -> Asset | None:
        record = self._session.get(AssetRecord, UUID(str(asset_id)))
        if record is None:
            return None
        return self._reconstruct_asset(record)

    async def save(self, asset: Asset) -> None:
        record = self._session.get(AssetRecord, UUID(str(asset.id)))
        if record is None:
            record = AssetRecord(
                asset_id=UUID(str(asset.id)),
                asset_type=asset.asset_type.value,
                display_name=asset.display_name,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.asset_type = asset.asset_type.value
            record.display_name = asset.display_name
        self._session.flush()
        for version in asset.versions:
            await self._save_version(version)

    async def _save_version(self, version: AssetVersion) -> None:
        record = self._session.get(AssetVersionRecord, UUID(str(version.id)))
        if record is None:
            record = AssetVersionRecord(
                asset_version_id=UUID(str(version.id)),
                asset_id=UUID(str(version.asset_id)),
                media_type=version.media_type,
                content_hash=version.content_hash,
                provenance=version.provenance,
                lifecycle=version.lifecycle.value,
                semantic_purpose=version.semantic_purpose,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.lifecycle = version.lifecycle.value
        self._session.flush()

    async def get_version_by_id(self, version_id: AssetVersionId) -> AssetVersion | None:
        record = self._session.get(AssetVersionRecord, UUID(str(version_id)))
        if record is None:
            return None
        return self._reconstruct_version(record)

    async def save_visualization_spec(self, spec: VisualizationSpec) -> None:
        record = self._session.get(VisualizationSpecRecord, UUID(str(spec.id)))
        if record is None:
            record = VisualizationSpecRecord(
                visualization_spec_id=UUID(str(spec.id)),
                visualization_type=spec.visualization_type,
                requirements=spec.requirements,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.visualization_type = spec.visualization_type
            record.requirements = spec.requirements
        self._session.flush()

    async def get_visualization_spec_by_id(
        self, spec_id: VisualizationSpecId
    ) -> VisualizationSpec | None:
        record = self._session.get(VisualizationSpecRecord, UUID(str(spec_id)))
        if record is None:
            return None
        return VisualizationSpec(
            spec_id=VisualizationSpecId(_value=str(record.visualization_spec_id)),
            visualization_type=record.visualization_type,
            requirements=dict(record.requirements) if record.requirements else {},
        )

    def _reconstruct_asset(self, record: AssetRecord) -> Asset:
        asset = Asset(
            asset_id=AssetId(_value=str(record.asset_id)),
            asset_type=AssetType(record.asset_type),
            display_name=record.display_name,
        )
        version_records = (
            self._session.execute(
                select(AssetVersionRecord).where(AssetVersionRecord.asset_id == record.asset_id)
            )
            .scalars()
            .all()
        )
        for vr in version_records:
            asset.add_version(self._reconstruct_version(vr))
        return asset

    def _reconstruct_version(self, record: AssetVersionRecord) -> AssetVersion:
        return AssetVersion(
            version_id=AssetVersionId(_value=str(record.asset_version_id)),
            asset_id=AssetId(_value=str(record.asset_id)),
            media_type=record.media_type,
            content_hash=record.content_hash,
            provenance=record.provenance,
            lifecycle=LifecycleState(record.lifecycle),
            semantic_purpose=record.semantic_purpose,
        )
