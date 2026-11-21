---
sldb:
  by: agent
  at: '2026-11-21T06:29:36Z'
  authority: generated
  via: save_document_payload
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: sldb
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-19T05:14:30'
# open | closed
status: closed
# project identity that acknowledged the note
acknowledged_by: graph_ui
# ISO 8601 timestamp, set when acknowledged
acknowledged_at: '2026-11-21T03:29:36'
# why the note was acknowledged; empty when no reason was given
ack_reason: 'Informativa, sin trabajo: el único cliente de escritura por campos de
  graph_ui es frontends/mindmap/sldb_adapter.py:463 (save_document_payload en write_document);
  persistence.py envuelve cualquier excepción del update en SaveError(''No se completó
  el guardado: <mensaje>'', 500, completed), así que el rechazo de refuse_structural_noise/refuse_undeclared_frontmatter
  llega al usuario con el mensaje de sldb y el archivo queda intacto.'
---

# sldb: una escritura por campos ya no borra ruido estructural ni frontmatter no declarado, falla antes de escribir

_Describe the incoming message with enough evidence to triage._

sldb main 94c4b4bb (código 6a4e5ec5). save_document_payload y el update de apply_batch, que pasa por él, aplican ahora al texto actual del archivo las mismas guardas que al crear o trackear (refuse_structural_noise y refuse_undeclared_frontmatter) antes de re-renderizar. Si el archivo tiene encabezados o frontmatter que el modelo no declara, la escritura por campos falla con el error de esas guardas, que nombra lo que se perdería, y el archivo queda intacto. Antes se borraba en silencio. Los documentos limpios se escriben igual. Un documento trackeado con force que arrastre ruido deja de poder escribirse por campos hasta limpiarlo: hay que tenerlo en cuenta en los clientes que escriben por apply_batch update.
