"""Tests for authoring, orchestration, governance, publication, learner, labs, assessments, synchronization, search, operations contexts."""

from __future__ import annotations

import pytest

from neuralverse_backend.domain.authoring import (
    AgentContribution,
    AgentRun,
    ContributionStatus,
    GenerationJob,
    GenerationJobStatus,
    SeverityLevel,
    ValidationResult,
)
from neuralverse_backend.domain.orchestration import (
    WorkflowInputReference,
    WorkflowReference,
    WorkflowState,
    WorkflowStateType,
)
from neuralverse_backend.domain.governance import (
    GovernanceReview,
    GovernanceReviewCompleted,
    RevisionDirective,
    ReviewDecision,
)
from neuralverse_backend.domain.publication import (
    PublicationManifest,
    PublicationRelease,
    PublicationReleaseStatus,
)
from neuralverse_backend.domain.learner import (
    LearnerBookmark,
    LearnerCollection,
    LearnerHighlight,
    LearnerNote,
    LearnerProfile,
    LearnerSession,
)
from neuralverse_backend.domain.laboratories import (
    LaboratoryEvidence,
    LaboratoryRun,
    LaboratoryRunStatus,
    LaboratorySpec,
)
from neuralverse_backend.domain.assessments import (
    AssessmentAttempt,
    AssessmentAttemptStatus,
    AssessmentEvidence,
    AssessmentSpec,
)
from neuralverse_backend.domain.synchronization import (
    SynchronizationRecord,
    SyncDirection,
    SyncStatus,
)
from neuralverse_backend.domain.operations import (
    DeadLetterReference,
    IncidentSeverity,
    MaintenanceState,
    OperationalIncident,
    RetryDirective,
)
from neuralverse_backend.domain.operations.outbox import (
    OutboxEvent,
    OutboxEventStatus,
)
from neuralverse_backend.domain.shared.errors import InvariantViolation, LifecycleViolation
from neuralverse_backend.domain.shared.identifiers import (
    AgentContributionId,
    AgentId,
    AgentRunId,
    AssessmentAttemptId,
    AssessmentSpecId,
    ContentPackageId,
    ContentVersionId,
    GenerationJobId,
    GovernanceReviewId,
    LaboratoryEvidenceId,
    LaboratoryRunId,
    LaboratorySpecId,
    LearnerId,
    LearnerSessionId,
    OutboxEventId,
    PublicationManifestId,
    PublicationReleaseId,
    RevisionDirectiveId,
    SynchronizationRecordId,
    WorkflowId,
)
from neuralverse_backend.domain.shared.types import UtcTimestamp


# --- Authoring ---


class TestGenerationJob:
    def test_creation(self):
        jid = GenerationJobId.generate()
        pid = ContentPackageId.generate()
        job = GenerationJob(job_id=jid, package_id=pid)
        assert job.id == jid
        assert job.status == GenerationJobStatus.CREATED

    def test_fail(self):
        job = GenerationJob(job_id=GenerationJobId.generate(), package_id=ContentPackageId.generate())
        job.fail("error")
        assert job.status == GenerationJobStatus.FAILED


class TestValidationResult:
    def test_creation(self):
        vid = AgentContributionId.generate()
        vr = ValidationResult(
            result_id=vid,
            validator_id="test-validator",
            result="passed",
            severity=SeverityLevel.INFO,
        )
        assert vr.result == "passed"


# --- Orchestration ---


class TestWorkflowState:
    def test_valid_transition(self):
        ws = WorkflowState(workflow_id=WorkflowId.generate())
        ws.transition(WorkflowStateType.RUNNING)
        assert ws.state == WorkflowStateType.RUNNING

    def test_invalid_transition_fails(self):
        ws = WorkflowState(workflow_id=WorkflowId.generate())
        with pytest.raises(InvariantViolation, match="Invalid transition"):
            ws.transition(WorkflowStateType.COMPLETED)


# --- Governance ---


