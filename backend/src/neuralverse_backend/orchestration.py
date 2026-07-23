"""Durable M9 orchestration commands and sanitized progress projections."""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
from collections.abc import AsyncIterator, Callable, Mapping
from datetime import UTC, datetime
from typing import Any, Protocol, cast
from uuid import UUID, uuid4

from sqlalchemy import select

from neuralverse_backend.bip_m4.canonical_generation_request import (
    build_generation_request,
    serialize_request,
)
from neuralverse_backend.bip_m4.canonical_workflow import (
    WORKFLOW_TASK_QUEUE,
    WORKFLOW_TYPE,
    WORKFLOW_VERSION,
)
from neuralverse_backend.persistence.models import (
    BIPM4CommandRecord,
    BIPM4GenerationJobRecord,
    BIPM4GenerationRequestRecord,
    BIPM4ProgressProjectionRecord,
    BIPM4WorkflowExecutionRecord,
    BIPM4WorkflowProgressEventRecord,
    ContentPackageRecord,
    GenerationJobRecord,
    TransactionalOutboxEventRecord,
)

MAX_HISTORY_PAGE = 100
MAX_SSE_REPLAY = 1000
SSE_IDLE_TIMEOUT_SECONDS = 60
SSE_KEEPALIVE_SECONDS = 15


class OrchestrationError(RuntimeError):
    def __init__(self, code: str, message: str, *, retryable: bool = False) -> None:
        super().__init__(message)
        self.code = code
        self.retryable = retryable


class TemporalStartGateway(Protocol):
    async def start_workflow(self, workflow_id: str, input_payload: Any) -> str | None: ...

    async def signal(self, workflow_id: str, signal_name: str, payload: dict[str, Any]) -> None: ...

    async def cancel(self, workflow_id: str) -> None: ...

    async def query_progress(self, workflow_id: str) -> Mapping[str, Any]: ...


