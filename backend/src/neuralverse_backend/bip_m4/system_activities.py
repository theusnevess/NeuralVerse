"""BIP-owned activities executed on the system task queue."""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid5

from sqlalchemy import select, text
from temporalio import activity

from neuralverse_backend.application.publication import (
    AllowListAuthorizedActorPolicy,
    PublicationTransactionService,
)
from neuralverse_backend.bip_m4.reference_loading import load_canonical_activity_dependencies
from neuralverse_backend.configuration.settings import Settings
from neuralverse_backend.domain.publication_m3 import (
    AssetManifest,
    PublicationGateInput,
    SourceManifest,
)
from neuralverse_backend.orchestration import OrchestrationService
from neuralverse_backend.persistence.models import (
    BIPM4GenerationRequestRecord,
    ContentBlockRecord,
    ContentPackageRecord,
    ContentVersionRecord,
    PublicationAuditRecord,
    TransactionalOutboxEventRecord,
)
from neuralverse_backend.persistence.runtime import create_persistence_runtime

STAGE16_NAMESPACE = "https://neuralverse.dev/stage16/"


def _stage16_uuid(value: str) -> UUID:
    return uuid5(UUID("00000000-0000-0000-0000-000000000000"), STAGE16_NAMESPACE + value)


def _stage16_json(value: object) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError("STAGE16_PUBLICATION_ARTIFACT_INVALID")
    return dict(value)


def _ack_payload(row: Any) -> dict[str, Any]:
    value = dict(row)
    published_at = value.get("published_at")
    if isinstance(published_at, datetime):
        value["published_at"] = published_at.isoformat()
    return value


