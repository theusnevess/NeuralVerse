# NeuralVerse Backend Platform - Shared Contract Inventory

Canonical identifier: `NV-BIP-M0-P6.5-CONTRACTS`<br>
Version: `1.0`<br>
Status: `Discovery Baseline / Cross-Front Decision Required`<br>
Owner: Backend & Integration Platform<br>
Authority: NV-BIP-000, NV-ACP-000, explicit project-owner decisions, and repository evidence<br>
Related documents: `backend-platform-target-architecture.md`, `backend-platform-cross-front-decisions.md`, `backend-platform-implementation-sequence.md`, `decisions.md`<br>
Supersession state: Active<br>
Last review date: `2026-07-16`

## Evidence Scope

The backend worktree was inspected at commit `f885d4dabcd0f6ee8131d90dab586f9164e404f7` on `feat/backend-integration-platform`. Canonical source reconciliation is recorded separately in `backend-platform-canonical-reconciliation.md`. Agent-front committed and uncommitted evidence remains implementation evidence only, not semantic authority.

The earlier Phase 6.5 repository search did not find the external canonical files. That was an environmental observation, not a project-source absence. `NV-BIP-000` and `NV-ACP-000` are now verified external governed sources; their requirements supersede conflicting implementation evidence within their scopes.

Observed TypeScript contracts are `COMMITTED_IMPLEMENTATION` and generally `COMPILE_TIME_TYPE`. Runtime validators and deterministic tests are recorded separately. Browser JavaScript records and validators are `FRONTEND_PROJECTION` or `RUNTIME_VALIDATOR`, not shared authority by themselves.

## Contract Status Rules

- `IMPLEMENTED_RUNTIME_VALIDATED`: stable shape, identifiable producer/consumer, runtime validation, compatibility behavior, and validation evidence.
- `IMPLEMENTED_COMPILE_TIME_ONLY`: committed type exists without sufficient runtime validation or transport compatibility.
- `PARTIAL`: meaningful aggregate exists but required boundary fields or lifecycle are absent.
- `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME`: observed shape maps to a requested contract without exact canonical naming.
- `DOCUMENTED_ONLY`: described in architecture or comments without an implementation.
- `DIVERGENT`: multiple meanings or incompatible shapes exist.
- `DUPLICATED_AUTHORITY`: multiple fronts or layers claim operational/semantic authority.
- `MISSING`: no implementation or equivalent found.
- `CROSS_FRONT_DECISION_REQUIRED`: a safe implementation cannot be selected without semantic authority.

## Contract Matrix

