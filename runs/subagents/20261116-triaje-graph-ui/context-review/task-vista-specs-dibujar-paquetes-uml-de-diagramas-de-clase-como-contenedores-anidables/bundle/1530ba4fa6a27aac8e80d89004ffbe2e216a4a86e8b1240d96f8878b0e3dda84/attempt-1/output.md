## REFORMULACION

**Propósito:** que la vista Specs (`/specs/notation`, graph_ui) dibuje los paquetes UML de un spec `class` como contenedores anidables, según el contrato ya resuelto en `sldb/src/sldb/notations/builtin/uml-class.yml` (glifo `package`, `data.container`, links `contains` con `draw: nest`).

**Resultado:** un spec con `data.packages` se ve con forma de carpeta con pestaña y título en cabecera de alto reservado, clases y subpaquetes dentro a cualquier profundidad, relleno/trazo/ícono de `node.style` del paquete sin heredarse a las clases, y legibilidad (nada tapado; «Ver todo» entra en ventana; texto ≥10 px).

**Repo:** graph_ui — solo `frontends/mindmap/views/specs/notation/{notation-view.js,notation.mjs,notation-layout.mjs,notation-style.mjs,notation.css}`, más `tests/e2e_notation_class.py`, `tests/notation-packages.test.mjs` y `tests/fixtures/notation-packages/class.packages.yml`.

**Límites:** no tocar `notation-deployment.mjs`, ni el contrato/notación en sldb, ni layouts de otros tipos, ni spec2viz; sin `data.packages` los e2e R9/R10/compartimentos deben seguir verdes.

## AMBIGUEDADES

1. «Prueba node nueva en tests/notation-packages.test.mjs, obligatoria si cambia notation.mjs, notation-layout.mjs o notation-style.mjs» — no dice qué hacer si el e2e pasa sin tocar esos módulos; obligaría a inventar si se crea igual o se omite.
2. «Guardar una captura PNG … con el run_dir que asigne el despacho, y commitear» — el input no fija run_dir, rama ni mensaje de commit; inventar la ruta y la política de commit.
3. «copia literal byte a byte de ../../sldb/tests/fixtures/specs/class.packages.yml» — el fichero origen no está en el bundle; sin acceso habría que inventar su contenido (violaría la pill).
4. «sincroniza con 'sldb notations sync --spec class.packages.yml --store .sldb'» frente a los e2e existentes que usan `sldb stores init` + `spec2viz diagram sync`; inventar cuál CLI y orden son válidos.

## DRY-RUN

**Lecturas:** los cinco módulos de la vista, los dos e2e, `uml-class.yml`, fixture origen en sldb, pills y átomos.
**Cambios previstos:** contorno `OUTLINES.package` escalado a la caja del contenedor, cabecera vía `containerHeader` con alto reservado, contención por `buildScene/parentOf`; e2e de paquetes con store temporal; test node del layout.
**Dependencias:** tarea IR13 (migración a `sldb api.notations.resolve_view`) resuelta.
**Validaciones futuras:** `python -m pytest -q -rs tests/e2e_notation_class.py` y `node --test tests/*.test.mjs`, más inspección de la captura.

## FUTURO

El despacho asigna `run_dir`; un humano revisa la captura y el commit; si falta algo en el contrato de sldb, se abre nota por inbox y la tarea se detiene.
