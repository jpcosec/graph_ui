"""Dispara los eventos del statechart como oraciones de pron sobre un mundo montado, y muestra el estado.

Los mismos escenarios que reserva.xstate.mjs. El evento es un AnchorDoc (`action:change
Reservation.status=...`); pron evalúa la transición y su condition antes de escribir.

Uso: python3 disparar-eventos.py <world> <pythonpath>
     (el mundo sale de `montar_mundo.py reserva.mundo.yaml --conservar`)
"""
import json
import subprocess
import sys

world, pythonpath = sys.argv[1], sys.argv[2]
ESCENARIOS = [
    ("Ana", "reserva-ana", ["confirm", "confirm", "seat", "cancel"]),
    ("Bruno", "reserva-bruno", ["confirm", "cancel"]),
]


def status(name: str) -> str:
    out = subprocess.run(
        [sys.executable, "-m", "sldb", "docs", "show", name, "--store", f"{world}/.sldb", "--pythonpath", pythonpath],
        capture_output=True, text=True, check=True,
    ).stdout
    return json.loads(out)["document"]["payload"]["status"]


for guest, name, eventos in ESCENARIOS:
    for evento in eventos:
        antes = status(name)
        respuesta = subprocess.run(
            ["pron", "say", f"{evento} {guest}'s reservation", "--world", world, "--pythonpath", pythonpath, "--local"],
            capture_output=True, text=True,
        ).stdout.strip().splitlines()[-1]
        despues = status(name)
        print(f"{guest} {evento}: {antes} -> {despues}  | pron: {respuesta}")