| Contract | Canonical owner | Operational owner | Producer | Consumer | Observed implementation | Runtime validation | Schema version | Unknown-field policy | Status | Severity | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `CurriculumContract` | Curriculum authority | Backend curriculum projection | Curriculum kernels/facade | Didactic and frontend loaders | `CurriculumGraph`, `CurriculumArtifact`, learning-path registries | Partial validator functions; no shared envelope | Registry/version strings in subcontracts; no shared schema identity | TypeScript shape only; no shared policy | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-001, CF-008, CF-013 |
| `AgentContribution` | Agent & Content Platform | Backend evidence adapter | `EvidenceAggregator` | Educational orchestration and future package assembly | `AgentContribution` in `EvidenceAggregator.ts` | No dedicated runtime validator | None | Compile-time only | `IMPLEMENTED_COMPILE_TIME_ONLY` | P1 | CF-009, CF-010 |
| `LearningPackageDraft` | Agent/content authority | Backend authoring adapter | No exact producer; didactic/curriculum outputs are candidates | Publication and governance | `DidacticFacadeCompleteOutput`, curriculum artifacts | Partial component validators | Facade `1.0.0`; subcontracts vary | Not defined across aggregate | `CROSS_FRONT_DECISION_REQUIRED` | P1 | CF-002, CF-007, CF-008 |
| `PublicationReadinessRecommendation` | Governance authority | Backend publication gate | Didactic certification and curriculum certification candidates | Publication gate/operator | `DidacticCompositionCertificationReport` | Runtime validation through `ValidationLayer` | No shared schema; `certifiedAt` literal | TypeScript plus validator; no extension policy | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-007 |
| `PublishedLearningPackage` | Content/governance authority | Backend delivery projection | No implementation found | Frontend delivery | No exact implementation | Missing | None | Not found | `MISSING` | P1 | CF-001, CF-002, CF-014 |
| `PublicationRelease` | Publication authority | Backend publication module | No implementation found | Delivery and learner synchronization | Canonically defined by NV-BIP-000; no repository implementation | Missing | None | Not applicable | `MISSING` | P1 | CF-014 |
| `DeliveryManifest` | Delivery/content authority | Backend delivery module | No implementation found | Frontend loader | No exact implementation | Missing | None | Not found | `MISSING` | P1 | CF-001, CF-012, CF-014 |
| `WorkflowExecutionProjection` | Workflow/domain authority | Backend operations | No implementation found | Frontend operations/progress | No exact implementation | Missing | None | Not found | `MISSING` | P2 | CF-008 |
| `ContentBlock` | Content/didactic authority | Backend JSONB adapter | Didactic stages, evidence tracer blocks, frontend sections | Frontend, delivery, publication | `DidacticPipelineStage`, evidence-tracer block, generated block | Partial JavaScript validator for evidence blocks; didactic validator | No shared schema; evidence `nv-evidence-trace/v1` | Evidence export allowlists fields and drops `timestamp`; no common policy | `DIVERGENT` | P0 | CF-002, CF-009 |
| `SourceReference` | Research/content authority | Backend provenance adapter | Research evidence/reference kernels and shared knowledge | Content, retrieval, frontend | `source`, `officialSource`, `sourceId`, `sourceReferenceId` variants | Partial domain validators | No shared schema; research registry versions | Not defined | `DIVERGENT` | P1 | CF-003 |
| `Citation` | Research/content authority | Backend provenance adapter | Retrieval fixtures and research structures | Content and frontend retrieval | Citation-like source URLs and reference IDs; no exact `Citation` type | Missing shared validator | None | Not found | `MISSING` | P1 | CF-003 |
| `SourceClaimLink` | Research/content authority | Backend provenance adapter | Evidence tracer/source relationships | Delivery provenance and audit | Source arrays and `sourceId` links; no claim-link aggregate | Partial evidence validation | None | Not defined | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-003 |
| `AssetReference` | Asset/content authority | Backend assets adapter | Didactic `resourceRef`, media timeline, frontend assets | Content delivery and frontend | Resource references and media IDs; no stable asset contract | Partial required-resource checks | None | Not defined | `MISSING` | P1 | CF-004 |
| `LaboratorySpecification` | Laboratory/agent authority | Backend laboratory adapter | `ResearchLaboratoryMetadata`, laboratory registries, browser lab registry | Didactic placement, frontend laboratory runtime | Research laboratory metadata and lab contracts | Runtime validators for research registry | Laboratory contract version is string; no shared schema identity | TypeScript only; browser persistence stores selected fields | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-005 |
| `LaboratoryRunSubmission` | Laboratory/learning authority | Backend learner/lab adapter | Browser `beginRun`/`finishRun` state | Future durable lab history | Browser research run object | `ResearchStorage.valid` validates only session envelope | Research session schema `1`; laboratory contract version | Unknown fields retained by JSON clone, but no policy | `PARTIAL` | P1 | CF-005, CF-014 |
| `AssessmentSpecification` | Assessment/agent authority | Backend assessment adapter | `AssessmentNode`, `VerificationRule`, registries | Didactic pipeline and frontend assessment | Assessment and verification contracts | Dedicated validators and tests | Registry `version: string`; no common schema identity | TypeScript compile-time plus domain validators | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-006, CF-008 |
| `AssessmentAttemptSubmission` | Assessment/learner authority | Backend learner adapter | Browser verification storage and `LearnerResponse` | Verification and learner history | `LearnerResponse` and local verification records | Deterministic rule validation; no submission envelope validator | No attempt schema/version | Unknown policy not defined | `PARTIAL` | P1 | CF-006, CF-014 |
| `ValidationResult` | Producing semantic authority | Backend operational adapter | Curriculum, didactic, assessment, research validators | Governance and publication | Many domain-specific validation result types | Runtime validators exist per domain | `checkedAt` varies; no shared schema | Domain-specific; no shared policy | `DIVERGENT` | P1 | CF-007, CF-008 |
| `GovernanceReview` | Governance authority | Backend audit/publication | Certification reports and governance metadata | Publication/operator | `AssessmentDecision`, `CurriculumGraphDecision`, certification reports | Partial validators | No shared review schema | Not defined | `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` | P1 | CF-007 |
| `RevisionDirective` | Governance/content authority | Backend authoring adapter | Finding statuses and `needs_revision` outputs | Authoring workflow | No exact directive; findings contain codes/messages/severity | Finding validation exists | None | Not found | `MISSING` | P1 | CF-007 |
| `EvidencePackage` | Evidence/research authority | Backend evidence adapter | `EvidenceBundle`, research sessions, evidence tracer | Publication, learner, frontend | Multiple non-equivalent evidence aggregates | Partial validators | Evidence trace `nv-evidence-trace/v1`; research session `1` | Evidence export is lossy for some fields | `DIVERGENT` | P0 | CF-003, CF-005, CF-009 |

## Field Matrix

The matrix records fields that materially affect cross-front meaning. Fields not observed in the searched evidence are explicitly marked `MISSING` or `UNRESOLVED_SHARED`; no field in this inventory is left as `UNKNOWN`.

