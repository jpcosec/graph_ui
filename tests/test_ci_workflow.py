"""The GitHub Actions workflow runs the same suite this repo documents (CLAUDE.md, README).

CI is the only place the suite runs on a machine that is not an agent's; these checks keep
the workflow from silently dropping a part of it (the e2e job, the review-workbench toolchain)
or drifting from the commands the review-workbench tests run locally.
"""

from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"
SUITE = ROOT / ".github" / "requirements-suite.txt"


def _runs(job):
    return [step["run"] for step in job["steps"] if "run" in step]


def _jobs():
    return yaml.safe_load(WORKFLOW.read_text(encoding="utf-8"))["jobs"]


def test_mindmap_job_runs_pytest_without_e2e_and_every_node_test():
    runs = _runs(_jobs()["mindmap"])
    assert any("pytest tests" in r and "--ignore-glob='tests/e2e_*'" in r for r in runs)
    assert "node --test tests/*.test.mjs" in runs


def test_review_workbench_job_runs_the_toolchain_the_local_tests_run():
    job = _jobs()["review-workbench"]
    assert job["defaults"]["run"]["working-directory"] == "apps/review-workbench"
    runs = _runs(job)
    local = (ROOT / "tests" / "test_review_workbench.py").read_text(encoding="utf-8")
    assert runs[0] == "npm ci"
    # Same commands as tests/test_review_workbench.py, which skips without node_modules.
    for command, local_args in [
        ("npx tsc -p tsconfig.app.json --noEmit", '"npx", "tsc", "-p", "tsconfig.app.json", "--noEmit"'),
        ("npx vitest run", '"npx", "vitest", "run"'),
        ("node scripts/lint-architecture.mjs", '"node", "scripts/lint-architecture.mjs"'),
    ]:
        assert command in runs
        assert local_args in local


def test_e2e_job_is_separate_and_installs_chromium():
    runs = _runs(_jobs()["e2e"])
    assert any("playwright install --with-deps chromium" in r for r in runs)
    assert any("pytest tests/e2e_*.py" in r for r in runs)
    # The review-workbench e2e builds the app: without npm ci it would skip silently.
    assert "npm ci" in runs


def test_sibling_repos_come_from_git_main_branches_not_releases():
    lines = [l for l in SUITE.read_text(encoding="utf-8").splitlines() if l and not l.startswith("#")]
    assert len(lines) == 4 and all("git+https://github.com/jpcosec/" in l for l in lines)


def test_python_jobs_cover_the_supported_floor():
    pyproject = (ROOT / "pyproject.toml").read_text(encoding="utf-8")
    assert 'requires-python = ">=3.12"' in pyproject
    for name in ("mindmap", "e2e"):
        assert _jobs()[name]["strategy"]["matrix"]["python-version"] == ["3.12", "3.13"]


def test_python_jobs_rebuild_the_derived_store_beside_deskops():
    """The store is derived (.sldb/store.yaml): it links ../../deskops/.sldb, so CI lays the repos
    out as on a workstation and builds deskops' store before graph_ui's."""
    for name in ("mindmap", "e2e"):
        job = _jobs()[name]
        assert job["defaults"]["run"]["working-directory"] == "UIs/graph_ui"
        paths = {step.get("with", {}).get("path") for step in job["steps"] if step.get("uses", "").startswith("actions/checkout")}
        assert paths == {"UIs/graph_ui", "deskops"}
        build = next(r for r in _runs(job) if "sldb stores build" in r)
        assert build.index("../../deskops") < build.rindex("sldb stores build")
    assert "sldb stores build --check" in _runs(_jobs()["mindmap"])
    assert (ROOT / ".sldb" / "store.yaml").exists()
