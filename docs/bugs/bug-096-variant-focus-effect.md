# Bug 096: Variant listbox focuses selected option on every selectedKey change

- Category: app-demo
- Evidence: `demo/src/shared/demo-definition/VariantListbox.tsx:26`
- Impact: Programmatic route changes can unexpectedly steal focus from the active demo.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
