---
sldb:
  by: agent
  at: '2026-11-16T16:12:48Z'
  authority: generated
  via: create_document
id: materialization-backend-y-vista-specs-de-mindmap-resuelven-con-sldb-api-notations
title: Backend y vista Specs de mindmap resuelven con sldb.api.notations
source_atoms:
- atom-la-vista-specs-dibuja-lo-que-resuelve-spec2viz
target_kind: code
target_identity: frontends/mindmap
validation:
- '! grep -rnE ''from spec2viz|import spec2viz'' frontends'
tags: []
---

# Backend y vista Specs de mindmap resuelven con sldb.api.notations

## Intent

frontends/mindmap obtiene vistas y documentos resueltos de sldb.api.notations (resolve_view, resolve_documents, ViewDoc de sldb) y la vista Specs solo los dibuja.
