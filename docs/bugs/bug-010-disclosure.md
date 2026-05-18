# Bug 010: Default elementIdPrefix is shared across disclosure instances

- Category: duplicate-id
- Evidence: `src/patterns/disclosure/useDisclosurePattern.ts:32`
- Impact: Two disclosure groups with the same keys emit duplicate trigger and panel ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
