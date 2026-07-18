"""Architecture boundary tests: domain imports no infrastructure."""

from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path

import pytest


DOMAIN_ROOT = Path(__file__).resolve().parents[4] / "backend" / "src" / "neuralverse_backend" / "domain"


def _get_all_domain_modules() -> list[str]:
    """Collect all Python modules under the domain package."""
    modules: list[str] = []
    for py_file in sorted(DOMAIN_ROOT.rglob("*.py")):
        if py_file.name == "__pycache__":
            continue
        rel = py_file.relative_to(DOMAIN_ROOT.parent.parent)
        mod = str(rel.with_suffix("")).replace(os.sep, ".")
        modules.append(mod)
    return modules


DOMAIN_MODULES = _get_all_domain_modules()


FORBIDDEN_IMPORTS = {
    "fastapi",
    "sqlalchemy",
    "alembic",
    "temporalio",
    "redis",
    "httpx",
    "starlette",
    "pydantic",
    "pydantic_settings",
}


@pytest.mark.parametrize("module_path", DOMAIN_MODULES)
def test_domain_module_imports_no_fastapi(module_path: str) -> None:
    """Domain modules must not import FastAPI."""
    source = (DOMAIN_ROOT.parent.parent / module_path.replace(".", os.sep)).with_suffix(".py")
    if not source.exists():
        source = DOMAIN_ROOT.parent.parent / module_path.replace(".", os.sep) / "__init__.py"
    if not source.exists():
        pytest.skip(f"Module file not found: {module_path}")

    content = source.read_text()
    for forbidden in FORBIDDEN_IMPORTS:
        assert f"import {forbidden}" not in content and f"from {forbidden}" not in content, (
            f"Domain module {module_path} imports forbidden package: {forbidden}"
        )


def test_domain_imports_no_sqlalchemy() -> None:
    """Verify domain __init__.py does not import SQLAlchemy."""
    init_file = DOMAIN_ROOT / "__init__.py"
    content = init_file.read_text()
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("import sqlalchemy") or stripped.startswith("from sqlalchemy"):
            pytest.fail(f"Domain imports sqlalchemy: {stripped}")


def test_domain_imports_no_fastapi() -> None:
    """Verify domain __init__.py does not import FastAPI."""
    init_file = DOMAIN_ROOT / "__init__.py"
    content = init_file.read_text()
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("import fastapi") or stripped.startswith("from fastapi"):
            pytest.fail(f"Domain imports fastapi: {stripped}")


def test_domain_imports_no_alembic() -> None:
    """Verify domain __init__.py does not import Alembic."""
    init_file = DOMAIN_ROOT / "__init__.py"
    content = init_file.read_text()
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("import alembic") or stripped.startswith("from alembic"):
            pytest.fail(f"Domain imports alembic: {stripped}")


def test_domain_imports_no_temporal() -> None:
    """Verify domain __init__.py does not import Temporal."""
    init_file = DOMAIN_ROOT / "__init__.py"
    content = init_file.read_text()
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("import temporal") or stripped.startswith("from temporal"):
            pytest.fail(f"Domain imports temporal: {stripped}")


def test_domain_imports_no_acp() -> None:
    """Verify domain modules don't reference ACP."""
    for mod_path in DOMAIN_MODULES:
        source = (DOMAIN_ROOT.parent.parent / mod_path.replace(".", os.sep)).with_suffix(".py")
        if not source.exists():
            source = DOMAIN_ROOT.parent.parent / mod_path.replace(".", os.sep) / "__init__.py"
        if not source.exists():
            continue
        content = source.read_text().lower()
        # ACP is an external protocol, not to be imported by domain
        if "acp" in content:
            # Only flag if it's an import, not a comment or variable name
            for line in content.split("\n"):
                stripped = line.strip()
                if stripped.startswith("import") or stripped.startswith("from"):
                    if "acp" in stripped:
                        pytest.fail(f"Domain module {mod_path} imports ACP: {stripped}")


def test_domain_no_cyclic_context_dependencies() -> None:
    """Bounded contexts must not import each other's private modules."""
    context_dirs = [d for d in DOMAIN_ROOT.iterdir() if d.is_dir() and d.name != "__pycache__"]
    for ctx_dir in context_dirs:
        ctx_name = ctx_dir.name
        for py_file in ctx_dir.rglob("*.py"):
            if py_file.name == "__init__.py":
                continue
            content = py_file.read_text()
            # Check for imports from other contexts
            for other_dir in context_dirs:
                if other_dir.name == ctx_name or other_dir.name == "shared":
                    continue
                forbidden_pattern = f"from ..{other_dir.name}"
                assert forbidden_pattern not in content, (
                    f"Context {ctx_name} imports private module from {other_dir.name}: {py_file}"
                )
