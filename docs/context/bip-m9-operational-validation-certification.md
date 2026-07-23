---
title: BIP-M9 — Operational Validation and Certification
canonical_id: NV-BIP-M9
version: 1.1.0
status: BIP_M9_OPERATIONAL_VALIDATION_AND_CERTIFICATION_CERTIFIED_WITH_CONDITIONS
owner: NeuralVerse Hub
language: en
---

# Verdict

`BIP_M9_OPERATIONAL_VALIDATION_AND_CERTIFICATION_CERTIFIED_WITH_CONDITIONS`.

The Backend operational path and mandatory cross-front screenshot matrix are
certified. Stage 9 is closed. The remaining conditions are owner review, tag
and push, plus production-scale validation where already defined; none blocks
this operational certification.

# Harness and predecessor gate

- Backend worktree: `/home/matheusneves/Projetos/NeuralVerse/neuralverse-backend`
- Branch: `feat/backend-integration-platform`
- ACP worktree was read-only for this task.
- Contracts worktree was read-only for this task.
- Stage 16 publication predecessor evidence: generation job
  `e0ffcd49-1f22-49a0-a936-676487bf1531` reached `PUBLISHED`; release
  `606a065d-ac48-4bf6-9220-4605f25123d7` was released and content version
  `f9cb554b-1e6f-59e5-b8b4-af017be45fd3` was published.
- The final publication replay returned the same committed result and a
  changed payload with the same idempotency key was rejected with HTTP 409.
- No manual Temporal signal was used for the final Stage 16 run.

# Passed evidence

## Backend code and database

- Compose config: `flatpak-spawn --host docker compose -p nv-m9-cert -f compose.yaml config --quiet` — PASS.
- Compose services observed healthy: API, PostgreSQL, Temporal, Temporal UI,
  workflow worker, system activity worker, orchestration dispatcher, agent
  worker adapter and MinIO object storage.
- Backend unit and integration suite: `476 passed in 2.83s`.
- Focused M5 infrastructure suite: `3 passed in 0.11s`.
- Relevant unit subset: `40 passed`.
- Ruff on affected Backend paths: PASS.
- Affected-source mypy: PASS.
- `uv run pip check`: `No broken requirements found.`
- Postgres/pgvector, full-text search, cosine-distance and hybrid query checks:
  PASS against the harness database.
- Learner progress optimistic concurrency, notes, lab run, assessment start,
  export and deterministic replay: PASS.
- API restart retained learner progress and notes: PASS.
- Worker/API/Postgres recovery after task-owned worker and database restarts:
  PASS; readiness recovered to HTTP 200.
- Obsidian synthetic round-trip: completed; replay reused the same plan,
  producing three audit events and one note.
- PostgreSQL custom dump restore into disposable database: PASS. Restored
  migration head `c00000000001`, released publication, published content
  version, learner progress and learner notes.
- MinIO object backup/restore and persistence across service restart: PASS.
- `npm audit --omit=dev --audit-level=high`: `found 0 vulnerabilities`.
- ACP typecheck: PASS.
- ACP full test suite after harness model warm-up: `9071 passed, 0 failed,
  0 skipped`.
- OpenTelemetry collector: healthy; OTLP gRPC/HTTP receivers started and the
  diagnostic exporter received API spans (`resource spans: 1`, `spans: 4` and
  `spans: 2`).

## Exact Backend validation commands

```text
uv run pytest -q
uv run pytest -q tests/integration/test_bip_m5_infrastructure.py
uv run ruff check <affected Backend paths>
uv run mypy <affected source paths>
uv run pip check
flatpak-spawn --host docker compose -p nv-m9-cert -f compose.yaml config --quiet
flatpak-spawn --host docker compose -p nv-m9-cert -f compose.yaml ps
```

# Final gate evidence

## ST17-XF-001 — mandatory Frontend/Playwright screenshot gate

The canonical configuration starts exactly one static server with
`node server.cjs` from `../website` on port 8083. The certification run used
that configured server unchanged.

The clean isolated reproduction was:

```bash
npx playwright test \
  -c tests/playwright.canonical-layout.config.ts \
  --grep 'canonical states and representative screenshots' \
  --reporter=line \
  --retries=0
```

Result: `1 passed (5.9m)`, with 1 selected, 1 completed, 0 failed, 0 timed out
and 0 skipped. The final produced screenshot was
`transformer-attention__research-active__360x740.png`. Cleanup inspection found
no orphan Playwright worker, test Chromium process, configured web server or
listener on port 8083. `ST17-XF-001`: PASS.

The earlier timeout and Python-server statements are historical and
superseded by this successful canonical run.

## ST17-OBS-001 — observability topology

Structured logging, optional API request spans, OTLP gRPC/HTTP export and a
Compose collector are implemented and observed. This divergence is closed.

## ST17-CERT-001 — certification ownership and hygiene

Every dirty path was assigned to the certification candidate, pre-existing
other scope or generated output. No unknown path, unrelated staged path or
generated staged artifact remains. Explicit-path staging protects concurrent
work, and the final Stage 9 certification commit closes `ST17-CERT-001`.

# Final status

```text
BACKEND OPERATIONAL VALIDATION: PASS
STAGE 16 PREDECESSOR EVIDENCE: PASS
PLAYWRIGHT/FRONTEND CERTIFICATION: PASS
OPENTELEMETRY CERTIFICATION: PASS
DOCUMENTATION RECONCILIATION: PASS
STAGE 17: CERTIFIED WITH CONDITIONS
STAGE 9: CLOSED
STAGE 10 BIP-M3 PUBLICATION TRANSACTION: AUTHORIZED
```
