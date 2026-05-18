# Bug 068: Hash updates use replaceState for user navigation

- Category: routing-state
- Evidence: `demo/src/app/appState.ts:83`
- Impact: Pattern, panel, and source changes overwrite history instead of adding entries, so browser Back cannot step through demo navigation.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.
