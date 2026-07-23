"""Optional Temporal SDK registrations for BIP-M4.

The repository remains importable without temporalio.  When the SDK is
installed at the process edge, these definitions provide the actual
deterministic workflow and activity registration used by the worker host.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Any

try:  # pragma: no cover - exercised only by the Temporal certification job
    from temporalio import activity, workflow
    from temporalio.common import (
        RetryPolicy as TemporalRetryPolicy,
    )

    TEMPORAL_SDK_AVAILABLE = True
except ImportError:  # pragma: no cover - normal unit-test environment
    TEMPORAL_SDK_AVAILABLE = False


if TEMPORAL_SDK_AVAILABLE:

    @activity.defn(name="bip-m4-durable-pass-through")
    async def durable_pass_through(payload: dict[str, Any]) -> dict[str, Any]:
        """Operational activity used for adapter and retry certification."""
        return {"status": "ACCEPTED", "payload": payload}

    @activity.defn(name="bip-m4-retry-once")
    async def retry_once(payload: dict[str, Any]) -> dict[str, Any]:
        """Deterministic transient-failure probe for retry certification."""
        del payload
        attempts = activity.info().attempt
        if attempts < 2:
            raise RuntimeError("BIP_M4_TRANSIENT_PROBE")
        return {"status": "RETRIED", "attempts": attempts}

    @workflow.defn(name="BIPM4DurableAuthoringWorkflow")
    class BIPM4DurableAuthoringWorkflow:
        def __init__(self) -> None:
            self._cancelled = False
            self._review_decision: str | None = None
            self._progress = "ACCEPTED"

        @workflow.run
        async def run(self, command: dict[str, Any]) -> dict[str, Any]:
            self._progress = "RUNNING"
            if command.get("retry_probe"):
                result = await workflow.execute_activity(
                    retry_once,
                    command,
                    start_to_close_timeout=timedelta(seconds=30),
                    retry_policy=TemporalRetryPolicy(maximum_attempts=2),
                )
            else:
                result = await workflow.execute_activity(
                    durable_pass_through,
                    command,
                    start_to_close_timeout=timedelta(seconds=30),
                    retry_policy=TemporalRetryPolicy(maximum_attempts=3),
                )
            if self._cancelled:
                return {"status": "CANCELLED", "command_id": command["command_id"]}
            self._progress = "WAITING_FOR_REVIEW"
            await workflow.wait_condition(
                lambda: self._review_decision is not None or self._cancelled
            )
            if self._cancelled:
                return {"status": "CANCELLED", "command_id": command["command_id"]}
            self._progress = "COMPLETED"
            return {"status": "COMPLETED", "command_id": command["command_id"], "activity": result}

        @workflow.signal
        async def resolve_review(self, decision: str) -> None:
            if decision not in {"APPROVED", "REJECTED"}:
                raise ValueError("invalid review decision")
            self._review_decision = decision

        @workflow.signal
        async def cancel(self) -> None:
            self._cancelled = True

        @workflow.query
        def progress(self) -> str:
            return self._progress

else:

    class BIPM4DurableAuthoringWorkflow:  # type: ignore[no-redef]
        """Marker exposed when the optional SDK is unavailable."""

    async def durable_pass_through(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")

    async def retry_once(payload: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")
