"""Command-line entry point for deterministic projection generation."""

from __future__ import annotations

import argparse
from pathlib import Path

from neuralverse_contracts_tooling.projections import generate, verify_generated

ROOT = Path(__file__).parents[1]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.check:
        verify_generated(ROOT)
    else:
        generate(ROOT)
