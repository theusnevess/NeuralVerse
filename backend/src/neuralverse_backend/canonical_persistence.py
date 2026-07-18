from __future__ import annotations

import hashlib
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from typing import Any, cast
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from neuralverse_backend.canonical_input import CanonicalIntake
from neuralverse_backend.persistence.models import (
    AuthoringJobRecord,
    CanonicalInputRecord,
    CanonicalIntakeIdempotencyRecord,
    TransactionalOutboxEventRecord,
)

OPERATION = "canonical_input.accept"
OUTBOX_EVENT_TYPE = "canonical_input.accepted"


def _workflow_id_for_job(authoring_job_id: UUID) -> str:
    return f"authoring-job:{authoring_job_id}"


class PersistenceFailureCode:
    PERSISTENCE_FAILURE = "PERSISTENCE_FAILURE"
    IDEMPOTENCY_CONFLICT = "IDEMPOTENCY_CONFLICT"


@dataclass(frozen=True, slots=True)
class CanonicalPersistenceFailure:
    code: str
    message: str


@dataclass(frozen=True, slots=True)
class CanonicalPersistenceResponse:
    canonical_input_id: UUID
    authoring_job_id: UUID
    artifact_fingerprint: str
    contract_name: str
    contract_version: str
    persistence_status: str
    workflow_dispatch_status: str
    idempotency_status: str
    replayed: bool = False


@dataclass(frozen=True, slots=True)
class CanonicalPersistenceResult:
    response: CanonicalPersistenceResponse | None = None
    failure: CanonicalPersistenceFailure | None = None

    @property
    def accepted(self) -> bool:
        return self.response is not None and self.failure is None


