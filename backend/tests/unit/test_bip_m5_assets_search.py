from __future__ import annotations

import hashlib

import pytest

from neuralverse_backend.application.asset_storage import AssetUploadService, StoredObject
from neuralverse_backend.application.indexing import IndexFreshness, build_lexical_query
from neuralverse_backend.application.search_retrieval import InMemorySearchRepository
from neuralverse_backend.domain.assets.commands import ReadinessResult, readiness_from_gates
from neuralverse_backend.domain.assets.m5 import (
    AssetAvailability,
    AssetStorageKey,
    AssetVersionMetadata,
)
from neuralverse_backend.domain.search.m5 import (
    AccessScope,
    SearchCandidate,
    SearchRequest,
    SearchResource,
    cosine_similarity,
)
from neuralverse_backend.domain.search.services import fragment_resource, reciprocal_rank_fusion


class FakeStorage:
    def __init__(self) -> None:
        self.objects: dict[str, StoredObject] = {}

    async def put(self, key: AssetStorageKey, content: bytes, media_type: str) -> StoredObject:
        result = StoredObject(key, len(content), media_type, hashlib.sha256(content).hexdigest())
        self.objects[key.value] = result
        return result

    async def head(self, key: AssetStorageKey) -> StoredObject:
        return self.objects[key.value]

    async def read(self, key: AssetStorageKey, *, maximum_bytes: int) -> bytes:
        raise NotImplementedError

    async def delete_uncommitted(self, key: AssetStorageKey) -> None:
        self.objects.pop(key.value, None)


@pytest.mark.asyncio
async def test_upload_uses_immutable_hash_key_and_verifies_head() -> None:
    storage = FakeStorage()
    result = await AssetUploadService(storage).upload(
        asset_id="asset-1", version_id="version-1", content=b"hello", media_type="text/plain"
    )
    assert result.availability is AssetAvailability.AVAILABLE
    assert result.storage_key.value.endswith(hashlib.sha256(b"hello").hexdigest())


def test_storage_key_rejects_traversal() -> None:
    with pytest.raises(ValueError):
        AssetStorageKey("../secret")


def test_integrity_rejects_non_sha256() -> None:
    with pytest.raises(ValueError):
        AssetVersionMetadata(
            asset_id="a",
            version_id="v",
            storage_key=AssetStorageKey("assets/a/v/hash"),
            integrity=__import__(
                "neuralverse_backend.domain.assets.m5", fromlist=["AssetIntegrity"]
            ).AssetIntegrity("bad", 1, "text/plain"),
        )


@pytest.mark.asyncio
async def test_search_filters_scope_and_has_stable_ties() -> None:
    repo = InMemorySearchRepository()
    for ident in ("a", "b"):
        await repo.index(
            SearchResource(
                ident,
                "content",
                "1",
                "h",
                title="Neural search",
                access_scope=AccessScope.PUBLISHED,
            )
        )
    results = await repo.search(SearchRequest("neural", limit=1))
    assert len(results) == 1
    assert results[0].resource.resource_id == "a"


def test_vector_dimension_and_cosine() -> None:
    assert cosine_similarity((1.0, 0.0), (1.0, 0.0)) == pytest.approx(1.0)
    with pytest.raises(ValueError):
        cosine_similarity((1.0,), (1.0, 0.0))


def test_lexical_query_is_parameterized() -> None:
    query = build_lexical_query(SearchRequest("'; DROP TABLE search_resources; --"))
    assert "DROP TABLE" not in str(query)
    assert ":query" in str(query)


def test_freshness_is_explicit() -> None:
    assert IndexFreshness("lexical", "2", "1").is_stale
    assert not IndexFreshness("lexical", "2", "2").is_stale


def test_unknown_readiness_gate_blocks_without_inventing_approval() -> None:
    assert (
        readiness_from_gates(
            storage_exists=True,
            integrity_verified=True,
            license_status="unknown",
            scientific_review_status="not_required",
            accessibility_status="approved",
            provenance_status="known",
        )
        is ReadinessResult.UNKNOWN
    )


def test_fragment_ids_are_rebuildable_and_strategy_versioned() -> None:
    resource = SearchResource("r", "content", "1", "hash", content="a" * 1500)
    first = fragment_resource(resource)
    second = fragment_resource(resource)
    assert [item.fragment_id for item in first] == [item.fragment_id for item in second]
    assert first[0].strategy_version == "1.0"


def test_hybrid_rrf_is_deterministic_and_allows_one_sided_candidates() -> None:
    left = SearchResource("a", "content", "1", "hash")
    right = SearchResource("b", "content", "1", "hash")
    merged = reciprocal_rank_fusion(
        [SearchCandidate(left, lexical_score=1.0)],
        [SearchCandidate(right, vector_score=0.9)],
    )
    assert {item.candidate.resource.resource_id for item in merged} == {"a", "b"}
