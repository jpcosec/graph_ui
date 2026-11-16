"""Real browser over the real deskops UI server and a disposable desk; no intercepted requests.

UI03 Board, UI04 Tarea, UI05 Drawer e Inbox, UI06 Agentes: what the page shows equals
`deskops view` for the same desk, the writes go through deskops operations with their
revision guards, keyboard focus is visible, and no Stitch example string appears.
"""
import json
from pathlib import Path
import subprocess
import sys
import threading

import pytest
from playwright.sync_api import expect, sync_playwright

_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)

pytest.importorskip('deskops.cli.commands.view', reason='this deskops has no `deskops view` (deskops UI01)')

from deskops.bootstrap import SLDBBootstrap  # noqa: E402
from deskops.cli.main import main as deskops_main  # noqa: E402
from deskops.lifecycle import write_lifecycle_graph  # noqa: E402
from deskops.operations import DeskopsOperations  # noqa: E402
from deskops.cli.commands import view as deskops_view  # noqa: E402
from deskops.runtime.desk_agents import agents_view  # noqa: E402
from deskops.workspace import seed_desk  # noqa: E402
from desk import serve as desk_serve  # noqa: E402
from desk_receipts import accept_activation_receipts  # noqa: E402
from deskops_viewdocs import install_views  # noqa: E402

STITCH_STRINGS = (
    'TASK-104', 'TASK-108', 'TASK-112', '85.7%', 'draft_spec_v2_syntax', 'atom-sldb-is-read-write-edit-surface',
    'Worker #2', 'session_token_ephemeral_ttl', 'DRAFT-019', 'desk-live-alpha', 'TTL:', 'v0.14.8', '@dev',
    'REQ-042', 'arch-lead', 'SIGNED_ED25519', 'draft-declarative-event-trees', 'MADUREZ', '94.2%', 'Lineage',
)
HERDR = 'herdr-missing-for-e2e'


@pytest.fixture
def desk(tmp_path, monkeypatch):
    monkeypatch.delenv('DESKOPS_ROOT', raising=False)
    root = tmp_path / 'desk-e2e'
    root.mkdir()
    for argv in (('init', '-q'), ('config', 'user.name', 'test'), ('config', 'user.email', 'test@example.com')):
        subprocess.run(['git', *argv], cwd=root, check=True, capture_output=True)
    assert SLDBBootstrap().init_local_store(root) == 0
    seed_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    def task(title, **extra):
        return ops.create_task_bundle({
            'title': title, 'why': f'Porque {title} hace falta.', 'goal': f'Objetivo: {title}.', 'scope': 'Solo el desk temporal.',
            'implementation_path': 'Leer la vista y dibujarla.', 'validation': ['pytest -q tests/e2e_desk_ui.py'],
            'done_when': 'La pantalla coincide con deskops view.', 'task_type': 'code', **extra,
        }).task_id

    first = task('Preparar la vista', pills=['pill-que-no-existe'])
    second = task('Probar la vista')
    for ident in (first, second):
        accept_activation_receipts(root, ident)
    # Since deskops CC32 a task activates only with its dependencies closed, so `second`
    # reaches ritual-testing first and gets its still-open dependency afterwards: the board
    # shows a tested task whose dependency is in execution.
    assert ops.advance_task(second)[1].progressed
    ops.edit_artifact_field('task', second, 'depends_on', json.dumps([first]))
    for title in ('Idea diferida', 'Pregunta abierta', 'Nota que cambia'):
        assert deskops_main(['message', 'send', '--root', str(root), '--title', title, '--kind', 'suggestion', f'Cuerpo de {title}.']) == 0
    deferred = next(p for p in (root / 'desk/inbox').glob('*idea-diferida.md'))
    assert deskops_main(['promote', 'inbox-to-drawer-task', deferred.name, '--root', str(root)]) == 0
    index = root / 'runs/subagents/index.jsonl'
    index.parent.mkdir(parents=True)
    index.write_text(
        json.dumps({'task_id': 'task-que-ya-cerro', 'run_id': None, 'run_dir': 'runs/subagents/vieja', 'commit': None}) + '\n'
        + json.dumps({'task_id': first, 'run_id': None, 'run_dir': None, 'mode': 'manual', 'commit': None}) + '\n',
        encoding='utf-8',
    )
    install_views(root)
    server = desk_serve.make_server(0, root, herdr=HERDR)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield {'url': f'http://127.0.0.1:{server.server_port}/', 'root': root, 'ops': ops, 'first': first, 'second': second}
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


@pytest.fixture
def browser_page():
    with sync_playwright() as pw:
        expect.set_options(timeout=60000)
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={'width': 1600, 'height': 1000}, permissions=['clipboard-read', 'clipboard-write'])
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        yield page
        assert errors == []
        browser.close()


