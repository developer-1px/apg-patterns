# Bug 024: Default elementIdPrefix is shared across toolbar instances

- Category: duplicate-id
- Evidence: `src/patterns/toolbar/useToolbarPattern.ts:36`
- Impact: Two toolbars with the same item keys emit duplicate toolbar item ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
