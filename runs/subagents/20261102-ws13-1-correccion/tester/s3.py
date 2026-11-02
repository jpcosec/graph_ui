import sys, json
from playwright.sync_api import sync_playwright
base=sys.argv[1]
A,B,C,D='task-doc-a','task-doc-b','task-doc-c','task-doc-d'
res=[]
def chk(name,cond,detail=''):
    res.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name,detail)
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'{base}/workspace/node?id=TaskDoc:{A}&depth=2&tab=graph'); pg.wait_for_selector('[data-testid=edge-item]')
    def edge(s,t): return pg.locator(f'[data-testid=edge-item][data-edge-key^="TaskDoc:{s}|TaskDoc:{t}|"]')
    def tab(n): pg.get_by_role('button',name=n,exact=True).click()
    def focused_fields():
        return pg.eval_on_selector_all('.workspace-payload-field.is-focused','els=>els.map(e=>e.dataset.fieldPath)')
    def focused_edges():
        return pg.eval_on_selector_all('[data-testid=edge-item][data-focused=true]','els=>els.map(e=>e.dataset.edgeKey)')
    def corr(): return pg.locator('[data-testid=focus-corr]').inner_text().replace('\n',' ')
    # a) entrante B->A
    chk('arista B->A visible con depth=2',edge(B,A).count()==1)
    chk('B->A no muestra campo propio (data-fields vacio)',edge(B,A).get_attribute('data-fields')=='',edge(B,A).get_attribute('data-fields'))
    edge(B,A).click(); chk('a) foco B->A: solo esa arista resaltada',focused_edges()==[f'TaskDoc:{B}|TaskDoc:{A}|references|'],str(focused_edges()))
    print('   corr:',corr())
    tab('Documento'); pg.wait_for_selector('.workspace-payload-field')
    chk('a) B->A con A abierto: A.depends_on NO resaltado',focused_fields()==[],str(focused_fields()))
    chk('a) correspondencia documento=0',  'Documento: 0' in corr(),corr())
    # b) saliente A->C dos procedencias
    tab('Grafo Local'); pg.wait_for_selector('[data-testid=edge-item]')
    chk('b) A->C muestra ambas procedencias',set(edge(A,C).get_attribute('data-fields').split(','))=={'depends_on','inherits_from'},edge(A,C).get_attribute('data-fields'))
    edge(A,C).click(); tab('Documento'); pg.wait_for_selector('.workspace-payload-field')
    chk('b) foco A->C resalta depends_on e inherits_from de A',sorted(focused_fields())==['depends_on','inherits_from'],str(focused_fields())); print('   corr:',corr())
    # c) vecino dos saltos D->B
    tab('Grafo Local'); pg.wait_for_selector('[data-testid=edge-item]')
    chk('c) D->B (2 saltos) visible',edge(D,B).count()==1)
    edge(D,B).click(); tab('Documento'); pg.wait_for_selector('.workspace-payload-field')
    chk('c) foco D->B: ningun campo de A resaltado',focused_fields()==[],str(focused_fields())); print('   corr:',corr())
    # d) foco por campo depends_on de A
    pg.locator('.workspace-payload-field[data-field-path=depends_on] [data-testid=field-focus]').click()
    tab('Grafo Local'); pg.wait_for_selector('[data-testid=edge-item]')
    fe=focused_edges(); print('   corr:',corr(),fe)
    chk('d) foco campo A.depends_on: solo A->C resaltada (no B->A, no D->B)',fe==[f'TaskDoc:{A}|TaskDoc:{C}|references|'],str(fe))
    chk('d) correspondencia grafo = 1 (sin falsos)','Grafo: 1' in corr(),corr())
    # inherits_from tambien resalta A->C
    tab('Documento'); pg.locator('.workspace-payload-field[data-field-path=inherits_from] [data-testid=field-focus]').click(); tab('Grafo Local')
    chk('d2) foco A.inherits_from resalta A->C',focused_edges()==[f'TaskDoc:{A}|TaskDoc:{C}|references|'],str(focused_edges()))
    # e) referencia de Code
    pg.goto(f'{base}/workspace/node?id=TaskDoc:{A}&depth=2&tab=code'); pg.wait_for_selector('[data-testid=code-ref-focus]')
    pg.locator('[data-testid=code-ref-focus]').first.click(); print('   corr code ref:',corr())
    chk('e) foco referencia Code: grafo 0 aristas falsas','Grafo: 0' in corr(),corr())
    # f) cambio de documento mantiene foco con dueno: abrir B y foco B->A: A.depends_on? ahora B abierto
    pg.goto(f'{base}/workspace/node?id=TaskDoc:{B}&depth=2&tab=graph'); pg.wait_for_selector('[data-testid=edge-item]')
    edge(B,A).click(); tab('Documento'); pg.wait_for_selector('.workspace-payload-field')
    chk('f) con B abierto, B->A SI resalta B.depends_on',focused_fields()==['depends_on'],str(focused_fields()))
    pg.screenshot(path='/tmp/tst/s3-b-open.png')
    chk('sin pageerrors',not errs,str(errs)); br.close()
print('RESUMEN',sum(1 for _,c in res if c),'/',len(res))
