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
