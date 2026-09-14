"""Busca en los mundos del manual los modelos que "parecen" relaciones reificadas: origen de dos o más verbos
many_to_one (cada uno, un extremo con un solo participante). Sirve para ver si un vocabulario podría
inferir la reificación o tiene que declararla.

Uso: python3 detectar-reificaciones.py docs/representacion
"""
import sys
from pathlib import Path

import yaml

for path in sorted(Path(sys.argv[1]).rglob("*.mundo.yaml")):
    world = yaml.safe_load(path.read_text(encoding="utf-8"))
    ends = {}
    for rt in world.get("tipos_de_relacion", []):
        if rt["cardinality"] == "many_to_one":
            for model in rt["source_types"]:
                ends.setdefault(model, []).append(f"{rt['name']}→{'|'.join(rt['target_types'])}")
    found = {m: e for m, e in ends.items() if len(e) >= 2}
    if found:
        rel = path.relative_to(sys.argv[1])
        for model, e in found.items():
            print(f"{rel}: {model} ({len(e)} extremos: {', '.join(e)})")
