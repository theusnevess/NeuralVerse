# NeuralVerse Backend Platform - Canonical Source Reconciliation

Canonical identifier: `NV-BIP-M0-P7-RECONCILIATION`<br>
Version: `1.0`<br>
Status: `Discovery Baseline`<br>
Owner: Backend & Integration Platform<br>
Authority: `NV-BIP-000`, `NV-ACP-000`, and explicit project-owner decisions<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-shared-contract-inventory.md`, `backend-platform-cross-front-decisions.md`, `backend-platform-implementation-sequence.md`, `decisions.md`<br>
Supersession state: Active<br>
Last review date: `2026-07-16`

## Source Provenance

| Source | Path | ID | Version | Status | Authority | Owner | Hash | Repository inclusion |
|---|---|---|---|---|---|---|---|---|
| Backend platform | `/home/matheusneves/Projetos/NeuralVerse/canonical-sources/NV-BIP-000.md` | `NV-BIP-000` | `0.1.0` | `PROPOSED` | `PRE-NV-3000 ARCHITECTURE SOURCE` | NeuralVerse Hub | `00d0f84af6b5e89a415b1a42ab75ef531465fed408b66eabb303a0ec743a803c` | `EXTERNAL GOVERNED PROJECT SOURCE` |
| Agent/content platform | `/home/matheusneves/Projetos/NeuralVerse/canonical-sources/NV-ACP-000.md` | `NV-ACP-000` | `0.1.0` | `PROPOSED` | `PRE-NV-3000 ARCHITECTURE SOURCE` | NeuralVerse Hub | `c2eb3a66043ed55fee137dd204be01c40004c6b1cc76a2ee986792ebb4dc17de` | `EXTERNAL GOVERNED PROJECT SOURCE` |

Both files were fully readable: NV-BIP-000 has 2,868 lines and NV-ACP-000 has 2,533 lines. Their `PROPOSED` status is preserved. They supersede repository implementation where their scopes conflict, but do not replace the future approved Cross-Front Integration Contract or constitute executable language-neutral schemas by themselves.

## Authority Reconciliation

- NV-BIP-000 owns backend operational architecture, persistence, workflows, publication execution, delivery, learner-state integration, and operational preservation.
- NV-ACP-000 owns educational meaning, agent boundaries, logical authoring workflow, contribution semantics, package composition, block taxonomy, quality, provenance, and publication-readiness recommendation.
- Current implementation remains evidence, not authority.
- The future Cross-Front Integration Contract becomes final authority for cross-front concerns once approved.
- Repository inclusion of either governed source remains unauthorized.

## Status Axes

Canonical definition statuses: `CANONICALLY_DEFINED`, `CANONICALLY_PARTIAL`, `CANONICALLY_REFERENCED_ONLY`, `NOT_DEFINED_IN_AVAILABLE_CANONICAL_SOURCES`, `CROSS_FRONT_SCHEMA_REQUIRED`.

Implementation statuses: `IMPLEMENTED_RUNTIME_VALIDATED`, `IMPLEMENTED_COMPILE_TIME_ONLY`, `IMPLEMENTED_PARTIAL`, `IMPLEMENTED_DIVERGENT`, `DOCUMENTED_TARGET_ONLY`, `MISSING`, `DUPLICATED_AUTHORITY`.

## Canonical-to-Implementation Matrix

| Contract | Canonical status | Implementation status | Canonical requirements | Repository evidence | Severity | Decision |
|---|---|---|---|---|---|---|
| `CurriculumContract` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` | Curriculum position, prerequisites, competencies, concepts, depth, progression | `CurriculumGraph`, `CurriculumArtifact`, registries | P1 | CF-001, CF-008, CF-013 |
| `AgentContribution` | `CANONICALLY_DEFINED` | `IMPLEMENTED_COMPILE_TIME_ONLY` / `IMPLEMENTED_PARTIAL` / `IMPLEMENTED_DIVERGENT` | 15 fields; immutable, versioned payload, resolved dependencies, evidence, explicit gaps | `EvidenceAggregator.ts` has five fields only | P1 | CF-001, CF-003, CF-008, CF-009, CF-010 |
| `LearningPackageDraft` | `CANONICALLY_DEFINED` | `MISSING` | Identity, instructional contract, ordered blocks, references, assets, experiments, assessment, provenance, quality, lifecycle | Didactic/curriculum outputs are only candidates | P1 | CF-001 through CF-009 |
| `PublicationReadinessRecommendation` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` / `IMPLEMENTED_DIVERGENT` | Nine allowed recommendations, findings, review, backlog, coverage, rationale | `DidacticCompositionCertificationReport` | P1 | CF-007 |
| `PublishedLearningPackage` | `CANONICALLY_DEFINED` | `MISSING` | Package/release/version/schema IDs, ordered blocks, manifests, lab/assessment refs, governance/accessibility/cache metadata | No implementation | P1 | CF-001, CF-002, CF-004, CF-008, CF-012, CF-014 |
| `PublicationRelease` | `CANONICALLY_DEFINED` | `MISSING` | Release/package/version IDs, release number/status, actor/time, schema/manifests, validation, governance, supersession | No implementation | P1 | CF-014 |
| `DeliveryManifest` | `CANONICALLY_REFERENCED_ONLY` | `MISSING` | Required publication/delivery output; exact fields remain open | No implementation | P1 | CF-012, CF-014 |
| `WorkflowExecutionProjection` | `CANONICALLY_REFERENCED_ONLY` | `MISSING` | Backend projection of durable workflow progress/history | No implementation | P2 | CF-008, CF-012 |
| `ContentBlock` | `CANONICALLY_DEFINED` | `IMPLEMENTED_DIVERGENT` | Taxonomy, required metadata, semantic ordering, no frontend styling | Didactic stages, evidence blocks, frontend projections | P0 | CF-002, CF-009, CF-010 |
| `SourceReference` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` | Source identity, authorship, publication, type, claim links, verification, governance | Source strings, URLs, IDs | P1 | CF-003 |
| `Citation` | `CANONICALLY_REFERENCED_ONLY` | `IMPLEMENTED_PARTIAL` | Citation/source manifest required; exact aggregate open | Retrieval/source fixtures | P1 | CF-003 |
| `SourceClaimLink` | `CANONICALLY_REFERENCED_ONLY` | `IMPLEMENTED_PARTIAL` | Claim relationships required; exact aggregate open | Evidence source arrays and IDs | P1 | CF-003 |
| `AssetReference` | `CANONICALLY_DEFINED` | `IMPLEMENTED_DIVERGENT` | Asset/version, hash, MIME, provenance, license, accessibility, package relationship | Resource refs, media IDs, paths/URLs | P1 | CF-004 |
| `LaboratorySpecification` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` | Lab identity, objective, parameters, states, observations, evidence, accessibility, version | `ResearchLaboratoryMetadata`, browser lab contracts | P1 | CF-005, CF-014 |
| `LaboratoryRunSubmission` | `CANONICALLY_REFERENCED_ONLY` | `IMPLEMENTED_PARTIAL` | Learner, exact lab/content versions, inputs, seed/runtime, result/evidence/status | Browser research run/session | P1 | CF-005, CF-014 |
| `AssessmentSpecification` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` | ID, concepts/objectives, cognitive level/type, prompt/verification, feedback, evidence, version | `AssessmentNode`, `VerificationRule` | P1 | CF-006, CF-008 |
| `AssessmentAttemptSubmission` | `CANONICALLY_REFERENCED_ONLY` | `IMPLEMENTED_PARTIAL` | Exact assessment/content versions, learner, response, verification, feedback/evidence | `LearnerResponse`, local verification history | P1 | CF-006, CF-014 |
| `ValidationResult` | `CANONICALLY_DEFINED` | `IMPLEMENTED_DIVERGENT` | Findings, ownership, evidence, severity, revision/retest data | Multiple domain result types | P1 | CF-007, CF-008 |
| `GovernanceReview` | `CANONICALLY_DEFINED` | `IMPLEMENTED_PARTIAL` | Provenance, terminology, coverage, assets, accessibility, lifecycle, consistency | Certification reports and decision metadata | P1 | CF-007 |
| `RevisionDirective` | `CANONICALLY_DEFINED` | `MISSING` | Finding/package/version/owner, expected/actual, evidence, revision, invalidation, retest | Findings only | P1 | CF-007 |
| `EvidencePackage` | `CANONICALLY_DEFINED` | `IMPLEMENTED_DIVERGENT` | Evidence hierarchy, lineage, benchmarks/datasets, confidence, provenance | `EvidenceBundle`, research sessions, tracer | P0 | CF-003, CF-005, CF-009 |

