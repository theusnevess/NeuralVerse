# NV-XFI-M2 Release Certification

Canonical Identifier: `NV-XFI-M2-RELEASE-CERT`
Review: `R1`
Review Date: `2026-07-17`
Status: `CERTIFIED WITH CONDITIONS`
Certified Capability: `Initial Canonical Input Contract Release`
Release Identifier: `nv-xfi-input-contracts-v1.0.0`
Release Version: `1.0.0`
Implementation Commit: `70ed0547268d62f66c93fa934f9866d9d367a3ac`
Release Commit Reference: `SELF / tag target`
Expected Tag: `nv-xfi-input-contracts-v1.0.0`
Tag Type: `annotated`
Remote Branch Publication: `NOT PERFORMED`
Remote Tag Publication: `NOT PERFORMED`
ACP Adoption: `AUTHORIZED — NOT IMPLEMENTED`
BIP Adoption: `NOT IMPLEMENTED`
Commit Readiness: `READY FOR RELEASE COMMIT`

## Evidence

The release candidate contains exactly the four R5-certified 1.0.0 input
contracts, their unchanged schema hashes, forty executable examples, four
expected-results files, generated Python and TypeScript projections, generator
metadata, the released manifest lifecycle, release note, descriptor and
deterministic checksum inventory.

The implementation baseline is R5-certified with conditions. The release
metadata commit is restricted to governance, certification, documentation,
manifest lifecycle and release metadata. The annotated local tag targets the
release metadata commit and no remote operation is performed.

## Validation

```text
canonical authority: PASS
implementation baseline: PASS
semantic immutability: PASS
manifest: PASS
release note: PASS
release descriptor: PASS
release checksums: PASS
cross-artifact consistency: PASS
repository and projection gates: PASS
clean-copy validation: PASS
```

## Conditions

- Two benign `jsonschema.RefResolver` deprecation warnings remain permitted.
- Branch and tag remote publication were not performed.
- ACP adoption is authorized but not implemented.
- BIP adoption is not implemented.
- Uncached dependency acquisition may require network access; validation itself is offline after installation.

No checksum, descriptor, manifest, semantic drift, clean-copy, parity, test or
release blocker remains.

## Decision

Classification: `INITIAL_CANONICAL_INPUT_CONTRACT_RELEASE_CERTIFIED_WITH_CONDITIONS`

M2 is complete, committed and locally released. The next action is
`NV-ACP-M3-IMPLEMENT — Adopt the Neutral Canonical Input Contracts`.
