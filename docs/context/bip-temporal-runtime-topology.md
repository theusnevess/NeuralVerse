# BIP Temporal Runtime Topology

The local topology contains PostgreSQL for BIP, an isolated PostgreSQL
database for Temporal, Temporal Server, Temporal UI, workflow worker,
system-activity worker, and agent-worker adapter. Temporal uses the
`neuralverse` namespace. Workers do not run in the API event loop.

Queues are versioned and stable:

- `neuralverse.workflow.generate-learning-package.v1`
- `neuralverse.activity.system.v1`
- `neuralverse.activity.agent.v1`

The agent image packages the ACP executable and released XFI snapshot. It
does not mount or import the ACP source tree at runtime.
