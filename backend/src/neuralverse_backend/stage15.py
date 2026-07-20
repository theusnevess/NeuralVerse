"""Stage 15 human-review and publication authorization boundary.

This module is transport/storage neutral. It owns review evidence and the
authorization decision; the existing ``PublicationTransactionService`` owns
the SQL transaction that creates immutable publication records and outbox
intent. No automated actor can produce a final publication decision.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field, replace
from datetime import UTC, datetime, timedelta
from enum import StrEnum
from typing import Any

from neuralverse_backend.domain.publication_m3 import (
    PublicationGateInput,
    PublicationReleaseSnapshot,
)


class ReviewError(ValueError):
    """A review or publication authorization invariant failed."""


class ReviewDiscipline(StrEnum):
    EDITORIAL = "EDITORIAL"
    SCIENTIFIC = "SCIENTIFIC"
    MATHEMATICAL = "MATHEMATICAL"
    SOURCE_AND_CITATION = "SOURCE_AND_CITATION"
    VISUAL_SCIENTIFIC = "VISUAL_SCIENTIFIC"
    ASSET_LICENSE = "ASSET_LICENSE"
    ACCESSIBILITY = "ACCESSIBILITY"
    LABORATORY = "LABORATORY"
    ASSESSMENT = "ASSESSMENT"
    FINAL_AUTHORIZATION = "FINAL_AUTHORIZATION"


class ReviewDecision(StrEnum):
    APPROVED = "APPROVED"
    APPROVED_WITH_MINOR_BACKLOG = "APPROVED_WITH_MINOR_BACKLOG"
    CHANGES_REQUIRED = "CHANGES_REQUIRED"
    REJECTED = "REJECTED"
    UNABLE_TO_DETERMINE = "UNABLE_TO_DETERMINE"


class FindingSeverity(StrEnum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    UNKNOWN = "UNKNOWN"


class FindingStatus(StrEnum):
    OPEN = "OPEN"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    RESOLVED_PENDING_REVALIDATION = "RESOLVED_PENDING_REVALIDATION"
    RESOLVED = "RESOLVED"
    ACCEPTED_MINOR_BACKLOG = "ACCEPTED_MINOR_BACKLOG"
    REJECTED_AS_INVALID = "REJECTED_AS_INVALID"
    SUPERSEDED = "SUPERSEDED"


class FinalPublicationDecisionKind(StrEnum):
    AUTHORIZE_PUBLICATION = "AUTHORIZE_PUBLICATION"
    REQUIRE_REVISION = "REQUIRE_REVISION"
    REJECT_PUBLICATION = "REJECT_PUBLICATION"


class ReviewBundleStatus(StrEnum):
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    REVALIDATION_PENDING = "REVALIDATION_PENDING"
    READY_FOR_FINAL_DECISION = "READY_FOR_FINAL_DECISION"
    INVALIDATED = "INVALIDATED"
    PUBLISHED = "PUBLISHED"


BLOCKING_SEVERITIES = frozenset({FindingSeverity.P0, FindingSeverity.P1, FindingSeverity.UNKNOWN})
ACCEPTABLE_READINESS = frozenset({"READY_FOR_PUBLICATION", "READY_WITH_DOCUMENTED_MINOR_BACKLOG"})


def stable_hash(value: object) -> str:
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, separators=(",", ":"), default=str).encode()
    ).hexdigest()


@dataclass(frozen=True, slots=True)
class PublicationHandoffIntake:
    """Lossless intake of the committed ACP PublicationHandoff contract."""

    raw: Mapping[str, Any]
    handoff_id: str
    handoff_version: str
    package_id: str
    package_version: str
    draft_id: str
    draft_version: str
    draft_hash: str
    readiness_id: str
    readiness_hash: str
    source_snapshot_hash: str
    asset_snapshot_hash: str
    laboratory_snapshot_hash: str
    assessment_snapshot_hash: str
    publication_target: str
    lineage: Mapping[str, Any] = field(default_factory=dict)

    @classmethod
    def from_mapping(cls, raw: Mapping[str, Any]) -> PublicationHandoffIntake:
        def required(*names: str) -> str:
            for name in names:
                value = raw.get(name)
                if value is not None and str(value).strip():
                    return str(value)
            raise ReviewError(f"PublicationHandoff field missing: {names[0]}")

        return cls(
            raw=dict(raw),
            handoff_id=required("publicationHandoffId", "handoff_id"),
            handoff_version=required("handoffVersion", "handoff_version"),
            package_id=required("packageId", "package_id"),
            package_version=required("packageVersion", "package_version"),
            draft_id=required("draftId", "draft_id", "packageId", "package_id"),
            draft_version=required(
                "draftVersion", "draft_version", "packageVersion", "package_version"
            ),
            draft_hash=required("draftSemanticHash", "draft_hash", "semanticHash"),
            readiness_id=required("publicationReadinessRecommendationId", "readinessId"),
            readiness_hash=required("publicationReadinessRecommendationHash", "readinessHash"),
            source_snapshot_hash=required("sourceSnapshotHash", "source_hash"),
            asset_snapshot_hash=required("assetSnapshotHash", "asset_hash"),
            laboratory_snapshot_hash=required("laboratorySnapshotHash", "laboratory_hash"),
            assessment_snapshot_hash=required("assessmentSnapshotHash", "assessment_hash"),
            publication_target=required("publicationTarget", "target"),
            lineage=dict(raw.get("lineage", {})),
        )

    @property
    def fingerprint(self) -> str:
        return stable_hash(
            {
                "handoff_id": self.handoff_id,
                "package_id": self.package_id,
                "package_version": self.package_version,
                "draft_id": self.draft_id,
                "draft_version": self.draft_version,
                "draft_hash": self.draft_hash,
                "readiness_id": self.readiness_id,
                "readiness_hash": self.readiness_hash,
                "source": self.source_snapshot_hash,
                "asset": self.asset_snapshot_hash,
                "laboratory": self.laboratory_snapshot_hash,
                "assessment": self.assessment_snapshot_hash,
                "target": self.publication_target,
            }
        )


@dataclass(frozen=True, slots=True)
class HumanReviewRequirementsPolicy:
    policy_id: str = "human-review-policy"
    version: str = "1.0.0"
    freshness_days: int = 30
    max_revision_cycles: int = 3
    allow_minor_backlog: bool = True

    def __post_init__(self) -> None:
        if not self.policy_id or not self.version or self.freshness_days < 1:
            raise ReviewError("invalid review policy")

    def required_disciplines(
        self,
        *,
        technical_claims: bool = True,
        mathematical_claims: bool = False,
        visual_science: bool = False,
        external_assets: bool = False,
        laboratory: bool = False,
        assessment: bool = False,
    ) -> tuple[ReviewDiscipline, ...]:
        result = [ReviewDiscipline.EDITORIAL]
        if technical_claims:
            result.append(ReviewDiscipline.SCIENTIFIC)
        if mathematical_claims:
            result.append(ReviewDiscipline.MATHEMATICAL)
        result.append(ReviewDiscipline.SOURCE_AND_CITATION)
        if visual_science:
            result.append(ReviewDiscipline.VISUAL_SCIENTIFIC)
        if external_assets:
            result.append(ReviewDiscipline.ASSET_LICENSE)
        result.append(ReviewDiscipline.ACCESSIBILITY)
        if laboratory:
            result.append(ReviewDiscipline.LABORATORY)
        if assessment:
            result.append(ReviewDiscipline.ASSESSMENT)
        result.append(ReviewDiscipline.FINAL_AUTHORIZATION)
        return tuple(result)


@dataclass(frozen=True, slots=True)
class ReviewFinding:
    finding_id: str
    discipline: ReviewDiscipline
    severity: FindingSeverity
    classification: str
    description: str
    affected_ids: tuple[str, ...] = ()
    evidence_refs: tuple[str, ...] = ()
    required_action: str = ""
    status: FindingStatus = FindingStatus.OPEN
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    resolved_at: datetime | None = None
    resolution_evidence: str = ""

    @property
    def blocks_publication(self) -> bool:
        return self.severity in BLOCKING_SEVERITIES and self.status not in {
            FindingStatus.RESOLVED,
            FindingStatus.REJECTED_AS_INVALID,
            FindingStatus.SUPERSEDED,
        }

    def resolve(self, evidence: str, *, revalidate: bool = False) -> ReviewFinding:
        if not evidence.strip():
            raise ReviewError("finding resolution evidence is required")
        return replace(
            self,
            status=(
                FindingStatus.RESOLVED_PENDING_REVALIDATION
                if revalidate
                else FindingStatus.RESOLVED
            ),
            resolved_at=datetime.now(UTC),
            resolution_evidence=evidence,
        )


@dataclass(frozen=True, slots=True)
class ReviewRecord:
    review_record_id: str
    bundle_id: str
    discipline: ReviewDiscipline
    reviewer: str
    reviewer_role: str
    candidate_fingerprint: str
    decision: ReviewDecision
    findings: tuple[ReviewFinding, ...]
    rationale: str
    checklist_version: str
    submitted_at: datetime
    fresh_until: datetime
    record_hash: str
    source_snapshot_hash: str
    asset_snapshot_hash: str
    laboratory_snapshot_hash: str
    assessment_snapshot_hash: str

    def is_fresh(self, now: datetime | None = None) -> bool:
        return (now or datetime.now(UTC)) < self.fresh_until


@dataclass(frozen=True, slots=True)
class ReviewAssignment:
    assignment_id: str
    bundle_id: str
    discipline: ReviewDiscipline
    required_role: str
    reviewer: str
    assigned_by: str
    assigned_at: datetime
    status: str = "ASSIGNED"
    conflict_of_interest: bool = False


@dataclass(frozen=True, slots=True)
class FinalPublicationDecision:
    decision_id: str
    bundle_id: str
    candidate_fingerprint: str
    readiness_id: str
    readiness_hash: str
    handoff_id: str
    handoff_hash: str
    required_review_ids: tuple[str, ...]
    p0_count: int
    p1_count: int
    unknown_count: int
    decision: FinalPublicationDecisionKind
    rationale: str
    actor: str
    actor_role: str
    created_at: datetime
    fresh_until: datetime
    policy_version: str
    decision_hash: str

    def is_fresh(self, now: datetime | None = None) -> bool:
        return (now or datetime.now(UTC)) < self.fresh_until


@dataclass(frozen=True, slots=True)
class PublishLearningPackageCommand:
    command_id: str
    idempotency_key: str
    package_id: str
    draft_id: str
    draft_version: str
    draft_hash: str
    readiness_id: str
    handoff_id: str
    review_bundle_id: str
    final_decision_id: str
    publication_target: str
    actor_id: str
    actor_roles: frozenset[str]
    request_hash: str
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    @classmethod
    def create(
        cls,
        *,
        package_id: str,
        draft_id: str,
        draft_version: str,
        draft_hash: str,
        readiness_id: str,
        handoff_id: str,
        review_bundle_id: str,
        final_decision_id: str,
        publication_target: str,
        actor_id: str,
        actor_roles: Iterable[str],
        idempotency_key: str,
    ) -> PublishLearningPackageCommand:
        payload = locals().copy()
        payload.pop("cls")
        request_hash = stable_hash(payload)
        return cls(
            command_id=f"publish-command:{uuid.uuid4().hex}",
            request_hash=request_hash,
            **{key: value for key, value in payload.items() if key != "actor_roles"},
            actor_roles=frozenset(actor_roles),
        )

    def validate(self) -> None:
        if not self.idempotency_key or not self.request_hash:
            raise ReviewError("publication command identity is incomplete")
        if "PUBLICATION_OPERATOR" not in self.actor_roles:
            raise ReviewError("publication operator authorization is required")


@dataclass(frozen=True, slots=True)
class PublicationAcknowledgement:
    acknowledgement_id: str
    command_id: str
    idempotency_key: str
    package_id: str
    content_version_id: str
    release_id: str
    release_number: int
    publication_audit_id: str
    outbox_event_id: str
    published_at: datetime
    published_by: str
    supersedes_release_id: str | None
    result_hash: str


@dataclass(slots=True)
class HumanReviewBundle:
    bundle_id: str
    handoff: PublicationHandoffIntake
    policy: HumanReviewRequirementsPolicy
    required_disciplines: tuple[ReviewDiscipline, ...]
    assignments: dict[ReviewDiscipline, ReviewAssignment] = field(default_factory=dict)
    records: dict[ReviewDiscipline, ReviewRecord] = field(default_factory=dict)
    audit: list[dict[str, Any]] = field(default_factory=list)
    status: ReviewBundleStatus = ReviewBundleStatus.OPEN
    revision_cycles: int = 0
    invalidation_reason: str | None = None

    @classmethod
    def create(
        cls,
        handoff: PublicationHandoffIntake,
        policy: HumanReviewRequirementsPolicy,
        *,
        required_disciplines: tuple[ReviewDiscipline, ...] | None = None,
    ) -> HumanReviewBundle:
        bundle = cls(
            bundle_id=f"review-bundle:{uuid.uuid4().hex}",
            handoff=handoff,
            policy=policy,
            required_disciplines=required_disciplines or policy.required_disciplines(),
        )
        bundle._event("BUNDLE_CREATED", "system", {"fingerprint": handoff.fingerprint})
        return bundle

    @property
    def candidate_fingerprint(self) -> str:
        return self.handoff.fingerprint

    def assign(
        self,
        discipline: ReviewDiscipline,
        reviewer: str,
        role: str,
        assigned_by: str,
        *,
        conflict_of_interest: bool = False,
    ) -> ReviewAssignment:
        if discipline not in self.required_disciplines:
            raise ReviewError("discipline is not required by the policy")
        if not reviewer or not role or not assigned_by or conflict_of_interest:
            raise ReviewError("reviewer authorization or conflict policy failed")
        assignment = ReviewAssignment(
            f"review-assignment:{uuid.uuid4().hex}",
            self.bundle_id,
            discipline,
            f"{discipline.value}_REVIEWER"
            if discipline is not ReviewDiscipline.FINAL_AUTHORIZATION
            else "FINAL_PUBLICATION_AUTHORIZER",
            reviewer,
            assigned_by,
            datetime.now(UTC),
        )
        self.assignments[discipline] = assignment
        self.status = ReviewBundleStatus.IN_REVIEW
        self._event("ASSIGNED", assigned_by, {"discipline": discipline.value, "reviewer": reviewer})
        return assignment

    def submit(
        self,
        discipline: ReviewDiscipline,
        *,
        reviewer: str,
        reviewer_role: str,
        decision: ReviewDecision,
        findings: Iterable[ReviewFinding] = (),
        rationale: str,
        checklist_version: str = "1.0.0",
        source_snapshot_hash: str | None = None,
        asset_snapshot_hash: str | None = None,
        laboratory_snapshot_hash: str | None = None,
        assessment_snapshot_hash: str | None = None,
    ) -> ReviewRecord:
        assignment = self.assignments.get(discipline)
        if assignment is None or assignment.reviewer != reviewer:
            raise ReviewError("reviewer is not assigned to this discipline")
        if assignment.required_role != reviewer_role or assignment.conflict_of_interest:
            raise ReviewError("reviewer role or conflict policy failed")
        now = datetime.now(UTC)
        finding_tuple = tuple(findings)
        record_hash = stable_hash(
            {
                "bundle": self.bundle_id,
                "discipline": discipline.value,
                "reviewer": reviewer,
                "candidate": self.candidate_fingerprint,
                "decision": decision.value,
                "findings": [finding.finding_id for finding in finding_tuple],
            }
        )
        record = ReviewRecord(
            f"review-record:{uuid.uuid4().hex}",
            self.bundle_id,
            discipline,
            reviewer,
            reviewer_role,
            self.candidate_fingerprint,
            decision,
            finding_tuple,
            rationale,
            checklist_version,
            now,
            now + timedelta(days=self.policy.freshness_days),
            record_hash,
            source_snapshot_hash or self.handoff.source_snapshot_hash,
            asset_snapshot_hash or self.handoff.asset_snapshot_hash,
            laboratory_snapshot_hash or self.handoff.laboratory_snapshot_hash,
            assessment_snapshot_hash or self.handoff.assessment_snapshot_hash,
        )
        self.records[discipline] = record
        self._event("REVIEW_SUBMITTED", reviewer, {"record_id": record.review_record_id})
        return record

    def invalidate(self, reason: str, *, candidate_fingerprint: str) -> None:
        if candidate_fingerprint != self.candidate_fingerprint or not reason.strip():
            raise ReviewError("invalidation must bind to the exact candidate")
        self.status = ReviewBundleStatus.INVALIDATED
        self.invalidation_reason = reason
        self._event("INVALIDATED", "system", {"reason": reason})

    def request_revision(self, reason: str) -> None:
        if self.revision_cycles >= self.policy.max_revision_cycles:
            raise ReviewError("HUMAN_REVIEW_REQUIRED: revision cycle limit reached")
        self.revision_cycles += 1
        self.records.clear()
        self.status = ReviewBundleStatus.REVALIDATION_PENDING
        self._event(
            "REVISION_REQUESTED", "human", {"reason": reason, "cycle": self.revision_cycles}
        )

    def final_decision(
        self,
        *,
        decision: FinalPublicationDecisionKind,
        actor: str,
        actor_role: str,
        readiness_recommendation: str,
        readiness_id: str,
        readiness_hash: str,
        rationale: str,
        now: datetime | None = None,
    ) -> FinalPublicationDecision:
        current = now or datetime.now(UTC)
        if actor_role != "FINAL_PUBLICATION_AUTHORIZER" or not actor:
            raise ReviewError("only an authorized human may issue final publication decision")
        if self.status is ReviewBundleStatus.INVALIDATED:
            raise ReviewError("review bundle is invalidated")
        missing = [
            discipline for discipline in self.required_disciplines if discipline not in self.records
        ]
        if missing:
            raise ReviewError(
                f"required reviews missing: {','.join(item.value for item in missing)}"
            )
        records = tuple(self.records.values())
        if any(not record.is_fresh(current) for record in records):
            raise ReviewError("review freshness expired")
        findings = tuple(finding for record in records for finding in record.findings)
        p0 = sum(
            finding.blocks_publication and finding.severity is FindingSeverity.P0
            for finding in findings
        )
        p1 = sum(
            finding.blocks_publication and finding.severity is FindingSeverity.P1
            for finding in findings
        )
        unknown = sum(
            finding.blocks_publication and finding.severity is FindingSeverity.UNKNOWN
            for finding in findings
        )
        if readiness_recommendation not in ACCEPTABLE_READINESS:
            raise ReviewError("publication readiness recommendation is not acceptable")
        if not rationale.strip():
            raise ReviewError("final decision rationale is required")
        if decision is FinalPublicationDecisionKind.AUTHORIZE_PUBLICATION and (p0 or p1 or unknown):
            raise ReviewError("P0, P1 and UNKNOWN findings block publication")
        self.status = ReviewBundleStatus.READY_FOR_FINAL_DECISION
        decision_hash = stable_hash(
            {
                "bundle": self.bundle_id,
                "candidate": self.candidate_fingerprint,
                "readiness": [readiness_id, readiness_hash],
                "decision": decision.value,
                "actor": actor,
                "counts": [p0, p1, unknown],
            }
        )
        result = FinalPublicationDecision(
            f"publication-decision:{uuid.uuid4().hex}",
            self.bundle_id,
            self.candidate_fingerprint,
            readiness_id,
            readiness_hash,
            self.handoff.handoff_id,
            self.handoff.fingerprint,
            tuple(record.review_record_id for record in records),
            p0,
            p1,
            unknown,
            decision,
            rationale,
            actor,
            actor_role,
            current,
            current + timedelta(days=self.policy.freshness_days),
            self.policy.version,
            decision_hash,
        )
        self._event(
            "FINAL_DECISION", actor, {"decision_id": result.decision_id, "decision": decision.value}
        )
        return result

    def _event(self, event_type: str, actor: str, payload: Mapping[str, Any]) -> None:
        self.audit.append(
            {
                "event_id": f"review-audit:{uuid.uuid4().hex}",
                "bundle_id": self.bundle_id,
                "event_type": event_type,
                "actor": actor,
                "payload": dict(payload),
                "occurred_at": datetime.now(UTC).isoformat(),
            }
        )


class Stage15PublicationCoordinator:
    """Validates Stage 15 authorization before invoking canonical publication."""

    def __init__(self, publication_service: Any) -> None:
        self._publication_service = publication_service
        self._acknowledgements: dict[str, PublicationAcknowledgement] = {}
        self._request_hashes: dict[str, str] = {}

    def validate_command(
        self,
        command: PublishLearningPackageCommand,
        bundle: HumanReviewBundle,
        decision: FinalPublicationDecision,
    ) -> None:
        command.validate()
        if (
            command.review_bundle_id != bundle.bundle_id
            or command.final_decision_id != decision.decision_id
        ):
            raise ReviewError("publication command references the wrong review decision")
        if decision.decision is not FinalPublicationDecisionKind.AUTHORIZE_PUBLICATION:
            raise ReviewError("final decision does not authorize publication")
        if (
            not decision.is_fresh()
            or decision.candidate_fingerprint != bundle.candidate_fingerprint
        ):
            raise ReviewError("final decision is stale or candidate hash changed")
        if (
            command.handoff_id != bundle.handoff.handoff_id
            or command.package_id != bundle.handoff.package_id
        ):
            raise ReviewError("publication command handoff/package mismatch")
        if command.draft_hash != bundle.handoff.draft_hash:
            raise ReviewError("publication command draft hash mismatch")
        if decision.p0_count or decision.p1_count or decision.unknown_count:
            raise ReviewError("blocking findings remain")

    def publish(
        self,
        session: Any,
        command: PublishLearningPackageCommand,
        bundle: HumanReviewBundle,
        decision: FinalPublicationDecision,
        gate_input: PublicationGateInput,
    ) -> PublicationAcknowledgement:
        self.validate_command(command, bundle, decision)
        if command.idempotency_key != gate_input.idempotency_key:
            raise ReviewError("publication command idempotency key mismatch")
        if command.package_id != gate_input.package_id:
            raise ReviewError("publication command package mismatch")
        if command.actor_id != gate_input.authorized_actor:
            raise ReviewError("publication command actor mismatch")
        existing = self._acknowledgements.get(command.idempotency_key)
        if existing is not None:
            if self._request_hashes[command.idempotency_key] != command.request_hash:
                raise ReviewError("publication idempotency conflict")
            return existing
        snapshot = self._publication_service.publish(session, gate_input)
        acknowledgement = self._record_acknowledgement(session, command, snapshot)
        self._acknowledgements[command.idempotency_key] = acknowledgement
        self._request_hashes[command.idempotency_key] = command.request_hash
        return acknowledgement

    def _record_acknowledgement(
        self,
        session: Any,
        command: PublishLearningPackageCommand,
        snapshot: PublicationReleaseSnapshot,
    ) -> PublicationAcknowledgement:
        """Persist and return the durable acknowledgement for a release.

        The canonical BIP-M3 service remains responsible for the release and
        outbox transaction.  Stage 15 only joins those durable records into
        its acknowledgement table, using the same idempotency key and a
        conflict-safe insert so concurrent retries cannot duplicate a result.
        """
        from sqlalchemy import select, text

        from neuralverse_backend.persistence.models import (
            PublicationAuditRecord,
            PublicationCommandRecord,
            TransactionalOutboxEventRecord,
        )

        command_record = session.scalar(
            select(PublicationCommandRecord).where(
                PublicationCommandRecord.idempotency_key == command.idempotency_key
            )
        )
        if command_record is None or command_record.publication_release_id is None:
            raise ReviewError("publication command record was not persisted")
        release_id = str(command_record.publication_release_id)
        audit_record = session.scalar(
            select(PublicationAuditRecord)
            .where(
                PublicationAuditRecord.publication_release_id
                == command_record.publication_release_id
            )
            .order_by(PublicationAuditRecord.created_at.desc())
        )
        outbox_record = session.scalar(
            select(TransactionalOutboxEventRecord)
            .where(
                TransactionalOutboxEventRecord.event_type == "publication.released",
                TransactionalOutboxEventRecord.aggregate_type == "PublicationRelease",
                TransactionalOutboxEventRecord.aggregate_id == release_id,
            )
            .order_by(TransactionalOutboxEventRecord.created_at.desc())
        )
        if audit_record is None or outbox_record is None:
            raise ReviewError("publication audit or outbox record was not persisted")

        result_hash = stable_hash(
            {
                "command_id": command.command_id,
                "idempotency_key": command.idempotency_key,
                "release_id": release_id,
                "release_number": snapshot.release_number,
                "audit_id": str(audit_record.publication_audit_id),
                "outbox_id": str(outbox_record.event_id),
            }
        )
        acknowledgement_id = f"publication-ack:{uuid.uuid4().hex}"
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
                "command_id": command.command_id,
                "idempotency_key": command.idempotency_key,
                "package_id": snapshot.package_id,
                "content_version_id": snapshot.content_version_id,
                "release_id": release_id,
                "release_number": snapshot.release_number,
                "publication_audit_id": str(audit_record.publication_audit_id),
                "outbox_event_id": str(outbox_record.event_id),
                "published_by": command.actor_id,
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
                       publication_audit_id, outbox_event_id, published_by,
                       supersedes_release_id, result_hash, published_at
                FROM stage15_publication_acknowledgements
                WHERE idempotency_key = :idempotency_key
                """
            ),
            {"idempotency_key": command.idempotency_key},
        ).mappings().one()
        return PublicationAcknowledgement(
            acknowledgement_id=str(row["acknowledgement_id"]),
            command_id=str(row["command_id"]),
            idempotency_key=str(row["idempotency_key"]),
            package_id=str(row["package_id"]),
            content_version_id=str(row["content_version_id"]),
            release_id=str(row["release_id"]),
            release_number=int(row["release_number"]),
            publication_audit_id=str(row["publication_audit_id"]),
            outbox_event_id=str(row["outbox_event_id"]),
            published_at=row["published_at"],
            published_by=str(row["published_by"]),
            supersedes_release_id=(
                str(row["supersedes_release_id"])
                if row["supersedes_release_id"] is not None
                else None
            ),
            result_hash=str(row["result_hash"]),
        )
