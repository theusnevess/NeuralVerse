# Projection Strategy

JSON Schema Draft 2020-12 is the canonical machine-readable authority. Python
and TypeScript files under `contracts/generated/` are deterministic,
non-authoritative consumer projections. Runtime structural validation remains
the JSON Schema tooling's responsibility.

The generator identity is `neuralverse-contract-projections` at version
`1.0.0`. Generated files are UTF-8 with LF line endings, stable field ordering,
no timestamps, no random values, no host paths, and no network calls. Manual
edits are prohibited. `neuralverse-contracts generate-projections` is the only
write command; `verify-generated` is read-only and treats the declared output
files as an exact set. `verify-projection-parity` parses normalized schema,
Python and TypeScript type graphs and compares declaration identity, fields,
requiredness, nullability, primitive types, references, arrays, enums, aliases
and open boundaries. It also rejects duplicate generated TypeScript
declarations.

The generator uses only the repository's pinned Python environment and standard
library code. It does not import ACP or BIP worktrees and does not become a
normalization authority: arrays, timestamps, identifiers, nulls, decimals and
unknown fields are represented without transformation.

TypeScript projections use the pinned local toolchain recorded in
`contracts/package.json` and `contracts/package-lock.json`: Node 24.18.0, npm
11.16.0 and TypeScript 5.9.2. `npm run typecheck` performs no-emit compiler
validation through the local pinned compiler.
