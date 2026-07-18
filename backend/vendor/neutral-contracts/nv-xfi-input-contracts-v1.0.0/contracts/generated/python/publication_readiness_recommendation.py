# GENERATED FILE. DO NOT EDIT.
# source_schema_id = urn:neuralverse:xfi:contract:publication-readiness-recommendation:1.0.0
# source_schema_version = 1.0.0
# source_schema_sha256 = 249ace10693abb245353d747ffec091ed10392bf2b29e064aa2f1f8a8becd926
# generator = neuralverse-contract-projections/1.0.0
from __future__ import annotations
from typing import Any, Literal, TypedDict

JsonValue = Any

Identifiers = list[str]
Id = str

class Recommender(TypedDict, total=False):
    kind: Literal['agent', 'human', 'governance']
    agentId: str  # optional
    label: str  # optional

class CoverageValue(TypedDict, total=False):
    status: Literal['evaluated', 'not_applicable', 'not_evaluated']
    value: float  # optional

class Coverage(TypedDict, total=False):
    source: CoverageValue
    contentBlock: CoverageValue
    asset: CoverageValue
    laboratory: CoverageValue
    assessment: CoverageValue
    accessibility: CoverageValue
    governance: CoverageValue

class QualityGateResult(TypedDict, total=False):
    gateId: Id
    gateResult: Literal['PASS', 'PASS_WITH_FINDINGS', 'FAIL', 'UNKNOWN']
    severity: Literal['P0', 'P1', 'P2', 'P3', 'UNKNOWN']
    findings: list[Finding]
    evidenceReferences: Identifiers
    manualReviewRequired: bool
    unresolvedUnknowns: Identifiers

class Finding(TypedDict, total=False):
    findingId: Id
    findingType: str
    severity: Literal['P0', 'P1', 'P2', 'P3', 'UNKNOWN']
    description: str
    evidenceReferences: Identifiers
    blocking: bool

class BacklogItem(TypedDict, total=False):
    backlogItemId: Id
    category: str
    description: str
    severity: Literal['P2', 'P3']
    reasonForAcceptance: str
    affectedPackageArea: str
    evidenceReferences: Identifiers
    requiredFollowUp: str
    blocking: Literal[False]

class UnresolvedUnknown(TypedDict, total=False):
    unknownId: Id
    affectedArea: str
    description: str
    risk: str
    resolutionPath: str
    blocking: bool

class ManualReview(TypedDict, total=False):
    manualReviewId: str
    reviewType: str
    reason: str
    owner: JsonValue
    blocking: bool
    status: Literal['PENDING', 'COMPLETED', 'REJECTED', 'UNKNOWN']  # optional
    reviewResult: Literal['APPROVED', 'REJECTED', 'DEFERRED']  # optional
    reviewedAt: str  # optional
    reviewerId: str  # optional
    evidenceReferences: list[str]  # optional
    metadata: dict[str, JsonValue]  # optional

class PublicationReadinessRecommendation(TypedDict, total=False):
    schema_name: Literal['PublicationReadinessRecommendation']
    schema_version: str
    minimum_reader_version: str
    producer_version: str
    created_at: str
    extensions: dict[str, JsonValue]  # optional
    packageId: str
    packageVersion: str
    recommendation: Literal['READY_FOR_PUBLICATION', 'READY_WITH_DOCUMENTED_MINOR_BACKLOG', 'REVISION_REQUIRED', 'HUMAN_REVIEW_REQUIRED', 'BLOCKED_BY_EVIDENCE', 'BLOCKED_BY_CONTENT_GAP', 'BLOCKED_BY_ASSET_GAP', 'BLOCKED_BY_GOVERNANCE', 'REJECTED']
    recommender: Recommender
    recommenderVersion: str
    qualityGateResults: list[QualityGateResult]
    unresolvedFindingIds: Identifiers
    requiredManualReviews: list[ManualReview]
    acceptedBacklog: list[BacklogItem]
    unresolvedUnknowns: list[UnresolvedUnknown]
    coverage: Coverage
    governanceRationale: str
    recommendedAt: str
    metadata: dict[str, JsonValue]
