---
sldb:
  by: agent
  at: '2026-11-25T21:12:01Z'
  authority: generated
  via: create_document
# review-<task>-<kind>-<n>
id: review-task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion-evidence-commit-1
# preflight | bundle | reproduction | goldens | owner | node | evidence
kind: evidence
# kind evidence only: tests | commit | atom | materialization | document | external
fact: commit
# kind evidence only: what the producer verified, one item per line
value: eb722129796ba0139e09ad94636a437ce2dae2f2
# doc:<Model>:<id> or empty for reviews of plan nodes
subject: doc:TaskCodeDoc:task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion@sha256:174668b1a2cfd4e0b30ea802927996578fbb31bd37cbc258b8a28606fe4826c1
# <plan>/dag.yaml#node:<ID>; empty when subject names a document
subject_ref: ''
# RuntimeProfileDoc name or "human"
engine: deskops-closeout
actor: graph_ui
# Run evidence directory under runs/, relative to the project root
run_dir: ''
input_sha256: 34616df5cd97e90ebc1f9240d4101b9c6ae2e2395b006566981b47d8914746f7
# preflight/bundle: SHA-256 of the input with the TaskDoc replaced by its __contract__ digest
contract_sha256: ''
output_sha256: ''
# pending | accepted | rejected | incomplete
verdict: accepted
reason: 'verified: commit eb722129796ba0139e09ad94636a437ce2dae2f2'
# ISO 8601 timestamp
created_at: '2026-11-25T21:11:55.500760+00:00'
# ISO 8601 timestamp, empty while pending
disposed_at: '2026-11-25T21:11:55.500760+00:00'
disposed_by: graph_ui
# e.g. system:deskops
tags: []
---

# Closeout evidence commit of task-g-c-la-vista-de-notacion-lista-tambien-los-viewdoc-del-store-y-dibuja-uno-con-su-notacion

## Summary

_Summarize what was reviewed and the evidence this receipt records._

closeout verify checked commit: eb722129796ba0139e09ad94636a437ce2dae2f2

## Disposition

_Record the verdict rationale and who disposed of the review._

Verdict accepted: verified: commit eb722129796ba0139e09ad94636a437ce2dae2f2
