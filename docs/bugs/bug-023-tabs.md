# Bug 023: Default elementIdPrefix is shared across tabs instances

- Category: duplicate-id
- Evidence: `src/patterns/tabs/useTabsPattern.ts:21`
- Impact: Two tablists with matching tab keys emit duplicate tab and tabpanel ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
