# Bug 090: Copy status reset timer can race repeated copy actions

- Category: app-demo
- Evidence: `demo/src/app/useSourcePreviewState.ts:44`
- Impact: A previous timer can reset the status shortly after a later copy unless every transition clears the old timer before scheduling.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
