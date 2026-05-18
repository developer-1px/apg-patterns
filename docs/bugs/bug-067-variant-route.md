# Bug 067: Unknown variant hash value is not canonicalized

- Category: routing-state
- Evidence: `demo/src/shared/variantRoute.tsx:20`
- Impact: A bad variant parameter falls back in runtime state while the URL continues to advertise an unavailable variant.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Canonicalize invalid hash params and use pushState for user-initiated navigation where Back should work.
