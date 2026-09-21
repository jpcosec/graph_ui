"""Para los mismos arrastres que bpmn-js.py, pregunta a pron qué verbo acepta (Verbs.assert_edge evalúa la
condition de cada verbo: pool = "{pool}" para sequence_flow, pool != "{pool}" para message_flow).

Cada afirmación aceptada se deshace enseguida (untrack del RelationDoc) para que la siguiente parta del mismo mundo.

Uso: python3 afirmar-flujos.py <mundo montado con --conservar desde reserva.mundo.yaml>
"""
import subprocess
import sys
from pathlib import Path

from pron.world.lexicon import Lexicon
from pron.world.store_error import StoreError
from pron.sexpr.resolving.verbs import Verbs
from pron.world.world import World

world = Path(sys.argv[1])
PAIRS = [
    ("Task:buscar-mesa", "Gateway:hay-mesa"),
    ("Task:pedir-mesa", "Event:pedido-recibido"),
    ("Task:pedir-mesa", "Task:buscar-mesa"),
    ("Task:confirmar", "Event:cliente-listo"),
    ("Event:quiere-cenar", "Task:pedir-mesa"),
    ("Event:cliente-listo", "Event:quiere-cenar"),
]
for source, target in PAIRS:
    verdicts = []
    for verb in ("sequence_flow", "message_flow"):
        w = World(world, str(world.parent))
        verbs = Verbs(Lexicon(w, w.projection("all")))
        if w.graph.exists(f"sldb://document/{source}", f"sldb://document/{target}", verb):
            verdicts.append(f"{verb}: ya existe")
            continue
        try:
            verbs.assert_edge(verb, source, target)
            verdicts.append(f"{verb}: ACEPTADA")
            name = f"{verb}--{source}--{target}"
            subprocess.run([sys.executable, "-m", "sldb", "docs", "untrack", name, "--store", str(world / ".sldb"),
                            "--pythonpath", str(world.parent)], capture_output=True, check=True)
        except StoreError as error:
            verdicts.append(f"{verb}: rechazada ({str(error).split(' (find')[0]})")
    print(f"{source} -> {target}: " + " · ".join(verdicts))
