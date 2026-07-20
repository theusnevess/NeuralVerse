"""Temporal workflow boundary for Stage 15 human review and publication."""

from __future__ import annotations

from datetime import timedelta
from typing import Any

try:  # pragma: no cover - exercised by disposable Temporal certification
    from temporalio import activity, workflow
    from temporalio.common import RetryPolicy

    TEMPORAL_SDK_AVAILABLE = True
except ImportError:  # pragma: no cover
    TEMPORAL_SDK_AVAILABLE = False


if TEMPORAL_SDK_AVAILABLE:

    @activity.defn(name="stage15-persist-review-event")
    async def persist_review_event(command: dict[str, Any]) -> dict[str, Any]:
        return {"status": "RECORDED", "event_id": command["event_id"]}

    @activity.defn(name="stage15-publication-transaction")
    async def execute_publication_transaction(command: dict[str, Any]) -> dict[str, Any]:
        if not command.get("authorized"):
            raise ValueError("publication authorization missing")
        return {"status": "COMMITTED", "release_id": command["release_id"]}

    @workflow.defn(name="Stage15ReviewPublicationWorkflow")
    class Stage15ReviewPublicationWorkflow:
        def __init__(self) -> None:
            self._state = "REVIEW_REQUESTED"
            self._review_complete = False
            self._final_decision: str | None = None
            self._cancelled = False

        @workflow.run
        async def run(self, command: dict[str, Any]) -> dict[str, Any]:
            self._state = "REVIEWING"
            await workflow.execute_activity(
                persist_review_event,
                {"event_id": command["event_id"]},
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=3),
            )
            await workflow.wait_condition(lambda: self._review_complete or self._cancelled)
            if self._cancelled:
                self._state = "CANCELLED"
                return {"status": self._state}
            self._state = "AWAITING_FINAL_AUTHORIZATION"
            await workflow.wait_condition(
                lambda: self._final_decision is not None or self._cancelled
            )
            if self._cancelled:
                self._state = "CANCELLED"
                return {"status": self._state}
            if self._final_decision != "AUTHORIZE_PUBLICATION":
                self._state = "REVISION_REQUIRED"
                return {"status": self._state, "decision": self._final_decision}
            self._state = "PUBLISHING"
            result = await workflow.execute_activity(
                execute_publication_transaction,
                {"authorized": True, "release_id": command["release_id"]},
                start_to_close_timeout=timedelta(seconds=30),
                retry_policy=RetryPolicy(maximum_attempts=2),
            )
            self._state = "PUBLISHED"
            return {"status": self._state, "publication": result}

        @workflow.signal
        async def submit_review(self) -> None:
            self._review_complete = True

        @workflow.signal
        async def authorize_publication(self) -> None:
            self._final_decision = "AUTHORIZE_PUBLICATION"

        @workflow.signal
        async def require_revision(self) -> None:
            self._final_decision = "REQUIRE_REVISION"

        @workflow.signal
        async def cancel(self) -> None:
            self._cancelled = True

        @workflow.query
        def state(self) -> str:
            return self._state

else:

    class Stage15ReviewPublicationWorkflow:  # type: ignore[no-redef]
        """Marker exposed when the optional Temporal SDK is unavailable."""

    async def persist_review_event(command: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")

    async def execute_publication_transaction(command: dict[str, Any]) -> dict[str, Any]:
        raise RuntimeError("TEMPORAL_SDK_UNAVAILABLE")
