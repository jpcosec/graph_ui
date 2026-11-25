---
sldb:
  by: agent
  at: '2026-11-25T21:11:56Z'
  authority: generated
  via: create_document
# review-<task>-<kind>-<n>
id: review-task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion-evidence-tests-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: evidence
# kind evidence only: tests | commit | atom | materialization | document | external
fact: tests
# kind evidence only: what the producer verified, one item per line
value: tests/e2e_notation_viewdoc.py
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion@sha256:174668b1a2cfd4e0b30ea802927996578fbb31bd37cbc258b8a28606fe4826c1
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: deskops-closeout
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: ''
input_sha256: ec60283c085aa264d93a06e2ab8fd7cca7c6331d29e548e70f3f3ef5f7cc87de
# preflight/bundle: SHA-256 of the input with the TaskDoc replaced by its __contract__ digest
contract_sha256: ''
output_sha256: ''
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'verified: tests tests/e2e_notation_viewdoc.py'
# ISO 8601 timestamp
created_at: '2026-11-25T21:11:55.500760+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-25T21:11:55.500760+00:00'
disposed_by: graph_ui
# e.g. system:deskops
tags: []
---

# Closeout evidence tests of task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion

## Summary

_Summarize what was reviewed and the evidence this receipt records._

closeout verify checked tests: tests/e2e_notation_viewdoc.py

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: verified: tests tests/e2e_notation_viewdoc.py
