# Migration Strategy

`b44000000001` creates the canonical Stage 5 domain tables from the approved
SQLAlchemy metadata. `b45000000001` completes lossless canonical-input columns
with a data-preserving backfill. Existing operational and fixture revisions
remain owned by their earlier revisions.

No destructive operation is present in the Stage 5 candidate. Downgrades are
intended only for controlled development databases after explicit data-loss
review.
