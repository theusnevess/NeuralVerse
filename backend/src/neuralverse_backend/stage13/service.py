"""Application-facing Stage 13 service boundary.

HTTP and Temporal adapters can depend on this service without importing a
container runtime or embedding semantic ACP rules.  The service accepts only
stable execution references and delegates all validation to the registry and
verifier contracts.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

from .assessment import AssessmentExecution, verify_assessment
from .persistence import Stage13InMemoryStore
from .portfolio import build_portfolio_export
from .runtime import ExecutionRequest, LaboratoryResult
from .workflow import ExecuteLaboratoryRunWorkflow


@dataclass(slots=True)
class Stage13ExecutionService:
    workflow: ExecuteLaboratoryRunWorkflow
    assessment_registry: Any
    store: Stage13InMemoryStore

    def submit_laboratory(self, request: ExecutionRequest) -> LaboratoryResult:
        result = self.workflow.run(request)
        self.store.save_run(result)
        return result

    def cancel_laboratory(self, run_id: str) -> None:
        self.workflow.cancel(run_id)

    def replay_laboratory(self, run_id: str, replay_run_id: str, reason: str) -> LaboratoryResult:
        result = self.workflow.replay(run_id, replay_run_id, reason)
        self.store.save_run(result)
        return result

    def export_laboratory(
        self,
        result: LaboratoryResult,
        *,
        learner_notes: str = "",
        learner_conclusion: str = "",
        artifacts: Mapping[str, bytes] | None = None,
    ) -> bytes:
        return build_portfolio_export(
            result,
            learner_notes=learner_notes,
            learner_conclusion=learner_conclusion,
            artifacts=artifacts,
        )

    def verify_assessment(self, **kwargs: Any) -> AssessmentExecution:
        return verify_assessment(self.assessment_registry, **kwargs)
