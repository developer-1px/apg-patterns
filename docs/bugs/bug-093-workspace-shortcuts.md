# Bug 093: Preview keyboard shortcuts are exposed on a generic div

- Category: app-demo
- Evidence: `demo/src/app/ActiveDemoWorkspace.tsx:88`
- Impact: aria-keyshortcuts on a non-focusable preview container can be missed by assistive tech.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
