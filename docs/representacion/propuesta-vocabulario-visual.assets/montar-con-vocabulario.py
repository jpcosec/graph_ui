"""Monta un mundo del manual con su VocabularyDoc adentro, como un documento más: agrega el modelo
VocabularyDoc (declarado por CLI, sin código) y el vocabulario como payload, y llama a montar_mundo.py.
Prueba que el vocabulario puede vivir en el mundo que representa y editarse como cualquier documento.

Uso: python3 montar-con-vocabulario.py <vocabulario.yaml> <mundo.yaml>   (desde la raíz de graph_ui)
"""
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml

vocab = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
world = yaml.safe_load(open(sys.argv[2], encoding="utf-8"))
LISTS = ["symbols", "pseudo", "containers", "connectors", "derived", "rules", "tools"]
DICTS = ["parameters", "applies_when", "scope", "layout"]
fields = [{"name": "name", "type": "str", "description": "Nombre del vocabulario."},
          {"name": "description", "type": "str", "default": "", "description": "Qué representa."},
          {"name": "level", "type": "str", "default": "instances", "description": "types, instances o both."},
          {"name": "projection", "type": "str", "default": "all", "description": "ProjectionDoc sobre la que se apoya."}]
fields += [{"name": k, "type": "dict", "default": {}, "description": f"Sección {k}."} for k in DICTS]
fields += [{"name": k, "type": "list[dict]", "default": [], "description": f"Sección {k}."} for k in LISTS]
template = "---\n" + "".join(f"{f['name']}: ⸢rev•{f['name']}⸥\n" for f in fields) + "---\n\n# ⸢render•name⸥\n"
world["modelos"].append({"name": "VocabularyDoc", "family": "representacion", "template": template, "fields": fields})
world["documentos"].append({"model": "VocabularyDoc", "name": f"vocabulary-{vocab['name']}",
                            "payload": {f["name"]: vocab.get(f["name"], f.get("default")) for f in fields}})
world.pop("relaciones_invalidas", None)
with tempfile.NamedTemporaryFile("w", suffix=".mundo.yaml", delete=False, encoding="utf-8") as tmp:
    yaml.safe_dump(world, tmp, allow_unicode=True, sort_keys=False)
out = subprocess.run([sys.executable, "docs/representacion/herramientas/montar_mundo.py", tmp.name, "--conservar"], capture_output=True, text=True).stdout
root = next(l.split("mundo sano: ")[1].split("  ·")[0] for l in out.splitlines() if l.startswith("mundo sano"))
print("\n".join(l for l in out.splitlines() if "graph:" in l or l.startswith("mundo sano") or l.strip() == "ok")[-400:])
show = subprocess.run([sys.executable, "-m", "sldb", "docs", "show", f"vocabulary-{vocab['name']}", "--store", f"{root}/.sldb",
                       "--pythonpath", str(Path(root).parent)], capture_output=True, text=True).stdout
roundtrip = yaml.safe_load(show)["document"]["payload"]
same = all(roundtrip.get(k) == vocab.get(k, roundtrip.get(k)) for k in vocab)
print(f"vocabulary-{vocab['name']}: {'vuelve idéntico' if same else 'CAMBIÓ al leerlo'} desde {root}")
