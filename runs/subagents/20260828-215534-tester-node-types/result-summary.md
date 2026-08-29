# Result Summary for Tester Run

## Run Information
- run_id: 20260828-215534
- session path: /home/jp/proyectos/hum-ecosystem/tools/graph_ui
- session_sha256: aa6494a3032fa201bd7c5981d8ad6c4dd750801b6a7b88d74a9add6cd0458e18

## Validation Steps
- Step 1 (Determinism): PASS
  - Two runs of hum:sync produced identical hash: 66c4874b5ccfeeb67059c9aaf23ac2a6cd3f59ba4b150e66dfbcedcb800de3b8
  - Git status after second run shows no unexpected churn (file is newly generated and untracked).

- Step 2 (Unit tests): PASS
  - npx vitest run src/schema/ passed: 3 test files, 7 tests total.

- Step 3 (Type check): PASS
  - npx tsc --noEmit exited with code 0.

- Step 4 (Faithfulness audit): PASS
  - All 12 fields match between the real step.py model and the generated model descriptor.
  - See validation.log for the detailed comparison table.

- Step 5 (No-mock audit): PASS
  - No mock/stub/fake/TODO/FIXME found in the specified files.
  - Test imports the REAL generated artifact (not an inlined literal).
  - allowedConnections is DERIVED (not a hardcoded unrelated literal).
  - No built-in node types were deleted; they are still present and registered.

- Step 6 (PLAYWRIGHT end-to-end proof): PASS
  - Regression smoke flow passed, indicating the app boots and renders without regression.
  - Flow exit code: 0.

## Final Verdict
All validation steps passed. The implementation satisfies the contract and guardrails.
