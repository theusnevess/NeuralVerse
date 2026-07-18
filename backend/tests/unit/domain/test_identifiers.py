"""Tests for stable identifier value objects."""

from __future__ import annotations

import uuid

import pytest

from neuralverse_backend.domain.shared.identifiers import (
    AgentContributionId,
    AgentId,
    AgentRunId,
    AssetId,
    AssetVersionId,
    AssessmentAttemptId,
    AssessmentEvidenceId,
    AssessmentSpecId,
    CitationId,
    ContentBlockId,
    ContentBlockRelationshipId,
    ContentPackageId,
    ContentVersionId,
    CurriculumEdgeId,
    CurriculumNodeId,
    GenerationJobId,
    GovernanceReviewId,
    LaboratoryEvidenceId,
    LaboratoryRunId,
    LaboratorySpecId,
    LearnerBookmarkId,
    LearnerCollectionId,
    LearnerHighlightId,
    LearnerId,
    LearnerNoteId,
    LearnerSessionId,
    OutboxEventId,
    PublicationManifestId,
    PublicationReleaseId,
    RevisionDirectiveId,
    ServiceId,
    SourceClaimLinkId,
    SourceId,
    SynchronizationRecordId,
    SystemId,
    ValidationResultId,
    VisualizationSpecId,
    WorkflowId,
)

ALL_ID_CLASSES = [
    SystemId, LearnerId, AgentId, ServiceId,
    CurriculumNodeId, CurriculumEdgeId,
    ContentPackageId, ContentVersionId, ContentBlockId, ContentBlockRelationshipId,
    SourceId, CitationId, SourceClaimLinkId,
    AssetId, AssetVersionId, VisualizationSpecId,
    GenerationJobId, AgentRunId, AgentContributionId,
    WorkflowId, ValidationResultId,
    GovernanceReviewId, RevisionDirectiveId,
    PublicationReleaseId, PublicationManifestId,
    LearnerSessionId, LearnerNoteId, LearnerBookmarkId, LearnerCollectionId, LearnerHighlightId,
    LaboratorySpecId, LaboratoryRunId, LaboratoryEvidenceId,
    AssessmentSpecId, AssessmentAttemptId, AssessmentEvidenceId,
    SynchronizationRecordId,
    OutboxEventId,
]


class TestIdentifierGeneration:
    def test_generate_produces_valid_uuid(self):
        for id_cls in ALL_ID_CLASSES:
            instance = id_cls.generate()
            parsed = uuid.UUID(instance.value)
            assert str(parsed) == instance.value

    def test_generate_produces_unique_values(self):
        for id_cls in ALL_ID_CLASSES:
            id1 = id_cls.generate()
            id2 = id_cls.generate()
            assert id1 != id2

    def test_string_representation(self):
        for id_cls in ALL_ID_CLASSES:
            instance = id_cls.generate()
            assert str(instance) == instance.value


class TestIdentifierValidation:
    def test_invalid_uuid_rejected(self):
        for id_cls in ALL_ID_CLASSES:
            with pytest.raises(ValueError, match="Invalid.*must be a valid UUID"):
                id_cls(_value="not-a-uuid")

    def test_valid_uuid_string_accepted(self):
        valid = str(uuid.uuid4())
        for id_cls in ALL_ID_CLASSES:
            instance = id_cls(_value=valid)
            assert instance.value == valid


class TestIdentifierEquality:
    def test_same_value_equal(self):
        valid = str(uuid.uuid4())
        for id_cls in ALL_ID_CLASSES:
            id1 = id_cls(_value=valid)
            id2 = id_cls(_value=valid)
            assert id1 == id2

    def test_different_value_not_equal(self):
        for id_cls in ALL_ID_CLASSES:
            id1 = id_cls.generate()
            id2 = id_cls.generate()
            assert id1 != id2

    def test_hash_equal_for_same_value(self):
        valid = str(uuid.uuid4())
        for id_cls in ALL_ID_CLASSES:
            id1 = id_cls(_value=valid)
            id2 = id_cls(_value=valid)
            assert hash(id1) == hash(id2)

    def test_hashable(self):
        for id_cls in ALL_ID_CLASSES:
            id1 = id_cls.generate()
            id2 = id_cls.generate()
            s = {id1, id2}
            assert len(s) == 2


class TestIdentifierImmutability:
    def test_frozen_dataclass(self):
        for id_cls in ALL_ID_CLASSES:
            instance = id_cls.generate()
            with pytest.raises(AttributeError):
                instance._value = "other"  # type: ignore[misc]


class TestIdentifierCrossFamilyIncompatibility:
    def test_different_families_are_not_equal(self):
        """ContentPackageId used where ContentVersionId is required must fail equality."""
        valid = str(uuid.uuid4())
        pkg_id = ContentPackageId(_value=valid)
        ver_id = ContentVersionId(_value=valid)
        assert pkg_id != ver_id

    def test_different_families_have_different_types(self):
        valid = str(uuid.uuid4())
        pkg_id = ContentPackageId(_value=valid)
        ver_id = ContentVersionId(_value=valid)
        assert type(pkg_id) is not type(ver_id)

    def test_set_distinguishes_families(self):
        """Sets must distinguish identifier families."""
        valid = str(uuid.uuid4())
        s = {ContentPackageId(_value=valid), ContentVersionId(_value=valid)}
        assert len(s) == 2


class TestIdentifierFamilies:
    def test_system_id_family(self):
        assert SystemId.FAMILY == "system"

    def test_learner_id_family(self):
        assert LearnerId.FAMILY == "learner"

    def test_agent_id_family(self):
        assert AgentId.FAMILY == "agent"

    def test_service_id_family(self):
        assert ServiceId.FAMILY == "service"

    def test_content_package_id_family(self):
        assert ContentPackageId.FAMILY == "content_package"

    def test_content_version_id_family(self):
        assert ContentVersionId.FAMILY == "content_version"

    def test_content_block_id_family(self):
        assert ContentBlockId.FAMILY == "content_block"

    def test_source_id_family(self):
        assert SourceId.FAMILY == "source"

    def test_asset_id_family(self):
        assert AssetId.FAMILY == "asset"

    def test_asset_version_id_family(self):
        assert AssetVersionId.FAMILY == "asset_version"

    def test_generation_job_id_family(self):
        assert GenerationJobId.FAMILY == "generation_job"

    def test_workflow_id_family(self):
        assert WorkflowId.FAMILY == "workflow"

    def test_publication_release_id_family(self):
        assert PublicationReleaseId.FAMILY == "publication_release"

    def test_laboratory_run_id_family(self):
        assert LaboratoryRunId.FAMILY == "laboratory_run"

    def test_assessment_attempt_id_family(self):
        assert AssessmentAttemptId.FAMILY == "assessment_attempt"

    def test_synchronization_record_id_family(self):
        assert SynchronizationRecordId.FAMILY == "synchronization_record"

    def test_outbox_event_id_family(self):
        assert OutboxEventId.FAMILY == "outbox_event"


class TestIdentifierSerialization:
    def test_roundtrip_parse(self):
        """IDs serialize deterministically and parse back to same family."""
        for id_cls in ALL_ID_CLASSES:
            original = id_cls.generate()
            serialized = str(original)
            parsed = id_cls(_value=serialized)
            assert parsed == original
            assert type(parsed) is type(original)
