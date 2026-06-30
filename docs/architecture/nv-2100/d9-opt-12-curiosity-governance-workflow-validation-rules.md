# D9-OPT-12 — Curiosity Governance Workflow & Validation Rules

## Purpose

This phase extends the Curiosity Agent with Curiosity Governance Workflow & Validation Rules, enabling the platform to define the deterministic metadata model describing the complete lifecycle, governance metadata, approval workflow, validation policies, review traceability, and publication readiness of curiosity artifacts without approving artifacts, executing governance decisions, performing moderation, or modifying any curiosity content.

## Motivation

The Curiosity Agent must be capable of expressing how curiosity artifacts move through governance workflows, validation policies, review processes, approval stages, and publication readiness. This layer provides the deterministic metadata structures that enable this without approving artifacts, executing governance decisions, performing moderation, or modifying any curiosity content.

## Architecture

The Curiosity Governance Kernel follows the same architectural patterns established by D9-OPT-01 through D9-OPT-11:

- **Pure functions**: All composition and validation functions are pure, with no side effects
- **Immutable contracts**: All interfaces use `readonly` properties
- **Deterministic compose functions**: Composition functions produce identical output for identical input
- **Validation never throws**: Validation returns structured error results
- **Canonical enums as const tuples**: Enums are defined as `as const` arrays
- **Helper functions**: Type guards and canonical getters provide safe access
- **Barrel exports**: Public API is organized through index.ts
- **Defensive copies**: Arrays are copied before sorting
- **Stable ordering**: Deterministic sort comparators ensure consistent output
- **No side effects**: No filesystem, network, or external API access

## Canonical Enums

### Governance Stages (10 values)

| Stage | Description |
|-------|-------------|
| `draft` | Draft |
| `review` | Review |
| `revision` | Revision |
| `validation` | Validation |
| `approval` | Approval |
| `publication` | Publication |
| `monitoring` | Monitoring |
| `deprecation` | Deprecation |
| `archival` | Archival |
| `completion` | Completion |

### Review Outcomes (10 values)

| Outcome | Description |
|---------|-------------|
| `approved` | Approved |
| `rejected` | Rejected |
| `revision_required` | Revision required |
| `deferred` | Deferred |
| `escalated` | Escalated |
| `withdrawn` | Withdrawn |
| `expired` | Expired |
| `superseded` | Superseded |
| `partial_approval` | Partial approval |
| `conditional_approval` | Conditional approval |

### Validation Policies (10 values)

| Policy | Description |
|--------|-------------|
| `automatic` | Automatic |
| `manual` | Manual |
| `hybrid` | Hybrid |
| `peer_review` | Peer review |
| `expert_review` | Expert review |
| `automated_checks` | Automated checks |
| `content_review` | Content review |
| `safety_review` | Safety review |
| `quality_review` | Quality review |
| `compliance_review` | Compliance review |

### Approval Levels (10 values)

| Level | Description |
|-------|-------------|
| `initial` | Initial |
| `intermediate` | Intermediate |
| `advanced` | Advanced |
| `expert` | Expert |
| `final` | Final |
| `conditional` | Conditional |
| `emergency` | Emergency |
| `override` | Override |
| `delegated` | Delegated |
| `revoked` | Revoked |

### Publication States (10 values)

| State | Description |
|-------|-------------|
| `draft` | Draft |
| `review` | Review |
| `approved` | Approved |
| `scheduled` | Scheduled |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |
| `withdrawn` | Withdrawn |
| `superseded` | Superseded |
| `conditional` | Conditional |

### Governance Status (6 values)

| Status | Description |
|--------|-------------|
| `draft` | Draft |
| `review` | Under review |
| `approved` | Approved |
| `published` | Published |
| `deprecated` | Deprecated |
| `archived` | Archived |

## Contracts

### GovernanceWorkflow

```typescript
interface GovernanceWorkflow {
  readonly workflowId: string;
  readonly title: string;
  readonly governanceStage: GovernanceStage;
  readonly reviewOutcome: ReviewOutcome;
  readonly validationPolicy: ValidationPolicy;
  readonly approvalLevel: ApprovalLevel;
  readonly publicationState: PublicationState;
  readonly conceptIds: readonly string[];
  readonly status: GovernanceStatus;
  readonly governance: CuriosityGovernance;
  readonly provenance: CuriosityGovernanceProvenance;
  readonly trace: CuriosityGovernanceTrace;
}
```