def _no_stitch(page):
    content = page.content()
    for fake in STITCH_STRINGS:
        assert fake not in content, fake


def _focus_visible(page, locator):
    locator.focus()
    page.keyboard.press('Tab')
    page.keyboard.press('Shift+Tab')
    return locator.evaluate('e => getComputedStyle(e).outlineStyle') not in ('', 'none')


def _card(page, task_id):
    return page.locator(f'.card[data-task-id="{task_id}"]')


def _column(page, node):
    return page.locator(f'.column[data-node="{node}"]')


def _confirm(page):
    expect(page.locator('#confirm')).to_be_visible()
    page.locator('#confirm-ok').click()


# ---------------------------------------------------------------- UI03 Board
def test_board_columns_gates_advance_conflict_focus(desk, browser_page):
    page, root, ops, first, second = browser_page, desk['root'], desk['ops'], desk['first'], desk['second']
    page.goto(desk['url'])
    expect(_card(page, first)).to_be_visible()

    board = deskops_view.board_view(root)
    expect(page.locator('.column')).to_have_count(len(board['columns']))
    assert page.locator('.column').evaluate_all('els => els.map(e => e.dataset.node)') == [c['node'] for c in board['columns']]
    expect(_column(page, 'ritual-execution').locator(f'.card[data-task-id="{first}"]')).to_have_count(1)
    expect(_column(page, 'ritual-testing').locator(f'.card[data-task-id="{second}"]')).to_have_count(1)
    for column in board['columns']:
        expect(_column(page, column['node']).get_by_test_id('column-count')).to_have_text(str(column['count']))
        for card in column['tasks']:
            rendered = _card(page, card['id'])
            expect(rendered.get_by_test_id('gate-count')).to_have_text(f"gates {card['gates_holding']}/{card['gates_total']}")
            states = rendered.locator('.check').evaluate_all('els => els.map(e => e.dataset.state)')
            expected = [('holds' if gate['holds'] else 'pending') for gate in card['gates']]
            expected += [item['state'] for item in card['closeout']['evidence']]
            assert states == expected
    # The unresolved pill is an amber chip on its own card, not on the other one.
    expect(_card(page, first).get_by_test_id('unresolved-chip')).to_have_text('pill-que-no-existe')
    expect(_card(page, second).get_by_test_id('unresolved-chip')).to_have_count(0)

    assert _focus_visible(page, _card(page, first))
    page.keyboard.press('Enter')
    inspector = page.get_by_test_id('inspector')
    expect(inspector).to_contain_text('Preparar la vista')
    expect(page.locator('#advance')).to_be_enabled()
    ops.edit_artifact_field('task', first, 'scope', 'Cambiado fuera de la UI.')
    page.locator('#advance').click()
    _confirm(page)
    expect(page.get_by_test_id('action-status')).to_contain_text('Conflicto')
    assert ops.show_task(first)[0].current_node == 'ritual-execution'
    # The edit changed the contract the receipts were taken over: they are no longer
    # intact, so the operator reviews it again before advancing.
    accept_activation_receipts(root, first)

    page.locator('#refresh').click()
    expect(page.get_by_test_id('action-status')).to_have_count(0)
    assert _focus_visible(page, page.locator('#advance'))
    page.locator('#advance').click()
    _confirm(page)
    expect(_column(page, 'ritual-testing').locator(f'.card[data-task-id="{first}"]')).to_have_count(1)
    expect(_column(page, 'ritual-execution').locator('.card')).to_have_count(0)
    assert ops.show_task(first)[0].current_node == 'ritual-testing'
    for reason in ('runtime dispatch', 'graduación', 'diferir'):
        expect(inspector).to_contain_text(reason)
    expect(page.locator('.lane')).to_contain_text('Idea diferida')
    _no_stitch(page)


# ---------------------------------------------------------------- UI04 Tarea
def test_task_page_sections_inheritance_and_advance(desk, browser_page):
    page, root, ops, first, second = browser_page, desk['root'], desk['ops'], desk['first'], desk['second']
    page.goto(f"{desk['url']}#/task?id={second}")
    doc = page.get_by_test_id('task-doc')
    view = deskops_view.task_view(root, second)['task']
    expect(doc.locator('.doc-title')).to_have_text(view['title'])
    for field in ('why', 'goal', 'scope', 'implementation_path', 'done_when'):
        expect(page.get_by_test_id(f'section-{field}')).to_contain_text(view[field])
    for item in view['validation']:
        expect(page.get_by_test_id('section-validation')).to_contain_text(item)
    expect(page.get_by_test_id('frontmatter')).to_contain_text(f"current_node: {view['current_node']}")
    _no_stitch(page)

    link = page.get_by_test_id('depends-link')
    expect(link).to_have_text(first)
    assert _focus_visible(page, link)
    link.click()
    expect(doc.locator('.doc-title')).to_have_text('Preparar la vista')
    assert first in page.url

    footer = page.get_by_test_id('doc-footer')
    expect(footer).to_contain_text('gates 1/1')
    footer.locator('#advance').click()
    _confirm(page)
    expect(page.get_by_test_id('action-status')).to_contain_text('ritual-testing')
    assert ops.show_task(first)[0].current_node == 'ritual-testing'
    expect(page.get_by_test_id('frontmatter')).to_contain_text('current_node: ritual-testing')
    _no_stitch(page)