## Canonical Contract Findings

### AgentContribution

NV-ACP-000 section 15 requires `contribution_id`, `generation_job_id`, `agent_id`, `agent_version`, `package_id`, `package_version`, `contribution_type`, `input_dependencies`, `payload_schema_version`, `structured_payload`, `citations`, `asset_requests`, `warnings`, `confidence`, `validation_results`, and `created_at`.

Contributions are immutable after submission; revisions create versions; dependencies resolve; claims cite evidence; payloads validate against versioned schemas; missing information is explicit; empty success and free-form-only content are forbidden. The committed repository `AgentContribution` has only `agentId`, `agentName`, `evidenceType`, `content`, and string `confidence`, with no dedicated runtime validator or shared version metadata.

Canonical: `CANONICALLY_DEFINED`. Implementation: `IMPLEMENTED_COMPILE_TIME_ONLY`, `IMPLEMENTED_PARTIAL`, and `IMPLEMENTED_DIVERGENT`.

### LearningPackageDraft

NV-ACP-000 section 16 defines identity, instructional contract, content ordered blocks, references, assets, experiments, assessment, provenance, quality, and lifecycle. It preserves contribution provenance, block order, source/asset/curriculum relationships, validation state, and version history.

No aggregate implementation exists. The didactic facade, curriculum artifacts, evidence tracer, and frontend projections are partial inputs, not the draft. Canonical: `CANONICALLY_DEFINED`. Implementation: `MISSING`. Exact encoding: `CROSS_FRONT_SCHEMA_REQUIRED`.

