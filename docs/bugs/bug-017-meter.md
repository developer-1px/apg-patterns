# Bug 017: Default elementIdPrefix is shared across meter instances

- Category: duplicate-id
- Evidence: `src/patterns/meter/useMeterPattern.ts:27`
- Impact: Two meter patterns with the same item key emit duplicate meter ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
