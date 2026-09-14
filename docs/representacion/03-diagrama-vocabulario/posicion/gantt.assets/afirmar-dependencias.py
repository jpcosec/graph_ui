"""Afirma dependencias a través de pron (Verbs.assert_edge), que evalúa la condition del verbo.

Uso: python3 afirmar-dependencias.py <mundo montado con --conservar desde manual.mundo.yaml>
"""
import sys
from pathlib import Path

from pron.lexicon import Lexicon
from pron.store import StoreError
from pron.verbs import Verbs
from pron.world import World

world = Path(sys.argv[1])
w = World(world, str(world.parent))
verbs = Verbs(Lexicon(w, w.projection("all")))
# t-c97d21c (06:01-06:06) y t-62c4751 (05:51-05:55), sin arista entre ellas en el mundo:
# la primera puede depender de la segunda, no al revés.
for source, target in [("Task:t-c97d21c", "Task:t-62c4751"), ("Task:t-62c4751", "Task:t-c97d21c")]:
    try:
        verbs.assert_edge("depends_on", source, target)
        print("ACEPTADA:", source, "depends_on", target)
    except StoreError as error:
        print("RECHAZADA:", source, "depends_on", target, "::", error)
