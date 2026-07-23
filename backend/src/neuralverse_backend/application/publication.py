"""Transactional BIP-M3 publication application service.

The service is deliberately transport-free: its caller owns the SQLAlchemy
transaction boundary and any future delivery adapter consumes the outbox.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from collections.abc import Iterable
from datetime import UTC, datetime
from typing import Protocol

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from neuralverse_backend.domain.publication_m3 import (
    PublicationGateError,
    PublicationGateInput,
    PublicationReleaseSnapshot,
    ReleaseLifecycle,
    evaluate_publication_gates,
)
from neuralverse_backend.persistence.models import (
    ContentPackageRecord,
    ContentVersionRecord,
    DeliveryManifestRecord,
    PublicationAuditRecord,
    PublicationCommandRecord,
    PublicationManifestRecord,
    PublicationReleaseRecord,
    TransactionalOutboxEventRecord,
)


class AuthorizedActorPolicy(Protocol):
    """Policy boundary for governance-approved publication actors."""

    def is_authorized(self, actor_id: str) -> bool: ...


class AllowListAuthorizedActorPolicy:
    """Small deterministic policy used by the application boundary."""

    def __init__(self, actors: Iterable[str]) -> None:
        self._actors = frozenset(actors)

    def is_authorized(self, actor_id: str) -> bool:
        return actor_id in self._actors


def _fingerprint(request: PublicationGateInput) -> str:
    payload = {
        "package_id": request.package_id,
        "content_version_id": request.content_version_id,
        "schema_name": request.schema_name,
        "schema_version": request.schema_version,
        "readiness_status": request.readiness_status,
        "findings": [
            {"severity": finding.severity, "rule_id": finding.rule_id, "message": finding.message}
            for finding in request.findings
        ],
        "governance_approved": request.governance_approved,
        "manual_review_complete": request.manual_review_complete,
        "source_ids": request.source_manifest.source_ids,
        "source_valid": request.source_manifest.valid,
        "asset_ids": request.asset_manifest.asset_version_ids,
        "assets_ready": request.asset_manifest.ready,
        "actor": request.authorized_actor,
        "block_ids": request.content_block_ids,
        "citation_ids": request.citation_ids,
        "publication_manifest_id": request.publication_manifest_id,
        "governance_review_ids": request.governance_review_ids,
        "supersedes_release_id": request.supersedes_release_id,
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(encoded).hexdigest()


class PublicationTransactionService:
    """Publishes an immutable version and atomically records its outbox event."""

    def __init__(self, actor_policy: AuthorizedActorPolicy) -> None:
        self._actor_policy = actor_policy

    def publish(
        self,
        session: Session,
        request: PublicationGateInput,
        *,
        now: datetime | None = None,
    ) -> PublicationReleaseSnapshot:
        evaluated = evaluate_publication_gates(request, now=now)
        if not self._actor_policy.is_authorized(request.authorized_actor):
            raise PublicationGateError(
                "UNAUTHORIZED_ACTOR", "actor is not authorized by Backend policy"
            )
        if not request.publication_manifest_id:
            raise PublicationGateError(
                "PUBLICATION_MANIFEST_REQUIRED", "publication manifest is required"
            )

        current_time = now or datetime.now(UTC)
        fingerprint = _fingerprint(request)
        # PostgreSQL advisory transaction locking closes the gap where two
        # first-time requests race before either idempotency row exists.
        session.execute(select(func.pg_advisory_xact_lock(func.hashtext(request.idempotency_key))))
        existing = session.scalar(
            select(PublicationCommandRecord)
            .where(PublicationCommandRecord.idempotency_key == request.idempotency_key)
            .with_for_update()
        )
        if existing is not None:
            if existing.request_fingerprint != fingerprint:
                raise PublicationGateError(
                    "IDEMPOTENCY_CONFLICT", "idempotency key was reused for another request"
                )
            if existing.response_snapshot is None:
                raise PublicationGateError(
                    "IDEMPOTENCY_INCOMPLETE", "stored publication response is incomplete"
                )
            return self._snapshot_from_json(existing.response_snapshot)

        package = session.scalar(
            select(ContentPackageRecord)
            .where(ContentPackageRecord.content_package_id == uuid.UUID(request.package_id))
            .with_for_update()
        )
        version = session.get(ContentVersionRecord, uuid.UUID(request.content_version_id))
        if (
            package is None
            or version is None
            or version.content_package_id != package.content_package_id
        ):
            raise PublicationGateError(
                "VERSION_PACKAGE_MISMATCH", "content version does not belong to package"
            )
        if version.lifecycle_state == "published" or version.published_at is not None:
            raise PublicationGateError(
                "VERSION_ALREADY_PUBLISHED", "content versions are immutable after publication"
            )

        manifest = session.get(
            PublicationManifestRecord, uuid.UUID(request.publication_manifest_id)
        )
        if manifest is not None and manifest.version_id != version.content_version_id:
            raise PublicationGateError(
                "MANIFEST_VERSION_MISMATCH", "publication manifest does not match version"
            )
        pending_release = (
            session.scalar(
                select(PublicationReleaseRecord)
                .where(PublicationReleaseRecord.content_version_id == version.content_version_id)
                .with_for_update()
            )
            if manifest is not None
            else None
        )
        if pending_release is not None and pending_release.status != "pending":
            raise PublicationGateError(
                "VERSION_ALREADY_PUBLISHED", "content versions are immutable after publication"
            )
        if pending_release is None:
            release_number = session.scalar(
                select(func.coalesce(func.max(PublicationReleaseRecord.release_number), 0)).where(
                    PublicationReleaseRecord.content_package_id == package.content_package_id
                )
            )
            next_number = int(release_number or 0) + 1
            release_id = uuid.uuid4()
            release = PublicationReleaseRecord(
                publication_release_id=release_id,
                content_package_id=package.content_package_id,
                content_version_id=version.content_version_id,
                release_number=next_number,
                supersedes_release_id=(
                    uuid.UUID(request.supersedes_release_id)
                    if request.supersedes_release_id
                    else None
                ),
                status="released",
                governance_review_ids=list(request.governance_review_ids),
                created_at=current_time,
                released_at=current_time,
            )
            session.add(release)
        else:
            release = pending_release
            release_id = release.publication_release_id
            next_number = release.release_number
            release.status = "released"
            release.governance_review_ids = list(request.governance_review_ids)
            release.released_at = current_time
        # The manifest has a foreign key to the release.  Flush the release
        # explicitly because these models intentionally do not define an ORM
        # relationship that would otherwise determine insert ordering.
        session.flush([release])
        if manifest is None:
            manifest = PublicationManifestRecord(
                publication_manifest_id=uuid.UUID(request.publication_manifest_id),
                release_id=release_id,
                version_id=version.content_version_id,
                block_ids=list(request.content_block_ids),
                asset_version_ids=list(request.asset_manifest.asset_version_ids),
                source_ids=list(request.source_manifest.source_ids),
                citation_ids=list(request.citation_ids),
                created_at=current_time,
            )
            session.add(manifest)
        version.lifecycle_state = "published"
        version.published_at = current_time
        manifest.release_id = release_id

        delivery = DeliveryManifestRecord(
            delivery_manifest_id=uuid.uuid4(),
            publication_release_id=release_id,
            publication_manifest_id=manifest.publication_manifest_id,
            content_package_id=package.content_package_id,
            content_version_id=version.content_version_id,
            ordered_content_block_ids=list(request.content_block_ids),
            source_ids=list(request.source_manifest.source_ids),
            citation_ids=list(request.citation_ids),
            asset_version_ids=list(request.asset_manifest.asset_version_ids),
            release_fingerprint=fingerprint,
            created_at=current_time,
        )
        session.add(delivery)
        snapshot = PublicationReleaseSnapshot(
            release_id=str(release_id),
            package_id=request.package_id,
            content_version_id=request.content_version_id,
            release_number=next_number,
            status=ReleaseLifecycle.RELEASED,
            supersedes_release_id=request.supersedes_release_id,
            published_at=current_time,
        )
        snapshot_json = {
            "release_id": snapshot.release_id,
            "package_id": snapshot.package_id,
            "content_version_id": snapshot.content_version_id,
            "release_number": snapshot.release_number,
            "status": snapshot.status.value,
            "supersedes_release_id": snapshot.supersedes_release_id,
            "published_at": snapshot.published_at.isoformat(),
        }
        session.add(
            PublicationAuditRecord(
                publication_audit_id=uuid.uuid4(),
                publication_release_id=release_id,
                actor_id=request.authorized_actor,
                action="PUBLISH",
                gate_snapshot={
                    "schema_name": request.schema_name,
                    "schema_version": request.schema_version,
                    "readiness": evaluated.approved,
                    "manual_review_complete": request.manual_review_complete,
                },
                created_at=current_time,
            )
        )
        session.add(
            TransactionalOutboxEventRecord(
                event_id=uuid.uuid4(),
                event_type="publication.released",
                aggregate_type="PublicationRelease",
                aggregate_id=str(release_id),
                payload=snapshot_json,
                status="PENDING",
                attempt_count=0,
                available_at=current_time,
                created_at=current_time,
            )
        )
        session.add(
            PublicationCommandRecord(
                publication_command_id=uuid.uuid4(),
                idempotency_key=request.idempotency_key,
                request_fingerprint=fingerprint,
                actor_id=request.authorized_actor,
                status="COMPLETED",
                publication_release_id=release_id,
                response_snapshot=snapshot_json,
                created_at=current_time,
            )
        )
        session.flush()
        return snapshot

    @staticmethod
    def _snapshot_from_json(value: object) -> PublicationReleaseSnapshot:
        if not isinstance(value, dict):
            raise PublicationGateError(
                "IDEMPOTENCY_INVALID_SNAPSHOT", "stored response snapshot is invalid"
            )
        return PublicationReleaseSnapshot(
            release_id=str(value["release_id"]),
            package_id=str(value["package_id"]),
            content_version_id=str(value["content_version_id"]),
            release_number=int(value["release_number"]),
            status=ReleaseLifecycle(str(value["status"])),
            supersedes_release_id=(
                str(value["supersedes_release_id"])
                if value.get("supersedes_release_id") is not None
                else None
            ),
            published_at=datetime.fromisoformat(str(value["published_at"])),
        )
