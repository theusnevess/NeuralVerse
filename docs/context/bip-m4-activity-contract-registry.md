# BIP-M4 Activity Contract Registry

| Activity | Owner | Queue | Durable boundary |
|---|---|---|---|
| `QualifyGenerationRequestActivity` | BIP_APPLICATION | `neuralverse.activity.system.v1` | request qualification |
| `ProduceACPArtifactActivity` | ACP semantic runtime via BIP adapter | `neuralverse.activity.agent.v1` | released XFI artifact reference |

ACP process calls use protocol `nv-acp-process-protocol/1.0.0`, bounded input
and output, a 300-second start-to-close limit, bounded retries, and explicit
non-retryable protocol/contract failures. Raw artifacts are validated and
persisted at the activity boundary; workflow history receives only IDs and
fingerprints.