### PublicationReadinessRecommendation

Allowed values are `READY_FOR_PUBLICATION`, `READY_WITH_DOCUMENTED_MINOR_BACKLOG`, `REVISION_REQUIRED`, `HUMAN_REVIEW_REQUIRED`, `BLOCKED_BY_EVIDENCE`, `BLOCKED_BY_CONTENT_GAP`, `BLOCKED_BY_ASSET_GAP`, `BLOCKED_BY_GOVERNANCE`, and `REJECTED`.

The recommendation includes package/version, quality-gate results, findings, manual review, accepted backlog, source/asset/assessment/laboratory coverage, and governance rationale. The repository certification report is a semantic equivalent with divergent statuses and missing coverage/manual-review fields. It is not publication authority.

### ContentBlock

NV-ACP-000 defines textual, mathematical, implementation, visual, experimental, applied, assessment, research, narrative, and curiosity taxonomy. Every block declares `block_id`, `block_type`, semantic purpose, source contribution, concept links, curriculum links, required assets, accessibility metadata, rendering priority, optional/required status, and version. CSS, hard-coded colors, pixel sizes, route selectors, scripts, and untrusted HTML are forbidden.

Taxonomy, minimum metadata, semantic ordering, and frontend separation are `CANONICALLY_DEFINED`. Exact JSON/language-neutral encoding and extension mechanism remain `CROSS_FRONT_SCHEMA_REQUIRED`. Repository representations are divergent and incomplete; evidence export is lossy.

### Shared Schema Versioning

NV-BIP-000 requires `schema_name`, `schema_version`, `minimum_reader_version`, `producer_version`, and `created_at`. Major versions are breaking changes, minor versions compatible additions, and patch versions clarifications or validation corrections. Unknown majors are rejected; compatible unknown optional fields are preserved and never silently discarded.

Repository versions are domain-local and incomplete. This is an implementation gap, not an undefined architectural requirement.

### Identifier and Publication Models

NV-BIP-000 requires stable, opaque-where-appropriate, display-independent identifiers: `curriculum_node_id`, `package_id`, `content_version_id`, `block_id`, `source_id`, `citation_id`, `asset_id`, `asset_version_id`, `generation_job_id`, `workflow_id`, `agent_run_id`, `contribution_id`, `validation_result_id`, `governance_review_id`, `publication_release_id`, `learner_id`, `session_id`, `laboratory_run_id`, and `assessment_attempt_id`.

Absent repository identifiers are `CANONICALLY_REQUIRED` / `IMPLEMENTATION_MISSING`. Database keys remain separate.

`PublicationRelease` is canonically defined with `release_id`, `package_id`, `content_version_id`, `release_number`, `release_status`, `published_at`, `published_by`, `schema_versions`, `asset_manifest_id`, `source_manifest_id`, `validation_summary`, `governance_review_id`, and `supersedes_release_id`; implementation is `MISSING`.

`PublishedLearningPackage` must expose package/release/version/schema identities, curriculum position, ordered blocks, source/asset manifests, laboratory/assessment references, governance/accessibility/cache metadata. Requirements are defined; exact encoding is `CROSS_FRONT_SCHEMA_REQUIRED`; implementation is `MISSING`.

## Cross-Front Handoff

Incoming objects are `CurriculumContract`, `AgentContribution`, `LearningPackageDraft`, and `PublicationReadinessRecommendation`. Backend outputs are `PublishedLearningPackage`, `PublicationRelease`, `DeliveryManifest`, and `WorkflowExecutionProjection`.

