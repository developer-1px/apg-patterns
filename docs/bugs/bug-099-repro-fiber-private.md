# Bug 099: Recorder depends on private React fiber keys

- Category: app-demo
- Evidence: `demo/src/app/repro-recorder/createReproRecorder.ts:62`
- Impact: React internal key names can change, breaking component labels in recordings.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
