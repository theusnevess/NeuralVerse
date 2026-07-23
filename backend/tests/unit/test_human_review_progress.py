from __future__ import annotations

from typing import Any

import pytest

from neuralverse_backend.bip_m4.canonical_workflow import (
    GenerateLessonLearningPackageWorkflow,
    HumanReviewDecision,
    WorkflowInput,
)


def workflow_input() -> WorkflowInput:
    return WorkflowInput(
        workflow_input_version="1.0.0",
        generation_job_id="generation:1",
        content_package_id="package:1",
        curriculum_node_id="module:1",
        request_correlation_id="correlation:1",
        request_fingerprint="fingerprint:1",
        requested_package_type="lesson",
        required_contract_versions={},
        workflow_policy_version="1.0.0",
        activity_policy_version="1.0.0",
        generation_request_reference={},
        maximum_revision_cycles=1,
        overall_deadline_seconds=3600,
        publication_wait_timeout_seconds=60,
    )


@pytest.mark.asyncio
async def test_review_received_owns_next_sequence_after_projection_sequence_22(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    workflow = GenerateLessonLearningPackageWorkflow()
    workflow._generation_job_id = "generation:1"
    workflow._sequence = 21
    workflow._review = HumanReviewDecision(
        command_id="review-command:1",
        generation_job_id="generation:1",
        governance_review_id="governance-review:1",
        decision="APPROVED",
        reviewer_identity_reference="reviewer:1",
        rationale="accepted",
        expected_workflow_revision=0,
        received_at="2026-07-20T00:00:00+00:00",
    )
    emitted: list[dict[str, Any]] = []

    async def persist_event(_input: WorkflowInput, event_type: str, **_: Any) -> None:
        emitted.append({"event_type": event_type, "sequence": workflow._sequence})

    async def resume_wait(_predicate: Any) -> None:
        return None

    monkeypatch.setattr(workflow, "_emit_progress", persist_event)
    monkeypatch.setattr(
        "neuralverse_backend.bip_m4.canonical_workflow.workflow.wait_condition",
        resume_wait,
    )

    result = await workflow._review_gate(workflow_input())

    assert result is None
    assert emitted == [
        {"event_type": "review.required", "sequence": 22},
        {"event_type": "review.received", "sequence": 23},
    ]
    assert [event["sequence"] for event in emitted].count(22) == 1
    assert emitted[-1]["sequence"] == 23


@pytest.mark.asyncio
async def test_next_stage_event_follows_review_received_without_reuse(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    workflow = GenerateLessonLearningPackageWorkflow()
    workflow._sequence = 23
    emitted: list[dict[str, Any]] = []

    async def persist_event(_input: WorkflowInput, event_type: str, **_: Any) -> None:
        emitted.append({"event_type": event_type, "sequence": workflow._sequence})

    monkeypatch.setattr(workflow, "_emit_progress", persist_event)

    workflow._state = "COMPILING_LEARNING_PACKAGE"
    workflow._stage = "COMPILING_LEARNING_PACKAGE"
    workflow._pending_action(None)
    await workflow._emit_progress(workflow_input(), "stage.entered")

    assert emitted == [{"event_type": "stage.entered", "sequence": 24}]
    assert emitted[0]["sequence"] == 23 + 1
