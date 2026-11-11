---
id: task-el-job-mindmap-del-ci-salta-3-tests-de-test-review-workbench-porque-no-corre-npm-ci
status: deferred
summary: ''
tags:
- workspace:desk
- artifact:task
- source:inbox
current_node: ''
history: []
references: []
depends_on: []
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# El job mindmap del CI salta 3 tests de test_review_workbench porque no corre npm ci

## Rationale

_Explain why this task exists or the business driver behind it._

Promoted from the inbox note `desk/inbox/inbox-note-el-job-mindmap-del-ci-salta-3-tests-de-test-review-workbench-porque-no-corre-npm-ci.md`.

## Goal

_Describe the concrete result this task must produce._

Triage and resolve the inbox message promoted from `desk/inbox/inbox-note-el-job-mindmap-del-ci-salta-3-tests-de-test-review-workbench-porque-no-corre-npm-ci.md`.

## Scope

_State what is in scope and what is out of scope._

_Describe the incoming message with enough evidence to triage._

Pendiente de la integración deskops-ui. En el job mindmap de .github/workflows/ci.yml, test_review_workbench tiene 3 tests en skip porque apps/review-workbench no tiene node_modules (el job no corre npm ci). Corren solo si npm ci corrió antes en el mismo clon. La regla del dueño es sin skip: o el job mindmap corre npm ci en apps/review-workbench antes de pytest, o esos 3 tests pasan al job review-workbench o al e2e, que sí lo corren. Hecho cuando el CI de master no tiene skips en test_review_workbench.

## Implementation Path

_Outline the expected implementation route or affected surface._

To be defined when the task is promoted.

## Validation

_List the checks required before this task can close._

- 

## Done When

_Name the observable condition that makes the task complete._

The message is resolved, answered, or promoted into active work.
