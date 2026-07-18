"""SQLAlchemy-backed content package repository."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any, cast
from uuid import UUID

from sqlalchemy import delete, select, update
from sqlalchemy.engine import CursorResult
from sqlalchemy.orm import Session

from neuralverse_backend.domain.content import (
    ContentBlock,
    ContentBlockRelationship,
    ContentBlockType,
    ContentPackage,
    ContentPackageState,
    ContentVersion,
)
from neuralverse_backend.domain.shared.identifiers import (
    AssetVersionId,
    ContentBlockId,
    ContentPackageId,
    ContentVersionId,
    SourceId,
)
from neuralverse_backend.domain.shared.lifecycle import ContentLifecycleState
from neuralverse_backend.domain.shared.types import RevisionNumber, SequencePosition
from neuralverse_backend.persistence.models.content import (
    ContentBlockRecord,
    ContentBlockRelationshipRecord,
    ContentPackageRecord,
    ContentVersionAssetVersionRecord,
    ContentVersionRecord,
    ContentVersionSourceRecord,
)


class PublishedContentVersionImmutableError(RuntimeError):
    """Raised when persistence attempts to mutate a published version."""

    code = "PUBLISHED_CONTENT_VERSION_IMMUTABLE"


class OptimisticConcurrencyError(RuntimeError):
    """Raised when an aggregate was changed by another transaction."""

    code = "OPTIMISTIC_CONCURRENCY_CONFLICT"


class SqlAlchemyContentPackageRepository:
    """Implements ContentPackageRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, package_id: ContentPackageId) -> ContentPackage | None:
        record = self._session.get(ContentPackageRecord, UUID(str(package_id)))
        if record is None:
            return None
        return self._reconstruct_package(record)

    async def save(self, package: ContentPackage) -> None:
        record = self._session.get(ContentPackageRecord, UUID(str(package.id)))
        if record is None:
            record = ContentPackageRecord(
                content_package_id=UUID(str(package.id)),
                lifecycle_state=package.state.value,
                created_at=datetime.now(UTC),
                updated_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            expected_lock_version = getattr(package, "_lock_version", record.lock_version)
            result = cast(CursorResult[Any], self._session.execute(
                update(ContentPackageRecord)
                .where(
                    ContentPackageRecord.content_package_id == record.content_package_id,
                    ContentPackageRecord.lock_version == expected_lock_version,
                )
                .values(
                    lifecycle_state=package.state.value,
                    lock_version=ContentPackageRecord.lock_version + 1,
                    updated_at=datetime.now(UTC),
                )
            ))
            if result.rowcount != 1:
                raise OptimisticConcurrencyError(OptimisticConcurrencyError.code)
            cast(Any, package)._lock_version = expected_lock_version + 1
        self._session.flush()
        for version in package.versions:
            await self._save_version(version)

    async def list_all(self) -> list[ContentPackage]:
        statement = select(ContentPackageRecord)
        records = self._session.execute(statement).scalars().all()
        return [self._reconstruct_package(r) for r in records]

    async def _save_version(self, version: ContentVersion) -> None:
        record = self._session.get(ContentVersionRecord, UUID(str(version.id)))
        if record is None:
            record = ContentVersionRecord(
                content_version_id=UUID(str(version.id)),
                content_package_id=UUID(str(version.package_id)),
                revision=version.revision.value,
                lifecycle_state=version.lifecycle.value,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            if record.lifecycle_state == ContentLifecycleState.PUBLISHED.value:
                existing_blocks = (
                    self._session.query(ContentBlockRecord)
                    .filter(ContentBlockRecord.content_version_id == record.content_version_id)
                    .count()
                )
                if (
                    record.content_package_id != UUID(str(version.package_id))
                    or record.revision != version.revision.value
                    or record.lifecycle_state != version.lifecycle.value
                    or existing_blocks != len(version.blocks)
                ):
                    raise PublishedContentVersionImmutableError(
                        PublishedContentVersionImmutableError.code
                    )
                existing_sources = tuple(
                    self._session.execute(
                        select(ContentVersionSourceRecord.source_id)
                        .where(
                            ContentVersionSourceRecord.content_version_id
                            == record.content_version_id
                        )
                        .order_by(ContentVersionSourceRecord.position)
                    )
                    .scalars()
                    .all()
                )
                existing_assets = tuple(
                    self._session.execute(
                        select(ContentVersionAssetVersionRecord.asset_version_id)
                        .where(
                            ContentVersionAssetVersionRecord.content_version_id
                            == record.content_version_id
                        )
                        .order_by(ContentVersionAssetVersionRecord.position)
                    )
                    .scalars()
                    .all()
                )
                if existing_sources != tuple(
                    UUID(str(source_id)) for source_id in version.source_references
                ) or existing_assets != tuple(
                    UUID(str(asset_id)) for asset_id in version.asset_version_references
                ):
                    raise PublishedContentVersionImmutableError(
                        PublishedContentVersionImmutableError.code
                    )
            record.lifecycle_state = version.lifecycle.value
            record.revision = version.revision.value
        self._session.flush()
        for block in version.blocks:
            await self._save_block(block, version.id)
        for rel in getattr(version, "_relationships", []):
            await self._save_relationship(rel)
        await self._save_exact_references(version)

    async def _save_block(self, block: ContentBlock, version_id: ContentVersionId) -> None:
        import json

        record = self._session.get(ContentBlockRecord, UUID(str(block.id)))
        if record is None:
            payload = block.payload if isinstance(block.payload, str) else json.dumps(block.payload)
            record = ContentBlockRecord(
                content_block_id=UUID(str(block.id)),
                content_version_id=UUID(str(version_id)),
                block_type=block.block_type.value,
                position=block.position.value,
                payload=payload,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        else:
            record.position = block.position.value
        self._session.flush()

    async def _save_exact_references(self, version: ContentVersion) -> None:
        version_id = UUID(str(version.id))
        self._session.execute(
            delete(ContentVersionSourceRecord).where(
                ContentVersionSourceRecord.content_version_id == version_id
            )
        )
        self._session.execute(
            delete(ContentVersionAssetVersionRecord).where(
                ContentVersionAssetVersionRecord.content_version_id == version_id
            )
        )
        self._session.add_all(
            [
                ContentVersionSourceRecord(
                    content_version_id=version_id,
                    source_id=UUID(str(source_id)),
                    position=position,
                )
                for position, source_id in enumerate(version.source_references)
            ]
            + [
                ContentVersionAssetVersionRecord(
                    content_version_id=version_id,
                    asset_version_id=UUID(str(asset_id)),
                    position=position,
                )
                for position, asset_id in enumerate(version.asset_version_references)
            ]
        )

    async def _save_relationship(self, rel: ContentBlockRelationship) -> None:
        record = self._session.get(ContentBlockRelationshipRecord, UUID(str(rel.id)))
        if record is None:
            record = ContentBlockRelationshipRecord(
                relationship_id=UUID(str(rel.id)),
                source_block_id=UUID(str(rel.source_block_id)),
                target_block_id=UUID(str(rel.target_block_id)),
                relationship_type=rel.relationship_type.value,
                created_at=datetime.now(UTC),
            )
            self._session.add(record)
        self._session.flush()

    def _reconstruct_package(self, record: ContentPackageRecord) -> ContentPackage:
        package = ContentPackage(
            id=ContentPackageId(_value=str(record.content_package_id)),
            state=ContentPackageState(record.lifecycle_state),
        )
        cast(Any, package)._lock_version = record.lock_version
        version_records = (
            self._session.execute(
                select(ContentVersionRecord).where(
                    ContentVersionRecord.content_package_id == record.content_package_id
                )
            )
            .scalars()
            .all()
        )
        for vr in version_records:
            version = self._reconstruct_version(vr)
            package.register_version(version)
        return package

    def _reconstruct_version(self, record: ContentVersionRecord) -> ContentVersion:
        block_records = (
            self._session.execute(
                select(ContentBlockRecord)
                .where(ContentBlockRecord.content_version_id == record.content_version_id)
                .order_by(ContentBlockRecord.position)
            )
            .scalars()
            .all()
        )
        blocks = [self._reconstruct_block(br) for br in block_records]
        source_ids = (
            self._session.execute(
                select(ContentVersionSourceRecord.source_id)
                .where(ContentVersionSourceRecord.content_version_id == record.content_version_id)
                .order_by(ContentVersionSourceRecord.position)
            )
            .scalars()
            .all()
        )
        asset_ids = (
            self._session.execute(
                select(ContentVersionAssetVersionRecord.asset_version_id)
                .where(
                    ContentVersionAssetVersionRecord.content_version_id == record.content_version_id
                )
                .order_by(ContentVersionAssetVersionRecord.position)
            )
            .scalars()
            .all()
        )
        version = ContentVersion(
            version_id=ContentVersionId(_value=str(record.content_version_id)),
            package_id=ContentPackageId(_value=str(record.content_package_id)),
            revision=RevisionNumber(value=record.revision),
            lifecycle=ContentLifecycleState(record.lifecycle_state),
            blocks=tuple(blocks),
            source_references=tuple(SourceId(_value=str(value)) for value in source_ids),
            asset_version_references=tuple(
                AssetVersionId(_value=str(value)) for value in asset_ids
            ),
        )
        return version

    def _reconstruct_block(self, record: ContentBlockRecord) -> ContentBlock:
        import json

        try:
            payload = (
                json.loads(record.payload)
                if isinstance(record.payload, str) and record.payload.startswith("{")
                else record.payload
            )
        except (json.JSONDecodeError, TypeError):
            payload = record.payload
        return ContentBlock(
            block_id=ContentBlockId(_value=str(record.content_block_id)),
            block_type=ContentBlockType(record.block_type),
            payload=payload,
            position=SequencePosition(value=record.position),
        )
