# Bug 007: Default elementIdPrefix is shared across checkbox instances

- Category: duplicate-id
- Evidence: `src/patterns/checkbox/useCheckboxPattern.ts:34`
- Impact: Multiple checkbox groups with the same keys emit duplicate checkbox ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
