# BIP ACP Artifact Lineage

Canonical artifact records now retain generation-job ownership, workflow ID,
revision cycle, canonical producer, ACP operation/version, assembled-input
fingerprint and ordered dependency IDs/fingerprints. The reference loader
checks stored bytes, SHA-256, contract, ownership and revision before returning
operation material.

The migration is `b58000000001`. No Stage 10 publication transaction is added.
Failure-injection and PostgreSQL rollback evidence are still required for
certification.
