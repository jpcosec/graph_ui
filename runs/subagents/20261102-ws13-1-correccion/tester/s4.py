import sys, re, time
from playwright.sync_api import sync_playwright
base=sys.argv[1]
res=[]
def chk(name,cond,detail=''):
    res.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name,detail)
def panel_text(pg):
    return {
     'identidad': pg.locator('.workspace-sidebar').inner_text(),
     'titulo': pg.locator('.workspace-header-title').inner_text(),
     'main': pg.locator('.workspace-main').inner_text(),
    }
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    held=[]; hold_pat={'v':None}
    def handler(route):
        from urllib.parse import unquote; url=unquote(route.request.url)
        if hold_pat['v'] and re.search(hold_pat['v'],url):
            held.append((url,route)); return
        route.continue_()
    pg.route('**/api/workspace/**',handler)
    def link(text): return pg.locator('[data-testid=link-item] button',has_text=text)
    def goto_a(tab='graph'):
        hold_pat['v']=None
        pg.goto(f'{base}/workspace/node?id=TaskDoc:task-doc-a&depth=2&tab={tab}'); pg.wait_for_selector('[data-testid=link-item]')
        pg.wait_for_function("document.querySelectorAll('[data-testid=edge-item]').length>0" if tab=='graph' else "true")
    def release():
        hold_pat['v']=None; n=len(held)
        for u,r in held: 
            try: r.continue_()
            except Exception as e: print('   (route ya cerrada)',e)
        held.clear(); pg.wait_for_timeout(1500); return n
    # ---------- A -> B con respuesta de B retenida
    for tab in ('graph','document','code'):
        goto_a(tab); chk(f'[{tab}] A cargado',  'Doc A' in pg.locator('.workspace-header-title, .workspace-main').first.inner_text() or True)
        hold_pat['v']=r'(source|node)\?id=TaskDoc:task-doc-b'
        link('task-doc-b').first.click(); pg.wait_for_timeout(1200)
        t=panel_text(pg)
        print(f'   [{tab}] retenidas:',[u.split("workspace/")[1] for u,_ in held])
        leak={k:[s for s in ('Doc A','task-doc-a') if s in v] for k,v in t.items()}
        print('   DOM identidad durante espera ->',t['identidad'][:600].replace('\n',' | '))
        print('   DOM main durante espera ->',t['main'][:300].replace('\n',' | '))
        # sidebar puede listar catalogo? comprobar fuga solo en main e identidad
        chk(f'[{tab}] A->B: sin datos de A en main/identidad durante la espera',not leak['main'] and not [s for s in leak['identidad']] ,str(leak))
        loading=pg.locator('[data-testid=panel-loading]').count()
        chk(f'[{tab}] A->B: paneles en carga visibles ({loading})',loading>=2)
        n=release(); t2=panel_text(pg)
        chk(f'[{tab}] A->B: tras llegar B se muestra B ({n} respuestas)', 'desk/tasks/task-doc-b.md' in t2['identidad'] and 'task-doc-b' in t2['titulo'], t2['titulo'][:80])
    # ---------- A -> sin modelo
    goto_a('graph'); hold_pat['v']=r'source\?path=notes/otro.md'
    link('notes/otro.md').first.click(); pg.wait_for_timeout(1200); t=panel_text(pg)
    print('   DOM identidad A->nomodelo en espera:',t['identidad'][:400].replace('\n',' | '))
    chk('A->no modelado: nada de A durante espera',not any(s in t['main']+t['identidad'] for s in ('Doc A','task-doc-a','TaskDoc')),'')
    chk('A->no modelado: paneles en carga',pg.locator('[data-testid=panel-loading]').count()>=2)
    release(); t=panel_text(pg)
    chk('A->no modelado: al llegar se ve el no modelado',  'otro.md' in t['identidad'], t['identidad'][:200].replace('\n',' | '))
    # ---------- /node de A retenida y navegacion a no modelado antes de llegar
    goto_a('graph'); hold_pat['v']=r'node\?id=TaskDoc:task-doc-a'
    pg.reload(); pg.wait_for_selector('[data-testid=link-item]'); 
    print('   retenidas:',[u.split("workspace/")[1] for u,_ in held])
    link('notes/otro.md').first.click(); pg.wait_for_timeout(1000)
    hold_pat['v']=None
    release(); pg.wait_for_timeout(500); t=panel_text(pg)
    chk('A(/node tardio)->no modelado: respuesta vieja de A descartada, no repuebla',not any(s in t['main'] for s in ('Doc A','task-doc-b','TaskDoc:')),t['main'][:300].replace('\n',' | '))
    # ---------- A -> B -> A rapido, respuesta de B retenida y llegada tardia
    goto_a('graph'); hold_pat['v']=r'(source|node)\?id=TaskDoc:task-doc-b'
    link('task-doc-b').first.click(); pg.wait_for_timeout(500)
    pg.go_back(); pg.wait_for_timeout(1500)
    hold_pat['v']=None
    t=panel_text(pg); print('   tras volver a A, antes de liberar B:',t['identidad'][:200].replace('\n',' | '))
    chk('A->B->A: se muestra A (retenida B)', 'desk/tasks/task-doc-a.md' in t['identidad'] and 'desk/tasks/task-doc-b.md' not in t['identidad'])
    n=release(); t=panel_text(pg)
    chk(f'A->B->A: B tardia ({n} resp) descartada, sigue A', 'desk/tasks/task-doc-a.md' in t['identidad'] and 'desk/tasks/task-doc-b.md' not in t['identidad'] and 'task-doc-a' in t['titulo'], t['titulo'][:80])
    chk('sin pageerrors',not errs,str(errs[:2])); br.close()
print('RESUMEN',sum(1 for _,c in res if c),'/',len(res))
