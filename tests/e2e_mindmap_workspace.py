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
from deskops.lifecycle import ensure_lifecycle_graph
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
    ensure_lifecycle_graph(root)
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

        # 1. Navegación directa con deep link al source
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&depth=1&tab=document")

        # Verificar encabezado y vista activa
        expect(page.locator(".workspace-header-title h1")).to_contain_text(source_id)
        expect(page.locator(".workspace-tab-btn.active")).to_have_text("Documento")
        expect(page.locator(".workspace-doc-header h2")).to_have_text("Tarea Origen")
        expect(page.locator(".workspace-doc-meta")).to_contain_text("TaskDoc")

        # Proyección documental (IR / campos)
        expect(page.locator(".workspace-doc-content").first).to_be_visible()
        expect(page.locator(".workspace-payload-field").first).to_be_visible()
        expect(page.get_by_role("heading", name="Estructura Documental (IR)")).to_be_visible()
        expect(page.locator(".workspace-ir-title", has_text="Goal").first).to_be_visible()
        expect(page.locator(".workspace-ir-title", has_text="Scope").first).to_be_visible()

        # Sidebar identidad, status y hashes separados
        expect(page.locator(".workspace-sidebar")).to_contain_text(source_id)
        expect(page.locator(".workspace-sidebar")).to_contain_text("TaskDoc")
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
        expect(page).to_have_url(re.compile(rf"id=TaskDoc(%3A|:){re.escape(target_id)}"))

        # 5. Probar el botón ATRÁS del navegador (B10)
        page.go_back()
        expect(page.locator(".workspace-header-title h1")).to_contain_text(source_id)
        expect(page).to_have_url(re.compile(rf"id=TaskDoc(%3A|:){re.escape(source_id)}"))

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
    ensure_lifecycle_graph(root)
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

        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=document")
        reader = page.locator('[data-testid="document-reader"]')
        expect(reader).to_be_visible()
        revision = reader.get_attribute('data-revision')
        start_url = page.url
        id_param = re.compile(rf"id=TaskDoc(%3A|:){re.escape(source_id)}")
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
        expect(page.locator(".workspace-header-title h1")).to_have_text(f"TaskDoc:{source_id}")
        assert 'path=' in page.url and 'id=' not in page.url
        expect(page.locator('.workspace-identity-prop').filter(has_text='Path')).to_contain_text(f"desk/tasks/{source_id}.md")
        # una referencia de Code a un .md se abre como documento no modelado
        page.get_by_role('button', name='Código', exact=True).click()
        page.locator('[data-testid="code-card"][data-field="references"] [data-testid="code-open-doc"]').click()
        expect(page.locator('.workspace-doc-header h2')).to_have_text('Guia del lector')
        assert 'path=docs' in page.url and _reader_count(page) == 1
        # relacion del documento modelado: navegar a otro documento no es foco
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}")
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
        held = HeldResponses(page, f'**/api/workspace/node?id=TaskDoc%3A{source_id}*')
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=code")
        # /source de A llega; /node de A queda retenido: el panel Code muestra carga, no ausencia
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskDoc:{source_id}')
        expect(page.locator('.workspace-code-pane')).to_contain_text('Cargando código')
        expect(_sidebar(page).locator('.workspace-identity-prop').filter(has_text='Estado')).to_contain_text('Cargando')
        expect(page.locator('[data-testid="code-card"]')).to_have_count(0)
        assert len(held.requested) == 1
        # navegar a B (otro documento) mientras la respuesta de A sigue en el aire
        page.get_by_label('Seleccionar nodo activo').select_option(f'TaskDoc:{target_id}')
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskDoc:{target_id}')
        assert f'id=TaskDoc%3A{target_id}' in page.url or f'id=TaskDoc:{target_id}' in page.url
        # B carga con su propio /node (no retenido: patron de A)
        expect(page.locator('.workspace-code-pane')).to_contain_text('no tiene archivos de código')
        # ahora llega la respuesta ATRASADA de A
        held.release()
        page.wait_for_timeout(800)
        # nada de A en B: ni su codigo, ni sus aristas, ni su estado
        expect(page.locator('[data-testid="code-card"]')).to_have_count(0)
        assert 'src/app.py' not in page.locator('.workspace-main').inner_text()
        expect(page.locator('.workspace-header-title h1')).to_have_text(f'TaskDoc:{target_id}')
        expect(page.locator('[data-testid="document-reader"]')).to_have_attribute('data-identity', f'TaskDoc:{target_id}')
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
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=code")
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
        held = HeldResponses(page, f'**/api/workspace/node?id=TaskDoc%3A{source_id}*')
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=code")
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
        page.route(f'**/api/workspace/node?id=TaskDoc%3A{source_id}*', edit_before_node)
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=document")
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
    shard = root / '.sldb' / 'runtime' / 'edges' / 'TaskDoc' / f'{target_id}.yaml'
    assert shard.is_file()
    shard.unlink()
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=graph")
        expect(page.locator('[data-testid="store-no-preparado"]')).to_contain_text(f'TaskDoc:{target_id}')
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
        page.goto(f"{url}/workspace/node?id=TaskDoc:{target_id}&tab=graph")
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
        page.goto(f"{url}/workspace/node?id=TaskDoc:{source_id}&tab=graph")
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
