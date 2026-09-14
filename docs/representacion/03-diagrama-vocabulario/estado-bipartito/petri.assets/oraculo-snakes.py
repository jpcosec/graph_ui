"""Oráculo de ejecución: construye la red desde mesas.pnml con SNAKES y calcula su grafo de alcanzabilidad.

Uso: PYTHONPATH=<dir con snakes==0.9.33> python3 oraculo-snakes.py mesas.pnml
"""
import sys
import xml.etree.ElementTree as ET

from snakes.nets import MultiArc, PetriNet, Place, StateGraph, Transition, Value, dot

NS = {"p": "http://www.pnml.org/version-2009/grammar/pnml"}
page = ET.parse(sys.argv[1]).getroot().find("p:net/p:page", NS)
net = PetriNet("mesas")
places = []
for pl in page.findall("p:place", NS):
    marking = pl.find("p:initialMarking/p:text", NS)
    net.add_place(Place(pl.get("id"), [dot] * (int(marking.text) if marking is not None else 0)))
    places.append(pl.get("id"))
for tr in page.findall("p:transition", NS):
    net.add_transition(Transition(tr.get("id")))
for arc in page.findall("p:arc", NS):
    weight = arc.find("p:inscription/p:text", NS)
    label = MultiArc([Value(dot)] * int(weight.text)) if weight is not None else Value(dot)
    source, target = arc.get("source"), arc.get("target")
    if net.has_place(source):
        net.add_input(source, target, label)
    else:
        net.add_output(target, source, label)

graph = StateGraph(net)
graph.build()
markings = []
for state in graph:
    marking = graph[state]
    vector = tuple(len(marking(p)) if p in marking else 0 for p in places)
    markings.append((vector, len(list(graph.successors(state))) == 0))
print("lugares:", ", ".join(places))
for vector, dead in sorted(markings):
    print(vector, "MUERTO" if dead else "")
print(f"{len(markings)} marcados alcanzables, {sum(d for _, d in markings)} sin transiciones habilitadas")
