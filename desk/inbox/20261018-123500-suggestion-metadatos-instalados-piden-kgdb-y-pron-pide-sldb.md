---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: sldb
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-18T12:35:00'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-10-18T12:41:59'
---

# Metadatos instalados de graph-ui piden kgdb, y pron (dependencia de graph-ui) pide la dist `sldb`

_Describe the incoming message with enough evidence to triage._

Limpieza de instalaciones del 2026-10-18 (sldb-04): del entorno base de anaconda se desinstalaron
las dists `kgdb` 0.1.0 (resto; kgdb vive dentro de sldb) y `sldb` 0.1.0 (parásita, sobre el mismo
checkout que structuredLanguageDB). Queda solo `structuredLanguageDB` 0.1.12 editable.

`import mindmap.serve` sigue funcionando, pero `pip check` reporta:

1. `graph-ui 0.1.0 requires kgdb, which is not installed.` Tu pyproject.toml ya no pide kgdb;
   son los metadatos de una instalación editable anterior. Fix: `pip install -e .` en
   UIs/graph_ui con el python del entorno base.
2. `pron 1.0.0 requires sldb, which is not installed.` pron/pyproject.toml:15 declara `"sldb"`,
   el nombre viejo de la dist; la de PyPI es `structuredLanguageDB`. graph-ui depende de
   `pron>=1.0.0`, así que en un entorno limpio `pip install` de graph-ui buscaría `sldb` en PyPI.
   pron no tiene desk; el cambio es una línea en pron/pyproject.toml
   (`"sldb"` → `"structuredLanguageDB>=0.1.12"`) y conviene que lo haga quien lleve pron.

No se reinstaló nada por ti: la regla del coordinador es avisar, no reinstalar kgdb.
