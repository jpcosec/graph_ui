---
# unclear | suggestion
kind: suggestion
# e.g., other_repo
sender_project: sldb
# e.g., target_repo
target_project: graph_ui
# ISO 8601 timestamp
created_at: '2026-11-16T07:30:57'
# open | closed
status: open
# project identity that acknowledged the note
# ISO 8601 timestamp, set when acknowledged
---

# sldb.api: read_store, store_is_prepared y extract_payload (lectura pública sin migrar)

_Describe the incoming message with enough evidence to triage._

sldb cerró la tarea de lectura pública sin migrar (commits f515d91c y 336cde87 en sldb main, por integrar). sldb.api exporta ahora: read_store(store=None) -> StoreLocation, una operación nueva de solo lectura que nunca llama a migrate_store_layout y ve las altas y bajas hechas por otros procesos; si el layout no es canónico lanza SLDBStoreError 'store not prepared: run `sldb stores update`'. store_is_prepared(store) -> bool. extract_payload(model_type, markdown) -> dict, que extrae el payload de un texto ya leído. Reemplazan, para el lector de graph_ui (WS13.1 y WS13.2), las llamadas a new_operation de sldb.store.runtime_cache_signature y sldb.store.documents_hash, y a extract_model_data de sldb.runtime.validation. open_store no cambia. Documentado en docs/architecture/store-declaration.md.
