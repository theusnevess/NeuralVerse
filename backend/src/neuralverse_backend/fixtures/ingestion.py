from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session, sessionmaker

from neuralverse_backend.fixtures.commands import IngestFixtureCommand
from neuralverse_backend.fixtures.errors import (
    CommandValidationError,
    DatabaseFailureKind,
    IntegrityFailure,
    classify_database_error,
)
from neuralverse_backend.fixtures.hashing import raw_payload_sha256
from neuralverse_backend.fixtures.idempotency import (
    HMAC_MESSAGE_VERSION,
    IDEMPOTENCY_SCOPE,
    OPERATION_NAME,
    HMACKeyring,
    request_fingerprint,
)
from neuralverse_backend.fixtures.preservation import MAX_RAW_PAYLOAD_BYTES, prepare_fixture_payload
from neuralverse_backend.fixtures.results import IngestFixtureResult, IngestOutcome
from neuralverse_backend.persistence.models import OperationalAuditEvent
from neuralverse_backend.persistence.repositories import (
    FixtureRecordRepository,
    IdempotencyRecordRepository,
    OperationalAuditEventRepository,
)

LOCK_DURATION = timedelta(hours=24)
RETENTION_DURATION = timedelta(days=30)


class IngestFixture:
    """Owns one application-level fixture ingestion transaction."""

    def __init__(
        self,
        session_factory: sessionmaker[Session],
        keyring: HMACKeyring,
        *,
        fixture_repository: FixtureRecordRepository | None = None,
        idempotency_repository: IdempotencyRecordRepository | None = None,
        audit_repository: OperationalAuditEventRepository | None = None,
        clock: Callable[[], datetime] | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._keyring = keyring
        self._fixture_repository = fixture_repository or FixtureRecordRepository()
        self._idempotency_repository = idempotency_repository or IdempotencyRecordRepository()
        self._audit_repository = audit_repository or OperationalAuditEventRepository()
        self._clock = clock or (lambda: datetime.now(UTC))

    def execute(self, command: IngestFixtureCommand) -> IngestFixtureResult:
        try:
            command.validate()
        except CommandValidationError as error:
            return IngestFixtureResult(
                outcome=IngestOutcome.INTERNAL_FAILURE,
                error_code=error.code,
                retryable=False,
            )

        payload_size = len(command.raw_payload)
        raw_hash = (
            None
            if payload_size > MAX_RAW_PAYLOAD_BYTES
            else raw_payload_sha256(command.raw_payload)
        )
        fingerprint = request_fingerprint(
            schema_name=command.schema_name,
            schema_version=command.schema_version,
            payload_media_type=command.payload_media_type,
            minimum_reader_version=command.minimum_reader_version,
            producer_version=command.producer_version,
            raw_payload_hash=raw_hash,
            payload_size=payload_size,
            supersedes_fixture_record_id=(
                str(command.supersedes_fixture_record_id)
                if command.supersedes_fixture_record_id is not None
                else None
            ),
        )
        key_hashes = self._keyring.digests(command.idempotency_key)
        session = self._session_factory()
        try:
            result, should_commit = self._execute_transaction(
                session,
                command,
                fingerprint=fingerprint,
                key_hashes=key_hashes,
                payload_size=payload_size,
            )
            if should_commit:
                try:
                    session.commit()
                except BaseException:
                    session.rollback()
                    return IngestFixtureResult(
                        outcome=IngestOutcome.RETRYABLE_OPERATION_FAILURE,
                        error_code="COMMIT_OUTCOME_UNKNOWN",
                        retryable=True,
                    )
            else:
                session.rollback()
            return result
        except IntegrityFailure:
            session.rollback()
            return IngestFixtureResult(
                outcome=IngestOutcome.INTERNAL_FAILURE,
                idempotency_status=None,
                error_code="FIXTURE_INGESTION_INTEGRITY_FAILURE",
                retryable=False,
            )
        except BaseException as error:
            classification = classify_database_error(error)
            session.rollback()
            if classification.kind == DatabaseFailureKind.RETRYABLE:
                return IngestFixtureResult(
                    outcome=IngestOutcome.RETRYABLE_OPERATION_FAILURE,
                    error_code=classification.error_code,
                    retryable=True,
                )
            return IngestFixtureResult(
                outcome=IngestOutcome.INTERNAL_FAILURE,
                error_code=classification.error_code,
                retryable=False,
            )
        finally:
            session.close()

    def _execute_transaction(
        self,
        session: Session,
        command: IngestFixtureCommand,
        *,
        fingerprint: str,
        key_hashes: tuple[bytes, ...],
        payload_size: int,
    ) -> tuple[IngestFixtureResult, bool]:
        now = self._clock()
        records = self._idempotency_repository.find_by_hashes(
            session,
            scope=IDEMPOTENCY_SCOPE,
            key_hashes=key_hashes,
        )
        if len(records) > 1:
            raise IntegrityFailure("multiple idempotency candidate records")
        record = records[0] if records else None
        if record is None:
            record = self._idempotency_repository.insert_initial(
                session,
                scope=IDEMPOTENCY_SCOPE,
                key_hash=self._keyring.active_digest(command.idempotency_key),
                key_hash_key_version=HMAC_MESSAGE_VERSION,
                request_fingerprint=fingerprint,
                now=now,
                lock_duration_seconds=int(LOCK_DURATION.total_seconds()),
            )
            if record is None:
                records = self._idempotency_repository.find_by_hashes(
                    session,
                    scope=IDEMPOTENCY_SCOPE,
                    key_hashes=key_hashes,
                )
                if len(records) != 1:
                    raise IntegrityFailure("idempotency acquisition race did not resolve")
                record = self._idempotency_repository.lock(session, records[0])
                if record is None:
                    raise IntegrityFailure("idempotency record disappeared during acquisition")
                return self._resolve_existing(
                    session,
                    command,
                    record,
                    fingerprint=fingerprint,
                    payload_size=payload_size,
                    now=now,
                )
            return self._execute_new(session, command, record, payload_size=payload_size, now=now)

        locked = self._idempotency_repository.lock(session, record)
        if locked is None:
            raise IntegrityFailure("idempotency record disappeared before lock")
        return self._resolve_existing(
            session, command, locked, fingerprint=fingerprint, payload_size=payload_size, now=now
        )

    def _resolve_existing(
        self,
        session: Session,
        command: IngestFixtureCommand,
        record: object,
        *,
        fingerprint: str,
        payload_size: int,
        now: datetime,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        idempotency = cast(IdempotencyRecord, record)
        if idempotency.request_fingerprint != fingerprint:
            self._add_audit(
                session,
                command,
                event_type="IDEMPOTENCY_CONFLICT",
                subject_type="IDEMPOTENCY_RECORD",
                subject_id=idempotency.idempotency_record_id,
                outcome="CONFLICT",
                metadata={"attempt_count": idempotency.attempt_count},
            )
            return (
                IngestFixtureResult(
                    outcome=IngestOutcome.IDEMPOTENCY_CONFLICT,
                    idempotency_status=idempotency.status,
                    error_code="IDEMPOTENCY_CONFLICT",
                    retryable=False,
                ),
                True,
            )
        if idempotency.status == "COMPLETED":
            return self._replay_completed(session, command, idempotency, payload_size)
        if idempotency.status == "FAILED_TERMINAL":
            return self._replay_terminal(session, command, idempotency, payload_size)
        if idempotency.status == "IN_PROGRESS":
            if now < idempotency.expires_at:
                return (
                    IngestFixtureResult(
                        outcome=IngestOutcome.IN_PROGRESS,
                        idempotency_status=idempotency.status,
                        retryable=True,
                    ),
                    False,
                )
            if idempotency.attempt_count >= 100:
                return self._terminalize(
                    session,
                    command,
                    idempotency,
                    "IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED",
                    payload_size,
                    now,
                )
            if now >= idempotency.created_at + RETENTION_DURATION:
                return self._terminalize(
                    session,
                    command,
                    idempotency,
                    "IDEMPOTENCY_RETRY_WINDOW_EXPIRED",
                    payload_size,
                    now,
                )
            self._idempotency_repository.take_over(
                idempotency, now=now, lock_duration_seconds=int(LOCK_DURATION.total_seconds())
            )
            return self._execute_payload(session, command, idempotency, payload_size, now)
        if idempotency.status == "FAILED_RETRYABLE":
            if idempotency.attempt_count >= 100:
                return self._terminalize(
                    session,
                    command,
                    idempotency,
                    "IDEMPOTENCY_ATTEMPT_LIMIT_EXCEEDED",
                    payload_size,
                    now,
                )
            if idempotency.failed_at is None or now >= idempotency.failed_at + RETENTION_DURATION:
                return self._terminalize(
                    session,
                    command,
                    idempotency,
                    "IDEMPOTENCY_RETRY_WINDOW_EXPIRED",
                    payload_size,
                    now,
                )
            self._idempotency_repository.reacquire(
                idempotency, now=now, lock_duration_seconds=int(LOCK_DURATION.total_seconds())
            )
            return self._execute_payload(session, command, idempotency, payload_size, now)
        raise IntegrityFailure("unknown idempotency status")

    def _execute_new(
        self,
        session: Session,
        command: IngestFixtureCommand,
        record: object,
        *,
        payload_size: int,
        now: datetime,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        return self._execute_payload(
            session, command, cast(IdempotencyRecord, record), payload_size, now
        )

    def _execute_payload(
        self,
        session: Session,
        command: IngestFixtureCommand,
        idempotency: object,
        payload_size: int,
        now: datetime,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        record = cast(IdempotencyRecord, idempotency)
        prepared = prepare_fixture_payload(
            raw_payload=command.raw_payload,
            schema_name=command.schema_name,
            schema_version=command.schema_version,
            minimum_reader_version=command.minimum_reader_version,
            producer_version=command.producer_version,
            payload_media_type=command.payload_media_type,
            received_at=command.occurred_at,
        )
        if not prepared.persistable:
            return self._terminalize(
                session, command, record, "PAYLOAD_TOO_LARGE", payload_size, now
            )
        fixture = prepared.to_fixture_record()
        fixture.supersedes_fixture_record_id = command.supersedes_fixture_record_id
        self._fixture_repository.add(session, fixture)
        event_type = (
            "FIXTURE_INGESTION_ACCEPTED"
            if prepared.persistable and prepared.structural_payload is not None
            else "FIXTURE_INGESTION_REJECTED"
        )
        outcome = "ACCEPTED" if event_type.endswith("ACCEPTED") else "REJECTED"
        self._add_audit(
            session,
            command,
            event_type=event_type,
            subject_type="FIXTURE_RECORD",
            subject_id=fixture.fixture_record_id,
            outcome=outcome,
            metadata={
                "validation_status": prepared.validation_status.value,
                "finding_count": len(prepared.findings),
                "payload_byte_length": payload_size,
                "schema_name": command.schema_name,
                "schema_version": command.schema_version,
                "replayed": False,
                "attempt_count": record.attempt_count,
            },
        )
        self._idempotency_repository.complete(
            record,
            fixture_record_id=fixture.fixture_record_id,
            completed_at=now,
            retention_seconds=int(RETENTION_DURATION.total_seconds()),
        )
        outcome_value = (
            IngestOutcome.CREATED
            if prepared.validation_status.value == "STRUCTURALLY_VALID"
            else IngestOutcome.STRUCTURALLY_REJECTED
        )
        return (
            IngestFixtureResult(
                outcome=outcome_value,
                fixture_record_id=fixture.fixture_record_id,
                validation_status=prepared.validation_status.value,
                idempotency_status="COMPLETED",
                finding_codes=tuple(item.code for item in prepared.findings),
            ),
            True,
        )

    def _terminalize(
        self,
        session: Session,
        command: IngestFixtureCommand,
        record: object,
        error_code: str,
        payload_size: int,
        now: datetime,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        idempotency = cast(IdempotencyRecord, record)
        self._idempotency_repository.terminalize(
            idempotency,
            error_code=error_code,
            failed_at=now,
            retention_seconds=int(RETENTION_DURATION.total_seconds()),
        )
        self._add_audit(
            session,
            command,
            event_type="FIXTURE_INGESTION_REJECTED",
            subject_type="IDEMPOTENCY_RECORD",
            subject_id=idempotency.idempotency_record_id,
            outcome="REJECTED",
            metadata={
                "payload_byte_length": payload_size,
                "replayed": False,
                "attempt_count": idempotency.attempt_count,
                "error_code": error_code,
            },
        )
        return (
            IngestFixtureResult(
                outcome=IngestOutcome.FAILED_TERMINAL,
                idempotency_status="FAILED_TERMINAL",
                error_code=error_code,
                retryable=False,
            ),
            True,
        )

    def _replay_completed(
        self,
        session: Session,
        command: IngestFixtureCommand,
        record: object,
        payload_size: int,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        idempotency = cast(IdempotencyRecord, record)
        fixture_id = idempotency.response_reference_id
        fixture = (
            self._fixture_repository.get_by_id(session, fixture_id)
            if fixture_id is not None
            else None
        )
        if fixture is None:
            raise IntegrityFailure("completed idempotency record references missing fixture")
        self._add_audit(
            session,
            command,
            event_type="IDEMPOTENCY_REPLAYED",
            subject_type="IDEMPOTENCY_RECORD",
            subject_id=idempotency.idempotency_record_id,
            outcome="REPLAYED",
            metadata={
                "payload_byte_length": payload_size,
                "replayed": True,
                "attempt_count": idempotency.attempt_count,
                "error_code": idempotency.last_error_code,
            },
        )
        return (
            IngestFixtureResult(
                outcome=IngestOutcome.REPLAYED,
                fixture_record_id=fixture_id,
                validation_status=fixture.validation_status,
                replayed=True,
                idempotency_status="COMPLETED",
            ),
            True,
        )

    def _replay_terminal(
        self,
        session: Session,
        command: IngestFixtureCommand,
        record: object,
        payload_size: int,
    ) -> tuple[IngestFixtureResult, bool]:
        from neuralverse_backend.persistence.models import IdempotencyRecord

        idempotency = cast(IdempotencyRecord, record)
        self._add_audit(
            session,
            command,
            event_type="IDEMPOTENCY_REPLAYED",
            subject_type="IDEMPOTENCY_RECORD",
            subject_id=idempotency.idempotency_record_id,
            outcome="REPLAYED",
            metadata={
                "payload_byte_length": payload_size,
                "replayed": True,
                "attempt_count": idempotency.attempt_count,
            },
        )
        return (
            IngestFixtureResult(
                outcome=IngestOutcome.REPLAYED,
                replayed=True,
                idempotency_status="FAILED_TERMINAL",
                error_code=idempotency.last_error_code,
                retryable=False,
            ),
            True,
        )

    def _add_audit(
        self,
        session: Session,
        command: IngestFixtureCommand,
        *,
        event_type: str,
        subject_type: str,
        subject_id: UUID,
        outcome: str,
        metadata: dict[str, object],
    ) -> None:
        actor_type = (
            "SYSTEM_FIXTURE_ADAPTER" if subject_type == "FIXTURE_RECORD" else "SYSTEM_IDEMPOTENCY"
        )
        event = OperationalAuditEvent(
            event_type=event_type,
            actor_type=actor_type,
            subject_type=subject_type,
            subject_id=subject_id,
            operation=OPERATION_NAME,
            outcome=outcome,
            correlation_id=command.correlation_id,
            request_id=command.request_id,
            occurred_at=command.occurred_at,
            audit_metadata=metadata,
        )
        self._audit_repository.add(session, event)
