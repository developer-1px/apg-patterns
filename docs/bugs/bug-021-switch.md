# Bug 021: Default elementIdPrefix is shared across switch instances

- Category: duplicate-id
- Evidence: `src/patterns/switch/useSwitchPattern.ts:34`
- Impact: Two switch pattern instances with the same key emit duplicate switch ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