| Contract | Field | Aliases | Type | Requiredness | Semantic owner | Operational handling | Version sensitivity | Ordering sensitivity | Observed sources | Status | Divergence | Decision |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Curriculum | `graphId` | `registryId`, `artifactId` | string | Required in graph/artifact | Curriculum | Preserve as semantic ID; separate DB key | No shared version | No | `CurriculumAgentContract.ts` | `SEMANTIC_REQUIRED` | Identifier model mismatch | CF-001 |
| Curriculum | `nodeId` | `referenceId`, `resourceId` | string | Required in node/ref | Curriculum | Preserve and index separately | No shared version | No | Curriculum/didactic contracts | `SEMANTIC_REQUIRED` | Alias collision risk | CF-001 |
| Curriculum | `nodeType` | `resourceType`, `artifactType` | enum/string | Required | Curriculum | Preserve enum; reject unknown only after semantic policy | No shared compatibility | No | Curriculum and didactic contracts | `UNRESOLVED_SHARED` | Enum mismatch | CF-001 |
| Curriculum | `sourceNodeId`/`targetNodeId` | relationship endpoints | string | Required edge | Curriculum | Foreign-key-like operational references | Version-sensitive with graph | Graph order may matter | Curriculum contract | `SEMANTIC_REQUIRED` | None observed | CF-001 |
| Curriculum | `relationshipType` | `dependencyType`, `relationship` | enum/string | Required where relationship exists | Curriculum | Preserve exact value | Version-sensitive | Edge array order may be meaningful | Curriculum contract | `UNRESOLVED_SHARED` | Enum/meaning mismatch | CF-001 |
| Curriculum | `governanceStatus` | `status`, `governance` | enum | Required in several contracts | Governance/curriculum | Store snapshot, never reinterpret | Version-sensitive | No | Curriculum/assessment contracts | `SEMANTIC_REQUIRED` | Enum values differ by domain | CF-007 |
| AgentContribution | `agentId` | `provider`, `generator` | string/union | Required | Agent platform | Preserve as semantic attribution | Version-sensitive | Contribution array order may preserve aggregation | EvidenceAggregator | `SEMANTIC_REQUIRED` | Identifier/attribution mismatch | CF-009 |
| AgentContribution | `agentName` | `agent`, `providedBy` | string | Required | Agent platform | Preserve display and stable ID separately | No shared version | No | EvidenceAggregator | `SEMANTIC_REQUIRED` | Display identity risk | CF-001 |
| AgentContribution | `evidenceType` | `category`, `type` | string | Required | Agent platform | Do not normalize without registry | Version-sensitive | Contribution order preserved | EvidenceAggregator | `UNRESOLVED_SHARED` | Enum mismatch | CF-003 |
| AgentContribution | `content` | `text`, `summary`, `scientificSummary` | string | Required currently | Agent platform | Store lossless payload; avoid generic flattening | Version-sensitive | No | EvidenceAggregator/evidence tracer | `SEMANTIC_REQUIRED` | Evidence model mismatch | CF-003 |
| AgentContribution | `confidence` | `qualityScore`, `confidenceScore` | string currently | Required currently | Agent platform | Preserve raw value; no numerical coercion | Version-sensitive | No | EvidenceAggregator | `DIVERGENT` | Type mismatch | CF-003 |
| Didactic lesson | `id` | `planId`, `artifactId` | string | Required | Didactic authority | Preserve semantic ID | Version-sensitive | No | DidacticAgentContract | `SEMANTIC_REQUIRED` | Identifier aliasing | CF-001 |
| Didactic lesson | `topic` | `title`, `label` | string | Required | Didactic authority | Preserve semantic text | No | No | Didactic contracts | `SEMANTIC_REQUIRED` | Package title not equivalent | CF-002 |
| Didactic lesson | `stages` | `sections`, `blocks` | ordered array | Required | Didactic authority | Preserve exact order and explicit `order` | Version-sensitive | Yes | Didactic contract/evidence tracer | `UNRESOLVED_SHARED` | Ordering and shape mismatch | CF-002 |
| Didactic stage | `stageId` | `type`, `blockType` | enum | Required | Didactic authority | Preserve literal | Version-sensitive | Yes | DidacticAgentContract | `SEMANTIC_REQUIRED` | ContentBlock mapping unresolved | CF-002 |
| Didactic stage | `order` | array index, `position` | number | Required | Didactic authority | Validate uniqueness/sequence | Version-sensitive | Yes | DidacticAgentContract | `SEMANTIC_REQUIRED` | Persistence reorder risk | CF-002 |
| Didactic stage | `status` | `canonicalStatus`, lifecycle | enum | Required | Didactic authority | Preserve; do not map to publication status | Version-sensitive | No | Didactic/evidence tracer | `DIVERGENT` | Lifecycle mismatch | CF-002 |
| Didactic resource | `resourceId` | `sourceId`, `artifactId`, `laboratoryId` | string | Required when selected | Resource semantic owner | Preserve exact ID and resource type | Version-sensitive | No | Didactic contracts | `SEMANTIC_REQUIRED` | Cross-domain ID collision risk | CF-001 |
| Didactic resource | `resourceType` | `sourceType`, `artifactType` | enum | Required | Resource semantic owner | Preserve; no generic source coercion | Version-sensitive | No | DidacticAgentContract | `UNRESOLVED_SHARED` | Enum mismatch | CF-002 |
| Provenance | `source` | `officialSource`, `sourceUrl` | string | Required in many contracts | Source authority | Store as provenance field, not identity | Version-sensitive | No | Curriculum/research/assessment | `SEMANTIC_REQUIRED` | URL/source identity ambiguity | CF-003 |
| Provenance | `providedBy` | `provider`, `generator`, `decidedBy` | string | Required in selected contracts | Producing authority | Preserve actor attribution | Version-sensitive | No | Curriculum/didactic/research | `UNRESOLVED_SHARED` | Actor model mismatch | CF-003 |
| Provenance | `rationale` | `reason`, `explanationSource` | string | Required in governed records | Semantic owner | Preserve losslessly | Version-sensitive | No | Agent contracts/evidence tracer | `SEMANTIC_OPTIONAL` | Meaning differs by domain | CF-003 |
| Evidence | `sourceId` | `sourceReferenceId`, `resourceId` | string | Required in some evidence | Evidence authority | Preserve graph edge, not just text | Version-sensitive | No | Evidence tracer/retrieval fixtures | `SEMANTIC_REQUIRED` | Source-claim link absent | CF-003 |
| Evidence | `blockId` | `sectionId`, `planId` | string | Required by evidence validator | Didactic/evidence authority | Stable semantic ID | Version-sensitive | Yes by block sequence | evidence-tracer.js | `SEMANTIC_REQUIRED` | Generated IDs are session-local | CF-001 |
| Evidence | `canonicalStatus` | `governanceStatus` | enum | Required in tracer | Governance authority | Preserve exact domain status | Version-sensitive | No | evidence-tracer.js | `DIVERGENT` | `Canonical`/`NonCanonical` differs from governance enum | CF-007 |
| Evidence | `generated` | `isGenerated` | boolean | Required in tracer | Agent authority | Preserve, do not infer | Version-sensitive | No | evidence-tracer.js | `SEMANTIC_REQUIRED` | None observed | CF-003 |
| Evidence | `confidence` | `qualityScore` | number/string | Required in tracer, string in contributions | Evidence authority | Preserve raw plus normalized only if approved | Version-sensitive | No | EvidenceAggregator/evidence-tracer | `DIVERGENT` | Type mismatch | CF-003 |
| Evidence | `insertionReason` | `reason`, `supportAction` | enum/string | Optional/defaulted | Didactic authority | Preserve default provenance | Version-sensitive | No | evidence-tracer.js | `SEMANTIC_OPTIONAL` | Default mismatch risk | CF-003 |
| Assessment | `id` | `ruleId`, `responseId`, `artifactId` | string | Required per entity | Assessment authority | Preserve entity namespace | Version-sensitive | No | AssessmentAgentContract | `SEMANTIC_REQUIRED` | Shared ID namespace absent | CF-006 |
| Assessment | `status` | `reviewStatus`, `result` | enum | Required per entity | Assessment authority | Separate lifecycle from verification result | Version-sensitive | No | Assessment contracts | `DIVERGENT` | Lifecycle/result collision | CF-006 |
| Assessment | `version` | `registry.version`, `research version` | string | Required in some provenance/registries | Contract owner | Preserve exact version; no inferred semver | Yes | No | Assessment contracts | `UNRESOLVED_SHARED` | No common schema identity | CF-008 |
| Assessment | `expectedAnswer` | `submittedAnswer` | string array | Required rule/attempt respectively | Assessment authority | Do not persist learner response as specification | Yes | Array order may be semantic | AssessmentAgentContract | `SEMANTIC_REQUIRED` | Spec/attempt boundary | CF-006 |
| Laboratory | `laboratoryId` | `lab.id`, `resourceId` | string | Required | Laboratory authority | Preserve stable semantic ID | Yes | No | Research contracts/research-mode.js | `SEMANTIC_REQUIRED` | Alias collision risk | CF-005 |
| Laboratory | `laboratoryContractVersion` | `lab.version` | string | Required in run/session | Laboratory authority | Required exact version reference | Yes | No | research-mode.js/research-storage.js | `SEMANTIC_REQUIRED` | No package/content version | CF-005, CF-014 |
| Laboratory | `configurationSnapshot` | execution config | object | Required for run reproducibility | Laboratory/runtime authority | Preserve as execution snapshot, not specification | Yes | Object keys not semantic order | research-mode.js | `SEMANTIC_REQUIRED` | Spec/config boundary | CF-005 |
| Laboratory | `runId` | `id`, `evidenceId` | string | Required run/evidence links | Laboratory authority | Preserve; backend may add DB key | Yes | Run array order may be history order | research-mode.js | `SEMANTIC_REQUIRED` | Browser random/time IDs | CF-005 |
| Laboratory | `terminalResult` | result/output | object | Optional until completion | Laboratory authority | Preserve losslessly | Yes | No | research-mode.js | `SEMANTIC_OPTIONAL` | Result status taxonomy incomplete | CF-005 |
| Package | `packageId` | graph/artifact/plan IDs | string | Required future package | Content authority | Backend cannot invent semantic replacement | Yes | No | No exact implementation | `MISSING` | Missing stable package identity | CF-001 |
| Package | `contentVersionId` | `version`, `laboratoryContractVersion` | string | Required future release/learner link | Content/publication authority | Backend must preserve exact reference | Yes | No | Phase 6 docs only | `MISSING` | Version ambiguity | CF-014 |
| Release | `publicationReleaseId` | `releaseId` | string | Required future release | Publication authority | Backend operational reference to immutable release | Yes | No | Phase 6 docs only | `MISSING` | No implementation | CF-014 |
| Validation | `valid` | `validationPassed`, `matched` | boolean | Required validator result | Producing semantic authority | Store result snapshot | Version-sensitive | No | Domain validators | `SEMANTIC_REQUIRED` | Boolean meaning differs | CF-007 |
| Validation | `errors` | `findings`, `validationErrors` | array | Required/optional by domain | Producing authority | Preserve code/message/field/severity | Version-sensitive | Finding order may matter for display | All domain contracts | `DIVERGENT` | Finding shape mismatch | CF-007 |
| Validation | `checkedAt` | `certifiedAt`, timestamp | literal/string | Required in many validators | Producing authority | Preserve semantic phase; separate operational timestamp | Yes | No | Domain contracts | `DIVERGENT` | Timestamp/phase collision | CF-008 |
| Governance | `status` | certification status, governance status | enum | Required | Governance authority | Never treat recommendation as command | Yes | No | Didactic certification | `UNRESOLVED_SHARED` | Enum/lifecycle mismatch | CF-007 |
| Governance | `severity` | `error`, `warning`, `recommendation` | enum | Required finding | Governance authority | Preserve severity exactly | Yes | Finding array order may be shown | Didactic certification | `SEMANTIC_REQUIRED` | Backend P-level mapping must be additive | CF-007 |
| Governance | `qualityDimension` | category, evidenceType | enum/string | Required finding | Governance authority | Preserve unknown compatible value | Yes | No | Didactic certification | `UNRESOLVED_SHARED` | Cross-domain taxonomy mismatch | CF-007 |
| Transport | `schema` | `schemaName` | string | Required in evidence export only | Contract authority | Preserve and validate version separately | Yes | No | `nv-evidence-trace/v1` | `SEMANTIC_REQUIRED` | No universal schema field | CF-008 |
| Transport | `schemaVersion` | `version`, `facadeVersion` | number/string | Required only in some payloads | Contract authority | Do not coerce across domains | Yes | No | persistence/research/facade | `DIVERGENT` | Version model mismatch | CF-008 |
| Operational | `persistence_id` | DB ID | backend-only | Backend | Backend | Separate from semantic IDs | No | No | Phase 6 target | `OPERATIONAL_BACKEND_ONLY` | None | None |
| Operational | `correlation_id` | requestId/traceId | string | Transport-required | Backend | Add outside semantic payload | No | No | Phase 6 target and LLM types | `OPERATIONAL_BACKEND_ONLY` | None | None |
| Operational | `workflow_id` | run/session ID when mapped | string | Optional until workflow | Backend | Add outside semantic payload | No | No | Phase 6 target | `OPERATIONAL_BACKEND_ONLY` | Must not replace run ID | None |

