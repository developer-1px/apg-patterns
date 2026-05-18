# Bug 089: Clipboard success is inferred from navigator.clipboard existence

- Category: app-demo
- Evidence: `demo/src/app/sourcePreview.ts:62`
- Impact: If writeText resolves but clipboard becomes unavailable, or if a mocked writeText is missing, copy status can be wrong.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add instance scoping, stable accessible names, and explicit error/fallback handling.
