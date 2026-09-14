"""Genera un mundo tipado con la estructura de este manual: Manual, Axis (los tres ejes), Folder (las carpetas
del eje 3) y Document (cada .md que no es index). Cada nivel tiene su propio verbo de pertenencia; el mapa
mental los lee como una sola jerarquía sin mostrar el tipo.

Uso: python3 mundo-desde-manual.py docs/representacion > manual.mundo.yaml
"""
import re
import sys
from pathlib import Path

import yaml

root = Path(sys.argv[1])
title = lambda md: re.search(r"^# (.+)$", md.read_text(encoding="utf-8"), re.M).group(1)
slug = lambda p: str(p.relative_to(root)).replace("/", "--").removesuffix(".md")
docs = [{"model": "Manual", "name": "manual", "payload": {"title": title(root / "README.md")}}]
rels = []
for axis in sorted(p for p in root.iterdir() if p.is_dir() and re.match(r"\d\d-", p.name)):
    docs.append({"model": "Axis", "name": slug(axis), "payload": {"title": title(axis / "index.md")}})
    rels.append({"type": "axis_of", "source": f"Axis:{slug(axis)}", "target": "Manual:manual"})
    for md in sorted(axis.glob("*.md")):
        if md.name != "index.md":
            docs.append({"model": "Document", "name": slug(md), "payload": {"title": title(md)}})
            rels.append({"type": "chapter_of", "source": f"Document:{slug(md)}", "target": f"Axis:{slug(axis)}"})
    for folder in sorted(p for p in axis.iterdir() if p.is_dir() and (p / "index.md").exists()):
        docs.append({"model": "Folder", "name": slug(folder), "payload": {"title": title(folder / "index.md")}})
        rels.append({"type": "folder_of", "source": f"Folder:{slug(folder)}", "target": f"Axis:{slug(axis)}"})
        for md in sorted(folder.glob("*.md")):
            if md.name != "index.md":
                docs.append({"model": "Document", "name": slug(md), "payload": {"title": title(md)}})
                rels.append({"type": "example_of", "source": f"Document:{slug(md)}", "target": f"Folder:{slug(folder)}"})
tmpl = "---\ntitle: ⸢rev•title⸥\n---\n\n# ⸢render•title⸥\n"
field = [{"name": "title", "type": "str", "description": "Título (el H1 del archivo)."}]
verb = lambda name, src, tgt, what: {"name": name, "cardinality": "many_to_one", "axis": "WHERE", "source_types": [src], "target_types": [tgt], "description": what}
world = {
    "modelos": [{"name": m, "family": "manual", "template": tmpl, "fields": field} for m in ("Manual", "Axis", "Folder", "Document")],
    "tipos_de_relacion": [
        verb("axis_of", "Axis", "Manual", "El eje es parte del manual."),
        verb("folder_of", "Folder", "Axis", "La carpeta (dónde vive el significado) es parte del eje."),
        verb("chapter_of", "Document", "Axis", "El documento es un capítulo directo del eje."),
        verb("example_of", "Document", "Folder", "El documento es un ejemplo de la carpeta."),
    ],
    "documentos": docs, "relaciones": rels,
}
print("# Estructura de este manual como mundo tipado (generado por mundo-desde-manual.py). Cuatro verbos de pertenencia.")
print(yaml.safe_dump(world, allow_unicode=True, sort_keys=False, width=140), end="")
