# Bug 013: Default elementIdPrefix is shared across link instances

- Category: duplicate-id
- Evidence: `src/patterns/link/useLinkPattern.ts:41`
- Impact: Multiple link pattern instances with the same key emit duplicate link ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
