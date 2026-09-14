"""Valida un VocabularyDoc (YAML) contra un mundo del manual (YAML de montar_mundo.py), sin graph_ui:

1. referencias: cada modelo, verbo y campo que el vocabulario nombra existe en el mundo;
2. aplicabilidad: el mundo tiene lo que applies_when exige (si no, la vista no se ofrece);
3. dibujo: qué símbolo le toca a cada documento y cuántos conectores salen;
4. reglas: se evalúan sobre los datos (las que el sustrato no hace cumplir);
5. herramientas: cada operación es compatible con los tipos de sus verbos.

Es un prototipo para probar la forma del documento, no una implementación.

Uso: python3 validar-vocabulario.py <vocabulario.yaml> <mundo.yaml>
"""
import re
import sys
from collections import Counter

import yaml

vocab = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
world = yaml.safe_load(open(sys.argv[2], encoding="utf-8"))
params = vocab.get("parameters", {})
sub = lambda text: re.sub(r"\{(\w+)\}", lambda m: str(params.get(m.group(1), m.group(0))), text) if isinstance(text, str) else text
fields = {m["name"]: {f["name"] for f in m["fields"]} for m in world["modelos"]}
verbs = {rt["name"]: rt for rt in world["tipos_de_relacion"]}
RELATION_FIELDS = {"notes", "condition", "relation_type", "title"}
docs = [dict(d, key=f"{d['model']}:{d['name']}") for d in world["documentos"]]
rels = world["relaciones"]
errors, notes = [], []


def need_model(model, where):
    if model not in fields:
        errors.append(f"{where}: el modelo {model} no existe en el mundo")
        return False
    return True


def need_field(model, field, where):
    if model in fields and field not in fields[model]:
        errors.append(f"{where}: {model} no tiene el campo {field}")


def need_verb(verb, where):
    if verb not in verbs:
        errors.append(f"{where}: el verbo {verb} no existe en el mundo")
        return False
    return True


def template_fields(text):
    return re.findall(r"\{(\w+)\}", text or "")


def predicate(where):
    """kind = "interface" and x != "y" -> [(campo, op, valor)]"""
    return [re.match(r'\s*(\w+)\s*(!=|=)\s*"([^"]*)"\s*$', part).groups() for part in sub(where).split(" and ")]


def matches(doc, where):
    if not where:
        return True
    return all((str(doc["payload"].get(f, "")) == v) == (op == "=") for f, op, v in predicate(where))


# 1. referencias ------------------------------------------------------------------------
for s in vocab.get("symbols", []):
    w = f"symbols.{s['id']}"
    if need_model(s["model"], w):
        for f, _, _ in predicate(s["where"]) if s.get("where") else []:
            need_field(s["model"], f, w)
        for f in template_fields(s.get("label")) + [c for c in s.get("compartments", [])]:
            need_field(s["model"], f, w)
for p in vocab.get("pseudo", []):
    need_model(p["points_to"]["model"], f"pseudo.{p['id']}") and need_field(p["points_to"]["model"], p["points_to"]["field"], f"pseudo.{p['id']}")
for c in vocab.get("containers", []):
    need_verb(c["relation"], "containers")
connector_model = {}
for c in vocab.get("connectors", []):
    w = f"connectors.{c['id']}"
    if "relations" in c:
        for v in c["relations"]:
            need_verb(v, w)
        for f in template_fields(c.get("label")):
            if f not in RELATION_FIELDS:
                errors.append(f"{w}: una RelationDoc no tiene el campo {f}")
    elif "reified" in c:
        r = c["reified"]
        connector_model[c["id"]] = r["model"]
        if need_model(r["model"], w):
            for role, v in r["roles"].items():
                if need_verb(v, w) and r["model"] not in verbs[v]["source_types"]:
                    errors.append(f"{w}: el rol {role} ({v}) no sale de {r['model']}")
                end = c.get("ends", {}).get(role, {})
                for f in template_fields(end.get("label")) + ([end["terminal"]["field"]] if "terminal" in end else []):
                    need_field(r["model"], f, f"{w}.ends.{role}")
    elif "element" in c:
        e = c["element"]
        connector_model[c["id"]] = e["model"]
        if need_model(e["model"], w):
            for v in (e["source"], e["target"]):
                need_verb(v, w)
            for f in template_fields(c.get("label")) + [x["field"] for x in (c.get("line"), c.get("target_end")) if isinstance(x, dict)]:
                need_field(e["model"], f, w)
layout = vocab.get("layout", {})
for axis in ("x", "y"):
    if axis in layout:
        need_model(layout[axis]["model"], f"layout.{axis}") and need_field(layout[axis]["model"], layout[axis]["field"], f"layout.{axis}")
for d in vocab.get("derived", []):
    if d["kind"] == "instance_marker":
        model, field = sub(d["instance_field"]).split(".")
        need_model(model, f"derived.{d['id']}") and need_field(model, field, f"derived.{d['id']}")

# 2. aplicabilidad ----------------------------------------------------------------------
req = vocab.get("applies_when", {})
missing = [m for m in req.get("models", []) if m not in fields] + [v for v in req.get("relations", []) if v not in verbs]
applicable = not missing