## Curriculum Contract

Observed implementations are committed curriculum graph, dependency, progression, learning-path, roadmap, coverage, review/reinforcement, evolution, certification, and facade types in `src/agents/curriculum-pipeline/CurriculumAgentContract.ts`.

The stable observed fields include graph/node/edge IDs, node type, reference ID, source, governance status, rationale, provider, relationship type, ordered node/edge arrays, deterministic flags, generated-from markers, trace IDs, decisions, validation errors, and registry counts. These are rich internal contracts, not a single `CurriculumContract`.

Validation is partial-to-strong within individual kernels. It checks required IDs, relationship integrity, governance values, counts, and domain invariants. No common runtime envelope, semantic schema identity, reader version, unknown-field policy, package identity, content version, or publication release exists.

Status: `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME` with `DIVERGENT` aggregation. Decision IDs: CF-001, CF-008, CF-013, CF-014.

## Agent Contribution

Observed implementation: `src/ai/orchestration/EvidenceAggregator.ts`, committed. `AgentContribution` has `agentId`, `agentName`, `evidenceType`, `content`, and string `confidence`; `EvidenceBundle` contains typed arrays plus ordered `agentContributions` and a numeric completeness score.

Producer: deterministic evidence aggregation. Consumers: prompt compilation, educational orchestration, response generation. Runtime validation: no dedicated validator. Versioning: none. Unknown-field behavior: TypeScript compile-time only. Attribution is present but no stable contribution ID, source claim link, generation job, agent run, or content-version reference exists.

