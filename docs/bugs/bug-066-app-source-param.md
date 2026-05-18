# Bug 066: Unknown source hash value survives after fallback

- Category: routing-state
- Evidence: `demo/src/app/appState.ts:70`
- Impact: The app picks a default source but leaves the invalid source query in the hash until another source action happens.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.
