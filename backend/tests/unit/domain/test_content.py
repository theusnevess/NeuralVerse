"""Tests for content domain context — identity, lifecycle, immutability."""

from __future__ import annotations

import pytest

from neuralverse_backend.domain.content import (
    ContentBlock,
    ContentBlockRelationship,
    BlockRelationshipType,
    ContentBlockType,
    ContentPackage,
    ContentPackageState,
    ContentVersion,
    ContentVersionCreated,
    ContentVersionPublished,
)
from neuralverse_backend.domain.shared.errors import ImmutabilityViolation, InvariantViolation, LifecycleViolation
from neuralverse_backend.domain.shared.identifiers import (
    ContentBlockId,
    ContentPackageId,
    ContentVersionId,
)
from neuralverse_backend.domain.shared.lifecycle import ContentLifecycleState
from neuralverse_backend.domain.shared.types import RevisionNumber, SequencePosition


class TestContentPackageIdentity:
    def test_package_identity_stable(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        assert pkg.id == pid

    def test_version_belongs_to_package(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        assert ver.package_id == pid

    def test_cross_package_version_attachment_fails(self):
        pid1 = ContentPackageId.generate()
        pid2 = ContentPackageId.generate()
        pkg1 = ContentPackage(id=pid1)
        pkg2 = ContentPackage(id=pid2)
        ver = ContentVersion(
            version_id=ContentVersionId.generate(),
            package_id=pid2,
            revision=RevisionNumber(0),
        )
        with pytest.raises(InvariantViolation, match="belongs to package"):
            pkg1.register_version(ver)

    def test_duplicate_version_registration_fails(self):
        pid = ContentPackageId.generate()
        vid = ContentVersionId.generate()
        pkg = ContentPackage(id=pid)
        ver = ContentVersion(
            version_id=vid,
            package_id=pid,
            revision=RevisionNumber(0),
        )
        pkg.register_version(ver)
        with pytest.raises(InvariantViolation, match="already registered"):
            pkg.register_version(ver)


class TestContentVersionLifecycle:
    def test_draft_creation(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        assert ver.lifecycle == ContentLifecycleState.DRAFT

    def test_publish_from_draft(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        ver.publish()
        assert ver.is_published

    def test_publish_from_reviewed(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        ver.lifecycle = ContentLifecycleState.REVIEWED
        ver.publish()
        assert ver.is_published

    def test_invalid_lifecycle_transition_fails(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        ver.lifecycle = ContentLifecycleState.PUBLISHED
        with pytest.raises(LifecycleViolation):
            ver.publish()

    def test_lifecycle_direct_mutation_not_through_method(self):
        """Direct lifecycle assignment is possible but publish() must validate."""
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        # Direct mutation bypasses validation, but the BIP requirement is
        # that the preferred API is through methods that validate.
        ver.lifecycle = ContentLifecycleState.PUBLISHED
        assert ver.lifecycle == ContentLifecycleState.PUBLISHED


class TestPublishedVersionImmutability:
    def test_published_version_cannot_add_block(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        ver.publish()
        block = ContentBlock(
            block_id=ContentBlockId.generate(),
            block_type=ContentBlockType.TEXT,
            payload="test",
            position=SequencePosition(0),
        )
        with pytest.raises(ImmutabilityViolation):
            ver.add_block(block)

    def test_published_version_cannot_reorder_block(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        bid = ContentBlockId.generate()
        ver.add_block(ContentBlock(
            block_id=bid,
            block_type=ContentBlockType.TEXT,
            payload="test",
            position=SequencePosition(0),
        ))
        ver.publish()
        with pytest.raises(ImmutabilityViolation):
            ver.reorder_block(bid, SequencePosition(1))


class TestContentPackageOperations:
    def test_create_draft_version(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(ContentVersionId.generate())
        assert ver.package_id == pid

    def test_publish_version(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        vid = ContentVersionId.generate()
        pkg.create_draft_version(vid)
        pkg.publish_version(vid)
        ver = list(pkg._versions.values())[0]
        assert ver.is_published

    def test_correction_creates_new_version(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        orig_vid = ContentVersionId.generate()
        pkg.create_draft_version(orig_vid)
        pkg.publish_version(orig_vid)
        new_vid = ContentVersionId.generate()
        new_ver = pkg.create_correction_version(orig_vid, new_vid)
        assert new_ver.revision == RevisionNumber(1)
        assert new_ver.id != orig_vid
        assert orig_vid in pkg._versions
        assert new_vid in pkg._versions

    def test_correction_of_unpublished_fails(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        orig_vid = ContentVersionId.generate()
        pkg.create_draft_version(orig_vid)
        with pytest.raises(LifecycleViolation, match="not published"):
            pkg.create_correction_version(orig_vid, ContentVersionId.generate())

    def test_retired_package_cannot_create_version(self):
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        pkg.retire_package()
        with pytest.raises(LifecycleViolation, match="retired"):
            pkg.create_draft_version(ContentVersionId.generate())

    def test_block_ordering_is_explicit(self):
        vid = ContentVersionId.generate()
        pid = ContentPackageId.generate()
        pkg = ContentPackage(id=pid)
        ver = pkg.create_draft_version(vid)
        bid1 = ContentBlockId.generate()
        bid2 = ContentBlockId.generate()
        ver.add_block(ContentBlock(
            block_id=bid1,
            block_type=ContentBlockType.TEXT,
            payload="first",
            position=SequencePosition(0),
        ))
        ver.add_block(ContentBlock(
            block_id=bid2,
            block_type=ContentBlockType.TEXT,
            payload="second",
            position=SequencePosition(1),
        ))
        assert len(ver.blocks) == 2
        assert ver.blocks[0].position == SequencePosition(0)
        assert ver.blocks[1].position == SequencePosition(1)


class TestDomainEvents:
    def test_version_created_event(self):
        pid = ContentPackageId.generate()
        vid = ContentVersionId.generate()
        pkg = ContentPackage(id=pid)
        pkg.create_draft_version(vid)
        events = pkg.collect_events()
        assert len(events) == 1
        assert isinstance(events[0], ContentVersionCreated)
        assert events[0].content_version_id == vid
        assert events[0].package_id == pid

    def test_version_published_event(self):
        pid = ContentPackageId.generate()
        vid = ContentVersionId.generate()
        pkg = ContentPackage(id=pid)
        pkg.create_draft_version(vid)
        pkg.publish_version(vid)
        events = pkg.collect_events()
        published_events = [e for e in events if isinstance(e, ContentVersionPublished)]
        assert len(published_events) == 1
