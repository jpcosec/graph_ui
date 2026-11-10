"""Real browser E2E test for multi-projection workspace with Playwright."""
import os
from pathlib import Path
import re
import subprocess
import sys
import threading

# Asegurar precedencia de este worktree sobre cualquier paquete editable instalado
_frontends_dir = str(Path(__file__).resolve().parent.parent / 'frontends')
if _frontends_dir not in sys.path:
    sys.path.insert(0, _frontends_dir)
for _mod in list(sys.modules):
    if _mod == 'mindmap' or _mod.startswith('mindmap.'):
        del sys.modules[_mod]

import pytest
from playwright.sync_api import expect, sync_playwright

from deskops.bootstrap import SLDBBootstrap
from deskops.lifecycle import write_lifecycle_graph
from deskops.operations import DeskopsOperations
from deskops.workspace import scaffold_desk
from mindmap.serve import make_server


@pytest.fixture
def workspace_e2e_server(tmp_path, monkeypatch):
    root = tmp_path / "workspace-e2e"
    root.mkdir()

    # Inicializar git real
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)

    (root / '.gitignore').write_text('secrets.env\n', encoding='utf-8')

    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    # Crear archivo de código real
    src_dir = root / 'src'
    src_dir.mkdir(parents=True)
    sample_py = src_dir / 'app.py'
    sample_py.write_text(
        '# Header\n'
        'def main():\n'
        '    print("Iniciando workspace...")\n'
        '    return 0\n',
        encoding='utf-8'
    )

    # Crear tareas con relación e hipervínculo a código en 'files'
    bundle_target = ops.create_task_bundle({
        'title': 'Tarea Destino',
        'goal': 'Objetivo del destino',
        'scope': 'Scope temporal',
        'files': ['src/app.py:3'],
        'validation': ['pytest'],
        'done_when': 'Completada',
    })

    bundle_source = ops.create_task_bundle({
        'title': 'Tarea Origen',
        'goal': 'Objetivo del origen',
        'scope': 'Scope temporal',
        'files': ['src/app.py:2'],
        'depends_on': [f'desk/tasks/{bundle_target.task_id}.md'],
        'validation': ['pytest'],
        'done_when': 'Completada',
    })

    monkeypatch.setenv('DESKOPS_ROOT', str(root))
    server = make_server(0, root / '.sldb')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        yield f"http://127.0.0.1:{server.server_port}", bundle_source.task_id, bundle_target.task_id
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _screenshot(page, name):
    target = os.environ.get("WORKSPACE_SCREENSHOT_DIR")
    if target:
        directory = Path(target)
        directory.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(directory / name), full_page=True)


def test_workspace_projections_navigation_and_responsiveness(workspace_e2e_server):
    url, source_id, target_id = workspace_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: (errors.append(str(error)), print("Browser error:", error)))

        # 1. Navegación directa con deep link al source, pedido por su base (TaskDoc); se muestra
        # con su identidad canónica (TaskCodeDoc)
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&depth=1&tab=document")

        # Verificar encabezado y vista activa
        expect(page.locator(".workspace-header-title h1")).to_contain_text(source_id)
        expect(page.locator(".workspace-tab-btn.active")).to_have_text("Documento")
        expect(page.locator(".workspace-doc-header h2")).to_have_text("Tarea Origen")
        expect(page.locator(".workspace-doc-meta")).to_contain_text("TaskCodeDoc")

        # Proyección documental (IR / campos)
        expect(page.locator(".workspace-doc-content").first).to_be_visible()
        expect(page.locator(".workspace-payload-field").first).to_be_visible()
        expect(page.get_by_role("heading", name="Estructura Documental (IR)")).to_be_visible()
        expect(page.locator(".workspace-ir-title", has_text="Goal").first).to_be_visible()
        expect(page.locator(".workspace-ir-title", has_text="Scope").first).to_be_visible()

        # Sidebar identidad, status y hashes separados
        expect(page.locator(".workspace-sidebar")).to_contain_text(source_id)
        expect(page.locator(".workspace-sidebar")).to_contain_text("TaskCodeDoc")
        expect(page.locator(".workspace-identity-prop").filter(has_text="Estado")).to_contain_text("draft")
        expect(page.locator(".workspace-identity-prop").filter(has_text="Content Hash (SLDB)")).to_be_visible()
        expect(page.locator(".workspace-identity-prop").filter(has_text="File Revision (Git/Disk)")).to_be_visible()
        expect(page.locator(".workspace-no-problems")).to_be_visible()

        # 2. Navegar a proyección de Código
        page.get_by_role("button", name="Código", exact=True).click()
        expect(page.locator(".workspace-tab-btn.active")).to_have_text("Código")
        expect(page.locator(".workspace-code-filename")).to_contain_text("src/app.py:2")
        expect(page.locator(".workspace-code-line.target-line")).to_contain_text("def main():")
        expect(page.locator(".workspace-code-line.target-line .workspace-code-line-num")).to_have_text("2")

        # 3. Navegar a proyección de Grafo Local
        page.get_by_role("button", name="Grafo Local", exact=True).click()
        expect(page.locator(".workspace-tab-btn.active")).to_have_text("Grafo Local")
        expect(page.locator(".workspace-graph-node-card.is-center")).to_contain_text(source_id)

        # Verificar que el tipo de relación NO salga vacío en el grafo
        edge_item = page.locator(".workspace-graph-edges-list .workspace-edge-item").first
        edge_item.scroll_into_view_if_needed()
        expect(edge_item).to_be_visible()
        expect(edge_item.locator(".workspace-edge-rel")).to_have_text(re.compile(r"──\[[a-zA-Z0-9_-]+\]──▶"))

        # Probar filtro por tipo de relación
        type_select = page.get_by_label("Filtrar por tipo de relación")
        expect(type_select).to_be_visible()
        options = type_select.locator("option").all_inner_texts()
        if len(options) > 1:
            specific_type = options[1]
            type_select.select_option(label=specific_type)
            expect(page.locator(".workspace-graph-edges-list .workspace-edge-item").first).to_be_visible()

        # Control de profundidad reactivo: cambiar a 2 hops
        depth_2_btn = page.get_by_role("button", name="2 hops", exact=True)
        depth_2_btn.click()
        expect(depth_2_btn).to_have_class("workspace-depth-btn active")
        expect(page).to_have_url(re.compile(r"depth=2"))

        # 4. Navegación interactiva a otro nodo desde la sidebar de relaciones
        rel_target_btn = page.locator(".workspace-rel-item-btn").filter(has_text=target_id)
        expect(rel_target_btn).to_be_visible()
        rel_target_btn.click()

        # El nodo activo ahora es Tarea Destino
        expect(page.locator(".workspace-header-title h1")).to_contain_text(target_id)
        expect(page).to_have_url(re.compile(rf"id=TaskCodeDoc(%3A|:){re.escape(target_id)}"))

        # 5. Probar el botón ATRÁS del navegador (B10)
        page.go_back()
        expect(page.locator(".workspace-header-title h1")).to_contain_text(source_id)
        expect(page).to_have_url(re.compile(rf"id=Task(Code)?Doc(%3A|:){re.escape(source_id)}"))

        # Volver a pestaña Documento para verificar los datos
        page.get_by_role("button", name="Documento", exact=True).click()
        expect(page.locator(".workspace-doc-header h2")).to_have_text("Tarea Origen")

        _screenshot(page, "workspace-desktop.png")

        # 6. Modo responsivo y skin
        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("localStorage.setItem('kb-skin', 'dark')")
        page.reload()

        expect(page.locator(".workspace-doc-header h2")).to_have_text("Tarea Origen")
        expect(page.locator("html")).to_have_attribute("data-skin", "dark")
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")

        _screenshot(page, "workspace-mobile.png")

        # Sin errores de ejecución de JavaScript en el navegador
        assert not errors, f"Se encontraron errores en el navegador: {errors}"
        browser.close()


