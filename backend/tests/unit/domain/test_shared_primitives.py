"""Tests for shared domain primitives."""

from __future__ import annotations

import pytest
from datetime import datetime, timezone

from neuralverse_backend.domain.shared.errors import (
    DomainError,
    IdentityError,
    ImmutabilityViolation,
    InvariantViolation,
    LifecycleViolation,
)
from neuralverse_backend.domain.shared.entity import Entity, AggregateRoot
from neuralverse_backend.domain.shared.events import DomainEvent
from neuralverse_backend.domain.shared.lifecycle import LifecycleState, ContentLifecycleState
from neuralverse_backend.domain.shared.types import (
    ContentHash,
    OpaqueMetadata,
    RevisionNumber,
    SequencePosition,
    UtcTimestamp,
    VersionNumber,
    utc_now,
)


class TestDomainError:
    def test_domain_error_code_and_message(self):
        err = DomainError(code="TEST", message="test message")
        assert err.code == "TEST"
        assert err.message == "test message"
        assert str(err) == "test message"

    def test_domain_error_equality(self):
        err1 = DomainError(code="A", message="msg")
        err2 = DomainError(code="A", message="msg")
        assert err1 == err2

    def test_domain_error_inequality(self):
        err1 = DomainError(code="A", message="msg")
        err2 = DomainError(code="B", message="msg")
        assert err1 != err2

    def test_invariant_violation(self):
        err = InvariantViolation("bad", invariant="test_rule")
        assert err.code == "INVARIANT_VIOLATION"
        assert err.invariant == "test_rule"

    def test_lifecycle_violation(self):
        err = LifecycleViolation("bad", current_state="draft", target_state="published")
        assert err.code == "LIFECYCLE_VIOLATION"
        assert err.current_state == "draft"
        assert err.target_state == "published"

    def test_identity_error(self):
        err = IdentityError("bad id", identity_type="learner")
        assert err.code == "IDENTITY_ERROR"
        assert err.identity_type == "learner"

    def test_immutability_violation(self):
        err = ImmutabilityViolation("cannot modify", entity_type="ContentVersion", entity_id="v1")
        assert err.code == "IMMUTABILITY_VIOLATION"
        assert err.entity_type == "ContentVersion"
        assert err.entity_id == "v1"


class TestDomainEvent:
    def test_event_creation(self):
        event = DomainEvent()
        assert event.event_id
        assert event.occurred_at.tzinfo is not None

    def test_event_equality(self):
        event1 = DomainEvent()
        event2 = DomainEvent()
        assert event1 != event2

    def test_event_hash(self):
        event = DomainEvent()
        s = {event}
        assert event in s

    def test_event_to_dict(self):
        event = DomainEvent()
        d = event.to_dict()
        assert d["event_type"] == "DomainEvent"
        assert "event_id" in d
        assert "occurred_at" in d


class TestEntity:
    def test_entity_equality(self):
        e1 = Entity(id="same")
        e2 = Entity(id="same")
        assert e1 == e2

    def test_entity_inequality(self):
        e1 = Entity(id="a")
        e2 = Entity(id="b")
        assert e1 != e2

    def test_entity_hash(self):
        e1 = Entity(id="x")
        e2 = Entity(id="x")
        assert hash(e1) == hash(e2)
        s = {e1, e2}
        assert len(s) == 1


class TestAggregateRoot:
    def test_collect_events(self):
        agg = AggregateRoot(id="root")
        assert agg.collect_events() == []

    def test_record_event(self):
        agg = AggregateRoot(id="root")
        agg._record_event(DomainEvent())
        events = agg.collect_events()
        assert len(events) == 1
        assert agg.collect_events() == []


class TestUtcTimestamp:
    def test_requires_timezone(self):
        naive = datetime(2024, 1, 1)
        with pytest.raises(ValueError, match="timezone-aware"):
            UtcTimestamp(value=naive)

    def test_aware_datetime_accepted(self):
        ts = UtcTimestamp(value=datetime.now(timezone.utc))
        assert ts.value.tzinfo is not None

    def test_comparison(self):
        t1 = UtcTimestamp(value=datetime(2024, 1, 1, tzinfo=timezone.utc))
        t2 = UtcTimestamp(value=datetime(2024, 6, 1, tzinfo=timezone.utc))
        assert t1 < t2
        assert t1 <= t2
        assert t2 > t1
        assert t2 >= t1


class TestVersionNumber:
    def test_parse(self):
        v = VersionNumber.parse("1.2.3")
        assert v.major == 1
        assert v.minor == 2
        assert v.patch == 3

    def test_invalid_format(self):
        with pytest.raises(ValueError, match="Invalid version format"):
            VersionNumber.parse("1.2")

    def test_negative_rejected(self):
        with pytest.raises(ValueError, match="non-negative"):
            VersionNumber(major=-1)

    def test_bump_major(self):
        v = VersionNumber(1, 2, 3)
        assert v.bump_major() == VersionNumber(2, 0, 0)

    def test_bump_minor(self):
        v = VersionNumber(1, 2, 3)
        assert v.bump_minor() == VersionNumber(1, 3, 0)

    def test_bump_patch(self):
        v = VersionNumber(1, 2, 3)
        assert v.bump_patch() == VersionNumber(1, 2, 4)


class TestRevisionNumber:
    def test_next(self):
        r = RevisionNumber(5)
        assert r.next() == RevisionNumber(6)

    def test_negative_rejected(self):
        with pytest.raises(ValueError, match="non-negative"):
            RevisionNumber(-1)


class TestSequencePosition:
    def test_next(self):
        p = SequencePosition(3)
        assert p.next() == SequencePosition(4)

    def test_negative_rejected(self):
        with pytest.raises(ValueError, match="non-negative"):
            SequencePosition(-1)


class TestContentHash:
    def test_sha256(self):
        h = ContentHash.sha256(b"hello")
        assert h.algorithm == "sha256"
        assert len(h.hex_digest) == 64

    def test_empty_algorithm_rejected(self):
        with pytest.raises(ValueError, match="algorithm must not be empty"):
            ContentHash(algorithm="", hex_digest="abc")

    def test_empty_digest_rejected(self):
        with pytest.raises(ValueError, match="hex_digest must not be empty"):
            ContentHash(algorithm="sha256", hex_digest="")


class TestOpaqueMetadata:
    def test_empty(self):
        m = OpaqueMetadata()
        assert len(m) == 0
        assert m.get("key") is None

    def test_with_data(self):
        m = OpaqueMetadata(data={"a": "1", "b": "2"})
        assert m.get("a") == "1"
        assert len(m) == 2

    def test_non_string_values_rejected(self):
        with pytest.raises(TypeError, match="All metadata values must be strings"):
            OpaqueMetadata(data={"key": 123})  # type: ignore[dict-item]


class TestUtcNow:
    def test_returns_aware_datetime(self):
        now = utc_now()
        assert now.tzinfo is not None
        assert now.tzinfo == timezone.utc
