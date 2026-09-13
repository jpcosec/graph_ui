# graph_ui

## Este repo está en transformación profunda — verifica, no asumas

`graph_ui` lleva varios pivotes de arquitectura sin terminar de limpiar los
anteriores. Antes de actuar sobre algo que leíste en un doc, un atom o un
comentario, comprueba contra el código y `git log` que sigue vigente. Señales
concretas de que esto no es paranoia:

- `docs/how-it-works.md` describe como arquitectura activa un editor
  React/Vite (`apps/review-workbench/`) montando `HumBodyPage` por defecto.
  Eso está retirado; el README raíz dice la verdad (`frontends/mindmap/`) pero
  el doc interno no se actualizó.
- `deskops doctor --root .` reporta 250+ documentos de `desk/atoms/` sin
  trackear, casi todos describiendo esa misma arquitectura React abandonada
  (`EditorEngine`, `L1App`, `L2Canvas`, `GraphCanvas`, `ReviewWorkbenchSPA`,
  `HumBodyPage`...). El `desk/` de este repo no se sincronizó cuando el
  desarrollo pivotó.
- Coexisten identidades sedimentadas sin marcar como muertas en el propio
  árbol: `apps/review-workbench/` (editor React anterior, referencia),
  `frontends/flow_editor/` (editor HCP del que se adaptó Mindmap),
  `legacy/`, y `src/` (contratos Python de un editor de grafos genérico,
  anterior al mindmap SLDB). Ninguno es el desarrollo activo salvo que el
  código que estés tocando lo confirme.
- READMEs que dicen "frozen" en este ecosistema no implican inactividad: por
  ejemplo `tools/sldb/README.md` se declara congelado pero sigue recibiendo
  fixes reales. Verifica con `git log` del repo en cuestión, no con el banner.

Regla práctica: cuando un doc, atom o pill contradiga lo que ves en el código
o en `git log --oneline`, el código gana. Si vas a apoyarte en la
contradicción para decidir algo importante, dilo explícitamente antes de
seguir.

## Qué es esto ahora mismo

Editor visual de una KB SLDB. El desarrollo activo es
`frontends/mindmap/`: servidor Python stdlib (`serve.py`, sin build), UI
React/htm cargada por CDN (sin bundler). El frontend está ortogonalizado en
tres niveles, direccionables como `/{faceta}/{vista}`: `app.js` + `shell/`
(topbar, router, diálogos de shell, tema), `source/` (facetas
documents/models/draft y las mutaciones reales) y `views/{faceta}/{vista}/`
(una vista por par, registrada en `shell/registry.js`). El tema vive en
`skins/` (solo tokens; `styles/` y el CSS de cada vista no pueden tener hex).
Lee y escribe contra un store SLDB real (`.sldb/`), nunca contra un mock.

```sh
python3 frontends/mindmap/serve.py 8088
```

Ver `README.md` y `frontends/mindmap/README.md` para el detalle de uso; ambos
están al día. `docs/mindmap-spec.md` documenta la intención de producto pero
puede ir por delante o por detrás del código — contrástalo.

## Este repo usa deskops — orienta con el CLI, no leyendo archivos sueltos

Hay `desk/` en la raíz, así que aplica el flujo de deskops: spec → atoms →
tasks/pills → código. No edites a mano documentos modelados de `desk/`.

```sh
deskops status --root .
deskops list tasks --root .       # o desk/tasks/Board.md
deskops doctor --root .           # útil para ver qué tan desincronizado está desk/ hoy
```

`deskops` está instalado en modo **editable, global para esta máquina**,
apuntando directo a `tools/deskops/deskops/`. Un cambio ahí no es local a
este repo: se refleja de inmediato en cualquier otro proyecto que importe
`deskops` (varios repos hermanos bajo `~/proyectos/` lo usan, algunos con
cientos de documentos dependientes de su comportamiento). Si vas a tocar
código de `deskops` desde una sesión de `graph_ui`, tenlo presente antes de
commitear.

## El motor debajo: SLDB, no reinventado aquí

Este repo no implementa persistencia de documentos ni grafo propios. SLDB
(`tools/sldb`, `sldb`/`python -m sldb` en el CLI) es la capa de datos: modelos
`StructuredNLDoc`, Markdown reversible, store `.sldb/` con hashes de
integridad. kgdb es la capa de grafo tipado sobre eso. `graph_ui` es
proyección visual, no una tercera fuente de verdad — si algo que hace la UI
requiere inventar semántica que no vive en SLDB, es una señal de alarma, no
una feature.

## Tests reales, sin mocks

```sh
python3 -m pytest tests -q
node --test tests/mindmap-model.test.mjs
python3 -m pytest tests/e2e_mindmap_*.py -q   # Playwright, requiere navegador
```

Los tests Python levantan servidores y stores SLDB reales en directorios
temporales; los E2E manejan un navegador real contra el servidor real. Si algo
no se puede probar así, decláralo explícitamente en vez de simularlo.