# ---------------------------------------------------------------------------
# WS13.1: lector de documento (fuente, enlaces, foco, rango local de Code)
# ---------------------------------------------------------------------------

GUIA_MD = (
    '# Guia del lector\n'
    '\n'
    'Introduccion con enlace a [[otro.md]] y un destino roto [[no-existe.md]].\n'
    '\n'
    '## Primera parte\n'
    '\n'
    'Salta a [[otro.md#Segunda parte]]. Externo: [[https://example.com/x]].\n'
    '\n'
    '## Segunda parte\n'
    '\n'
    '- punto uno con [[otro.md]]\n'
    '- punto dos\n'
)
OTRO_MD = '# Otro documento\n\nCuerpo breve.\n\n## Segunda parte\n\nDestino del ancla. Vuelve a [[guia.md]].\n'


@pytest.fixture
def reader_e2e_server(tmp_path, monkeypatch):
    root = tmp_path / "reader-e2e"
    root.mkdir()
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)

    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    write_lifecycle_graph(root)
    ops = DeskopsOperations(root)

    (root / 'src').mkdir()
    (root / 'src' / 'app.py').write_text(''.join(f'linea {n}\n' for n in range(1, 13)), encoding='utf-8')
    (root / 'docs').mkdir()
    (root / 'docs' / 'guia.md').write_text(GUIA_MD, encoding='utf-8')
    (root / 'docs' / 'otro.md').write_text(OTRO_MD, encoding='utf-8')

    target = ops.create_task_bundle({
        'title': 'Tarea Destino', 'goal': 'Objetivo del destino', 'scope': 'Scope temporal',
        'validation': ['pytest'], 'done_when': 'Completada',
    })
    source = ops.create_task_bundle({
        'title': 'Tarea Origen', 'goal': 'Objetivo del origen', 'scope': 'Scope temporal',
        'files': ['src/app.py:6'], 'references': ['docs/guia.md'],
        'depends_on': [target.task_id], 'inherits_from': [target.task_id],
        'validation': ['pytest'], 'done_when': 'Completada',
    })

    monkeypatch.setenv('DESKOPS_ROOT', str(root))
    server = make_server(0, root / '.sldb')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", source.task_id, target.task_id
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _reader_count(page):
    return page.locator('[data-testid="document-reader"]').count()


