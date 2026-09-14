"""Abre reserva.bpmn en el modelador de bpmn.io (bpmn-js) dentro de Chromium (Playwright): exporta el SVG
y pregunta a sus reglas de modelado qué conexión permitiría cada gesto de arrastre.

La fuente se nombra explícitamente (Liberation Sans): en el Chromium de Playwright de esta máquina las
familias genéricas (Arial, sans-serif) miden 0 y bpmn-js se cuelga al acomodar los rótulos.

Uso: python3 bpmn-js.py reserva.bpmn <node_modules con bpmn-js@18.28.0> reserva.svg
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

bpmn, modules, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
dist = modules / "bpmn-js" / "dist"
PAIRS = [  # (origen, destino): lo que un usuario arrastraría
    ("buscar-mesa", "hay-mesa"),          # mismo pool
    ("pedir-mesa", "pedido-recibido"),    # pools distintos
    ("pedir-mesa", "buscar-mesa"),        # pools distintos, a una tarea
    ("confirmar", "cliente-listo"),       # pools distintos, a un fin
    ("quiere-cenar", "pedir-mesa"),       # mismo pool
    ("cliente-listo", "quiere-cenar"),    # desde un fin
]
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.set_content('<html><head></head><body><div id="c" style="width:1200px;height:600px"></div></body></html>')
    page.add_style_tag(path=str(dist / "assets" / "diagram-js.css"))
    page.add_style_tag(path=str(dist / "assets" / "bpmn-js.css"))
    page.add_script_tag(path=str(dist / "bpmn-modeler.production.min.js"))
    result = page.evaluate(
        """async ([xml, pairs]) => {
            const font = {fontFamily: 'Liberation Sans', fontSize: 12};
            const modeler = new BpmnJS({container: '#c', textRenderer: {defaultStyle: font, externalStyle: {...font, fontSize: 11}}});
            const {warnings} = await modeler.importXML(xml);
            const registry = modeler.get('elementRegistry'), rules = modeler.get('bpmnRules');
            const verdicts = pairs.map(([s, t]) => [s, t, rules.canConnect(registry.get(s), registry.get(t))]);
            const {svg} = await modeler.saveSVG();
            return {warnings: warnings.map(w => w.message), verdicts, svg};
        }""",
        [bpmn.read_text(encoding="utf-8"), PAIRS],
    )
    browser.close()
out.write_text(result["svg"], encoding="utf-8")
print("advertencias de importación:", result["warnings"], "· errores JS:", errors)
for source, target, verdict in result["verdicts"]:
    print(f"{source} -> {target}: {json.dumps(verdict)}")