class TestGovernanceReview:
    def test_creation(self):
        rid = GovernanceReviewId.generate()
        vid = ContentVersionId.generate()
        review = GovernanceReview(
            review_id=rid,
            target_version_id=vid,
            review_authority="board",
            decision=ReviewDecision.APPROVED,
        )
        assert review.decision == ReviewDecision.APPROVED


class TestRevisionDirective:
    def test_creation(self):
        did = RevisionDirectiveId.generate()
        vid = ContentVersionId.generate()
        directive = RevisionDirective(
            directive_id=did,
            target_version_id=vid,
            reason="needs correction",
        )
        assert directive.target_version_id == vid


# --- Publication ---


class TestPublicationRelease:
    def test_pending_to_released(self):
        rid = PublicationReleaseId.generate()
        pid = ContentPackageId.generate()
        vid = ContentVersionId.generate()
        release = PublicationRelease(
            release_id=rid,
            package_id=pid,
            version_id=vid,
        )
        release.release()
        assert release.status == PublicationReleaseStatus.RELEASED

    def test_invalid_release_transition(self):
        rid = PublicationReleaseId.generate()
        release = PublicationRelease(
            release_id=rid,
            package_id=ContentPackageId.generate(),
            version_id=ContentVersionId.generate(),
            status=PublicationReleaseStatus.RELEASED,
        )
        with pytest.raises(LifecycleViolation):
            release.release()

    def test_withdraw_from_released(self):
        rid = PublicationReleaseId.generate()
        release = PublicationRelease(
            release_id=rid,
            package_id=ContentPackageId.generate(),
            version_id=ContentVersionId.generate(),
            status=PublicationReleaseStatus.RELEASED,
        )
        release.withdraw()
        assert release.status == PublicationReleaseStatus.WITHDRAWN

    def test_withdraw_from_pending_fails(self):
        rid = PublicationReleaseId.generate()
        release = PublicationRelease(
            release_id=rid,
            package_id=ContentPackageId.generate(),
            version_id=ContentVersionId.generate(),
        )
        with pytest.raises(LifecycleViolation):
            release.withdraw()


class TestPublicationManifest:
    def test_references_exact_versions(self):
        mid = PublicationManifestId.generate()
        rid = PublicationReleaseId.generate()
        vid = ContentVersionId.generate()
        manifest = PublicationManifest(
            manifest_id=mid,
            release_id=rid,
            version_id=vid,
            block_ids=("block-1", "block-2"),
            asset_version_ids=("av-1",),
        )
        assert manifest.version_id == vid
        assert len(manifest.block_ids) == 2
        assert len(manifest.asset_version_ids) == 1


# --- Learner ---


class TestLearnerProfile:
    def test_creation(self):
        lid = LearnerId.generate()
        profile = LearnerProfile(learner_id=lid, display_name="Alice")
        assert profile.id == lid
        assert profile.display_name == "Alice"


class TestLearnerSession:
    def test_references_content_version(self):
        sid = LearnerSessionId.generate()
        lid = LearnerId.generate()
        vid = ContentVersionId.generate()
        session = LearnerSession(session_id=sid, learner_id=lid, version_id=vid)
        assert session.version_id == vid
        assert session.learner_id == lid


class TestLearnerBookmark:
    def test_references_content_version(self):
        lid = LearnerId.generate()
        vid = ContentVersionId.generate()
        bookmark = LearnerBookmark(
            bookmark_id=LearnerId.generate(),
            learner_id=lid,
            version_id=vid,
            label="important",
        )
        assert bookmark.version_id == vid


# --- Laboratories ---


class TestLaboratoryRun:
    def test_references_exact_spec_version(self):
        rid = LaboratoryRunId.generate()
        sid = LaboratorySpecId.generate()
        run = LaboratoryRun(
            run_id=rid,
            spec_id=sid,
            spec_version="1.0.0",
        )
        assert run.spec_id == sid
        assert run.spec_version == "1.0.0"

    def test_invalid_start_transition(self):
        run = LaboratoryRun(
            run_id=LaboratoryRunId.generate(),
            spec_id=LaboratorySpecId.generate(),
            spec_version="1.0.0",
            status=LaboratoryRunStatus.RUNNING,
        )
        with pytest.raises(InvariantViolation, match="Cannot start"):
            run.start()

    def test_complete_from_running(self):
        run = LaboratoryRun(
            run_id=LaboratoryRunId.generate(),
            spec_id=LaboratorySpecId.generate(),
            spec_version="1.0.0",
            status=LaboratoryRunStatus.RUNNING,
        )
        run.complete({"output": "data"})
        assert run.status == LaboratoryRunStatus.COMPLETED
        assert run.outputs == {"output": "data"}


