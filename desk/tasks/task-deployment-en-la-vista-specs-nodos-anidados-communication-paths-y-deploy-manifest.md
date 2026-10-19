---
id: task-deployment-en-la-vista-specs-nodos-anidados-communication-paths-y-deploy-manifest
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
current_node: ritual-execution
history: []
references: []
depends_on:
- task-activity-en-la-vista-specs-carriles-por-partición-notas-y-merge
pills: []
files: []
task_type: ''
inherits_from: []
inherit_acceptance_context: false
atoms: []
---

# Deployment en la vista Specs: nodos anidados, communication paths y deploy/manifest

## Rationale

_Explain why this task exists or the business driver behind it._

spec2viz §14: nodos anidados a cualquier profundidad, connects con label/protocol y deploy/manifest punteadas con estereotipo.

## Goal

_Describe the concrete result this task must produce._

Los nodos anidados se dibujan como contenedores dentro de contenedores, los paths con su rótulo y deploy/manifest punteadas con «deploy»/«manifest»; e2e.

## Scope

_State what is in scope and what is out of scope._

frontends/mindmap/views/specs/notation.

## Implementation Path

_Outline the expected implementation route or affected surface._



## Validation

_List the checks required before this task can close._

- e2e en Chromium con un deployment anidado VPC > subred > cluster > servicio

## Done When

_Name the observable condition that makes the task complete._

Los nodos anidados se dibujan como contenedores dentro de contenedores, los paths con su rótulo y deploy/manifest punteadas con «deploy»/«manifest»; e2e.