LEVEL_LABELS = {'error': 'error', 'warning': 'aviso', 'info': 'info'}


def _expect_gate_findings(gates_locator, view_gates):
    """Each rendered gate lists exactly the findings `deskops view` gives it, in order."""
    expect(gates_locator).to_have_count(len(view_gates))
    for index, gate in enumerate(view_gates):
        items = gates_locator.nth(index).get_by_test_id('gate-finding')
        findings = gate.get('findings', [])
        expect(items).to_have_count(len(findings))
        for i, finding in enumerate(findings):
            item = items.nth(i)
            expect(item).to_have_class(f"finding is-{finding['level']}")
            expect(item.locator('.finding-level')).to_have_text(LEVEL_LABELS.get(finding['level'], finding['level']))
            expect(item.locator('code').first).to_have_text(finding['code'])
            expect(item).to_contain_text(finding['what'])


def test_task_gate_shows_its_rule_findings(desk, browser_page):
    """A task.code without its preflight receipt: its gate lists the activation-rule finding."""
    page, root, ops = browser_page, desk['root'], desk['ops']
    held = ops.create_task_bundle({
        'title': 'Tarea sin recibos', 'why': 'Porque falta el recibo.', 'goal': 'Objetivo: retenida.', 'scope': 'Solo el desk temporal.',
        'implementation_path': 'Ninguna.', 'validation': ['pytest -q tests/e2e_desk_ui.py'],
        'done_when': 'El gate muestra su finding.', 'task_type': 'code',
    }).task_id
    view = deskops_view.task_view(root, held)['task']
    findings = [f for gate in view['gates'] for f in gate.get('findings', [])]
    assert any(f['code'] == 'rules/rule-activation-task-code' for f in findings), view['gates']

    page.goto(f"{desk['url']}#/task?id={held}")
    expect(page.get_by_test_id('task-doc').locator('.doc-title')).to_have_text(view['title'])
    _expect_gate_findings(page.get_by_test_id('inspector-gate'), view['gates'])
    rule = page.get_by_test_id('gate-finding').filter(has=page.locator('code', has_text='rules/rule-activation-task-code'))
    expect(rule).to_have_count(1)
    # The subject is the task itself, so it is not repeated in the finding.
    expect(rule.locator('.finding-subject')).to_have_count(0)

    # The Board inspector draws the same gates with the same findings.
    page.goto(desk['url'])
    _card(page, held).click()
    inspector = page.get_by_test_id('inspector')
    expect(inspector).to_contain_text('Tarea sin recibos')
    _expect_gate_findings(inspector.get_by_test_id('inspector-gate'), view['gates'])
    _no_stitch(page)


def test_task_gate_without_findings_has_no_list(desk, browser_page):
    page, root, first = browser_page, desk['root'], desk['first']
    view = deskops_view.task_view(root, first)['task']
    assert view['gates'] and not any(gate.get('findings') for gate in view['gates']), view['gates']
    page.goto(f"{desk['url']}#/task?id={first}")
    gates = page.get_by_test_id('inspector-gate')
    expect(gates).to_have_count(len(view['gates']))
    expect(gates.first).to_contain_text(view['gates'][0]['target'])
    expect(page.locator('ul.gate-findings')).to_have_count(0)
    expect(page.get_by_test_id('gate-finding')).to_have_count(0)


# ---------------------------------------------------------------- UI05 Drawer e Inbox
def test_drawer_lists_disk_and_copies_the_exact_command(desk, browser_page):
    page, root = browser_page, desk['root']
    page.goto(f"{desk['url']}#/drawer")
    view = deskops_view.drawer_view(root)
    files = sorted(p for p in (root / 'desk/drawer/tasks').glob('*.md') if p.name not in {'Board.md', 'README.md'})
    assert [entry['path'] for entry in view['tasks']] == [p.relative_to(root).as_posix() for p in files]
    expect(page.locator('[data-entry-id]')).to_have_count(len(files))
    entry = view['tasks'][0]
    page.locator(f'[data-entry-id="{entry["id"]}"]').click()
    expect(page.get_by_test_id('drawer-command')).to_have_text(entry['command'])
    assert page.get_by_test_id('drawer-raw').text_content() == entry['markdown']
    page.get_by_test_id('copy-command').click()
    expect(page.get_by_test_id('copy-status')).to_have_text('Copiado.')
    assert page.evaluate('navigator.clipboard.readText()') == entry['command']
    _no_stitch(page)


