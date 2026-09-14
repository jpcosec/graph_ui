"""Oráculo de semántica: analiza el modelo UVL con flamapy (lector UVL + SAT): si es satisfacible, cuántas
configuraciones válidas tiene, features núcleo y features muertas.

Uso: PYTHONPATH=<dir con flamapy-fm y flamapy-sat 2.6.0> python3 analizar-uvl.py graph-ui.uvl
"""
import sys

from flamapy.metamodels.fm_metamodel.transformations import UVLReader
from flamapy.metamodels.pysat_metamodel.operations import (
    PySATConfigurationsNumber,
    PySATCoreFeatures,
    PySATDeadFeatures,
    PySATSatisfiable,
)
from flamapy.metamodels.pysat_metamodel.transformations import FmToPysat

sat = FmToPysat(UVLReader(sys.argv[1]).transform()).transform()
for label, operation in (("satisfacible", PySATSatisfiable), ("configuraciones", PySATConfigurationsNumber),
                         ("núcleo", PySATCoreFeatures), ("muertas", PySATDeadFeatures)):
    op = operation()
    op.execute(sat)
    print(f"{label}: {op.get_result()}")
