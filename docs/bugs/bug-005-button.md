# Bug 005: Default elementIdPrefix is shared across button instances

- Category: duplicate-id
- Evidence: `src/patterns/button/useButtonPattern.ts:35`
- Impact: Multiple button pattern instances with the same key produce duplicate button ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
