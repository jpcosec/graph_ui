"""apps/review-workbench verification, run for real inside the repo suite.

The React editor has its own toolchain (tsc, vitest, an architecture lint).
These tests invoke it as-is so `python3 -m pytest tests` covers it too, and so
deskops closeouts on review-workbench work have test evidence under tests/.
Vitest runs directly (not `npm test`): `npm test` first regenerates node types
(`hum:sync`), which would write into the tree during the suite.
"""

import shutil
import subprocess
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[1] / "apps" / "review-workbench"

pytestmark = pytest.mark.skipif(
    shutil.which("npx") is None or not (APP / "node_modules").is_dir(),
    reason="review-workbench needs node and `npm install` in apps/review-workbench",
)


def _run(*cmd: str, timeout: int = 600) -> None:
    result = subprocess.run(cmd, cwd=APP, capture_output=True, text=True, timeout=timeout)
    assert result.returncode == 0, f"{' '.join(cmd)} failed:\n{result.stdout[-4000:]}\n{result.stderr[-4000:]}"


def test_typecheck():
    _run("npx", "tsc", "-p", "tsconfig.app.json", "--noEmit")


def test_vitest():
    _run("npx", "vitest", "run")


def test_architecture_lint():
    _run("node", "scripts/lint-architecture.mjs")