The backend may add transport and persistence metadata. It may not remove, rename, flatten, reinterpret, silently repair, discard compatible extensions, or change semantic ordering. The Agent & Content Platform must not depend on database tables or transport-specific details.

## Cross-Front Decision Reconciliation

| ID | Status | Canonically settled | Remains open |
|---|---|---|---|
| CF-001 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Stable package/version/release/entity IDs; display-independent | Namespace, formats, legacy aliases |
| CF-002 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Block taxonomy, metadata, semantic order, no styling | Encoding, union/envelope, extensions |
| CF-003 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Provenance, citations, source metadata, claim relationships | Aggregate shapes |
| CF-004 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Asset/version/hash/MIME/provenance/license/accessibility requirements | Encoding/storage projection |
| CF-005 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Lab ownership, specification requirements, exact run references | Spec/config/run/evidence envelope |
| CF-006 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Assessment ownership and exact attempt binding | Attempt/evidence/feedback envelope |
| CF-007 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Recommendation enum, coverage, findings, review, rationale | Review linkage and transport |
| CF-008 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Version fields and compatibility principles | Enforcement and representation |
| CF-009 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | No silent compatible-field discard | Raw/typed preservation implementation |
| CF-010 | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` | Canonical meaning is representation-neutral | JSON Schema/OpenAPI/manual choice |
| CF-011 | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` | Ownership split and table-shape independence | Shared placement |
| CF-012 | `REMAINS_CROSS_FRONT_DECISION_REQUIRED` | Typed published-package client boundary | Generation and adapter strategy |
| CF-013 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | ACP curriculum authority; backend projection; incremental migration | Cutover/parity gate |
| CF-014 | `RESOLVED_BY_CANONICAL_SOURCE` | Exact package/content/lab/assessment/release references | Historical migration encoding |
| CF-015 | `PARTIALLY_RESOLVED_BY_CANONICAL_SOURCE` | Backend retrieval infrastructure; agent tooling deferred | Embedding/chunking ownership |

## Implementation Gaps and Divergences

Implementation gaps: canonical contribution fields/validation, package aggregate, canonical readiness fields, ContentBlock metadata, shared schema metadata, stable identifiers, package/release/delivery/workflow objects, source/citation/link aggregates, asset contract, revision directives, and version-bound learner/lab/assessment records.

Implementation divergences: reduced `AgentContribution`, non-canonical readiness enum, divergent ContentBlock representations, lossy evidence export, incompatible validation result shapes, and browser-local generated identifiers.

## First Vertical-Slice Reassessment

The fixture remains permitted only as `TEST FIXTURE`, `NON-CANONICAL`, `NOT AGENT-GENERATED`, `NOT A FINAL SHARED CONTRACT`, `RAW-PAYLOAD PRESERVING`, `ORDER-PRESERVING`, `SCHEMA-METADATA EXPLICIT`, and `ADAPTER-ISOLATED`.

Use canonical field names where explicitly defined, but do not claim final language-neutral approval. Canonical semantic input requires conformance to AgentContribution, LearningPackageDraft, readiness, ContentBlock, provenance, version, and identifier requirements. Frontend integration additionally requires coherent PublishedLearningPackage/Release/DeliveryManifest encoding. Canonical publication requires all gates, manifests, exact versions, and immutable release behavior.

## BIP-M0 Certification Readiness

Discovery and canonical reconciliation are complete. `UNKNOWN = 0`. P0 gaps are implementation/data-loss risks, not unresolved source identity. P1 gaps are the absent canonical implementations, shared schema enforcement, identifiers, provenance, publication, and exact lab/assessment bindings.

Recommendation: `BIP-M0 DISCOVERY BASELINE CERTIFIED` may be recommended for Phase 7.5. This does not mean `BACKEND IMPLEMENTATION READY`. No certification is executed in this phase.

## Classification

PRESERVE: Canonical semantic requirements, exact order, provenance, version lineage, existing front-local evidence.<br>
ADAPT: Domain validators, didactic certification, curriculum artifacts, research metadata, evidence tracer.<br>
MIGRATE: Contributions, package drafts, publication/release objects, assets, laboratory/assessment records, learner bindings.<br>
DEPRECATE: Frontend projections as semantic authority, generic source strings, display-derived IDs, divergent readiness mapping.<br>
REMOVE: None authorized.<br>
CROSS_FRONT_DECISION_REQUIRED: Exact shared encoding, contract placement, client generation, and remaining CF representation decisions.<br>
UNKNOWN: 0.
