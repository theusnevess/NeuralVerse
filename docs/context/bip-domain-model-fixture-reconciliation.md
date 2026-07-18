# BIP Canonical Domain Model — Fixture Reconciliation

Task: `NV-BIP-M4-IMPLEMENT`

Date: 2026-07-18

## Purpose

Audit existing BIP fixture records and classify each as DOMAIN_CONCEPT,
APPLICATION_DTO, INFRASTRUCTURE_RECORD, TEST_FIXTURE, LEGACY_RECORD, or
TEMPORARY_M1_STRUCTURE. Document the target bounded context and disposition.

---

## Persistence Models

### CanonicalInputRecord

- **Path**: `persistence/models/canonical_input.py`
- **Responsibility**: Stores lossless released-contract artifacts retained as workflow source
- **Target bounded context**: Authoring
- **Target domain concept**: Canonical contract artifact (domain concept)
- **Classification**: DOMAIN_CONCEPT
- **Disposition**: KEEP

### FixtureRecord

- **Path**: `persistence/models/fixture_record.py`
- **Responsibility**: Stores fixture data with schema info, validation status, payloads
- **Target bounded context**: Fixture Ingestion
- **Target domain concept**: Test fixture entity
- **Classification**: TEST_FIXTURE
- **Disposition**: KEEP

### IdempotencyRecord

- **Path**: `persistence/models/idempotency_record.py`
- **Responsibility**: General-purpose idempotency tracking
- **Target bounded context**: Cross-cutting Infrastructure
- **Target domain concept**: Idempotency token (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: KEEP

### CanonicalIntakeIdempotencyRecord

- **Path**: `persistence/models/canonical_intake_idempotency.py`
- **Responsibility**: Idempotency for canonical intake operations
- **Target bounded context**: Cross-cutting Infrastructure
- **Target domain concept**: Idempotency token (canonical intake)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: ADAPT — generalize into cross-cutting idempotency

### OperationalAuditEvent

- **Path**: `persistence/models/operational_audit_event.py`
- **Responsibility**: Audit trail for operational events
- **Target bounded context**: Cross-cutting Infrastructure
- **Target domain concept**: Audit event (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: KEEP

### TransactionalOutboxEventRecord

- **Path**: `persistence/models/outbox_event.py`
- **Responsibility**: Transactional outbox for reliable event publishing
- **Target bounded context**: Operations
- **Target domain concept**: Outbox event (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: KEEP

### AuthoringJobRecord

- **Path**: `persistence/models/authoring_job.py`
- **Responsibility**: Authoring workflow state machine persistence
- **Target bounded context**: Authoring / Orchestration
- **Target domain concept**: Authoring job state (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: ADAPT — align with domain GenerationJob

### WorkflowExecutionRecord

- **Path**: `persistence/models/workflow_execution.py`
- **Responsibility**: Workflow execution checkpoints and state
- **Target bounded context**: Orchestration
- **Target domain concept**: Workflow execution state (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: ADAPT — generalize for all workflow types

### WorkflowQueueRecord

- **Path**: `persistence/models/workflow_queue.py`
- **Responsibility**: Command queue for workflow processing
- **Target bounded context**: Orchestration
- **Target domain concept**: Command queue (infrastructure)
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: ADAPT — generalize for all workflow types

---

## Fixture Application Types

### IngestFixtureCommand

- **Path**: `fixtures/commands.py`
- **Responsibility**: Fixture ingestion command parameters
- **Target bounded context**: Fixture Ingestion
- **Target domain concept**: Application command
- **Classification**: APPLICATION_DTO
- **Disposition**: ADAPT — keep as API boundary object

### PreparedFixturePayload

- **Path**: `fixtures/types.py`
- **Responsibility**: Intermediate processing state after validation
- **Target bounded context**: Fixture Ingestion
- **Target domain concept**: Application transfer object
- **Classification**: APPLICATION_DTO
- **Disposition**: ADAPT — keep within fixture ingestion context

### IngestFixtureResult

- **Path**: `fixtures/results.py`
- **Responsibility**: Fixture ingestion operation result
- **Target bounded context**: Fixture Ingestion
- **Target domain concept**: Application result
- **Classification**: APPLICATION_DTO
- **Disposition**: ADAPT — keep as API boundary object

---

## Enumerations

### FixtureValidationStatus

- **Path**: `persistence/models/enums.py`
- **Classification**: DOMAIN_CONCEPT
- **Disposition**: KEEP

### IdempotencyStatus

- **Path**: `persistence/models/enums.py`
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: KEEP

### AuditEvent Types

- **Path**: `persistence/models/enums.py`
- **Classification**: INFRASTRUCTURE_RECORD
- **Disposition**: KEEP

---

## Summary

| Classification | Count | Disposition |
|---|---|---|
| DOMAIN_CONCEPT | 2 | KEEP |
| INFRASTRUCTURE_RECORD | 7 | KEEP / ADAPT |
| APPLICATION_DTO | 3 | ADAPT |
| TEST_FIXTURE | 1 | KEEP |
| LEGACY_RECORD | 0 | — |
| TEMPORARY_M1_STRUCTURE | 0 | — |

**Total**: 13 record types reconciled.

No fixture records remain the authoritative domain model. The new domain
model at `domain/` is the canonical source of truth for bounded context
semantics.
