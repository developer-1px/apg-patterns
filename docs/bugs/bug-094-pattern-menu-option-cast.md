# Bug 094: Pattern menu casts option props instead of preserving types

- Category: app-demo
- Evidence: `demo/src/app/PatternMenu.tsx:28`
- Impact: The cast can hide missing ARIA props from the listbox adapter contract.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
