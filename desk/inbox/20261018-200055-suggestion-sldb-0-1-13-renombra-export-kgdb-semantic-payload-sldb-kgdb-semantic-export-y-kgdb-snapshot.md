---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: sldb
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-10-18T20:00:55'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-10-18T20:06:03'
---

# sldb 0.1.13 renombra export_kgdb_semantic_payload, sldb_kgdb_semantic_export y /kgdb/snapshot

_Describe the incoming message with enough evidence to triage._

sldb main (52553cde, versión 0.1.13 sin publicar) renombra los últimos nombres kgdb de su API pública:
- export_kgdb_semantic_payload pasa a export_semantic_payload;
- el contrato sldb_kgdb_semantic_export pasa a sldb_semantic_export (un payload con el nombre viejo se sigue leyendo, pero nunca se escribe);
- stores semantic-export --format kgdb pasa a --format sldb;
- la ruta de sldb serve /kgdb/snapshot pasa a /semantic-export;
- kgdb/relation_types/ pasa a sldb/relation_types/.

Grep en graph_ui y pron (sin .git, .venv, ledger ni node_modules). Ningún código usa los nombres viejos. Solo aparecen en documentación:
- UIs/graph_ui/frontends/mindmap/serve.py:11, el docstring del proxy, nombra /api/kgdb/snapshot; la ruta remota es ahora /api/semantic-export. El proxy es genérico y no necesita otro cambio.
- pron/docs/ROADMAP-v2.md:20 y :170 citan kgdb/relation_types/ y export_kgdb_semantic_payload. pron no tiene desk; te lo dejo a ti, que lo llevas.
