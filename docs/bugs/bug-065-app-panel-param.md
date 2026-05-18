# Bug 065: Unknown panel hash value is silently normalized in state only

- Category: routing-state
- Evidence: `demo/src/app/appState.ts:67`
- Impact: Invalid panel values fall back to preview internally without updating the hash, so reload/share behavior is inconsistent.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.
