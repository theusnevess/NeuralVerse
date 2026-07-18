# BIP Identifier Model

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Design

All identifiers are:
- UUID-backed frozen dataclasses
- Value comparable and hashable
- Serializable via `str()`
- Parseable via constructor
- Opaque (display-name independent)
- Family-discriminated (cross-family equality rejected)

## Identifier Families (37)

### Identity
- `SystemId` (FAMILY: "system")
- `LearnerId` (FAMILY: "learner")
- `AgentId` (FAMILY: "agent")
- `ServiceId` (FAMILY: "service")

### Curriculum
- `CurriculumNodeId` (FAMILY: "curriculum_node")
- `CurriculumEdgeId` (FAMILY: "curriculum_edge")

### Content
- `ContentPackageId` (FAMILY: "content_package")
- `ContentVersionId` (FAMILY: "content_version")
- `ContentBlockId` (FAMILY: "content_block")
- `ContentBlockRelationshipId` (FAMILY: "content_block_relationship")

### Sources
- `SourceId` (FAMILY: "source")
- `CitationId` (FAMILY: "citation")
- `SourceClaimLinkId` (FAMILY: "source_claim_link")

### Assets
- `AssetId` (FAMILY: "asset")
- `AssetVersionId` (FAMILY: "asset_version")
- `VisualizationSpecId` (FAMILY: "visualization_spec")

### Authoring
- `GenerationJobId` (FAMILY: "generation_job")
- `AgentRunId` (FAMILY: "agent_run")
- `AgentContributionId` (FAMILY: "agent_contribution")
- `ValidationResultId` (FAMILY: "validation_result")

### Orchestration
- `WorkflowId` (FAMILY: "workflow")

### Governance
- `GovernanceReviewId` (FAMILY: "governance_review")
- `RevisionDirectiveId` (FAMILY: "revision_directive")

### Publication
- `PublicationReleaseId` (FAMILY: "publication_release")
- `PublicationManifestId` (FAMILY: "publication_manifest")

### Learner
- `LearnerSessionId` (FAMILY: "learner_session")
- `LearnerNoteId` (FAMILY: "learner_note")
- `LearnerBookmarkId` (FAMILY: "learner_bookmark")
- `LearnerCollectionId` (FAMILY: "learner_collection")
- `LearnerHighlightId` (FAMILY: "learner_highlight")

### Laboratories
- `LaboratorySpecId` (FAMILY: "laboratory_spec")
- `LaboratoryRunId` (FAMILY: "laboratory_run")
- `LaboratoryEvidenceId` (FAMILY: "laboratory_evidence")

### Assessments
- `AssessmentSpecId` (FAMILY: "assessment_spec")
- `AssessmentAttemptId` (FAMILY: "assessment_attempt")
- `AssessmentEvidenceId` (FAMILY: "assessment_evidence")

### Synchronization
- `SynchronizationRecordId` (FAMILY: "synchronization_record")

### Operations
- `OutboxEventId` (FAMILY: "outbox_event")

## Cross-Family Discrimination

```python
ContentPackageId(_value=valid_uuid) != ContentVersionId(_value=valid_uuid)
```

This MUST fail. The identifier model enforces type-safe identity usage.
