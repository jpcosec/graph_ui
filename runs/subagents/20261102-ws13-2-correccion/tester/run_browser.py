import json, shutil, subprocess, sys, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from common import *
CAP = HERE / 'capturas'; CAP.mkdir(exist_ok=True)
OUT = {}
LONG = 'desk/' + '/'.join(['carpeta-muy-larga-numero-%d' % i for i in range(1, 4)]) + '/documento-con-un-nombre-extremadamente-largo-para-probar-el-recorte-visual-del-explorador.md'

def build(name):
    w = fresh(name); root = w / 'repo'; root.mkdir(); T.git_init(root); (root / '.gitignore').write_text('desk/privado/\n')
    ops = T.prepare_store(root)
    t1 = ops.create_task_bundle(dict(title='ActionsSection', goal='Meta uno', scope='S', implementation_path='P', validation=['pytest'], done_when='ok')).task_id
    T.add_bad_model(root, w)
    code = ("import sys\nfrom pathlib import Path\nfrom sldb.api.documents.create_document import create_document\n"
            "root, models = Path(sys.argv[1]), sys.argv[2]\ncreate_document(root/'.sldb','Bitacora','bitacoras/ActionsSection.md',"
            "{'id':'ActionsSection','title':'ActionsSection','entry':'Meta DOS distinta'}, pythonpath=models)\n")
    r = subprocess.run([sys.executable, '-c', code, str(root), str(w / 'modelos')], capture_output=True, text=True); assert r.returncode == 0, r.stderr
    t2 = 'Bitacora:ActionsSection'
    T.write(root, 'desk/notas/Repetido.md', '# Repetido A\n\nCONTENIDO-A-notas\n'); T.write(root, 'docs/Repetido.md', '# Repetido B\n\nCONTENIDO-B-docs\n')
    T.write(root, 'docs/faq.md', '# FAQ\n\nfaq\n'); T.write(root, LONG, '# Largo\n\nCONTENIDO-LARGO\n')
    T.commit_all(root)
    return w, root, t1, t2

