"""Provider-neutral asset upload application service and storage port."""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Protocol

from neuralverse_backend.domain.assets.m5 import (
    AssetAvailability,
    AssetIntegrity,
    AssetStorageKey,
    AssetVersionMetadata,
)


@dataclass(frozen=True, slots=True)
class StoredObject:
    key: AssetStorageKey
    byte_size: int
    media_type: str
    content_hash: str
    etag: str | None = None


class ObjectStoragePort(Protocol):
    async def put(self, key: AssetStorageKey, content: bytes, media_type: str) -> StoredObject: ...

    async def head(self, key: AssetStorageKey) -> StoredObject: ...

    async def read(self, key: AssetStorageKey, *, maximum_bytes: int) -> bytes: ...

    async def delete_uncommitted(self, key: AssetStorageKey) -> None: ...


class AssetUploadService:
    """Coordinates explicit DB/object consistency states without fake atomicity."""

    def __init__(self, storage: ObjectStoragePort) -> None:
        self.storage = storage

    async def upload(
        self,
        *,
        asset_id: str,
        version_id: str,
        content: bytes,
        media_type: str,
        provenance: str = "",
        original_filename: str | None = None,
    ) -> AssetVersionMetadata:
        digest = hashlib.sha256(content).hexdigest()
        key = AssetStorageKey.for_version(asset_id, version_id, digest)
        declared = AssetIntegrity(
            content_hash=digest, byte_size=len(content), media_type=media_type
        )
        await self.storage.put(key, content, media_type)
        observed = await self.storage.head(key)
        if observed.content_hash != digest or observed.byte_size != len(content):
            await self.storage.delete_uncommitted(key)
            raise ValueError("stored object failed integrity verification")
        return AssetVersionMetadata(
            asset_id=asset_id,
            version_id=version_id,
            storage_key=key,
            integrity=declared,
            availability=AssetAvailability.AVAILABLE,
            provenance=provenance,
            original_filename=original_filename,
        )
