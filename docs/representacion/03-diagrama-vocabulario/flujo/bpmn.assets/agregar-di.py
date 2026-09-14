"""Agrega el diagrama (BPMN DI) a reserva.semantica.bpmn con posiciones fijadas a mano.

BPMN guarda el layout dentro del mismo archivo de intercambio (BPMNDiagram, §12): la posición de cada
figura es parte del formato, no de la herramienta.

Uso: python3 agregar-di.py reserva.semantica.bpmn > reserva.bpmn
"""
import sys
import xml.etree.ElementTree as ET

MODEL = "http://www.omg.org/spec/BPMN/20100524/MODEL"
DI, DC, OMGDI = "http://www.omg.org/spec/BPMN/20100524/DI", "http://www.omg.org/spec/DD/20100524/DC", "http://www.omg.org/spec/DD/20100524/DI"
for prefix, uri in (("", MODEL), ("bpmndi", DI), ("dc", DC), ("di", OMGDI)):
    ET.register_namespace(prefix, uri)

SIZE = {"startEvent": (36, 36), "endEvent": (36, 36), "intermediateCatchEvent": (36, 36),
        "task": (100, 80), "sendTask": (100, 80), "exclusiveGateway": (50, 50)}
CENTER = {  # centro de cada figura
    "quiere-cenar": (100, 80), "pedir-mesa": (220, 80), "respuesta-recibida": (880, 80), "cliente-listo": (1000, 80),
    "pedido-recibido": (220, 320), "buscar-mesa": (360, 320), "hay-mesa": (500, 320), "confirmar": (640, 320),
    "ofrecer": (640, 430), "confirmacion-enviada": (880, 320), "alternativa-enviada": (800, 430),
}
POOLS = {"pool-cliente": (0, 0, 1100, 160), "pool-restaurante": (0, 220, 1100, 270)}
LABELS = {  # rótulos externos que no caben debajo de su figura
    "respuesta-recibida": (820, 28, 60, 27), "hay-mesa": (462, 272, 76, 14), "alternativa-enviada": (740, 452, 120, 14),
}
WAYPOINTS = {  # solo los que no son una recta de centro a centro
    "sf-no": [(500, 345), (500, 430), (590, 430)],
    "mf-pedido": [(220, 120), (220, 302)],
    "mf-confirmacion": [(880, 302), (880, 98)],
    "mf-alternativa": [(800, 412), (800, 190), (872, 190), (872, 97)],
}

tree = ET.parse(sys.argv[1])
root = tree.getroot()
q = lambda tag, ns=MODEL: f"{{{ns}}}{tag}"
diagram = ET.SubElement(root, q("BPMNDiagram", DI), id="diagrama")
plane = ET.SubElement(diagram, q("BPMNPlane", DI), id="plano", bpmnElement="colaboracion")


def bounds(parent, x, y, w, h):
    ET.SubElement(parent, q("Bounds", DC), x=str(x), y=str(y), width=str(w), height=str(h))


for pool, (x, y, w, h) in POOLS.items():
    shape = ET.SubElement(plane, q("BPMNShape", DI), id=f"di-{pool}", bpmnElement=pool, isHorizontal="true")
    bounds(shape, x, y, w, h)
kinds = {}
for process in root.findall(q("process")):
    for element in process:
        tag = element.tag.split("}")[1]
        if tag in SIZE:
            kinds[element.get("id")] = tag
            (cx, cy), (w, h) = CENTER[element.get("id")], SIZE[tag]
            shape = ET.SubElement(plane, q("BPMNShape", DI), id=f"di-{element.get('id')}", bpmnElement=element.get("id"))
            bounds(shape, cx - w // 2, cy - h // 2, w, h)
            if element.get("id") in LABELS:
                bounds(ET.SubElement(shape, q("BPMNLabel", DI)), *LABELS[element.get("id")])
flows = [f for p in root.findall(q("process")) for f in p.findall(q("sequenceFlow"))]
flows += root.find(q("collaboration")).findall(q("messageFlow"))
for flow in flows:
    source, target = flow.get("sourceRef"), flow.get("targetRef")
    if flow.get("id") in WAYPOINTS:
        points = WAYPOINTS[flow.get("id")]
    else:
        (sx, sy), (tx, ty) = CENTER[source], CENTER[target]
        points = [(sx + SIZE[kinds[source]][0] // 2, sy), (tx - SIZE[kinds[target]][0] // 2, ty)]
    edge = ET.SubElement(plane, q("BPMNEdge", DI), id=f"di-{flow.get('id')}", bpmnElement=flow.get("id"))
    for x, y in points:
        ET.SubElement(edge, q("waypoint", OMGDI), x=str(x), y=str(y))
ET.indent(tree)
sys.stdout.write(ET.tostring(root, encoding="unicode", xml_declaration=True) + "\n")
