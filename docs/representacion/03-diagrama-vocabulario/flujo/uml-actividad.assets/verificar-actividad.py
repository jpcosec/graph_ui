"""Reglas de la actividad UML que el sustrato no declara: grados de los nodos de control (UML 2.5.1, 15.3.3)
y terminación correcta, jugando los tokens como una red de Petri (una plaza por arista).

Uso: python3 verificar-actividad.py pedido.mundo.yaml
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
kind = {}
for d in world["documentos"]:
    key = f"{d['model']}:{d['name']}"
    kind[key] = d["payload"]["kind"] if d["model"] == "ControlNode" else d["model"]
edges = [(i, r["source"], r["target"], r["type"]) for i, r in enumerate(world["relaciones"])]
incoming = {k: [e for e in edges if e[2] == k] for k in kind}
outgoing = {k: [e for e in edges if e[1] == k] for k in kind}
problems = []

# 1. Grados y tipos de flujo (15.3.3.1 a 15.3.3.6)
for k, kd in kind.items():
    inn, out = incoming[k], outgoing[k]
    if kd == "initial" and inn:
        problems.append(f"GRADO: {k} es initial y tiene flujos de entrada")
    if kd in ("activity_final", "flow_final") and out:
        problems.append(f"GRADO: {k} es final y tiene flujos de salida")
    if kd == "fork" and len(inn) != 1:
        problems.append(f"GRADO: {k} es fork y tiene {len(inn)} flujos de entrada (debe ser 1)")
    if kd in ("join", "merge") and len(out) != 1:
        problems.append(f"GRADO: {k} es {kd} y tiene {len(out)} flujos de salida (debe ser 1)")
    if kd == "decision" and len(inn) != 1:
        problems.append(f"GRADO: {k} es decision y tiene {len(inn)} flujos de entrada")
    if kd in ("fork", "merge", "decision") and len({e[3] for e in inn + out}) > 1:
        problems.append(f"TIPO DE FLUJO: {k} ({kd}) mezcla control_flow y object_flow")

# 2. Juego de tokens: una plaza por arista; decision y merge eligen, el resto consume todo y produce todo
transitions = []
for k, kd in kind.items():
    inn, out = [e[0] for e in incoming[k]], [e[0] for e in outgoing[k]]
    if kd == "initial":
        continue
    if kd == "decision":
        transitions += [(k, [i], [o]) for i in inn for o in out]
    elif kd == "merge":
        transitions += [(k, [i], out) for i in inn]
    elif kd in ("activity_final", "flow_final"):
        transitions += [(k, [i], ["fin"]) for i in inn]
    else:
        transitions.append((k, inn, out))
start = frozenset((e[0], 1) for k, kd in kind.items() if kd == "initial" for e in outgoing[k])


def fire(marking, pre, post):
    m = dict(marking)
    if any(m.get(p, 0) < 1 for p in pre):
        return None
    for p in pre:
        m[p] -= 1
    for p in post:
        m[p] = m.get(p, 0) + 1
    return frozenset((p, n) for p, n in m.items() if n)


seen, frontier, stuck = {start}, [start], []
while frontier:
    marking = frontier.pop()
    successors = [s for s in (fire(marking, pre, post) for _, pre, post in transitions if pre) if s is not None]
    if not successors and marking != frozenset({("fin", 1)}):
        stuck.append(marking)
    for s in successors:
        if s not in seen:
            seen.add(s)
            frontier.append(s)
label = {e[0]: f"{e[1].split(':')[1]}->{e[2].split(':')[1]}" for e in edges}
label["fin"] = "fin"
for marking in stuck:
    tokens = ", ".join(sorted(label[p] for p, _ in marking))
    problems.append(f"SE TRABA: queda un marcado sin salida con tokens en {tokens}")

for line in problems:
    print(line)
print(f"{len(kind)} nodos, {len(seen)} marcados alcanzables, {len(problems)} problema(s)")