Status: `IMPLEMENTED_COMPILE_TIME_ONLY`. Decision IDs: CF-003, CF-009, CF-010.

## Learning Package Draft

No exact implementation exists. The closest semantic aggregate is the complete didactic facade output containing a lesson plan, certification report, validation results, and deterministic trace metadata, combined with curriculum artifacts and resource references.

The aggregate does not provide a shared package identity, content version, ordered content-block envelope, source/citation graph, stable asset references, lifecycle, compatibility identity, or lossless extension policy. A fixture may be used only as a non-canonical local aggregate after CF-001, CF-002, CF-007, and CF-008 are isolated.

Status: `CROSS_FRONT_DECISION_REQUIRED`. Decision IDs: CF-001, CF-002, CF-003, CF-004, CF-005, CF-006, CF-007, CF-008, CF-009, CF-010.

## Publication Readiness

The strongest observed equivalent is `DidacticCompositionCertificationReport`, with `planId`, `topic`, `status`, findings, checked dimensions, counts, quality score, deterministic marker, and `certifiedAt: 'composition_certification'`. Status values are `certified`, `certified_with_warnings`, `needs_revision`, and `blocked`; finding severity is `error`, `warning`, or `recommendation`.

This is a certification report, not a shared publication recommendation. It does not define required assets, source completeness, release identity, content version, manual governance actor, or a backend publication command. The backend must record it as a recommendation snapshot and must not convert it into publication authority.

Status: `SEMANTIC_EQUIVALENT_WITH_DIFFERENT_NAME`. Decision ID: CF-007.

## Published Package and Release

No committed implementation, runtime validator, schema, producer, or consumer was found for `PublishedLearningPackage`, `PublicationRelease`, or `DeliveryManifest`. NV-BIP-000 canonically defines the requirements; repository implementation remains missing.

Required future fields remain unresolved: package identity, content version, release identity, immutable publication timestamp, supersession relationship, delivery projection, and exact source/asset provenance. Status: `MISSING` / `DOCUMENTED_ONLY`. Decision IDs: CF-001, CF-012, CF-014.

## ContentBlock

Observed representations are not equivalent:

- `DidacticPipelineStage`: ordered `stageId`, `order`, status, label, description, omission reason, resource reference.
- Evidence tracer block: `blockId`, source arrays, explanation source, insertion reason, generated flag, generator, confidence, canonical status.
- Generated evidence block: similar fields with generated/non-canonical status.
- Frontend educational sections/cards: presentation-oriented types with their own IDs, order, type, content, and metadata.

The observed validator enforces block IDs, duplicate detection, canonical-status values, generated/non-canonical consistency, insertion-reason warnings, and confidence range. Export uses `schema: 'nv-evidence-trace/v1'` and explicitly omits `timestamp`, making it a round-trip loss risk for the source object.

Compatible options requiring cross-front selection:

- Typed discriminated union with a common envelope and exact ordering.
- Generic block type plus lossless payload and typed projections.
- Family-specific semantic contracts under a common ordered package envelope.

Status: `DIVERGENT`. Decision ID: CF-002, CF-009.

## Sources, Citations and Provenance

Observed structures include curriculum `source` and `providedBy`, research `officialSource`, evidence-tracer source arrays, retrieval `sourceReferenceId`, browser `sourceId`, and assessment/feedback provenance objects with provider, source, review status, review date, version, and rationale.

No exact `SourceReference`, `Citation`, or `SourceClaimLink` aggregate was found. Source identity, citation display, claim support, evidence lineage, and agent attribution are not separated consistently. Block-level provenance exists in the evidence tracer, while contribution-level provenance is represented mostly by agent IDs and source strings.

Status: `DIVERGENT`. Decision ID: CF-003.

## Asset Reference

Observed asset-like values are `DidacticResourceRef`, media timeline IDs, visualization/laboratory IDs, static relative paths, and frontend asset URLs. No stable asset identity/version contract with MIME, hash, license, accessibility, provenance, and package relationship was found.

Relative paths and resolved URLs are frontend transport/projection details, not stable asset identity. Status: `MISSING`. Decision ID: CF-004.

## Laboratory Contracts

`ResearchLaboratoryMetadata` is a pedagogical/registry specification equivalent. It contains laboratory ID, type, purpose, integration mode, title, description, associated evidence/methods/benchmarks/datasets/reading paths, official source, governance status, lifecycle, rationale, and provenance.

