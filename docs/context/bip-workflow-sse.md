# Workflow SSE

`GET /orchestration/v1/generation-jobs/{generation_job_id}/events` streams
projected events as `id`, `event`, and bounded JSON `data`. `Last-Event-ID`
replays subsequent durable sequences. The stream sends keepalive comments,
does not hold a database transaction, and stops after the configured replay
bound or client disconnect.
