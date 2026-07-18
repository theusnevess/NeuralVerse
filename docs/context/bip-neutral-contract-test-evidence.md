# BIP Neutral Contract Test Evidence

The contract intake suite covers representative valid and invalid examples for
all four released contracts, exact release pin verification, release checksum
verification, minimum-reader and major-version rejection, unknown contract
rejection, raw-byte preservation, unknown fields, null values, ordered arrays,
Unicode, opaque identifiers, decimals, deterministic fingerprints, curriculum
dependency-reference rejection, temporary release drift, and direct dependency
architecture checks.

The release snapshot is verified from its descriptor, manifest, schema hashes,
generated projection provenance, and checksum inventory. Drift tests copy the
snapshot to a temporary directory and never mutate the vendored release.

Certification remains pending independent BIP certification and a live ACP to
BIP round trip.