Browser `ResearchSession` and `run` objects are operational execution records. They contain session schema version `1`, laboratory contract version, run IDs, state, timestamps, configuration snapshot, dataset reference, seed, terminal result, measurements, evidence IDs, observations, interpretations, comparisons, limitations, conclusion, and reproducibility metadata.

The boundary between pedagogical specification, client execution configuration, run submission, evidence, and result is not a shared contract. Status: `PARTIAL`. Decision IDs: CF-005, CF-014.

## Assessment Contracts

`AssessmentNode` and `VerificationRule` are pedagogical/verification specification equivalents. Assessment fields include ID, title, artifact type, domain, lifecycle status, governance, provenance, and deterministic trace. Verification fields include rule ID, title, verification type, response type, matching strategy, expected answers, status, governance, provenance, and trace.

`LearnerResponse` is an attempt-like object with response ID, rule ID, response type, submitted answer array, and optional timestamp. `VerificationResult` is deterministic output with rule ID, result, matched boolean, reason, and trace. No shared assessment-attempt envelope, exact content version, evidence policy, feedback/attempt persistence contract, or mastery model exists. The agent documentation explicitly excludes mastery/adaptive tutoring from the current scope.

Status: `PARTIAL`. Decision IDs: CF-006, CF-014.

## Identifier Audit

| Identifier family | Observed form | Stability | Backend treatment | Finding |
|---|---|---|---|---|
| Curriculum node | `nodeId`, `referenceId` | Semantic string, format not governed | Preserve; separate DB key | `CROSS_FRONT_IDENTIFIER_COLLISION` |
| Learning path/module/lesson/artifact | resource/content IDs in loaders and refs | Existing strings; no shared envelope | Preserve exact value | `MISSING_STABLE_IDENTIFIER` for package scope |
| Package/content version/release | Not found in implementation | Not established | Backend may not invent semantic IDs | `MISSING_STABLE_IDENTIFIER` |
| Block | `blockId`, section-derived IDs, generated IDs | Some stable, some session-local | Preserve source ID; flag generated IDs | `DISPLAY_DERIVED_IDENTIFIER_RISK` |
| Source/citation | `sourceId`, `sourceReferenceId`, `officialSource` | Mixed semantic/reference/URL values | Separate source identity from URL | `CROSS_FRONT_IDENTIFIER_COLLISION` |
| Asset | Relative path, media ID, resource ID | Not a durable identity | Requires asset decision | `MISSING_STABLE_IDENTIFIER` |
| Laboratory | `laboratoryId`, `lab.id`, `runId`, `evidenceId` | Lab ID stable within registry; run/evidence local | Preserve and version | `MUTABLE_IDENTIFIER_RISK` |
| Assessment | `id`, `ruleId`, `responseId`, artifact IDs | Entity-local namespaces | Preserve namespace | `CROSS_FRONT_IDENTIFIER_COLLISION` |
| Generation/workflow/agent run | No shared generation/workflow ID; agent IDs exist | Not established | Backend operational IDs only | `MISSING_STABLE_IDENTIFIER` |
| Validation/governance/release | No shared IDs; local decision/trace IDs | Domain-local | Preserve semantic IDs where present | `MISSING_STABLE_IDENTIFIER` |
| Learner/interaction | Browser persistence has no explicit learner ID; response IDs exist | Browser-local | Requires identity decision | `MISSING_STABLE_IDENTIFIER` |

Database primary keys must remain separate from all semantic identifiers.

## Ordering Audit

Required ordered structures are didactic pipeline stages, curriculum nodes/edges where sequence is consumed, evidence block arrays, media timelines, transition maps, assessment answer arrays, research runs, evidence records, observations, interpretations, comparisons, and revision/finding lists.

Explicit order exists for didactic stages through `order` and for some reading paths through `order`. Most arrays rely on serialization/insertion order. Browser persistence stores arrays in JSON, preserving order at the storage layer, but backend relational persistence could reorder them unless position is explicit. Evidence export preserves array order but does not export all fields. No shared round-trip ordering contract exists.

Status: `ORDER_PRESERVATION_REQUIRED`. Required decisions: CF-002, CF-003, CF-006, CF-009.

## Version and Compatibility Audit

Observed version mechanisms are:

- Facade version `1.0.0`.
- Evidence export schema `nv-evidence-trace/v1`.
- Research session schema version `1`.
- Laboratory contract version string.
- Assessment and verification registry version strings.
- Browser persistence backup schema version `1`.

No universal `schema_name`, `schema_version`, `minimum_reader_version`, or `producer_version` exists. Unknown-major rejection is implemented only for the browser backup validator. Compatible-minor preservation is not a shared policy. Deprecated-field handling is domain-specific or absent. Database schema version and semantic schema version are not yet separated in implementation.

Status: `DIVERGENT`. Decision ID: CF-008, CF-009.

## Unknown-Field Preservation Audit

| Layer | Observed behavior | Classification |
|---|---|---|
| TypeScript interfaces | Compile-time excess-property behavior only; no runtime policy | `NOT FOUND AFTER SEARCH` |
| Domain validators | Validate known fields; common unknown-field policy absent | `NOT FOUND AFTER SEARCH` |
| Evidence tracer export | Explicit allowlist; `timestamp` is discarded | `DISCARD` |
| Research session JSON clone | Retains arbitrary object fields during clone, but validator checks only required envelope | `PRESERVE_IN_RAW_PAYLOAD_ONLY` |
| Persistence backup | Allowlisted namespaces/keys; independent keys may be omitted | `DISCARD` for omitted domains |
| Frontend projections | Frequently construct smaller display objects | `DISCARD` unless source object retained |
| Backend target | No implementation | `NOT FOUND AFTER SEARCH` |

Discarding semantic fields is P0/P1 depending on whether the field is semantic. No backend schema may be authored until CF-009 defines the compatible-field policy.

