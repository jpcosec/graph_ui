import json, sys
from common import *
from urllib.parse import quote
OUT = {'cases': [], 'mixed': {}, 'legit': {}, 'client': {}}
FORB_DIRS = ['.git', '.hidden', '__pycache__', 'node_modules', '.venv', 'desk/.hidden', 'desk/__pycache__', 'desk/node_modules',
             'docs/.cache', 'docs/node_modules/pkg', 'desk/notas/.x/y', 'desk/.hidden/sub']
ENTRIES_EXTRA = ['.git/', 'desk/.hidden/', './desk/.hidden', 'desk//.hidden', '.GIT', 'desk/..hidden', '.hidden/sub', 'node_modules/', '.git/refs']

def build(with_git, name):
    w = fresh(name); root = w / 'repo'; root.mkdir()
    if with_git: T.git_init(root)           # sin .gitignore
    T.prepare_store(root)
    for d in FORB_DIRS:
        if d == '.git': continue
        T.write(root, f'{d}/CENTINELA.md', f'# c {d}\n'); T.write(root, f'{d}/sub/CENTINELA2.md', '# c2\n')
    if with_git:
        T.write(root, '.git/CENTINELA.md', '# c git\n'); T.write(root, '.git/sub/CENTINELA2.md', '# c2\n')
    for extra in ('.hidden/sub', 'node_modules', '.git/refs'):
        if extra.startswith('.git') and not with_git: continue
        T.write(root, f'{extra}/CENTINELA.md')
    T.write(root, 'desk/notas/uno.md', '# Uno\n'); T.write(root, 'docs/faq.md', '# FAQ\n')
    T.write(root, 'desk/mis notas/ñandú día.md', '# Ñ\n'); T.write(root, 'docs/ñandú/guía rápida.md', '# G\n')
    T.write(root, 'desk/v1.2 notas/a.md'); T.write(root, 'docs/a.b/c.md'); T.write(root, 'desk/notas.d/e.md')
    T.write(root, 'desk/node_modules_docs/f.md'); T.write(root, 'desk/my__pycache__/g.md')
    if with_git: T.commit_all(root)
    return w, root

def run(root, w, roots_env, tag, query=''):
    s = Server(root, w / f'srv-{tag}', {'WORKSPACE_EXPLORER_ROOTS': roots_env})
    try:
        code, data, ev = s.get('/api/workspace/explorer' + query)
        code2, d2, ev2 = s.get('/api/workspace/nodes')
        allev = s.events()
        return code, data, {'read_sentinel': [e['d'][0] for e in allev if e['k'] == 'read_sentinel'],
                            'enum_forbidden': [e['d'] for e in allev if e['k'] == 'enum_forbidden'],
                            'writes': writes(allev)}
    finally: s.close()

def sentinel_leak(data):
    blob = json.dumps({k: data[k] for k in ('roots', 'modeled', 'unmodeled')}, ensure_ascii=False)
    return [t for t in ('CENTINELA',) if t in blob]

for with_git in (True, False):
    w, root = build(with_git, f'roots-{"git" if with_git else "nogit"}')
    entries = [e for e in FORB_DIRS + ENTRIES_EXTRA if with_git or not e.startswith('.git') and e != '.GIT']
    if not with_git: entries += ['.git']   # entrada .git aunque no exista en repo sin git
    for e in entries:
        code, data, obs = run(root, w, e, 'one')
        case = {'git': with_git, 'entry': e, 'code': code, 'roots': data.get('roots'), 'roots_invalid': data.get('roots_invalid'),
                'unmodeled_n': len(data.get('unmodeled', [])), 'leak': sentinel_leak(data), **obs}
        case['ok'] = (code == 200 and data['roots'] == [] and any(i['entry'] == e for i in data['roots_invalid']) and not case['leak']
                      and not obs['read_sentinel'] and not obs['enum_forbidden'] and not obs['writes'])
        OUT['cases'].append(case)
    # mixta
    forb = [e for e in FORB_DIRS if with_git or not e.startswith('.git')]
    mixed = ['desk/notas'] + forb + ['docs', 'desk/mis notas', 'docs/ñandú', 'desk/v1.2 notas']
    code, data, obs = run(root, w, ','.join(mixed), 'mixed')
    OUT['mixed'][str(with_git)] = {'code': code, 'roots': data['roots'], 'invalid': sorted(i['entry'] for i in data['roots_invalid']),
        'invalid_expected': sorted(forb), 'leak': sentinel_leak(data), **obs,
        'paths': sorted(u['path'] for u in data['unmodeled'])}
    # legitimas
    code, data, obs = run(root, w, 'desk/mis notas, docs/ñandú, desk/v1.2 notas, docs/a.b, desk/notas.d, desk/node_modules_docs, desk/my__pycache__', 'legit')
    OUT['legit'][str(with_git)] = {'roots': data['roots'], 'invalid': data['roots_invalid'], 'paths': sorted(u['path'] for u in data['unmodeled']), 'leak': sentinel_leak(data)}
    # defaults (desk, docs) y "."
    code, data, obs = run(root, w, 'desk,docs', 'default'); OUT['legit'][str(with_git)+'_desk_docs_leak'] = sentinel_leak(data)
    code, data, obs = run(root, w, '.', 'dot')
    OUT['legit'][str(with_git)+'_root_dot'] = {'roots': data['roots'], 'invalid': data['roots_invalid'], 'leak': sentinel_leak(data), 'n': len(data['unmodeled']), 'read_sentinel': obs['read_sentinel']}
    # cliente
    code, data, obs = run(root, w, 'desk/notas', 'client', '?root=.git&roots=.git,node_modules&path=.hidden&allow=desk/.hidden')
    OUT['client'][str(with_git)] = {'roots': data['roots'], 'paths': sorted(u['path'] for u in data['unmodeled']), 'leak': sentinel_leak(data)}

OUT['summary'] = {'cases': len(OUT['cases']), 'failed': [(c['git'], c['entry']) for c in OUT['cases'] if not c['ok']]}
json.dump(OUT, open(HERE / 'result-roots.json', 'w'), indent=1, ensure_ascii=False, default=str)
print(OUT['summary']); print(json.dumps(OUT['mixed'], indent=1, ensure_ascii=False)); print(json.dumps(OUT['legit'], indent=1, ensure_ascii=False)); print(OUT['client'])
for c in OUT['cases']:
    if not c['ok']: print('FAIL', c)
