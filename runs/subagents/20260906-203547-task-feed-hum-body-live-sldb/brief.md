Role: executor
Task: task-feed-hum-body-from-sldb-serve-remove-hardcoded-content
Rules:
- stay within task scope
- do not expand into other tasks
- persist evidence (stdout.log, stderr.log, result-summary.md, validation.log)
- run focused validation first
- hand off instead of self-retiring
- do NOT touch apps/review-workbench/vendor/flow-editor/flow-editor-plugin.js (pre-existing unrelated change)