def _publication_acknowledgement(
    session: Any,
    *,
    command: dict[str, Any],
    snapshot: Any,
    actor: str,
) -> dict[str, Any]:
    existing = session.execute(
        text(
            """
            SELECT acknowledgement_id, command_id, idempotency_key, package_id,
                   content_version_id, release_id, release_number,
                   publication_audit_id, outbox_event_id, result_hash, published_at
            FROM stage15_publication_acknowledgements
            WHERE idempotency_key = :idempotency_key
            """
        ),
        {"idempotency_key": str(command["idempotency_key"])},
    ).mappings().first()
    if existing is not None:
        return {"status": "PUBLICATION_COMMITTED", **_ack_payload(existing)}

    audit = session.scalar(
        select(PublicationAuditRecord)
        .where(PublicationAuditRecord.publication_release_id == UUID(snapshot.release_id))
        .order_by(PublicationAuditRecord.created_at.desc())
    )
    outbox = session.scalar(
        select(TransactionalOutboxEventRecord)
        .where(
            TransactionalOutboxEventRecord.event_type == "publication.released",
            TransactionalOutboxEventRecord.aggregate_id == snapshot.release_id,
        )
        .order_by(TransactionalOutboxEventRecord.created_at.desc())
    )
    if audit is None or outbox is None:
        raise ValueError("STAGE16_PUBLICATION_DURABLE_RECORD_MISSING")
    result_hash = hashlib.sha256(
        json.dumps(
            {
                "command_id": command["command_id"],
                "idempotency_key": command["idempotency_key"],
                "release_id": snapshot.release_id,
                "audit_id": str(audit.publication_audit_id),
                "outbox_id": str(outbox.event_id),
            },
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
    ).hexdigest()
    acknowledgement_id = f"publication-ack:{_stage16_uuid(str(command['idempotency_key']))}"
    session.execute(
        text(
            """
            INSERT INTO stage15_publication_acknowledgements (
                acknowledgement_id, command_id, idempotency_key, package_id,
                content_version_id, release_id, release_number,
                publication_audit_id, outbox_event_id, published_by,
                supersedes_release_id, result_hash, published_at
            ) VALUES (
                :acknowledgement_id, :command_id, :idempotency_key, :package_id,
                :content_version_id, :release_id, :release_number,
                :publication_audit_id, :outbox_event_id, :published_by,
                :supersedes_release_id, :result_hash, :published_at
            )
            ON CONFLICT (idempotency_key) DO NOTHING
            """
        ),
        {
            "acknowledgement_id": acknowledgement_id,
            "command_id": str(command["command_id"]),
            "idempotency_key": str(command["idempotency_key"]),
            "package_id": snapshot.package_id,
            "content_version_id": snapshot.content_version_id,
            "release_id": snapshot.release_id,
            "release_number": snapshot.release_number,
            "publication_audit_id": str(audit.publication_audit_id),
            "outbox_event_id": str(outbox.event_id),
            "published_by": actor,
            "supersedes_release_id": snapshot.supersedes_release_id,
            "result_hash": result_hash,
            "published_at": snapshot.published_at,
        },
    )
    row = session.execute(
        text(
            """
            SELECT acknowledgement_id, command_id, idempotency_key, package_id,
                   content_version_id, release_id, release_number,
                   publication_audit_id, outbox_event_id, result_hash, published_at
            FROM stage15_publication_acknowledgements
            WHERE idempotency_key = :idempotency_key
            """
        ),
        {"idempotency_key": str(command["idempotency_key"])},
    ).mappings().one()
    return {"status": "PUBLICATION_COMMITTED", **_ack_payload(row)}


def _prepare_publication_materialization(
    session: Any,
    *,
    request: dict[str, Any],
    references: dict[str, Any],
) -> tuple[str, str, tuple[str, ...], str]:
    draft = _stage16_json(references["learning_package_draft"].canonical_json)
    package_key = str(draft.get("packageId", request["content_package_id"]))
    package_id = _stage16_uuid(f"content-package:{package_key}")
    package = session.get(ContentPackageRecord, package_id)
    now = datetime.now(UTC)
    if package is None:
        package = ContentPackageRecord(
            content_package_id=package_id,
            lifecycle_state="active",
            lock_version=0,
            created_at=now,
            updated_at=now,
        )
        session.add(package)
        session.flush()

    draft_fingerprint = references["learning_package_draft"].artifact_fingerprint
    version_id = _stage16_uuid(
        f"content-version:{request['generation_job_id']}:{draft_fingerprint}"
    )
    version = session.get(ContentVersionRecord, version_id)
    block_ids: list[str] = []
    if version is None:
        latest_revision = session.scalar(
            select(ContentVersionRecord.revision)
            .where(ContentVersionRecord.content_package_id == package_id)
            .order_by(ContentVersionRecord.revision.desc())
            .limit(1)
        )
        curriculum_node_id = _stage16_uuid(f"curriculum-node:{request['curriculum_node_id']}")
        version = ContentVersionRecord(
            content_version_id=version_id,
            content_package_id=package_id,
            revision=int(latest_revision or 0) + 1,
            lifecycle_state="draft",
            structural_semantic_payload={
                "curriculum_node_ids": [str(curriculum_node_id)],
                "semantic_key": str(request["curriculum_node_id"]),
                "package_type": str(request["requested_package_type"]),
            },
            opaque_metadata={
                "generation_job_id": str(request["generation_job_id"]),
                "draft_fingerprint": draft_fingerprint,
            },
            created_at=now,
        )
        session.add(version)
        session.flush()
        ordered_roles = (
            "evidence",
            "knowledge",
            "application",
            "code_laboratory",
            "assessment",
            "narrative",
            "curiosity",
            "didactic",
        )
        block_types = {
            "code_laboratory": "code",
            "assessment": "assessment",
            "didactic": "text",
        }
        for position, role in enumerate(ordered_roles):
            reference = references.get(role)
            payload = (
                dict(reference.canonical_json)
                if reference is not None and isinstance(reference.canonical_json, dict)
                else {"role": role, "source": "learning_package_draft"}
            )
            block_id = _stage16_uuid(f"content-block:{version_id}:{role}")
            session.add(
                ContentBlockRecord(
                    content_block_id=block_id,
                    content_version_id=version_id,
                    block_type=block_types.get(role, "text"),
                    position=position,
                    payload=json.dumps(payload, sort_keys=True, separators=(",", ":")),
                    opaque_metadata={"workflow_role": role},
                    created_at=now,
                )
            )
            block_ids.append(str(block_id))
        session.flush()
    else:
        block_ids = [
            str(item)
            for item in session.scalars(
                select(ContentBlockRecord.content_block_id)
                .where(ContentBlockRecord.content_version_id == version_id)
                .order_by(ContentBlockRecord.position)
            ).all()
        ]
    manifest_id = str(_stage16_uuid(f"publication-manifest:{version_id}"))
    return str(package_id), str(version_id), tuple(block_ids), manifest_id


@activity.defn(name="PublishLearningPackageActivity")
async def publish_learning_package(request: dict[str, Any]) -> dict[str, Any]:
    runtime = create_persistence_runtime(Settings())
    if runtime.session_factory is None:
        raise RuntimeError("STAGE16_PUBLICATION_DATABASE_UNAVAILABLE")
    references = load_canonical_activity_dependencies(runtime.session_factory, request)
    command = dict(request["publication_command"])
    actor = str(command["actor_identity"])
    with runtime.session_factory() as session:
        package_id, version_id, block_ids, manifest_id = _prepare_publication_materialization(
            session, request=request, references=references
        )
        readiness = _stage16_json(
            references["publication_readiness_recommendation"].canonical_json
        )
        gate_input = PublicationGateInput(
            package_id=package_id,
            content_version_id=version_id,
            schema_name="LearningPackageDraft",
            schema_version="1.0.0",
            readiness_status=str(readiness.get("recommendation", "")),
            findings=(),
            governance_approved=True,
            manual_review_complete=True,
            source_manifest=SourceManifest(()),
            asset_manifest=AssetManifest(()),
            authorized_actor=actor,
            allowed_actors=frozenset({actor}),
            idempotency_key=str(command["idempotency_key"]),
            content_block_ids=block_ids,
            publication_manifest_id=manifest_id,
            governance_review_ids=(
                (str(references["governance"].persistence_locator),)
                if "governance" in references
                else ()
            ),
        )
        snapshot = PublicationTransactionService(
            AllowListAuthorizedActorPolicy({actor})
        ).publish(session, gate_input, now=datetime.now(UTC))
        result = _publication_acknowledgement(
            session, command=command, snapshot=snapshot, actor=actor
        )
        result.update(
            {
                "package_id": snapshot.package_id,
                "content_version_id": snapshot.content_version_id,
                "release_id": snapshot.release_id,
                "publication_manifest_id": manifest_id,
                "workflow_id": str(request["workflow_id"]),
            }
        )
        session.commit()
        return result


def _orchestration_service() -> OrchestrationService:
    runtime = create_persistence_runtime(Settings())
    if runtime.session_factory is None:
        raise RuntimeError("PROGRESS_PROJECTION_FAILURE")
    return OrchestrationService(runtime.session_factory)


@activity.defn(name="QualifyGenerationRequestActivity")
async def qualify_generation_request(request: dict[str, Any]) -> dict[str, Any]:
    required = (
        "generation_job_id",
        "request_fingerprint",
        "generation_request_reference",
    )
    if any(not str(request.get(field, "")).strip() for field in required):
        raise ValueError("GENERATION_REQUEST_INVALID")
    runtime = create_persistence_runtime(Settings())
    if runtime.session_factory is None:
        raise ValueError("GENERATION_REQUEST_REFERENCE_NOT_FOUND")
    reference = request["generation_request_reference"]
    session = runtime.session_factory()
    try:
        record = session.scalar(
            select(BIPM4GenerationRequestRecord).where(
                BIPM4GenerationRequestRecord.generation_request_id
                == UUID(str(reference["generation_request_id"]))
            )
        )
        if record is None or record.generation_job_id != str(request["generation_job_id"]):
            raise ValueError("GENERATION_REQUEST_JOB_MISMATCH")
        if hashlib.sha256(record.raw_json_bytes).hexdigest() != str(
            reference["request_fingerprint"]
        ):
            raise ValueError("GENERATION_REQUEST_FINGERPRINT_MISMATCH")
    finally:
        session.close()
    return {
        "status": "QUALIFIED",
        "generation_job_id": request["generation_job_id"],
        "request_fingerprint": request["request_fingerprint"],
        "generation_request_reference": reference,
    }


@activity.defn(name="PersistWorkflowProgressActivity")
async def persist_workflow_progress(request: dict[str, Any]) -> dict[str, Any]:
    """Persist one monotonic projection event without embedding workflow payloads."""
    return _orchestration_service().persist_progress(request)


@activity.defn(name="LoadCanonicalActivityDependencies")
async def load_canonical_activity_dependencies_activity(request: dict[str, Any]) -> dict[str, Any]:
    runtime = create_persistence_runtime(Settings())
    if runtime.session_factory is None:
        raise RuntimeError("WORKFLOW_ARTIFACT_REFERENCE_NOT_FOUND")
    loaded = load_canonical_activity_dependencies(runtime.session_factory, request)
    return {
        role: {
            "domain": value.domain,
            "contract_name": value.contract_name,
            "contract_version": value.contract_version.value,
            "artifact_id": value.artifact_id,
            "artifact_fingerprint": value.artifact_fingerprint,
            "producer_identity": value.producer_identity,
            "generation_job_id": value.generation_job_id,
            "revision_cycle": value.revision_cycle,
            "persistence_locator": value.persistence_locator,
            "canonical_json": value.canonical_json,
        }
        for role, value in loaded.items()
    }