class TemporalClientGateway:
    """Async adapter kept at the Temporal process boundary."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def start_workflow(self, workflow_id: str, input_payload: Any) -> str | None:
        from neuralverse_backend.bip_m4.canonical_workflow import (
            WORKFLOW_TASK_QUEUE,
            WORKFLOW_TYPE,
        )

        handle = await self._client.start_workflow(
            WORKFLOW_TYPE,
            input_payload,
            id=workflow_id,
            task_queue=WORKFLOW_TASK_QUEUE,
        )
        return cast(str | None, handle.result_run_id)

    async def signal(self, workflow_id: str, signal_name: str, payload: dict[str, Any]) -> None:
        await self._client.get_workflow_handle(workflow_id).signal(signal_name, payload)

    async def cancel(self, workflow_id: str) -> None:
        await self._client.get_workflow_handle(workflow_id).cancel()

    async def query_progress(self, workflow_id: str) -> Mapping[str, Any]:
        return cast(
            Mapping[str, Any],
            await self._client.get_workflow_handle(workflow_id).query("progress"),
        )


def _fingerprint(value: Mapping[str, Any]) -> str:
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode("utf-8")
    ).hexdigest()


def _bounded_activity_payloads(value: Any) -> dict[str, dict[str, Any]]:
    if not isinstance(value, Mapping):
        return {}
    result: dict[str, dict[str, Any]] = {}
    for key, payload in value.items():
        if not isinstance(key, str) or not isinstance(payload, Mapping):
            continue
        candidate = dict(payload)
        if len(json.dumps(candidate, default=str).encode("utf-8")) <= 64 * 1024:
            result[key] = candidate
    return result


def _now() -> datetime:
    return datetime.now(UTC)


class OrchestrationService:
    def __init__(
        self,
        session_factory: Callable[[], Any],
        *,
        temporal: TemporalStartGateway | None = None,
        clock: Callable[[], datetime] = _now,
    ) -> None:
        self._session_factory = session_factory
        self._temporal = temporal
        self._clock = clock

    def start(self, request: Mapping[str, Any]) -> dict[str, Any]:
        required = (
            "command_id",
            "idempotency_key",
            "curriculum_identity",
            "requested_package_type",
        )
        if any(not str(request.get(name, "")).strip() for name in required):
            raise OrchestrationError(
                "GENERATION_REQUEST_INVALID", "required generation fields are missing"
            )
        now = self._clock()
        fingerprint = _fingerprint(request)
        session = self._session_factory()
        try:
            existing = session.scalar(
                select(BIPM4CommandRecord)
                .where(
                    BIPM4CommandRecord.operation_type == "GENERATION_START",
                    BIPM4CommandRecord.idempotency_key == str(request["idempotency_key"]),
                )
                .with_for_update()
            )
            if existing is not None:
                if existing.command_fingerprint != fingerprint:
                    raise OrchestrationError(
                        "GENERATION_REQUEST_IDEMPOTENCY_CONFLICT",
                        "generation idempotency key was reused with a different request",
                    )
                snapshot = cast(dict[str, Any], existing.response_snapshot)
                snapshot["replayed"] = True
                return snapshot

            generation_job_id = str(uuid4())
            generation_request_id = uuid4()
            canonical_request = build_generation_request(
                request, generation_job_id=generation_job_id
            )
            raw_request, generation_request_fingerprint = serialize_request(canonical_request)
            workflow_id = f"nv:generation-job:{generation_job_id}"
            execution_id = f"m9:{generation_job_id}"
            response = {
                "generation_job_id": generation_job_id,
                "workflow_id": workflow_id,
                "workflow_run_id": None,
                "state": "RECEIVED",
                "stage": "RECEIVED",
                "progress_sequence": 1,
                "progress_url": f"/orchestration/v1/generation-jobs/{generation_job_id}",
                "history_url": f"/orchestration/v1/generation-jobs/{generation_job_id}/history",
                "sse_url": f"/orchestration/v1/generation-jobs/{generation_job_id}/events",
                "request_correlation_id": str(request.get("correlation_id", "")),
                "generation_request_id": str(generation_request_id),
                "generation_request_fingerprint": generation_request_fingerprint,
                "replayed": False,
            }
            execution = BIPM4WorkflowExecutionRecord(
                workflow_execution_id=execution_id,
                temporal_workflow_id=workflow_id,
                temporal_run_id=None,
                workflow_type=str(request.get("workflow_type", WORKFLOW_TYPE)),
                workflow_version=str(request.get("workflow_version", WORKFLOW_VERSION)),
                task_queue=WORKFLOW_TASK_QUEUE,
                namespace=str(request.get("namespace", "neuralverse")),
                package_id=str(request["curriculum_identity"]),
                generation_job_id=generation_job_id,
                command_id=str(request["command_id"]),
                idempotency_key=str(request["idempotency_key"]),
                request_id=str(request.get("request_id", request["command_id"])),
                correlation_id=str(request.get("correlation_id", "")),
                status="RECEIVED",
                state={"request_fingerprint": fingerprint},
                started_at=now,
                last_updated_at=now,
            )
            job = BIPM4GenerationJobRecord(
                generation_job_id=generation_job_id,
                workflow_execution_id=execution_id,
                package_id=str(request["curriculum_identity"]),
                command_id=str(request["command_id"]),
                requested_by=str(request.get("actor_identity", "unknown")),
                requested_target=str(request["curriculum_identity"]),
                status="RECEIVED",
                max_revisions=int(request.get("maximum_revision_cycles", 0)),
                publication_status="NOT_REQUESTED",
                attempt_summary={},
                created_at=now,
                updated_at=now,
            )
            generation_request = BIPM4GenerationRequestRecord(
                generation_request_id=generation_request_id,
                generation_job_id=generation_job_id,
                request_version=str(canonical_request["request_version"]),
                request_fingerprint=generation_request_fingerprint,
                raw_json_bytes=raw_request,
                semantic_payload=canonical_request,
                curriculum_node_id=str(canonical_request["curriculum_node_id"]),
                requested_package_type=str(canonical_request["requested_package_type"]),
                workflow_policy_version=str(canonical_request["workflow_policy_version"]),
                activity_policy_version=str(canonical_request["activity_policy_version"]),
                created_at=now,
            )
            canonical_job = self._canonical_job_if_available(
                session,
                generation_job_id=generation_job_id,
                package_id=str(request["curriculum_identity"]),
                requested_operation=str(request["requested_package_type"]),
                workflow_id=workflow_id,
                now=now,
            )
            projection = BIPM4ProgressProjectionRecord(
                workflow_execution_id=execution_id,
                generation_job_id=generation_job_id,
                workflow_id=workflow_id,
                workflow_type=execution.workflow_type,
                workflow_version=execution.workflow_version,
                state="RECEIVED",
                current_stage="RECEIVED",
                progress_sequence=1,
                maximum_revision_cycles=job.max_revisions,
                completed_stages=[],
                active_stages=[],
                latest_artifact_references=[],
                latest_validation_summary={},
                latest_governance_summary={},
                started_at=now,
                updated_at=now,
            )
            command = BIPM4CommandRecord(
                operation_type="GENERATION_START",
                command_id=str(request["command_id"]),
                idempotency_key=str(request["idempotency_key"]),
                command_fingerprint=fingerprint,
                workflow_execution_id=execution_id,
                generation_job_id=generation_job_id,
                response_snapshot=response,
                created_at=now,
            )
            event = self._event(
                generation_job_id,
                workflow_id,
                1,
                "workflow.started",
                "RECEIVED",
                "RECEIVED",
                request,
                now,
            )
            outbox = TransactionalOutboxEventRecord(
                event_type="bip_m4.workflow_start_requested",
                aggregate_type="GENERATION_JOB",
                aggregate_id=generation_job_id,
                payload={
                    "workflow_id": workflow_id,
                    "generation_job_id": generation_job_id,
                    "request_fingerprint": fingerprint,
                    "generation_request_id": str(generation_request_id),
                    "generation_request_fingerprint": generation_request_fingerprint,
                    "curriculum_identity": str(request["curriculum_identity"]),
                    "curriculum_node_id": str(canonical_request["curriculum_node_id"]),
                    "requested_package_type": str(request["requested_package_type"]),
                    "workflow_policy_version": str(request.get("workflow_policy_version", "1.0.0")),
                    "activity_policy_version": str(request.get("activity_policy_version", "1.0.0")),
                    "maximum_revision_cycles": job.max_revisions,
                    "correlation_id": str(request.get("correlation_id", "")),
                },
                status="PENDING",
                available_at=now,
                created_at=now,
            )
            records = [execution, job, generation_request, projection, command, event, outbox]
            if canonical_job is not None:
                records.append(canonical_job)
            session.add_all(records)
            session.commit()
            return response
        except OrchestrationError:
            session.rollback()
            raise
        except Exception as error:
            session.rollback()
            raise OrchestrationError(
                "WORKFLOW_START_FAILURE",
                "generation command could not be persisted",
                retryable=True,
            ) from error
        finally:
            session.close()

    async def dispatch_start(
        self, generation_job_id: str, input_payload: dict[str, Any]
    ) -> str | None:
        if self._temporal is None:
            raise OrchestrationError(
                "WORKFLOW_START_FAILURE", "Temporal start gateway is unavailable", retryable=True
            )
        workflow_id = f"nv:generation-job:{generation_job_id}"
        run_id = await self._temporal.start_workflow(workflow_id, input_payload)
        session = self._session_factory()
        try:
            execution = session.scalar(
                select(BIPM4WorkflowExecutionRecord)
                .where(BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id)
                .with_for_update()
            )
            if execution is None:
                raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
            execution.temporal_run_id = run_id
            execution.status = "RUNNING"
            execution.last_updated_at = self._clock()
            session.commit()
            return run_id
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    @staticmethod
    def _canonical_job_if_available(
        session: Any,
        *,
        generation_job_id: str,
        package_id: str,
        requested_operation: str,
        workflow_id: str,
        now: Any,
    ) -> GenerationJobRecord | None:
        try:
            generation_uuid = UUID(generation_job_id)
            package_uuid = UUID(package_id)
        except ValueError:
            return None
        if not hasattr(session, "get") or session.get(ContentPackageRecord, package_uuid) is None:
            return None
        if session.get(GenerationJobRecord, generation_uuid) is not None:
            return None
        return GenerationJobRecord(
            generation_job_id=generation_uuid,
            target_content_package_id=package_uuid,
            workflow_id=workflow_id,
            status="in_progress",
            requested_operation=requested_operation,
            created_at=now,
            updated_at=now,
        )

    def persist_progress(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        generation_job_id = str(payload.get("generation_job_id", ""))
        sequence = int(payload.get("progress_sequence", 0))
        if not generation_job_id or sequence < 1:
            raise OrchestrationError(
                "PROGRESS_PROJECTION_FAILURE", "progress identity is invalid", retryable=True
            )
        session = self._session_factory()
        try:
            execution = session.scalar(
                select(BIPM4WorkflowExecutionRecord)
                .where(BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id)
                .with_for_update()
            )
            if execution is None:
                raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
            projection = session.get(BIPM4ProgressProjectionRecord, execution.workflow_execution_id)
            if projection is None:
                raise OrchestrationError(
                    "PROGRESS_PROJECTION_FAILURE", "progress projection is missing", retryable=True
                )
            if sequence < projection.progress_sequence:
                return {"status": "IGNORED", "progress_sequence": projection.progress_sequence}
            event_payload = dict(payload)
            fingerprint = _fingerprint(event_payload)
            existing = session.scalar(
                select(BIPM4WorkflowProgressEventRecord).where(
                    BIPM4WorkflowProgressEventRecord.generation_job_id == generation_job_id,
                    BIPM4WorkflowProgressEventRecord.sequence == sequence,
                )
            )
            if existing is not None:
                if cast(dict[str, Any], existing.event_metadata).get("fingerprint") != fingerprint:
                    raise OrchestrationError(
                        "PROGRESS_SEQUENCE_CONFLICT", "progress sequence has a different payload"
                    )
                session.rollback()
                return {"status": "REPLAYED", "progress_sequence": sequence}
            if sequence != projection.progress_sequence + 1:
                raise OrchestrationError(
                    "PROGRESS_SEQUENCE_CONFLICT", "progress sequence is not monotonic"
                )
            now = self._clock()
            projection.state = str(payload.get("state", projection.state))
            projection.current_stage = str(payload.get("stage", projection.current_stage))
            projection.revision = int(payload.get("revision_cycle", projection.revision))
            projection.progress_sequence = sequence
            projection.completed_stages = list(payload.get("completed_stages", []))[:128]
            projection.active_stages = list(payload.get("active_stages", []))[:32]
            projection.pending_human_action = cast(str | None, payload.get("pending_human_action"))
            projection.latest_artifact_references = list(payload.get("artifact_references", []))[
                :128
            ]
            projection.latest_validation_summary = dict(payload.get("validation_summary", {}))
            projection.latest_governance_summary = dict(payload.get("governance_summary", {}))
            projection.failure_code = cast(str | None, payload.get("failure_code"))
            projection.failure_retryable = bool(payload.get("failure_retryable", False))
            projection.updated_at = now
            event = self._event(
                generation_job_id,
                execution.temporal_workflow_id,
                sequence,
                str(payload.get("event_type", "workflow.progressed")),
                projection.state,
                projection.current_stage,
                payload,
                now,
            )
            session.add(event)
            session.commit()
            return {"status": "PROJECTED", "progress_sequence": sequence}
        except OrchestrationError:
            session.rollback()
            raise
        except Exception as error:
            session.rollback()
            raise OrchestrationError(
                "PROGRESS_PROJECTION_FAILURE", "progress projection failed", retryable=True
            ) from error
        finally:
            session.close()

    def status(self, generation_job_id: str) -> dict[str, Any]:
        session = self._session_factory()
        try:
            execution = session.scalar(
                select(BIPM4WorkflowExecutionRecord).where(
                    BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id
                )
            )
            projection = session.scalar(
                select(BIPM4ProgressProjectionRecord).where(
                    BIPM4ProgressProjectionRecord.generation_job_id == generation_job_id
                )
            )
            if execution is None or projection is None:
                raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
            return self._status_payload(execution, projection)
        finally:
            session.close()

    def history(
        self, generation_job_id: str, *, after_sequence: int = 0, limit: int = 50
    ) -> list[dict[str, Any]]:
        limit = min(max(limit, 1), MAX_HISTORY_PAGE)
        session = self._session_factory()
        try:
            events = session.scalars(
                select(BIPM4WorkflowProgressEventRecord)
                .where(
                    BIPM4WorkflowProgressEventRecord.generation_job_id == generation_job_id,
                    BIPM4WorkflowProgressEventRecord.sequence > after_sequence,
                )
                .order_by(BIPM4WorkflowProgressEventRecord.sequence)
                .limit(limit)
            ).all()
            if (
                not events
                and session.scalar(
                    select(BIPM4WorkflowExecutionRecord).where(
                        BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id
                    )
                )
                is None
            ):
                raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
            return [self._event_payload(event) for event in events]
        finally:
            session.close()

    def replay_bounds(self, generation_job_id: str) -> tuple[int, int]:
        session = self._session_factory()
        try:
            rows = session.execute(
                select(
                    BIPM4WorkflowProgressEventRecord.sequence,
                )
                .where(BIPM4WorkflowProgressEventRecord.generation_job_id == generation_job_id)
                .order_by(BIPM4WorkflowProgressEventRecord.sequence)
            ).all()
            if not rows:
                if (
                    session.scalar(
                        select(BIPM4WorkflowExecutionRecord).where(
                            BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id
                        )
                    )
                    is None
                ):
                    raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
                return 0, 0
            values = [int(row[0]) for row in rows]
            return values[0], values[-1]
        finally:
            session.close()

    async def reconcile(self, generation_job_id: str) -> dict[str, Any]:
        """Repair a lagging projection from Temporal's bounded workflow query."""
        current = self.status(generation_job_id)
        if self._temporal is None:
            return {"status": "UNCHANGED", "projection": current}
        progress = await self._temporal.query_progress(current["workflow_id"])
        sequence = int(progress.get("progress_sequence", current["progress_sequence"]))
        if sequence <= int(current["progress_sequence"]):
            return {"status": "UNCHANGED", "projection": current}
        self.persist_progress(
            {
                "generation_job_id": generation_job_id,
                "workflow_run_id": current["workflow_run_id"],
                "progress_sequence": sequence,
                "state": progress.get("state", current["state"]),
                "stage": progress.get("stage", current["stage"]),
                "event_type": "workflow.reconciled",
                "revision_cycle": progress.get("revision_cycle", current["revision_cycle"]),
                "completed_stages": progress.get("completed_stages", []),
                "active_stages": progress.get("active_stages", []),
                "artifact_references": progress.get("artifacts", []),
                "correlation_id": current.get("generation_job_id"),
            }
        )
        return {"status": "RECONCILED", "projection": self.status(generation_job_id)}

    async def stream(
        self, generation_job_id: str, after_sequence: int = 0
    ) -> AsyncIterator[dict[str, Any]]:
        sent = after_sequence
        emitted = 0
        started = time.monotonic()
        last_keepalive = started
        while emitted < MAX_SSE_REPLAY:
            events = self.history(
                generation_job_id, after_sequence=sent, limit=min(100, MAX_SSE_REPLAY - emitted)
            )
            if events:
                for event in events:
                    sent = int(event["sequence"])
                    emitted += 1
                    yield event
                continue
            now = time.monotonic()
            if now - started >= SSE_IDLE_TIMEOUT_SECONDS:
                return
            if now - last_keepalive >= SSE_KEEPALIVE_SECONDS:
                last_keepalive = now
                yield {"keepalive": True}
            await asyncio.sleep(0.5)

    async def command(
        self, operation: str, generation_job_id: str, payload: Mapping[str, Any]
    ) -> dict[str, Any]:
        session = self._session_factory()
        replay_snapshot: dict[str, Any] | None = None
        replay_workflow_id: str | None = None
        replay_command_id: str | None = None
        try:
            execution = session.scalar(
                select(BIPM4WorkflowExecutionRecord).where(
                    BIPM4WorkflowExecutionRecord.generation_job_id == generation_job_id
                )
            )
            if execution is None:
                raise OrchestrationError("WORKFLOW_NOT_FOUND", "generation job does not exist")
            projection = session.get(BIPM4ProgressProjectionRecord, execution.workflow_execution_id)
            key = str(payload.get("idempotency_key", ""))
            if not key:
                raise OrchestrationError(
                    f"{operation}_COMMAND_INVALID", "idempotency_key is required"
                )
            fingerprint = _fingerprint(payload)
            record = session.scalar(
                select(BIPM4CommandRecord)
                .where(
                    BIPM4CommandRecord.operation_type == operation,
                    BIPM4CommandRecord.idempotency_key == key,
                )
                .with_for_update()
            )
            if record is not None:
                if record.command_fingerprint != fingerprint:
                    raise OrchestrationError(
                        "COMMAND_IDEMPOTENCY_CONFLICT",
                        "command key was reused with a different payload",
                    )
                snapshot = cast(dict[str, Any], record.response_snapshot)
                if snapshot.get("status") in {
                    "WORKFLOW_ACKNOWLEDGED",
                    "PUBLICATION_COMMITTED",
                }:
                    session.rollback()
                    return snapshot
                if snapshot.get("status") == "SIGNAL_DELIVERED":
                    replay_snapshot = snapshot
                    replay_workflow_id = execution.temporal_workflow_id
                    replay_command_id = str(payload.get("command_id", record.command_id))
                    session.rollback()
            if replay_snapshot is None:
                if (
                    "expected_workflow_revision" in payload
                    and projection is not None
                    and int(payload["expected_workflow_revision"]) != projection.revision
                ):
                    raise OrchestrationError(
                        "WORKFLOW_REVISION_CONFLICT", "workflow revision does not match the command"
                    )
                required_state = {
                    "HUMAN_REVIEW": "AWAITING_HUMAN_REVIEW",
                    "REVISION_DIRECTIVE": "AWAITING_REVISION_DIRECTIVE",
                    "PUBLICATION_COMMAND": "AWAITING_PUBLICATION_COMMAND",
                }.get(operation)
                if required_state is not None and projection is not None:
                    if projection.state != required_state:
                        raise OrchestrationError(
                            "WORKFLOW_STATE_CONFLICT",
                            f"{operation} is not valid while workflow is {projection.state}",
                        )
                command_values: dict[str, Any] = {
                    "operation_type": operation,
                    "command_id": str(payload.get("command_id", "")),
                    "idempotency_key": key,
                    "command_fingerprint": fingerprint,
                    "workflow_execution_id": execution.workflow_execution_id,
                    "generation_job_id": generation_job_id,
                    "response_snapshot": {
                        "status": "COMMAND_ACCEPTED",
                        "command_id": str(payload.get("command_id", "")),
                        "workflow_id": execution.temporal_workflow_id,
                    },
                    "created_at": self._clock(),
                }
                # ``command_payload`` belongs to the later recovery branch.  The
                # Stage 16 workflow remains runnable against the canonical BIP-M4
                # schema where that optional projection is not present yet.
                if hasattr(BIPM4CommandRecord, "command_payload"):
                    command_values["command_payload"] = dict(payload)
                if record is None:
                    record = BIPM4CommandRecord(**command_values)
                    session.add(record)
                if operation == "HUMAN_REVIEW":
                    session.add(
                        TransactionalOutboxEventRecord(
                            event_type="bip_m4.human_review_requested",
                            aggregate_type="GENERATION_JOB",
                            aggregate_id=generation_job_id,
                            payload={
                                "event_version": "1.0",
                                "workflow_id": execution.temporal_workflow_id,
                                "generation_job_id": generation_job_id,
                                "command_id": str(payload["command_id"]),
                                "governance_review_id": str(payload["governance_review_id"]),
                                "decision": str(payload["decision"]),
                                "reviewer_identity_reference": str(
                                    payload["reviewer_identity_reference"]
                                ),
                                "rationale": str(payload.get("rationale", "")),
                                "expected_workflow_revision": int(
                                    payload["expected_workflow_revision"]
                                ),
                                "received_at": self._clock().isoformat(),
                                "correlation_id": str(payload.get("correlation_id", "")),
                            },
                            status="PENDING",
                            available_at=self._clock(),
                            created_at=self._clock(),
                        )
                    )
                session.commit()
        except OrchestrationError:
            session.rollback()
            raise
        finally:
            session.close()
        if replay_snapshot is not None:
            if self._temporal is not None and replay_workflow_id is not None:
                response = dict(replay_snapshot)
                try:
                    observed = await self._temporal.query_progress(replay_workflow_id)
                    observed_state = str(observed.get("state", ""))
                    response["workflow_state"] = observed_state
                    if observed_state in {"PUBLISHED", "PUBLICATION_COMPLETED"}:
                        response["status"] = "PUBLICATION_COMMITTED"
                    elif observed_state == "READY_FOR_PUBLICATION":
                        response["status"] = "WORKFLOW_ACKNOWLEDGED"
                    elif observed_state == "AWAITING_REVISION_DIRECTIVE":
                        await self._temporal.signal(
                            replay_workflow_id,
                            "apply_revision_directive",
                            self._temporal_signal_payload(
                                "REVISION_DIRECTIVE",
                                payload,
                                generation_job_id,
                                execution,
                            ),
                        )
                except Exception:
                    pass
                if replay_command_id is not None:
                    self._update_command_snapshot(replay_command_id, response)
                return response
            return replay_snapshot
        if self._temporal is not None and operation != "HUMAN_REVIEW":
            signal = {
                "REVISION_DIRECTIVE": "apply_revision_directive",
                "PUBLICATION_COMMAND": "submit_publication_command",
            }.get(operation)
            if operation == "CANCEL":
                await self._temporal.cancel(execution.temporal_workflow_id)
            elif signal is not None:
                try:
                    signal_payload = self._temporal_signal_payload(
                        operation, payload, generation_job_id, execution
                    )
                    await self._temporal.signal(
                        execution.temporal_workflow_id, signal, signal_payload
                    )
                except Exception as error:
                    raise OrchestrationError(
                        "WORKFLOW_SIGNAL_DELIVERY_FAILED",
                        "Temporal signal delivery failed; command remains retryable",
                        retryable=True,
                    ) from error
                response = {
                    "status": "SIGNAL_DELIVERED",
                    "command_id": str(payload.get("command_id", "")),
                    "workflow_id": execution.temporal_workflow_id,
                }
                try:
                    observed = await self._temporal.query_progress(
                        execution.temporal_workflow_id
                    )
                    observed_state = str(observed.get("state", ""))
                    response["workflow_state"] = observed_state
                    if observed_state in {
                        "PUBLISHED",
                        "PUBLICATION_COMPLETED",
                    }:
                        response["status"] = "PUBLICATION_COMMITTED"
                    elif observed_state == "READY_FOR_PUBLICATION":
                        response["status"] = "WORKFLOW_ACKNOWLEDGED"
                except Exception:
                    response["workflow_state"] = "UNKNOWN"
                self._update_command_snapshot(str(payload["command_id"]), response)
                return response
        return {
            "status": "COMMAND_ACCEPTED",
            "command_id": str(payload.get("command_id", "")),
            "workflow_id": execution.temporal_workflow_id,
        }

    def _temporal_signal_payload(
        self,
        operation: str,
        payload: Mapping[str, Any],
        generation_job_id: str,
        execution: BIPM4WorkflowExecutionRecord,
    ) -> dict[str, Any]:
        if operation == "REVISION_DIRECTIVE":
            targets = [str(value) for value in payload.get("affected_targets", [])]
            required_changes = [str(value) for value in payload.get("required_changes", [])]
            return {
                "revision_directive_id": str(payload["revision_directive_id"]),
                "target": targets[0],
                "required_changes": required_changes,
                "reason": str(payload.get("reason") or "; ".join(required_changes)),
                "revision_cycle": int(payload["expected_workflow_revision"]) + 1,
            }
        signal_payload = dict(payload)
        if operation == "PUBLICATION_COMMAND":
            signal_payload.update(
                {
                    "generation_job_id": generation_job_id,
                    "target_content_package_id": str(execution.package_id),
                    "actor_identity": str(payload.get("actor_identity_reference", "")),
                    "issued_at": self._clock().isoformat(),
                }
            )
        return signal_payload

    def _update_command_snapshot(self, command_id: str, snapshot: Mapping[str, Any]) -> None:
        session = self._session_factory()
        try:
            record = session.scalar(
                select(BIPM4CommandRecord).where(BIPM4CommandRecord.command_id == command_id)
            )
            if record is not None:
                record.response_snapshot = dict(snapshot)
                session.commit()
        finally:
            session.close()

    def _event(
        self,
        generation_job_id: str,
        workflow_id: str,
        sequence: int,
        event_type: str,
        state: str,
        stage: str,
        payload: Mapping[str, Any],
        now: datetime,
    ) -> BIPM4WorkflowProgressEventRecord:
        metadata = {"fingerprint": _fingerprint(payload), "status": str(payload.get("status", ""))}
        return BIPM4WorkflowProgressEventRecord(
            generation_job_id=generation_job_id,
            workflow_id=workflow_id,
            workflow_run_id=cast(str | None, payload.get("workflow_run_id")),
            sequence=sequence,
            event_type=event_type,
            workflow_state=state,
            workflow_stage=stage,
            activity_name=cast(str | None, payload.get("activity_name")),
            revision_cycle=int(payload.get("revision_cycle", 0)),
            artifact_references=list(payload.get("artifact_references", []))[:128],
            event_metadata=metadata,
            correlation_id=cast(str | None, payload.get("correlation_id")),
            occurred_at=now,
        )

    @staticmethod
    def _event_payload(event: BIPM4WorkflowProgressEventRecord) -> dict[str, Any]:
        metadata = dict(cast(dict[str, Any], event.event_metadata))
        metadata.pop("fingerprint", None)
        return {
            "generation_job_id": event.generation_job_id,
            "workflow_id": event.workflow_id,
            "workflow_run_id": event.workflow_run_id,
            "sequence": event.sequence,
            "event_type": event.event_type,
            "state": event.workflow_state,
            "stage": event.workflow_stage,
            "activity_name": event.activity_name,
            "revision_cycle": event.revision_cycle,
            "artifact_references": event.artifact_references,
            "metadata": metadata,
            "correlation_id": event.correlation_id,
            "occurred_at": event.occurred_at.isoformat(),
        }

    @staticmethod
    def _status_payload(
        execution: BIPM4WorkflowExecutionRecord, projection: BIPM4ProgressProjectionRecord
    ) -> dict[str, Any]:
        return {
            "generation_job_id": execution.generation_job_id,
            "workflow_id": execution.temporal_workflow_id,
            "workflow_run_id": execution.temporal_run_id,
            "state": projection.state,
            "stage": projection.current_stage,
            "progress_sequence": projection.progress_sequence,
            "completed_stages": projection.completed_stages,
            "active_stages": projection.active_stages,
            "pending_action": projection.pending_human_action,
            "revision_cycle": projection.revision,
            "maximum_revision_cycles": projection.maximum_revision_cycles,
            "artifact_references": projection.latest_artifact_references,
            "validation_summary": projection.latest_validation_summary,
            "governance_summary": projection.latest_governance_summary,
            "failure_summary": {
                "code": projection.failure_code,
                "retryable": projection.failure_retryable,
            }
            if projection.failure_code
            else None,
            "started_at": projection.started_at.isoformat() if projection.started_at else None,
            "updated_at": projection.updated_at.isoformat(),
            "completed_at": projection.completed_at.isoformat()
            if projection.completed_at
            else None,
        }


def sse_line(event: Mapping[str, Any]) -> str:
    data = json.dumps(event, separators=(",", ":"), default=str)
    return f"id: {event['sequence']}\nevent: {event['event_type']}\ndata: {data}\n\n"