# --- Assessments ---


class TestAssessmentAttempt:
    def test_references_exact_spec_version(self):
        aid = AssessmentAttemptId.generate()
        sid = AssessmentSpecId.generate()
        attempt = AssessmentAttempt(
            attempt_id=aid,
            spec_id=sid,
            spec_version="2.0.0",
        )
        assert attempt.spec_id == sid
        assert attempt.spec_version == "2.0.0"

    def test_submit(self):
        attempt = AssessmentAttempt(
            attempt_id=AssessmentAttemptId.generate(),
            spec_id=AssessmentSpecId.generate(),
            spec_version="1.0.0",
        )
        attempt.submit()
        assert attempt.status == AssessmentAttemptStatus.SUBMITTED

    def test_submit_non_in_progress_fails(self):
        attempt = AssessmentAttempt(
            attempt_id=AssessmentAttemptId.generate(),
            spec_id=AssessmentSpecId.generate(),
            spec_version="1.0.0",
            status=AssessmentAttemptStatus.SUBMITTED,
        )
        with pytest.raises(InvariantViolation, match="Cannot submit"):
            attempt.submit()

    def test_score_after_submit(self):
        attempt = AssessmentAttempt(
            attempt_id=AssessmentAttemptId.generate(),
            spec_id=AssessmentSpecId.generate(),
            spec_version="1.0.0",
        )
        attempt.submit()
        attempt.apply_score(95.0)
        assert attempt.score_value == 95.0
        assert attempt.status == AssessmentAttemptStatus.SCORED


# --- Synchronization ---


class TestSynchronizationRecord:
    def test_creation(self):
        rid = SynchronizationRecordId.generate()
        rec = SynchronizationRecord(
            record_id=rid,
            source_system="obsidian",
            target_system="backend",
            domain_object_id="obj-1",
            domain_object_version="v1",
            direction=SyncDirection.PUSH,
        )
        assert rec.source_system == "obsidian"
        assert rec.direction == SyncDirection.PUSH


# --- Operations ---


class TestOperationalIncident:
    def test_creation(self):
        inc = OperationalIncident(
            incident_id="inc-1",
            severity=IncidentSeverity.HIGH,
            description="Service down",
        )
        assert inc.severity == IncidentSeverity.HIGH


class TestOutboxEvent:
    def test_lifecycle(self):
        eid = OutboxEventId.generate()
        event = OutboxEvent(
            event_id=eid,
            event_type="ContentPublished",
            aggregate_type="ContentVersion",
            aggregate_id="v1",
        )
        assert event.status == OutboxEventStatus.PENDING
        event.mark_processing()
        assert event.status == OutboxEventStatus.PROCESSING
        assert event.attempt_count == 1
        event.mark_published()
        assert event.status == OutboxEventStatus.PUBLISHED
        assert event.published_at is not None

    def test_retryable_failure(self):
        event = OutboxEvent(
            event_id=OutboxEventId.generate(),
            event_type="test",
            aggregate_type="test",
            aggregate_id="1",
        )
        event.mark_retryable_failure("timeout")
        assert event.status == OutboxEventStatus.RETRYABLE_FAILURE
        assert event.last_error == "timeout"

    def test_dead_letter(self):
        event = OutboxEvent(
            event_id=OutboxEventId.generate(),
            event_type="test",
            aggregate_type="test",
            aggregate_id="1",
        )
        event.mark_dead_letter("permanent failure")
        assert event.status == OutboxEventStatus.DEAD_LETTER
