---
source_id: RitualDoc:ritual-closeout
target_id: RitualDoc:ritual-closeout
relation_type: task_completes
condition: status = "ready_for_testing" and has(closeout_evidence_verified)
attributes:
  sets:
    status: closed
  terminal: true
---

# Task completes

## Notes

The task is ready for closeout and its references verify durable evidence; it closes.
