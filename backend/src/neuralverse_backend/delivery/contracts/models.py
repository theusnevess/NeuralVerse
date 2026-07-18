"""Neutral, database-independent published delivery contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class PublishedBlockRelationship(ContractModel):
    relationship_id: str
    source_block_id: str
    target_block_id: str
    relationship_type: str
    sequence_position: int = Field(ge=0)
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedContentBlock(ContractModel):
    content_block_id: str
    block_type: str
    sequence_position: int = Field(ge=0)
    semantic_payload: Any
    relationships: list[str] = Field(default_factory=list)
    source_ids: list[str] = Field(default_factory=list)
    citation_ids: list[str] = Field(default_factory=list)
    asset_version_ids: list[str] = Field(default_factory=list)
    laboratory_references: list[str] = Field(default_factory=list)
    assessment_references: list[str] = Field(default_factory=list)
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedSourceReference(ContractModel):
    source_id: str
    title: str
    locator: str
    provenance: str
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedCitationReference(ContractModel):
    citation_id: str
    source_id: str
    target_content_id: str
    locator: str
    purpose: str
    extensions: dict[str, Any] = Field(default_factory=dict)


class ResolvedAsset(ContractModel):
    asset_id: str
    asset_version_id: str
    media_type: str
    content_hash: str
    semantic_purpose: str
    delivery_locator: str
    provenance: str
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedLaboratorySpec(ContractModel):
    laboratory_spec_id: str
    laboratory_spec_version: str
    semantic_instructions: str
    input_contract: Any
    output_contract: Any
    evidence_requirements: Any
    asset_version_ids: list[str] = Field(default_factory=list)
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedAssessmentSpec(ContractModel):
    assessment_spec_id: str
    assessment_spec_version: str
    assessment_type: str
    semantic_prompt: str
    response_contract: Any
    evidence_requirements: Any
    approved_result_metadata: Any
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedValidationSummary(ContractModel):
    status: str
    approved_rule_ids: list[str] = Field(default_factory=list)
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedGovernanceSummary(ContractModel):
    approved: bool
    review_ids: list[str] = Field(default_factory=list)
    extensions: dict[str, Any] = Field(default_factory=dict)


class ExactVersionReference(ContractModel):
    id: str
    version: str


class DeliveryManifest(ContractModel):
    contract_name: str = "DeliveryManifest"
    contract_version: str = "1.0.0"
    minimum_reader_version: str = "1.0.0"
    release_id: str
    release_schema_version: str = "1.0.0"
    generated_from_manifest_id: str
    publication_manifest_id: str
    publication_release_id: str
    content_package_id: str
    content_version_id: str
    ordered_content_block_ids: list[str]
    source_ids: list[str]
    citation_ids: list[str]
    asset_version_ids: list[str]
    laboratory_spec_versions: list[ExactVersionReference]
    assessment_spec_versions: list[ExactVersionReference]
    release_fingerprint: str
    component_fingerprints: dict[str, str] = Field(default_factory=dict)
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublicationRelease(ContractModel):
    contract_name: str = "PublicationRelease"
    contract_version: str = "1.0.0"
    minimum_reader_version: str = "1.0.0"
    release_id: str
    release_schema_version: str = "1.0.0"
    generated_from_manifest_id: str
    publication_release_id: str
    content_package_id: str
    content_version_id: str
    publication_manifest_id: str
    status: str = "released"
    released_at: datetime
    release_fingerprint: str
    governance_review_ids: list[str]
    delivery_manifest: DeliveryManifest
    extensions: dict[str, Any] = Field(default_factory=dict)


class PublishedLearningPackage(ContractModel):
    contract_name: str = "PublishedLearningPackage"
    contract_version: str = "1.0.0"
    minimum_reader_version: str = "1.0.0"
    release_id: str
    release_schema_version: str = "1.0.0"
    generated_from_manifest_id: str
    content_package_id: str
    content_version_id: str
    publication_release_id: str
    publication_manifest_id: str
    curriculum_node_ids: list[str] = Field(default_factory=list)
    revision: int = Field(ge=0)
    released_at: datetime
    blocks: list[PublishedContentBlock]
    relationships: list[PublishedBlockRelationship]
    sources: list[PublishedSourceReference]
    citations: list[PublishedCitationReference]
    assets: list[ResolvedAsset]
    laboratories: list[PublishedLaboratorySpec]
    assessments: list[PublishedAssessmentSpec]
    provenance: PublishedGovernanceSummary
    validation_summary: PublishedValidationSummary | None = None
    extensions: dict[str, Any] = Field(default_factory=dict)
