"""Immutable BIP-side adoption record for the XFO candidate."""

from . import (
    OUTPUT_CONTRACT_VERSION,
    OUTPUT_RELEASE_COMMIT,
    OUTPUT_RELEASE_NAME,
    OUTPUT_RELEASE_STATUS,
    OUTPUT_RELEASE_TAG,
    OUTPUT_SCHEMA_HASHES,
)

EXPECTED_GENERATOR = "neuralverse-contract-projections/1.0.0"
DIRECT_CONTRACTS_WORKTREE_IMPORTS = 0


def verify_candidate() -> None:
    if (
        OUTPUT_RELEASE_NAME != "nv-xfo-delivery-contracts-v1.0.0"
        or OUTPUT_RELEASE_TAG != "nv-xfo-delivery-contracts-v1.0.0"
        or OUTPUT_RELEASE_STATUS != "RELEASED"
        or len(OUTPUT_RELEASE_COMMIT) != 40
    ):
        raise RuntimeError("output contract release identity mismatch")
    if OUTPUT_CONTRACT_VERSION != "1.0.0" or len(OUTPUT_SCHEMA_HASHES) != 3:
        raise RuntimeError("output contract candidate is incomplete")
