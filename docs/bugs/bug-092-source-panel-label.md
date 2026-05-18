# Bug 092: Copy button accessible name changes to copied/failed

- Category: app-demo
- Evidence: `demo/src/app/ActiveDemoRightPanel.tsx:68`
- Impact: Changing the aria-label to state text removes the stable command name from assistive technology.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