## Runtime Validation

Strongest runtime validators exist for curriculum kernels, didactic plans/certification, assessment registries and verification, research laboratory registries, and browser evidence traces. These validators are domain-specific and return incompatible result shapes.

Compile-time-only or partial areas include `AgentContribution`, package/release/delivery contracts, source/citation links, asset references, synchronization envelopes, workflow projections, and learner attempt envelopes. No Pydantic or backend validator exists because backend implementation is not authorized.

Validation errors commonly contain `code`, `message`, optional `field`, and optional entity/stage/laboratory IDs. Didactic certification findings contain severity and quality dimension. There is no shared error taxonomy or version compatibility result.

## Serialization and Round Trip

Observed transformations include agent contribution aggregation, didactic composition/certification, evidence-tracer export, research-session JSON persistence/export, persistence-manager backup/import, retrieval fixture projections, and frontend loader projections.

Risks:

- Evidence export allowlists fields and omits `timestamp`.
- Browser backup allowlists namespaces and does not comprehensively include all state.
- JSON clone preserves values but does not establish semantic schema compatibility.
- Date fields are mixed ISO strings, nulls, or literal phase markers.
- Enums are domain-specific and may be flattened into generic status fields.
- IDs are often generated with browser time/random values for sessions, runs, and evidence.
- Numeric/string confidence representations differ.
- Array order is preserved in JSON but not guaranteed by a future relational projection without positions.

These are `ROUND_TRIP_DATA_LOSS_RISK` findings. The first slice must use a lossless raw semantic payload boundary and explicit ordered arrays.

## Cross-Front Decision Registry

| Decision | Evidence | Options | Backend recommendation | Required ruling | Status |
|---|---|---|---|---|---|
| CF-001 package identifiers | No package identity; many domain IDs | Stable opaque semantic ID; deterministic legacy adapter; composite ID | Preserve semantic ID, separate DB key | Project owner + curriculum/content | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-002 ContentBlock | Didactic stages and evidence blocks diverge | Union envelope; generic lossless payload; family contracts/common envelope | Common ordered envelope with lossless payload is safest temporary boundary | Agent/content + frontend | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-003 sources/citations | URLs, source IDs, provenance arrays differ | Source graph; source/citation split; claim links | Separate source identity, citation, claim link, attribution | Research/content authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-004 assets | Relative paths/media IDs only | Immutable asset ID/version; URL projection; metadata registry | Asset ID/version plus URL projection | Asset/content authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-005 laboratories | Specification and execution state are mixed across layers | Immutable spec + config; aggregate snapshot; separate evidence package | Separate specification, config, run, evidence, result | Laboratory authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-006 assessments | Specification, response, verification, feedback differ | Separate spec/attempt/result; aggregate attempt; no durable attempt yet | Separate immutable specification and version-bound attempt | Assessment authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-007 readiness | Certification reports are not publication commands | Recommendation; gate decision; governance review aggregate | Store recommendation snapshot; backend gate remains operational | Governance authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-008 compatibility | Version fields are domain-local | JSON Schema versions; OpenAPI transport versions; manual contracts | Language-neutral semantic schema plus transport schema | Project owner + both fronts | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-009 unknown fields | Evidence and backup exports discard fields | Preserve; raw payload only; reject | Preserve compatible fields in raw payload and projections | Both fronts | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-010 language-neutral representation | TypeScript dominates; no shared schema | JSON Schema; OpenAPI; manual models | JSON Schema candidate, not approved | Project owner + both fronts | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-011 contract placement | No shared contract location | `contracts/`; `packages/contracts/`; `schemas/`; split ownership | Decide before generation or imports | Project owner | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-012 client generation | No generated API client | OpenAPI; generated schemas; hand-written adapters | Prefer generated transport client after semantic schema decision | Frontend/backend | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-013 curriculum authority | Static loaders and agent graphs coexist | Static first; backend projection; agent authority | Preserve current static authority until equivalence gate | Curriculum authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-014 content/release identity | No content-version/release fields in learner state | Version + release required; version only; migration uncertainty | Require both for new durable interactions | Content/publication authority | `CROSS_FRONT_DECISION_REQUIRED` |
| CF-015 embeddings/chunking | No ownership contract | Backend-owned; agent-owned; shared indexing contract | Backend stores only after semantic owner decides model/chunking | Retrieval authority | `CROSS_FRONT_DECISION_REQUIRED` |

## Language-Neutral Representation

Option A, JSON Schema with generated TypeScript/Pydantic models, has the best cross-language expressiveness, discriminated unions, compatibility vocabulary, and code-generation potential. It still requires a repository ownership decision and careful additional-properties policy.

Option B, OpenAPI components, is strong for transport but insufficient as the complete semantic authority. Option C, hand-maintained models with contract tests, minimizes tooling but increases drift and duplicate maintenance. No option is approved by current evidence.

Status: `CROSS_FRONT_DECISION_REQUIRED`, CF-010.

## Shared Contract Placement

No shared contract location exists. Options are repository-root `contracts/`, `packages/contracts/`, `schemas/`, or separate agent semantic schemas plus backend transport adapters. The placement must support TypeScript and Python consumers, branch isolation, generated artifacts, semantic ownership, and integration review without circular imports.

Recommendation: decide a language-neutral source location before generating clients or Pydantic models. Do not create the location in Phase 6.5. Status: `CROSS_FRONT_DECISION_REQUIRED`, CF-011.

## Backend-Owned Operational Envelope

Allowed metadata:

- `persistence_id`
- `persisted_at`
- `correlation_id`
- `workflow_id`
- `generation_job_id`
- `idempotency_key`
- `request_fingerprint`
- database timestamps
- publication execution metadata
- audit metadata
- transport metadata

