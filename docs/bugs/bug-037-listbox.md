# Bug 037: listbox ids interpolate raw item keys

- Category: raw-key-id
- Evidence: `src/patterns/listbox/useListboxPattern.ts:18`
- Impact: Pattern data accepts string keys, but this id builder inserts the key directly. Keys containing spaces, punctuation, slashes, or repeated normalized forms can create brittle id references and broken CSS/test selectors.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Normalize and collision-check generated ids, or expose a central id encoder used by every pattern.
