"""Optional Temporal registrations for governed synchronization.

Only immutable command data crosses this boundary. Vault I/O remains an
activity concern, keeping workflow replay deterministic and allowing the
existing worker host to provide persistence and authorization.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Any

try:  # pragma: no cover - exercised by the disposable Temporal certification
    from temporalio import activity, workflow
    from temporalio.common import RetryPolicy

    TEMPORAL_SDK_AVAILABLE = True
except ImportError:  # pragma: no cover
    TEMPORAL_SDK_AVAILABLE = False


if TEMPORAL_SDK_AVAILABLE:

    @activity.defn(name="stage14-obsidian-dry-run")
    async def stage14_obsidian_dry_run(command: dict[str, Any]) -> dict[str, Any]:
        """Return a bounded immutable dry-run result for worker certification."""
        return {
            "status": "PLAN_READY",
            "plan_id": str(command["plan_id"]),
            "write_count": 0,
            "vault_mutated": False,
        }

    @activity.defn(name="stage14-obsidian-retry-probe")
    async def stage14_obsidian_retry_probe(command: dict[str, Any]) -> dict[str, Any]:
        attempt = activity.info().attempt
        if attempt < 2:
            raise RuntimeError("STAGE14_TRANSIENT_PROBE")
        return {"status": "RETRIED", "attempt": attempt, "plan_id": command["plan_id"]}

    @workflow.defn(name="Stage14ObsidianSynchronizationWorkflow")
    class Stage14ObsidianSynchronizationWorkflow:
        def __init__(self) -> None:
            self._state = "REQUESTED"
            self._decision: str | None = None
            self._cancelled = False
            self._rollback = False

        @workflow.run
        async def run(self, command: dict[str, Any]) -> dict[str, Any]:
            self._state = "PLANNING"
            retry_result: dict[str, Any] | None = None
            if command.get("retry_probe"):
                retry_result = await workflow.execute_activity(
                    stage14_obsidian_retry_probe,
                    command,
                    start_to_close_timeout=timedelta(seconds=30),
                    retry_policy=RetryPolicy(maximum_attempts=2),
                )
            plan = await workflow.execute_activity(
                stage14_obsidian_dry_run,
                command,
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._state = "AWAITING_APPROVAL"
            await workflow.wait_condition(
                lambda: self._decision is not None or self._cancelled or self._rollback
            )
            if self._cancelled:
                self._state = "CANCELLED"
                return {"status": self._state, "plan": plan, "retry": retry_result}
            if self._rollback or self._decision == "REJECTED":
                self._state = "ROLLED_BACK"
                return {"status": self._state, "plan": plan, "retry": retry_result}
            self._state = "EXECUTING"
            result = await workflow.execute_activity(
                stage14_obsidian_dry_run,
                {**command, "approved": True},
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._state = "COMPLETED"
            return {
                "status": self._state,
                "plan": plan,
                "execution": result,
                "retry": retry_result,
            }

        @workflow.signal
        async def approve(self) -> None:
            self._decision = "APPROVED"

        @workflow.signal
        async def reject(self) -> None:
            self._decision = "REJECTED"

        @workflow.signal
        async def cancel(self) -> None:
            self._cancelled = True

        @workflow.signal
        async def rollback(self) -> None:
            self._rollback = True

        @workflow.query
        def state(self) -> str:
            return self._state

else:

    class Stage14ObsidianSynchronizationWorkflow:  # type: ignore[no-redef]
        """Marker exposed when the optional SDK is unavailable."""

    async def stage14_obsidian_dry_run(command: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")

    async def stage14_obsidian_retry_probe(command: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")