def test_inbox_ack_promote_and_conflict(desk, browser_page):
    page, root, ops = browser_page, desk['root'], desk['ops']
    page.goto(f"{desk['url']}#/inbox")
    view = deskops_view.inbox_view(root)
    expect(page.locator('[data-note-id]')).to_have_count(view['count'])
    assert page.locator('[data-note-id]').evaluate_all('els => els.map(e => e.dataset.noteId)') == [n['id'] for n in view['notes']]
    question = next(n for n in view['notes'] if n['title'] == 'Pregunta abierta')
    changing = next(n for n in view['notes'] if n['title'] == 'Nota que cambia')

    # Reconocer: the note shows as closed in `deskops message list`.
    page.locator(f'[data-note-id="{question["id"]}"]').click()
    expect(page.get_by_test_id('inbox-panel')).to_contain_text('Pregunta abierta')
    page.locator('#ack-note').click()
    _confirm(page)
    expect(page.get_by_test_id('note-status')).to_have_text('closed')
    listed = deskops_view.inbox_view(root)['notes']
    assert next(n for n in listed if n['id'] == question['id'])['status'] == 'closed'
    expect(page.locator('#ack-note')).to_be_disabled()

    # A note modified between reading and acting gives a conflict and stays put.
    page.locator(f'[data-note-id="{changing["id"]}"]').click()
    expect(page.get_by_test_id('inbox-panel')).to_contain_text('Nota que cambia')
    ops.edit_artifact_field('inbox-note', changing['id'], 'body', 'Cuerpo cambiado fuera de la UI.')
    page.locator('#promote-note').click()
    _confirm(page)
    expect(page.get_by_test_id('inbox-status')).to_contain_text('Conflicto')
    assert (root / changing['path']).is_file()

    # Pasar al drawer after refreshing: the drawer file exists and the note leaves the inbox.
    page.locator('#refresh').click()
    expect(page.get_by_test_id('inbox-status')).to_have_count(0)
    page.locator(f'[data-note-id="{changing["id"]}"]').click()
    assert _focus_visible(page, page.locator('#promote-note'))
    page.locator('#promote-note').click()
    _confirm(page)
    expect(page.get_by_test_id('inbox-status')).to_contain_text('Pasada al drawer')
    assert not (root / changing['path']).exists()
    assert (root / 'desk/drawer/tasks/task-nota-que-cambia.md').is_file()
    expect(page.locator(f'[data-note-id="{changing["id"]}"]')).to_have_count(0)
    _no_stitch(page)


# ---------------------------------------------------------------- UI06 Agentes
def test_agents_without_herdr_shows_cause_and_runs_match_the_view(desk, browser_page):
    page, root, first = browser_page, desk['root'], desk['first']
    page.goto(f"{desk['url']}#/agents")
    view = agents_view(root, herdr=HERDR)
    assert view['workers'] is None
    expect(page.locator('.notice.is-error')).to_contain_text('Herdr no está disponible')
    expect(page.get_by_test_id('metric-workers')).to_contain_text('no disponible')
    rows = page.get_by_test_id('runs-table').locator('tbody tr')
    expect(rows).to_have_count(len(view['runs']))
    assert rows.evaluate_all('els => els.map(e => e.dataset.task)') == [run['task_id'] for run in view['runs']]
    link = page.get_by_test_id('run-task-link')
    expect(link).to_have_text(first)
    link.click()
    expect(page.get_by_test_id('task-doc').locator('.doc-title')).to_have_text('Preparar la vista')
    _no_stitch(page)


# ---------------------------------------------------------------- package close: all screens
def test_every_screen_loads_from_the_sidebar_with_visible_focus(desk, browser_page):
    page = browser_page
    page.goto(desk['url'])
    expect(page.locator('.card').first).to_be_visible()
    for screen, marker in (('drawer', 'drawer-list'), ('inbox', 'inbox-list'), ('agents', 'runs-table'), ('board', None)):
        link = page.locator(f'.nav-item[data-screen="{screen}"]')
        assert _focus_visible(page, link)
        page.keyboard.press('Enter')
        expect(link).to_have_attribute('aria-current', 'page')
        if marker:
            expect(page.get_by_test_id(marker)).to_be_visible()
        else:
            expect(page.locator('.column')).to_have_count(3)
        _no_stitch(page)
    expect(page.locator('#inspect-link')).to_have_attribute('href', 'http://127.0.0.1:8090/')
