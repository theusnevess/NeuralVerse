# BIP Bounded Contexts

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Context Map

| Context | Responsibility | Key Entities |
|---|---|---|
| identity | System, learner, agent, service identities | SystemId, LearnerId, AgentId, ServiceId |
| curriculum | Curriculum graph nodes and edges | CurriculumNode, CurriculumEdge |
| content | Content packages, versions, blocks | ContentPackage, ContentVersion, ContentBlock |
| sources_and_citations | Sources, citations, claim links | Source, Citation, SourceClaimLink |
| assets | Digital assets and versions | Asset, AssetVersion, VisualizationSpec |
| laboratories | Lab specs, runs, evidence | LaboratorySpec, LaboratoryRun, LaboratoryEvidence |
| assessments | Assessment specs, attempts, evidence | AssessmentSpec, AssessmentAttempt, AssessmentEvidence |
| authoring | Generation jobs, agent runs, contributions | GenerationJob, AgentRun, AgentContribution, ValidationResult |
| orchestration | Workflow references and state | WorkflowReference, WorkflowState |
| governance | Reviews and revision directives | GovernanceReview, RevisionDirective |
| publication | Releases and manifests | PublicationRelease, PublicationManifest |
| learner | Profiles, progress, notes, bookmarks | LearnerProfile, LearnerProgress, LearnerNote, LearnerBookmark |
| synchronization | Sync records | SynchronizationRecord |
| search | Search documents and queries | SearchDocumentReference, SearchQuery, SearchRepository |
| operations | Incidents, retries, dead letters, outbox | OperationalIncident, OutboxEvent |

## Cross-Context References

Cross-context references use:
- Stable identifiers (UUID-based value objects)
- Published domain contracts
- Explicit application coordination
- Domain events

Private modules are NOT imported across contexts.

## Shared Primitives

```
Entity, AggregateRoot, DomainEvent, DomainError,
InvariantViolation, LifecycleViolation, ImmutabilityViolation,
IdentityError, LifecycleState, ContentLifecycleState,
UtcTimestamp, VersionNumber, RevisionNumber, SequencePosition,
ContentHash, OpaqueMetadata
```
