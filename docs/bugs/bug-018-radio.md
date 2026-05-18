# Bug 018: Default elementIdPrefix is shared across radio group instances

- Category: duplicate-id
- Evidence: `src/patterns/radio/useRadioGroupPattern.ts:36`
- Impact: Two radio groups with the same option keys emit duplicate radio ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.
