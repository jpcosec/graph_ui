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

    # source de B llega, /node de B retenido: paneles dependientes de /node en carga, sin datos de A
    for tab in ('graph','code','document'):
        goto_a(tab); hold_pat['v']=r'node\?id=TaskDoc:task-doc-b'
        link('task-doc-b').first.click(); pg.wait_for_timeout(1500)
        t=panel_text(pg); print(f'   [{tab}] retenidas:',[u.split("workspace/")[1] for u,_ in held]); print('   main:',t['main'][:260].replace('\n',' | ')); print('   ident:',t['identidad'][:700].replace('\n',' | '))
        chk(f'[{tab}] source B llegado/node B retenido: identidad es de B','desk/tasks/task-doc-b.md' in t['identidad'])
        chk(f'[{tab}] sin codigo/aristas de A en main (src/x.py, Doc A, depends_on A)', not any(x in t['main'] for x in ('src/x.py','Doc A','TaskDoc:task-doc-a →')) , t['main'][:200].replace('\n',' | '))
        chk(f'[{tab}] Estado/Nodo actual/Content hash de A no atribuidos a B (cargando, sin hash de A)', '2dae0b2a935681d3' not in t['identidad'] and 'Sin estado' not in t['identidad'], '')
        rel=t['identidad']
        chk(f'[{tab}] relaciones de A no atribuidas a B', 'task-doc-c' not in rel and 'TaskDoc:task-doc-b →' not in rel, '')
        release()
    # A con /node retenido -> B (source rapido) -> liberar A tardio
    goto_a('graph'); hold_pat['v']=None
    hold_pat['v']=r'node\?id=TaskDoc:task-doc-a'; pg.reload(); pg.wait_for_selector('[data-testid=link-item]')
    hold_pat['v']=None; link('task-doc-b').first.click(); pg.wait_for_timeout(1500)
    release(); t=panel_text(pg)
    chk('A(/node tardio)->B: la respuesta de A no se atribuye a B','desk/tasks/task-doc-b.md' in t['identidad'] and '2dae0b2a935681d3' not in t['identidad'], t['identidad'][:160].replace('\n',' | '))
    pg.get_by_role('button',name='Código',exact=True).click(); pg.wait_for_timeout(300)
    chk('A(/node tardio)->B: Codigo de B no muestra src/x.py de A','src/x.py' not in panel_text(pg)['main'], panel_text(pg)['main'][:100])
    chk('sin pageerrors',not errs,str(errs[:2])); br.close()
print('RESUMEN',sum(1 for _,c in res if c),'/',len(res))