def test_reader_unmodeled_render_source_links_and_instance(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        page.goto(f"{url}/workspace/node?path=docs/guia.md&tab=document")
        reader = page.locator('[data-testid="document-reader"]')
        expect(reader).to_be_visible()
        assert _reader_count(page) == 1
        revision = reader.get_attribute('data-revision')
        assert len(revision) == 64

        # fuente cruda literal: las lineas coinciden con el archivo y no contiene vinculos
        src_lines = page.locator('[data-testid="doc-source"] .workspace-src-line .workspace-code-line-text').all_text_contents()
        assert src_lines == GUIA_MD.splitlines(), (src_lines, page.locator('[data-testid="doc-source"]').inner_html()[:600])
        assert page.locator('[data-testid="doc-source"] a').count() == 0
        # render: encabezados y enlaces vivos
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Primera parte')
        expect(page.locator('[data-testid="doc-render"] a[data-status="ok"]').first).to_be_visible()
        broken = page.locator('[data-testid="doc-render"] [data-status="roto"]')
        expect(broken).to_have_count(1)
        assert page.locator('[data-testid="doc-render"] a[data-status="externo"]').count() == 0
        expect(page.locator('[data-testid="doc-render"] [data-status="externo"]')).to_have_count(1)
        # sidebar: contexto sin inventar modelo
        expect(page.locator('[data-testid="ctx-path"]')).to_have_text('docs/guia.md')
        expect(page.locator('[data-testid="rel-absent"]')).to_contain_text('no modelado')
        expect(page.get_by_role('heading', name='Estructura Documental (IR)')).to_have_count(0)
        _screenshot(page, "reader-unmodeled-document.png")

        # foco en seccion: render y fuente comparten el span
        page.locator('[data-testid="outline"] [data-testid="section-focus"]', has_text='Primera parte').click()
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('Primera parte (L5-L8)')
        expect(page.locator('.workspace-src-line.is-focused')).to_have_count(4)

        # alternar Graph y Code: misma URL (path), misma revision, un solo lector, foco intacto
        before_url = page.url
        for tab, test_id in (('Grafo Local', 'no-graph'), ('Código', 'no-code')):
            page.get_by_role('button', name=tab, exact=True).click()
            expect(page.locator(f'[data-testid="{test_id}"]')).to_contain_text('Sin grafo ni referencias')
            assert _reader_count(page) == 1
            assert reader.get_attribute('data-revision') == revision
            assert 'path=docs%2Fguia.md' in page.url or 'path=docs/guia.md' in page.url
            assert 'id=' not in page.url
            expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('Primera parte')
        _screenshot(page, "reader-unmodeled-no-graph.png")
        page.get_by_role('button', name='Documento', exact=True).click()
        expect(page.locator('[data-testid="document-reader"]')).to_be_visible()
        expect(page.locator('.workspace-src-line.is-focused')).to_have_count(4)
        assert _reader_count(page) == 1

        # seguir un enlace con ancla: navega por path, no copia, enfoca la seccion destino
        page.locator('[data-testid="doc-render"] a[data-open="path:docs/otro.md"]', has_text='Segunda parte').click()
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Otro documento')
        assert 'anchor=' in page.url and 'path=docs' in page.url
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('Segunda parte (L5-L7)')
        assert _reader_count(page) == 1
        assert reader.get_attribute('data-revision') != revision

        # atras: vuelve al documento anterior (misma revision), un solo lector
        page.go_back()
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Guia del lector')
        assert reader.get_attribute('data-revision') == revision
        assert _reader_count(page) == 1

        # refresco del mismo documento: no es otra copia
        page.get_by_role('button', name='Actualizar', exact=True).click()
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Guia del lector')
        assert _reader_count(page) == 1
        assert reader.get_attribute('data-revision') == revision

        # error visible: ruta protegida
        page.goto(f"{url}/workspace/node?path=.git/config")
        expect(page.locator('[data-testid="source-error"]')).to_contain_text('protegido')
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_modeled_focus_survives_tab_toggles_and_code_range(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=document")
        reader = page.locator('[data-testid="document-reader"]')
        expect(reader).to_be_visible()
        revision = reader.get_attribute('data-revision')
        start_url = page.url
        id_param = re.compile(rf"id=TaskCodeDoc(%3A|:){re.escape(source_id)}")
        assert id_param.search(page.url)
        # render y fuente del mismo origen
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Objetivo del origen')
        src_text = '\n'.join(page.locator('[data-testid="doc-source"] .workspace-code-line-text').all_text_contents())
        assert 'Objetivo del origen' in src_text and src_text.startswith('---')
        expect(page.locator('.workspace-identity-prop').filter(has_text='File Revision')).to_contain_text(revision[:16])
        _screenshot(page, "reader-modeled-document.png")

        # 1. foco en campo depends_on: Documento lo marca, Grafo marca sus aristas, Code no corresponde
        page.locator('[data-testid="field-focus"]', has_text='depends_on').click()
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('campo depends_on')
        expect(page.locator('.workspace-payload-field.is-focused')).to_have_count(1)
        page.get_by_role('button', name='Grafo Local', exact=True).click()
        focused_edges = page.locator('[data-testid="edge-item"][data-focused="true"]')
        expect(focused_edges).to_have_count(1)
        # multiplicidad: una arista, dos procedencias (depends_on e inherits_from)
        expect(focused_edges.locator('[data-testid="edge-prov"]')).to_contain_text('depends_on')
        expect(focused_edges.locator('[data-testid="edge-prov"]')).to_contain_text('inherits_from')
        _screenshot(page, "reader-modeled-graph-focus.png")
        page.get_by_role('button', name='Código', exact=True).click()
        expect(page.locator('[data-testid="code-card"][data-focused="true"]')).to_have_count(0)
        assert 'Código: 0' in page.locator('[data-testid="focus-corr"]').inner_text()
        # misma identidad en la URL, misma revision, un solo lector
        assert id_param.search(page.url) and 'path=' not in page.url
        assert reader.get_attribute('data-revision') == revision
        assert _reader_count(page) == 1

        # 2. foco en referencia de Code (files[0]): fija su campo en el documento
        page.locator('[data-testid="code-card"][data-field="files"] [data-testid="code-ref-focus"]').click()
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('referencia files[0] src/app.py:6')
        expect(page.locator('[data-testid="code-card"][data-focused="true"]')).to_have_count(1)
        # el contexto :N±5 se conserva
        expect(page.locator('.workspace-code-line.target-line .workspace-code-line-num').first).to_have_text('6')
        page.get_by_role('button', name='Documento', exact=True).click()
        focused_fields = page.locator('.workspace-payload-field.is-focused')
        expect(focused_fields).to_have_count(1)
        expect(focused_fields).to_have_attribute('data-field-path', 'files')
        page.get_by_role('button', name='Grafo Local', exact=True).click()
        expect(page.locator('[data-testid="edge-item"][data-focused="true"]')).to_have_count(0)
        assert _reader_count(page) == 1 and reader.get_attribute('data-revision') == revision

        # 3. foco en arista: marca sus campos de procedencia en el documento
        page.locator('[data-testid="edge-item"]', has_text=target_id).first.click()
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('arista')
        page.get_by_role('button', name='Documento', exact=True).click()
        expect(page.locator('.workspace-payload-field.is-focused')).to_have_count(2)
        assert id_param.search(page.url) and reader.get_attribute('data-revision') == revision

        # 4. rango local de Code: clic y mayusculas + clic sobre la vista del archivo completo
        page.get_by_role('button', name='Código', exact=True).click()
        card = page.locator('[data-testid="code-card"][data-field="files"]')
        card.locator('[data-testid="code-toggle-full"]').click()
        full = card.locator('[data-testid="code-full"]')
        expect(full.locator('tr[data-line]')).to_have_count(12)
        full.locator('tr[data-line="3"]').click()
        expect(full.locator('[data-testid="code-range-label"]')).to_have_text('L3')
        full.locator('tr[data-line="7"]').click(modifiers=['Shift'])
        expect(full.locator('[data-testid="code-range-label"]')).to_have_text('L3-L7')
        expect(full.locator('tr.in-range')).to_have_count(5)
        _screenshot(page, "reader-code-range.png")
        full.locator('tr[data-line="10"]').click()
        expect(full.locator('[data-testid="code-range-label"]')).to_have_text('L10')
        full.locator('tr[data-line="2"]').click()
        full.locator('tr[data-line="4"]').click(modifiers=['Shift'])
        expect(full.locator('[data-testid="code-range-label"]')).to_have_text('L2-L4')
        # el rango es local: no toca la URL ni el foco compartido
        assert id_param.search(page.url) and 'L2' not in page.url
        # el rango sobrevive a alternar de pestana dentro de la misma instancia
        page.get_by_role('button', name='Documento', exact=True).click()
        page.get_by_role('button', name='Código', exact=True).click()
        card.locator('[data-testid="code-toggle-full"]').click()
        expect(card.locator('[data-testid="code-range-label"]')).to_have_text('L2-L4')

        # el desk modelado enlaza por id: nada de pageerror, un solo lector
        assert _reader_count(page) == 1
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_follows_model_link_from_reference_and_tracked_path(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        # un path que el store rastrea se abre con identidad Model:name, sin redireccion
        page.goto(f"{url}/workspace/node?path=desk/tasks/{source_id}.md")
        expect(page.locator(".workspace-header-title h1")).to_have_text(f"TaskCodeDoc:{source_id}")
        assert 'path=' in page.url and 'id=' not in page.url
        expect(page.locator('.workspace-identity-prop').filter(has_text='Path')).to_contain_text(f"desk/tasks/{source_id}.md")
        # una referencia de Code a un .md se abre como documento no modelado
        page.get_by_role('button', name='Código', exact=True).click()
        page.locator('[data-testid="code-card"][data-field="references"] [data-testid="code-open-doc"]').click()
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Guia del lector')
        assert 'path=docs' in page.url and _reader_count(page) == 1
        # relacion del documento modelado: navegar a otro documento no es foco
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}")
        page.locator(".workspace-rel-item-btn").filter(has_text=target_id).first.click()
        expect(page.locator(".workspace-header-title h1")).to_contain_text(target_id)
        assert page.locator('[data-testid="focus-bar"]').count() == 0
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


# ---------------------------------------------------------------------------
# Correccion WS13.1: estado ligado a la identidad, respuestas atrasadas, foco con dueño, anclas
# ---------------------------------------------------------------------------

import hashlib


class HeldResponses:
    """Retrasa de verdad respuestas GET reales: page.route retiene la peticion y, al liberarla,
    route.continue_() la envia al servidor real, de modo que la respuesta (real) llega al
    navegador cuando la prueba lo decide, despues de lo que haya pasado mientras tanto."""

    def __init__(self, page, pattern):
        self.held = []
        self.requested = []
        self.page = page
        self.delivered = []
        page.route(pattern, self._handle)
        page.on('response', lambda r: self.delivered.append(r.url) if r.url in self.requested else None)

    def _handle(self, route):
        self.requested.append(route.request.url)
        self.held.append(route)

    def release(self):
        held, self.held = self.held, []
        for route in held:
            route.continue_()
        # espera a que la respuesta real haya llegado al navegador (no se da por hecha)
        for _ in range(100):
            if len(self.delivered) >= len(self.requested):
                break
            self.page.wait_for_timeout(100)
        assert len(self.delivered) >= len(self.requested), 'la respuesta retenida nunca llego'


def _sidebar(page):
    return page.locator('.workspace-sidebar')


def test_reader_late_node_response_of_previous_document_is_discarded(reader_e2e_server):
    """A (modelado) -> B (modelado): la respuesta atrasada de /node de A llega con B abierto."""
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        held = HeldResponses(page, f'**/api/workspace/node?id=TaskCodeDoc%3A{source_id}*')
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=code")
        # /source de A llega; /node de A queda retenido: el panel Code muestra carga, no ausencia
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskCodeDoc:{source_id}')
        expect(page.locator('.workspace-code-pane')).to_contain_text('Cargando código')
        expect(_sidebar(page).locator('.workspace-identity-prop').filter(has_text='Estado')).to_contain_text('Cargando')
        expect(page.locator('[data-testid="code-card"]')).to_have_count(0)
        assert len(held.requested) == 1
        # navegar a B (otro documento) mientras la respuesta de A sigue en el aire
        page.get_by_label('Seleccionar nodo activo').select_option(f'TaskCodeDoc:{target_id}')
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskCodeDoc:{target_id}')
        assert f'id=TaskCodeDoc%3A{target_id}' in page.url or f'id=TaskCodeDoc:{target_id}' in page.url
        # B carga con su propio /node (no retenido: patron de A)
        expect(page.locator('.workspace-code-pane')).to_contain_text('no tiene archivos de código')
        # ahora llega la respuesta ATRASADA de A
        held.release()
        page.wait_for_timeout(800)
        # nada de A en B: ni su codigo, ni sus aristas, ni su estado
        expect(page.locator('[data-testid="code-card"]')).to_have_count(0)
        assert 'src/app.py' not in page.locator('.workspace-main').inner_text()
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskCodeDoc:{target_id}')
        expect(page.locator('[data-testid="document-reader"]')).to_have_attribute('data-identity', f'TaskCodeDoc:{target_id}')
        page.get_by_role('button', name='Grafo Local', exact=True).click()
        centers = page.locator('.workspace-graph-node-card.is-center')
        expect(centers).to_have_count(1)
        expect(centers).to_contain_text(target_id)
        assert _reader_count(page) == 1
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_modeled_to_unmodeled_shows_loading_not_previous_data(reader_e2e_server):
    """A (modelado) -> documento sin modelo con /source retenido y /node de A atrasado."""
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=code")
        expect(page.locator('[data-testid="code-card"]').first).to_be_visible()
        # A cargado. Se retiene la lectura del documento sin modelo y se navega a el.
        held_src = HeldResponses(page, '**/api/workspace/source?path=docs*')
        page.evaluate("""() => { window.history.pushState(null, '', '/workspace/node?path=docs/guia.md&tab=code'); window.dispatchEvent(new PopStateEvent('popstate')); }""")
        expect(page.locator('[data-testid="panel-loading"][data-panel="code"]')).to_be_visible()
        # en carga: ninguno de los datos de A, ni valores de ausencia fabricados
        assert page.locator('[data-testid="code-card"]').count() == 0
        side = _sidebar(page).inner_text()
        assert source_id not in side and 'src/app.py' not in page.locator('.workspace-main').inner_text()
        assert 'Sin estado' not in side and 'Sin nodo' not in side
        expect(_sidebar(page).locator('[data-testid="panel-loading"]').first).to_be_visible()
        assert len(held_src.requested) == 1
        _screenshot(page, "correccion-carga-sin-datos-del-anterior.png")
        held_src.release()
        expect(page.locator('[data-testid="no-code"]')).to_contain_text('Sin grafo ni referencias')
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Guia del lector')
        assert source_id not in _sidebar(page).inner_text()
        page.get_by_role('button', name='Grafo Local', exact=True).click()
        expect(page.locator('[data-testid="no-graph"]')).to_be_visible()
        assert page.locator('[data-testid="edge-item"]').count() == 0
        assert _reader_count(page) == 1
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_late_node_response_does_not_repopulate_unmodeled_document(reader_e2e_server):
    """A (modelado, /node retenido) -> sin modelo: la respuesta vieja de A no repuebla nada."""
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        held = HeldResponses(page, f'**/api/workspace/node?id=TaskCodeDoc%3A{source_id}*')
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=code")
        expect(page.locator('.workspace-code-pane')).to_contain_text('Cargando código')
        page.evaluate("""() => { window.history.pushState(null, '', '/workspace/node?path=docs/otro.md&tab=code'); window.dispatchEvent(new PopStateEvent('popstate')); }""")
        expect(page.locator('[data-testid="no-code"]')).to_be_visible()
        held.release()
        page.wait_for_timeout(800)
        expect(page.locator('[data-testid="no-code"]')).to_be_visible()
        assert page.locator('[data-testid="code-card"]').count() == 0
        assert source_id not in page.locator('.workspace-sidebar').inner_text()
        page.get_by_role('button', name='Grafo Local', exact=True).click()
        expect(page.locator('[data-testid="no-graph"]')).to_be_visible()
        assert page.locator('[data-testid="edge-item"]').count() == 0
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_warns_when_node_and_source_revisions_differ(reader_e2e_server, tmp_path):
    url, source_id, target_id = reader_e2e_server
    root = Path(os.environ['DESKOPS_ROOT'])
    doc = root / 'desk' / 'tasks' / f'{source_id}.md'
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        def edit_before_node(route):
            # el archivo cambia entre la lectura de /source y la de /node (misma generacion)
            doc.write_text(doc.read_text(encoding='utf-8') + '\nlinea añadida entre lecturas\n', encoding='utf-8')
            route.continue_()
        page.route(f'**/api/workspace/node?id=TaskCodeDoc%3A{source_id}*', edit_before_node)
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=document")
        warning = page.locator('[data-testid="revision-mismatch"]').first
        expect(warning).to_be_visible()
        _screenshot(page, "correccion-aviso-revisiones.png")
        revision = page.locator('[data-testid="document-reader"]').get_attribute('data-revision')
        # no se unifican: /source conserva su revision y sigue siendo el sha256 de lo que devolvio
        text = '\n'.join(page.locator('[data-testid="doc-source"] .workspace-code-line-text').all_text_contents())
        assert revision != hashlib.sha256(doc.read_bytes()).hexdigest()
        assert 'linea añadida entre lecturas' not in text
        browser.close()


def test_reader_unprepared_store_shows_rejection_in_graph_and_relations(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    root = Path(os.environ['DESKOPS_ROOT'])
    from sldb.store.layout import edges_shards_dir
    shard = edges_shards_dir(root / '.sldb', 'TaskCodeDoc') / f'{target_id}.yaml'
    assert shard.is_file()
    shard.unlink()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=graph")
        expect(page.locator('[data-testid="store-no-preparado"]')).to_contain_text(f'TaskCodeDoc:{target_id}')
        expect(page.locator('[data-testid="store-no-preparado-rel"]')).to_contain_text('Store no preparado')
        assert page.locator('[data-testid="edge-item"]').count() == 0
        _screenshot(page, "correccion-store-no-preparado.png")
        # la fuente del documento autorizado sigue legible
        page.get_by_role('button', name='Documento', exact=True).click()
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Objetivo del origen')
        assert not shard.exists(), 'el GET reconstruyo el shard'
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_edge_focus_marks_only_fields_of_the_open_document(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        # B (destino): la arista A->B la declara A. B tiene un campo depends_on propio: no se resalta.
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{target_id}&tab=graph")
        edge = page.locator('[data-testid="edge-item"]', has_text=source_id).first
        expect(edge).to_be_visible()
        edge.click()
        expect(page.locator('[data-testid="focus-desc"]')).to_contain_text('arista')
        assert 'Documento: 0' in page.locator('[data-testid="focus-corr"]').inner_text()
        assert edge.get_attribute('data-fields') == ''
        page.get_by_role('button', name='Documento', exact=True).click()
        expect(page.locator('.workspace-payload-field.is-focused')).to_have_count(0)
        # la entrante muestra la declaracion de su dueño, no la presenta como campo propio
        expect(page.locator('[data-testid="rel-prov-in"]')).to_contain_text(f'{source_id}.depends_on')
        # A (origen): la misma arista si resalta sus dos campos
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{source_id}&tab=graph")
        page.locator('[data-testid="edge-item"]', has_text=target_id).first.click()
        page.get_by_role('button', name='Documento', exact=True).click()
        expect(page.locator('.workspace-payload-field.is-focused')).to_have_count(2)
        _screenshot(page, "correccion-foco-con-dueno.png")
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_reader_missing_anchor_is_broken_not_navigable(reader_e2e_server):
    url, source_id, target_id = reader_e2e_server
    root = Path(os.environ['DESKOPS_ROOT'])
    (root / 'docs' / 'anclas.md').write_text(
        '# Anclas\n\n## Aqui\n\nValida [[otro.md#Segunda parte]], inexistente [[otro.md#Nada]], propia [[#Aqui]], propia falta [[#Falta]].\n',
        encoding='utf-8')
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?path=docs/anclas.md")
        render = page.locator('[data-testid="doc-render"]')
        expect(render.locator('a[data-status="ok"]')).to_have_count(2)
        broken = render.locator('[data-status="roto"]')
        expect(broken).to_have_count(2)
        assert render.locator('a', has_text='Nada').count() == 0 and render.locator('a', has_text='Falta').count() == 0
        # se informa antes de navegar: la URL no cambio
        assert 'anclas.md' in page.url
        expect(page.locator('[data-testid="link-item"][data-status="roto"]')).to_have_count(2)
        _screenshot(page, "correccion-ancla-inexistente.png")
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


# ---------------------------------------------------------------- WS13.2: explorador

BAD_MODEL_SRC = '''from __future__ import annotations
from pydantic import Field
from sldb.models.structured_doc import StructuredNLDoc


class Bitacora(StructuredNLDoc):
    __semantics__ = {"type": ["log"], "layer": ["notes"]}
    __template__ = """---
id: ⸢rev•id⸥
---

# ⸢rev•title⸥

## Entrada

⸢rev•entry⸥
""".strip()

    id: str = Field(description="Id.")
    title: str = Field(description="Titulo.")
    entry: str = Field(description="Entrada.")
'''
PREPARE_BAD = '''
import sys
from pathlib import Path
from sldb.api.model_registry.add_model import add_model
from sldb.api.documents.create_document import create_document
root, models = Path(sys.argv[1]), sys.argv[2]
add_model(root / '.sldb', 'ws132_bitacora:Bitacora', pythonpath=models)
create_document(root / '.sldb', 'Bitacora', 'bitacoras/b1.md',
                {'id': 'b1', 'title': 'Bitacora uno', 'entry': 'Texto de la entrada.'}, pythonpath=models)
'''


def _explorer_repo(tmp_path, name):
    root = tmp_path / name
    root.mkdir()
    subprocess.run(['git', 'init', str(root)], check=True, capture_output=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.name', 'test'], check=True)
    subprocess.run(['git', '-C', str(root), 'config', 'user.email', 'test@example.com'], check=True)
    (root / '.gitignore').write_text('desk/privado/\n', encoding='utf-8')
    assert SLDBBootstrap().init_local_store(root) == 0
    scaffold_desk(root)
    write_lifecycle_graph(root)
    return root


@pytest.fixture
def explorer_e2e_server(tmp_path, monkeypatch):
    root = _explorer_repo(tmp_path, 'explorer-e2e')
    ops = DeskopsOperations(root)
    task = ops.create_task_bundle({
        'title': 'Tarea sana', 'goal': 'Objetivo sano', 'scope': 'Scope temporal',
        'validation': ['pytest'], 'done_when': 'Completada',
    })
    models = tmp_path / 'modelos'
    models.mkdir()
    (models / 'ws132_bitacora.py').write_text(BAD_MODEL_SRC, encoding='utf-8')
    res = subprocess.run([sys.executable, '-c', PREPARE_BAD, str(root), str(models)], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    (root / 'docs').mkdir()
    (root / 'docs' / 'faq.md').write_text('# FAQ\n\n## Pregunta\n\nRespuesta visible.\n', encoding='utf-8')
    (root / 'desk' / 'notas' / 'sub').mkdir(parents=True)
    (root / 'desk' / 'notas' / 'uno.md').write_text('# Uno\n\nTexto uno.\n', encoding='utf-8')
    (root / 'desk' / 'notas' / 'sub' / 'dos.md').write_text('# Dos\n', encoding='utf-8')
    (root / 'desk' / 'privado').mkdir()
    (root / 'desk' / 'privado' / 'secreto.md').write_text('# secreto\n', encoding='utf-8')

    monkeypatch.setenv('DESKOPS_ROOT', str(root))
    monkeypatch.delenv('WORKSPACE_EXPLORER_ROOTS', raising=False)
    server = make_server(0, root / '.sldb')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}", root, task.task_id
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def test_explorer_opens_modeled_and_unmodeled_without_ids_and_refreshes(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        requests = []
        page.on("request", lambda r: requests.append((r.method, r.url)))

        page.goto(f"{url}/workspace/node")
        explorer = page.locator('[data-testid="explorer"]')
        expect(explorer).to_be_visible()
        refresh = page.locator('[data-testid="explorer-refresh"]')
        expect(refresh).to_be_visible()
        expect(refresh).to_have_text('Refrescar catálogo')
        expect(page.locator('[data-testid="explorer-modeled-item"]').first).to_be_visible()

        # modelados por modelo; el que no carga lleva su estado y causa, el sano no
        expect(page.locator('[data-testid="explorer-model"][data-model="TaskCodeDoc"]')).to_be_visible()
        bad = page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]')
        expect(bad).to_have_attribute('data-estado', 'modelo_no_carga')
        expect(bad.locator('[data-testid="explorer-estado"]')).to_have_text('modelo_no_carga')
        assert 'ws132_bitacora' in bad.get_attribute('title')
        good = page.locator(f'[data-testid="explorer-modeled-item"][data-id="TaskCodeDoc:{task_id}"]')
        expect(good).to_have_attribute('data-estado', 'ok')
        _screenshot(page, "explorer-inicial.png")

        # abrir un no modelado sin conocer ID: arbol por carpetas
        expect(page.locator('[data-testid="explorer-folder"][data-path="docs"]')).to_be_visible()
        page.locator('[data-testid="explorer-unmodeled"][data-path="docs/faq.md"]').click()
        expect(page.locator('[data-testid="ctx-path"]')).to_have_text('docs/faq.md')
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Respuesta visible')
        assert 'path=docs%2Ffaq.md' in page.url or 'path=docs/faq.md' in page.url
        # carpetas anidadas colapsadas hasta abrirlas
        assert page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/uno.md"]').count() == 0
        page.locator('[data-testid="explorer-folder"][data-path="desk/notas"] > button').click()
        expect(page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/uno.md"]')).to_be_visible()
        assert page.locator('[data-path="desk/privado/secreto.md"]').count() == 0
        page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/uno.md"]').click()
        expect(page.locator('[data-testid="ctx-path"]')).to_have_text('desk/notas/uno.md')

        # abrir un modelado sano
        good.click()
        expect(page.locator('[data-testid="document-reader"]')).to_have_attribute('data-identity', f'TaskCodeDoc:{task_id}')
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Objetivo sano')

        # abrir el modelado cuyo modelo no importa: fuente legible y causa visible
        bad.click()
        expect(page.locator('[data-testid="document-reader"]')).to_have_attribute('data-identity', 'Bitacora:b1')
        expect(page.locator('.workspace-degraded-banner').first).to_contain_text('ws132_bitacora')
        expect(page.locator('[data-testid="doc-source"]')).to_contain_text('Texto de la entrada.')
        _screenshot(page, "explorer-modelo-no-carga.png")

        # filtro local
        page.locator('[data-testid="explorer-filter"]').fill('faq')
        expect(page.locator('[data-testid="explorer-unmodeled"]')).to_have_count(1)
        expect(page.locator('[data-testid="explorer-modeled-item"]')).to_have_count(0)
        page.locator('[data-testid="explorer-filter"]').fill('')

        # alta de un modelado y de un .md fuera del request, sin reiniciar: aparecen tras refrescar
        new_task = DeskopsOperations(root).create_task_bundle({
            'title': 'Tarea nueva', 'goal': 'Objetivo nuevo', 'scope': 'Scope temporal',
            'validation': ['pytest'], 'done_when': 'Completada',
        })
        (root / 'docs' / 'nuevo.md').write_text('# Nuevo\n\nContenido nuevo.\n', encoding='utf-8')
        assert page.locator(f'[data-id="TaskCodeDoc:{new_task.task_id}"]').count() == 0
        assert page.locator('[data-path="docs/nuevo.md"]').count() == 0
        before = len(requests)
        refresh.click()
        expect(page.locator(f'[data-id="TaskCodeDoc:{new_task.task_id}"]')).to_be_visible()
        expect(page.locator('[data-path="docs/nuevo.md"]')).to_be_visible()
        refreshed = [u for m, u in requests[before:]]
        assert any(u.endswith('/api/workspace/nodes') for u in refreshed), refreshed
        assert any(u.endswith('/api/workspace/explorer') for u in refreshed), refreshed
        _screenshot(page, "explorer-tras-refrescar.png")
        page.locator('[data-path="docs/nuevo.md"]').click()
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Contenido nuevo')

        # ninguna peticion de escritura, y el listado no recibe ruta del cliente
        assert all(m == 'GET' for m, u in requests if '/api/' in u), [r for r in requests if r[0] != 'GET']
        for m, u in requests:
            if u.split('?')[0].endswith('/api/workspace/explorer'):
                assert '?' not in u, u
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_explorer_relations_notice_is_visible_in_graph_and_context_not_explorer(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?id=TaskCodeDoc:{task_id}&tab=graph")
        graph_notice = page.locator('[data-testid="relations-notice"][data-where="graph"]')
        expect(graph_notice).to_be_visible()
        expect(graph_notice).to_contain_text('índice')
        expect(graph_notice).to_contain_text('no certifican cambios externos')
        expect(graph_notice).to_contain_text('fuera de la UI')
        expect(graph_notice).to_contain_text('rebuild_edges')
        context_notice = page.locator('.workspace-sidebar [data-testid="relations-notice"][data-where="context"]')
        expect(context_notice).to_be_visible()
        # ni en el explorador ni como afirmacion de frescura
        assert page.locator('[data-testid="explorer"] [data-testid="relations-notice"]').count() == 0
        body = page.locator('.workspace-view').inner_text().lower()
        assert 'al día' not in body and 'actualizadas' not in body
        _screenshot(page, "explorer-aviso-relaciones-grafo.png")
        # un no modelado no tiene relaciones: no hay aviso que mostrar
        page.goto(f"{url}/workspace/node?path=docs/faq.md&tab=graph")
        expect(page.locator('[data-testid="no-graph"]')).to_be_visible()
        assert page.locator('[data-testid="relations-notice"]').count() == 0
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_explorer_shows_truncation_and_invalid_roots(tmp_path, monkeypatch):
    root = _explorer_repo(tmp_path, 'explorer-trunc')
    (root / 'docs').mkdir()
    for i in range(5001):
        d = root / 'docs' / f'd{i // 500}'
        d.mkdir(exist_ok=True)
        (d / f'f{i:05d}.md').write_text('#\n', encoding='utf-8')
    (root / 'enlace').symlink_to(root / 'docs', target_is_directory=True)
    monkeypatch.setenv('DESKOPS_ROOT', str(root))
    monkeypatch.setenv('WORKSPACE_EXPLORER_ROOTS', 'docs,/etc,../fuera,enlace,ausente')
    server = make_server(0, root / '.sldb')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(f"http://127.0.0.1:{server.server_port}/workspace/node")
            expect(page.locator('[data-testid="explorer-truncado"]')).to_contain_text('5000')
            invalid = page.locator('[data-testid="explorer-roots-invalid"]')
            expect(invalid).to_contain_text('/etc (ruta absoluta)')
            expect(invalid).to_contain_text('../fuera (contiene ..)')
            expect(invalid).to_contain_text('enlace (es un enlace simbólico)')
            assert 'ausente' not in invalid.inner_text()
            _screenshot(page, "explorer-truncado-y-rutas-invalidas.png")
            assert not errors, f"Errores de JS: {errors}"
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


OTHER_PROCESS = '''
import sys
from pathlib import Path
root, action, arg = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
if action == 'create':
    from deskops.operations import DeskopsOperations
    print(DeskopsOperations(root).create_task_bundle(dict(
        title=arg, goal='Meta', scope='S', implementation_path='P', validation=['pytest'], done_when='ok')).task_id)
elif action == 'untrack':
    from sldb.api import untrack_document
    untrack_document(root / '.sldb', arg)
'''


def _other_process(root, action, arg):
    res = subprocess.run([sys.executable, '-c', OTHER_PROCESS, str(root), action, arg], capture_output=True, text=True)
    assert res.returncode == 0, res.stderr
    return res.stdout.strip().splitlines()[-1] if res.stdout.strip() else ''


def test_explorer_refresh_shows_changes_made_by_another_process(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node")
        expect(page.locator('[data-testid="explorer-modeled-item"]').first).to_be_visible()
        new_id = _other_process(root, 'create', 'Alta de otro proceso')
        modeled = page.locator(f'[data-testid="explorer-modeled-item"][data-id="TaskCodeDoc:{new_id}"]')
        assert modeled.count() == 0
        page.locator('[data-testid="explorer-refresh"]').click()
        expect(modeled).to_be_visible()
        assert page.locator(f'[data-testid="explorer-unmodeled"][data-path="desk/tasks/{new_id}.md"]').count() == 0
        _screenshot(page, "explorer-alta-otro-proceso.png")
        # destrackeo (el archivo queda): sale de Modelados y pasa a la carpeta de no modelados
        _other_process(root, 'untrack', new_id)
        page.locator('[data-testid="explorer-refresh"]').click()
        expect(modeled).to_have_count(0)
        page.locator('[data-testid="explorer-folder"][data-path="desk/tasks"] > button').click()
        expect(page.locator(f'[data-testid="explorer-unmodeled"][data-path="desk/tasks/{new_id}.md"]')).to_be_visible()
        # borrado del archivo: desaparece de ambos
        (root / 'desk' / 'tasks' / f'{new_id}.md').unlink()
        page.locator('[data-testid="explorer-refresh"]').click()
        expect(page.locator(f'[data-path="desk/tasks/{new_id}.md"]')).to_have_count(0)
        expect(modeled).to_have_count(0)
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


# ---------------------------------------------------------------- WS13.2 correccion: identidad visible y estado de carga

def test_explorer_equal_titles_show_distinct_visible_paths_and_open_their_origin(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    ops = DeskopsOperations(root)
    # Dos documentos modelados REALES con el mismo titulo y modelos, ids y rutas distintos
    task = ops.create_task_bundle({
        'title': 'ActionsSection', 'goal': 'Objetivo de la tarea', 'scope': 'Scope temporal',
        'validation': ['pytest'], 'done_when': 'Completada',
    })
    atom = ops.create_artifact('artifact.atom', {
        'title': 'ActionsSection', 'five_wh_one_plus': 'what', 'answer': 'Respuesta del atom.',
    })
    expected = {
        f'TaskCodeDoc:{task.task_id}': task.task_path.relative_to(root).as_posix(),
        'AtomDoc:' + atom.doc_id: atom.path.relative_to(root).as_posix(),
    }
    assert len(set(expected.values())) == 2
    for d in ('desk/notas/alfa', 'desk/notas/beta'):
        (root / d).mkdir(parents=True, exist_ok=True)
        (root / d / 'LEEME.md').write_text(f'# LEEME\n\nContenido de {d}.\n', encoding='utf-8')
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?path=docs/faq.md")
        # modelados con el mismo titulo: cada uno muestra, visible en el DOM, su ruta relativa
        entries = page.locator('[data-testid="explorer-modeled-item"]', has_text='ActionsSection')
        expect(entries).to_have_count(2)
        for ident, rel in expected.items():
            item = page.locator(f'[data-testid="explorer-modeled-item"][data-id="{ident}"]')
            expect(item.locator('.workspace-explorer-item-title')).to_contain_text('ActionsSection')
            path_el = item.locator('[data-testid="explorer-item-path"]')
            expect(path_el).to_be_visible()
            expect(path_el).to_have_text(rel)
        _screenshot(page, "correccion-titulos-repetidos.png")
        # abrir cada uno lleva a su origen (en ambos ordenes)
        for ident in list(expected) + list(reversed(list(expected))):
            page.locator(f'[data-testid="explorer-modeled-item"][data-id="{ident}"]').click()
            expect(page.locator('[data-testid="document-reader"]')).to_have_attribute('data-identity', ident)
            expect(page.locator('[data-testid="ctx-path"]')).to_have_text(expected[ident])
            expect(page.locator('[data-testid="doc-render"]')).to_contain_text(
                'Objetivo de la tarea' if ident.startswith('TaskCodeDoc') else 'Respuesta del atom')
        # no modelados con el mismo nombre: la ruta completa es visible aunque el nombre coincida con el titulo
        page.locator('[data-testid="explorer-folder"][data-path="desk/notas"] > button').click()
        for d in ('alfa', 'beta'):
            page.locator(f'[data-testid="explorer-folder"][data-path="desk/notas/{d}"] > button').click()
            item = page.locator(f'[data-testid="explorer-unmodeled"][data-path="desk/notas/{d}/LEEME.md"]')
            expect(item.locator('[data-testid="explorer-item-path"]')).to_have_text(f'desk/notas/{d}/LEEME.md')
        page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/beta/LEEME.md"]').click()
        expect(page.locator('[data-testid="ctx-path"]')).to_have_text('desk/notas/beta/LEEME.md')
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Contenido de desk/notas/beta')
        page.locator('[data-testid="explorer-unmodeled"][data-path="desk/notas/alfa/LEEME.md"]').click()
        expect(page.locator('[data-testid="ctx-path"]')).to_have_text('desk/notas/alfa/LEEME.md')
        expect(page.locator('[data-testid="doc-render"]')).to_contain_text('Contenido de desk/notas/alfa')
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_explorer_does_not_claim_model_loaded_while_nodes_is_held_then_updates(explorer_e2e_server):
    """GET /nodes real retenido con page.route; el modelo Bitacora de verdad no es importable."""
    url, root, task_id = explorer_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        held = []
        page.route('**/api/workspace/nodes', lambda route: held.append(route))   # no se contesta: pendiente
        page.goto(f"{url}/workspace/node?path=docs/faq.md")
        bad = page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]')
        good = page.locator(f'[data-testid="explorer-modeled-item"][data-id="TaskCodeDoc:{task_id}"]')
        expect(bad).to_be_visible()
        assert len(held) == 1
        for item in (bad, good):
            expect(item).to_have_attribute('data-estado', 'modelo_sin_confirmar')
            expect(item.locator('[data-testid="explorer-estado"]')).to_have_text('modelo sin confirmar')
        assert page.locator('[data-estado="ok"]').count() == 0 and page.locator('[data-estado="modelo_no_carga"]').count() == 0
        # la insignia se lee completa: ni la insignia ni el boton que la contiene se recortan
        for item in (bad, good):
            badge = item.locator('[data-testid="explorer-estado"]')
            overflow = badge.evaluate('(b) => { const i = b.closest("button"); return [b.scrollWidth - b.clientWidth, i.scrollWidth - i.clientWidth]; }')
            assert overflow[0] <= 0 and overflow[1] <= 0, overflow
            box, ibox = badge.bounding_box(), item.bounding_box()
            assert box['x'] + box['width'] <= ibox['x'] + ibox['width'] + 0.5, (box, ibox)
        _screenshot(page, "correccion-modelo-sin-confirmar-pendiente.png")
        # llega la respuesta real: se actualizan titulo y diagnostico
        held.pop().continue_()
        expect(bad).to_have_attribute('data-estado', 'modelo_no_carga')
        expect(bad.locator('[data-testid="explorer-estado"]')).to_have_text('modelo_no_carga')
        assert 'ws132_bitacora' in bad.get_attribute('title')
        expect(good).to_have_attribute('data-estado', 'ok')
        expect(good.locator('.workspace-explorer-item-title')).to_have_text('Tarea sana')
        expect(page.locator('[data-testid="explorer-estado"]', has_text='modelo sin confirmar')).to_have_count(0)
        _screenshot(page, "correccion-modelo-sin-confirmar-resuelto.png")
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_explorer_keeps_unconfirmed_state_and_catalog_error_when_nodes_fails(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.route('**/api/workspace/nodes', lambda route: route.abort())   # fallo de red real de /nodes
        page.goto(f"{url}/workspace/node?path=docs/faq.md")
        alert = page.get_by_role('alert').filter(has_text='Error de catálogo')
        expect(alert).to_be_visible()
        bad = page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]')
        good = page.locator(f'[data-testid="explorer-modeled-item"][data-id="TaskCodeDoc:{task_id}"]')
        for item in (bad, good):
            expect(item).to_have_attribute('data-estado', 'modelo_sin_confirmar')
            expect(item.locator('[data-testid="explorer-estado"]')).to_have_text('modelo sin confirmar')
        expect(page.locator('[data-testid="explorer-error"]')).to_have_count(0)   # /explorer si llego
        # el error de /nodes no se borra por haber llegado /explorer ni por refrescar solo el explorador
        expect(alert).to_be_visible()
        _screenshot(page, "correccion-modelo-sin-confirmar-nodes-fallo.png")
        # recuperacion: se quita el fallo, se refresca, llega /nodes real
        page.unroute('**/api/workspace/nodes')
        page.locator('[data-testid="explorer-refresh"]').click()
        expect(bad).to_have_attribute('data-estado', 'modelo_no_carga')
        expect(good).to_have_attribute('data-estado', 'ok')
        expect(page.get_by_role('alert').filter(has_text='Error de catálogo')).to_have_count(0)
        assert not errors, f"Errores de JS: {errors}"
        browser.close()


def test_explorer_long_paths_differing_only_at_the_end_are_fully_readable_and_open_their_origin(explorer_e2e_server):
    url, root, task_id = explorer_e2e_server
    folder = 'desk/carpeta-muy-larga-numero-1/subcarpeta-con-un-nombre-igualmente-largo-numero-2'
    stem = 'documento-con-un-nombre-extremadamente-largo-que-no-cabe-en-la-columna'
    rels = {f'{folder}/{stem}-{tail}.md': tail for tail in ('alfa', 'beta')}
    (root / folder).mkdir(parents=True)
    for rel, tail in rels.items():
        (root / rel).write_text(f'# Largo\n\nContenido final {tail}.\n', encoding='utf-8')
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?path=docs/faq.md")
        for part in ('desk/carpeta-muy-larga-numero-1', folder):
            page.locator(f'[data-testid="explorer-folder"][data-path="{part}"] > button').click()
        aside = page.locator('[data-testid="explorer"]')
        abox = aside.bounding_box()
        for rel, tail in rels.items():
            item = page.locator(f'[data-testid="explorer-unmodeled"][data-path="{rel}"]')
            path_el = item.locator('[data-testid="explorer-item-path"]')
            path_el.scroll_into_view_if_needed()
            expect(path_el).to_be_visible()
            # la ruta completa esta en el texto visible (sin tooltip) y no hay desbordamiento horizontal
            assert path_el.inner_text() == rel
            over = path_el.evaluate('(e) => { const b = e.closest("button"); return [e.scrollWidth - e.clientWidth, b.scrollWidth - b.clientWidth]; }')
            assert over[0] <= 0 and over[1] <= 0, over
            # y el ultimo tramo (lo unico que distingue las rutas) cae dentro del explorador, sin recortar
            rects = path_el.evaluate('''(e) => { const r = document.createRange(); r.selectNodeContents(e);
                return Array.from(r.getClientRects()).map(x => [x.left, x.right]); }''')
            assert rects and all(l >= abox['x'] - 0.5 and r_ <= abox['x'] + abox['width'] + 0.5 for l, r_ in rects), (rects, abox)
        _screenshot(page, "correccion-rutas-largas.png")
        for rel, tail in rels.items():
            page.locator(f'[data-testid="explorer-unmodeled"][data-path="{rel}"]').click()
            expect(page.locator('[data-testid="ctx-path"]')).to_have_text(rel)
            expect(page.locator('[data-testid="doc-render"]')).to_contain_text(f'Contenido final {tail}')
        assert not errors, f"Errores de JS: {errors}"
        browser.close()
