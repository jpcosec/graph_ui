## REFORMULACION
Propósito: que la vista Specs (`/specs/notation`, repo graph_ui) dibuje los paquetes UML de un spec class (`data.packages`) como contenedores anidables, no como cajas sueltas. Resultado: cada paquete con contorno `package`, título en pestaña/cabecera con alto reservado, clases y subpaquetes dentro a cualquier profundidad, relleno/trazo/ícono de `node.style`, legibilidad ≥10 px y «Ver todo» encuadrado. Límites: solo `frontends/mindmap/views/specs/notation/` (view.js, notation.mjs, layout.mjs, style.mjs, css), fixture `tests/fixtures/notation-packages/class.packages.yml`, e2e en `tests/e2e_notation_class.py` y test node nuevo; fuera: `notation-deployment.mjs`, contrato/notación sldb, otros diagramas, spec2viz. Depende de IR13.

## AMBIGUEDADES
1. "core > billing > Invoice, Payment; core > identity > User; shared > AuditLog: dos niveles" — «dos niveles» no cuadra con core>billing>Invoice (tres); obligaría a inventar la profundidad real esperada.
2. "Si al correr el e2e nuevo alguna de estas cosas ya funciona, no se toca" — «ya funciona» sin criterio; obligaría a inventar qué condición cuenta como funcionar.
3. "(e) el estilo computado del contorno de billing e identity tiene el fill de su kind" — no se cita el valor de `style.kinds` ni el color esperado; obligaría a inventar la correspondencia kind→fill.
4. "Guardar una captura PNG ... con el run_dir que asigne el despacho, y commitear" — no hay rama, mensaje ni alcance de commit; obligaría a inventar convención de commit.
5. "tras «Ver todo» todo el diagrama queda dentro de window.innerWidth x window.innerHeight" — sin tolerancia/margen; obligaría a inventar el umbral de «dentro».

## DRY-RUN
Lecturas: `../../sldb/src/sldb/notations/builtin/uml-class.yml`, salida `sldb.api.notations.resolve_view` de class.packages.yml, fixture origen en sldb, los cinco archivos de vista, `tests/e2e_notation_class.py`, `tests/e2e_notation_legibility.py`. Cambios previstos: copiar fixture byte a byte; añadir constante `PACKAGES` y caso e2e de paquetes (a–e); crear `tests/notation-packages.test.mjs`; ajustar `OUTLINES.package`/`containerHeader`/render de cabecera de contenedor y CSS si el e2e falla. Dependencias: tarea IR13, CLI `sldb`, Chromium/playwright, node. Validaciones futuras (no ejecutadas): `pytest tests/e2e_notation_class.py`, `node --test tests/*.test.mjs`, captura PNG.

## FUTURO
El despacho asigna `run_dir`; el ritual de closeout produce el commit atómico y actualiza el Board; un humano decide detener la tarea y notificar a sldb por inbox si falta contrato.
