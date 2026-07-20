import pytest

from neuralverse_backend.stage15 import (
    FinalPublicationDecisionKind,
    FindingSeverity,
    FindingStatus,
    HumanReviewBundle,
    HumanReviewRequirementsPolicy,
    PublicationHandoffIntake,
    PublishLearningPackageCommand,
    ReviewDecision,
    ReviewDiscipline,
    ReviewError,
    ReviewFinding,
)


def handoff() -> PublicationHandoffIntake:
    return PublicationHandoffIntake.from_mapping(
        {
            "publicationHandoffId": "handoff:stage15",
            "handoffVersion": "1.0.0",
            "packageId": "package:cnn",
            "packageVersion": "1.0.0",
            "draftId": "draft:cnn",
            "draftVersion": "1.0.0",
            "draftSemanticHash": "draft-hash",
            "publicationReadinessRecommendationId": "readiness:cnn",
            "publicationReadinessRecommendationHash": "readiness-hash",
            "sourceSnapshotHash": "source-hash",
            "assetSnapshotHash": "asset-hash",
            "laboratorySnapshotHash": "lab-hash",
            "assessmentSnapshotHash": "assessment-hash",
            "publicationTarget": "canonical",
            "unknownCompatibleField": {"preserved": True},
        }
    )


def test_review_bundle_requires_all_disciplines_and_final_human_decision() -> None:
    policy = HumanReviewRequirementsPolicy()
    bundle = HumanReviewBundle.create(
        handoff(),
        policy,
        required_disciplines=(ReviewDiscipline.EDITORIAL, ReviewDiscipline.FINAL_AUTHORIZATION),
    )
    for discipline in bundle.required_disciplines:
        bundle.assign(discipline, f"{discipline.value.lower()}@test", "unused", "owner")
    for discipline in bundle.required_disciplines:
        role = (
            "FINAL_PUBLICATION_AUTHORIZER"
            if discipline is ReviewDiscipline.FINAL_AUTHORIZATION
            else f"{discipline.value}_REVIEWER"
        )
        reviewer = f"{discipline.value.lower()}@test"
        bundle.submit(
            discipline,
            reviewer=reviewer,
            reviewer_role=role,
            decision=ReviewDecision.APPROVED,
            rationale="reviewed exact candidate",
        )
    decision = bundle.final_decision(
        decision=FinalPublicationDecisionKind.AUTHORIZE_PUBLICATION,
        actor="publisher@test",
        actor_role="FINAL_PUBLICATION_AUTHORIZER",
        readiness_recommendation="READY_FOR_PUBLICATION",
        readiness_id="readiness:cnn",
        readiness_hash="readiness-hash",
        rationale="all required disciplines approved",
    )
    assert decision.p0_count == decision.p1_count == decision.unknown_count == 0
    assert decision.candidate_fingerprint == bundle.candidate_fingerprint


def test_blocking_finding_and_stale_review_are_rejected() -> None:
    policy = HumanReviewRequirementsPolicy(freshness_days=1)
    bundle = HumanReviewBundle.create(
        handoff(), policy, required_disciplines=(ReviewDiscipline.EDITORIAL,)
    )
    bundle.assign(ReviewDiscipline.EDITORIAL, "editor@test", "EDITORIAL_REVIEWER", "owner")
    finding = ReviewFinding(
        "finding:p0", ReviewDiscipline.EDITORIAL, FindingSeverity.P0, "accuracy", "wrong result"
    )
    record = bundle.submit(
        ReviewDiscipline.EDITORIAL,
        reviewer="editor@test",
        reviewer_role="EDITORIAL_REVIEWER",
        decision=ReviewDecision.CHANGES_REQUIRED,
        findings=(finding,),
        rationale="revision required",
    )
    assert record.findings[0].blocks_publication
    assert finding.resolve("corrected in candidate").status is FindingStatus.RESOLVED
    with pytest.raises(ReviewError):
        bundle.final_decision(
            decision=FinalPublicationDecisionKind.AUTHORIZE_PUBLICATION,
            actor="publisher@test",
            actor_role="FINAL_PUBLICATION_AUTHORIZER",
            readiness_recommendation="READY_FOR_PUBLICATION",
            readiness_id="readiness:cnn",
            readiness_hash="readiness-hash",
            rationale="not safe",
        )


def test_command_requires_operator_and_preserves_handoff_identity() -> None:
    command = PublishLearningPackageCommand.create(
        package_id="package:cnn",
        draft_id="draft:cnn",
        draft_version="1.0.0",
        draft_hash="draft-hash",
        readiness_id="readiness:cnn",
        handoff_id="handoff:stage15",
        review_bundle_id="review-bundle:one",
        final_decision_id="publication-decision:one",
        publication_target="canonical",
        actor_id="publisher@test",
        actor_roles=("PUBLICATION_OPERATOR",),
        idempotency_key="publish:stage15:one",
    )
    command.validate()
    assert command.request_hash
    with pytest.raises(ReviewError):
        PublishLearningPackageCommand.create(
            package_id="package:cnn",
            draft_id="draft:cnn",
            draft_version="1.0.0",
            draft_hash="draft-hash",
            readiness_id="readiness:cnn",
            handoff_id="handoff:stage15",
            review_bundle_id="review-bundle:one",
            final_decision_id="publication-decision:one",
            publication_target="canonical",
            actor_id="agent",
            actor_roles=(),
            idempotency_key="publish:stage15:two",
        ).validate()
