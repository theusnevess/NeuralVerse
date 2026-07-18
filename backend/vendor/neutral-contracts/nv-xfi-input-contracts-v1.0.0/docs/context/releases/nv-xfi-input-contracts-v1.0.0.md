# NeuralVerse XFI Canonical Input Contracts v1.0.0

Canonical Identifier: `nv-xfi-input-contracts-v1.0.0`
Release Status: `RELEASED`
Release Version: `1.0.0`
Tag: `nv-xfi-input-contracts-v1.0.0`
Tag Type: `annotated`
Tag Target: `this release metadata commit`
Implementation Commit: `70ed0547268d62f66c93fa934f9866d9d367a3ac`
Release Metadata Commit: `this commit / tag target`
Implementation Certification: `NV-XFI-M2-CERT-R5`
Release Certification: `NV-XFI-M2-RELEASE-CERT-R1`
Certification Status: `CERTIFIED WITH CONDITIONS`
Remote Branch Publication: `NOT PERFORMED`
Remote Tag Publication: `NOT PERFORMED`
ACP Adoption: `AUTHORIZED — NOT IMPLEMENTED`
BIP Adoption: `NOT IMPLEMENTED`

## Release Boundary

This prepared release contains exactly the four certified canonical input
contracts:

```text
CurriculumContract 1.0.0
AgentContribution 1.0.0
LearningPackageDraft 1.0.0
PublicationReadinessRecommendation 1.0.0
```

The release includes shared metadata and primitives, contract documentation,
forty executable examples, four expected-results files, compatibility and
preservation evidence, Python and TypeScript projections, generator metadata,
parity and drift verification, and clean-copy evidence.

It excludes ACP adapters, BIP readers, backend models, database changes, HTTP
endpoints, frontend clients, output contracts, publication execution, learner
state and Obsidian synchronization execution.

## Contract Inventory

| Contract | Version | Schema ID | Schema SHA-256 | Documentation | Examples | Expected results |
|---|---|---|---|---|---|---|
| CurriculumContract | 1.0.0 | `urn:neuralverse:xfi:contract:curriculum-contract:1.0.0` | `16974e4f8e4334410ab00b72cca204e323861cb7d81eccd35a758eef3ab61302` | `contracts/docs/curriculum-contract/1.0.0.md` | `contracts/examples/golden/curriculum-contract/1.0.0` | `expected-results.json` |
| AgentContribution | 1.0.0 | `urn:neuralverse:xfi:contract:agent-contribution:1.0.0` | `adfead3dc5cc22e9a91b205448227c0b22dd89373d1d3fa5eed6987f8e9f39f3` | `contracts/docs/agent-contribution/1.0.0.md` | `contracts/examples/golden/agent-contribution/1.0.0` | `expected-results.json` |
| LearningPackageDraft | 1.0.0 | `urn:neuralverse:xfi:contract:learning-package-draft:1.0.0` | `b0a0dccc297cc4cfc1a238d2716b2edfa6890d5381a39f140850cfeecd22ec9c` | `contracts/docs/learning-package-draft/1.0.0.md` | `contracts/examples/golden/learning-package-draft/1.0.0` | `expected-results.json` |
| PublicationReadinessRecommendation | 1.0.0 | `urn:neuralverse:xfi:contract:publication-readiness-recommendation:1.0.0` | `249ace10693abb245353d747ffec091ed10392bf2b29e064aa2f1f8a8becd926` | `contracts/docs/publication-readiness-recommendation/1.0.0.md` | `contracts/examples/golden/publication-readiness-recommendation/1.0.0` | `expected-results.json` |

## Artifact Inventory

```text
domain schemas: 4
contract documentation: 4
executable examples: 40
expected-results files: 4
Python projections: 4
TypeScript projections: 4
generator: neuralverse-contract-projections/1.0.0
TypeScript: 5.9.2
manifest SHA-256: f63831f48f300a2abf88dac33a2356c3db7cb8fcd1d9a8152f07bfe18c48ea22
checksum descriptor: contracts/releases/nv-xfi-input-contracts-v1.0.0.json
checksum list: contracts/releases/nv-xfi-input-contracts-v1.0.0.sha256
```

Python projections:

```text
contracts/generated/python/agent_contribution.py
contracts/generated/python/curriculum_contract.py
contracts/generated/python/learning_package_draft.py
contracts/generated/python/publication_readiness_recommendation.py
```

TypeScript projections:

```text
contracts/generated/typescript/agent-contribution.ts
contracts/generated/typescript/curriculum-contract.ts
contracts/generated/typescript/learning-package-draft.ts
contracts/generated/typescript/publication-readiness-recommendation.ts
```

## Compatibility and Preservation

The release supports same-major compatible-minor evaluation, deterministic
unsupported-major rejection and minimum-reader enforcement. Compatible unknown
fields and namespaced extensions are preserved. Null-versus-missing semantics,
semantic array ordering, Unicode, identifiers, timestamps, exact decimals,
defaults and semantic repair remain governed by the certified contract suite.

## Release State

The manifest lifecycle and release execution state are `RELEASED`. The release
metadata commit has parent `70ed0547268d62f66c93fa934f9866d9d367a3ac` and
contains only approved release metadata and documentation. The annotated tag
targets this release metadata commit, not the implementation commit.

Tag preparation:

```text
name: nv-xfi-input-contracts-v1.0.0
type: annotated
target: this release metadata commit
message: NeuralVerse XFI canonical input contracts v1.0.0
tag created: true locally
branch pushed: false
tag pushed: false
```

## Consumer Status

ACP adoption is `AUTHORIZED — NOT IMPLEMENTED` after release commit
certification, lifecycle release, release-note and hash verification, clean
worktree confirmation and local annotated tag creation. ACP must pin the tag,
release commit, version, manifest hash, schema hashes, projection hashes and
generator version. Branch pins, local worktree paths, symlinks, floating
versions, `latest`, caret and tilde ranges are prohibited.

BIP adoption is `NOT IMPLEMENTED` and deferred to a separate milestone.

## Conditions

The permitted conditions are two benign `RefResolver` deprecation warnings,
branch and tag push not performed, ACP/BIP adoption not implemented, and
possible network access for uncached dependency acquisition. No semantic,
schema, projection, parity, drift, hash, clean-copy or test blocker remains.

## Supersession

A future compatible release must preserve the same-major compatibility policy
and explicitly record its schema, manifest, projection and generator changes.
Breaking changes require a new major contract release and independent
certification.
