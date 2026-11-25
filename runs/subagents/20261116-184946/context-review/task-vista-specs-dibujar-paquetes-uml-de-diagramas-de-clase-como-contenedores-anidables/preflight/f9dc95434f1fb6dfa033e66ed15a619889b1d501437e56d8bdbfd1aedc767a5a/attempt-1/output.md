## REFORMULACION

Propósito: que la vista Specs (`/specs/notation`) de graph_ui represente paquetes UML de un spec `class` como contenedores anidables, no como cajas sueltas. Resultado: con `data.packages`, cada paquete se dibuja con contorno de carpeta/pestaña y título, contiene clases y subpaquetes a cualquier profundidad, respeta `node.style` y mantiene legibilidad (sin solapes, «Ver todo» encaja, texto ≥10 px). Repo: graph_ui; superficie: `frontends/mindmap/views/specs/notation/` y tests. Límites: no tocar `notation-deployment.mjs`, contrato/notación sldb, otros layouts ni spec2viz; sin `data.packages` no cambia nada. Nodo ejecutable, no agregado.

## AMBIGUEDADES

1. «el título en la pestaña o en una cabecera bajo la pestaña»: permite dos diseños; obliga a inventar cuál implementar si el e2e no lo fija.
2. «las mismas garantías de legibilidad que los otros diagramas»: no enumera todas; obliga a inventar umbrales fuera de G2, R13 y 10 px.
3. «commitear»: no indica rama, mensaje ni alcance; obliga a inventar política de commit.
4. «criterio G2» y «criterio R13»: se citan como nombres externos; obliga a inventar detalle si no se localizan.

## DRY-RUN

Lecturas: TaskDoc, `uml-class.yml`, fixture `class.packages.yml`, salida de `resolve_view`, `notation-view.js`, `notation.mjs`, `notation-layout.mjs`, `notation-style.mjs`, `notation.css`, e2e y tests existentes. Cambios previstos: copiar fixture a `tests/fixtures/notation-packages/`; escribir e2e de paquetes; ejecutarlo contra el código actual; corregir solo fallos: contorno `package` escalado a la caja del contenedor, cabecera con alto reservado, contención vía `buildScene`/`parentOf`; añadir test node si cambian `.mjs`; captura PNG. Dependencias: IR13/sldb `resolve_view` y `notations sync`, Chromium, store temporal. Validaciones futuras: pytest de `e2e_notation_class.py`, `node --test tests/*.test.mjs`, inspección de captura.

## FUTURO

El despacho asigna el `run_dir` para `packages.png`. sldb/IR13 debe proveer `resolve_view` y `sync` operativos. Un humano revisa la captura y decide el commit final si la política no está automatizada.