### ValidationPolicyMetadata

```typescript
interface ValidationPolicyMetadata {
  readonly metadataId: string;
  readonly workflowId: string;
  readonly validationPolicy: ValidationPolicy;
  readonly automaticChecks: boolean;
  readonly manualReview: boolean;
  readonly peerReview: boolean;
  readonly expertReview: boolean;
  readonly contentReview: boolean;
  readonly safetyReview: boolean;
  readonly qualityReview: boolean;
  readonly complianceReview: boolean;
}
```

### ReviewRecord

```typescript
interface ReviewRecord {
  readonly recordId: string;
  readonly workflowId: string;
  readonly reviewerId: string;
  readonly reviewDate: string;
  readonly reviewOutcome: ReviewOutcome;
  readonly reviewComments: string;
  readonly reviewDuration: string;
  readonly reviewPriority: number;
}
```

### GovernanceRegistry

```typescript
interface GovernanceRegistry {
  readonly registryId: string;
  readonly workflows: readonly GovernanceWorkflow[];
  readonly validations: readonly ValidationPolicyMetadata[];
  readonly reviews: readonly ReviewRecord[];
  readonly approvals: readonly ApprovalMetadata[];
  readonly relationships: readonly GovernanceRelationship[];
  readonly metadata: GovernanceRegistryMetadata;
  readonly trace: CuriosityGovernanceTrace;
  readonly deterministic: true;
  readonly generatedFrom: 'deterministic_curiosity_governance_kernel';
  readonly randomUsed: false;
  readonly timeDependency: false;
}
```

## Composition Functions

| Function | Description |
|----------|-------------|
| `composeCuriosityGovernanceProvenance` | Composes governance provenance from parameters |
| `composeCuriosityGovernanceTrace` | Composes a governance trace from metadata |
| `composeGovernanceWorkflow` | Composes a governance workflow from parameters |
| `composeValidationPolicy` | Composes validation policy metadata from parameters |
| `composeReviewRecord` | Composes a review record from parameters |
| `composeApprovalMetadata` | Composes approval metadata from parameters |
| `composeGovernanceRelationship` | Composes a governance relationship from parameters |
| `composeGovernanceRegistry` | Composes a governance registry |
| `composeGovernanceRegistryFromInput` | Composes a registry from input |
| `composeGovernanceArtifacts` | Main entry point for governance composition |
| `composeCuriosityArtifactWithGovernance` | Composes an artifact with governance |

## Validation Functions

| Function | Description |
|----------|-------------|
| `validateGovernanceWorkflow` | Validates a single governance workflow |
| `validateValidationPolicy` | Validates validation policy metadata |
| `validateReviewRecord` | Validates a review record |
| `validateApprovalMetadata` | Validates approval metadata |
| `validateGovernanceRelationship` | Validates a governance relationship |
| `validateGovernanceRegistry` | Validates a governance registry |
| `validateGovernanceInput` | Validates governance input |
| `validateGovernanceTrace` | Validates a governance trace |
| `validateCuriosityArtifactWithGovernance` | Validates an artifact with governance |

## Validation Codes (24 stable codes)

| Code | Description |
|------|-------------|
| `GOVERNANCE_DUPLICATE_ID` | Duplicate workflow ID |
| `GOVERNANCE_DUPLICATE_TITLE` | Duplicate workflow title |
| `GOVERNANCE_INVALID_STAGE` | Invalid governance stage |
| `GOVERNANCE_INVALID_REVIEW` | Invalid review outcome |
| `GOVERNANCE_INVALID_POLICY` | Invalid validation policy |
| `GOVERNANCE_INVALID_APPROVAL` | Invalid approval level |
| `GOVERNANCE_INVALID_PUBLICATION` | Invalid publication state |
| `GOVERNANCE_INVALID_STATUS` | Invalid governance status |
| `GOVERNANCE_INVALID_GOVERNANCE` | Invalid governance |
| `GOVERNANCE_MISSING_PROVENANCE` | Missing provenance |
| `GOVERNANCE_MISSING_PROVIDER` | Missing provider |
| `GOVERNANCE_MISSING_RATIONALE` | Missing rationale |
| `GOVERNANCE_MISSING_CURIOSITY_REFERENCE` | Missing curiosity reference |
| `GOVERNANCE_MISSING_WORKFLOW_ID` | Missing workflow ID |
| `GOVERNANCE_MISSING_TITLE` | Missing title |
| `GOVERNANCE_MISSING_POLICY` | Missing validation policy |
| `GOVERNANCE_SELF_RELATIONSHIP` | Self-relationship |
| `GOVERNANCE_EMPTY_REGISTRY` | Empty registry |
| `GOVERNANCE_INVALID_TRACE` | Invalid trace |
| `GOVERNANCE_REGISTRY_INCONSISTENCY` | Registry inconsistency |
| `GOVERNANCE_INVALID_CONFIGURATION` | Invalid configuration |
| `GOVERNANCE_INVALID_RELATIONSHIP` | Invalid relationship |
| `GOVERNANCE_MISSING_GOVERNANCE` | Missing governance |
| `GOVERNANCE_UNSUPPORTED_CONFIGURATION` | Unsupported governance configuration |