def clipped(page):
    return page.evaluate("""() => {
      const panel = document.querySelector('[data-testid="explorer-modeled"]')?.closest('aside,section,div.workspace-explorer') ;
      const box = (document.querySelector('.workspace-explorer')||panel).getBoundingClientRect();
      const out = [];
      for (const el of document.querySelectorAll('.workspace-explorer-item-title, .workspace-explorer-item-path, [data-testid="explorer-estado"]')) {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        const btn = el.closest('button'); const br = btn.getBoundingClientRect(); const bcs = getComputedStyle(btn);
        out.push({t: el.innerText.slice(0,160), scrollW: el.scrollWidth, clientW: el.clientWidth, right: Math.round(r.right), boxRight: Math.round(box.right),
                  btnRight: Math.round(br.right), ellipsis: cs.textOverflow, wsp: cs.whiteSpace, btnOverflow: bcs.overflow, btnEllipsis: bcs.textOverflow,
                  cut: (el.scrollWidth > el.clientWidth + 1) || r.right > box.right + 1 || r.right > br.right + 1});
      }
      return out; }""")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    # ============ Escenario 1+3: refresco entre procesos en navegador y titulos repetidos
    w, root, t1, t2 = build('br1')
    srv = Server(root, w / 'srv')
    try:
        ctx = browser.new_context(viewport={'width': 1400, 'height': 900}); page = ctx.new_page()
        errs = []; reqs = []
        page.on('pageerror', lambda e: errs.append(str(e))); page.on('request', lambda r: reqs.append((r.method, r.url.replace(srv.url, ''))))
        page.goto(f'{srv.url}/workspace/node?id=TaskDoc:{t1}')
        page.locator('[data-testid="explorer-modeled-item"]').first.wait_for()
        page.wait_for_selector('[data-testid="document-reader"]')
        s0 = snap(root); g0 = gitstate(root); n0 = len(srv.events())
        # --- punto 3
        items = page.locator('[data-testid="explorer-modeled-item"]', has_text='ActionsSection')
        texts = [items.nth(i).inner_text() for i in range(items.count())]
        titles = [{'text': t, 'title_attr': items.nth(i).get_attribute('title'), 'data-id': items.nth(i).get_attribute('data-id')} for i, t in enumerate(texts)]
        OUT['p3_modeled'] = {'items': titles}
        for i in range(items.count()):
            ident = items.nth(i).get_attribute('data-id'); items.nth(i).click()
            page.wait_for_function("id => document.querySelector('[data-testid=\"document-reader\"]')?.dataset.identity === id", arg=ident)
            body = page.locator('[data-testid="document-reader"]').inner_text()
            OUT['p3_modeled'][ident] = {'ctx-path': page.locator('[data-testid="ctx-path"]').inner_text(), 'goal_in_body': ('Meta DOS' in body, 'Meta uno' in body)}
        # no modelados: mismo nombre
        rep = page.locator('[data-testid="explorer-unmodeled"]', has_text='Repetido.md')
        OUT['p3_unmodeled'] = {'n': rep.count()}
        for p, marker in (('desk/notas/Repetido.md', 'CONTENIDO-A-notas'), ('docs/Repetido.md', 'CONTENIDO-B-docs')):
            btn = page.locator(f'[data-testid="explorer-unmodeled"][data-path="{p}"]')
            if btn.count() == 0:   # carpeta cerrada: abrir el filtro
                page.locator('[data-testid="explorer-filter"]').fill('Repetido')
                btn = page.locator(f'[data-testid="explorer-unmodeled"][data-path="{p}"]')
            OUT['p3_unmodeled'][p] = {'visible_text': btn.inner_text(), 'title_attr': btn.get_attribute('title')}
            btn.click(); page.wait_for_selector(f'[data-testid="ctx-path"]:text-is("{p}")')
            OUT['p3_unmodeled'][p]['opens_right'] = marker in page.locator('[data-testid="document-reader"]').inner_text()
        page.locator('[data-testid="explorer-filter"]').fill('')
        page.locator('[data-testid="explorer-filter"]').fill('Repetido'); page.wait_for_timeout(300)
        page.locator('.workspace-explorer').screenshot(path=str(CAP / 'p3-titulos-repetidos-no-modelados.png'))
        page.locator('[data-testid="explorer-filter"]').fill('ActionsSection'); page.wait_for_timeout(300)
        page.screenshot(path=str(CAP / 'p3-titulos-repetidos-modelados-pagina.png'))
        page.locator('.workspace-explorer').screenshot(path=str(CAP / 'p3-titulos-repetidos-modelados.png'))
        # ruta larga
        page.locator('[data-testid="explorer-filter"]').fill('documento-con')
        page.wait_for_timeout(300)
        page.locator('.workspace-explorer').screenshot(path=str(CAP / 'p3-ruta-larga.png'))
        OUT['long_path_clip'] = clipped(page)
        page.locator('[data-testid="explorer-filter"]').fill('')
        OUT['all_clip_candidates'] = [c for c in clipped(page) if c['cut']]
        # --- punto 1 en navegador: refresco entre procesos, cache caliente
        page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(500)
        def present(ident): return page.locator(f'[data-testid="explorer-modeled-item"][data-id="{ident}"]').count() > 0
        def unm(p):
            return page.locator(f'[data-testid="explorer-unmodeled"][data-path="{p}"]').count() > 0
        def refresh():
            page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(900)
        steps = {}
        pre = len(srv.events())
        nid = other_process(root, 'create', 'Alta navegador'); ident = f'TaskDoc:{nid}'; rel = f'desk/tasks/{nid}.md'
        steps['antes_de_refrescar_no_aparece'] = not present(ident)
        refresh(); steps['alta'] = present(ident)
        page.screenshot(path=str(CAP / 'p1-tras-alta-otro-proceso.png'))
        other_process(root, 'untrack', nid); refresh()
        page.locator('[data-testid="explorer-filter"]').fill(nid); page.wait_for_timeout(300)
        steps['untrack'] = (not present(ident), unm(rel)); 
        page.screenshot(path=str(CAP / 'p1-tras-untrack.png'))
        page.locator('[data-testid="explorer-filter"]').fill('')
        other_process(root, 'track', rel); refresh(); steps['track'] = (present(ident), not unm(rel))
        other_process(root, 'delete', nid); refresh(); steps['baja'] = (not present(ident), not unm(rel), not (root / rel).exists())
        OUT['p1_browser_steps'] = steps
        # ventana de refrescos puros: sin operaciones externas
        sP = snap(root); gP = gitstate(root); nP = len(srv.events())
        for _ in range(3): refresh()
        page.reload(); page.wait_for_selector('[data-testid="explorer-modeled-item"]'); page.wait_for_timeout(800)
        sQ = snap(root); gQ = gitstate(root)
        OUT['p1_browser_pure_refresh'] = {'writes': writes(srv.events()[nP:]), 'files_changed': sdiff(sP, sQ), 'git_equal': gP == gQ}
        # toda la sesion del navegador, sin las operaciones externas (que son del otro proceso, no del servidor)
        OUT['p1_browser_all_server_writes'] = writes(srv.events()[n0:])
        OUT['p1_browser_requests'] = {'non_get': [r for r in reqs if r[0] != 'GET'], 'workspace_reqs': sorted(set(u.split('?')[0] for m, u in reqs if '/api/' in u)), 'pageerrors': errs,
                                      'n_readers': page.locator('[data-testid="document-reader"]').count()}
        ctx.close()
    finally: srv.close()

    # ============ Escenario 4: estado de modelo
    def badge_report(page):
        return page.evaluate("""() => {
          const out = [];
          for (const el of document.querySelectorAll('[data-testid="explorer-estado"]')) {
            const r = el.getBoundingClientRect(); const btn = el.closest('button').getBoundingClientRect();
            out.push({text: el.innerText, scrollW: el.scrollWidth, clientW: el.clientWidth, rectRight: Math.round(r.right), btnRight: Math.round(btn.right), rectH: Math.round(r.height),
                      cut: el.scrollWidth > el.clientWidth + 1 || r.right > btn.right + 1});
          } return out; }""")
    def items_state(page):
        it = page.locator('[data-testid="explorer-modeled-item"]')
        return {it.nth(i).get_attribute('data-id'): it.nth(i).get_attribute('data-estado') for i in range(it.count())}
    w, root, t1, t2 = build('br4')
    srv = Server(root, w / 'srv')
    try:
        res = {}
        ctx = browser.new_context(viewport={'width': 1400, 'height': 900}); page = ctx.new_page()
        errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
        held = {'n': 0}
        def handler(route):
            held['n'] += 1
            if held['n'] == 1:
                held['route'] = route                     # pendiente: no se responde todavia
                held['resp'] = route.fetch()              # respuesta REAL del backend, retenida por el navegador
            else: route.continue_()
        page.route('**/api/workspace/nodes**', handler)
        page.goto(f'{srv.url}/workspace/node?path=docs/faq.md')
        page.locator('[data-testid="explorer-modeled-item"]').first.wait_for()
        page.wait_for_timeout(800)
        res['nodes_retenido'] = ('route' in held)
        st = items_state(page)
        res['retenida'] = {'n': len(st), 'estados': sorted(set(st.values())), 'alguno_ok': 'ok' in st.values(),
                           'bitacora': page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]').inner_text(),
                           'badges': badge_report(page),
                           'texto_explorador_con_carg': [t for t in page.locator('.workspace-explorer').inner_text().split('\n') if 'carg' in t.lower() or 'modelo' in t.lower()][:6],
                           'title_attr_task': page.locator(f'[data-testid="explorer-modeled-item"][data-id="TaskDoc:{t1}"]').get_attribute('title'),
                           'alerts': page.locator('[role="alert"]').all_inner_texts()}
        page.screenshot(path=str(CAP / 'p4-nodes-retenido-pagina.png')); page.locator('.workspace-explorer').screenshot(path=str(CAP / 'p4-nodes-retenido-explorador.png'))
        held['route'].fulfill(response=held['resp']); page.wait_for_timeout(1200)
        st = items_state(page)
        res['resuelto'] = {'status_nodes': held['resp'].status, 'estados': {k: v for k, v in st.items() if v != 'ok'}, 'n_ok': sum(1 for v in st.values() if v == 'ok'), 'n_sin_confirmar': sum(1 for v in st.values() if v == 'modelo_sin_confirmar'),
                           'bitacora': page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]').inner_text(),
                           'bit_title_attr': page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]').get_attribute('title'),
                           'alerts': page.locator('[role="alert"]').all_inner_texts()}
        page.screenshot(path=str(CAP / 'p4-nodes-resuelto-pagina.png')); page.locator('.workspace-explorer').screenshot(path=str(CAP / 'p4-nodes-resuelto-explorador.png'))
        ctx.close()
        # ----- /nodes falla de verdad: el backend real responde 503 porque el store no esta al pedir /nodes (tras recibir /explorer)
        ctx = browser.new_context(viewport={'width': 1400, 'height': 900}); page = ctx.new_page(); errs2 = []
        page.on('pageerror', lambda e: errs2.append(str(e)))
        h2 = {'n': 0}
        def handler2(route):
            h2['n'] += 1
            if h2['n'] == 1: h2['route'] = route
            else: route.continue_()
        page.route('**/api/workspace/nodes**', handler2)
        page.goto(f'{srv.url}/workspace/node?path=docs/faq.md')
        page.locator('[data-testid="explorer-modeled-item"]').first.wait_for(); page.wait_for_timeout(600)
        stash = w / 'sldb-stash'; shutil.move(str(root / '.sldb'), str(stash))   # el store no existe al pedir /nodes
        resp = h2['route'].fetch(); h2['status'] = resp.status; h2['body'] = resp.text()[:160]
        h2['route'].fulfill(response=resp); page.wait_for_timeout(1500)
        st = items_state(page)
        res['falla_nodes'] = {'status_real': h2['status'], 'body': h2['body'], 'alerts': page.locator('[role="alert"]').all_inner_texts(), 'estados': sorted(set(st.values())),
                              'badges': badge_report(page), 'bitacora': page.locator('[data-testid="explorer-modeled-item"][data-id="Bitacora:b1"]').inner_text()}
        page.screenshot(path=str(CAP / 'p4-nodes-falla-real-pagina.png'))
        # el error no se borra con un refresco del explorador mientras el store siga ausente
        page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1500)
        res['falla_tras_refrescar_sin_store'] = {'alerts': page.locator('[role="alert"]').all_inner_texts(), 'estados': sorted(set(items_state(page).values())) if page.locator('[data-testid="explorer-modeled-item"]').count() else 'sin items'}
        page.screenshot(path=str(CAP / 'p4-falla-tras-refrescar-sin-store.png'))
        shutil.move(str(stash), str(root / '.sldb'))
        page.locator('[data-testid="explorer-refresh"]').click(); page.wait_for_timeout(1800)
        st = items_state(page)
        res['recuperado_con_store'] = {'alerts': page.locator('[role="alert"]').all_inner_texts()[:2], 'bitacora_estado': st.get('Bitacora:b1'), 'n_sin_confirmar': sum(1 for v in st.values() if v == 'modelo_sin_confirmar')}
        page.screenshot(path=str(CAP / 'p4-recuperado.png'))
        res['pageerrors'] = errs + errs2
        OUT['p4'] = res
        ctx.close()
    finally:
        srv.close()
    browser.close()
json.dump(OUT, open(HERE / 'result-browser.json', 'w'), indent=1, ensure_ascii=False, default=str)
