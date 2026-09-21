"""Afirma aristas a través de pron (Verbs.assert_edge), que valida al escribir.

Uso: python3 afirmar-aristas.py <ruta del mundo montado con --conservar>

Contraste con el control negativo de montar_mundo.py, que escribe la RelationDoc directo con
`sldb docs create` y solo la ve validar kgdb en `pron refresh`.
"""
import sys
from pathlib import Path

from pron.world.lexicon import Lexicon
from pron.world.store_error import StoreError
from pron.sexpr.resolving.verbs import Verbs
from pron.world.world import World

world = Path(sys.argv[1])
w = World(world, str(world.parent))
verbs = Verbs(Lexicon(w, w.projection("all")))
for name, source, target in [
    ("realizes", "UmlClass:reservation", "UmlClass:client"),
    ("realizes", "UmlClass:waiter", "UmlClass:bookable"),
    ("generalizes", "UmlAssociation:booked-by", "UmlClass:person"),
]:
    try:
        doc, _ = verbs.assert_edge(name, source, target)
        print("ACEPTADA:", name, source, "->", target, "=>", doc)
    except StoreError as error:
        print("RECHAZADA:", name, source, "->", target, "::", error)
