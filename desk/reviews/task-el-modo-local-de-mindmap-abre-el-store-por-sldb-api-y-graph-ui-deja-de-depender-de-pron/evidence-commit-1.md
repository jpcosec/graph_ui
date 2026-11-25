---
sldb:
  by: agent
  at: '2026-11-25T21:36:47Z'
  authority: generated
  via: create_document
# review-<task>-<kind>-<n>
id: review-task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron-evidence-commit-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: evidence
# kind evidence only: tests | commit | atom | materialization | document | external
fact: commit
# kind evidence only: what the producer verified, one item per line
value: 6a192d3ba8848c480bbf7e4107c5a8eedda105e7
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron@sha256:9801ff97a451fc0f80dee8b8855c27141cc72ee78b20040274539c122fe59b38
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: deskops-closeout
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: ''
input_sha256: 4e6b6ebe11725bd5acf351fe43fed1db46d6fde0c863fc5cc117f0c746d85149
# preflight/bundle: SHA-256 of the input with the TaskDoc replaced by its __contract__ digest
contract_sha256: ''
output_sha256: ''
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'verified: commit 6a192d3ba8848c480bbf7e4107c5a8eedda105e7'
# ISO 8601 timestamp
created_at: '2026-11-25T21:36:44.345301+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-25T21:36:44.345301+00:00'
disposed_by: graph_ui
# e.g. system:deskops
tags: []
---

# Closeout evidence commit of task-el-modo-local-de-mindmap-abre-el-store-por-sldb-api-y-graph-ui-deja-de-depender-de-pron

## Summary

_Summarize what was reviewed and the evidence this receipt records._

closeout verify checked commit: 6a192d3ba8848c480bbf7e4107c5a8eedda105e7

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: verified: commit 6a192d3ba8848c480bbf7e4107c5a8eedda105e7
