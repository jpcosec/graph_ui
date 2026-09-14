"""Genera el mundo de la DSM leyendo los imports relativos de frontends/mindmap: un Component por carpeta
de módulos JS y un depends_on por par de carpetas, con la cantidad de imports en notes (imports=N).

Uso: python3 mundo-desde-imports.py frontends/mindmap > graph-ui.mundo.yaml
"""
import re
import sys
from pathlib import Path

import yaml

root = Path(sys.argv[1]).resolve()
IMPORT = re.compile(r"""(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)""")
component = lambda path: "app" if path.parent == root else str(path.parent.relative_to(root))
modules = sorted(p for p in root.rglob("*") if p.suffix in (".js", ".mjs") and "node_modules" not in p.parts)
counts, sizes = {}, {}
for module in modules:
    sizes[component(module)] = sizes.get(component(module), 0) + 1
    for match in IMPORT.finditer(module.read_text(encoding="utf-8")):
        target = (module.parent / (match.group(1) or match.group(2))).resolve()
        pair = (component(module), component(target))
        counts[pair] = counts.get(pair, 0) + 1
slug = lambda name: name.replace("/", "-")
world = {
    "modelos": [{
        "name": "Component", "family": "dsm",
        "template": "---\npath: ⸢rev•path⸥\nmodules: ⸢rev•modules⸥\n---\n\n# ⸢render•path⸥\n",
        "fields": [{"name": "path", "type": "str", "description": "Carpeta dentro de frontends/mindmap (app = raíz)."},
                   {"name": "modules", "type": "int", "description": "Cantidad de módulos .js/.mjs."}],
    }],
    "tipos_de_relacion": [{
        "name": "depends_on", "cardinality": "many_to_many", "axis": "HOW",
        "source_types": ["Component"], "target_types": ["Component"],
        "description": "Algún módulo del origen importa uno del destino. La cantidad de imports va en notes.",
    }],
    "documentos": [{"model": "Component", "name": slug(c), "payload": {"path": c, "modules": n}} for c, n in sorted(sizes.items())],
    "relaciones": [{"type": "depends_on", "source": f"Component:{slug(a)}", "target": f"Component:{slug(b)}", "notes": f"imports={n}"}
                   for (a, b), n in sorted(counts.items()) if a != b],
}
print("# DSM de componentes de graph_ui (frontends/mindmap), generada por mundo-desde-imports.py desde los imports relativos.")
print(yaml.safe_dump(world, allow_unicode=True, sort_keys=False, width=140), end="")
