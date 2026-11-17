import importlib.util, subprocess, sys
from pathlib import Path
import pytest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("e2e_views", HERE / "e2e_review_workbench_views.py")
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)


def test_build_rc_nonzero_raises_calledprocesserror(tmp_path):
    assert mod.APP == HERE.parent / "apps" / "review-workbench"
    dist = tmp_path / "rw-rc-fail" / "dist"
    dist.parent.mkdir()
    with pytest.raises(subprocess.CalledProcessError) as info:
        mod._build(dist, timeout=120)
    err = info.value
    print("RC", err.returncode, "CMD", err.cmd)
    print("OUTPUT>>>", err.output, "<<<")
    log = (dist.parent / "vite-build.log").read_text(errors="replace")
    assert err.returncode != 0
    assert err.cmd[:3] == ["npx", "vite", "build"] and str(dist) in err.cmd
    assert isinstance(err.output, str) and err.output == log and err.output.strip()
    assert mod._holding(str(dist)) == []


def test_build_missing_parent(tmp_path):
    dist = tmp_path / "no-such-parent" / "dist"
    with pytest.raises(FileNotFoundError):
        mod._build(dist, timeout=30)
    assert mod._holding(str(dist)) == []


def test_build_log_fd_closed_in_parent(tmp_path):
    import os
    dist = tmp_path / "rw-fd" / "dist"
    dist.parent.mkdir()
    with pytest.raises(subprocess.CalledProcessError):
        mod._build(dist, timeout=120)
    log = str(dist.parent / "vite-build.log")
    fds = [os.readlink(f"/proc/self/fd/{fd}") for fd in os.listdir("/proc/self/fd") if os.path.exists(f"/proc/self/fd/{fd}")]
    assert log not in fds, fds
