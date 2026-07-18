# Relational and JSONB Boundary

Relational columns carry stable identities, ownership, version lineage,
revision, ordering, lifecycle state, exact references, foreign keys, and
transactional state. JSONB carries ACP-owned semantic payloads, extension
fields, opaque metadata, evidence, provenance, and bounded execution metadata.

Raw canonical UTF-8 bytes are stored as binary data. They are never rebuilt
from relational projections. Their SHA-256 is stored and checked by the intake
service.
