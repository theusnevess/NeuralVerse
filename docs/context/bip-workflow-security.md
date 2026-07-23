# BIP Workflow Security

Temporal inputs and search metadata contain stable identifiers, policy
versions, and fingerprints only. ACP credentials remain process configuration;
they are not placed in workflow payloads, history, logs, or search attributes.
The agent adapter bounds stdin, stdout, stderr, subprocess duration, and
failure messages. Full prompts and canonical payloads are excluded from
telemetry and workflow history.
