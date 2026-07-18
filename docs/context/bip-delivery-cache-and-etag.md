# Delivery Cache And ETag

Exact resources are immutable and cache for one year. Alias resources require revalidation. ETags are weak, deterministic semantic hashes and exclude request metadata. `If-None-Match` returns an empty `304` response when matched.