class CanonicalPersistenceService:
    def __init__(
        self,
        session_factory: Callable[[], Any],
        *,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._clock = clock or (lambda: datetime.now(UTC))

    def accept(
        self,
        intake: CanonicalIntake,
        *,
        idempotency_key: str,
        authoring_job_id: UUID | None = None,
    ) -> CanonicalPersistenceResult:
        if not 1 <= len(idempotency_key) <= 255:
            return CanonicalPersistenceResult(
                failure=CanonicalPersistenceFailure(
                    PersistenceFailureCode.PERSISTENCE_FAILURE,
                    "Idempotency-Key is invalid.",
                )
            )
        now = self._clock()
        key_hash = hashlib.sha256(idempotency_key.encode("utf-8")).digest()
        request_hash = hashlib.sha256(intake.raw_canonical_json).hexdigest()
        session = self._session_factory()
        try:
            existing = session.scalar(
                select(CanonicalIntakeIdempotencyRecord)
                .where(CanonicalIntakeIdempotencyRecord.idempotency_key_hash == key_hash)
                .with_for_update()
            )
            if existing is not None:
                if existing.request_hash != request_hash:
                    session.rollback()
                    return CanonicalPersistenceResult(
                        failure=CanonicalPersistenceFailure(
                            PersistenceFailureCode.IDEMPOTENCY_CONFLICT,
                            "Idempotency-Key was already used for different canonical input.",
                        )
                    )
                snapshot = cast(dict[str, Any], existing.response_snapshot)
                session.rollback()
                return CanonicalPersistenceResult(
                    response=_response_from_snapshot(snapshot, replayed=True)
                )

            package_id = _package_id(intake.canonical_artifact)
            job = _find_job(session, authoring_job_id=authoring_job_id, package_id=package_id)
            if job is None:
                job = AuthoringJobRecord(
                    authoring_job_id=uuid4(),
                    package_id=package_id,
                    workflow_id="",
                    status="INPUTS_AVAILABLE",
                    current_revision=0,
                    lock_version=0,
                    created_at=now,
                    updated_at=now,
                )
                job.workflow_id = _workflow_id_for_job(job.authoring_job_id)
                job.received_contracts = []
                job.canonical_input_ids = []
                job.artifact_fingerprints = []
            canonical = CanonicalInputRecord(
                canonical_input_id=uuid4(),
                contract_name=intake.contract_name,
                contract_version=intake.contract_version,
                minimum_reader_version=intake.minimum_reader_version,
                producer_version=intake.producer_version,
                release_tag=intake.release_identity.tag,
                release_commit=intake.release_identity.commit,
                schema_hash=intake.schema_hash,
                artifact_fingerprint=intake.artifact_sha256,
                raw_json_bytes=intake.raw_canonical_json,
                raw_json_sha256=hashlib.sha256(intake.raw_canonical_json).hexdigest(),
                parsed_canonical_json=intake.raw_canonical_json.decode("utf-8"),
                structural_semantic_payload=_json_compatible(intake.canonical_artifact),
                unknown_compatible_fields={},
                authoring_job_id=job.authoring_job_id,
                received_at=intake.received_at,
                created_at=now,
            )
            received_contracts = list(cast(list[str], job.received_contracts or []))
            input_ids = list(cast(list[str], job.canonical_input_ids or []))
            fingerprints = list(cast(list[str], job.artifact_fingerprints or []))
            if intake.contract_name not in received_contracts:
                received_contracts.append(intake.contract_name)
            input_ids.append(str(canonical.canonical_input_id))
            fingerprints.append(intake.artifact_sha256)
            job.received_contracts = received_contracts
            job.canonical_input_ids = input_ids
            job.artifact_fingerprints = fingerprints
            job.status = (
                "READY_FOR_AUTHORING" if len(set(received_contracts)) == 4 else "INPUTS_AVAILABLE"
            )
            job.current_revision += 1
            job.lock_version += 1
            job.updated_at = now
            event = TransactionalOutboxEventRecord(
                event_id=uuid4(),
                event_type=OUTBOX_EVENT_TYPE,
                aggregate_type="AUTHORING_JOB",
                aggregate_id=str(job.authoring_job_id),
                payload={
                    "authoring_job_id": str(job.authoring_job_id),
                    "canonical_input_id": str(canonical.canonical_input_id),
                    "contract_name": intake.contract_name,
                    "contract_version": intake.contract_version,
                    "artifact_fingerprint": intake.artifact_sha256,
                },
                status="PENDING",
                available_at=now,
                created_at=now,
            )
            response = CanonicalPersistenceResponse(
                canonical_input_id=canonical.canonical_input_id,
                authoring_job_id=job.authoring_job_id,
                artifact_fingerprint=intake.artifact_sha256,
                contract_name=intake.contract_name,
                contract_version=intake.contract_version,
                persistence_status="PERSISTED_PENDING_DISPATCH",
                workflow_dispatch_status="PERSISTED_PENDING_DISPATCH",
                idempotency_status="COMPLETED",
            )
            idem = CanonicalIntakeIdempotencyRecord(
                idempotency_record_id=uuid4(),
                idempotency_key_hash=key_hash,
                operation=OPERATION,
                request_hash=request_hash,
                canonical_input_id=canonical.canonical_input_id,
                authoring_job_id=job.authoring_job_id,
                response_snapshot=_snapshot(response),
                created_at=now,
                expires_at=now + timedelta(days=30),
            )
            session.add_all([job, canonical, event, idem])
            session.commit()
            return CanonicalPersistenceResult(response=response)
        except IntegrityError:
            session.rollback()
            existing = session.scalar(
                select(CanonicalIntakeIdempotencyRecord).where(
                    CanonicalIntakeIdempotencyRecord.idempotency_key_hash == key_hash
                )
            )
            if existing is not None and existing.request_hash == request_hash:
                snapshot = cast(dict[str, Any], existing.response_snapshot)
                session.rollback()
                return CanonicalPersistenceResult(
                    response=_response_from_snapshot(snapshot, replayed=True)
                )
            return CanonicalPersistenceResult(
                failure=CanonicalPersistenceFailure(
                    PersistenceFailureCode.IDEMPOTENCY_CONFLICT,
                    "Canonical intake idempotency conflict.",
                )
            )
        except Exception:
            session.rollback()
            return CanonicalPersistenceResult(
                failure=CanonicalPersistenceFailure(
                    PersistenceFailureCode.PERSISTENCE_FAILURE,
                    "Canonical intake persistence failed.",
                )
            )
        finally:
            session.close()


def _package_id(artifact: dict[str, Any] | Any) -> str | None:
    value = artifact.get("packageId") if isinstance(artifact, dict) else None
    return value if isinstance(value, str) else None


def _find_job(
    session: Any, *, authoring_job_id: UUID | None, package_id: str | None
) -> AuthoringJobRecord | None:
    if authoring_job_id is not None:
        return cast(
            AuthoringJobRecord | None,
            session.scalar(
                select(AuthoringJobRecord)
                .where(AuthoringJobRecord.authoring_job_id == authoring_job_id)
                .with_for_update()
            ),
        )
    if package_id is None:
        return None
    return cast(
        AuthoringJobRecord | None,
        session.scalar(
            select(AuthoringJobRecord)
            .where(
                AuthoringJobRecord.package_id == package_id,
                AuthoringJobRecord.status.not_in(("CANCELLED", "FAILED")),
            )
            .order_by(AuthoringJobRecord.created_at)
            .with_for_update()
            .limit(1)
        ),
    )


def _snapshot(response: CanonicalPersistenceResponse) -> dict[str, Any]:
    return {
        "canonical_input_id": str(response.canonical_input_id),
        "authoring_job_id": str(response.authoring_job_id),
        "artifact_fingerprint": response.artifact_fingerprint,
        "contract_name": response.contract_name,
        "contract_version": response.contract_version,
        "persistence_status": response.persistence_status,
        "workflow_dispatch_status": response.workflow_dispatch_status,
        "idempotency_status": response.idempotency_status,
    }


def _response_from_snapshot(
    snapshot: dict[str, Any], *, replayed: bool
) -> CanonicalPersistenceResponse:
    return CanonicalPersistenceResponse(
        canonical_input_id=UUID(snapshot["canonical_input_id"]),
        authoring_job_id=UUID(snapshot["authoring_job_id"]),
        artifact_fingerprint=snapshot["artifact_fingerprint"],
        contract_name=snapshot["contract_name"],
        contract_version=snapshot["contract_version"],
        persistence_status=snapshot["persistence_status"],
        workflow_dispatch_status=snapshot["workflow_dispatch_status"],
        idempotency_status=snapshot["idempotency_status"],
        replayed=replayed,
    )


def _json_compatible(value: Any) -> Any:
    """Preserve opaque lexical values without asking JSONB to coerce them."""
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): _json_compatible(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_compatible(item) for item in value]
    return value
