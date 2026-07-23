# BIP-M9 Test Evidence

Implemented candidate coverage currently includes the durable start envelope,
sanitized outbox payload, SSE framing, progress projection models, command
routes, and canonical workflow progress activity registration.

Validated locally: focused ACP, orchestration and reference-map tests, Ruff,
compilation and `git diff --check`. The historical pending claims for
PostgreSQL, real Temporal execution, `READY_FOR_PUBLICATION`, restart/recovery,
deterministic replay, concurrency, backup/restore, MinIO, publication,
observability, resilience and history bounds are superseded by later Stage 17
certification evidence.

The focused candidate set passes locally with `27` tests. Canonical evidence
also records `476` Backend tests and `9,071` ACP tests passing. The mandatory
Playwright command selected and passed 1 test in 5.9m with no failures,
timeouts or skips:

```bash
npx playwright test \
  -c tests/playwright.canonical-layout.config.ts \
  --grep 'canonical states and representative screenshots' \
  --reporter=line \
  --retries=0
```
