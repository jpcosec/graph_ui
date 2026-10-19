# Graph UI Desk Standards

Rules:

1. Keep tasks focused on real interface slices, not abstract UI ambition.
2. Every task names the SLDB data it reads or writes (models, `sldb.api.graph`, `sldb serve` routes).
3. Tests run against real stores and servers, never mocks (see the no-mocks pill).
4. Commit a task when it is created, so its body stays in git history.
