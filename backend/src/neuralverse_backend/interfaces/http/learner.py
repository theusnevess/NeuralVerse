"""BIP-M7 learner-state API.

The router resolves a trusted local learner context and never accepts a
learner identifier from a public request body.  The service is deliberately
versioned around exact content-version identifiers and uses the existing
canonical error envelope.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import UTC, datetime
from typing import Any, cast

from fastapi import APIRouter, Header, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from neuralverse_backend.interfaces.http.errors import ApplicationError
from neuralverse_backend.persistence.models.assessments import AssessmentAttemptRecord
from neuralverse_backend.persistence.models.content import ContentVersionRecord
from neuralverse_backend.persistence.models.laboratories import LaboratoryRunRecord
from neuralverse_backend.persistence.models.learner import (
    LearnerBookmarkRecord,
    LearnerCollectionRecord,
    LearnerCollectionVersionRecord,
    LearnerHighlightRecord,
    LearnerNoteRecord,
    LearnerProfileRecord,
    LearnerProgressRecord,
    LearnerSessionRecord,
)
from neuralverse_backend.persistence.models.learner_state import (
    LearnerCommandIdempotencyRecord,
    LearnerDeletionAuditRecord,
    LearnerDeletionJobRecord,
    LearnerFeedbackRecord,
    LearnerNoteConflictRecord,
    LearnerNoteRevisionRecord,
    LearnerPreferenceRecord,
    LearnerStateConflictRecord,
    LearnerStateExportRecord,
    LearnerStateImportRecord,
)

router = APIRouter(prefix="/api/v1/learner", tags=["learner-state"])
EXPORT_SCHEMA = "learner-state-export:1.0.0"
LOCAL_LEARNER_ID = uuid.uuid5(uuid.NAMESPACE_URL, "https://neuralverse.local/learner")


class _StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ProgressBody(_StrictModel):
    progress: float = Field(ge=0, le=1)
    completed: bool = False
    position: int | None = Field(default=None, ge=0)


class NoteBody(_StrictModel):
    text: str = Field(min_length=1, max_length=100_000)


class SessionBody(_StrictModel):
    content_version_id: str | None = None
    release_id: str | None = Field(default=None, max_length=255)
    block_id: str | None = Field(default=None, max_length=255)
    continuity: dict[str, Any] = Field(default_factory=dict)


class LaboratoryBody(_StrictModel):
    laboratory_spec_id: str
    laboratory_spec_version: str = Field(min_length=1, max_length=64)
    content_version_id: str
    inputs: dict[str, Any] = Field(default_factory=dict)
    random_seed: int | None = None
    evidence_ids: list[str] = Field(default_factory=list, max_length=128)


class AssessmentBody(_StrictModel):
    assessment_spec_id: str
    assessment_spec_version: str = Field(min_length=1, max_length=64)
    content_version_id: str
    responses: dict[str, Any] = Field(default_factory=dict)
    evidence_ids: list[str] = Field(default_factory=list, max_length=128)


class ImportBody(_StrictModel):
    document: dict[str, Any]
    checksum: str | None = Field(default=None, min_length=64, max_length=64)
    dry_run: bool = False


def _session(request: Request) -> Session:
    runtime = getattr(request.app.state, "persistence_runtime", None)
    factory = getattr(runtime, "session_factory", None)
    if factory is None:
        raise ApplicationError(
            "STORAGE_FAILURE",
            "learner persistence is not configured",
            status_code=503,
            retryable=True,
        )
    return cast(Session, factory())


def _learner_id(request: Request) -> uuid.UUID:
    # Authentication will replace this adapter.  Until then, only trusted
    # server-side state may override the stable local identity.
    trusted = getattr(request.state, "trusted_learner_id", None)
    if trusted is None:
        trusted = getattr(request.app.state, "trusted_learner_id", None)
    try:
        return uuid.UUID(str(trusted)) if trusted is not None else LOCAL_LEARNER_ID
    except (TypeError, ValueError) as error:
        raise ApplicationError(
            "AUTHORIZATION_FAILURE", "trusted learner context is invalid", status_code=403
        ) from error


def _now() -> datetime:
    return datetime.now(UTC)


def _require_idempotency(value: str | None) -> str:
    if not value:
        raise ApplicationError(
            "PRECONDITION_REQUIRED", "Idempotency-Key is required", status_code=428
        )
    if len(value) > 255:
        raise ApplicationError("VALIDATION_ERROR", "Idempotency-Key is too long", status_code=422)
    return value


def _require_revision(value: str | None) -> int | None:
    if value is None:
        raise ApplicationError("PRECONDITION_REQUIRED", "If-Match is required", status_code=428)
    if value.strip() == "*":
        return None
    try:
        return int(value.strip('"'))
    except ValueError as error:
        raise ApplicationError(
            "VALIDATION_ERROR", "If-Match must contain a revision", status_code=422
        ) from error


def _request_hash(value: object) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode()
    return hashlib.sha256(encoded).hexdigest()


def _idempotent_lookup(
    session: Session, learner_id: uuid.UUID, scope: str, key: str, body: object
) -> dict[str, Any] | None:
    record = session.get(LearnerCommandIdempotencyRecord, (learner_id, scope, key))
    if record is None:
        return None
    if record.request_hash != _request_hash(body):
        raise ApplicationError(
            "LEARNER_IDEMPOTENCY_CONFLICT",
            "Idempotency-Key was reused with a different payload",
            status_code=409,
        )
    return cast(dict[str, Any], record.response)


def _idempotent_store(
    session: Session,
    learner_id: uuid.UUID,
    scope: str,
    key: str,
    body: object,
    response: dict[str, Any],
) -> None:
    session.add(
        LearnerCommandIdempotencyRecord(
            learner_id=learner_id,
            command_scope=scope,
            idempotency_key=key,
            request_hash=_request_hash(body),
            response=response,
            created_at=_now(),
        )
    )


def _ensure_profile(session: Session, learner_id: uuid.UUID) -> None:
    if session.get(LearnerProfileRecord, learner_id) is None:
        now = _now()
        session.add(
            LearnerProfileRecord(
                learner_id=learner_id, display_name="", created_at=now, updated_at=now
            )
        )
        session.flush()


def _version(session: Session, value: str) -> uuid.UUID:
    try:
        version_id = uuid.UUID(value)
    except ValueError as error:
        raise ApplicationError(
            "RESOURCE_NOT_FOUND", "exact content version not found", status_code=404
        ) from error
    if session.get(ContentVersionRecord, version_id) is None:
        raise ApplicationError(
            "RESOURCE_NOT_FOUND", "exact content version not found", status_code=404
        )
    return version_id


def _response(record_id: object, revision: int | None = None, **extra: Any) -> dict[str, Any]:
    result: dict[str, Any] = {
        "resource_id": str(record_id),
        "schema_version": "learner-state:1.0.0",
        "updated_at": _now().isoformat(),
        "trace_id": "request",
    }
    if revision is not None:
        result["revision"] = revision
        result["etag"] = f'"{revision}"'
    result.update(extra)
    return result


@router.get("/state")
def state(request: Request) -> dict[str, Any]:
    learner_id = _learner_id(request)
    session = _session(request)
    try:
        _ensure_profile(session, learner_id)
        progress = (
            session.execute(
                select(LearnerProgressRecord).where(LearnerProgressRecord.learner_id == learner_id)
            )
            .scalars()
            .all()
        )
        notes = (
            session.execute(
                select(LearnerNoteRecord).where(LearnerNoteRecord.learner_id == learner_id)
            )
            .scalars()
            .all()
        )
        sessions = (
            session.execute(
                select(LearnerSessionRecord)
                .where(LearnerSessionRecord.learner_id == learner_id)
                .order_by(LearnerSessionRecord.created_at.desc())
            )
            .scalars()
            .all()
        )
        preferences = (
            session.execute(
                select(LearnerPreferenceRecord).where(
                    LearnerPreferenceRecord.learner_id == learner_id
                )
            )
            .scalars()
            .all()
        )
        session.commit()
        return {
            "learner_id": str(learner_id),
            "schema_version": "learner-state:1.0.0",
            "progress": [
                {
                    "resource_id": str(x.version_id),
                    "progress": x.progress_pct,
                    "revision": x.revision,
                }
                for x in progress
            ],
            "notes": [
                {
                    "resource_id": str(x.version_id),
                    "note_id": str(x.note_id),
                    "text": x.text,
                    "revision": x.revision,
                }
                for x in notes
            ],
            "sessions": [
                {
                    "session_id": str(x.session_id),
                    "revision": x.revision,
                    "status": x.status,
                    "content_version_id": str(x.version_id) if x.version_id else None,
                }
                for x in sessions
            ],
            "preferences": [
                {
                    "key": x.preference_key,
                    "schema_version": x.schema_version,
                    "value": x.value,
                    "revision": x.revision,
                }
                for x in preferences
            ],
        }
    finally:
        session.close()


@router.get("/progress")
def get_progress(request: Request) -> dict[str, Any]:
    learner_id = _learner_id(request)
    session = _session(request)
    try:
        rows = (
            session.execute(
                select(LearnerProgressRecord)
                .where(LearnerProgressRecord.learner_id == learner_id)
                .order_by(LearnerProgressRecord.updated_at.desc())
            )
            .scalars()
            .all()
        )
        return {
            "items": [
                {
                    "resource_id": str(x.version_id),
                    "progress": x.progress_pct,
                    "completed": x.progress_pct >= 1,
                    "revision": x.revision,
                    "updated_at": x.updated_at.isoformat(),
                }
                for x in rows
            ]
        }
    finally:
        session.close()


@router.put("/progress/{resource_id}")
def put_progress(
    resource_id: str,
    body: ProgressBody,
    request: Request,
    response: Response,
    if_match: str | None = Header(default=None, alias="If-Match"),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key, expected = (
        _learner_id(request),
        _require_idempotency(idempotency_key),
        _require_revision(if_match),
    )
    session = _session(request)
    try:
        version_id = _version(session, resource_id)
        payload = body.model_dump()
        replay = _idempotent_lookup(
            session, learner_id, "progress", key, {"resource_id": resource_id, **payload}
        )
        if replay is not None:
            return replay
        _ensure_profile(session, learner_id)
        row = session.get(LearnerProgressRecord, (learner_id, version_id))
        if row is not None and expected is not None and row.revision != expected:
            session.add(
                LearnerStateConflictRecord(
                    learner_id=learner_id,
                    state_type="progress",
                    resource_id=resource_id,
                    status="open",
                    details={"expected_revision": expected, "server_revision": row.revision},
                    created_at=_now(),
                )
            )
            session.commit()
            raise ApplicationError(
                "LEARNER_STATE_CONFLICT", "progress revision conflict", status_code=409
            )
        revision = (row.revision + 1) if row else 1
        if row is None:
            row = LearnerProgressRecord(
                learner_id=learner_id,
                version_id=version_id,
                progress_pct=body.progress,
                revision=revision,
                updated_at=_now(),
            )
            session.add(row)
        else:
            row.progress_pct, row.revision, row.updated_at = body.progress, revision, _now()
        result = _response(
            version_id,
            revision,
            progress=body.progress,
            completed=body.completed or body.progress >= 1,
        )
        _idempotent_store(
            session, learner_id, "progress", key, {"resource_id": resource_id, **payload}, result
        )
        session.commit()
        response.headers["ETag"] = f'"{revision}"'
        return result
    except IntegrityError as error:
        session.rollback()
        raise ApplicationError(
            "LEARNER_RESOURCE_VERSION_MISMATCH", "resource reference is invalid", status_code=409
        ) from error
    finally:
        session.close()


@router.get("/notes/{resource_id}")
def get_note(resource_id: str, request: Request) -> dict[str, Any]:
    learner_id = _learner_id(request)
    session = _session(request)
    try:
        version_id = _version(session, resource_id)
        row = (
            session.execute(
                select(LearnerNoteRecord)
                .where(
                    LearnerNoteRecord.learner_id == learner_id,
                    LearnerNoteRecord.version_id == version_id,
                )
                .order_by(LearnerNoteRecord.created_at.desc())
            )
            .scalars()
            .first()
        )
        if row is None:
            return {
                "resource_id": resource_id,
                "text": "",
                "revision": 0,
                "schema_version": "learner-state:1.0.0",
            }
        return _response(row.note_id, row.revision, resource_id=resource_id, text=row.text)
    finally:
        session.close()


@router.put("/notes/{resource_id}")
def put_note(
    resource_id: str,
    body: NoteBody,
    request: Request,
    response: Response,
    if_match: str | None = Header(default=None, alias="If-Match"),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key, expected = (
        _learner_id(request),
        _require_idempotency(idempotency_key),
        _require_revision(if_match),
    )
    session = _session(request)
    try:
        version_id = _version(session, resource_id)
        payload = body.model_dump()
        replay = _idempotent_lookup(
            session, learner_id, "note", key, {"resource_id": resource_id, **payload}
        )
        if replay is not None:
            return replay
        _ensure_profile(session, learner_id)
        row = (
            session.execute(
                select(LearnerNoteRecord)
                .where(
                    LearnerNoteRecord.learner_id == learner_id,
                    LearnerNoteRecord.version_id == version_id,
                )
                .order_by(LearnerNoteRecord.created_at.desc())
            )
            .scalars()
            .first()
        )
        if row is not None and expected is not None and row.revision != expected:
            session.add(
                LearnerNoteConflictRecord(
                    learner_id=learner_id,
                    note_id=row.note_id,
                    client_revision=expected,
                    server_revision=row.revision,
                    client_text=body.text,
                    status="open",
                    created_at=_now(),
                )
            )
            session.commit()
            raise ApplicationError(
                "LEARNER_STATE_CONFLICT", "note revision conflict", status_code=409
            )
        revision = row.revision + 1 if row else 1
        if row is None:
            row = LearnerNoteRecord(
                note_id=uuid.uuid4(),
                learner_id=learner_id,
                version_id=version_id,
                text=body.text,
                revision=revision,
                created_at=_now(),
            )
            session.add(row)
        else:
            row.text, row.revision = body.text, revision
        session.flush()
        session.add(
            LearnerNoteRevisionRecord(
                note_id=row.note_id,
                learner_id=learner_id,
                revision=revision,
                text=body.text,
                created_at=_now(),
            )
        )
        result = _response(row.note_id, revision, resource_id=resource_id, text=body.text)
        _idempotent_store(
            session, learner_id, "note", key, {"resource_id": resource_id, **payload}, result
        )
        session.commit()
        response.headers["ETag"] = f'"{revision}"'
        return result
    finally:
        session.close()


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
def create_session(
    body: SessionBody,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        payload = body.model_dump()
        replay = _idempotent_lookup(session, learner_id, "session", key, payload)
        if replay is not None:
            return replay
        _ensure_profile(session, learner_id)
        version_id = _version(session, body.content_version_id) if body.content_version_id else None
        row = LearnerSessionRecord(
            session_id=uuid.uuid4(),
            learner_id=learner_id,
            version_id=version_id,
            revision=1,
            status="active",
            active_release_id=body.release_id,
            active_block_id=body.block_id,
            continuity_metadata=body.continuity,
            created_at=_now(),
        )
        session.add(row)
        session.flush()
        result = _response(
            row.session_id,
            1,
            status="active",
            content_version_id=body.content_version_id,
            continuity=body.continuity,
        )
        _idempotent_store(session, learner_id, "session", key, payload, result)
        session.commit()
        return result
    finally:
        session.close()


@router.patch("/sessions/{session_id}")
def patch_session(
    session_id: str,
    body: SessionBody,
    request: Request,
    response: Response,
    if_match: str | None = Header(default=None, alias="If-Match"),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key, expected = (
        _learner_id(request),
        _require_idempotency(idempotency_key),
        _require_revision(if_match),
    )
    session = _session(request)
    try:
        try:
            sid = uuid.UUID(session_id)
        except ValueError as error:
            raise ApplicationError(
                "RESOURCE_NOT_FOUND", "session not found", status_code=404
            ) from error
        payload = {"session_id": session_id, **body.model_dump()}
        replay = _idempotent_lookup(session, learner_id, "session-patch", key, payload)
        if replay is not None:
            return replay
        row = session.get(LearnerSessionRecord, sid)
        if row is None or row.learner_id != learner_id:
            raise ApplicationError("AUTHORIZATION_FAILURE", "session not found", status_code=404)
        if expected is not None and row.revision != expected:
            raise ApplicationError(
                "LEARNER_STATE_CONFLICT", "session revision conflict", status_code=409
            )
        if body.content_version_id:
            row.version_id = _version(session, body.content_version_id)
        row.active_release_id, row.active_block_id, row.continuity_metadata, row.revision = (
            body.release_id,
            body.block_id,
            body.continuity,
            row.revision + 1,
        )
        session.flush()
        result = _response(
            row.session_id, row.revision, status=row.status, continuity=row.continuity_metadata
        )
        _idempotent_store(session, learner_id, "session-patch", key, payload, result)
        session.commit()
        response.headers["ETag"] = f'"{row.revision}"'
        return result
    finally:
        session.close()


@router.post("/laboratory-runs", status_code=status.HTTP_201_CREATED)
def create_lab_run(
    body: LaboratoryBody,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        payload = body.model_dump()
        replay = _idempotent_lookup(session, learner_id, "laboratory-run", key, payload)
        if replay is not None:
            return replay
        _ensure_profile(session, learner_id)
        _version(session, body.content_version_id)
        try:
            spec_id = uuid.UUID(body.laboratory_spec_id)
        except ValueError as error:
            raise ApplicationError(
                "RESOURCE_NOT_FOUND", "laboratory specification not found", status_code=404
            ) from error
        row = LaboratoryRunRecord(
            laboratory_run_id=uuid.uuid4(),
            laboratory_spec_id=spec_id,
            laboratory_spec_version=body.laboratory_spec_version,
            learner_id=str(learner_id),
            status="pending",
            inputs=body.inputs,
            evidence_ids=body.evidence_ids,
            created_at=_now(),
        )
        session.add(row)
        session.flush()
        result = _response(
            row.laboratory_run_id,
            status="pending",
            laboratory_spec_id=body.laboratory_spec_id,
            laboratory_spec_version=body.laboratory_spec_version,
        )
        _idempotent_store(session, learner_id, "laboratory-run", key, payload, result)
        session.commit()
        return result
    finally:
        session.close()


@router.post("/assessment-attempts", status_code=status.HTTP_201_CREATED)
def create_assessment_attempt(
    body: AssessmentBody,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        payload = body.model_dump()
        replay = _idempotent_lookup(session, learner_id, "assessment-attempt", key, payload)
        if replay is not None:
            return replay
        _ensure_profile(session, learner_id)
        _version(session, body.content_version_id)
        try:
            spec_id = uuid.UUID(body.assessment_spec_id)
        except ValueError as error:
            raise ApplicationError(
                "RESOURCE_NOT_FOUND", "assessment specification not found", status_code=404
            ) from error
        row = AssessmentAttemptRecord(
            assessment_attempt_id=uuid.uuid4(),
            assessment_spec_id=spec_id,
            assessment_spec_version=body.assessment_spec_version,
            learner_id=str(learner_id),
            status="in_progress",
            responses=body.responses,
            evidence_ids=body.evidence_ids,
            created_at=_now(),
        )
        session.add(row)
        session.flush()
        result = _response(
            row.assessment_attempt_id,
            status="in_progress",
            assessment_spec_id=body.assessment_spec_id,
            assessment_spec_version=body.assessment_spec_version,
        )
        _idempotent_store(session, learner_id, "assessment-attempt", key, payload, result)
        session.commit()
        return result
    finally:
        session.close()


def _export_document(session: Session, learner_id: uuid.UUID) -> dict[str, Any]:
    progress = (
        session.execute(
            select(LearnerProgressRecord).where(LearnerProgressRecord.learner_id == learner_id)
        )
        .scalars()
        .all()
    )
    notes = (
        session.execute(select(LearnerNoteRecord).where(LearnerNoteRecord.learner_id == learner_id))
        .scalars()
        .all()
    )
    sessions = (
        session.execute(
            select(LearnerSessionRecord).where(LearnerSessionRecord.learner_id == learner_id)
        )
        .scalars()
        .all()
    )
    preferences = (
        session.execute(
            select(LearnerPreferenceRecord).where(LearnerPreferenceRecord.learner_id == learner_id)
        )
        .scalars()
        .all()
    )
    return {
        "schema_version": EXPORT_SCHEMA,
        "portable_learner_ref": str(learner_id),
        "progress": [
            {
                "content_version_id": str(x.version_id),
                "progress": x.progress_pct,
                "revision": x.revision,
            }
            for x in progress
        ],
        "notes": [
            {"content_version_id": str(x.version_id), "text": x.text, "revision": x.revision}
            for x in notes
        ],
        "sessions": [
            {
                "content_version_id": str(x.version_id) if x.version_id else None,
                "revision": x.revision,
                "status": x.status,
                "continuity": x.continuity_metadata,
            }
            for x in sessions
        ],
        "preferences": [
            {
                "key": x.preference_key,
                "schema_version": x.schema_version,
                "value": x.value,
                "revision": x.revision,
            }
            for x in preferences
        ],
    }


@router.post("/export")
def export_state(
    request: Request, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        _ensure_profile(session, learner_id)
        document = _export_document(session, learner_id)
        checksum = _request_hash(document)
        replay = _idempotent_lookup(
            session, learner_id, "export", key, {"schema_version": EXPORT_SCHEMA}
        )
        if replay is not None:
            return replay
        row = LearnerStateExportRecord(
            export_id=uuid.uuid4(),
            learner_id=learner_id,
            schema_version=EXPORT_SCHEMA,
            checksum=checksum,
            payload=document,
            status="completed",
            created_at=_now(),
            completed_at=_now(),
        )
        session.add(row)
        result = {
            "export_id": str(row.export_id),
            "schema_version": EXPORT_SCHEMA,
            "checksum": checksum,
            "document": document,
            "status": "completed",
        }
        _idempotent_store(
            session, learner_id, "export", key, {"schema_version": EXPORT_SCHEMA}, result
        )
        session.commit()
        return result
    finally:
        session.close()


@router.post("/import")
def import_state(
    body: ImportBody,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        document = body.document
        computed = _request_hash(document)
        if body.checksum is not None and body.checksum != computed:
            raise ApplicationError(
                "LEARNER_IMPORT_INTEGRITY_FAILURE",
                "export checksum does not match",
                status_code=422,
            )
        if document.get("schema_version") != EXPORT_SCHEMA:
            raise ApplicationError(
                "LEARNER_IMPORT_SCHEMA_UNSUPPORTED", "unsupported export schema", status_code=406
            )
        replay = _idempotent_lookup(
            session, learner_id, "import", key, {"document": document, "dry_run": body.dry_run}
        )
        if replay is not None:
            return replay
        counts = {
            "progress": len(document.get("progress", [])),
            "notes": len(document.get("notes", [])),
            "sessions": len(document.get("sessions", [])),
            "preferences": len(document.get("preferences", [])),
        }
        if not body.dry_run:
            _ensure_profile(session, learner_id)
            for item in document.get("progress", []):
                version_id = _version(session, str(item["content_version_id"]))
                row = session.get(LearnerProgressRecord, (learner_id, version_id))
                revision = int(item.get("revision", 0))
                value = float(item.get("progress", 0))
                if row is None:
                    session.add(
                        LearnerProgressRecord(
                            learner_id=learner_id,
                            version_id=version_id,
                            progress_pct=value,
                            revision=max(revision, 1),
                            updated_at=_now(),
                        )
                    )
                elif row.revision < revision:
                    row.progress_pct, row.revision, row.updated_at = value, revision, _now()
        import_record = LearnerStateImportRecord(
            import_id=uuid.uuid4(),
            learner_id=learner_id,
            schema_version=EXPORT_SCHEMA,
            checksum=computed,
            status="dry_run" if body.dry_run else "completed",
            counts=counts,
            created_at=_now(),
        )
        session.add(import_record)
        result = {
            "import_id": str(import_record.import_id),
            "schema_version": EXPORT_SCHEMA,
            "checksum": computed,
            "counts": counts,
            "status": "dry_run" if body.dry_run else "completed",
        }
        _idempotent_store(
            session,
            learner_id,
            "import",
            key,
            {"document": document, "dry_run": body.dry_run},
            result,
        )
        session.commit()
        return result
    finally:
        session.close()


@router.post("/deletions", status_code=status.HTTP_202_ACCEPTED)
def delete_state(
    request: Request, idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")
) -> dict[str, Any]:
    learner_id, key = _learner_id(request), _require_idempotency(idempotency_key)
    session = _session(request)
    try:
        existing = (
            session.execute(
                select(LearnerDeletionJobRecord).where(
                    LearnerDeletionJobRecord.idempotency_key == key
                )
            )
            .scalars()
            .first()
        )
        if existing is not None and existing.learner_id == learner_id:
            return {"deletion_id": str(existing.deletion_id), "status": existing.status}
        if existing is not None:
            raise ApplicationError(
                "LEARNER_IDEMPOTENCY_CONFLICT",
                "deletion key belongs to another learner",
                status_code=409,
            )
        _ensure_profile(session, learner_id)
        deletion = LearnerDeletionJobRecord(
            deletion_id=uuid.uuid4(),
            learner_id=learner_id,
            status="in_progress",
            idempotency_key=key,
            requested_at=_now(),
            safe_counts={},
        )
        session.add(deletion)
        session.flush()
        tables = [
            (LearnerNoteRevisionRecord, LearnerNoteRevisionRecord.learner_id),
            (LearnerNoteConflictRecord, LearnerNoteConflictRecord.learner_id),
            (LearnerFeedbackRecord, LearnerFeedbackRecord.learner_id),
            (LearnerStateConflictRecord, LearnerStateConflictRecord.learner_id),
            (LearnerStateExportRecord, LearnerStateExportRecord.learner_id),
            (LearnerStateImportRecord, LearnerStateImportRecord.learner_id),
            (LearnerPreferenceRecord, LearnerPreferenceRecord.learner_id),
            (LearnerCommandIdempotencyRecord, LearnerCommandIdempotencyRecord.learner_id),
            (LearnerCollectionVersionRecord, None),
            (LearnerCollectionRecord, LearnerCollectionRecord.learner_id),
            (LearnerHighlightRecord, LearnerHighlightRecord.learner_id),
            (LearnerBookmarkRecord, LearnerBookmarkRecord.learner_id),
            (LearnerNoteRecord, LearnerNoteRecord.learner_id),
            (LearnerProgressRecord, LearnerProgressRecord.learner_id),
            (LearnerSessionRecord, LearnerSessionRecord.learner_id),
        ]
        counts: dict[str, int] = {}
        collection_ids = (
            session.execute(
                select(LearnerCollectionRecord.collection_id).where(
                    LearnerCollectionRecord.learner_id == learner_id
                )
            )
            .scalars()
            .all()
        )
        if collection_ids:
            deleted = session.execute(
                delete(LearnerCollectionVersionRecord).where(
                    LearnerCollectionVersionRecord.collection_id.in_(collection_ids)
                )
            )
            counts["collection_versions"] = int(getattr(deleted, "rowcount", 0) or 0)
        for model, column in tables:
            if column is None:
                continue
            result = session.execute(delete(model).where(column == learner_id))
            counts[model.__tablename__] = int(getattr(result, "rowcount", 0) or 0)
        deleted_labs = session.execute(
            delete(LaboratoryRunRecord).where(LaboratoryRunRecord.learner_id == str(learner_id))
        )
        counts["laboratory_runs"] = int(getattr(deleted_labs, "rowcount", 0) or 0)
        deleted_attempts = session.execute(
            delete(AssessmentAttemptRecord).where(
                AssessmentAttemptRecord.learner_id == str(learner_id)
            )
        )
        counts["assessment_attempts"] = int(getattr(deleted_attempts, "rowcount", 0) or 0)
        deletion.status, deletion.completed_at, deletion.safe_counts = "completed", _now(), counts
        session.add(
            LearnerDeletionAuditRecord(
                deletion_id=deletion.deletion_id,
                learner_id=learner_id,
                action="deletion.completed",
                actor_authority="trusted-local-actor",
                correlation_id=getattr(request.state, "correlation_id", "unknown"),
                safe_counts=counts,
                created_at=_now(),
            )
        )
        session.commit()
        return {
            "deletion_id": str(deletion.deletion_id),
            "status": deletion.status,
            "safe_counts": counts,
        }
    finally:
        session.close()


@router.get("/deletions/{deletion_id}")
def deletion_status(deletion_id: str, request: Request) -> dict[str, Any]:
    session = _session(request)
    try:
        try:
            value = uuid.UUID(deletion_id)
        except ValueError as error:
            raise ApplicationError(
                "RESOURCE_NOT_FOUND", "deletion not found", status_code=404
            ) from error
        row = session.get(LearnerDeletionJobRecord, value)
        if row is None or row.learner_id != _learner_id(request):
            raise ApplicationError("RESOURCE_NOT_FOUND", "deletion not found", status_code=404)
        return {"deletion_id": deletion_id, "status": row.status, "safe_counts": row.safe_counts}
    finally:
        session.close()
