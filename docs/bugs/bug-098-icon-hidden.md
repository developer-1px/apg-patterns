# Bug 098: Icon component always hides icons from assistive tech

- Category: app-demo
- Evidence: `demo/src/shared/Icon.tsx:29`
- Impact: Any icon-only button using this component without an external label becomes unnamed.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
