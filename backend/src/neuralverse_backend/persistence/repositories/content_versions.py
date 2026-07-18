"""SQLAlchemy-backed content version repository."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.content import (
    ContentBlock,
    ContentBlockType,
    ContentVersion,
)
from neuralverse_backend.domain.shared.identifiers import (
    ContentBlockId,
    ContentPackageId,
    ContentVersionId,
)
from neuralverse_backend.domain.shared.lifecycle import ContentLifecycleState
from neuralverse_backend.domain.shared.types import RevisionNumber, SequencePosition
from neuralverse_backend.persistence.models.content import ContentBlockRecord, ContentVersionRecord


class PublishedContentVersionImmutableError(RuntimeError):
    """Raised when persistence attempts to mutate a published version."""

    code = "PUBLISHED_CONTENT_VERSION_IMMUTABLE"


class SqlAlchemyContentVersionRepository:
    """Implements ContentVersionRepository protocol using SQLAlchemy."""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get_by_id(self, version_id: ContentVersionId) -> ContentVersion | None:
        record = self._session.get(ContentVersionRecord, UUID(str(version_id)))
        if record is None:
            return None
        return self._reconstruct_version(record)

    async def save(self, version: ContentVersion) -> None:
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
                raise PublishedContentVersionImmutableError(
                    PublishedContentVersionImmutableError.code
                )
            record.lifecycle_state = version.lifecycle.value
            record.revision = version.revision.value
        self._session.flush()
        for block in version.blocks:
            await self._save_block(block, version.id)

    async def list_by_package(self, package_id: ContentPackageId) -> list[ContentVersion]:
        statement = (
            select(ContentVersionRecord)
            .where(ContentVersionRecord.content_package_id == UUID(str(package_id)))
            .order_by(ContentVersionRecord.revision)
        )
        records = self._session.execute(statement).scalars().all()
        return [self._reconstruct_version(r) for r in records]

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
        return ContentVersion(
            version_id=ContentVersionId(_value=str(record.content_version_id)),
            package_id=ContentPackageId(_value=str(record.content_package_id)),
            revision=RevisionNumber(value=record.revision),
            lifecycle=ContentLifecycleState(record.lifecycle_state),
            blocks=tuple(blocks),
        )

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
