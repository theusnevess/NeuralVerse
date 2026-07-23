# BIP Workflow History Bounds

Workflow state retains reference summaries and bounded progress slices. ACP
canonical payloads are loaded at the activity boundary and are not stored in
the artifact map. Activity results remain limited by the existing 16 KiB
bound, while assembled ACP input remains limited by the operation registry.

The earlier pending statement is historical and superseded by the later Stage
17 replay and history-bounds evidence. Workflow history bounds are approved
for Stage 9; production-scale validation remains a condition where already
defined.
