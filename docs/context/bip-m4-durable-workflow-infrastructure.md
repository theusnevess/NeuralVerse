# BIP-M4 Durable Workflow Infrastructure

The Backend owns Temporal workflow orchestration, system activities, ACP
process execution, canonical persistence, and sanitized operational
projections. ACP remains an executable boundary and publication execution
remains deferred to Stage 10.

M9 candidate additions are additive: `b54000000001` adds bounded progress
fields and `bip_m4_workflow_progress_events`. Start commands are persisted in
the existing transactional outbox before Temporal dispatch.

Certification status: `IMPLEMENTED WITH CONDITIONS — CERTIFICATION REQUIRED`.
