"""Dibuja el mapa IBIS desde el mundo con la convención de gIBIS y Compendium: pregunta (?), posición (!),
argumento a favor (+) o en contra (−); cada enlace con su tipo, las objeciones punteadas.

Uso: python3 ibis-desde-mundo.py vocabulario.mundo.yaml > vocabulario.ibis.dot
"""
import html
import sys
import textwrap

import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
COLOR = {"Issue": "#f5d76e", "Position": "#9fd3f5", "Argument": "#dddddd"}
print("digraph ibis {")
print('  rankdir=RL; node [fontname="Liberation Sans", fontsize=10, shape=plaintext]; edge [fontname="Liberation Sans", fontsize=9];')
for d in world["documentos"]:
    p, key = d["payload"], f"{d['model']}:{d['name']}"
    text = p.get("question") or p.get("statement") or p.get("claim")
    if d["model"] == "Argument":
        pro = any(r["source"] == key and r["type"] == "supports" for r in world["relaciones"])
        icon = "+" if pro else "−"
    else:
        icon = "?" if d["model"] == "Issue" else "!"
    extra = f"<br/><i>{p['status']}</i>" if d["model"] == "Position" else ""
    body = "<br/>".join(html.escape(line) for line in textwrap.wrap(text, 34))
    print(f'  "{d["name"]}" [label=<<table border="1" cellborder="0" cellpadding="4"><tr>'
          f'<td bgcolor="{COLOR[d["model"]]}"><b>{icon}</b></td><td align="left">{body}{extra}</td></tr></table>>];')
for r in world["relaciones"]:
    style = ", style=dashed" if r["type"] == "objects_to" else ""
    print(f'  "{r["source"].split(":", 1)[1]}" -> "{r["target"].split(":", 1)[1]}" [label="{r["type"]}"{style}];')
print("}")
