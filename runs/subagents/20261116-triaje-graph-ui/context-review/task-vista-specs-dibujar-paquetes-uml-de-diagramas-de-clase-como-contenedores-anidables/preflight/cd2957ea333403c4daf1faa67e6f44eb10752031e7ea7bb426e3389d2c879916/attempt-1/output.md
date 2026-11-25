## REFORMULACION

Propósito: que la vista Specs (`frontends/mindmap/views/specs/notation/`) dibuje los paquetes UML de diagramas de clase como contenedores anidables con forma de carpeta con pestaña. Resultado: un spec `class` con `data.packages` se renderiza con clases y subpaquetes dentro a cualquier profundidad, relleno/trazo/ícono desde `node.style` y legibilidad (nada tapado, «Ver todo» cabe). Repo: `graph_ui`. Límites: no tocar `notation-deployment.mjs`, ni el contrato/notación de sldb, ni otros layouts, ni spec2viz.

## AMBIGUEDADES

1. "copia literal byte a byte de ../../sldb/tests/fixtures/specs/class.packages.yml": el input no reproduce el fixture; obligaría a inventar su contenido exacto.
2. "sincronizado con 'sldb notations sync --spec class.packages.yml --store .sldb'": no se indica ruta del store ni del CLI; obligaría a inventar el path.
3. "los e2e de clase existentes (R9, R10, compartimentos)": R9/R10 no están definidos; obligaría a inventar qué asertan.
4. "el run_dir que asigne el despacho (runs/subagents/<run_dir>/packages.png)": run_dir desconocido; obligaría a inventar el directorio.
5. "criterio G2" y "criterio R13": se citan como etiquetas sin definición textual; obligaría a inventar el criterio exacto.
6. "texto de al menos 10 px": no dice qué texto (títulos, clases, ambos).
7. "las clases no heredan el color del paquete": no define cómo se verifica (CSS computado, píxel).
8. "cambiar solo lo que falte": sin criterio de cuándo la ruta genérica "basta".

## DRY-RUN

Lecturas: task, `uml-class.yml`, fixture origen en sldb, `notation-view.js`, `notation.mjs`, `notation-layout.mjs`, `notation.css`, `notation-style.mjs`, e2e existentes. Cambios previstos: copiar fixture, ajustar contención genérica (`parentId`, `container`, `containerHeader`), añadir `.shape-package` en CSS, `tests/notation-packages.test.mjs`, e2e en `tests/e2e_notation_class.py`, captura PNG. Dependencias: `task-ir13…` completada, CLI sldb con notación sincronizada, Chromium. Validaciones futuras: `pytest -q -rs tests/e2e_notation_class.py`, `node --test tests/*.test.mjs`, revisión visual de la captura.

## FUTURO

El despacho asigna `run_dir` y autoriza el commit; un humano valida la captura y la paridad visual; si falta contrato en sldb, un nodo de nota por inbox detiene la tarea.
