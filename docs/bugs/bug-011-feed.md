# Bug 011: Default elementIdPrefix is shared across feed instances

- Category: duplicate-id
- Evidence: `src/patterns/feed/useFeedPattern.ts:25`
- Impact: Two feeds with the same article keys emit duplicate article ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
