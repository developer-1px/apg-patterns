# Bug 064: Unknown hash pattern falls back silently without repairing the URL

- Category: routing-state
- Evidence: `demo/src/app/appState.ts:58`
- Impact: A bad pattern parameter renders the default pattern while the address bar still contains the invalid pattern, leaving share links misleading.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.
