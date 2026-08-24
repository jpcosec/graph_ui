# Changelog

## 2026-05-01

- resolved task `003-create-real-graph-fixture`: 003-create-real-graph-fixture

- resolved task `002-define-minimal-editing-surface`: 002-define-minimal-editing-surface

- resolved task `001-define-graph-ui-data-contract`: 001-define-graph-ui-data-contract

- resolved task `006-prove-one-safe-edit-flow`: 006-prove-one-safe-edit-flow

- resolved task `005-surface-semantic-signals`: 005-surface-semantic-signals

- resolved task `004-wire-reusable-editor-to-real-fixture`: 004-wire-reusable-editor-to-real-fixture

# Changelog - graph_ui

All notable changes to the `graph_ui` module will be documented in this file.

## [Unreleased]

### Added
- Defined the minimal graph editing surface in `graph_ui/src/contracts/editing.py`.
  - Added `GraphEdit` base model with `EditMetadata` (author, timestamp, reason).
  - Implemented `NodeEdit` and `EdgeEdit` for CREATE, UPDATE, and DELETE operations.
- Created `ecosystem_slice.json` fixture in `graph_ui/desk/fixtures/`.
  - Represents the core ecosystem modules (repopackage, kgdb, ontology, graph_ui, sldb).
  - Complies with `GraphData` contract.
- Defined the canonical graph UI data contract in `graph_ui/src/contracts/graph_data.py`.
  - Added `UINode`, `UIEdge`, and `GraphData` Pydantic models.
  - Included support for 3D positioning, compliance signals, and rich metadata.
