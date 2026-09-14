"""Juego de marcas desde el mundo: el mismo grafo de alcanzabilidad que oraculo-snakes.py, leyendo
Place.tokens, input_of, output_to y el peso desde notes (peso=N).

Uso: python3 simular-desde-mundo.py mesas.mundo.yaml [--sin-pesos]

--sin-pesos ignora notes, como quien lea las aristas del grafo de pron (notes no llega a sus metadatos).
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
places = [d["name"] for d in world["documentos"] if d["model"] == "Place"]
initial = tuple(d["payload"]["tokens"] for d in world["documentos"] if d["model"] == "Place")
transitions = [d["name"] for d in world["documentos"] if d["model"] == "Transition"]
ignore_weights = "--sin-pesos" in sys.argv
weight = lambda rel: 1 if ignore_weights else int(rel.get("notes", "peso=1").split("=")[1])
pre = {t: {} for t in transitions}
post = {t: {} for t in transitions}
for rel in world["relaciones"]:
    source, target = rel["source"].split(":", 1)[1], rel["target"].split(":", 1)[1]
    if rel["type"] == "input_of":
        pre[target][source] = weight(rel)
    elif rel["type"] == "output_to":
        post[source][target] = weight(rel)


def fire(marking, t):
    m = dict(zip(places, marking))
    if any(m[p] < w for p, w in pre[t].items()):
        return None
    for p, w in pre[t].items():
        m[p] -= w
    for p, w in post[t].items():
        m[p] += w
    return tuple(m[p] for p in places)


seen, frontier, dead = {initial}, [initial], set()
while frontier:
    marking = frontier.pop()
    successors = [s for s in (fire(marking, t) for t in transitions) if s is not None]
    if not successors:
        dead.add(marking)
    for s in successors:
        if s not in seen:
            seen.add(s)
            frontier.append(s)
print("lugares:", ", ".join(places))
for marking in sorted(seen):
    print(marking, "MUERTO" if marking in dead else "")
print(f"{len(seen)} marcados alcanzables, {len(dead)} sin transiciones habilitadas")
