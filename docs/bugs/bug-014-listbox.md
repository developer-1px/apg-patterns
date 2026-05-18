# Bug 014: Default elementIdPrefix is shared across listbox instances

- Category: duplicate-id
- Evidence: `src/patterns/listbox/useListboxPattern.ts:18`
- Impact: Two listboxes with matching option keys emit duplicate option ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
