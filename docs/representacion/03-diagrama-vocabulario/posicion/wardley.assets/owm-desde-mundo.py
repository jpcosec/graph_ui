"""Escribe el mapa en la notación de OnlineWardleyMaps desde el mundo (la dirección get de la lente).

Uso: python3 owm-desde-mundo.py tea-shop.mundo.yaml > tea-shop.desde-mundo.owm
"""
import sys

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
docs = {f"{d['model']}:{d['name']}": d for d in world["documentos"]}
name = lambda key: docs[key]["payload"]["name"]
coords = lambda p: f"[{p['visibility']:.2f}, {p['maturity']:.2f}]"
evolved_into = {r["target"]: r["source"] for r in world["relaciones"] if r["type"] == "evolves_to"}

print(f"title {world['titulo']}")
for key, doc in docs.items():
    p = doc["payload"]
    if doc["model"] == "UserNeed":
        print(f"anchor {p['name']} {coords(p)}")
    elif key in evolved_into:
        print(f"evolve {name(evolved_into[key])}->{p['name']} {p['maturity']:.2f}")
    else:
        print(f"component {p['name']} {coords(p)}")
        if p.get("evolving_to"):
            print(f"evolve {p['name']} {p['evolving_to']:.2f}")
for rel in world["relaciones"]:
    if rel["type"] == "needs":
        suffix = f"; {rel['notes']}" if rel.get("notes") else ""
        print(f"{name(rel['source'])}->{name(rel['target'])}{suffix}")
