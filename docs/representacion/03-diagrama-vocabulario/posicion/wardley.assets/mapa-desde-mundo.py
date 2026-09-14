"""Dibuja el mapa de Wardley desde el mundo: x = maturity, y = visibility, líneas = needs.

No hay un renderer de Wardley instalado; este script es el oráculo. Replica las convenciones de
OnlineWardleyMaps: límites de etapa en 0.175, 0.40 y 0.70 del ancho (EvoOffsets custom 3.5,
product 8, commodity 14 sobre 20), evolución como flecha roja punteada.

Uso: python3 mapa-desde-mundo.py tea-shop.mundo.yaml tea-shop.svg
"""
import sys

import matplotlib

matplotlib.use("svg")
import matplotlib.pyplot as plt
import yaml

world = yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
docs = {f"{d['model']}:{d['name']}": d for d in world["documentos"]}
pos = {k: (d["payload"]["maturity"], d["payload"]["visibility"]) for k, d in docs.items()}

plt.rcParams["svg.hashsalt"] = "wardley"
fig, ax = plt.subplots(figsize=(8, 7))
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.set_xticks([])
ax.set_yticks([])
for boundary in (0.175, 0.40, 0.70):
    ax.axvline(boundary, color="0.6", linestyle="--", linewidth=0.8)
for x, label in ((0.0875, "Genesis"), (0.2875, "Custom Built"), (0.55, "Product\n(+rental)"), (0.85, "Commodity\n(+utility)")):
    ax.text(x, -0.03, label, ha="center", va="top", fontsize=9)
ax.set_xlabel("Evolución (maturity)", labelpad=40)
ax.set_ylabel("Cadena de valor (visibility)")
ax.set_title(f"{world.get('titulo', 'Mapa de Wardley')} — dibujado desde el mundo pron")

for rel in world["relaciones"]:
    (x1, y1), (x2, y2) = pos[rel["source"]], pos[rel["target"]]
    if rel["type"] == "needs":
        ax.plot([x1, x2], [y1, y2], color="0.35", linewidth=1, zorder=1)
        if rel.get("notes"):
            ax.text((x1 + x2) / 2, (y1 + y2) / 2, rel["notes"], fontsize=8, style="italic", ha="left")
    elif rel["type"] == "evolves_to":
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1), zorder=1,
                    arrowprops=dict(arrowstyle="->", color="tab:red", linestyle="dashed"))

for key, doc in docs.items():
    x, y = pos[key]
    p = doc["payload"]
    if doc["model"] == "UserNeed":
        ax.text(x, y, p["name"], ha="center", va="center", fontsize=10, weight="bold", zorder=3,
                bbox=dict(boxstyle="round", facecolor="white", edgecolor="none"))
        continue
    evolved = any(r["type"] == "evolves_to" and r["target"] == key for r in world["relaciones"])
    ax.scatter([x], [y], s=45, facecolor="white", edgecolor="tab:red" if evolved else "black", zorder=3)
    ax.text(x + 0.015, y + 0.012, p["name"], fontsize=9, zorder=3, color="tab:red" if evolved else "black")
    if p.get("evolving_to"):
        target = p["evolving_to"]
        ax.annotate("", xy=(target, y), xytext=(x, y), zorder=2,
                    arrowprops=dict(arrowstyle="->", color="tab:red", linestyle="dashed"))
        ax.scatter([target], [y], s=45, facecolor="white", edgecolor="tab:red", zorder=3)

fig.tight_layout()
fig.savefig(sys.argv[2], metadata={"Date": None})
