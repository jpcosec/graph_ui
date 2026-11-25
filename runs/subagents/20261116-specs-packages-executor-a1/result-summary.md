# Ejecutor intento 1: paquetes UML como contenedores en la vista Specs

## Línea base (e2e nuevo contra el código actual, antes de tocar nada)
- Fixture: tests/fixtures/notation-packages/class.packages.yml, copia de ../../sldb/tests/fixtures/specs/class.packages.yml.
  `git hash-object` = e6b4535a1162fe42b36f6c84547d93163f36509a = blob de sldb origin/main (d118e53a).
- Primera versión del e2e, (a)-(e) tal cual el contrato: **pasaba** contra el código actual (rc 0): la contención por
  buildScene/parentOf, la cabecera reservada (containerHeader), R13, texto >= 10 px y el fill del kind ya funcionaban.
- Pero no medía la forma dibujada. Se agregó al criterio G2 la geometría real del contorno (muestreado en pantalla):
  la carpeta envuelve toda la caja, el título va en la pestaña o bajo ella y los hijos empiezan dentro del cuerpo.
  Con eso la línea base **falla** (baseline-e2e-packages.log, rc 1):
  `AssertionError: ('core', 448.9, ...) assert 448.9 >= 466.1 - 0.5`: OUTLINES.package se estira 0..100, la pestaña mide
  el 14 % del alto del contenedor y el cuerpo de core empieza 17 px por debajo de la parte de arriba de billing.
- Por «si ya funciona, no se toca» solo se corrigió eso: el contorno del paquete contenedor.

## Cambios
- notation-style.mjs: nueva `containerOutline(shape, {width, height, header})`: para `package` devuelve el path en píxeles
  de la caja (viewBox 0 0 W H): pestaña = de x=0 al borde derecho del título y de y=0 a su borde de abajo (la cabecera que
  reservó elkGraph, en el padding o como nodo título); cuerpo = el resto a todo lo ancho. null para otras formas o sin cabecera.
- notation-view.js: `layoutGraph` pasa width/height del nodo en data; `GlyphNode` los da a `Glyph` (prop `size`); `Glyph`
  dibuja ese contorno (svg.glyph-outline.is-container-outline) en un contenedor package con cabecera, si no el ShapeOutline de siempre.
- notation.css: `.glyph.shape-package.is-container > .glyph-head{border-bottom:0;justify-content:center}` (la pestaña
  sustituye la raya de cabecera de los otros contenedores).
- Sin cambios en notation.mjs ni notation-layout.mjs (la contención, la cabecera y el layout ya funcionaban), ni en
  notation-deployment.mjs, ni en sldb.
- Tests: tests/e2e_notation_class.py (PACKAGES, fixture `packages_store` con `sldb notations sync`, test
  `test_packages_nest_their_classes_with_a_readable_tab_and_their_kind_style`, (a)-(e) + geometría de la carpeta);
  tests/notation-packages.test.mjs (3 pruebas sobre la salida real de `sldb notations view` del fixture: buildScene,
  elkGraph, containerOutline); fixture copiado.
- (e): el fill esperado sale de la vista resuelta por sldb (`style.source.fill == "spec"`), y para billing se compara además
  con el literal light del kind del fixture (#fff1c2); identity usa el token `database-fill`, resuelto por sldb a #dbebf4.

## Validación (venv /dev/shm/venv-pkg-e1, systemd-run MemoryMax=3G, TMPDIR=/dev/shm, sin -n)
| comando | rc | resultado |
|---|---|---|
| pytest -q -rs tests/e2e_notation_class.py | 0 | 4 passed, 0 skipped |
| node --test tests/*.test.mjs | 0 | 161 pass, 0 fail, 0 skipped |
| pytest tests/e2e_notation_legibility.py | 0 | 3 passed |
| pytest tests/e2e_mindmap_notation.py | 0 | 2 passed |
| pytest tests/test_mindmap_notation.py | 0 | 5 passed |
| pytest tests/test_projection_views.py | 0 | 11 passed |
Logs: validation.log, node-tests.log. Regresión contra HEAD: no hubo ningún fallo, así que no hubo nada que comparar con la
copia de HEAD (/dev/shm/pkg-e1-head se extrajo y se borró).

## Navegador sobre el store real
Copia de .sldb del repo en /dev/shm/pkg-e1-real + `sldb notations sync --spec class.packages.yml` (rc 0; avisa un
`spec-sync/edge-error` previo del store del repo: relation type `has_field` sin `sldb edges init`, ajeno a la tarea).
serve.py bajo systemd-run MemoryMax=3G (PID 2887770, terminado por PID). 3 cargas de /specs/notation con el spec:
1.817 s, 1.019 s, 0.989 s; 0 errores de consola, 0 pageerror (browser-verify.json). packages.png: Core con Billing
(amarillo, Payment e Invoice) e Identity (azul, User), Shared con AuditLog; cada paquete con su pestaña y título visibles.

## Desvíos / observaciones
- El e2e del contrato tal cual pasaba sin cambios; se reforzó G2 con la forma dibujada (ver línea base).
- La arista de dependencia AuditLog -> User da un rodeo largo (ruteo de ELK); fuera del alcance, no se tocó.
- Sin commit (rol ejecutor).

EXECUTOR DONE: contorno de paquete UML de contenedor en píxeles con pestaña = cabecera reservada; e2e y node verdes.
Archivos tocados:
- frontends/mindmap/views/specs/notation/notation-style.mjs
- frontends/mindmap/views/specs/notation/notation-view.js
- frontends/mindmap/views/specs/notation/notation.css
- tests/e2e_notation_class.py
- tests/notation-packages.test.mjs
- tests/fixtures/notation-packages/class.packages.yml
