# NeuralVerse Backend Platform — BIP-M1 Phase B.4 Payload Policy Closure

Canonical Identifier: `NV-BIP-M1-B4-P1`
Version: `1.0`
Status: `ACCEPTED`
Owner: Backend & Integration Platform
Authority: `NV-BIP-M1-B4-PLAN`, `NV-BIP-000`, `NV-ACP-000`, and Explicit Project-Owner Decisions
Certified Common Base: `f885d4dabcd0f6ee8131d90dab586f9164e404f7`
Certified ACP Baseline: `b397035a9cfc3d376afc31633583f2b9ecd76548`
Implementation Scope: Payload-policy closure only
Implementation Readiness: `B.4.2 POLICY COMPLETE`
Supersession State: Active
Last Review Date: `2026-07-16`

## Original Blocker

B.4.2 was blocked as `PAYLOAD_PRESERVATION_DECISION_INCOMPLETE` because the plan lacked exact values for decimal scale, finding count/truncation, structural collection/string/key bounds, minimum-reader incompatibility, and oversized-payload hashing/persistence.

## Closed Decisions

The following values are now fixed:

| Policy | Value |
|---|---|
| Maximum raw payload | 1 MiB inclusive, inherited from B.4 |
| Significant digits | 256 |
| Absolute lexical exponent | 1000 |
| Normalized decimal scale | 256 fractional digits after insignificant trailing-zero removal |
| Maximum findings | 64 |
| Finding truncation | First 63 plus final `FINDINGS_TRUNCATED` finding |
| Object members | 4,096 per object at every nesting level |
| Array elements | 16,384 per array at every nesting level |
| String length | 262,144 Unicode code points |
| Object-key length | 256 Unicode code points |

String/key limits are measured after strict UTF-8 decoding and before canonicalization or JSONB persistence. Object and array limits are independently applied at every nesting level. Duplicate keys are rejected before normalized member construction.

## Decimal Policy

The adapter parses finite numbers without binary floating-point conversion. A value is accepted only when significant digits are at most 256, absolute lexical exponent is at most 1000, and normalized decimal scale is at most 256. Normalized scale counts fractional decimal digits after insignificant trailing fractional zeros are removed. Thus `1.2300` has scale 2, `1.000` has scale 0, `0.0001` has scale 4, and `0` has scale 0. `1e-1000` is rejected because its normalized scale exceeds 256; `1e1000` may be accepted when other limits and JSONB constraints pass.

## Finding Policy

Findings are retained in deterministic traversal order. Fatal envelope failures may stop processing before the limit. Otherwise, the first 63 findings are retained and the 64th is a safe `FINDINGS_TRUNCATED` finding that contains no payload values, excerpts, complete keys, stack traces, or exception representations. Existing per-finding bounds remain: code 64 characters, safe message 512 characters, and optional JSON Pointer 256 characters.

## Structural Bounds

The adapter rejects a value exceeding 4,096 object members, 16,384 array elements, 262,144 code points in a JSON string, or 256 code points in an object key. No truncation or repair occurs. The existing maximum nesting depth of 64 remains in force. These limits are defense-in-depth bounds in addition to the 1 MiB raw-byte limit.

## Minimum Reader Compatibility

The existing fixture reader version remains authoritative. A malformed or higher `minimum_reader_version` is `STRUCTURALLY_REJECTED`. A compatible lower/equal requirement continues processing. For a size-valid incompatible-reader payload, the adapter computes the raw SHA-256, retains exact raw bytes, sets structural payload and structural hash to null, produces a bounded `MINIMUM_READER_VERSION_UNSUPPORTED` finding, and persists a rejected fixture according to the existing rejected-fixture policy. It stops before UTF-8 decoding and JSON parsing. This indicates reader incompatibility, not malformed payload content.

Unknown compatible minor fields remain preservable only when the local reader compatibility rule permits processing. No forward interpretation is attempted when the reader is insufficient.

## Oversized Payload

The adapter first confirms a bytes input, measures exact byte length, and compares it with 1 MiB. An oversized payload is rejected immediately. It does not hash, decode UTF-8, inspect BOM, parse JSON, detect duplicate keys, validate numbers, canonicalize, compute structural hash, construct a `FixtureRecord`, or persist bytes. Raw and structural hashes are absent. Future coordinated audit metadata may retain only a rejection code, observed length, configured maximum, and correlation metadata; audit writing is outside B.4.2.

## Consolidated Failure Matrix

| Condition | Raw retained | Raw hash | Structural payload | Structural hash | Fixture row |
|---|---:|---:|---:|---:|---:|
| Valid supported payload | Yes | Yes | Yes | Yes | Yes |
| Invalid UTF-8 within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Disallowed BOM within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Invalid JSON within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Duplicate key within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Invalid number within limit | Existing rejected-fixture policy | Yes | No | No | Existing rejected-fixture policy |
| Unsupported minimum reader within limit | Yes | Yes | No | No | Yes |
| Oversized raw payload | No | No | No | No | No |

## Implementation Implications

B.4.2 must reject oversized input before hashing, retain and hash size-valid incompatible-reader bytes without parsing them, enforce all numeric and structural bounds, cap findings at 64, and use `FINDINGS_TRUNCATED` when required. It must not implement idempotency, audit, coordinated ingestion, HTTP, semantic contracts, or publication behavior.

## Required Tests

Future B.4.2 tests must cover decimal scales 255/256/257, 63/64/65 findings, object members 4,095/4,096/4,097, array elements 16,383/16,384/16,385, strings 262,143/262,144/262,145 code points, keys 255/256/257 code points, reader equal/lower/higher/malformed values, and oversized short-circuiting that invokes neither hash nor decoder/parser and cannot construct a `FixtureRecord`.

Tests must use bounded generated data and must not log generated content.

## Deferred Behavior

Policy closure does not implement payload processing. Fixture repositories, idempotency acquisition/replay, coordinated transactions, audit writing, HTTP exposure, semantic integration, publication, and learner state remain deferred to their authorized phases.

## Authorization Result

Current unresolved B.4.2 policy unknowns: `0`. B.4.2 policy is complete and may proceed to implementation. The next authorized action is `BIP-M1 — Phase B.4.2: Raw and Structural Payload Preservation Adapter`.