## Helper Functions

| Function | Description |
|----------|-------------|
| `isSupportedGovernanceStage` | Type guard for governance stages |
| `isSupportedReviewOutcome` | Type guard for review outcomes |
| `isSupportedValidationPolicy` | Type guard for validation policies |
| `isSupportedApprovalLevel` | Type guard for approval levels |
| `isSupportedPublicationState` | Type guard for publication states |
| `isSupportedGovernanceStatus` | Type guard for governance statuses |
| `isSupportedGovernanceGovernance` | Type guard for governance values |
| `getCanonicalGovernanceStages` | Returns canonical governance stages |
| `getCanonicalReviewOutcomes` | Returns canonical review outcomes |
| `getCanonicalValidationPolicies` | Returns canonical validation policies |
| `getCanonicalApprovalLevels` | Returns canonical approval levels |
| `getCanonicalPublicationStates` | Returns canonical publication states |
| `getCanonicalGovernanceStatuses` | Returns canonical governance statuses |

## Determinism

All composition functions are deterministic:

- No `Math.random`
- No `Date.now`
- No `new Date`
- No `performance.now`
- No `crypto.randomUUID`
- No `Promise`
- No `async`/`await`
- No `fetch`
- No filesystem access
- No network access
- No environment variables

The test suite includes 100-iteration identity tests to verify determinism.

## Immutability

All contracts use `readonly` properties. Composition functions:

- Never mutate input
- Return immutable objects
- Sort deterministically using `[...array].sort(...)`
- Use defensive copies for arrays

## Governance Workflow

The governance workflow metadata layer models:

- Governance stages
- Review outcomes
- Validation policies
- Approval levels
- Publication states

All metadata is deterministic and immutable.

## Validation Policies

The validation policy metadata layer models:

- Automatic checks
- Manual review
- Peer review
- Expert review
- Content review
- Safety review
- Quality review
- Compliance review

All metadata is deterministic and immutable.

## Review Metadata

The review record metadata layer models:

- Reviewer ID
- Review date
- Review outcome
- Review comments
- Review duration
- Review priority

All metadata is deterministic and immutable.

## Approval Metadata

The approval metadata layer models:

- Approval level
- Approver ID
- Approval date
- Approval expiry
- Approval conditions
- Approval revocability

All metadata is deterministic and immutable.

## Publication Metadata

The publication state metadata layer models:

- Draft
- Review
- Approved
- Scheduled
- Published
- Deprecated
- Archived
- Withdrawn
- Superseded
- Conditional

All metadata is deterministic and immutable.

## Cross-Agent Boundaries

The Curiosity Agent must NOT:

- Approve artifacts
- Execute governance decisions
- Perform moderation
- Modify curiosity content
- Modify Narrative Agent
- Modify Knowledge Agent
- Modify Didactic Agent
- Modify Research Agent
- Modify Laboratory Agent
- Modify Application Agent

Everything remains metadata.

## Runtime Limitations

This phase defines only metadata structures. No runtime governance execution, moderation, publication, approval, or workflow execution exists.

## Out-of-Scope

- Artifact approval
- Governance decision execution
- Moderation engine
- Publication engine
- Approval engine
- Workflow execution
- LLM invocation

## Relationship with D9-OPT-01

