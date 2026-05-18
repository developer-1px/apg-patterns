# Bug 095: Variant listbox casts root props instead of preserving types

- Category: app-demo
- Evidence: `demo/src/shared/demo-definition/VariantListbox.tsx:42`
- Impact: The cast can hide incompatible root props and makes regression tests the only guard.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
