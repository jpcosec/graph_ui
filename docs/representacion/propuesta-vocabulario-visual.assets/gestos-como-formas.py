"""Los gestos de un diagrama de clases UML como formas de pron, sin oraciones ni alias.

Uso: PYTHONPATH=<pron con formas>/src python3 gestos-como-formas.py <mundo montado con --conservar>

El mundo es el de 03-diagrama-vocabulario/nodo-arista-tipado/uml-clases.assets/uml-clases.mundo.yaml,
que no declara ningún AnchorDoc: graph_ui es una superficie hermana del SHRDLU y no usa su léxico.
Una sola sesión, como la de una vista abierta, para que `undo` deshaga el gesto anterior.
"""
import sys
from pathlib import Path

from pron.session import Session
from pron.world.world import World

world = Path(sys.argv[1])
s = Session(World(world, str(world.parent)), projection="all", speaker="graph_ui")

GESTOS = [
    ("conectar Client → Bookable con realizes",
     '(assert realizes (doc "UmlClass:client") (doc "UmlClass:bookable"))'),
    ("conectar Client → Person con realizes (Person no es interfaz)",
     '(assert realizes (doc "UmlClass:client") (doc "UmlClass:person"))'),
    ("soltar una clase nueva en el lienzo",
     '(create UmlClass (as "zone") (name "Zone"))'),
    ("agregar un atributo en el compartimento",
     '(add (doc "UmlClass:table") attributes "zone: Zone")'),
    ("deshacer", "(undo)"),
    ("leer lo que realiza Client, para dibujarlo",
     '(targets realizes (doc "UmlClass:client"))'),
    ("conectar Client — Table con una asociación: crear el documento y sus dos extremos en un movimiento",
     '(move (create UmlAssociation (as "client-prefers-table") (name "prefers")) '
     '(assert end_a (created) (doc "UmlClass:client")) (assert end_b (created) (doc "UmlClass:table")))'),
    ("lo mismo nombrando por dirección el documento que se crea en el mismo movimiento",
     '(move (create UmlAssociation (as "client-prefers-table") (name "prefers")) '
     '(assert end_a (doc "UmlAssociation:client-prefers-table") (doc "UmlClass:client")))'),
    ("lo mismo en dos movimientos: crear",
     '(create UmlAssociation (as "client-prefers-table") (name "prefers"))'),
    ("y después los dos extremos",
     '(move (assert end_a (doc "UmlAssociation:client-prefers-table") (doc "UmlClass:client")) '
     '(assert end_b (doc "UmlAssociation:client-prefers-table") (doc "UmlClass:table")))'),
]

for gesto, forma in GESTOS:
    r = s.eval(forma)
    escrituras = len(r.record.get("writes") or [])
    print(f"### {gesto}\n{forma}\n  → {r.outcome} · {escrituras} escrituras · {r.text.strip()}\n")
