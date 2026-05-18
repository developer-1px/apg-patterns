# Bug 091: App startup assumes #root exists

- Category: app-demo
- Evidence: `demo/src/app/main.tsx:8`
- Impact: The non-null assertion turns a missing root element into an opaque React crash instead of a clear startup error.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
