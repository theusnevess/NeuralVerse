"""Small S3-compatible adapter boundary with no SDK dependency.

The client protocol is injected by deployment (boto3/aiobotocore or another
approved implementation), keeping provider response types out of the domain.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Protocol

from neuralverse_backend.application.asset_storage import StoredObject
from neuralverse_backend.domain.assets.m5 import AssetStorageKey


class S3ClientPort(Protocol):
    async def put_object(
        self, *, bucket: str, key: str, body: bytes, content_type: str
    ) -> object: ...

    async def head_object(self, *, bucket: str, key: str) -> object: ...

    async def get_object(self, *, bucket: str, key: str) -> bytes: ...

    async def delete_object(self, *, bucket: str, key: str) -> object: ...


@dataclass(frozen=True, slots=True)
class S3StorageConfig:
    endpoint: str
    region: str
    bucket: str
    force_path_style: bool = True
    connect_timeout_seconds: float = 5.0
    read_timeout_seconds: float = 30.0
    max_retries: int = 1

    def __post_init__(self) -> None:
        if not self.endpoint.startswith(("https://", "http://")):
            raise ValueError("S3 endpoint must be an explicit HTTP(S) URL")
        if self.connect_timeout_seconds <= 0 or self.read_timeout_seconds <= 0:
            raise ValueError("S3 timeouts must be positive")


class S3CompatibleStorage:
    def __init__(self, client: S3ClientPort, config: S3StorageConfig) -> None:
        self._client = client
        self._config = config

    async def put(self, key: AssetStorageKey, content: bytes, media_type: str) -> StoredObject:
        await self._client.put_object(
            bucket=self._config.bucket, key=key.value, body=content, content_type=media_type
        )
        return StoredObject(key, len(content), media_type, hashlib.sha256(content).hexdigest())

    async def head(self, key: AssetStorageKey) -> StoredObject:
        raw = await self._client.head_object(bucket=self._config.bucket, key=key.value)
        if not isinstance(raw, dict):
            raise ValueError("storage adapter must normalize HEAD metadata to a mapping")
        size = int(raw.get("content_length", 0))
        media_type = str(raw.get("content_type", "application/octet-stream"))
        digest = str(raw.get("content_hash") or raw.get("etag") or "").strip('"')
        return StoredObject(key, size, media_type, digest, str(raw.get("etag", "")))

    async def read(self, key: AssetStorageKey, *, maximum_bytes: int) -> bytes:
        content = await self._client.get_object(bucket=self._config.bucket, key=key.value)
        if len(content) > maximum_bytes:
            raise ValueError("object exceeds bounded read limit")
        return content

    async def delete_uncommitted(self, key: AssetStorageKey) -> None:
        await self._client.delete_object(bucket=self._config.bucket, key=key.value)
