"""SDK-neutral registration descriptors for deterministic workflow wiring."""

from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass

from neuralverse_backend.bip_m4.activities import BIPM4Activities
from neuralverse_backend.bip_m4.domain import WorkflowCommand
from neuralverse_backend.bip_m4.workflow import DurableAuthoringWorkflow


@dataclass(frozen=True, slots=True)
class WorkflowRegistration:
    workflow_type: str
    workflow_version: str
    signal_names: tuple[str, ...]
    query_names: tuple[str, ...]
    activity_names: tuple[str, ...]


AUTHORING_REGISTRATION = WorkflowRegistration(
    workflow_type="DurableAuthoringWorkflow",
    workflow_version="bip-m4-workflow:1.0.0",
    signal_names=("resolve_human_review", "request_revision", "cancel"),
    query_names=("query_state", "query_progress"),
    activity_names=(
        "execute_acp",
        "contribution_intake",
        "project_progress",
        "record_audit",
        "project_review",
        "check_readiness",
        "publish",
        "finalize",
    ),
)


def workflow_factory(command: WorkflowCommand) -> DurableAuthoringWorkflow:
    return DurableAuthoringWorkflow(command)


def activity_bindings(activities: BIPM4Activities) -> Mapping[str, Callable[..., object]]:
    return {
        "execute_acp": activities.execute_acp,
        "contribution_intake": activities.contribution_intake,
        "project_progress": activities.project_progress,
        "record_audit": activities.record_audit,
        "project_review": activities.project_review,
        "check_readiness": activities.check_readiness,
        "publish": activities.publish,
        "finalize": activities.finalize,
    }
