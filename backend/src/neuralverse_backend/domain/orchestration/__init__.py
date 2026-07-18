"""Orchestration domain context."""

from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING

from ..shared.entity import Entity
from ..shared.errors import InvariantViolation
from ..shared.identifiers import WorkflowId

if TYPE_CHECKING:
    pass


class WorkflowStateType(Enum):
    INITIATED = "initiated"
    RUNNING = "running"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WorkflowReference(Entity):
    """Reference to an external workflow (e.g., Temporal)."""

    def __init__(
        self, *, workflow_id: WorkflowId, workflow_type: str, external_reference: str = ""
    ) -> None:
        super().__init__(id=workflow_id)
        self.workflow_type = workflow_type
        self.external_reference = external_reference


class WorkflowState(Entity):
    """Current state of a workflow."""

    def __init__(
        self,
        *,
        workflow_id: WorkflowId,
        state: WorkflowStateType = WorkflowStateType.INITIATED,
        input_data: dict | None = None,
    ) -> None:
        super().__init__(id=workflow_id)
        self.state = state
        self.input_data = input_data or {}

    def transition(self, target: WorkflowStateType) -> None:
        allowed = {
            WorkflowStateType.INITIATED: {
                WorkflowStateType.RUNNING,
                WorkflowStateType.FAILED,
                WorkflowStateType.CANCELLED,
            },
            WorkflowStateType.RUNNING: {
                WorkflowStateType.WAITING,
                WorkflowStateType.COMPLETED,
                WorkflowStateType.FAILED,
                WorkflowStateType.CANCELLED,
            },
            WorkflowStateType.WAITING: {
                WorkflowStateType.RUNNING,
                WorkflowStateType.COMPLETED,
                WorkflowStateType.FAILED,
                WorkflowStateType.CANCELLED,
            },
        }
        if target not in allowed.get(self.state, set()):
            raise InvariantViolation(
                f"Invalid transition from {self.state.value} to {target.value}",
                invariant="valid_workflow_transition",
            )
        self.state = target


class WorkflowInputReference(Entity):
    """Reference to workflow input data."""

    def __init__(self, *, reference_id: str, input_type: str, data: dict | None = None) -> None:
        super().__init__(id=reference_id)
        self.input_type = input_type
        self.data = data or {}
