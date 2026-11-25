REFORMULACION
Propósito: que la vista Specs dibuje los paquetes UML de un diagrama de clase como contenedores anidables (forma package con pestaña y título), con clases y subpaquetes dentro a cualquier profundidad y el estilo de node.style.
Resultado: un spec class con data.packages se ve en /specs/notation con cada paquete como contenedor, hijos dentro (dos niveles), relleno/trazo/ícono del paquete, clases sin heredar color y legibilidad (nada tapado, «Ver todo» dentro de la ventana).
Repo: graph_ui; superficie frontends/mindmap/views/specs/notation/ (notation-view.js, notation.mjs, notation-layout.mjs, notation.css), tests/e2e_notation_class.py, tests/notation-packages.test.mjs y el fixture tests/fixtures/notation-pilots/class.packages.yml.
Límites: no tocar notation-deployment.mjs ni el layout de otros diagramas; no cambiar contrato/notación en sldb (si falta algo, detenerse y nota por inbox); no spec2viz.

AMBIGUEDADES
1. «el fixture tests/fixtures/notation-pilots/class.packages.yml» frente al e2e existente, que carga «FIXTURES = ROOT / "tests" / "fixtures" / "notation-class"» y «FIXTURES.glob("*.yml")»: obligaría a inventar cómo el store del e2e incorpora un fixture de otra carpeta.
2. «sincronizado con 'sldb notations sync --spec class.packages.yml --store .sldb'» frente a «subprocess.run(["spec2viz", "diagram", "sync", ...])» del e2e actual: obligaría a decidir qué CLI sincroniza.
3. «Agregar la forma shape-package en notation.css: rectángulo con una pestaña arriba a la izquierda» cuando ya existen .glyph.shape-package, OUTLINES.package y SHAPE_INNER.package: obligaría a inventar qué falta (¿título en la pestaña o en una cabecera interior? «carpeta con pestaña UML y su título» / «la cabecera del paquete reserva su alto» no lo fija).
4. El Scope enumera «(notation-view.js, notation.mjs, notation-layout.mjs, notation.css)» sin notation-style.mjs, pero files: lo incluye y «la lógica que ya existe en notation-style.mjs»: obligaría a decidir si se modifica.

DRY-RUN
Lecturas: uml-class.yml, salida de resolve_view de class.packages.yml, notation.mjs/-layout.mjs/-style.mjs, fixture en sldb, e2e y tests node existentes. Cambios previstos: copiar el fixture, comprobar que buildScene ya trata draw nest como parentOf y que containerHeader reserva cabecera, ajustar CSS de shape-package, añadir el e2e y el test node. Dependencias: resolve_view con glyph package+container+links contains draw nest, CLI de sync, playwright/chromium, ELK. Validaciones futuras: pytest e2e_notation_class.py (nuevo + R9/R10 verdes), node --test tests/*.test.mjs, captura PNG y commit.

FUTURO
El despacho asigna el run_dir de la captura PNG; sldb confirma que resolve_view ya entrega glyph package/container; un humano revisa la captura; el cierre marca el Board.
