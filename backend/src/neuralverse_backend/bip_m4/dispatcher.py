"""Transactional M9 workflow-start and command outbox dispatcher."""

from __future__ import annotations

import asyncio
import os
from collections.abc import Callable
from dataclasses import asdict
from datetime import UTC, datetime, timedelta
from typing import Any, cast
from uuid import UUID

from sqlalchemy import select
from temporalio.client import Client

from neuralverse_backend.bip_m4.canonical_workflow import (
    WorkflowInput,
)
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.orchestration import TemporalClientGateway
from neuralverse_backend.persistence.models import (
    BIPM4WorkflowExecutionRecord,
    PublicationReleaseRecord,
    TransactionalOutboxEventRecord,
)
from neuralverse_backend.persistence.runtime import create_persistence_runtime


class M9StartDispatcher:
    def __init__(
        self,
        session_factory: Callable[[], Any],
        temporal: TemporalClientGateway,
        *,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._temporal = temporal
        self._clock = clock or (lambda: datetime.now(UTC))

    async def dispatch_once(self) -> str:
        event = self._claim()
        if event is None:
            return "IDLE"
        try:
            payload = cast(dict[str, Any], event.payload)
            if event.event_type == "publication.released":
                self._dispatch_publication(payload, event.event_id)
                return "PUBLISHED"
            if event.event_type == "bip_m4.human_review_requested":
                await self._dispatch_human_review(payload)
                self._publish(event.event_id)
                return "PUBLISHED"
            request = WorkflowInput(
                workflow_input_version="1.0.0",
                generation_job_id=str(payload["generation_job_id"]),
                content_package_id=str(payload["curriculum_identity"]),
                curriculum_node_id=str(
                    payload.get("curriculum_node_id", "module-0.mathematics.svd.image-compression")
                ),
                request_correlation_id=str(payload.get("correlation_id", "")),
                request_fingerprint=str(payload["request_fingerprint"]),
                requested_package_type=str(payload["requested_package_type"]),
                required_contract_versions={},
                workflow_policy_version=str(payload.get("workflow_policy_version", "1.0.0")),
                activity_policy_version=str(payload.get("activity_policy_version", "1.0.0")),
                generation_request_reference={
                    "generation_request_id": str(payload["generation_request_id"]),
                    "generation_job_id": str(payload["generation_job_id"]),
                    "request_version": "1.0.0",
                    "request_fingerprint": str(payload["generation_request_fingerprint"]),
                    "raw_artifact_reference": str(payload["generation_request_id"]),
                    "curriculum_node_id": str(
                        payload.get(
                            "curriculum_node_id", "module-0.mathematics.svd.image-compression"
                        )
                    ),
                    "requested_package_type": str(payload["requested_package_type"]),
                    "workflow_policy_version": str(payload.get("workflow_policy_version", "1.0.0")),
                    "activity_policy_version": str(payload.get("activity_policy_version", "1.0.0")),
                },
                maximum_revision_cycles=int(payload.get("maximum_revision_cycles", 0)),
                overall_deadline_seconds=3600,
                publication_wait_timeout_seconds=86400,
                activity_payloads=cast(
                    dict[str, dict[str, Any]], payload.get("activity_payloads", {})
                ),
            )
            run_id = await self._temporal.start_workflow(
                f"nv:generation-job:{request.generation_job_id}", asdict(request)
            )
            with self._session_factory() as session:
                execution = session.scalar(
                    select(BIPM4WorkflowExecutionRecord)
                    .where(
                        BIPM4WorkflowExecutionRecord.generation_job_id == request.generation_job_id
                    )
                    .with_for_update()
                )
                if execution is None:
                    raise RuntimeError("WORKFLOW_NOT_FOUND")
                execution.temporal_run_id = run_id
                execution.status = "RUNNING"
                execution.last_updated_at = self._clock()
                current = session.get(TransactionalOutboxEventRecord, event.event_id)
                if current is not None:
                    current.status = "PUBLISHED"
                    current.published_at = self._clock()
                session.commit()
            return "PUBLISHED"
        except Exception as error:
            self._fail(event.event_id, str(error))
            return "RETRYABLE_FAILURE"

    def _dispatch_publication(self, payload: dict[str, Any], event_id: Any) -> None:
        release_id = UUID(str(payload["release_id"]))
        with self._session_factory() as session:
            release = session.get(PublicationReleaseRecord, release_id)
            if release is None or release.status != "released":
                raise RuntimeError("PUBLICATION_RELEASE_NOT_READY")
            current = session.get(TransactionalOutboxEventRecord, event_id)
            if current is not None:
                current.status = "PUBLISHED"
                current.published_at = self._clock()
                current.last_error = None
            session.commit()

    async def _dispatch_human_review(self, payload: dict[str, Any]) -> None:
        signal_payload = {
            "command_id": str(payload["command_id"]),
            "generation_job_id": str(payload["generation_job_id"]),
            "governance_review_id": str(payload["governance_review_id"]),
            "decision": str(payload["decision"]),
            "reviewer_identity_reference": str(payload["reviewer_identity_reference"]),
            "rationale": str(payload.get("rationale", "")),
            "expected_workflow_revision": int(payload["expected_workflow_revision"]),
            "received_at": str(payload["received_at"]),
        }
        await self._temporal.signal(
            str(payload["workflow_id"]),
            "submit_human_review_decision",
            signal_payload,
        )

    def _publish(self, event_id: Any) -> None:
        with self._session_factory() as session:
            current = session.get(TransactionalOutboxEventRecord, event_id)
            if current is not None:
                current.status = "PUBLISHED"
                current.published_at = self._clock()
                current.last_error = None
            session.commit()

    def _claim(self) -> TransactionalOutboxEventRecord | None:
        with self._session_factory() as session:
            event = cast(
                TransactionalOutboxEventRecord | None,
                session.scalar(
                    select(TransactionalOutboxEventRecord)
            .where(
                TransactionalOutboxEventRecord.event_type
                .in_(
                    (
                        "bip_m4.workflow_start_requested",
                        "bip_m4.human_review_requested",
                        "publication.released",
                    )
                ),
                        TransactionalOutboxEventRecord.status.in_(("PENDING", "RETRYABLE_FAILURE")),
                        TransactionalOutboxEventRecord.available_at <= self._clock(),
                    )
                    .with_for_update(skip_locked=True)
                    .limit(1)
                ),
            )
            if event is None:
                return None
            event.status = "PROCESSING"
            event.attempt_count += 1
            session.commit()
            session.expunge(event)
            return event

    def _fail(self, event_id: Any, message: str) -> None:
        with self._session_factory() as session:
            event = session.get(TransactionalOutboxEventRecord, event_id)
            if event is None:
                return
            event.status = "RETRYABLE_FAILURE"
            event.last_error = message[:1000]
            event.available_at = self._clock() + timedelta(
                seconds=min(300, 2 ** min(event.attempt_count, 8))
            )
            session.commit()


async def run() -> None:
    settings = Settings()
    runtime = create_persistence_runtime(settings)
    if runtime.session_factory is None:
        raise RuntimeError("DATABASE_REQUIRED_FOR_M9_DISPATCHER")
    client = await Client.connect(
        os.getenv("TEMPORAL_ADDRESS", "temporal:7233"),
        namespace=os.getenv("TEMPORAL_NAMESPACE", "neuralverse"),
    )
    dispatcher = M9StartDispatcher(runtime.session_factory, TemporalClientGateway(client))
    while True:
        await dispatcher.dispatch_once()
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(run())