These fields are `BACKEND_OPERATIONAL_DECISION`. They must be outside the preserved semantic object or clearly namespaced. They must not replace package, block, source, asset, laboratory, assessment, learner, or release identifiers. They may be stored in relational columns and transport envelopes, while the semantic payload remains lossless JSONB until shared schemas are approved.

## First Vertical-Slice Impact

| Decision class | Findings |
|---|---|
| Required before fixture | None for a clearly isolated, non-canonical fixture; the fixture must preserve raw payload and exact ordering |
| Not required for fixture | Canonical package semantics, real agent attribution, managed assets, real laboratory/assessment semantics, embeddings, generated clients |
| Required before real agent input | CF-001, CF-002, CF-003, CF-007, CF-008, CF-009, CF-010; applicable CF-004/005/006 when payloads are present |
| Required before frontend integration | CF-001, CF-002, CF-008, CF-009, CF-012, CF-013, CF-014 |
| Required before canonical publication | CF-001 through CF-009 and CF-014; CF-010/011 for long-term maintenance |

Temporary fixture boundary is safe only when it is named locally, marked `TEST FIXTURE / NON-CANONICAL / NOT AGENT-GENERATED`, cannot be imported as a canonical contract, preserves unknown fields, preserves ordered arrays, and has a replacement gate in Phase 7. It must not use final shared contract names.

## Divergences

### P0

- `DIV-001` ContentBlock shape and evidence block shape diverge; backend persistence or delivery could discard semantic fields or alter ordering. Categories: `FIELD_TYPE_MISMATCH`, `ORDERING_MISMATCH`, `ROUND_TRIP_PRESERVATION_GAP`.
- `DIV-002` Evidence export explicitly omits source-object `timestamp`; semantic loss is possible if timestamp is meaningful. Categories: `ROUND_TRIP_PRESERVATION_GAP`, `SERIALIZATION_MISMATCH`.

### P1

- `DIV-003` No stable package, content-version, or publication-release identifiers exist in committed shared implementations. Categories: `MISSING_CONTRACT`, `IDENTIFIER_MODEL_MISMATCH`.
- `DIV-004` Source, citation, claim link, attribution, and evidence are represented by overlapping strings/arrays rather than distinct contracts. Categories: `PROVENANCE_MISMATCH`, `SEMANTIC_OWNERSHIP_MISMATCH`.
- `DIV-005` Laboratory specification, execution configuration, run, evidence, and result are split between agent types and browser-local state without a shared boundary. Categories: `CONTRACT_NAME_MISMATCH`, `VERSION_MODEL_MISMATCH`.
- `DIV-006` Assessment specification, learner response, verification result, feedback, and attempt evidence lack a shared version-bound submission contract. Categories: `LIFECYCLE_MISMATCH`, `VERSION_MODEL_MISMATCH`.
- `DIV-007` Unknown-field behavior is inconsistent: explicit export allowlists discard fields, while JSON clone retains them opportunistically. Category: `UNKNOWN_FIELD_POLICY_MISMATCH`.
- `DIV-008` Domain validators use incompatible validation result and status models. Categories: `FIELD_TYPE_MISMATCH`, `ENUM_VALUE_MISMATCH`.
- `DIV-009` Agent contribution confidence is string-valued while evidence-tracer confidence is numeric. Category: `FIELD_TYPE_MISMATCH`.

### P2

- `DIV-010` Most semantic contracts are compile-time-only or domain-local runtime validated. Category: `RUNTIME_VALIDATION_GAP`.
- `DIV-011` Facade, registry, persistence, research, and evidence versions have no common compatibility policy. Category: `VERSION_MODEL_MISMATCH`.
- `DIV-012` Frontend projections use display/resource IDs and may flatten semantic records. Category: `TRANSPORT_PROJECTION_MISMATCH`.
- `DIV-013` Documentation describes target package/release concepts without committed implementation. Category: `DOCUMENTATION_IMPLEMENTATION_DRIFT`.
- `DIV-014` Tests prove deterministic internal domains but not cross-front serialization or contract round trips. Category: `TEST_COVERAGE_GAP`.

### P3

- `DIV-015` Terminology varies between `source`, `officialSource`, `sourceId`, `sourceReferenceId`, and `providedBy`. Category: `CONTRACT_NAME_MISMATCH`.
- `DIV-016` `checkedAt`, `certifiedAt`, timestamps, and literal validation phases are inconsistently named. Category: `FIELD_NAME_MISMATCH`.

## Capability Classification

PRESERVE: Committed agent semantic fields; exact ordered arrays; domain provenance; deterministic flags; validation findings; existing semantic IDs; browser local research session payloads during transition.

ADAPT: Curriculum artifacts into a future package adapter; didactic certification into readiness recommendation snapshots; research metadata into laboratory specifications; verification rules into assessment specifications; evidence tracer into source/claim-aware evidence adapters.

MIGRATE: Version-bound learner interactions; laboratory runs/evidence; assessment attempts; publication records; stable package/release references; managed asset metadata after decisions are approved.

DEPRECATE: Generic source strings as citation authority; display-derived IDs; direct frontend projections used as semantic payloads; duplicated package/readiness interpretations.

REMOVE: None authorized.

CROSS_FRONT_DECISION_REQUIRED: CF-001 through CF-015, with P0/P1 divergences resolved before real canonical input.

UNKNOWN: 0.

## Completion Assessment

Both worktrees were verified and remained inspectable. Required contract names and semantic equivalents were searched. Committed and uncommitted evidence were separated. Producers, consumers, validator state, version state, identifier state, ordering state, serialization risks, and field ownership were inventoried for observed contracts. The earlier external-source absence is retained only as historical Phase 6.5 environment evidence; current canonical and implementation statuses are recorded in `backend-platform-canonical-reconciliation.md`.

No shared contract, schema, model, validator, generated client, or agent code was changed.
