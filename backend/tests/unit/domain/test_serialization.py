"""Serialization tests for domain values."""

from __future__ import annotations

import uuid

import pytest

from neuralverse_backend.domain.shared.identifiers import (
    ContentPackageId,
    ContentVersionId,
    GenerationJobId,
    LearnerId,
    OutboxEventId,
)
from neuralverse_backend.domain.shared.events import DomainEvent
from neuralverse_backend.domain.shared.types import (
    ContentHash,
    OpaqueMetadata,
    RevisionNumber,
    SequencePosition,
    UtcTimestamp,
    VersionNumber,
)
from neuralverse_backend.domain.authoring import GenerationJobCreated, GenerationJobFailed
from neuralverse_backend.domain.content import ContentVersionCreated, ContentVersionPublished
from neuralverse_backend.domain.governance import GovernanceReviewCompleted, ReviewDecision
from neuralverse_backend.domain.operations.outbox import OutboxEvent, OutboxEventStatus


class TestIdentifierSerialization:
    def test_ids_serialize_deterministically(self):
        """IDs serialize deterministically and parse back to same family."""
        pid = ContentPackageId.generate()
        serialized = str(pid)
        parsed = ContentPackageId(_value=serialized)
        assert parsed == pid
        assert type(parsed) is ContentPackageId

    def test_ids_parse_back_to_same_family(self):
        """ContentPackageId and ContentVersionId parse back correctly."""
        pkg_val = str(uuid.uuid4())
        ver_val = str(uuid.uuid4())
        pkg = ContentPackageId(_value=pkg_val)
        ver = ContentVersionId(_value=ver_val)
        assert ContentPackageId(_value=str(pkg)) == pkg
        assert ContentVersionId(_value=str(ver)) == ver

    def test_id_value_is_string(self):
        """IDs serialize as strings."""
        pid = ContentPackageId.generate()
        assert isinstance(str(pid), str)


class TestDomainEventSerialization:
    def test_domain_events_serialize_without_infrastructure_objects(self):
        """Domain events produce dicts without ORM objects."""
        event = DomainEvent()
        d = event.to_dict()
        assert isinstance(d, dict)
        assert "event_id" in d
        assert "occurred_at" in d

    def test_content_version_created_serialization(self):
        event = ContentVersionCreated(
            content_version_id=ContentVersionId.generate(),
            package_id=ContentPackageId.generate(),
        )
        d = event.to_dict()
        assert d["event_type"] == "ContentVersionCreated"
        assert "content_version_id" in d
        assert "package_id" in d

    def test_generation_job_created_serialization(self):
        event = GenerationJobCreated(
            job_id=GenerationJobId.generate(),
            package_id=ContentPackageId.generate(),
        )
        d = event.to_dict()
        assert d["event_type"] == "GenerationJobCreated"
        assert "job_id" in d

    def test_generation_job_failed_serialization(self):
        event = GenerationJobFailed(
            job_id=GenerationJobId.generate(),
            reason="timeout",
        )
        d = event.to_dict()
        assert d["reason"] == "timeout"

    def test_governance_review_completed_serialization(self):
        event = GovernanceReviewCompleted(
            review_id=uuid.uuid4().hex,
            target_version_id=ContentVersionId.generate(),
            decision=ReviewDecision.APPROVED,
        )
        d = event.to_dict()
        assert d["decision"] == "approved"


class TestTypeSerialization:
    def test_opaque_metadata_survives(self):
        meta = OpaqueMetadata(data={"key": "value", "nested": "data"})
        d = {"metadata": meta.data}
        assert d["metadata"]["key"] == "value"

    def test_timestamps_remain_utc_aware(self):
        ts = UtcTimestamp(value=__import__("datetime").datetime.now(__import__("datetime").timezone.utc))
        serialized = str(ts)
        assert "+" in serialized or "Z" in serialized

    def test_versions_remain_exact(self):
        v = VersionNumber.parse("1.2.3")
        s = str(v)
        assert s == "1.2.3"

    def test_revision_number_serializable(self):
        r = RevisionNumber(5)
        assert str(r) == "5"
        assert r.value == 5

    def test_sequence_position_serializable(self):
        p = SequencePosition(3)
        assert str(p) == "3"

    def test_content_hash_serializable(self):
        h = ContentHash.sha256(b"test")
        d = {"algorithm": h.algorithm, "hex_digest": h.hex_digest}
        restored = ContentHash(algorithm=d["algorithm"], hex_digest=d["hex_digest"])
        assert restored == h