D9-OPT-12 extends D9-OPT-01 with Curiosity Governance Workflow & Validation Rules. The base curiosity metadata infrastructure established in D9-OPT-01 remains unchanged. D9-OPT-12 adds:

- New canonical enums for governance workflow modeling
- New contracts for governance workflows, validation policies, review records, and approval metadata
- New composition functions for governance workflow metadata
- New validation functions for governance workflow metadata
- Backward compatibility with D9-OPT-01

## Relationship with D9-OPT-02

D9-OPT-12 extends D9-OPT-02 with governance workflow modeling. The educational purpose modeling established in D9-OPT-02 remains unchanged. D9-OPT-12 adds:

- Governance stage modeling
- Review outcome modeling
- Backward compatibility with D9-OPT-02

## Relationship with D9-OPT-03

D9-OPT-12 extends D9-OPT-03 with governance workflow modeling. The humor layer established in D9-OPT-03 remains unchanged. D9-OPT-12 adds:

- Validation policy modeling
- Approval level modeling
- Backward compatibility with D9-OPT-03

## Relationship with D9-OPT-04

D9-OPT-12 extends D9-OPT-04 with governance workflow modeling. The cultural reference governance established in D9-OPT-04 remains unchanged. D9-OPT-12 adds:

- Publication state modeling
- Governance relationship modeling
- Backward compatibility with D9-OPT-04

## Relationship with D9-OPT-05

D9-OPT-12 extends D9-OPT-05 with governance workflow modeling. The curiosity card, engineer note & field note modeling established in D9-OPT-05 remains unchanged. D9-OPT-12 adds:

- Governance workflow profile modeling
- Validation policy metadata modeling
- Backward compatibility with D9-OPT-05

## Relationship with D9-OPT-06

D9-OPT-12 extends D9-OPT-06 with governance workflow modeling. The historical oddity, research trail & knowledge evolution curiosity modeling established in D9-OPT-06 remains unchanged. D9-OPT-12 adds:

- Review record modeling
- Approval metadata modeling
- Backward compatibility with D9-OPT-06

## Relationship with D9-OPT-07

D9-OPT-12 extends D9-OPT-07 with governance workflow modeling. The unexpected connection, limitation warning & application surprise modeling established in D9-OPT-07 remains unchanged. D9-OPT-12 adds:

- Governance workflow profile modeling
- Validation policy metadata modeling
- Backward compatibility with D9-OPT-07

## Relationship with D9-OPT-08

D9-OPT-12 extends D9-OPT-08 with governance workflow modeling. The laboratory challenge, what-if prompt & experiment curiosity modeling established in D9-OPT-08 remains unchanged. D9-OPT-12 adds:

- Review record modeling
- Approval metadata modeling
- Backward compatibility with D9-OPT-08

## Relationship with D9-OPT-09

D9-OPT-12 extends D9-OPT-09 with governance workflow modeling. The misconception card & assessment reinforcement curiosity modeling established in D9-OPT-09 remains unchanged. D9-OPT-12 adds:

- Governance workflow profile modeling
- Validation policy metadata modeling
- Backward compatibility with D9-OPT-09

## Relationship with D9-OPT-10

D9-OPT-12 extends D9-OPT-10 with governance workflow modeling. The visual curiosity presentation & accessibility metadata established in D9-OPT-10 remains unchanged. D9-OPT-12 adds:

- Review record modeling
- Approval metadata modeling
- Backward compatibility with D9-OPT-10

## Relationship with D9-OPT-11

D9-OPT-12 extends D9-OPT-11 with governance workflow modeling. The user preference, tone controls & placement rules established in D9-OPT-11 remains unchanged. D9-OPT-12 adds:

- Governance workflow profile modeling
- Validation policy metadata modeling
- Backward compatibility with D9-OPT-11

## Public Exports

The barrel export (`index.ts`) provides:

- **Contracts**: All interfaces and types
- **Kernel**: All composition functions
- **Validation**: All validation functions and error codes
- **Helpers**: Type guards and canonical getters

## Repository Scope

### Allowed

```
src/agents/curiosity-pipeline/**
docs/architecture/nv-2100/**
```

### Forbidden

```
assessment-pipeline
didactic-pipeline
knowledge-pipeline
research-pipeline
laboratory-pipeline
application-pipeline
narrative-pipeline
runtime
frontend
shared
```
