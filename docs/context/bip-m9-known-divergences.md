---
title: BIP-M9 — Known Divergences
canonical_id: NV-BIP-M9-DIVERGENCES
version: 1.0.0
status: CLOSED
owner: NeuralVerse Hub
language: en
---

| ID | Severity | Area | Evidence | State | Required owner/action |
| --- | --- | --- | --- | --- | --- |
| ST17-XF-001 | P1 | Frontend/Playwright | Canonical screenshot matrix passed with the configured `node server.cjs`: 1 selected, 1 passed, 0 failed, timed out or skipped in 5.9m; no certification-owned orphan process remained | CLOSED | Historical Python-server and timeout claims are superseded by the final canonical run |
| ST17-OBS-001 | P1 | Observability | Structured API spans reached the Compose OTel collector and diagnostic exporter | CLOSED | No further action for this gate |
| ST17-CERT-001 | P1 | Certification hygiene | Complete ownership ledger, explicit-path staging and contamination audit record zero unknown or unrelated staged paths | CLOSED | Preserve classified pre-existing and generated dirty paths; owner review, tag and push remain conditions |

Non-blocking evidence already passed: Backend tests (`476 passed`), M5
infrastructure (`3 passed`), ACP full suite after model warm-up (`9071
passed`), Compose health, publication idempotency, learner-state persistence,
worker recovery and PostgreSQL/MinIO backup/restore.