# 3. dibujo ------------------------------------------------------------------------------
drawn = Counter()
unsymboled = []
scope = vocab.get("scope", {})
in_scope = lambda d: not (scope.get("where") and d["model"] == scope["model"]) or matches(d, scope["where"])
if applicable:
    for d in docs:
        if not in_scope(d):
            continue
        candidates = [s for s in vocab.get("symbols", []) if s["model"] == d["model"]]
        chosen = next((s for s in candidates if matches(d, s.get("where"))), None)
        if chosen:
            drawn[f"símbolo {chosen['id']}"] += 1
        elif candidates:
            unsymboled.append(d["key"])
    out = {}
    for r in rels:
        out.setdefault(r["source"], {}).setdefault(r["type"], []).append(r["target"])
    for c in vocab.get("connectors", []):
        if "relations" in c:
            drawn[f"conector {c['id']}"] += sum(r["type"] in c["relations"] for r in rels)
        else:
            spec = c.get("reified") or c.get("element")
            roles = list(spec["roles"].values()) if "roles" in spec else [spec["source"], spec["target"]]
            complete = [d for d in docs if d["model"] == spec["model"] and all(out.get(d["key"], {}).get(v) for v in roles)]
            drawn[f"conector {c['id']} (colapsado desde {spec['model']})"] += len(complete)
    for c in vocab.get("containers", []):
        drawn[f"contención {c['relation']}"] += sum(r["type"] == c["relation"] for r in rels)

# 4. reglas ------------------------------------------------------------------------------
violations = []
if applicable:
    for rule in vocab.get("rules", []):
        (kind, arg), = rule.items()
        if kind in ("exactly_one", "at_most_one"):
            for d in docs:
                if d["model"] == arg["model"]:
                    n = len(out.get(d["key"], {}).get(arg["relation"], []))
                    if n > 1 or (kind == "exactly_one" and n == 0):
                        violations.append(f"{kind} {arg['relation']}: {d['key']} tiene {n}")
        elif kind == "no_outgoing":
            for d in docs:
                if d["model"] == arg["model"] and matches(d, arg.get("where")) and out.get(d["key"], {}).get(arg["relation"]):
                    violations.append(f"no_outgoing {arg['relation']}: {d['key']}")
        elif kind == "unique":
            seen = {}
            for d in docs:
                if d["model"] == arg["model"]:
                    group = tuple(out.get(d["key"], {}).get(arg["per"], [])) if arg.get("per") else ()
                    value = (group, d["payload"].get(arg["field"]))
                    if value in seen:
                        violations.append(f"unique {arg['field']}: {d['key']} repite {value[1]} de {seen[value]}")
                    seen.setdefault(value, d["key"])
        elif kind == "acyclic":
            graph = {}
            for r in rels:
                if r["type"] in arg:
                    graph.setdefault(r["source"], []).append(r["target"])
            def reach(a, b, seen=()):
                return any(n == b or (n not in seen and reach(n, b, seen + (n,))) for n in graph.get(a, []))
            violations += [f"acyclic: ciclo por {n}" for n in graph if reach(n, n)]

# 5. herramientas ------------------------------------------------------------------------
tool_report = []
for t in vocab.get("tools", []):
    typed = {}
    if "from" in t:
        typed["$from"] = t["from"] if isinstance(t["from"], str) else t["from"]["model"]
    if "to" in t:
        typed["$to"] = t["to"] if isinstance(t["to"], str) else t["to"]["model"]
    if "over" in t:
        typed["$element"] = connector_model.get(t["over"].split(".")[0])
    if scope.get("relation"):
        typed["$scope"] = scope["model"]
    problems = []
    for op in t["operation"]:
        if "create" in op:
            need_model(op["create"], f"tools.{t['id']}")
            for f in list(op.get("defaults", {})) + list(op.get("set", {})):
                need_field(op["create"], f, f"tools.{t['id']}")
            typed[op.get("as", "$created")] = op["create"]
        for verb_key in ("assert", "retract"):
            if verb_key in op and need_verb(op[verb_key], f"tools.{t['id']}"):
                rt = verbs[op[verb_key]]
                s = typed.get(op["source"])
                if s and s not in rt["source_types"]:
                    problems.append(f"{op[verb_key]} no admite {s} como origen")
                g = typed.get(op.get("target"))
                if op.get("target") and g and g not in rt["target_types"]:
                    problems.append(f"{op[verb_key]} no admite {g} como destino")
        if "change" in op:
            target_model = typed.get(op["of"])
            field = sub(op["change"])
            if "." in field:
                target_model, field = field.split(".")
            if target_model:
                need_field(target_model, field, f"tools.{t['id']}")
        if "reorder" in op:
            need_field(typed.get(op["of"]), op["reorder"], f"tools.{t['id']}")
    tool_report.append(f"{t['id']} ({t['gesture']}): " + ("compatible" if not problems else "INCOMPATIBLE: " + "; ".join(problems)))

print(f"vocabulario {vocab['name']} sobre {sys.argv[2].split('/')[-1]}")
print("referencias:", "ok" if not errors else f"{len(errors)} error(es)")
for e in errors:
    print("  ERROR", e)
print("aplicable:", "sí" if applicable else f"no (faltan {', '.join(missing)})")
if applicable:
    for k, n in drawn.items():
        print(f"  {k}: {n}")
    if unsymboled:
        print("  sin símbolo:", ", ".join(unsymboled))
    print("reglas:", "se cumplen" if not violations else f"{len(violations)} violación(es)")
    for v in violations:
        print("  VIOLA", v)
print("herramientas:" if applicable else "herramientas: no se evalúan (el vocabulario no aplica)")
for line in tool_report if applicable else []:
    print("  " + line)
