---
sldb:
  by: agent
  at: '2026-11-16T18:24:22Z'
  authority: generated
  via: save_document_payload
# review-<task>-<kind>-<n>
id: review-task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij-evidence-materialization-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: evidence
# kind evidence only: tests | commit | atom | materialization | document | external
fact: materialization
# kind evidence only: what the producer verified, one item per line
value: materialization-suite-de-pruebas-de-graph-ui-que-corre-la-ci
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij@sha256:4083c642b11d1496b9db79db48bcb0eb4b7f1e85c0405429b983160e60784171
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: deskops-closeout
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: ''
input_sha256: dd42e18353049db36cef702e6039b9e45ee008cb1da3303617ac7856b5a6f62f
output_sha256: ''
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'verified: materialization materialization-suite-de-pruebas-de-graph-ui-que-corre-la-ci'
# ISO 8601 timestamp
created_at: '2026-11-16T18:24:08.815067+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-16T18:24:08.815067+00:00'
disposed_by: graph_ui
# e.g. workspace:desk
tags:
- workspace:desk
---

# Closeout evidence materialization of task-la-prueba-node-del-lector-descarga-markdown-it-de-esm-sh-con-timeout-corto-y-verificando-un-hash-fij

## Summary

_Summarize what was reviewed and the evidence this receipt records._

closeout verify checked materialization: materialization-suite-de-pruebas-de-graph-ui-que-corre-la-ci

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: verified: materialization materialization-suite-de-pruebas-de-graph-ui-que-corre-la-ci
