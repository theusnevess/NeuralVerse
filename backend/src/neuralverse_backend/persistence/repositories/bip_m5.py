"""BIP-M5 persistence adapters; transaction ownership stays with callers."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.search.m5 import SearchResource
from neuralverse_backend.persistence.models.bip_m5 import (
    AssetVersionIntegrityRecord,
    SearchResourceRecord,
)


class AssetIntegrityRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(
        self,
        *,
        version_id: UUID,
        storage_key: str,
        byte_size: int,
        content_hash: str,
        media_type: str,
        availability: str,
    ) -> None:
        record = self._session.get(AssetVersionIntegrityRecord, version_id)
        if record is None:
            self._session.add(
                AssetVersionIntegrityRecord(
                    asset_version_id=version_id,
                    storage_key=storage_key,
                    byte_size=byte_size,
                    content_hash=content_hash,
                    media_type=media_type,
                    availability=availability,
                    created_at=datetime.now(UTC),
                )
            )
        else:
            # Identity and integrity fields are immutable after insertion.
            if (record.storage_key, record.content_hash, record.byte_size) != (
                storage_key,
                content_hash,
                byte_size,
            ):
                raise ValueError("asset integrity identity is immutable")
            record.availability = availability


class PostgresSearchResourceRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, resource: SearchResource) -> None:
        record = self._session.scalar(
            select(SearchResourceRecord).where(
                SearchResourceRecord.resource_id == resource.resource_id,
                SearchResourceRecord.resource_version == resource.resource_version,
            )
        )
        values = {
            "resource_id": resource.resource_id,
            "resource_type": resource.resource_type,
            "resource_version": resource.resource_version,
            "source_hash": resource.source_hash,
            "lifecycle": resource.lifecycle,
            "access_scope": resource.access_scope.value,
            "language": resource.language,
            "title": resource.title,
            "content": resource.content,
            "alt_text": resource.alt_text,
            "package_id": resource.package_id,
            "content_version_id": resource.content_version_id,
            "release_id": resource.release_id,
            "block_id": resource.block_id,
            "source_id": resource.source_id,
            "citation_id": resource.citation_id,
            "fragment_id": resource.fragment_id,
            "fragment_position": resource.fragment_position,
            "search_schema_version": resource.search_schema_version,
            "created_at": datetime.now(UTC),
        }
        if record is None:
            self._session.add(SearchResourceRecord(**values))
        else:
            for key, value in values.items():
                if key != "created_at":
                    setattr(record, key, value)
