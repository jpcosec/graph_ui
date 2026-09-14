"""Monta un mundo pron de ejemplo desde un archivo YAML, usando solo los CLI (sldb, pron).

Uso:
    python3 docs/representacion/herramientas/montar_mundo.py <mundo.yaml> [--conservar]

Por qué solo CLI: la tesis del manual es que un vocabulario se implementa declarando clases y
relaciones sin tocar código de pron/kgdb/sldb. Si algo del ejemplo no se puede montar así, es un
hueco. Cada comando y su salida se imprime, para copiarlo al documento.

Formato del YAML:
    modelos:          # cada uno pasa por `sldb models create` + `sldb models add`
      - name: Clase
        family: uml
        template: |      # plantilla sldb del modelo
          ...
        fields: [{name, type, description, default?}]
    tipos_de_relacion: # payloads de RelationTypeDoc (kgdb)
      - {name, cardinality, direction?, axis?, source_types, target_types, condition?, description}
    documentos:        # payloads de documentos de los modelos declarados
      - {model, name, payload}
    relaciones:        # RelationDoc: source/target como Modelo:nombre
      - {type, source, target, condition?}
    relaciones_invalidas:  # control negativo: se crean después de un mundo sano y se vuelve a
      - {type, source, target, porque}   # correr refresh + check para ver si kgdb/pron las rechazan
    pron_extra:        # subcomandos de pron a correr sobre el mundo sano, p. ej. [lexicon]
      - [lexicon]
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml


def run(argv: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    shown = " ".join(argv)
    print(f"$ {shown}")
    done = subprocess.run(argv, cwd=cwd, capture_output=True, text=True)
    out = (done.stdout + done.stderr).strip()
    if out:
        print("\n".join("  " + line for line in out.splitlines()))
    if done.returncode:
        print(f"  [exit {done.returncode}]")
    return done


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def montar(spec_path: Path, conservar: bool) -> int:
    spec = yaml.safe_load(spec_path.read_text(encoding="utf-8"))
    base = Path(tempfile.mkdtemp(prefix="mundo-"))
    world, pkg = base / "world", base / "mundo_modelos"
    world.mkdir()
    pkg.mkdir()
    (pkg / "__init__.py").write_text("", encoding="utf-8")
    store, py = str(world / ".sldb"), str(base)
    fallos = 0

    fallos += bool(run([sys.executable, "-m", "sldb", "stores", "init", "--path", str(world)]).returncode)
    for model in spec.get("modelos", []):
        name = model["name"]
        (base / f"{name}.template.md").write_text(model["template"].strip() + "\n", encoding="utf-8")
        fields = {k: model[k] for k in ("name", "family", "semantics", "base") if k in model}
        fields["fields"] = model["fields"]
        (base / f"{name}.fields.yaml").write_text(yaml.safe_dump(fields, allow_unicode=True), encoding="utf-8")
        module = pkg / f"{slug(name).replace('-', '_')}.py"
        fallos += bool(run([sys.executable, "-m", "sldb", "models", "create", name,
                            "--template", str(base / f"{name}.template.md"),
                            "--fields", str(base / f"{name}.fields.yaml"), "--output", str(module)]).returncode)
        fallos += bool(run([sys.executable, "-m", "sldb", "models", "add", f"mundo_modelos.{module.stem}:{name}",
                            "--store", store, "--pythonpath", py]).returncode)
    fallos += bool(run(["pron", "init", "--world", str(world), "--pythonpath", py]).returncode)

    def create(model: str, name: str, payload: dict, folder: str) -> None:
        nonlocal fallos
        out = world / folder / f"{slug(name)}.md"
        out.parent.mkdir(parents=True, exist_ok=True)
        fallos += bool(run([sys.executable, "-m", "sldb", "docs", "create", "--model", model, "-o", str(out),
                            "--name", name, "--store", store, "--pythonpath", py,
                            json.dumps(payload, ensure_ascii=False)]).returncode)

    for rt in spec.get("tipos_de_relacion", []):
        payload = {"title": rt["name"], "direction": "directed", "axis": "", "condition": "", **rt}
        create("RelationTypeDoc", f"rt-{rt['name']}", payload, "relations/types")
    for doc in spec.get("documentos", []):
        create(doc["model"], doc["name"], doc["payload"], slug(doc["model"]))
    for rel in spec.get("relaciones", []):
        name = f"{rel['type']}--{rel['source']}--{rel['target']}"
        payload = {"title": name, "source_id": rel["source"], "target_id": rel["target"],
                   "relation_type": rel["type"], "condition": rel.get("condition", ""), "notes": ""}
        create("RelationDoc", name, payload, "relations")

    fallos += bool(run(["pron", "refresh", "--world", str(world), "--pythonpath", py]).returncode)
    fallos += bool(run(["pron", "check", "--world", str(world), "--pythonpath", py]).returncode)
    print(f"\nmundo sano: {world}  ·  comandos con error: {fallos}")

    for extra in spec.get("pron_extra", []):
        run(["pron", *extra, "--world", str(world), "--pythonpath", py])

    for rel in spec.get("relaciones_invalidas", []):
        print(f"\n== control negativo: {rel['type']} {rel['source']} -> {rel['target']} ({rel['porque']})")
        name = f"{rel['type']}--{rel['source']}--{rel['target']}"
        payload = {"title": name, "source_id": rel["source"], "target_id": rel["target"],
                   "relation_type": rel["type"], "condition": rel.get("condition", ""), "notes": ""}
        out = world / "relations" / f"{slug(name)}.md"
        creado = run([sys.executable, "-m", "sldb", "docs", "create", "--model", "RelationDoc", "-o", str(out),
                      "--name", name, "--store", store, "--pythonpath", py,
                      json.dumps(payload, ensure_ascii=False)])
        refresh = run(["pron", "refresh", "--world", str(world), "--pythonpath", py])
        check = run(["pron", "check", "--world", str(world), "--pythonpath", py])
        rechazada = bool(creado.returncode or refresh.returncode or check.returncode)
        print(f"  => {'rechazada' if rechazada else 'ACEPTADA (no se detectó)'}")
        if not creado.returncode:
            run([sys.executable, "-m", "sldb", "docs", "untrack", name, "--store", store, "--pythonpath", py])
            out.unlink(missing_ok=True)
            run(["pron", "refresh", "--world", str(world), "--pythonpath", py])
    if not conservar:
        shutil.rmtree(base, ignore_errors=True)
    return 1 if fallos else 0


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        sys.exit(2)
    sys.exit(montar(Path(args[0]), "--conservar" in sys.argv))
