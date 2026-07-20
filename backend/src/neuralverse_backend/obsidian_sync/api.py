"""Internal governance API for the Stage 14 synchronization engine.

The API is deliberately not mounted as a learner-facing HTTP surface. The
existing Backend authorization layer can bind these commands to a trusted
actor and a vault scope without exposing canonical-vault mutation publicly.
"""

from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

from .core import (
    ConflictResolution,
    EditorialCorrectionProposal,
    NoteIdentity,
    NoteProjection,
    Orphan,
    SynchronizationAcknowledgement,
    SynchronizationApproval,
    SynchronizationEngine,
    SynchronizationPlan,
    SynchronizationWorkflow,
)


@dataclass(slots=True)
class SynchronizationAPI:
    engine: SynchronizationEngine

    def create_plan(self, projections: Iterable[NoteProjection]) -> SynchronizationPlan:
        return self.engine.dry_run(projections)

    def read_plan(self, plan_id: str) -> SynchronizationPlan:
        try:
            return self.engine.plans[plan_id]
        except KeyError as exc:
            raise KeyError(f"unknown synchronization plan: {plan_id}") from exc

    def approve_plan(self, plan_id: str, actor: str) -> SynchronizationApproval:
        return self.engine.approve(self.read_plan(plan_id), actor)

    def execute_plan(self, plan_id: str, approval: SynchronizationApproval) -> SynchronizationPlan:
        return self.engine.execute(self.read_plan(plan_id), approval)

    def retry_plan(self, plan_id: str, approval: SynchronizationApproval) -> SynchronizationPlan:
        return self.engine.retry(self.read_plan(plan_id), approval)

    def cancel_plan(self, plan_id: str, actor: str = "system") -> None:
        workflow = SynchronizationWorkflow(self.engine, self.read_plan(plan_id))
        workflow.cancel(actor)

    def rollback_plan(self, plan_id: str) -> None:
        self.engine.rollback(self.read_plan(plan_id))

    def resolve_conflict(
        self,
        plan_id: str,
        operation_id: str,
        resolution: ConflictResolution,
        actor: str,
        reason: str,
        *,
        merged_projection: NoteProjection | None = None,
    ) -> SynchronizationAcknowledgement:
        plan = self.read_plan(plan_id)
        return self.engine.resolve_conflict(
            plan,
            operation_id,
            resolution,
            actor,
            reason,
            merged_projection=merged_projection,
        )

    def list_orphans(self, known: set[str]) -> list[Orphan]:
        return self.engine.orphans(known)

    def audit_events(self, plan_id: str) -> tuple[object, ...]:
        return tuple(event for event in self.engine.audit if event.plan_id == plan_id)

    def create_editorial_proposal(
        self, identity: NoteIdentity, path: str
    ) -> EditorialCorrectionProposal:
        return self.engine.editorial_proposal(identity, path)
