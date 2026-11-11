"""Activation receipts for the temporary desks the tests build.

Since deskops CC32 (6afc78b0) a task leaves ritual-execution only with the receipts
its type asks for (desk/lifecycle/rule-activation-<type>.md). A test desk has no
reviewer model, so the fixtures record them the way the deskops quickstart and its
CI do: a human receipt through the deskops CLI (`deskops review record`) and its
disposition (`deskops review dispose --verdict accepted`). No private deskops API.
"""
import contextlib
import io
import json
from pathlib import Path

from deskops.cli.main import main as deskops_main

# Receipt kinds each activation rule asks for (deskops/data/rules/rule-activation-*.md).
KINDS_BY_TYPE = {
    'code': ('preflight', 'bundle'),
    'debug': ('preflight', 'reproduction'),
}
DEFAULT_KINDS = ('preflight',)


def _deskops(root, *argv):
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        code = deskops_main([*argv, '--root', str(root), '--format', 'json'])
    assert code == 0, f'deskops {" ".join(argv)} -> {code}: {out.getvalue()}'
    return json.loads(out.getvalue())


def accept_activation_receipts(root, task_id, task_type='code'):
    """Record and accept the receipts `task_type` needs to leave ritual-execution."""
    root = Path(root)
    evidence = f'desk/tasks/{task_id}.md'
    assert (root / evidence).is_file(), evidence
    for kind in KINDS_BY_TYPE.get(task_type, DEFAULT_KINDS):
        argv = ['review', 'record', task_id, '--kind', kind, '--evidence', evidence,
                '--reason', 'test fixture: contract read by the operator']
        if kind in ('preflight', 'bundle'):
            argv += ['--operator', 'graph_ui tests']
        record = _deskops(root, *argv)
        _deskops(root, 'review', 'dispose', record['review_id'], '--verdict', 'accepted',
                 '--reason', 'test fixture: accepted by the operator')
