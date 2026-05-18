# Bug 100: Recorder omits search params from route snapshots

- Category: app-demo
- Evidence: `demo/src/app/repro-recorder/createReproRecorder.ts:82`
- Impact: Only pathname and hash are recorded, so query-string state is lost.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
