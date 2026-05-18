# Bug 097: Source module lookup depends on path conventions

- Category: app-demo
- Evidence: `demo/src/shared/sources.ts:14`
- Impact: Moving source files without updating glob roots can make source tabs render empty text at runtime.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
